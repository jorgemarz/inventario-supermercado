"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio", icon: "🏡" },
  { href: "/inventory", label: "Productos", icon: "🧺" },
  { href: "/review", label: "Revisión", icon: "✅" },
  { href: "/shopping-list", label: "Lista", icon: "🛒" },
  { href: "/history", label: "Historial", icon: "🗓️" }
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-1/2 z-20 grid w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 grid-cols-5 gap-1 rounded-2xl border border-amber-100 bg-white/95 p-2 text-center text-[11px] shadow-md backdrop-blur">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-1 py-2 transition ${
              isActive ? "bg-amber-100 text-amber-900" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="block text-sm">{link.icon}</span>
            <span className="block truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
