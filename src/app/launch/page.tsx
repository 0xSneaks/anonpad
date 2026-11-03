"use client";
// Launch form — stage 3 (muse TX lane): wired to the simulate-only flow
// in src/lib/launchFlow.ts behind a confirm step. The flow has no
// broadcast path; a real launch stays gated on Sneaks's explicit go.
// Field shapes follow the shared contract in src/lib/types.ts.
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  CREATE_COST_SOL,
  FIRST_LAUNCH_FEE_WALLET,
  WXMR_MINT,
} from "@/lib/constants";
import type { LaunchValues } from "@/lib/types";
import { runLaunchSimulation } from "@/lib/launchFlow";

const inputCls =
  "mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-text";

export default function LaunchPage() {
  const wallet = useWallet();
  const [values, setValues] = useState<LaunchValues>({
    name: "",
    ticker: "",
    image: null,
    description: "",
    x: "",
    website: "",
    telegram: "",
    feeMode: "wallet",
    feeWallet: FIRST_LAUNCH_FEE_WALLET,
  });
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const set =
    (k: "name" | "ticker" | "description" | "x" | "website" | "telegram" | "feeWallet") =>
    (e: { target: { value: string } }) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));

  const valid =
    values.name.trim().length >= 2 &&
    values.ticker.trim().length >= 2 &&
    values.image != null;

  async function run() {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    setConfirming(false);
    setBusy(true);
    setLines([]);
    try {
      await runLaunchSimulation(
        values,
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
      <h1 className="text-xl font-extrabold">Launch a coin</h1>
      <p className="mt-1 text-dim">
        Every AnonPad coin is quoted in wXMR. Your wallet signs the create
        transaction — AnonPad never holds keys. The flow currently runs in
        simulate-only mode: it builds, signs, cosigns and simulates, and
        cannot broadcast.
      </p>

      <label className="mt-4 block text-sm font-semibold">
        Coin image
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setValues((v) => ({ ...v, image: e.target.files?.[0] ?? null }))
          }
          className="mt-1 block w-full text-sm text-dim"
        />
      </label>
      <label className="mt-3 block text-sm font-semibold">
        Name
        <input
          value={values.name}
          onChange={set("name")}
          placeholder="e.g. Private Panda"
          maxLength={32}
          className={inputCls}
        />
      </label>
      <label className="mt-3 block text-sm font-semibold">
        Ticker
        <input
          value={values.ticker}
          onChange={(e) =>
            setValues((v) => ({ ...v, ticker: e.target.value.toUpperCase() }))
          }
          placeholder="e.g. PANDA"
          maxLength={10}
          className={inputCls}
        />
      </label>
      <label className="mt-3 block text-sm font-semibold">
        Description
        <textarea
          value={values.description}
          onChange={set("description")}
          rows={3}
          placeholder="What is this coin about?"
          maxLength={500}
          className={inputCls}
        />
      </label>
      <label className="mt-3 block text-sm font-semibold">
        Twitter / X (optional)
        <input
          value={values.x}
          onChange={set("x")}
          placeholder="https://x.com/…"
          className={inputCls}
        />
      </label>
      <label className="mt-3 block text-sm font-semibold">
        Website (optional)
        <input
          value={values.website}
          onChange={set("website")}
          placeholder="https://…"
          className={inputCls}
        />
      </label>
      <label className="mt-3 block text-sm font-semibold">
        Telegram (optional)
        <input
          value={values.telegram}
          onChange={set("telegram")}
          placeholder="https://t.me/…"
          className={inputCls}
        />
      </label>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold">
          Creator fee (0.30% of every trade) goes to
        </legend>
        <div className="mt-2 space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="feeMode"
              checked={values.feeMode === "wallet"}
              onChange={() => setValues((v) => ({ ...v, feeMode: "wallet" }))}
            />
            A wallet
          </label>
          {values.feeMode === "wallet" && (
            <input
              value={values.feeWallet ?? ""}
              onChange={set("feeWallet")}
              className={inputCls}
              aria-label="Fee wallet"
            />
          )}
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="feeMode"
              checked={values.feeMode === "holders"}
              onChange={() => setValues((v) => ({ ...v, feeMode: "holders" }))}
            />
            Holders (rewards)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="feeMode"
              checked={values.feeMode === "split"}
              onChange={() => setValues((v) => ({ ...v, feeMode: "split" }))}
            />
            Split
          </label>
        </div>
      </fieldset>

      <div className="mt-4 rounded-xl bg-bg p-3.5 text-sm leading-relaxed">
        <div className="flex justify-between">
          <span className="text-dim">Quoted in</span>
          <b>wXMR (Monero)</b>
        </div>
        <div className="flex justify-between">
          <span className="text-dim">Network + account setup</span>
          <b>~{CREATE_COST_SOL} SOL</b>
        </div>
        <div className="flex justify-between">
          <span className="text-dim">Platform launch fee</span>
          <b>None</b>
        </div>
        <div className="flex justify-between">
          <span className="text-dim">Trading fee 0.50%</span>
          <b>0.30 creator / 0.10 mogz / 0.10 Meteora</b>
        </div>
        <p className="mt-2 break-all font-mono text-xs text-dim">
          wXMR mint: {WXMR_MINT}
        </p>
      </div>

      {!wallet.connected ? (
        <p className="mt-4 rounded-xl border border-line p-3 text-center text-sm text-dim">
          Connect your wallet (top right) to run the launch simulation.
        </p>
      ) : confirming ? (
        <div className="mt-4 rounded-xl border border-accent-dim p-4">
          <p className="font-bold">Confirm — simulation only</p>
          <p className="mt-1 text-sm text-dim">
            This builds the real create transaction for {values.name} ($
            {values.ticker}), your wallet signs it, mogz cosigns, and the
            network simulates it.{" "}
            <b>Nothing broadcasts and nothing is spent.</b>
          </p>
          {values.feeMode === "wallet" && (
            <p className="mt-2 break-all font-mono text-xs text-dim">
              Creator-fee wallet: {values.feeWallet}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={run}
              className="flex-1 rounded-xl bg-accent px-4 py-3 font-bold text-white"
            >
              Run simulation
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-xl border border-line px-4 py-3 font-bold"
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <button
          disabled={!valid || busy}
          onClick={() => setConfirming(true)}
          className="mt-4 w-full rounded-xl bg-accent px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-accent-dim disabled:text-[#ffb27a]"
        >
          {busy ? "Running…" : "Simulate launch"}
        </button>
      )}

      {lines.length > 0 && (
        <div className="mt-4 rounded-xl bg-bg p-3.5">
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
