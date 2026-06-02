import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Torneo SaaS - Gestión de Torneos Deportivos",
  description: "Plataforma multi-tenant para gestión de torneos deportivos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
