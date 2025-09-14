"use client"

import { createConfig, http, WagmiProvider } from "wagmi"
import { base, baseSepolia, sepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

export const config = createConfig({
  chains: [base, baseSepolia, sepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [sepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
