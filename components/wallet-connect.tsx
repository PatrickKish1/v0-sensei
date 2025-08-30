"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { config } from "@/providers/web3-provider"

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <Button
      onClick={() => (isConnected ? disconnect() : connect({ connector: config.connectors[0] }))}
      variant={isConnected ? "outline" : "default"}
    >
      {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"}
    </Button>
  )
}
