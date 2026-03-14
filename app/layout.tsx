import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Inventario semanal",
  description: "Planificación de supermercado para el hogar"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-5 md:py-8">
          <div className="mb-4 rounded-2xl border border-teal-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-wider text-teal-700">Plan semanal del hogar</p>
            <p className="text-sm text-slate-600">Inventario, consumo diario y compras inteligentes.</p>
          </div>
          {children}
          <Nav />
        </main>
      </body>
    </html>
  );
}
