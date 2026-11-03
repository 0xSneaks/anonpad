import Link from "next/link";
import { CURVE_GRADUATION_XMR, CURVE_START_XMR } from "@/lib/constants";

export default function Home() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-line bg-panel p-5">
        <h1 className="text-2xl font-extrabold leading-tight">
          Launch coins quoted in <span className="text-accent">Monero</span>.
        </h1>
        <p className="mt-2 text-dim">
          AnonPad is a launchpad front end on mogz.fun rails. Every coin here is priced in wXMR —
          wrapped Monero on Solana — so Monero holders can launch and trade without leaving their coin.
        </p>
        <div className="mt-4 space-y-2 text-[15px]">
          <p><b className="text-accent">1.</b> Bridge XMR to wXMR at wxmr.io.</p>
          <p><b className="text-accent">2.</b> Launch a coin, or trade one, quoted in wXMR.</p>
          <p><b className="text-accent">3.</b> At {CURVE_GRADUATION_XMR} XMR market cap the coin graduates to a full Meteora pool with locked liquidity.</p>
        </div>
        <Link href="/launch" className="mt-5 block rounded-xl bg-accent px-4 py-3 text-center font-bold text-black">
          Launch a coin
        </Link>
      </section>

      <section className="rounded-2xl border border-accent-dim bg-[#17100a] p-5">
        <h2 className="font-bold text-[#ffb27a]">Be the first XMR coin</h2>
        <p className="mt-1 text-dim">
          No coin has launched on the wXMR pair yet. Curves start at {CURVE_START_XMR} XMR market cap.
          The first launch writes the first page of this market.
        </p>
        <Link href="/coins" className="mt-3 inline-block font-semibold text-accent">See coins →</Link>
      </section>
    </div>
  );
}
