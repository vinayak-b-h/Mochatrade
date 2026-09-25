"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview" },
  { href: "/order-ticket", label: "Trader Order Ticket" },
  { href: "/regulator", label: "Regulator Dashboard" },
  { href: "/ops", label: "Ops Kill-Switch" },
  { href: "/architecture", label: "Architecture" },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <header className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-mocha flex items-center justify-center text-white text-xs font-bold">
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
      </div>
    </header>
  );
}
