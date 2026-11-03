import { Suspense } from "react";
import Link from "next/link";
import { listWxmrCoins, xmrUsd } from "@/lib/mogz";
import { CURVE_GRADUATION_XMR, MOGZ_API } from "@/lib/constants";
import TradePanel, { GetWxmr } from "@/components/TradePanel";

function fmt(n: number | null | undefined, digits = 4): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

async function CoinDetail({ mint }: { mint: string }) {
  const [coins, xmrPrice] = await Promise.all([listWxmrCoins(), xmrUsd()]);
  const coin = coins.find((c) => c.address === mint);
  const pct = coin?.curvePct ?? (coin?.marketCapQuote ? Math.min(100, (coin.marketCapQuote / CURVE_GRADUATION_XMR) * 100) : null);

  return (
    <section className="rounded-2xl border border-line bg-panel p-5">
      <h1 className="text-xl font-extrabold">
        {coin ? <>{coin.name} <span className="text-accent">${coin.symbol}</span></> : "Coin"}
      </h1>
      <p className="mt-1 break-all font-mono text-xs text-dim">{mint}</p>
      {!coin && <p className="mt-2 text-dim">Not in the current wXMR list — showing the pair template. Live figures appear once the coin is indexed.</p>}
      <dl className="mt-4 space-y-2 text-[15px]">
        <div className="flex justify-between"><dt className="text-dim">Price</dt><dd>{fmt(coin?.price)} XMR</dd></div>
        <div className="flex justify-between"><dt className="text-dim">Market cap</dt>
          <dd>{fmt(coin?.marketCapQuote, 2)} XMR{xmrPrice && coin?.marketCapQuote ? ` · $${fmt(coin.marketCapQuote * xmrPrice, 0)}` : ""}</dd></div>
        <div className="flex justify-between"><dt className="text-dim">Holders</dt><dd>{fmt(coin?.holders, 0)}</dd></div>
        <div className="flex justify-between"><dt className="text-dim">Graduation target</dt><dd>{CURVE_GRADUATION_XMR} XMR</dd></div>
      </dl>
      <div className="mt-4">
        <div className="h-2.5 overflow-hidden rounded-full bg-[#262633]">
          <div className="h-full bg-accent" style={{ width: `${pct ?? 0}%` }} />
        </div>
        <p className="mt-1 text-[13px] text-dim">Curve progress: {pct === null ? "—" : `${pct.toFixed(1)}%`} to graduation</p>
      </div>
      <p className="mt-4 text-dim">Trading below runs simulate-only (stage 4) — reviewed before anything goes live.</p>
      <a href={`${MOGZ_API}/coin/${mint}`} target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold text-accent">
        View on mogz.fun →
      </a>
    </section>
  );
}

export const instant = false;

export default async function CoinPage({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = await params;
  return (
    <div className="space-y-4">
      <Suspense fallback={<p className="text-dim">Loading coin…</p>}>
        <CoinDetail mint={mint} />
      </Suspense>
      <TradePanel mint={mint} />
      <GetWxmr />
      <Link href="/coins" className="text-dim">← All coins</Link>
    </div>
  );
}
