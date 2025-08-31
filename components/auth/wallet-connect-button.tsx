"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { Wallet, LogOut } from "lucide-react"
import { useDisconnect, useAccount } from "wagmi"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RoleSelectionModal } from "./role-selection-modal"
import { WalletSelectionModal } from "./wallet-selection-modal"
import { SenseiRegistrationModal } from "./sensei-registration-modal"
import { useRouter } from "next/navigation"

export function WalletConnectButton() {
  const { user, isLoading, login, logout } = useAuth()
  const { disconnect } = useDisconnect()
  const { isConnected } = useAccount()
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [showWalletSelection, setShowWalletSelection] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"sensei" | "student" | null>(null)
  const [connectedAddress, setConnectedAddress] = useState<string>("")
  const router = useRouter()

  const handleConnectClick = () => {
    setShowRoleSelection(true)
  }

  const handleRoleSelect = (role: "sensei" | "student") => {
    setSelectedRole(role)
    setShowRoleSelection(false)
    setShowWalletSelection(true)
  }

  const handleWalletConnect = async (address: string) => {
    setConnectedAddress(address)
    setShowWalletSelection(false)
    
    if (selectedRole === "sensei") {
      setShowRegistration(true)
    } else {
      // For students, login directly and redirect to dashboard
      await login(address, "student")
      router.push("/dashboard")
    }
  }

  const handleRegistrationComplete = async (registrationData: any) => {
    setShowRegistration(false)
    await login(connectedAddress, "sensei", registrationData)
    router.push("/dashboard")
  }

  const handleDisconnect = async () => {
    try {
      // First disconnect from wagmi (wallet level)
      if (isConnected) {
        await disconnect()
      }
      // Then logout from auth provider (app level)
      logout()
      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Disconnect failed:", error)
      // Still logout from auth provider even if wallet disconnect fails
      logout()
      router.push("/")
    }
  }

  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnectClick}
          disabled={isLoading}
          className="gap-2 bg-transparent"
        >
          <Wallet className="h-4 w-4" />
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>

        <RoleSelectionModal
          isOpen={showRoleSelection}
          onRoleSelect={handleRoleSelect}
        />

        <WalletSelectionModal
          isOpen={showWalletSelection}
          onClose={() => setShowWalletSelection(false)}
          onConnect={handleWalletConnect}
        />

        {selectedRole === "sensei" && (
          <SenseiRegistrationModal
            isOpen={showRegistration}
            onComplete={handleRegistrationComplete}
            walletAddress={connectedAddress}
          />
        )}
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || user.walletAddress} />
            <AvatarFallback>{user.name ? user.name[0] : user.walletAddress.slice(2, 4)}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">
            {user.name || `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.name || "Anonymous"}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {user.ensName || `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
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
        <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
