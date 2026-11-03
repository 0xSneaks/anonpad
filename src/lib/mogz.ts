// TX-adjacent read layer (muse lane). Read-only mogz API access.
// No signing, no writes — safe for any page.
import { MOGZ_API, WXMR_MINT } from "./constants";

export interface PadCoin {
  address: string;
  name: string;
  symbol: string;
  image?: string;
  price?: number | null;
  marketCapQuote?: number | null; // in wXMR
  holders?: number | null;
  volume24h?: number | null;
  curvePct?: number | null; // 0..100 toward graduation
  mogzUrl: string;
  raw: Record<string, unknown>;
}

function num(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

// Maps one mogz /api/coins item to PadCoin. Field names follow the live API
// as observed 2026-11-03; unknown fields stay null (shown as "—"), never invented.
export function mapCoin(c: Record<string, unknown>): PadCoin {
  const address = String(c.address ?? c.mint ?? "");
  return {
    address,
    name: String(c.name ?? ""),
    symbol: String(c.symbol ?? ""),
    image: (c.image as string) ?? undefined,
    price: num(c.price),
    marketCapQuote: num(c.marketCap ?? c.market_cap),
    holders: num(c.holders),
    volume24h: num(c.volume24h ?? c.volume_24h),
    curvePct: num(c.bondingCurvePct ?? c.curvePct),
    mogzUrl: `${MOGZ_API}/coin/${address}`,
    raw: c,
  };
}

// Lists coins quoted in wXMR. The mogz list API is newest-first across all
// pairs, so we page through it and filter by quote mint.
export async function listWxmrCoins(maxPages = 6): Promise<PadCoin[]> {
  const out: PadCoin[] = [];
  for (let page = 0; page < maxPages; page++) {
    const res = await fetch(`${MOGZ_API}/api/coins?limit=50&page=${page}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) break;
    const items = (await res.json()) as Record<string, unknown>[];
    if (!Array.isArray(items) || items.length === 0) break;
    for (const c of items) {
      if (c.quoteAddress === WXMR_MINT || c.quoteSymbol === "XMR") out.push(mapCoin(c));
    }
    if (items.length < 50) break;
  }
  return out;
}

// XMR/USD reference price for the USD column. CoinGecko public API; on any
// failure returns null and the UI shows "—" rather than a stale number.
export async function xmrUsd(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=usd",
      { headers: { accept: "application/json" }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const j = (await res.json()) as { monero?: { usd?: number } };
    return j?.monero?.usd ?? null;
  } catch {
    return null;
  }
}
