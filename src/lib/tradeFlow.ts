// Trade flow — SIMULATE ONLY (TX lane — muse, stage 4 of Claude's map).
//
// Uses mogz's trade API, discovered + schema-verified 2026-11-03:
//   POST /api/tx/buy   { mint, wallet, amountQuote }   (number, human units)
//   POST /api/tx/sell  { mint, wallet, amountTokens }  (number, human units)
//   → wallet signs in-browser → POST /api/tx/cosign (when offered)
//   → RPC simulate. THERE IS NO BROADCAST PATH IN THIS FILE.
//
// Server-side proof run (p2/simulate_trade.py, 2026-11-03): both
// endpoints are live and validate balances server-side — with the
// operator wallet empty they answer "Not enough SOL" / "Not enough
// tokens" before building any transaction. Amount units are human
// (decimal) units per those responses — INFERENCE, to be re-confirmed
// by the first funded simulate that returns a built tx to decode.
import {
  Connection,
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";
import type { TradeSide } from "./types";
import type { SignerWallet } from "./launchFlow";

const PROXY = "/api/mogz";
const RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.mainnet-beta.solana.com";

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64(bytes: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

async function apiJson(
  path: string,
  body: unknown,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${PROXY}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`POST ${path} → HTTP ${res.status}: ${text.slice(0, 160)}`);
  }
  if (!res.ok || parsed.error) {
    throw new Error(`POST ${path} → ${String(parsed.error ?? `HTTP ${res.status}`)}`);
  }
  return parsed;
}

/** Human-unit token balance of `mint` for `owner` (0 when no account). */
export async function getTokenBalance(
  owner: PublicKey,
  mint: string,
): Promise<number> {
  const connection = new Connection(RPC, "confirmed");
  const res = await connection.getParsedTokenAccountsByOwner(owner, {
    mint: new PublicKey(mint),
  });
  let total = 0;
  for (const { account } of res.value) {
    const amt = account.data.parsed?.info?.tokenAmount?.uiAmount;
    if (typeof amt === "number") total += amt;
  }
  return total;
}

export async function runTradeSimulation(
  mint: string,
  side: TradeSide,
  amount: number,
  wallet: SignerWallet,
  onLine: (line: string) => void,
): Promise<void> {
  const say = onLine;
  if (!(amount > 0)) throw new Error("amount must be greater than zero");
  say("SIMULATE ONLY — this run cannot broadcast anything.");
  say(
    side === "buy"
      ? `Buy: ${amount} XMR (quote) → coin ${mint}`
      : `Sell: ${amount} tokens of ${mint} → XMR (quote)`,
  );

  const body =
    side === "buy"
      ? { mint, wallet: wallet.publicKey.toBase58(), amountQuote: amount }
      : { mint, wallet: wallet.publicKey.toBase58(), amountTokens: amount };
  const built = await apiJson(`/tx/${side}`, body);
  const txB64 = (built.tx as string) ?? (built.transaction as string);
  if (!txB64) throw new Error(`tx/${side} returned no transaction`);
  say(`1 · ${side} tx built by mogz`);

  const unsigned = VersionedTransaction.deserialize(b64ToBytes(txB64));
  const signed = await wallet.signTransaction(unsigned);
  say("2 · signed by connected wallet");

  let finalB64 = bytesToB64(signed.serialize());
  if (built.cosign != null) {
    const co = await apiJson("/tx/cosign", {
      tx: finalB64,
      cosign: built.cosign ?? true,
    });
    if (co.tx) finalB64 = co.tx as string;
    say(`3 · mogz cosign ${co.tx ? "added" : "not added"}`);
  }

  const connection = new Connection(RPC, "confirmed");
  const finalTx = VersionedTransaction.deserialize(b64ToBytes(finalB64));
  const sim = await connection.simulateTransaction(finalTx, {
    sigVerify: true,
  });
  const v = sim.value;
  say(`4 · simulate: err=${JSON.stringify(v.err)} · units=${v.unitsConsumed ?? "?"}`);
  for (const line of (v.logs ?? []).slice(-8)) say(`    ${line}`);
  say(
    v.err == null
      ? "SIMULATE PASS — still nothing broadcast. Live trading needs the stage-6 review + Sneaks's go."
      : "SIMULATE DID NOT PASS — see the error above. Nothing was broadcast.",
  );
}
