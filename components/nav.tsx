"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/inventory", label: "Inventario", icon: "📦" },
  { href: "/consumption", label: "Consumo", icon: "➖" },
  { href: "/shopping-list", label: "Compras", icon: "🛒" },
  { href: "/history", label: "Historial", icon: "🗂️" }
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-3 z-20 mt-8 grid grid-cols-5 gap-1 rounded-2xl border border-slate-200 bg-white/95 p-2 text-center text-[11px] shadow-lg backdrop-blur md:text-sm">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-2 py-2 transition ${
              isActive
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
