"use client"

import type { ChatMessage } from "@/lib/chat"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, User, ThumbsUp, ThumbsDown, Copy, ExternalLink } from "lucide-react"
import { useState } from "react"

interface ChatMessageProps {
  message: ChatMessage
  personaName?: string
  personaEnsName?: string
  onFeedback?: (messageId: string, feedback: "positive" | "negative") => void
}

export function ChatMessageComponent({ message, personaName, personaEnsName, onFeedback }: ChatMessageProps) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null)
  const [copied, setCopied] = useState(false)

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(type)
    onFeedback?.(message.id, type)
  }

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-6`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        {isUser ? (
          <>
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarFallback className="bg-primary/10">
              <Brain className="h-4 w-4 text-primary" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div className={`flex-1 max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{isUser ? "You" : personaName || "AI Assistant"}</span>
          {!isUser && personaEnsName && (
            <Badge variant="outline" className="text-xs">
              {personaEnsName}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <Card className={`p-3 ${isUser ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}>
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>

          {message.confidence && (
            <div className="mt-2 pt-2 border-t border-border/20">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                {message.sources && message.sources.length > 0 && <span>• Sources: {message.sources.length}</span>}
              </div>
            </div>
          )}
        </Card>

        {!isUser && (
          <div className="flex items-center gap-1 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback("positive")}
              className={`h-6 px-2 ${feedback === "positive" ? "text-green-600" : ""}`}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback("negative")}
              className={`h-6 px-2 ${feedback === "negative" ? "text-red-600" : ""}`}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={copyMessage} className="h-6 px-2">
              <Copy className="h-3 w-3" />
              {copied && <span className="ml-1 text-xs">Copied!</span>}
            </Button>
            {message.sources && message.sources.length > 0 && (
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <ExternalLink className="h-3 w-3" />
                <span className="ml-1 text-xs">Sources</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
