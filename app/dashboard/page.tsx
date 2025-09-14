"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { 
  Brain, 
  Users, 
  Coins, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Settings,
  Plus,
  Search,
  Filter,
  Menu,
  X
} from "lucide-react"
import { useAccount } from "wagmi"
import { ConnectWallet, Wallet, WalletDropdown } from "@coinbase/onchainkit/wallet"
import { EthBalance, Name } from "@coinbase/onchainkit/identity"

// Mock data for demo purposes
const mockUser = {
  name: "Alex Johnson",
  walletAddress: "0x1234...5678",
  avatar: "/avatars/alex.jpg",
  bio: "AI enthusiast and knowledge seeker",
  expertise: ["Machine Learning", "Blockchain", "Web3"],
  joinedAt: new Date("2024-01-15")
}

const mockReplicas = [
  {
    id: "1",
    name: "Albert Einstein",
    avatar: "/avatars/einstein.jpg",
    expertise: "Physics & Relativity",
    status: "active",
    rating: 4.9,
    sessions: 127,
    earnings: 2500
  },
  {
    id: "2", 
    name: "Marie Curie",
    avatar: "/avatars/curie.jpg",
    expertise: "Chemistry & Radioactivity",
    status: "active",
    rating: 4.8,
    sessions: 89,
    earnings: 1800
  }
]

const mockNFTs = [
  {
    id: "1",
    name: "Quantum Physics Basics",
    image: "/nfts/quantum.jpg",
    rarity: "rare",
    value: 150
  },
  {
    id: "2",
    name: "Blockchain Fundamentals",
    image: "/nfts/blockchain.jpg", 
    rarity: "common",
    value: 75
  }
]

export default function DashboardPage() {
  const { isConnected } = useAccount()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Content Wrapper */}
      <div className="max-w-sm mx-auto bg-white min-h-screen">
        {/* Mobile-First Header */}
        <header className="w-full px-4 py-3 border-b bg-white">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Dashboard</span>
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
        </header>

        <div className="flex">
          {/* Mobile-First Sidebar */}
          <aside className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("overview")}
              >
                <Brain className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={activeTab === "replicas" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("replicas")}
              >
                <Users className="h-4 w-4 mr-2" />
                My Replicas
              </Button>
              <Button
                variant={activeTab === "nfts" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("nfts")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                NFT Lessons
              </Button>
              <Button
                variant={activeTab === "earnings" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("earnings")}
              >
                <Coins className="h-4 w-4 mr-2" />
                Earnings
              </Button>
              <Button
                variant={activeTab === "schedule" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("schedule")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              <Button
                variant={activeTab === "analytics" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("analytics")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t mt-auto">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                  <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{mockUser.name}</p>
                  <p className="text-xs text-gray-500 truncate">{mockUser.walletAddress}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={toggleSidebar}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 p-4">
            {/* Tab Navigation */}
            <div className="mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="replicas">Replicas</TabsTrigger>
                  <TabsTrigger value="nfts">NFTs</TabsTrigger>
                </TabsList>

                {/* Tab Content */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Replicas</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{mockReplicas.length}</div>
                        <p className="text-xs text-muted-foreground">Active AI replicas</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${mockReplicas.reduce((sum, r) => sum + r.earnings, 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">NFT Collection</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{mockNFTs.length}</div>
                        <p className="text-xs text-muted-foreground">Unique lessons</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{mockReplicas.reduce((sum, r) => sum + r.sessions, 0)}</div>
                        <p className="text-xs text-muted-foreground">Completed sessions</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Your latest interactions and earnings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockReplicas.map((replica) => (
                        <div key={replica.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={replica.avatar} alt={replica.name} />
                            <AvatarFallback>{replica.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{replica.name}</p>
                            <p className="text-xs text-gray-500">{replica.expertise}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">+${replica.earnings}</p>
                            <p className="text-xs text-gray-500">{replica.sessions} sessions</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="replicas" className="space-y-6">
                  {/* Replicas Header */}
                  <div className="flex flex-col justify-between items-start gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">My AI Replicas</h2>
                      <p className="text-gray-600">Manage your AI knowledge replicas</p>
                    </div>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Replica
                    </Button>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex flex-col gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search replicas..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <Button variant="outline" className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>

                  {/* Replicas Grid */}
                  <div className="grid grid-cols-1 gap-6">
                    {mockReplicas.map((replica) => (
                      <Card key={replica.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="text-center">
                          <Avatar className="h-20 w-20 mx-auto mb-4">
                            <AvatarImage src={replica.avatar} alt={replica.name} />
                            <AvatarFallback className="text-2xl">{replica.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <CardTitle className="text-lg">{replica.name}</CardTitle>
                          <CardDescription>{replica.expertise}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Rating:</span>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium">{replica.rating}</span>
                              <span className="text-yellow-500">★</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Sessions:</span>
                            <span className="text-sm font-medium">{replica.sessions}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Earnings:</span>
                            <span className="text-sm font-medium text-green-600">${replica.earnings}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="nfts" className="space-y-6">
                  {/* NFTs Header */}
                  <div className="flex flex-col justify-between items-start gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">NFT Lessons</h2>
                      <p className="text-gray-600">Your collection of unique lesson NFTs</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Browse Marketplace
                    </Button>
                  </div>

                  {/* NFTs Grid */}
                  <div className="grid grid-cols-1 gap-6">
                    {mockNFTs.map((nft) => (
                      <Card key={nft.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="p-0">
                          <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                            <BookOpen className="h-16 w-16 text-blue-600" />
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <CardTitle className="text-lg">{nft.name}</CardTitle>
                            <Badge variant={nft.rarity === "rare" ? "default" : "secondary"}>
                              {nft.rarity}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Value:</span>
                            <span className="text-sm font-medium text-green-600">${nft.value}</span>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <Button variant="outline" size="sm" className="flex-1">
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              Trade
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}