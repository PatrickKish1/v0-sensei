"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useReplica } from "@/lib/replica"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Brain, ArrowLeft, ArrowRight, Upload, DollarSign, Clock, CheckCircle } from "lucide-react"
import { ENSRegistration } from "@/components/ens/ens-registration"
import type { ENSRegistration as ENSRegistrationType } from "@/lib/ens"

const steps = [
  { number: 1, title: "Basic Info", description: "Name and describe your replica" },
  { number: 2, title: "Expertise", description: "Areas of knowledge" },
  { number: 3, title: "Personality", description: "AI behavior settings" },
  { number: 4, title: "ENS Name", description: "Blockchain identity" },
  { number: 5, title: "Pricing", description: "Set your session rates" },
  { number: 6, title: "Availability", description: "Configure your schedule" },
  { number: 7, title: "Content", description: "Upload training materials" },
  { number: 8, title: "Review", description: "Review and create" },
]

export default function CreateReplicaPage() {
  const { user } = useAuth()
  const { createReplica } = useReplica()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)

  const [replicaData, setReplicaData] = useState({
    name: "",
    description: "",
    expertise: [] as string[],
    personality: "professional",
    responseStyle: "detailed",
    availability: "always",
    pricing: 10,
    greeting: "Hello! I'm here to help you learn and grow.",
    purpose: "To share knowledge and expertise in a helpful and engaging way.",
    ensRegistration: null as ENSRegistrationType | null,
    files: [] as File[],
  })

  if (!user) {
    router.push("/")
    return null
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const replica = await createReplica(replicaData)
      router.push(`/replica/${replica.id}`)
    } catch (error) {
      console.error("Failed to create replica:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setReplicaData((prev) => ({ ...prev, files: [...prev.files, ...files] }))
  }

  const removeFile = (index: number) => {
    setReplicaData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }

  const handleENSRegistration = (ensName: string) => {
    // Create a mock ENS registration object since we only get the name
    const mockRegistration: ENSRegistrationType = {
      name: ensName,
      address: "0x...", // Will be filled when actually registered
      owner: "0x...",
      registrationDate: new Date(),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: "pending"
    }
    setReplicaData((prev) => ({ ...prev, ensRegistration: mockRegistration }))
    setCurrentStep(5) // Move to pricing step
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Replica Name</Label>
              <Input
                id="name"
                value={replicaData.name}
                onChange={(e) => setReplicaData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Dr. Sarah's AI Assistant"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={replicaData.description}
                onChange={(e) => setReplicaData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your expertise and what learners can expect..."
                rows={4}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="expertise">Expertise Areas</Label>
              <Input
                id="expertise"
                value={replicaData.expertise.join(", ")}
                onChange={(e) =>
                  setReplicaData((prev) => ({ ...prev, expertise: e.target.value.split(", ").filter(Boolean) }))
                }
                placeholder="e.g., Medicine, Psychology"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="personality">Personality</Label>
              <Select
                value={replicaData.personality}
                onValueChange={(value) =>
                  setReplicaData((prev) => ({
                    ...prev,
                    personality: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="serious">Serious</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responseStyle">Response Style</Label>
              <Select
                value={replicaData.responseStyle}
                onValueChange={(value) =>
                  setReplicaData((prev) => ({
                    ...prev,
                    responseStyle: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 4:
        return (
          <ENSRegistration
            aiPersonaId={`replica-${Date.now()}`}
            personaName={replicaData.name}
            onRegistrationComplete={handleENSRegistration}
          />
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Session</Label>
              <Input
                id="price"
                type="number"
                value={replicaData.pricing}
                onChange={(e) =>
                  setReplicaData((prev) => ({
                    ...prev,
                    pricing: Number(e.target.value),
                  }))
                }
                placeholder="10"
              />
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Recommended pricing for your expertise level: $30-100 USD per session
              </p>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={replicaData.availability}
                onValueChange={(value) =>
                  setReplicaData((prev) => ({
                    ...prev,
                    availability: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="GMT">GMT</SelectItem>
                  <SelectItem value="24/7">24/7 Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Upload Training Content</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload documents, videos, or audio files to train your AI replica
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.mp4,.mp3,.wav"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild variant="outline">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
              </div>
            </div>

            {replicaData.files.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                <div className="space-y-2">
                  {replicaData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Replica Details</h4>
                <p>
                  <strong>Name:</strong> {replicaData.name}
                </p>
                <p>
                  <strong>Description:</strong> {replicaData.description}
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Expertise & Personality</h4>
                <p>
                  <strong>Expertise:</strong> {replicaData.expertise.join(", ")}
                </p>
                <p>
                  <strong>Personality:</strong> {replicaData.personality}
                </p>
                <p>
                  <strong>Response Style:</strong> {replicaData.responseStyle}
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Pricing & Availability</h4>
                <p>
                  <strong>Price:</strong> {replicaData.pricing} USD per session
                </p>
                <p>
                  <strong>Availability:</strong> {replicaData.availability}
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Training Content</h4>
                <p>{replicaData.files.length} files uploaded</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-semibold">Create AI Replica</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Create Your AI Replica</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="mb-4" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {steps.map((step) => (
              <div key={step.number} className={`text-center ${currentStep >= step.number ? "text-primary" : ""}`}>
                <div className="font-medium">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <Brain className="h-5 w-5" />}
              {currentStep === 2 && <Brain className="h-5 w-5" />}
              {currentStep === 3 && <Brain className="h-5 w-5" />}
              {currentStep === 4 && <Brain className="h-5 w-5" />}
              {currentStep === 5 && <DollarSign className="h-5 w-5" />}
              {currentStep === 6 && <Clock className="h-5 w-5" />}
              {currentStep === 7 && <Upload className="h-5 w-5" />}
              {currentStep === 8 && <CheckCircle className="h-5 w-5" />}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !replicaData.name) ||
                (currentStep === 2 && replicaData.expertise.length === 0) ||
                (currentStep === 4 && !replicaData.ensRegistration)
              }
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Replica"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
