"use client";
// Launch form — stage 2 state: present, CTA disabled. Stage 3 (muse TX lane)
// wires upload → build → cosign → simulate behind a confirm screen.
import { useState } from "react";
import { CREATE_COST_SOL, WXMR_MINT } from "@/lib/constants";

export default function LaunchPage() {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  return (
    <section className="rounded-2xl border border-line bg-panel p-5">
      <h1 className="text-xl font-extrabold">Launch a coin</h1>
      <p className="mt-1 text-dim">Every AnonPad coin is quoted in wXMR. Your wallet signs the create transaction — AnonPad never holds keys.</p>

      <label className="mt-4 block text-sm font-semibold">Coin image
        <input type="file" accept="image/*" disabled className="mt-1 block w-full text-sm text-dim" />
      </label>
      <label className="mt-3 block text-sm font-semibold">Name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Private Panda" maxLength={32}
          className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-text" />
      </label>
      <label className="mt-3 block text-sm font-semibold">Ticker
        <input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} placeholder="e.g. PANDA" maxLength={10}
          className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-text" />
      </label>
      <label className="mt-3 block text-sm font-semibold">Description
        <textarea rows={3} placeholder="What is this coin about?" maxLength={500}
          className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-text" />
      </label>
      <label className="mt-3 block text-sm font-semibold">Twitter / X (optional)
        <input placeholder="https://x.com/…" className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-text" />
      </label>
      <label className="mt-3 block text-sm font-semibold">Website (optional)
        <input placeholder="https://…" className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-text" />
      </label>

      <div className="mt-4 rounded-xl bg-bg p-3.5 text-sm leading-relaxed">
        <div className="flex justify-between"><span className="text-dim">Quoted in</span><b>wXMR (Monero)</b></div>
        <div className="flex justify-between"><span className="text-dim">Network + account setup</span><b>~{CREATE_COST_SOL} SOL</b></div>
        <div className="flex justify-between"><span className="text-dim">Platform launch fee</span><b>None</b></div>
        <div className="flex justify-between"><span className="text-dim">Trading fee 0.50%</span><b>0.30 creator / 0.10 mogz / 0.10 Meteora</b></div>
        <p className="mt-2 break-all font-mono text-xs text-dim">wXMR mint: {WXMR_MINT}</p>
      </div>

      <button disabled className="mt-4 w-full cursor-not-allowed rounded-xl bg-accent-dim px-4 py-3 font-bold text-[#ffb27a] opacity-80">
        Launching opens in the next release
      </button>
      <p className="mt-2 text-center text-[13px] text-dim">The wallet flow is in testing — simulated end-to-end, nothing broadcasts yet.</p>
    </section>
  );
}
