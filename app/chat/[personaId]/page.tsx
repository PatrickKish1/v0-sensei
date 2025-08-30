"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChatMessageComponent } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
import { chatService, type ChatSession, type ChatMessage } from "@/lib/chat"
import { Brain, ArrowLeft, Clock, DollarSign, AlertCircle } from "lucide-react"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const personaId = params.personaId as string

  const [session, setSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeChat()
  }, [personaId])

  useEffect(() => {
    scrollToBottom()
  }, [session?.messages])

  const initializeChat = async () => {
    try {
      // In a real app, you'd get the current user ID from auth context
      const userId = "current-user-id"
      const newSession = await chatService.createSession(personaId, userId)
      setSession(newSession)
    } catch (error) {
      console.error("Failed to initialize chat:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (content: string) => {
    if (!session) return

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date(),
    }

    const updatedSession = {
      ...session,
      messages: [...session.messages, userMessage],
      cost: session.cost + 2.5, // $2.50 per message (example pricing)
    }

    setSession(updatedSession)
    setIsTyping(true)

    try {
      // Send message to AI service
      const response = await chatService.sendMessage(session.id, personaId, content)

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        content: response.response,
        role: "assistant",
        timestamp: new Date(),
        confidence: response.confidence,
        sources: response.sources,
      }

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage],
      }

      setSession(finalSession)
      await chatService.updateSession(finalSession)
    } catch (error) {
      console.error("Failed to send message:", error)
      // Add error message
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        role: "assistant",
        timestamp: new Date(),
      }

      const errorSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
      }

      setSession(errorSession)
    } finally {
      setIsTyping(false)
    }
  }

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    console.log(`Feedback for message ${messageId}: ${feedback}`)
    // In a real app, you'd send this feedback to your analytics service
  }

  const handleEndSession = async () => {
    if (!session) return

    try {
      await chatService.endSession(session.id)
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to end session:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to AI persona...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to connect to the AI persona. Please try again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/30 flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="font-semibold">{session.personaName}</h1>
                  {session.personaEnsName && (
                    <Badge variant="outline" className="text-xs">
                      {session.personaEnsName}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60)} min</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>${session.cost.toFixed(2)}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleEndSession}>
                End Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            {session.messages.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                <p className="text-muted-foreground mb-6">Ask {session.personaName} anything about their expertise</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {[
                    "What's your approach to leadership?",
                    "How do you build high-performing teams?",
                    "What are the key principles of product strategy?",
                    "How do you stay current with AI/ML trends?",
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left justify-start h-auto p-3 bg-transparent"
                      onClick={() => handleSendMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {session.messages.map((message) => (
                  <ChatMessageComponent
                    key={message.id}
                    message={message}
                    personaName={session.personaName}
                    personaEnsName={session.personaEnsName}
                    onFeedback={handleFeedback}
                  />
                ))}

                {isTyping && (
                  <div className="flex gap-3 mb-6">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{session.personaName}</span>
                        <span className="text-xs text-muted-foreground">typing...</span>
                      </div>
                      <Card className="p-3 bg-muted/50 max-w-fit">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="flex-shrink-0">
        <div className="container mx-auto max-w-4xl">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isTyping}
            placeholder={`Ask ${session.personaName} anything...`}
          />
        </div>
      </div>
    </div>
  )
}
