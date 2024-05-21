'use client'

import { Inter } from "next/font/google"
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
        <Suspense>
          {children}
        </Suspense>
      </body>
    </html>
  )
}
