import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Despensa Weekly",
  description: "Checklist semanal simple para organizar tus compras del sábado."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <main className="mx-auto min-h-screen w-full max-w-lg px-4 pb-24 pt-6">
          {children}
          <Nav />
        </main>
      </body>
    </html>
  );
}
