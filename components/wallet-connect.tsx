"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useEffect } from "react"

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { user, login, logout } = useAuth()

  useEffect(() => {
    if (isConnected && address && !user) {
      login(address)
    }
  }, [isConnected, address, user, login])

  useEffect(() => {
    if (!isConnected && user) {
      logout()
    }
  }, [isConnected, user, logout])

  const handleConnect = () => {
    const frameConnector = connectors.find((connector) => connector.id === "farcaster")
    if (frameConnector) {
      connect({ connector: frameConnector })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    logout()
  }

  if (isConnected && address) {
    return (
      <Button variant="outline" size="sm" onClick={handleDisconnect}>
        <LogOut className="h-4 w-4 mr-2" />
        Disconnect
      </Button>
    )
  }

  return (
    <Button size="sm" onClick={handleConnect}>
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  )
}
