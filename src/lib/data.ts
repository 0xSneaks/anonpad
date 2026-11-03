// AnonPad data functions (muse lane) — the only data source UI code calls.
// Contract per Claude's DeepSeek UI brief: getXmrCoins() / getCoin(mint).
// Backed by the read-only mogz API mapping in ./mogz. Fields the API does not
// provide stay 0 (never invented); as of 2026-11-03 zero wXMR-quoted coins
// exist on mogz, so the truthful result is an empty list / null.
import type { Coin } from "./types";
import { listWxmrCoins, xmrUsd, type PadCoin } from "./mogz";
import { CURVE_GRADUATION_XMR } from "./constants";

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function toCoin(p: PadCoin, usd: number | null): Coin {
  const r = p.raw;
  const mcapXmr = p.marketCapQuote ?? 0;
  const progress =
    p.curvePct != null
      ? Math.min(1, Math.max(0, p.curvePct / 100))
      : Math.min(1, Math.max(0, mcapXmr / CURVE_GRADUATION_XMR));
  const socials = {
    x: str(r.twitter) ?? str(r.x),
    telegram: str(r.telegram),
    website: str(r.website),
  };
  return {
    mint: p.address,
    name: p.name,
    ticker: p.symbol,
    image: p.image ?? "",
    description: str(r.description),
    creator: String(r.creator ?? r.creatorAddress ?? r.dev ?? ""),
    createdAt: str(r.createdAt) ?? str(r.created_at) ?? "",
    priceXmr: p.price ?? 0,
    mcapXmr,
    mcapUsd: usd != null ? mcapXmr * usd : 0,
    curveProgress: progress,
    graduated: r.graduated === true || progress >= 1,
    holders: p.holders ?? 0,
    volume24hXmr: p.volume24h ?? 0,
    mogzUrl: p.mogzUrl,
    socials:
      socials.x || socials.telegram || socials.website ? socials : undefined,
  };
}

export async function getXmrCoins(): Promise<Coin[]> {
  const [pads, usd] = await Promise.all([listWxmrCoins(), xmrUsd()]);
  return pads.map((p) => toCoin(p, usd));
}

export async function getCoin(mint: string): Promise<Coin | null> {
  const coins = await getXmrCoins();
  return coins.find((c) => c.mint === mint) ?? null;
}
