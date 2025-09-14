"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Wallet, 
  WalletDropdown, 
  Name, 
  Address, 
  EthBalance, 
  Avatar as CoinbaseAvatar,
  ConnectWallet
} from "@coinbase/onchainkit/wallet"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Globe, 
  User, 
  Edit3, 
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from "lucide-react"

// Mock data for demo purposes
const mockENSNames = [
  {
    id: "1",
    name: "alex.sensei",
    address: "0x1234...5678",
    owner: "0x1234...5678",
    registrationDate: "2024-01-15",
    expirationDate: "2025-01-15",
    status: "active",
    avatar: "/avatars/alex.jpg",
    description: "AI Sensei persona for Alex Johnson"
  },
  {
    id: "2",
    name: "einstein.ai",
    address: "0x8765...4321",
    owner: "0x8765...4321",
    registrationDate: "2024-01-20",
    expirationDate: "2025-01-20",
    status: "active",
    avatar: "/avatars/einstein.jpg",
    description: "Albert Einstein AI replica persona"
  }
]

const mockSuggestions = [
  "alex.sensei",
  "alex.ai",
  "alex.johnson",
  "alex.ml",
  "alex.blockchain"
]

export default function ENSPage() {
  const { isConnected } = useMiniKit()
  const [activeTab, setActiveTab] = useState("registration")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedName, setSelectedName] = useState("")

  const handleSearch = () => {
    console.log("Searching for:", searchQuery)
    // In real app, this would call the ENS service
  }

  const handleRegister = () => {
    if (!selectedName) return
    console.log("Registering ENS name:", selectedName)
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
              <span className="text-lg font-bold text-gray-900">ENS Management</span>
            </div>
            
            {/* Wallet Connection */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <WalletDropdown>
                  <Wallet className="h-9 w-auto px-3 py-2 text-sm">
                    <CoinbaseAvatar className="h-6 w-6" />
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
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            ENS Name Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Register and manage unique ENS names for your AI personas and profiles on the blockchain
          </p>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="registration">Registration</TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden lg:block mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="registration">ENS Registration</TabsTrigger>
              <TabsTrigger value="management">Name Management</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <TabsContent value="registration" className="space-y-6">
          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Register New ENS Name
              </CardTitle>
              <CardDescription>
                Search for and register a unique ENS name for your AI persona
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Section */}
              <div className="space-y-4">
                <Label htmlFor="ens-search">Search ENS Name</Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="ens-search"
                      placeholder="Enter desired ENS name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                  <Button onClick={handleSearch} className="w-full sm:w-auto h-12 px-6">
                    Search
                  </Button>
                </div>
              </div>

              {/* Name Suggestions */}
              {searchQuery && (
                <div className="space-y-3">
                  <Label>Available Names</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mockSuggestions.map((name) => (
                      <div
                        key={name}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedName === name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedName(name)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{name}</span>
                          {selectedName === name && (
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Available</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registration Action */}
              {selectedName && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Ready to Register</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        You've selected <strong>{selectedName}</strong> for registration.
                      </p>
                      <div className="mt-3">
                        <Button onClick={handleRegister} className="w-full sm:w-auto">
                          <Plus className="h-4 w-4 mr-2" />
                          Register {selectedName}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ENS Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Why Register an ENS Name?</CardTitle>
              <CardDescription>
                Benefits of having a unique ENS name for your AI persona
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Unique Identity</h4>
                  <p className="text-sm text-gray-600">
                    Stand out with a memorable, human-readable name
                  </p>
                </div>
                
                <div className="text-center p-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Brand Recognition</h4>
                  <p className="text-sm text-gray-600">
                    Build your AI persona's brand and reputation
                  </p>
                </div>
                
                <div className="text-center p-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Verification</h4>
                  <p className="text-sm text-gray-600">
                    Prove ownership and authenticity on-chain
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          {/* ENS Names List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Your ENS Names
              </CardTitle>
              <CardDescription>
                Manage your registered ENS names and profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockENSNames.length === 0 ? (
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No ENS Names Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Register your first ENS name to get started
                  </p>
                  <Button onClick={() => setActiveTab("registration")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Register ENS Name
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockENSNames.map((ensName) => (
                    <div key={ensName.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={ensName.avatar} alt={ensName.name} />
                          <AvatarFallback>{ensName.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{ensName.name}</h4>
                            <Badge variant={ensName.status === "active" ? "default" : "secondary"}>
                              {ensName.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{ensName.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>Expires: {ensName.expirationDate}</span>
                            <span>Owner: {ensName.owner}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ENS Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>ENS Statistics</CardTitle>
              <CardDescription>Overview of your ENS portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-blue-600">{mockENSNames.length}</div>
                  <div className="text-sm text-gray-600">Total Names</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {mockENSNames.filter(n => n.status === "active").length}
                  </div>
                  <div className="text-sm text-gray-600">Active Names</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-purple-600">365</div>
                  <div className="text-sm text-gray-600">Days Until Renewal</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </main>
    </div>
  )
}
