import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "シンプルデザインシステム",
  description: "シンプルな行形式のリスト表示を持つデザインシステム",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b">
            <div className="container mx-auto py-4">
              <h1 className="text-xl font-bold">シンプルデザインシステム</h1>
            </div>
          </header>
          <div className="flex-1">{children}</div>
          <footer className="border-t py-4">
            <div className="container mx-auto text-center text-sm text-muted-foreground">
              © 2023 シンプルデザインシステム
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

