"use client"

import { Brain, Sparkles, Users, Coins } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        {/* Animated Brain Logo */}
        <div className="relative mx-auto w-20 h-20">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-spin"></div>
          
          {/* Middle ring */}
          <div className="absolute inset-2 border-4 border-primary/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
          
          {/* Inner brain */}
          <div className="absolute inset-4 bg-primary rounded-full flex items-center justify-center animate-pulse">
            <Brain className="w-10 h-10 text-white" />
          </div>
          
          {/* Floating sparkles */}
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute -bottom-1 -left-1 w-4 h-4 text-blue-400 animate-bounce" style={{ animationDelay: '1s' }} />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Loading Sensei</h2>
          <p className="text-sm text-muted-foreground">Preparing your AI knowledge experience...</p>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Feature Icons */}
        <div className="flex justify-center space-x-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">AI Replicas</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}>
              <Coins className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Knowledge</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '1s' }}>
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Learning</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-48 mx-auto">
          <div className="w-full bg-primary/20 rounded-full h-1">
            <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
