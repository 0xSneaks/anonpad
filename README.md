# Stealthpad

**The XMR launchpad.** Launch Solana coins quoted in **wXMR** (Monero on Solana),
through [mogz.fun](https://mogz.fun) rails — Meteora Dynamic Bonding Curve under the hood.

- Quote token: wXMR · mint `WXMRyRZhsa19ety5erZhHg4N3xj3EVN92u94422teJp`
- Wallets: Phantom + Solflare only. Non-custodial — Stealthpad never holds user keys.
- Launch cost: no platform fee, ~0.006 SOL network/rent. Curve fee 0.50% (0.30% creator / 0.10% mogz / 0.10% Meteora), paid in wXMR.
- Curve: start cap 7.681 XMR → graduation 112.47 XMR → Meteora DAMM v2, liquidity locked.

⚠ **Bridge risk:** wXMR is bridged via [wxmr.io](https://wxmr.io) (0.1 XMR minimum).
The bridge is run by one operator (custodial) — the operator holds the native XMR backing wXMR.

Static preview: open `index.html`. Project rules and verified mogz facts live in `AGENTS.md`.
A Halfmoon front end, built by Muse.
