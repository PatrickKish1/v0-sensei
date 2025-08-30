"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface User {
  address: string
  ensName?: string
  avatar?: string
  displayName?: string
  bio?: string
  expertise?: string[]
  isExpert?: boolean
  replicaId?: string
  joinedAt: Date
}

interface AuthContextType {
  user: User | null
  isConnecting: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Mock wallet connection for demo purposes
  // In production, this would integrate with wagmi/viem or similar Web3 library
  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data - in production this would come from wallet and backend
      const mockUser: User = {
        address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c",
        ensName: "user.eth",
        displayName: "John Doe",
        bio: "Passionate about AI and blockchain technology",
        expertise: ["AI", "Blockchain"],
        isExpert: false,
        joinedAt: new Date(),
      }

      setUser(mockUser)
      localStorage.setItem("sensei_user", JSON.stringify(mockUser))
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setUser(null)
    localStorage.removeItem("sensei_user")
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("sensei_user", JSON.stringify(updatedUser))
  }

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("sensei_user")
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("Failed to parse saved user:", error)
        localStorage.removeItem("sensei_user")
      }
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isConnecting,
        connectWallet,
        disconnectWallet,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
