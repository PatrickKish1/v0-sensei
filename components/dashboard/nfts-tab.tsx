"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Coins, 
  Search, 
  BookOpen,
  Plus,
  RefreshCw,
  Star,
  Clock,
  User,
  TrendingUp
} from "lucide-react"
import { useLessonNFT, useSenseiToken } from "@/contract/gatewayintegration"
import { useAccount } from "wagmi"

interface LessonNFT {
  id: string
  title: string
  sensei: string
  senseiAddress: string
  category: string
  price: string
  duration: string
  description: string
  thumbnail: string
  totalSupply: number
  minted: number
  owned: number
  quality: number
  isPublicMintable: boolean
  mintPrice: string
}

// Mock data for available lesson NFTs
const mockLessonNFTs: LessonNFT[] = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    sensei: "Dr. Sarah Chen",
    senseiAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c",
    category: "Technology",
    price: "0.05 ETH",
    duration: "2 hours",
    description: "Comprehensive introduction to ML concepts, algorithms, and practical applications in modern AI systems.",
    thumbnail: "/ml-course.jpg",
    totalSupply: 1000,
    minted: 750,
    owned: 0,
    quality: 9,
    isPublicMintable: true,
    mintPrice: "0.025"
  },
  {
    id: "2",
    title: "Smart Contract Security Fundamentals",
    sensei: "Marcus Rodriguez",
    senseiAddress: "0x1234567890123456789012345678901234567890",
    category: "Technology",
    price: "0.08 ETH",
    duration: "3 hours",
    description: "Learn to identify and prevent common smart contract vulnerabilities. Essential for blockchain developers.",
    thumbnail: "/security-course.jpg",
    totalSupply: 500,
    minted: 320,
    owned: 1,
    quality: 10,
    isPublicMintable: true,
    mintPrice: "0.04"
  },
  {
    id: "3",
    title: "Quantum Algorithm Design",
    sensei: "Prof. Elena Volkov",
    senseiAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    category: "Science",
    price: "0.12 ETH",
    duration: "4 hours",
    description: "Advanced course on designing efficient quantum algorithms for solving complex computational problems.",
    thumbnail: "/quantum-course.jpg",
    totalSupply: 200,
    minted: 150,
    owned: 0,
    quality: 10,
    isPublicMintable: true,
    mintPrice: "0.06"
  },
  {
    id: "4",
    title: "Startup Growth Strategies",
    sensei: "David Kim",
    senseiAddress: "0x9876543210987654321098765432109876543210",
    category: "Business",
    price: "0.07 ETH",
    duration: "2.5 hours",
    description: "Proven strategies for scaling startups from MVP to market leadership. Real-world case studies included.",
    thumbnail: "/startup-course.jpg",
    totalSupply: 800,
    minted: 600,
    owned: 0,
    quality: 8,
    isPublicMintable: true,
    mintPrice: "0.035"
  },
  {
    id: "5",
    title: "Advanced React Patterns",
    sensei: "Alex Thompson",
    senseiAddress: "0x5555555555555555555555555555555555555555",
    category: "Technology",
    price: "0.06 ETH",
    duration: "3.5 hours",
    description: "Master advanced React patterns including render props, compound components, and custom hooks.",
    thumbnail: "/react-course.jpg",
    totalSupply: 600,
    minted: 400,
    owned: 0,
    quality: 9,
    isPublicMintable: true,
    mintPrice: "0.03"
  },
  {
    id: "6",
    title: "Digital Marketing Mastery",
    sensei: "Lisa Wang",
    senseiAddress: "0x7777777777777777777777777777777777777777",
    category: "Marketing",
    price: "0.04 ETH",
    duration: "2 hours",
    description: "Complete guide to modern digital marketing strategies, from SEO to social media advertising.",
    thumbnail: "/marketing-course.jpg",
    totalSupply: 1200,
    minted: 900,
    owned: 0,
    quality: 8,
    isPublicMintable: true,
    mintPrice: "0.02"
  }
]

