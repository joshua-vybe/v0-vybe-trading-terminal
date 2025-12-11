import type React from "react"
import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/contexts/theme-context"
import { ConfluenceProvider } from "@/contexts/confluence-context"
import "./globals.css"

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "VYBE TERMINAL v3.0 | Retro-Futuristic Trading",
  description: "The ultimate CRT ASCII trading terminal for multi-venue perpetual futures trading",
  keywords: ["trading", "terminal", "crypto", "perpetuals", "hyperliquid", "defi"],
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#00ffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark theme-dark-crt">
      <body className={`${ibmPlexMono.className} antialiased bg-background text-foreground overflow-hidden`}>
        <ThemeProvider>
          <ConfluenceProvider>{children}</ConfluenceProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
