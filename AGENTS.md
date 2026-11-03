<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AnonPad — project rules

AnonPad is a front end that launches Solana coins quoted in **wXMR** through
**mogz.fun** rails (Meteora Dynamic Bonding Curve). It is NOT its own program:
no custom on-chain code, no keeper, no fee-payout contract.

## Names
- Product name is **AnonPad**. Never "Ombro" (rug-associated), and never the
  name Sneaks rejected on 2026-11-03 because an existing $STEALTH token owns
  that space — do not reintroduce it anywhere, including split across markup.
- No AnonPad token exists or is planned unless Sneaks orders one; never the
  $ANON ticker (crowded). A dormant, tradeless mint named "AnonPad"
  (DoAhRQs5…ZuWhn) exists on Solana — we are not affiliated with it.

## Lanes (Claude's signed map, ai-coms handoffs/2026-11-03_1425_claude_anonpad-map.md)
| Lane | Owner | Files | Never touches |
|---|---|---|---|
| TX — mogz API, create/swap tx build, wallet sign, cosign, confirm, simulate | muse | `src/lib/mogz/**`, `src/lib/tx/**`, `src/lib/wallet/**`, `src/components/WalletProviders.tsx`, env config | — |
| UI — pages, components, copy, styles, read-only data views, SEO, mobile | deepseek | `src/app/**`, `src/components/**` (except WalletProviders), `public/**`, copy | TX lane, signing, keys, env secrets |

Muse is lead + merger. DeepSeek works on `ui/<thing>` branches and opens PRs;
muse reviews and merges. DeepSeek never writes signing/tx/fee/wallet code.

## Hard stops
- Any on-chain transaction, spend, or real coin launch needs Sneaks's explicit
  go first (stage 7 batch). Stages 3–5 are **simulate only — never broadcast**.
- Signing-path changes need the stage-6 independent review before any launch.
- Non-custodial: Phantom + Solflare only. Never hold, ask for, or transmit
  user keys or seed phrases. No server-side keys.
- mogz account is `muse`; lifetime spend cap $30 total.
- First launch's creator fees go to `B4rEgdbjNCQiQAV93Xrw3qicZ5pXMjBqXJRA7wyL9BUU`.
- Footer on every page: "Built on mogz.fun. Not affiliated with mogz."
  No mogz logo. Risk banner on every page: wXMR is bridged by a single
  custodial operator.

## Verified facts (2026-11-03, muse — ai-coms projects/anonpad.md)
- wXMR is already a mogz quote token (key XMR, DBC config `HVo5h99VcQrzfjq7FRjVrbXEZkAjcoU1aHFoBoPFZcRz`), 0 coins launched on it; the config account is not yet initialized on-chain.
- Quote token is always wXMR: mint `WXMRyRZhsa19ety5erZhHg4N3xj3EVN92u94422teJp` (12 decimals). Bridge via wxmr.io, 0.1 XMR min, single custodial operator (mint + freeze authority live on the bridge side).
- Create program: Meteora DBC `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`; graduates to DAMM v2, LP locked.
- Create cost: no platform fee; ~0.00597 SOL network/rent (paid in SOL even on XMR pairs). Curve fee 0.50% (creator 0.30 / mogz 0.10 / Meteora 0.10), paid in wXMR.
- Curve shape (custom pairs): start mcap 7.681 XMR, graduation 112.47 XMR.
- mogz has **no public referral/partner/front-end fee program** (checked 2026-11-03).
