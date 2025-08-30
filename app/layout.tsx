import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/components/auth-provider"
import { Web3Provider } from "@/providers/web3-provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Project Sensei - AI-Powered Knowledge Sharing",
  description: "Bridge generations through AI personas. Learn from industry legends and monetize your expertise.",
  generator: "v0.app",
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_URL}/api/og`,
    "fc:frame:button:1": "Launch App",
    "fc:frame:post_url": `${process.env.NEXT_PUBLIC_URL}/api/frame`,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <Web3Provider>
            <AuthProvider>{children}</AuthProvider>
          </Web3Provider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
