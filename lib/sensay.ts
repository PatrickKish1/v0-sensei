interface SensayConfig {
  organizationSecret: string
  apiVersion: string
  baseUrl: string
}

interface SensayUser {
  id: string
  email?: string
  name?: string
  linkedAccounts?: any[]
}

interface SensayReplica {
  uuid: string
  name: string
  slug: string
  shortDescription: string
  greeting: string
  ownerID: string
  private: boolean
  profileImage?: string
  tags?: string[]
  suggestedQuestions?: string[]
  llm: {
    model: string
    systemMessage?: string
    tools?: string[]
  }
  voicePreviewText?: string
  purpose?: string
}

interface ChatCompletion {
  content: string
  success: boolean
}

interface KnowledgeBase {
  knowledgeBaseID: number
  success: boolean
}

export class SensayAPI {
  private config: SensayConfig

  constructor(config: SensayConfig) {
    this.config = config
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}, userId?: string) {
    const headers: Record<string, string> = {
      "X-ORGANIZATION-SECRET": this.config.organizationSecret,
      "X-API-Version": this.config.apiVersion,
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    }

    if (userId) {
      headers["X-USER-ID"] = userId
    }

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`Sensay API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // User Management
  async createUser(userId: string, email?: string, name?: string): Promise<SensayUser> {
    return this.makeRequest("/v1/users", {
      method: "POST",
      body: JSON.stringify({
        id: userId,
        email: email || `${userId}@sensei.app`,
        name: name || "Sensei User",
      }),
    })
  }

  async getUser(userId: string): Promise<SensayUser> {
    return this.makeRequest(`/v1/users/${userId}`)
  }

  // Replica Management
  async createReplica(
    userId: string,
    replicaData: Partial<SensayReplica>,
  ): Promise<{ success: boolean; uuid: string }> {
    return this.makeRequest(
      "/v1/replicas",
      {
        method: "POST",
        body: JSON.stringify({
          name: replicaData.name,
          purpose: replicaData.purpose || "AI persona replica for knowledge sharing",
          shortDescription: replicaData.shortDescription,
          greeting: replicaData.greeting || "Hello! How can I help you today?",
          type: "character",
          ownerID: userId,
          private: replicaData.private || false,
          slug: replicaData.slug,
          tags: replicaData.tags || [],
          profileImage: replicaData.profileImage,
          suggestedQuestions: replicaData.suggestedQuestions || [],
          llm: {
            model: replicaData.llm?.model || "claude-3-5-haiku-latest",
            systemMessage:
              replicaData.llm?.systemMessage || "You are a helpful AI assistant sharing knowledge and expertise.",
            tools: replicaData.llm?.tools || [],
          },
          voicePreviewText: replicaData.voicePreviewText,
        }),
      },
      userId,
    )
  }

  async getReplicas(userId: string): Promise<{ success: boolean; items: SensayReplica[]; total: number }> {
    return this.makeRequest("/v1/replicas", { method: "GET" }, userId)
  }

  async getReplica(replicaUuid: string, userId: string): Promise<SensayReplica> {
    return this.makeRequest(`/v1/replicas/${replicaUuid}`, { method: "GET" }, userId)
  }

  async updateReplica(
    replicaUuid: string,
    userId: string,
    updates: Partial<SensayReplica>,
  ): Promise<{ success: boolean }> {
    return this.makeRequest(
      `/v1/replicas/${replicaUuid}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      },
      userId,
    )
  }

  // Training & Knowledge Base
  async createKnowledgeBase(replicaUuid: string, userId: string): Promise<KnowledgeBase> {
    return this.makeRequest(
      `/v1/replicas/${replicaUuid}/training`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
      userId,
    )
  }

  async addTextToKnowledgeBase(
    replicaUuid: string,
    knowledgeBaseId: number,
    rawText: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    return this.makeRequest(
      `/v1/replicas/${replicaUuid}/training/${knowledgeBaseId}`,
      {
        method: "PUT",
        body: JSON.stringify({ rawText }),
      },
      userId,
    )
  }

  async getFileUploadUrl(
    replicaUuid: string,
    filename: string,
    userId: string,
  ): Promise<{ success: boolean; signedURL: string; knowledgeBaseID: number }> {
    return this.makeRequest(
      `/v1/replicas/${replicaUuid}/training/files/upload?filename=${encodeURIComponent(filename)}`,
      { method: "GET" },
      userId,
    )
  }

  // Chat & Conversations
  async chatCompletion(
    replicaUuid: string,
    content: string,
    userId: string,
    conversationUuid?: string,
  ): Promise<ChatCompletion> {
    const body: any = { content }
    if (conversationUuid) {
      body.conversationUUID = conversationUuid
    }

    return this.makeRequest(
      `/v1/replicas/${replicaUuid}/chat/completions`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      userId,
    )
  }

  async getConversations(replicaUuid: string, userId: string): Promise<any> {
    return this.makeRequest(`/v1/replicas/${replicaUuid}/conversations`, { method: "GET" }, userId)
  }

  async getMessages(
    replicaUuid: string,
    conversationUuid: string,
    userId: string,
    options?: { limit?: number; beforeUUID?: string; afterUUID?: string },
  ): Promise<any> {
    const params = new URLSearchParams()
    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.beforeUUID) params.append("beforeUUID", options.beforeUUID)
    if (options?.afterUUID) params.append("afterUUID", options.afterUUID)

    const query = params.toString() ? `?${params.toString()}` : ""
    return this.makeRequest(
      `/v1/replicas/${replicaUuid}/conversations/${conversationUuid}/messages${query}`,
      { method: "GET" },
      userId,
    )
  }

  // Analytics
  async getAnalytics(replicaUuid: string, userId: string): Promise<any> {
    return this.makeRequest(`/v1/replicas/${replicaUuid}/analytics/conversations/historical`, { method: "GET" }, userId)
  }
}

// Initialize Sensay API client
export const sensayAPI = new SensayAPI({
  organizationSecret: process.env.NEXT_PUBLIC_SENSAY_API_KEY_SECRET || "",
  apiVersion: "2025-03-25",
  baseUrl: "https://api.sensay.io",
})

// Helper functions for common operations
export async function createUserAndReplica(
  userId: string,
  userEmail: string,
  userName: string,
  replicaData: Partial<SensayReplica>,
) {
  try {
    // Check if user exists, create if not
    let user
    try {
      user = await sensayAPI.getUser(userId)
    } catch (error) {
      user = await sensayAPI.createUser(userId, userEmail, userName)
    }

    // Create replica
    const replica = await sensayAPI.createReplica(userId, replicaData)

    return { user, replica }
  } catch (error) {
    console.error("Error creating user and replica:", error)
    throw error
  }
}

export async function trainReplicaWithText(replicaUuid: string, userId: string, trainingText: string) {
  try {
    // Create knowledge base entry
    const kb = await sensayAPI.createKnowledgeBase(replicaUuid, userId)

    // Add text to knowledge base
    await sensayAPI.addTextToKnowledgeBase(replicaUuid, kb.knowledgeBaseID, trainingText, userId)

    return kb
  } catch (error) {
    console.error("Error training replica with text:", error)
    throw error
  }
}
