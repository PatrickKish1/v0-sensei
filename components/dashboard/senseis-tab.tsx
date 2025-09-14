"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Users, 
  Search, 
  Star, 
  MessageCircle, 
  BookOpen,
  Clock,
  DollarSign,
  TrendingUp,
  Award,
  RefreshCw
} from "lucide-react"
import { useActiveSenseis } from "@/contract/gatewayintegration"
import { useAccount } from "wagmi"

interface Sensei {
  id: string
  name: string
  walletAddress: string
  category: string
  subcategory: string
  expertise: string[]
  bio: string
  rating: number
  sessions: number
  hourlyRate: string
  avatar: string
  isActive: boolean
  joinedDate: string
  totalEarnings: string
  responseTime: string
  languages: string[]
  verified: boolean
}

// Mock data for senseis with more comprehensive information
const mockSenseis: Sensei[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c",
    category: "Technology",
    subcategory: "AI Research",
    expertise: ["Machine Learning", "Neural Networks", "Computer Vision", "Deep Learning"],
    bio: "Leading AI researcher with 15+ years experience in machine learning and computer vision. Published 50+ papers in top-tier conferences.",
    rating: 4.9,
    sessions: 1247,
    hourlyRate: "0.1 ETH",
    avatar: "/professional-woman-scientist.png",
    isActive: true,
    joinedDate: "2023-01-15",
    totalEarnings: "124.7 ETH",
    responseTime: "< 2 hours",
    languages: ["English", "Mandarin"],
    verified: true
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    walletAddress: "0x1234567890123456789012345678901234567890",
    category: "Technology",
    subcategory: "Blockchain Development",
    expertise: ["Smart Contracts", "DeFi", "Web3", "Solidity", "Security Auditing"],
    bio: "Senior blockchain developer specializing in DeFi protocols and smart contract security. Former lead at ConsenSys.",
    rating: 4.8,
    sessions: 892,
    hourlyRate: "0.08 ETH",
    avatar: "/professional-man-developer.png",
    isActive: true,
    joinedDate: "2023-02-20",
    totalEarnings: "71.4 ETH",
    responseTime: "< 4 hours",
    languages: ["English", "Spanish"],
    verified: true
  },
  {
    id: "3",
    name: "Prof. Elena Volkov",
    walletAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    category: "Science",
    subcategory: "Quantum Computing",
    expertise: ["Quantum Algorithms", "Quantum Cryptography", "Physics", "Mathematics"],
    bio: "Quantum computing pioneer with groundbreaking research in quantum algorithms. MIT professor and quantum startup advisor.",
    rating: 5.0,
    sessions: 634,
    hourlyRate: "0.15 ETH",
    avatar: "/professional-woman-professor.png",
    isActive: true,
    joinedDate: "2023-03-10",
    totalEarnings: "95.1 ETH",
    responseTime: "< 6 hours",
    languages: ["English", "Russian"],
    verified: true
  },
  {
    id: "4",
    name: "David Kim",
    walletAddress: "0x9876543210987654321098765432109876543210",
    category: "Business",
    subcategory: "Entrepreneurship",
    expertise: ["Startups", "Venture Capital", "Strategy", "Product Management"],
    bio: "Serial entrepreneur and VC partner with 20+ successful exits. Former VP at Google, now managing partner at Andreessen Horowitz.",
    rating: 4.7,
    sessions: 1156,
    hourlyRate: "0.12 ETH",
    avatar: "/professional-man-business.png",
    isActive: true,
    joinedDate: "2023-01-25",
    totalEarnings: "138.7 ETH",
    responseTime: "< 12 hours",
    languages: ["English", "Korean"],
    verified: true
  },
  {
    id: "5",
    name: "Alex Thompson",
    walletAddress: "0x5555555555555555555555555555555555555555",
    category: "Technology",
    subcategory: "Frontend Development",
    expertise: ["React", "TypeScript", "Next.js", "UI/UX Design"],
    bio: "Frontend architect at Vercel with expertise in modern React patterns and performance optimization. Creator of popular open-source libraries.",
    rating: 4.6,
    sessions: 743,
    hourlyRate: "0.06 ETH",
    avatar: "/professional-man-developer2.png",
    isActive: true,
    joinedDate: "2023-04-05",
    totalEarnings: "44.6 ETH",
    responseTime: "< 3 hours",
    languages: ["English"],
    verified: true
  },
  {
    id: "6",
    name: "Lisa Wang",
    walletAddress: "0x7777777777777777777777777777777777777777",
    category: "Marketing",
    subcategory: "Digital Marketing",
    expertise: ["SEO", "Content Marketing", "Social Media", "Analytics"],
    bio: "Growth marketing expert who scaled 5 startups from 0 to $100M+ ARR. Former head of growth at Stripe and Airbnb.",
    rating: 4.8,
    sessions: 956,
    hourlyRate: "0.09 ETH",
    avatar: "/professional-woman-marketing.png",
    isActive: true,
    joinedDate: "2023-02-14",
    totalEarnings: "86.0 ETH",
    responseTime: "< 8 hours",
    languages: ["English", "Mandarin"],
    verified: true
  }
]

