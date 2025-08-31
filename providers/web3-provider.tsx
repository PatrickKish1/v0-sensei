"use client"

import { createConfig, http, WagmiProvider } from "wagmi"
import { base, baseSepolia, sepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { farcasterFrame } from "@farcaster/frame-wagmi-connector"
import { metaMask, walletConnect, coinbaseWallet, injected } from "wagmi/connectors"
import type { ReactNode } from "react"

export const config = createConfig({
  chains: [base, baseSepolia, sepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id",
    }),
    coinbaseWallet({
      appName: "Sensei",
      appLogoUrl: "/favicon.ico",
    }),
    injected(),
    farcasterFrame(),
  ],
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
