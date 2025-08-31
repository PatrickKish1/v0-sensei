"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAccount } from "wagmi"

interface User {
  id: string
  name: string
  email: string
  walletAddress: string
  ensName?: string
  avatar?: string
  bio?: string
  expertise?: string[]
  isExpert: boolean
  role: "sensei" | "student"
  category?: string
  experience?: string
  socialLinks?: {
    linkedIn?: string
    twitter?: string
    website?: string
  }
  registrationData?: any
  joinedAt: Date
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (walletAddress: string, role: "sensei" | "student", registrationData?: any) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("sensei_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const logout = () => {
    setUser(null)
    localStorage.removeItem("sensei_user")
  }

  // Handle wallet disconnection
  useEffect(() => {
    if (!isConnected && user) {
      // If wallet gets disconnected but user is still logged in, logout the user
      console.log("Wallet disconnected, logging out user")
      logout()
    }
  }, [isConnected, user])

  const login = async (walletAddress: string, role: "sensei" | "student", registrationData?: any) => {
    setIsLoading(true)
    try {
      const userData: User = {
        id: `user_${walletAddress}`,
        name: registrationData?.name || `${role === "sensei" ? "Sensei" : "Student"} ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        email: registrationData?.email || "",
        walletAddress,
        bio: registrationData?.bio || `${role === "sensei" ? "Expert" : "Learner"} passionate about knowledge sharing`,
        expertise: registrationData?.expertise || [],
        isExpert: role === "sensei",
        role,
        category: registrationData?.category,
        experience: registrationData?.experience,
        socialLinks: {
          linkedIn: registrationData?.linkedIn,
          twitter: registrationData?.twitter,
          website: registrationData?.website,
        },
        registrationData,
        joinedAt: new Date(),
      }

      setUser(userData)
      localStorage.setItem("sensei_user", JSON.stringify(userData))
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("sensei_user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
