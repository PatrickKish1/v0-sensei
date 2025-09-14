"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Plus, 
  Minus,
  Wallet,
  DollarSign,
  LogOut
} from "lucide-react"
import { useSenseiToken } from "@/contract/gatewayintegration"
import { useAccount, useDisconnect } from "wagmi"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export function WalletTab() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { logout } = useAuth()
  const router = useRouter()
  const [ethAmount, setEthAmount] = useState("")
  const [burnAmount, setBurnAmount] = useState("")
  
  const {
    balance,
    mintRate,
    mintWithETH,
    burn,
    getTokensForETH,
    refetchBalance,
    isMinting,
    isBurning,
    isMintConfirming,
    isBurnConfirming,
    mintHash,
    burnHash
  } = useSenseiToken()

  // Refresh balance after successful transactions
  useEffect(() => {
    if (mintHash || burnHash) {
      const timer = setTimeout(() => {
        refetchBalance()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [mintHash, burnHash, refetchBalance])

  const handleMint = async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) return
    
    try {
      await mintWithETH(ethAmount)
      setEthAmount("")
    } catch (error) {
      console.error("Minting failed:", error)
    }
  }

  const handleBurn = async () => {
    if (!burnAmount || parseFloat(burnAmount) <= 0) return
    
    try {
      await burn(burnAmount)
      setBurnAmount("")
    } catch (error) {
      console.error("Burning failed:", error)
    }
  }

  const estimatedTokens = ethAmount ? getTokensForETH(ethAmount) : "0"

  const handleDisconnect = async () => {
    try {
      if (isConnected) {
        await disconnect()
      }
      logout()
      router.push("/")
    } catch (error) {
      console.error("Disconnect failed:", error)
      logout()
      router.push("/")
    }
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Not Connected
            </CardTitle>
            <CardDescription>
              Please connect your wallet to access Sensei Token features
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Sensei Token Balance
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchBalance()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Your knowledge economy tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-foreground mb-2">
              {parseFloat(balance).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mb-4">SENSEI Tokens</div>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="secondary" className="gap-1">
                <DollarSign className="h-3 w-3" />
                Rate: {parseFloat(mintRate).toFixed(0)} ST/ETH
              </Badge>
              <Badge variant="outline">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="text-destructive hover:text-destructive"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Disconnect
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Mint Section */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="h-4 w-4 text-green-500" />
              <Label className="text-sm font-medium">Mint Tokens</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ethAmount" className="text-xs text-muted-foreground">
                  ETH Amount
                </Label>
                <Input
                  id="ethAmount"
                  type="number"
                  placeholder="0.1"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  step="0.001"
                  min="0"
                />
                {ethAmount && parseFloat(ethAmount) > 0 && (
                  <div className="text-xs text-muted-foreground">
                    You'll receive: ~{parseFloat(estimatedTokens).toFixed(2)} SENSEI
                  </div>
                )}
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleMint}
                  disabled={!ethAmount || parseFloat(ethAmount) <= 0 || isMinting || isMintConfirming}
                  className="w-full"
                >
                  {isMinting || isMintConfirming ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {isMinting ? "Minting..." : "Confirming..."}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Mint Tokens
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Burn Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Minus className="h-4 w-4 text-red-500" />
              <Label className="text-sm font-medium">Burn Tokens</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="burnAmount" className="text-xs text-muted-foreground">
                  SENSEI Amount
                </Label>
                <Input
                  id="burnAmount"
                  type="number"
                  placeholder="10"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  max={balance}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Available: {parseFloat(balance).toFixed(2)} SENSEI</span>
                  <button
                    type="button"
                    onClick={() => setBurnAmount(balance)}
                    className="text-primary hover:underline"
                  >
                    Max
                  </button>
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleBurn}
                  disabled={
                    !burnAmount || 
                    parseFloat(burnAmount) <= 0 || 
                    parseFloat(burnAmount) > parseFloat(balance) || 
                    isBurning || 
                    isBurnConfirming
                  }
                  variant="destructive"
                  className="w-full"
                >
                  {isBurning || isBurnConfirming ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {isBurning ? "Burning..." : "Confirming..."}
                    </>
                  ) : (
                    <>
                      <Minus className="h-4 w-4 mr-2" />
                      Burn Tokens
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Transaction Status */}
          {(mintHash || burnHash) && (
            <div className="mt-6 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-center">
                {mintHash && (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    Mint transaction submitted
                  </div>
                )}
                {burnHash && (
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <TrendingDown className="h-4 w-4" />
                    Burn transaction submitted
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Common token operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => setEthAmount("0.01")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Mint 0.01 ETH
            </Button>
            <Button
              variant="outline"
              onClick={() => setEthAmount("0.1")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Mint 0.1 ETH
            </Button>
            <Button
              variant="outline"
              onClick={() => setBurnAmount((parseFloat(balance) * 0.1).toString())}
              className="gap-2"
            >
              <Minus className="h-4 w-4" />
              Burn 10%
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
