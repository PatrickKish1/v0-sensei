import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/components/auth-provider"
import { Web3Provider } from "@/providers/web3-provider"
import { MiniKit } from "@/providers/minikit-provider"
import { ReplicaProvider } from "@/lib/replica"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Project Sensei - AI-Powered Knowledge Sharing",
  description: "Bridge generations through AI personas. Learn from industry legends and monetize your expertise.",
  generator: "v0.app",
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
            <MiniKit>
              <AuthProvider>
                <ReplicaProvider>{children}</ReplicaProvider>
              </AuthProvider>
            </MiniKit>
          </Web3Provider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
