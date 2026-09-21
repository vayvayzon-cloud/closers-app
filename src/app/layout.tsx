import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Closers App — Gestión de emprendedores",
  description: "MVP para administrar closers, pedidos, ads y liquidaciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body className={`${geistSans.variable} font-sans antialiased bg-[#0a0a0a] text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}
