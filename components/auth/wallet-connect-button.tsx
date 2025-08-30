"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { Wallet, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function WalletConnectButton() {
  const { user, isConnecting, connectWallet, disconnectWallet } = useAuth()

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={connectWallet}
        disabled={isConnecting}
        className="gap-2 bg-transparent"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.displayName || user.address} />
            <AvatarFallback>{user.displayName ? user.displayName[0] : user.address.slice(2, 4)}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">
            {user.displayName || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.displayName || "Anonymous"}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {user.ensName || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/profile">View Profile</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/dashboard">Dashboard</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
