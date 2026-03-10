import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupVelo",
  description: "SupVelo - Seu sistema de suporte com I.A veloz e inteligente",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
