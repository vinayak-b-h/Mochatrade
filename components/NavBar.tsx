"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Overview" },
  { href: "/order-ticket", label: "Trader Order Ticket" },
  { href: "/regulator", label: "Regulator Dashboard" },
  { href: "/ops", label: "Ops Kill-Switch" },
  { href: "/orders", label: "Order Book" },
  { href: "/architecture", label: "Architecture" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [resetting, setResetting] = useState(false);

  const resetDemo = async () => {
    setResetting(true);
    try {
      await fetch("/api/reset", { method: "POST" });
      router.refresh();
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-mocha flex items-center justify-center text-ink text-xs font-bold">
            M
          </div>
          <span className="font-semibold tracking-tight">MochaTrade</span>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link" data-active={pathname === l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={resetDemo}
          disabled={resetting}
          title="Restore all markets, caps, and orders to their starting demo state"
          className="shrink-0 text-xs font-medium rounded-full px-3 py-1.5 border border-line text-[#7E8CA6] hover:border-mocha/50 hover:text-mocha transition-colors disabled:opacity-50"
        >
          {resetting ? "Resetting…" : "Reset Demo"}
        </button>
      </div>
    </header>
  );
}
