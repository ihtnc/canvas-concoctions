'use client'

import { Inter } from "next/font/google"
import Navigation from "@/components/navigation"
import "./globals.css"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: JSX.Element;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex flex-col w-dvw h-dvh items-center p-12 min-w-96 min-h-96 gap-4">
          <Suspense>
            <Navigation baseUrl="/concoctions" />
            {children}
          </Suspense>
        </main>
      </body>
    </html>
  )
}
