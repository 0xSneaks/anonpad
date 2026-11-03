"use client";
// Trade panel — stage 4 (TX lane — muse): buy/sell against the mogz
// trade API in simulate-only mode (src/lib/tradeFlow.ts), plus the
// Get wXMR links. No broadcast path exists behind this panel.
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { TradeSide } from "@/lib/types";
import { WXMR_MINT, BRIDGE_URL, BRIDGE_MIN_XMR } from "@/lib/constants";
import { getTokenBalance, runTradeSimulation } from "@/lib/tradeFlow";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const JUPITER_URL = `https://jup.ag/swap/${SOL_MINT}-${WXMR_MINT}`;

export function GetWxmr() {
  return (
    <section className="rounded-2xl border border-line bg-panel p-5">
      <h2 className="text-lg font-extrabold">Get wXMR</h2>
      <p className="mt-1 text-sm text-dim">
        AnonPad coins trade in wXMR — Monero wrapped on Solana by a single
        custodial bridge operator. Minimum bridge amount is {BRIDGE_MIN_XMR}{" "}
        XMR each way.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={BRIDGE_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-accent px-4 py-2.5 font-bold text-white"
        >
          Bridge XMR ↔ wXMR (wxmr.io)
        </a>
        <a
          href={JUPITER_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-line px-4 py-2.5 font-bold"
        >
          Swap SOL → wXMR (Jupiter)
        </a>
      </div>
    </section>
  );
}

export default function TradePanel({ mint }: { mint: string }) {
  const wallet = useWallet();
  const [side, setSide] = useState<TradeSide>("buy");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let live = true;
    if (wallet.publicKey) {
      getTokenBalance(wallet.publicKey, mint)
        .then((b) => live && setBalance(b))
        .catch(() => live && setBalance(null));
    } else {
      setBalance(null);
    }
    return () => {
      live = false;
    };
  }, [wallet.publicKey, mint, lines]);

  const amt = Number(amount);
  const valid = amt > 0 && wallet.connected;

  async function run() {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    setBusy(true);
    setLines([]);
    try {
      await runTradeSimulation(
        mint,
        side,
        amt,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction as never,
        },
        (line) => setLines((prev) => [...prev, line]),
      );
    } catch (e) {
      setLines((prev) => [
        ...prev,
        `STOPPED: ${e instanceof Error ? e.message : String(e)}`,
        "Nothing was broadcast.",
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-panel p-5">
      <h2 className="text-lg font-extrabold">Trade</h2>
      <p className="mt-1 text-sm text-dim">
        Simulate-only: builds the real mogz trade transaction, your wallet
        signs, the network simulates. Nothing broadcasts.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {(["buy", "sell"] as TradeSide[]).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={`rounded-xl px-4 py-2.5 font-bold ${
              side === s
                ? "bg-accent text-white"
                : "border border-line text-dim"
            }`}
          >
            {s === "buy" ? "Buy" : "Sell"}
          </button>
        ))}
      </div>

      <label className="mt-3 block text-sm font-semibold">
        {side === "buy" ? "Amount (XMR)" : "Amount (tokens)"}
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder={side === "buy" ? "0.1" : "1000"}
          className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-text"
        />
      </label>

      {side === "buy" ? (
        <div className="mt-2 flex gap-2">
          {[0.1, 0.5, 1].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(String(v))}
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-dim"
            >
              {v} XMR
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-2">
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((p) => (
              <button
                key={p}
                disabled={balance == null || balance <= 0}
                onClick={() =>
                  balance != null &&
                  setAmount(String(Math.floor(((balance * p) / 100) * 1e6) / 1e6))
                }
                className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-dim disabled:opacity-40"
              >
                {p}%
              </button>
            ))}
          </div>
          <p className="mt-1 text-[13px] text-dim">
            Your balance: {balance == null ? "—" : `${balance} tokens`}
          </p>
        </div>
      )}

      {!wallet.connected ? (
        <p className="mt-3 rounded-xl border border-line p-3 text-center text-sm text-dim">
          Connect your wallet (top right) to run a trade simulation.
        </p>
      ) : (
        <button
          disabled={!valid || busy}
          onClick={run}
          className="mt-3 w-full rounded-xl bg-accent px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-accent-dim disabled:text-[#ffb27a]"
        >
          {busy
            ? "Running…"
            : side === "buy"
              ? "Simulate buy"
              : "Simulate sell"}
        </button>
      )}

      {lines.length > 0 && (
        <div className="mt-3 rounded-xl bg-bg p-3.5">
          <p className="text-sm font-bold">Simulation result</p>
          <ul className="mt-1 space-y-1 font-mono text-xs leading-relaxed text-dim">
            {lines.map((l, i) => (
              <li key={i} className="break-all">
                {l}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
