import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "MochaTrade — Prototype",
  description: "Compliance-first fintech infrastructure for emerging-market retail investors.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-xs text-[#5C6B7A]">
          MochaTrade prototype — built for the Marketsphere Hackathon (Finovators, ACM RVCE).
        </footer>
      </body>
    </html>
  );
}
