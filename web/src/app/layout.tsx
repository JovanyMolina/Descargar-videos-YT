import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ChunkErrorHandler from "@/components/ChunkErrorHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YT Downloader - Descarga videos de YouTube",
  description:
    "Descarga videos y audio de YouTube en diferentes resoluciones y formatos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-youtube-dark text-white`}>
        <ChunkErrorHandler />
        <Navbar />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
