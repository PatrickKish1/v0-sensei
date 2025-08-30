export interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isTyping?: boolean
  confidence?: number
  sources?: string[]
}

export interface ChatSession {
  id: string
  personaId: string
  personaName: string
  personaEnsName?: string
  userId: string
  userName: string
  messages: ChatMessage[]
  startTime: Date
  endTime?: Date
  duration?: number
  cost: number
  rating?: number
  status: "active" | "completed" | "paused"
}

export class ChatService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl = "https://api.glazed.ai") {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  async sendMessage(
    sessionId: string,
    personaId: string,
    message: string,
    context?: any,
  ): Promise<{ response: string; confidence: number; sources: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/characters/${personaId}/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId,
          context: context || {},
          includeMetadata: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      return response.json()
    } catch (error) {
      console.error("Error sending message:", error)
      // Return mock response for development
      return {
        response: `Thank you for your question about "${message.slice(0, 50)}...". Based on my experience, I'd recommend focusing on the fundamentals first. This approach has served me well throughout my career, and I believe it will help you achieve your goals more effectively.`,
        confidence: 0.85,
        sources: ["Leadership Principles.pdf", "Team Management Video.mp4"],
      }
    }
  }

  async createSession(personaId: string, userId: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: `session_${Date.now()}`,
      personaId,
      personaName: "Dr. Sarah Chen AI", // This would come from persona data
      personaEnsName: "sarahchen.eth",
      userId,
      userName: "Current User", // This would come from user data
      messages: [],
      startTime: new Date(),
      cost: 0,
      status: "active",
    }

    // Store session (in production, this would be in a database)
    localStorage.setItem(`chat_session_${session.id}`, JSON.stringify(session))

    return session
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    const stored = localStorage.getItem(`chat_session_${sessionId}`)
    if (!stored) return null

    const session = JSON.parse(stored)
    // Convert date strings back to Date objects
    session.startTime = new Date(session.startTime)
    if (session.endTime) session.endTime = new Date(session.endTime)
    session.messages = session.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }))

    return session
  }

  async updateSession(session: ChatSession): Promise<void> {
    localStorage.setItem(`chat_session_${session.id}`, JSON.stringify(session))
  }

  async endSession(sessionId: string, rating?: number): Promise<ChatSession> {
    const session = await this.getSession(sessionId)
    if (!session) throw new Error("Session not found")

    session.endTime = new Date()
    session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60) // minutes
    session.status = "completed"
    if (rating) session.rating = rating

    await this.updateSession(session)
    return session
  }
}

export const chatService = new ChatService("mock-api-key")
