"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Brain, Users, Zap, Star, MessageCircle, Upload, Coins } from "lucide-react"
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletModal,
} from "@coinbase/onchainkit/wallet"
import {
  Name,
  Identity,
  Address,
  Avatar as CoinbaseAvatar,
  EthBalance,
} from "@coinbase/onchainkit/identity"
import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit"
import { useState, useCallback, useMemo, useEffect } from "react"

export default function SenseiHomePage() {
  const [showWalletModal, setShowWalletModal] = useState(false)
  const { setFrameReady, isFrameReady, context } = useMiniKit()
  const [frameAdded, setFrameAdded] = useState(false)
  const addFrame = useAddFrame()
  const openUrl = useOpenUrl()

  // Initialize MiniKit
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [setFrameReady, isFrameReady])

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame()
    setFrameAdded(Boolean(frameAdded))
  }, [addFrame])

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddFrame}
          className="text-primary border-primary hover:bg-primary hover:text-white"
        >
          Save Frame
        </Button>
      )
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-green-600">
          <span>✓ Saved</span>
        </div>
      )
    }

    return null
  }, [context, frameAdded, handleAddFrame])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Sensei</h1>
            </div>
            <div className="flex items-center gap-4">
              {saveFrameButton}
              <Wallet className="z-10">
                <ConnectWallet>
                  <Name className="text-inherit" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <CoinbaseAvatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
                <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
              </Wallet>
              <Button size="sm">Create Replica</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Learn from the <span className="text-primary">Greatest Minds</span> of Our Time
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty font-manrope">
            Connect with AI replicas of industry leaders, experts, and visionaries. Share knowledge across generations
            and monetize your expertise.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search for experts, topics, or industries..."
              className="pl-12 py-6 text-lg bg-card border-border"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="lg" className="gap-2">
              <MessageCircle className="h-5 w-5" />
              Start Learning
            </Button>
            <Button variant="outline" size="lg" className="gap-2 bg-transparent">
              <Upload className="h-5 w-5" />
              Create Your Replica
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">How Sensei Works</h3>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Create AI Replica</CardTitle>
                <CardDescription className="font-manrope">
                  Upload documents, videos, and audio to train your personal AI replica
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Connect & Learn</CardTitle>
                <CardDescription className="font-manrope">
                  Interact with AI replicas of experts and industry leaders
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Earn Revenue</CardTitle>
                <CardDescription className="font-manrope">
                  Monetize your knowledge and expertise through your AI replica
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* MiniKit Integration Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-bold mb-8 text-foreground">Built for the Decentralized Web</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Brain className="h-6 w-6 text-primary" />
                  Frame Integration
                </CardTitle>
                <CardDescription>
                  Save this app to your Farcaster frame and access it directly from your social feed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {saveFrameButton && (
                  <div className="flex justify-center">
                    {saveFrameButton}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Coins className="h-6 w-6 text-primary" />
                  Wallet Connect
                </CardTitle>
                <CardDescription>
                  Connect your wallet seamlessly using Coinbase's MiniKit integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Wallet className="z-10">
                    <ConnectWallet>
                      <Name className="text-inherit" />
                    </ConnectWallet>
                    <WalletDropdown>
                      <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                        <CoinbaseAvatar />
                        <Name />
                        <Address />
                        <EthBalance />
                      </Identity>
                      <WalletDropdownDisconnect />
                    </WalletDropdown>
                    <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
                  </Wallet>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
