import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navigation from "@/components/navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Canvas Concoctions",
  description: "Playground for various ideas using the canvas HTML element",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex flex-col w-full h-dvh items-center p-12 min-w-24 min-h-24 gap-4">
          <section className="flex flex-col self-center">
            <Navigation />
          </section>
          {children}
        </main>
      </body>
    </html>
  );
}
