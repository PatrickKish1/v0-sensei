"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Coins, TrendingUp, TrendingDown, Wallet, RefreshCw, Plus, Minus } from "lucide-react"
import { useSenseiToken, getContractError, isContractConfigured } from "@/contract/gatewayintegration"

interface WalletBalanceProps {
  className?: string
}

export function WalletBalance({ className }: WalletBalanceProps) {
  const { isConnected } = useAccount()
  const [ethAmount, setEthAmount] = useState("")
  const [burnAmount, setBurnAmount] = useState("")
  const [error, setError] = useState<string>("")

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

  const handleMint = async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) return
    
    try {
      setError("")
      await mintWithETH(ethAmount)
      setEthAmount("")
    } catch (err) {
      setError(getContractError(err))
    }
  }

  const handleBurn = async () => {
    if (!burnAmount || parseFloat(burnAmount) <= 0) return
    
    try {
      setError("")
      await burn(burnAmount)
      setBurnAmount("")
    } catch (err) {
      setError(getContractError(err))
    }
  }

  const handleRefresh = async () => {
    try {
      await refetchBalance()
    } catch (err) {
      setError(getContractError(err))
    }
  }

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Not Connected
          </CardTitle>
          <CardDescription>
            Connect your wallet to view your SensiToken balance
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isContractConfigured()) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Contracts Not Configured
          </CardTitle>
          <CardDescription>
            Contract addresses need to be configured for token operations
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const estimatedTokens = getTokensForETH(ethAmount || "0")

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            SensiToken Balance
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <CardDescription>
          Your knowledge economy tokens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground">
            {parseFloat(balance).toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">SENSEI Tokens</div>
          <Badge variant="secondary" className="mt-2">
            Current Rate: {parseFloat(mintRate).toFixed(0)} ST/ETH
          </Badge>
        </div>

        <Separator />

        {/* Mint Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-green-500" />
            <Label className="text-sm font-medium">Mint Tokens</Label>
          </div>
          <div className="space-y-3">
            <div>
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
            </div>
            {ethAmount && parseFloat(ethAmount) > 0 && (
              <div className="text-xs text-muted-foreground">
                You'll receive: ~{parseFloat(estimatedTokens).toFixed(2)} SENSEI
              </div>
            )}
            <Button
              onClick={handleMint}
              disabled={!ethAmount || parseFloat(ethAmount) <= 0 || isMinting || isMintConfirming}
              className="w-full"
              size="sm"
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

        <Separator />

        {/* Burn Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-red-500" />
            <Label className="text-sm font-medium">Burn Tokens</Label>
          </div>
          <div className="space-y-3">
            <div>
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
            </div>
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
            <Button
              onClick={handleBurn}
              disabled={!burnAmount || parseFloat(burnAmount) <= 0 || parseFloat(burnAmount) > parseFloat(balance) || isBurning || isBurnConfirming}
              variant="destructive"
              className="w-full"
              size="sm"
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

        {/* Error Display */}
        {error && (
          <div className="text-xs text-destructive text-center bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}

        {/* Transaction Status */}
        {(mintHash || burnHash) && (
          <div className="text-xs text-muted-foreground text-center">
            {mintHash && (
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                Mint transaction submitted
              </div>
            )}
            {burnHash && (
              <div className="flex items-center justify-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-500" />
                Burn transaction submitted
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
