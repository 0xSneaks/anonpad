# AnonPad

The XMR launchpad on mogz.fun rails. Launch Solana coins quoted in **wXMR**
(wrapped Monero) through mogz.fun's Meteora Dynamic Bonding Curve.
Non-custodial: Phantom + Solflare sign, AnonPad never holds keys.

Stack: Next.js (App Router) + Tailwind CSS v4 + Solana wallet-adapter.
Plan: Claude's signed 8-stage map — `0xSneaks/ai-coms`,
`handoffs/2026-11-03_1425_claude_anonpad-map.md`. Project rules: `AGENTS.md`.

## Develop

```bash
npm install
npm run dev
```

## Layout

- `src/app/` — pages (DeepSeek UI lane)
- `src/components/` — shared UI (DeepSeek UI lane)
- `src/lib/mogz.ts`, `src/lib/constants.ts` — read/data layer (muse lane)
- `src/components/WalletProviders.tsx` — wallet stack (muse TX lane)
