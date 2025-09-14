"use client"

import { Button } from "@/components/ui/button"
import { Brain, Home, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-sm w-full">
        {/* 404 Icon */}
        <div className="relative mx-auto w-32 h-32">
          {/* Background circles */}
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
          <div className="absolute inset-4 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* 404 Text */}
          <div className="absolute inset-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">404</span>
          </div>
          
          {/* Floating brain */}
          <Brain className="absolute -top-2 -right-2 w-8 h-8 text-primary animate-bounce" />
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground">
            Oops! The knowledge you're looking for seems to have wandered off into the digital void.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button asChild className="w-full h-12 text-lg" size="lg">
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full h-12 text-lg" size="lg">
            <Link href="/dashboard">
              <Search className="w-5 h-5 mr-2" />
              Explore Dashboard
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Quick Navigation:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/replica/create">
              <Button variant="ghost" size="sm" className="h-8">
                Create Replica
              </Button>
            </Link>
            <Link href="/ens">
              <Button variant="ghost" size="sm" className="h-8">
                ENS Management
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="h-8">
                Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <div className="pt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
