import { BRIDGE_MIN_XMR, BRIDGE_URL, CURVE_GRADUATION_XMR, CREATE_COST_SOL, RISK_BANNER } from "@/lib/constants";

export default function HowItWorks() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-line bg-panel p-5">
        <h1 className="text-xl font-extrabold">How it works</h1>
        <h2 className="mt-4 font-bold">1 · Get wXMR</h2>
        <p className="mt-1 text-dim">
          wXMR is Monero wrapped on Solana by the bridge at{" "}
          <a className="text-accent" href={BRIDGE_URL} target="_blank" rel="noreferrer">wxmr.io</a>:
          send at least {BRIDGE_MIN_XMR} XMR, receive wXMR at your Solana address. {RISK_BANNER}
        </p>
        <h2 className="mt-4 font-bold">2 · You also need a little SOL</h2>
        <p className="mt-1 text-dim">
          Network fees and account setup are paid in SOL even on XMR pairs — about {CREATE_COST_SOL} SOL
          to launch, ~0.01 SOL covers launching and some trading.
        </p>
        <h2 className="mt-4 font-bold">3 · Launch and trade in XMR</h2>
        <p className="mt-1 text-dim">
          Coins trade on a bonding curve priced in wXMR. Trading fee is 0.50%: 0.30% to the coin&apos;s
          creator, 0.10% to mogz, 0.10% to Meteora.
        </p>
        <h2 className="mt-4 font-bold">4 · Graduation</h2>
        <p className="mt-1 text-dim">
          At {CURVE_GRADUATION_XMR} XMR market cap the coin graduates to a full Meteora DAMM v2 pool and
          the liquidity is locked.
        </p>
      </section>
    </div>
  );
}
