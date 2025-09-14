"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Brain, Sparkles, Users, Coins, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SplashPage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    { icon: Brain, title: "AI Replicas", description: "Learn from the greatest minds" },
    { icon: Users, title: "Expert Network", description: "Connect with industry leaders" },
    { icon: Coins, title: "Knowledge Economy", description: "Monetize your expertise" },
  ]

  useEffect(() => {
    // Show content with animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto-advance features
    const featureTimer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 2000)

    return () => {
      clearTimeout(timer)
      clearInterval(featureTimer)
    }
  }, [])

  const handleGetStarted = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo and Title */}
        <div className={`space-y-6 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          {/* Animated Logo */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-primary/40 rounded-full animate-ping"></div>
            <div className="absolute inset-4 bg-primary rounded-full flex items-center justify-center">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Sensei
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium">
              AI-Powered Knowledge Sharing
            </p>
            <p className="text-sm md:text-base text-muted-foreground">
              Bridge generations through AI personas. Learn from industry legends and monetize your expertise.
            </p>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className={`space-y-4 transition-all duration-1000 delay-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <div className="relative h-32 bg-card/50 rounded-2xl border border-border/50 overflow-hidden">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex flex-col items-center justify-center space-y-3 transition-all duration-500 ${
                  index === currentFeature
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Get Started Button */}
        <div className={`transition-all duration-1000 delay-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <Button 
            size="lg" 
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 group"
            onClick={handleGetStarted}
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>

        {/* Footer */}
        <div className={`text-xs text-muted-foreground transition-all duration-1000 delay-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}>
          Built on Base • Powered by Sensay AI • ENS Integration
        </div>
      </div>
    </div>
  )
}
