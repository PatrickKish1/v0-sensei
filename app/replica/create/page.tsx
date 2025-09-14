"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Wallet, 
  WalletDropdown, 
  ConnectWallet
} from "@coinbase/onchainkit/wallet"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { 
  ArrowLeft, 
  ArrowRight, 
  Brain, 
  Upload, 
  User, 
  BookOpen, 
  Coins,
  CheckCircle,
  Circle,
  Plus,
  X
} from "lucide-react"
import { useAccount } from "wagmi"
import { Avatar, EthBalance, Name } from "@coinbase/onchainkit/identity"

// Mock user for demo purposes
const mockUser = {
  name: "Alex Johnson",
  walletAddress: "0x1234...5678",
  avatar: "/avatars/alex.jpg"
}

export default function CreateReplicaPage() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const [currentStep, setCurrentStep] = useState(1)
  const [replicaData, setReplicaData] = useState({
    name: "",
    expertise: "",
    bio: "",
    greeting: "",
    purpose: "",
    hourlyRate: "",
    availability: "",
    contentTypes: [] as string[],
    documents: [] as File[]
  })

  const totalSteps = 4

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setReplicaData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files)
      setReplicaData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newFiles]
      }))
    }
  }

  const removeFile = (index: number) => {
    setReplicaData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  const handleCreate = async () => {
    // Mock creation - in real app, this would call the smart contract
    console.log("Creating replica:", replicaData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Redirect to dashboard
    router.push("/dashboard")
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create AI Replica</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      {/* Mobile Step Indicator */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      </div>

      {/* Desktop Step Indicator */}
      <div className="hidden lg:flex items-center justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
              ${step < currentStep 
                ? 'bg-green-500 border-green-500 text-white' 
                : step === currentStep 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }
            `}>
              {step < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{step}</span>
              )}
            </div>
            {step < totalSteps && (
              <div className={`
                w-16 h-0.5 mx-2 transition-colors
                ${step < currentStep ? 'bg-green-500' : 'bg-gray-300'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="hidden lg:grid grid-cols-4 gap-4 mt-4">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">Basic Info</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">Expertise</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">Content</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">Review</p>
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Start by providing the basic details for your AI replica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Replica Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Albert Einstein, Marie Curie"
                  value={replicaData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Describe your replica's background and expertise..."
                  value={replicaData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="greeting">Welcome Message</Label>
                <Textarea
                  id="greeting"
                  placeholder="How should your replica greet users?"
                  value={replicaData.greeting}
                  onChange={(e) => handleInputChange("greeting", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Expertise & Purpose
              </CardTitle>
              <CardDescription>
                Define what your replica specializes in and how it will help users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="expertise">Primary Expertise</Label>
                <Input
                  id="expertise"
                  placeholder="e.g., Physics, Chemistry, Machine Learning"
                  value={replicaData.expertise}
                  onChange={(e) => handleInputChange("expertise", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose & Goals</Label>
                <Textarea
                  id="purpose"
                  placeholder="What is the main purpose of this replica? How will it help users?"
                  value={replicaData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (ETH)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    placeholder="0.01"
                    value={replicaData.hourlyRate}
                    onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select value={replicaData.availability} onValueChange={(value) => handleInputChange("availability", value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24/7">24/7 Available</SelectItem>
                      <SelectItem value="business-hours">Business Hours</SelectItem>
                      <SelectItem value="weekdays">Weekdays Only</SelectItem>
                      <SelectItem value="custom">Custom Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Content & Training
              </CardTitle>
              <CardDescription>
                Upload documents and content to train your AI replica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Content Types</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["Documents", "Videos", "Audio", "Images"].map((type) => (
                    <Button
                      key={type}
                      variant={replicaData.contentTypes.includes(type.toLowerCase()) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newTypes = replicaData.contentTypes.includes(type.toLowerCase())
                          ? replicaData.contentTypes.filter(t => t !== type.toLowerCase())
                          : [...replicaData.contentTypes, type.toLowerCase()]
                        handleInputChange("contentTypes", newTypes)
                      }}
                      className="h-12"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Documents</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" size="sm" className="cursor-pointer">
                      Choose Files
                    </Button>
                  </label>
                </div>
              </div>

              {replicaData.documents.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files</Label>
                  <div className="space-y-2">
                    {replicaData.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Review & Create
              </CardTitle>
              <CardDescription>
                Review your replica details before creating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{replicaData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expertise:</span>
                      <span className="font-medium">{replicaData.expertise}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hourly Rate:</span>
                      <span className="font-medium">{replicaData.hourlyRate} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Availability:</span>
                      <span className="font-medium">{replicaData.availability}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Content & Training</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Content Types:</span>
                      <span className="font-medium">{replicaData.contentTypes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Documents:</span>
                      <span className="font-medium">{replicaData.documents.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Bio & Purpose</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Bio</Label>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{replicaData.bio}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Purpose</Label>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{replicaData.purpose}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-900">Ready to Create</h5>
                    <p className="text-sm text-blue-700 mt-1">
                      Your AI replica will be created and trained on the blockchain. This process may take a few minutes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Create Replica</span>
            </div>
            
            {/* Wallet Connection */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <WalletDropdown>
                  <Wallet className="h-9 w-auto px-3 py-2 text-sm">
                    <Avatar className="h-6 w-6" />
                    <div className="hidden sm:flex items-center space-x-2">
                      <Name className="text-sm font-medium" />
                      <Badge variant="secondary" className="text-xs">
                        <EthBalance className="text-xs" />
                      </Badge>
                    </div>
                  </Wallet>
                </WalletDropdown>
              ) : (
                <ConnectWallet className="h-9 px-4 text-sm" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {renderStepIndicator()}
        
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2 w-full sm:w-auto">
            {currentStep < totalSteps ? (
              <Button onClick={nextStep} className="w-full sm:w-auto">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreate} 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Brain className="h-4 w-4 mr-2" />
                Create AI Replica
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
