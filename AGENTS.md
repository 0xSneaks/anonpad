# AnonPad — project rules

AnonPad is a front end that launches Solana coins quoted in **wXMR** through
**mogz.fun** rails (Meteora Dynamic Bonding Curve). It is NOT its own program:
no custom on-chain code, no keeper, no fee-payout contract.

## Names
- Product name is **AnonPad**. Never "Ombro" (rug-associated) and never
  "Stealthpad" (an existing $STEALTH token owns that space) anywhere.
- No AnonPad token exists or is planned unless Sneaks orders one; never the
  $ANON ticker (crowded). A dormant, tradeless mint named "AnonPad"
  (DoAhRQs5…ZuWhn) exists on Solana — we are not affiliated with it.

## Lanes (from the game plan, ai-coms handoffs/2026-11-03_1415_claude_anonpad-plan.md)
| Lane | Owner | Files | Never touches |
|---|---|---|---|
| TX — mogz API, create tx build, wallet sign, cosign, confirm, simulate | muse | `src/lib/mogz/**`, `src/lib/tx/**`, `src/lib/wallet/**`, env config | — |
| UI — pages, components, copy, styles, read-only data views, SEO, mobile | deepseek | `src/app/**`, `src/components/**`, `src/styles/**`, `public/**`, copy | TX lane, signing, keys, env secrets |

Muse is lead + merger. DeepSeek works on `ui/<thing>` branches and opens PRs;
muse reviews and merges. DeepSeek never writes signing/tx/fee/wallet code.

## Hard stops
- Any on-chain transaction, spend, or real coin launch needs Sneaks's explicit
  go first (P4 batch). P2 work is **simulate only — never broadcast**.
- TX lane changes need a claude-code adversarial review (P3) before any launch.
- Non-custodial: Phantom + Solflare only. Never hold, ask for, or transmit
  user keys or seed phrases. No server-side keys.
- mogz account is `muse`; lifetime spend cap $30 total.
- Footer on every page: "Built on mogz.fun. Not affiliated with mogz."
  No mogz logo. Risk banner on every page: wXMR is bridged by a single
  custodial operator.

## Verified facts (2026-11-03, muse — ai-coms projects/ombro.md "mogz gate", projects/anonpad.md "P0 results")
- wXMR is already a mogz quote token (key XMR, DBC config `HVo5h99VcQrzfjq7FRjVrbXEZkAjcoU1aHFoBoPFZcRz`), 0 coins launched on it; the config account is not yet initialized on-chain.
- Quote token is always wXMR: mint `WXMRyRZhsa19ety5erZhHg4N3xj3EVN92u94422teJp` (12 decimals). Bridge via wxmr.io, 0.1 XMR min, single custodial operator (mint + freeze authority live on the bridge side).
- Create program: Meteora DBC `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`; graduates to DAMM v2, LP locked.
- Create cost: no platform fee; ~0.00597 SOL network/rent (paid in SOL even on XMR pairs). Curve fee 0.50% (creator 0.30 / mogz 0.10 / Meteora 0.10), paid in wXMR.
- Curve shape (custom pairs): start mcap 7.681 XMR, graduation 112.47 XMR.
- mogz has **no public referral/partner/front-end fee program** (checked 2026-11-03).
