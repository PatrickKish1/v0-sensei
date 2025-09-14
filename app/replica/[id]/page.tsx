"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Brain, 
  Users, 
  MessageCircle, 
  BookOpen, 
  Coins, 
  Settings,
  Star,
  Clock,
  Calendar,
  TrendingUp,
  Edit,
  Play,
  Pause,
  Trash2,
  Plus,
  Search,
  Filter,
  Wallet
} from "lucide-react"
import { useAccount } from "wagmi"
import { ConnectWallet, WalletDropdown } from "@coinbase/onchainkit/wallet"
import { EthBalance, Name } from "@coinbase/onchainkit/identity"
import { Badge } from "@/components/ui/badge"
// import { Badge } from "@coinbase/onchainkit/identity"


// Mock data for demo purposes
const mockReplica = {
  id: "1",
  name: "Albert Einstein",
  avatar: "/avatars/einstein.jpg",
  bio: "Renowned physicist and Nobel laureate, specializing in theoretical physics, relativity, and quantum mechanics. Available to help students and researchers understand complex scientific concepts.",
  expertise: ["Physics", "Relativity", "Quantum Mechanics", "Mathematics"],
  status: "active",
  rating: 4.9,
  totalSessions: 127,
  totalEarnings: 2500,
  hourlyRate: 0.05,
  availability: "24/7",
  trainingProgress: 95,
  content: [
    {
      id: "1",
      title: "Special Theory of Relativity",
      type: "document",
      size: "2.4 MB",
      uploadedAt: "2024-01-15"
    },
    {
      id: "2", 
      title: "Quantum Physics Lecture",
      type: "video",
      size: "45.2 MB",
      uploadedAt: "2024-01-20"
    }
  ],
  analytics: {
    totalUsers: 89,
    averageSessionLength: "45 min",
    satisfactionRate: 96,
    monthlyGrowth: 12
  },
  pricing: 0.05,
  schedule: [
    {
      id: "1",
      date: "2024-02-15",
      time: "14:00",
      duration: "60 min",
      user: "John Doe",
      status: "confirmed"
    }
  ]
}

export default function ReplicaDetailPage() {
  const params = useParams()
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)

  const replicaId = params.id as string

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this replica? This action cannot be undone.")) {
      console.log("Deleting replica:", replicaId)
      // In real app, this would call the smart contract
    }
  }

  const handleToggleStatus = () => {
    console.log("Toggling replica status")
    // In real app, this would call the smart contract
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back Button and Logo */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Replica Details</span>
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
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Replica Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Replica Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage src={mockReplica.avatar} alt={mockReplica.name} />
                <AvatarFallback className="text-2xl sm:text-3xl">{mockReplica.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{mockReplica.name}</h1>
                  <Badge variant={mockReplica.status === "active" ? "default" : "secondary"}>
                    {mockReplica.status}
                  </Badge>
                </div>
                
                <p className="text-gray-600 max-w-2xl">{mockReplica.bio}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{mockReplica.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{mockReplica.totalSessions} sessions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4" />
                    <span>{mockReplica.totalEarnings} ETH earned</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button onClick={handleEdit} variant="outline" className="w-full sm:w-auto">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                onClick={handleToggleStatus} 
                variant={mockReplica.status === "active" ? "outline" : "default"}
                className="w-full sm:w-auto"
              >
                {mockReplica.status === "active" ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
              <Button onClick={handleDelete} variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden lg:block mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content & Training</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Training Progress</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockReplica.trainingProgress}%</div>
                <Progress value={mockReplica.trainingProgress} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">AI training completion</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockReplica.totalSessions}</div>
                <p className="text-xs text-muted-foreground">Completed interactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockReplica.totalEarnings} ETH</div>
                <p className="text-xs text-muted-foreground">Lifetime revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hourly Rate</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockReplica.hourlyRate} ETH</div>
                <p className="text-xs text-muted-foreground">Per session hour</p>
              </CardContent>
            </Card>
          </div>

          {/* Expertise & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Expertise Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockReplica.expertise.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Availability & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={mockReplica.status === "active" ? "default" : "secondary"}>
                    {mockReplica.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Availability:</span>
                  <span className="text-sm font-medium">{mockReplica.availability}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hourly Rate:</span>
                  <span className="text-sm font-medium">{mockReplica.pricing} ETH</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Content Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Content & Training</h2>
              <p className="text-gray-600">Manage your replica's training materials and knowledge base</p>
            </div>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Upload Content
            </Button>
          </div>

          {/* Training Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Training Progress</CardTitle>
              <CardDescription>AI model training status and completion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{mockReplica.trainingProgress}%</span>
              </div>
              <Progress value={mockReplica.trainingProgress} className="h-3" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-green-600">✓ Documents</div>
                  <div className="text-gray-500">Processed</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-600">🔄 Training</div>
                  <div className="text-gray-500">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-400">⏳ Validation</div>
                  <div className="text-gray-500">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Library */}
          <Card>
            <CardHeader>
              <CardTitle>Content Library</CardTitle>
              <CardDescription>Uploaded training materials and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockReplica.content.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">
                          {item.type} • {item.size} • {item.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Management</CardTitle>
              <CardDescription>Manage your replica's availability and bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">Schedule management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Replica Settings</CardTitle>
              <CardDescription>Configure your replica's behavior and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">Settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </main>
    </div>
  )
}
