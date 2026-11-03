// AnonPad shared data contract — exact shapes from Claude's DeepSeek UI brief
// (ai-coms handoffs/2026-11-03_1450_claude_anonpad-deepseek-brief.md).
// Muse owns this file (src/lib/**). Do not change the types without muse.

export type Coin = {
  mint: string; name: string; ticker: string; image: string; description?: string;
  creator: string; createdAt: string;            // ISO
  priceXmr: number; mcapXmr: number; mcapUsd: number;
  curveProgress: number;                         // 0..1 toward 112.47 XMR
  graduated: boolean; holders: number; volume24hXmr: number;
  mogzUrl: string; socials?: { x?: string; telegram?: string; website?: string };
};

export type LaunchValues = {
  name: string; ticker: string; image: File | null; description: string;
  x?: string; telegram?: string; website?: string;
  feeMode: 'wallet' | 'holders' | 'split'; feeWallet?: string;
};

export type TradeSide = 'buy' | 'sell';
