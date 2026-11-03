import { RISK_BANNER } from "@/lib/constants";

export default function RiskBanner() {
  return (
    <div className="border-b border-accent-dim bg-[#1d1106] px-4 py-2 text-center text-[13px] text-[#ffb27a]">
      ⚠ {RISK_BANNER}
    </div>
  );
}
