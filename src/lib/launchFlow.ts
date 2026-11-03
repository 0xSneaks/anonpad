// Launch flow — SIMULATE ONLY (TX lane — muse, stage 3 of Claude's map).
//
// Runs the exact mogz sequence proven server-side in the P2 harness:
//   upload image → upload metadata → POST /api/tx/create (quote "XMR")
//   → wallet signs in-browser → POST /api/tx/cosign → RPC simulate.
//
// THERE IS NO BROADCAST PATH IN THIS FILE. Nothing here can send a
// transaction: after cosign, the fully-signed tx goes to
// simulateTransaction and the flow ends. Do not add a send call.
//
// All mogz API calls go through the /api/mogz proxy (operator session).
// Field shapes follow the shared contract in src/lib/types.ts. The fee
// mode maps to mogz rewardsMode (wallet → "creator", holders → "holder",
// split → "split"); in wallet mode the create payload also carries the
// fee wallet explicitly. The P2 decode showed the proven payload had no
// fee-wallet field, so the result lines report whether the fee wallet
// actually appears in the built transaction's accounts — an empirical
// check this flow runs every time.
import {
  Connection,
  VersionedTransaction,
  type PublicKey,
} from "@solana/web3.js";
import type { LaunchValues } from "./types";
import { FIRST_LAUNCH_FEE_WALLET } from "./constants";

const PROXY = "/api/mogz";
const RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.mainnet-beta.solana.com";

export interface SignerWallet {
  publicKey: PublicKey;
  signTransaction: <T extends VersionedTransaction>(tx: T) => Promise<T>;
}

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
  method: string,
  path: string,
  body?: unknown,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${PROXY}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`${method} ${path} → HTTP ${res.status}: ${text.slice(0, 160)}`);
  }
  if (!res.ok) {
    throw new Error(
      `${method} ${path} → HTTP ${res.status}: ${String(parsed.error ?? text.slice(0, 160))}`,
    );
  }
  return parsed;
}

const REWARDS_MODE = {
  wallet: "creator",
  holders: "holder",
  split: "split",
} as const;

export async function runLaunchSimulation(
  values: LaunchValues,
  wallet: SignerWallet,
  onLine: (line: string) => void,
): Promise<void> {
  const say = onLine;
  const feeWallet =
    values.feeMode === "wallet"
      ? (values.feeWallet ?? FIRST_LAUNCH_FEE_WALLET)
      : null;
  say("SIMULATE ONLY — this run cannot broadcast anything.");
  say(`Fee mode: ${values.feeMode} (mogz rewardsMode "${REWARDS_MODE[values.feeMode]}")`);
  if (feeWallet) say(`Creator-fee wallet: ${feeWallet}`);

  // 1. image upload
  if (!values.image) throw new Error("a coin image is required");
  const form = new FormData();
  form.append("file", values.image, values.image.name || "coin-image");
  form.append("kind", "coin");
  const upRes = await fetch(`${PROXY}/upload`, { method: "POST", body: form });
  const upText = await upRes.text();
  let up: Record<string, unknown>;
  try {
    up = JSON.parse(upText) as Record<string, unknown>;
  } catch {
    throw new Error(`POST /upload → HTTP ${upRes.status}: ${upText.slice(0, 160)}`);
  }
  if (!upRes.ok) {
    throw new Error(`POST /upload → HTTP ${upRes.status}: ${String(up.error ?? upText.slice(0, 160))}`);
  }
  const imageUrl =
    (up.url as string) ??
    (up.image as string) ??
    ((up.data as Record<string, unknown> | undefined)?.url as string);
  if (!imageUrl) throw new Error("upload returned no image URL");
  say(`1 · image uploaded: ${imageUrl}`);

  // 2. metadata
  const mdBody: Record<string, unknown> = {
    name: values.name,
    symbol: values.ticker,
    description: values.description,
    image: imageUrl,
  };
  if (values.x) mdBody.twitter = values.x;
  if (values.website) mdBody.website = values.website;
  if (values.telegram) mdBody.telegram = values.telegram;
  const md = await apiJson("POST", "/upload/metadata", mdBody);
  const uri =
    (md.uri as string) ?? (md.url as string) ?? (md.metadataUri as string);
  if (!uri) throw new Error("metadata upload returned no URI");
  say(`2 · metadata uploaded: ${uri}`);

  // 3. build the create tx against the XMR pair (mogz server builds it).
  const createBody: Record<string, unknown> = {
    wallet: wallet.publicKey.toBase58(),
    name: values.name,
    symbol: values.ticker,
    description: values.description,
    image: imageUrl,
    uri,
    quote: "XMR",
    rewardsMode: REWARDS_MODE[values.feeMode],
    firstBuyQuote: 0,
  };
  if (feeWallet) createBody.feeWallet = feeWallet;
  const created = await apiJson("POST", "/tx/create", createBody);
  const txB64 = (created.tx as string) ?? (created.transaction as string);
  if (!txB64) throw new Error("tx/create returned no transaction");
  say(`3 · create tx built by mogz${created.mint ? `, mint ${String(created.mint)}` : ""}`);

  const unsigned = VersionedTransaction.deserialize(b64ToBytes(txB64));
  const accounts = unsigned.message.staticAccountKeys.map((k) => k.toBase58());
  say(`    fee payer: ${accounts[0]}`);
  if (feeWallet) {
    say(
      `    fee wallet ${feeWallet} in tx accounts: ${
        accounts.includes(feeWallet)
          ? "YES"
          : "NO — the create payload's feeWallet was not honored; in creator mode fees accrue to the creating wallet"
      }`,
    );
  }

  // 4. the connected wallet signs — signing is not broadcasting.
  const signed = await wallet.signTransaction(unsigned);
  say("4 · signed by connected wallet");

  // 5. mogz cosign
  const co = await apiJson("POST", "/tx/cosign", {
    tx: bytesToB64(signed.serialize()),
    cosign: created.cosign ?? true,
  });
  const finalB64 = (co.tx as string) ?? bytesToB64(signed.serialize());
  say(`5 · mogz cosign ${co.tx ? "added" : "not added"}`);

  // 6. SIMULATE — the end of the line.
  const connection = new Connection(RPC, "confirmed");
  const finalTx = VersionedTransaction.deserialize(b64ToBytes(finalB64));
  const sim = await connection.simulateTransaction(finalTx, {
    sigVerify: true,
  });
  const v = sim.value;
  say(`6 · simulate: err=${JSON.stringify(v.err)} · units=${v.unitsConsumed ?? "?"}`);
  for (const line of (v.logs ?? []).slice(-8)) say(`    ${line}`);
  say(
    v.err == null
      ? "SIMULATE PASS — still nothing broadcast. A real launch needs Sneaks's explicit go."
      : "SIMULATE DID NOT PASS — see the error above. Nothing was broadcast.",
  );
}
