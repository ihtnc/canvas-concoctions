'use client'

import { useSearchParams } from "next/navigation"
import { Inter } from "next/font/google"
import Navigation from "@/components/navigation"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: JSX.Element;
}>) {
  const searchParams = useSearchParams()
  const isApp = searchParams.has("app")

  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex flex-col w-dvw h-dvh items-center p-12 min-w-96 min-h-96 gap-4">
          {isApp === false && (
            <section className="flex flex-col self-center">
              <Navigation baseUrl="/concoctions" />
            </section>
          )}
          {children}
        </main>
      </body>
    </html>
  )
}
