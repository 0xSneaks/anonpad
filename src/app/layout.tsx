import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import RiskBanner from "@/components/RiskBanner";
import Footer from "@/components/Footer";
import WalletProviders from "@/components/WalletProviders";

export const metadata: Metadata = {
  title: "AnonPad — the XMR launchpad",
  description:
    "Launch Solana coins quoted in wXMR (wrapped Monero) on mogz.fun rails. Non-custodial: your wallet signs, AnonPad never holds keys.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <WalletProviders>
          <Header />
          <RiskBanner />
          <main className="mx-auto w-full max-w-3xl px-4 py-5">{children}</main>
          <Footer />
        </WalletProviders>
      </body>
    </html>
  );
}
