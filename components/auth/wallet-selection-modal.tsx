"use client"

import { useConnect, useAccount } from "wagmi"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Smartphone, Globe, Zap } from "lucide-react"
import { useEffect } from "react"

interface WalletSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (address: string) => void
}

export function WalletSelectionModal({ isOpen, onClose, onConnect }: WalletSelectionModalProps) {
  const { connectors, connect, isPending, error } = useConnect()
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (isConnected && address) {
      onConnect(address)
      onClose()
    }
  }, [isConnected, address, onConnect, onClose])

  const getWalletIcon = (connectorName: string) => {
    switch (connectorName.toLowerCase()) {
      case "metamask":
        return <Wallet className="h-6 w-6" />
      case "walletconnect":
        return <Smartphone className="h-6 w-6" />
      case "coinbase wallet":
        return <Globe className="h-6 w-6" />
      case "injected":
        return <Zap className="h-6 w-6" />
      default:
        return <Wallet className="h-6 w-6" />
    }
  }

  const getWalletDescription = (connectorName: string) => {
    switch (connectorName.toLowerCase()) {
      case "metamask":
        return "Connect using MetaMask browser extension"
      case "walletconnect":
        return "Connect using mobile wallet or desktop app"
      case "coinbase wallet":
        return "Connect using Coinbase Wallet"
      case "injected":
        return "Connect using browser wallet"
      default:
        return "Connect using wallet"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-center">
            Choose a wallet to connect to Sensei
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {connectors
            .filter((connector) => connector.name !== "Farcaster Frame")
            .map((connector) => (
              <Card
                key={connector.uid}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => connect({ connector })}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {getWalletIcon(connector.name)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{connector.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {getWalletDescription(connector.name)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
        </div>

        {error && (
          <div className="text-sm text-destructive text-center mt-4">
            {error.message}
          </div>
        )}

        {isPending && (
          <div className="text-sm text-muted-foreground text-center mt-4">
            Connecting to wallet...
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center mt-4">
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  )
}
