import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Manrope } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/lib/auth"
import { ReplicaProvider } from "@/lib/replica"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "Sensei - AI Persona Replicas",
  description: "Connect with AI replicas of industry experts and share knowledge across generations",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${manrope.variable}`}>
        <AuthProvider>
          <ReplicaProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </ReplicaProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
