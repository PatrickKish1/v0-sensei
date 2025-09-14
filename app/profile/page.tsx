"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  Twitter, 
  Github, 
  Linkedin,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Camera,
  Shield,
  Key,
  Settings
} from "lucide-react"
import { useAccount } from "wagmi"
import { ConnectWallet, Wallet, WalletDropdown } from "@coinbase/onchainkit/wallet"
import { EthBalance, Name } from "@coinbase/onchainkit/identity"

// Mock user for demo purposes
const mockUser = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  walletAddress: "0x1234...5678",
  avatar: "/avatars/alex.jpg",
  bio: "AI enthusiast and knowledge seeker with expertise in machine learning and blockchain technology. Passionate about building the future of decentralized AI.",
  location: "San Francisco, CA",
  website: "https://alexjohnson.dev",
  social: {
    twitter: "@alexjohnson",
    github: "alexjohnson",
    linkedin: "alexjohnson"
  },
  expertise: ["Machine Learning", "Blockchain", "Web3", "AI Ethics"],
  joinedAt: "January 2024",
  totalReplicas: 3,
  totalEarnings: "2.5 ETH",
  totalSessions: 127
}

export default function ProfilePage() {
  const { isConnected } = useAccount()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: mockUser.name,
    email: mockUser.email,
    bio: mockUser.bio,
    location: mockUser.location,
    website: mockUser.website,
    twitter: mockUser.social.twitter,
    github: mockUser.social.github,
    linkedin: mockUser.social.linkedin
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    console.log("Saving profile:", formData)
    // In real app, this would call the smart contract or API
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: mockUser.name,
      email: mockUser.email,
      bio: mockUser.bio,
      location: mockUser.location,
      website: mockUser.website,
      twitter: mockUser.social.twitter,
      github: mockUser.social.github,
      linkedin: mockUser.social.linkedin
    })
    setIsEditing(false)
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
              <span className="text-lg font-bold text-gray-900">Profile</span>
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
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Profile Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar Section */}
              <div className="relative">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                  <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                  <AvatarFallback className="text-3xl sm:text-4xl">{mockUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Profile Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{mockUser.name}</h1>
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
                
                <p className="text-gray-600 max-w-2xl">{mockUser.bio}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{mockUser.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Joined {mockUser.joinedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 w-full sm:w-auto">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-lg font-bold text-blue-600">{mockUser.totalReplicas}</div>
                <div className="text-xs text-gray-600">Replicas</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-lg font-bold text-green-600">{mockUser.totalEarnings}</div>
                <div className="text-xs text-gray-600">Earned</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-lg font-bold text-purple-600">{mockUser.totalSessions}</div>
                <div className="text-xs text-gray-600">Sessions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Manage your basic profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={!isEditing}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      disabled={!isEditing}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      disabled={!isEditing}
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Links
                </CardTitle>
                <CardDescription>Connect your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="twitter"
                        value={formData.twitter}
                        onChange={(e) => handleInputChange("twitter", e.target.value)}
                        disabled={!isEditing}
                        className="h-11 pl-10"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="github"
                        value={formData.github}
                        onChange={(e) => handleInputChange("github", e.target.value)}
                        disabled={!isEditing}
                        className="h-11 pl-10"
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange("linkedin", e.target.value)}
                      disabled={!isEditing}
                      className="h-11 pl-10"
                      placeholder="username"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expertise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Areas of Expertise
                </CardTitle>
                <CardDescription>Your professional skills and knowledge areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockUser.expertise.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm" className="mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{mockUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{mockUser.walletAddress}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Balance:</span>
                  <span className="text-sm font-medium text-green-600">0.25 ETH</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy & Security
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Key className="h-4 w-4 mr-2" />
                  API Keys
                </Button>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium">{mockUser.joinedAt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Replicas</span>
                  <span className="text-sm font-medium">{mockUser.totalReplicas}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Sessions</span>
                  <span className="text-sm font-medium">{mockUser.totalSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Earnings</span>
                  <span className="text-sm font-medium text-green-600">{mockUser.totalEarnings}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
