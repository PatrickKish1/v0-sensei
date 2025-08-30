"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { Menu, X, Brain, User, Wallet, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, login, logout } = useAuth()

  const handleWalletConnect = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })
        if (accounts.length > 0) {
          await login(accounts[0])
        }
      } catch (error) {
        console.error("Wallet connection failed:", error)
        // Fallback for demo
        await login("0x1234567890123456789012345678901234567890")
      }
    } else {
      // Demo mode - simulate wallet connection
      await login("0x1234567890123456789012345678901234567890")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Project Sensei</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="/explore" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Explore
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Features
          </a>
          <a href="#experts" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Experts
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            How It Works
          </a>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.ensName || user.walletAddress}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => (window.location.href = "/dashboard")}>Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => (window.location.href = "/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => (window.location.href = "/train")}>Train AI</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" className="ml-4 bg-transparent">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button size="sm" onClick={handleWalletConnect}>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <a href="/explore" className="block text-sm font-medium text-muted-foreground hover:text-primary">
              Explore
            </a>
            <a href="#features" className="block text-sm font-medium text-muted-foreground hover:text-primary">
              Features
            </a>
            <a href="#experts" className="block text-sm font-medium text-muted-foreground hover:text-primary">
              Experts
            </a>
            <a href="#how-it-works" className="block text-sm font-medium text-muted-foreground hover:text-primary">
              How It Works
            </a>
            <div className="flex flex-col space-y-2 pt-4">
              {user ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => (window.location.href = "/dashboard")}>
                    Dashboard
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => (window.location.href = "/train")}>
                    Train AI
                  </Button>
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                  <Button size="sm" onClick={handleWalletConnect}>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
