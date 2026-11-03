"use client";
// WalletButton (muse — TX lane). Connect/disconnect for Phantom + Solflare
// via wallet-adapter. Placed in the header by the UI lane; muse owns it.
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

export default function WalletButton() {
  return (
    <WalletMultiButton
      style={{
        height: 36,
        lineHeight: "36px",
        fontSize: 13,
        borderRadius: 10,
        padding: "0 14px",
      }}
    />
  );
}
