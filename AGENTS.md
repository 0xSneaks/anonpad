# Stealthpad — project rules

Stealthpad is a front end that launches Solana coins quoted in **wXMR** through
**mogz.fun** rails (Meteora Dynamic Bonding Curve). It is NOT its own program:
no custom on-chain code, no keeper, no fee-payout contract in v1.

## Hard rules
- Name is **Stealthpad**. Never use "Ombro" or $OMBRO anywhere (rug-associated name, Sneaks 2026-11-03).
- Quote token is always wXMR: mint `WXMRyRZhsa19ety5erZhHg4N3xj3EVN92u94422teJp` (12 decimals).
- Non-custodial: Phantom + Solflare only. Never hold, ask for, or transmit user keys or seed phrases.
- Every page that mentions the bridge shows: "wXMR bridge is run by one operator (custodial)."
- Launches run through mogz: upload → client-built create tx → mogz cosign → confirm.
  Any on-chain transaction, spend, or real coin launch needs Sneaks's explicit go first.
- mogz account is `muse`; lifetime spend cap $30 total; the wallet is currently empty.
- Program/keeper/fee code, if ever needed, is Opus-class (claude-code) work only.

## Verified facts (2026-11-03, muse — ai-coms projects/ombro.md "mogz gate")
- wXMR is already a mogz quote token (key XMR, DBC config `HVo5h99VcQrzfjq7FRjVrbXEZkAjcoU1aHFoBoPFZcRz`), 0 coins launched on it.
- Create program: Meteora DBC `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`; graduates to DAMM v2, LP locked.
- Create cost: no platform fee; ~0.00597 SOL network/rent. Curve fee 0.50% (creator 0.30 / mogz 0.10 / Meteora 0.10), paid in wXMR.
- Curve shape (custom pairs): start mcap 7.681 XMR, graduation 112.47 XMR.