export function SenseisTab() {
  const { address, isConnected } = useAccount()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSubcategory, setSelectedSubcategory] = useState("All")
  const [selectedSort, setSelectedSort] = useState("rating")
  const [senseis, setSenseis] = useState<Sensei[]>(mockSenseis)

  const { senseiIds, isLoading, refetch } = useActiveSenseis()

  const categories = ["All", "Technology", "Business", "Science", "Marketing", "Finance", "Design"]
  const sortOptions = [
    { value: "rating", label: "Highest Rated" },
    { value: "sessions", label: "Most Sessions" },
    { value: "recent", label: "Recently Joined" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" }
  ]

  const subcategories = selectedCategory === "All" 
    ? ["All"] 
    : ["All", ...Array.from(new Set(senseis
        .filter(s => s.category === selectedCategory)
        .map(s => s.subcategory)))]

  const filteredAndSortedSenseis = senseis
    .filter(sensei => {
      const matchesSearch = sensei.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sensei.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           sensei.bio.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "All" || sensei.category === selectedCategory
      const matchesSubcategory = selectedSubcategory === "All" || sensei.subcategory === selectedSubcategory
      
      return matchesSearch && matchesCategory && matchesSubcategory && sensei.isActive
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "rating":
          return b.rating - a.rating
        case "sessions":
          return b.sessions - a.sessions
        case "recent":
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
        case "price-low":
          return parseFloat(a.hourlyRate) - parseFloat(b.hourlyRate)
        case "price-high":
          return parseFloat(b.hourlyRate) - parseFloat(a.hourlyRate)
        default:
          return 0
      }
    })

  const handleChatWithSensei = (senseiId: string) => {
    // This would integrate with the chat system
    console.log(`Starting chat with sensei ${senseiId}`)
  }

  const handleBookLesson = (senseiId: string) => {
    // This would open a booking modal
    console.log(`Booking lesson with sensei ${senseiId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Senseis</h2>
          <p className="text-muted-foreground">
            Connect with expert senseis and learn from their AI personas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredAndSortedSenseis.length} Available
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search senseis, expertise, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Subcategory" />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSort} onValueChange={setSelectedSort}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Senseis Grid */}
      {filteredAndSortedSenseis.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedSenseis.map((sensei) => (
            <Card key={sensei.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={sensei.avatar || "/placeholder.svg"} alt={sensei.name} />
                      <AvatarFallback>
                        {sensei.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {sensei.verified && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                        <Award className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-1">{sensei.name}</CardTitle>
                    <Badge variant="secondary" className="mb-2">
                      {sensei.subcategory}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{sensei.rating}</span>
                      </div>
                      <span>•</span>
                      <span>{sensei.sessions} sessions</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {sensei.bio}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {sensei.expertise.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {sensei.expertise.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{sensei.expertise.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{sensei.hourlyRate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{sensei.responseTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Languages: {sensei.languages.join(", ")}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => handleChatWithSensei(sensei.id)}
                    className="flex-1"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with AI
                  </Button>
                  <Button 
                    onClick={() => handleBookLesson(sensei.id)}
                    variant="outline" 
                    className="flex-1"
                    size="sm"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Book Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Senseis Found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedCategory !== "All" || selectedSubcategory !== "All"
                ? "No senseis match your current filters" 
                : "No active senseis are currently available"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Platform Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {senseis.filter(s => s.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Senseis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {senseis.reduce((acc, s) => acc + s.sessions, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {categories.length - 1}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(senseis.reduce((acc, s) => acc + s.rating, 0) / senseis.length).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
