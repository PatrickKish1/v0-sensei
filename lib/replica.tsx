"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { ENSRegistration } from "./ens"
import { createUserAndReplica, trainReplicaWithText } from "./sensay"
import { registerENSForReplica } from "./ens-integration"

export interface ReplicaContent {
  id: string
  type: "document" | "video" | "audio" | "text"
  name: string
  size: number
  uploadedAt: Date
  status: "processing" | "completed" | "failed"
  url?: string
}

export interface ReplicaAnalytics {
  totalSessions: number
  totalRevenue: number
  averageRating: number
  totalHours: number
  monthlyGrowth: number
  topTopics: string[]
  recentFeedback: Array<{
    rating: number
    comment: string
    date: Date
  }>
}

export interface Replica {
  id: string
  name: string
  description: string
  expertise: string[]
  personality: string
  responseStyle: string
  availability: string
  pricing: number
  ensName?: string // Added ENS name field
  ensRegistration?: ENSRegistration // Added ENS registration data
  trainingProgress: number
  totalSessions: number
  rating: number
  earnings: number
  isActive: boolean
  createdAt: string
  lastActive: string
  status: "active" | "inactive" | "training" | "error"
  avatar?: string
  content?: ReplicaContent[]
  analytics?: ReplicaAnalytics
}

interface ReplicaContextType {
  replicas: Replica[]
  currentReplica: Replica | null
  createReplica: (data: any) => Promise<Replica>
  updateReplica: (id: string, updates: Partial<Replica>) => Promise<void>
  uploadContent: (replicaId: string, files: File[]) => Promise<void>
  deleteContent: (replicaId: string, contentId: string) => Promise<void>
  setCurrentReplica: (replica: Replica | null) => void
  trainReplica: (replicaId: string, content: string) => Promise<void>
}

const ReplicaContext = createContext<ReplicaContextType | undefined>(undefined)

export function ReplicaProvider({ children }: { children: ReactNode }) {
  const [replicas, setReplicas] = useState<Replica[]>([])
  const [currentReplica, setCurrentReplica] = useState<Replica | null>(null)
  const [loading, setLoading] = useState(false)

  const createReplica = async (replicaData: any) => {
    try {
      setLoading(true)

      // Get current user (you'd get this from your auth context)
      const userId = "current-user-id" // Replace with actual user ID
      const userEmail = "user@example.com" // Replace with actual user email
      const userName = "User Name" // Replace with actual user name

      // Create user and replica using real Sensay API
      const { user, replica } = await createUserAndReplica(userId, userEmail, userName, {
        name: replicaData.name,
        shortDescription: replicaData.description,
        greeting: replicaData.greeting,
        purpose: replicaData.purpose,
        tags: replicaData.expertise || [],
        llm: {
          model: "claude-3-5-haiku-latest",
          systemMessage: replicaData.personality || "You are a helpful AI assistant.",
        },
        private: false,
        slug: replicaData.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      })

      // Register ENS name for the replica
      const ensResult = await registerENSForReplica(
        replicaData.name,
        "0x1234567890123456789012345678901234567890", // Replace with actual wallet address
      )

      // Update replicas list
      const updatedReplica: Replica = {
        id: replica.uuid,
        name: replicaData.name,
        description: replicaData.description,
        expertise: replicaData.expertise || [],
        personality: replicaData.personality || "Helpful and professional",
        responseStyle: replicaData.responseStyle || "Conversational",
        availability: replicaData.availability || "24/7",
        pricing: replicaData.pricing || 0,
        ensName: ensResult.ensName,
        status: "active",
        trainingProgress: 0,
        totalSessions: 0,
        rating: 0,
        earnings: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        content: [],
        analytics: {
          totalSessions: 0,
          totalRevenue: 0,
          averageRating: 0,
          totalHours: 0,
          monthlyGrowth: 0,
          topTopics: [],
          recentFeedback: []
        }
      }

      setReplicas((prev) => [...prev, updatedReplica])
      return updatedReplica
    } catch (error) {
      console.error("Error creating replica:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateReplica = async (id: string, updates: Partial<Replica>) => {
    setReplicas((prev) =>
      prev.map((replica) =>
        replica.id === id ? { ...replica, ...updates, lastActive: new Date().toISOString() } : replica,
      ),
    )
  }

  const uploadContent = async (replicaId: string, files: File[]) => {
    const newContent: ReplicaContent[] = files.map((file) => ({
      id: `content_${Date.now()}_${Math.random()}`,
      type: file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : "document",
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      status: "processing",
    }))

    setReplicas((prev) =>
      prev.map((replica) =>
        replica.id === replicaId
                  ? {
            ...replica,
            content: [...(replica.content || []), ...newContent],
            lastActive: new Date().toISOString(),
          }
          : replica,
      ),
    )

    // Simulate processing
    setTimeout(() => {
      setReplicas((prev) =>
        prev.map((replica) =>
          replica.id === replicaId
            ? {
                ...replica,
                content: (replica.content || []).map((content) =>
                  newContent.find((nc) => nc.id === content.id)
                    ? { ...content, status: "completed" as const }
                    : content,
                ),
                trainingProgress: Math.min(replica.trainingProgress + 20, 100),
              }
            : replica,
        ),
      )
    }, 3000)
  }

  const deleteContent = async (replicaId: string, contentId: string) => {
    setReplicas((prev) =>
      prev.map((replica) =>
        replica.id === replicaId
          ? {
              ...replica,
              content: (replica.content || []).filter((c) => c.id !== contentId),
              lastActive: new Date().toISOString(),
            }
          : replica,
      ),
    )
  }

  const trainReplica = async (replicaId: string, content: string) => {
    try {
      setLoading(true)

      const userId = "current-user-id" // Replace with actual user ID

      // Train replica using real Sensay API
      await trainReplicaWithText(replicaId, userId, content)

      // Update training progress
      setReplicas((prev) =>
        prev.map((replica) =>
          replica.id === replicaId
            ? { ...replica, trainingProgress: Math.min(replica.trainingProgress + 10, 100) }
            : replica,
        ),
      )
    } catch (error) {
      console.error("Error training replica:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <ReplicaContext.Provider
      value={{
        replicas,
        currentReplica,
        createReplica,
        updateReplica,
        uploadContent,
        deleteContent,
        setCurrentReplica,
        trainReplica,
      }}
    >
      {children}
    </ReplicaContext.Provider>
  )
}

export function useReplica() {
  const context = useContext(ReplicaContext)
  if (context === undefined) {
    throw new Error("useReplica must be used within a ReplicaProvider")
  }
  return context
}
