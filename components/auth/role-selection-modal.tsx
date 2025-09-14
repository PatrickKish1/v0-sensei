"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, BookOpen, Coins } from "lucide-react"

interface RoleSelectionModalProps {
  isOpen: boolean
  onRoleSelect: (role: "sensei" | "student") => void
}

export function RoleSelectionModal({ isOpen, onRoleSelect }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<"sensei" | "student" | null>(null)

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Welcome to Sensei</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Choose your role to get started with the platform
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedRole === "sensei" ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
            onClick={() => setSelectedRole("sensei")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">I'm a Sensei</CardTitle>
              <CardDescription>Share your expertise and earn revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Create AI replicas of yourself
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Teach students through AI
                </li>
                <li className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Monetize your knowledge
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4 font-medium">
                * Requires registration and verification
              </p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedRole === "student" ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
            onClick={() => setSelectedRole("student")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">I'm a Student</CardTitle>
              <CardDescription>Learn from expert AI replicas</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Access expert knowledge
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Chat with AI mentors
                </li>
                <li className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Mint lesson NFTs
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4 font-medium">
                * No registration required
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleContinue}
            disabled={!selectedRole}
            size="lg"
            className="w-full max-w-xs"
          >
            Continue as {selectedRole === "sensei" ? "Sensei" : "Student"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
