"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon, Button } from "../components/DemoComponents";
import { useMiniKit, useAddFrame, useOpenUrl } from "@coinbase/onchainkit/minikit"
import { useAccount } from "wagmi"
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet"
import { Address, Avatar, EthBalance, Name, Identity } from "@coinbase/onchainkit/identity"

export default function HomePage() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const { isConnected, address } = useAccount()
  const [showSplash, setShowSplash] = useState(true);
  const [frameAdded, setFrameAdded] = useState(false);
  const addFrame = useAddFrame()
  const openUrl = useOpenUrl()
  
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    // Check if user has seen splash screen before
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    
    if (hasSeenSplash) {
      // User has seen splash before, skip it
      setShowSplash(false);
    } else {
      // First time user, show splash for 2 seconds
      const timer = setTimeout(() => {
        setShowSplash(false);
        // Mark that user has seen splash
        localStorage.setItem('hasSeenSplash', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Content Wrapper */}
      <div className="max-w-sm mx-auto bg-white min-h-screen">
        {/* Mobile-First Header */}
        <div className="w-full px-4 py-3">
          <header className="flex justify-between items-center mb-3 h-11">
            {/* Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Sensei</span>
            </div>
            
            {/* Wallet Connection */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {saveFrameButton}
              <Wallet className="z-10">
                <ConnectWallet>
                  <Name className="text-inherit" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </header>

          {/* Main Content - Mobile First */}
          <main className="space-y-8">
            {/* Hero Section - Mobile Optimized */}
            <section className="text-center space-y-6">
              <div className="space-y-4 mt-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                  AI-Powered Knowledge Economy
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Connect with AI Senseis, earn tokens, and build your knowledge empire in the decentralized future
                </p>
              </div>
              
              {/* CTA Buttons - Mobile Stacked */}
              <div className="flex flex-col gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="w-full h-12 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full h-12 px-8 text-lg"
                >
                  Learn More
                </Button>
              </div>
            </section>

        {/* Features Grid - Mobile Stacked */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-1.5rem font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {/* AI Senseis */}
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">AI Senseis</CardTitle>
                <CardDescription>
                  Connect with intelligent AI assistants specialized in various domains
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Token Economy */}
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Token Economy</CardTitle>
                <CardDescription>
                  Earn and spend tokens for knowledge services and AI interactions
                </CardDescription>
              </CardHeader>
            </Card>

            {/* NFT Lessons */}
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <CardTitle className="text-lg">NFT Lessons</CardTitle>
                <CardDescription>
                  Collect unique lesson NFTs and build your knowledge portfolio
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Privacy & Security */}
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-2">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Privacy & Security</CardTitle>
                <CardDescription>
                  Built with FHEVM for secure, private AI interactions
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Booking System */}
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-2">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Booking System</CardTitle>
                <CardDescription>
                  Schedule sessions with AI Senseis and manage your learning calendar
                </CardDescription>
              </CardHeader>
            </Card>

            {/* ENS Integration */}
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-2">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <CardTitle className="text-lg">ENS Integration</CardTitle>
                <CardDescription>
                  Register unique ENS names for your AI personas and profiles
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Stats Section - Mobile Optimized */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-1.5rem font-bold text-gray-900 mb-4">
              Platform Statistics
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">100+</div>
                <div className="text-sm text-gray-600">AI Senseis</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">50K+</div>
                <div className="text-sm text-gray-600">Lessons</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">1M+</div>
                <div className="text-sm text-gray-600">Tokens Earned</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-indigo-600">10K+</div>
                <div className="text-sm text-gray-600">Users</div>
              </CardContent>
            </Card>
          </div>
        </section>

            {/* CTA Section - Mobile Optimized */}
            <section className="text-center space-y-6 py-12">
              <div className="space-y-4">
                <h2 className="text-1.5rem font-bold text-gray-900">
                  Ready to Start Learning?
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Join thousands of learners and AI enthusiasts building the future of knowledge
                </p>
              </div>
              
              <div className="flex flex-col gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="w-full h-12 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Explore Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full h-12 px-8 text-lg"
                >
                  View Documentation
                </Button>
              </div>
            </section>
          </main>

          {/* Footer - Mobile Optimized */}
          <footer className="bg-gray-900 text-white py-12 mt-14">
            <div className="px-4">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Sensei Platform</h3>
                  <p className="text-gray-400 text-sm">
                    Building the future of AI-powered knowledge economy
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Features</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>AI Senseis</li>
                    <li>Token Economy</li>
                    <li>NFT Lessons</li>
                    <li>Privacy & Security</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Resources</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>Documentation</li>
                    <li>API Reference</li>
                    <li>Community</li>
                    <li>Support</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Connect</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>Twitter</li>
                    <li>Discord</li>
                    <li>GitHub</li>
                    <li>Blog</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                <p className="text-gray-400 text-sm">
                  © 2024 Sensei Platform. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}