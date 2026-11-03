import { Suspense } from "react";
import Link from "next/link";
import { listWxmrCoins, xmrUsd } from "@/lib/mogz";
import { CURVE_GRADUATION_XMR } from "@/lib/constants";

function fmt(n: number | null | undefined, digits = 4): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

async function CoinList() {
  const [coins, xmrPrice] = await Promise.all([listWxmrCoins(), xmrUsd()]);
  if (coins.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-panel p-5">
        <h2 className="font-bold">No wXMR coins yet — be the first.</h2>
        <p className="mt-1 text-dim">
          The wXMR pair is live on mogz and empty. The first coin launched here opens the market.
        </p>
        <Link href="/launch" className="mt-3 inline-block font-semibold text-accent">Launch the first coin →</Link>
      </div>
    );
  }
  return (
    <>
      {coins.map((c) => (
        <Link key={c.address} href={`/coin/${c.address}`} className="block rounded-2xl border border-line bg-panel p-4">
          <div className="flex items-baseline justify-between">
            <b>{c.name} <span className="text-accent">${c.symbol}</span></b>
            <span className="text-dim">{fmt(c.price)} XMR</span>
          </div>
          <div className="mt-1 text-sm text-dim">
            MCap {fmt(c.marketCapQuote, 2)} XMR
            {xmrPrice && c.marketCapQuote ? ` · $${fmt(c.marketCapQuote * xmrPrice, 0)}` : ""}
            {` · graduation ${CURVE_GRADUATION_XMR} XMR`}
          </div>
        </Link>
      ))}
    </>
  );
}

export default function CoinsPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-extrabold">Coins quoted in wXMR</h1>
      <Suspense fallback={<p className="text-dim">Loading coins…</p>}>
        <CoinList />
      </Suspense>
    </div>
  );
}