export function NFTsTab() {
  const { address, isConnected } = useAccount()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSort, setSelectedSort] = useState("popular")
  const [nfts, setNfts] = useState<LessonNFT[]>(mockLessonNFTs)
  
  const { mintLessonNFT, isMinting, isMintConfirming } = useLessonNFT()
  const { balance } = useSenseiToken()

  const categories = ["All", "Technology", "Business", "Science", "Marketing", "Design", "Finance"]
  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "quality", label: "Highest Quality" }
  ]

  const filteredAndSortedNFTs = nfts
    .filter(nft => {
      const matchesSearch = nft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nft.sensei.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nft.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "All" || nft.category === selectedCategory
      
      return matchesSearch && matchesCategory && nft.isPublicMintable
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "popular":
          return b.minted - a.minted
        case "newest":
          return parseInt(b.id) - parseInt(a.id)
        case "price-low":
          return parseFloat(a.mintPrice) - parseFloat(b.mintPrice)
        case "price-high":
          return parseFloat(b.mintPrice) - parseFloat(a.mintPrice)
        case "quality":
          return b.quality - a.quality
        default:
          return 0
      }
    })

  const handleMintNFT = async (nftId: string) => {
    if (!isConnected) return
    
    try {
      await mintLessonNFT(nftId)
      // Update local state to reflect minting
      setNfts(prev => prev.map(nft => 
        nft.id === nftId 
          ? { ...nft, minted: nft.minted + 1, owned: nft.owned + 1 }
          : nft
      ))
    } catch (error) {
      console.error("Minting failed:", error)
    }
  }

  const canAffordNFT = (mintPrice: string) => {
    const price = parseFloat(mintPrice)
    const userBalance = parseFloat(balance)
    return userBalance >= price
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Wallet Not Connected
            </CardTitle>
            <CardDescription>
              Connect your wallet to view and mint lesson NFTs
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Lesson NFTs</h2>
          <p className="text-muted-foreground">
            Mint lesson NFTs to support senseis and own knowledge certificates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Balance: {parseFloat(balance).toFixed(2)} SENSEI
          </Badge>
          <Badge variant="outline">
            {filteredAndSortedNFTs.length} Available
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search lesson NFTs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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

      {/* NFT Grid */}
      {filteredAndSortedNFTs.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedNFTs.map((nft) => (
            <Card key={nft.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg line-clamp-1">
                  {nft.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  by {nft.sensei}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {nft.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{nft.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{nft.quality}/10</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{nft.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span>{nft.minted} minted</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Supply:</span>
                      <span>{nft.minted}/{nft.totalSupply}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${(nft.minted / nft.totalSupply) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <div className="font-bold text-lg">{nft.mintPrice} SENSEI</div>
                      {nft.owned > 0 && (
                        <div className="text-xs text-green-600">You own {nft.owned}</div>
                      )}
                    </div>
                    <Button 
                      onClick={() => handleMintNFT(nft.id)}
                      disabled={
                        !canAffordNFT(nft.mintPrice) || 
                        isMinting || 
                        isMintConfirming ||
                        nft.minted >= nft.totalSupply
                      }
                      size="sm"
                      className="gap-2"
                    >
                      {isMinting || isMintConfirming ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          {isMinting ? "Minting..." : "Confirming..."}
                        </>
                      ) : nft.minted >= nft.totalSupply ? (
                        "Sold Out"
                      ) : !canAffordNFT(nft.mintPrice) ? (
                        "Insufficient Balance"
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Mint NFT
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Lesson NFTs Found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedCategory !== "All" 
                ? "No NFTs match your current filters" 
                : "No lesson NFTs are currently available for minting"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Marketplace Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {nfts.reduce((acc, nft) => acc + nft.totalSupply, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Supply</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {nfts.reduce((acc, nft) => acc + nft.minted, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Minted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {categories.length - 1}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Array.from(new Set(nfts.map(nft => nft.sensei))).length}
              </div>
              <div className="text-sm text-muted-foreground">Senseis</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
