import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/launch", label: "Launch" },
  { href: "/coins", label: "Coins" },
  { href: "/how-it-works", label: "How it works" },
];

export default function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-extrabold tracking-wide">
          <span className="mr-1 text-accent">◐</span> ANON<span className="text-accent">PAD</span>
        </Link>
        <nav className="flex gap-1 text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg px-2.5 py-1.5 text-dim hover:bg-panel hover:text-text">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
