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
  Image, 
  Search, 
  Filter, 
  RefreshCw,
  ExternalLink,
  Calendar,
  User,
  BookOpen,
  Star
} from "lucide-react"
import { useAccount, useReadContract } from "wagmi"
import { LESSON_NFT_ADDRESS, LESSON_NFT_ABI } from "@/contract/abi"

interface OwnedNFT {
  tokenId: string
  metadata: {
    sessionId: bigint
    senseiAddress: string
    studentAddress: string
    subject: string
    lessonTitle: string
    lessonDescription: string
    sessionDuration: bigint
    sessionPrice: bigint
    knowledgeValue: bigint
    mintPrice: bigint
    isMinted: boolean
    mintTimestamp: bigint
    isPublicMintable: boolean
    lessonQuality: bigint
    minter: string
  }
}

export function OwnedNFTsTab() {
  const { address, isConnected } = useAccount()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [ownedNFTs, setOwnedNFTs] = useState<OwnedNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Get user's NFT balance
  const { data: nftBalance, refetch: refetchBalance } = useReadContract({
    address: LESSON_NFT_ADDRESS as `0x${string}`,
    abi: LESSON_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!LESSON_NFT_ADDRESS && isConnected
    }
  })

  // Get user's lesson NFTs (as student)
  const { data: studentNFTIds } = useReadContract({
    address: LESSON_NFT_ADDRESS as `0x${string}`,
    abi: LESSON_NFT_ABI,
    functionName: "getStudentLessonNFTs",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!LESSON_NFT_ADDRESS && isConnected
    }
  })

  // Get user's lesson NFTs (as sensei)
  const { data: senseiNFTIds } = useReadContract({
    address: LESSON_NFT_ADDRESS as `0x${string}`,
    abi: LESSON_NFT_ABI,
    functionName: "getSenseiLessonNFTs",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!LESSON_NFT_ADDRESS && isConnected
    }
  })

  // Fetch NFT metadata for owned NFTs
  useEffect(() => {
    const fetchOwnedNFTs = async () => {
      if (!address || !LESSON_NFT_ADDRESS || (!studentNFTIds && !senseiNFTIds)) return

      setIsLoading(true)
      try {
        const allTokenIds = [
          ...(studentNFTIds as bigint[] || []),
          ...(senseiNFTIds as bigint[] || [])
        ]

        // Remove duplicates
        const uniqueTokenIds = Array.from(new Set(allTokenIds.map(id => id.toString())))

        // For now, we'll create mock data since we can't easily fetch all metadata in this context
        // In a real implementation, you'd batch these calls or use a subgraph
        const mockOwnedNFTs: OwnedNFT[] = uniqueTokenIds.slice(0, 6).map((tokenId, index) => ({
          tokenId,
          metadata: {
            sessionId: BigInt(index + 1),
            senseiAddress: index % 2 === 0 ? address : "0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c",
            studentAddress: index % 2 === 1 ? address : "0x1234567890123456789012345678901234567890",
            subject: ["Technology", "Business", "Science", "Design"][index % 4],
            lessonTitle: [
              "Introduction to Machine Learning",
              "Smart Contract Security",
              "Quantum Computing Basics",
              "UI/UX Design Principles",
              "Blockchain Development",
              "Advanced AI Concepts"
            ][index],
            lessonDescription: `Comprehensive lesson covering key concepts and practical applications in ${["ML", "Security", "Quantum", "Design", "Blockchain", "AI"][index]}.`,
            sessionDuration: BigInt(60 + (index * 30)),
            sessionPrice: BigInt((0.05 + (index * 0.02)) * 1e18),
            knowledgeValue: BigInt(75 + (index * 5)),
            mintPrice: BigInt((0.01 + (index * 0.005)) * 1e18),
            isMinted: true,
            mintTimestamp: BigInt(Date.now() - (index * 86400000)),
            isPublicMintable: index % 3 === 0,
            lessonQuality: BigInt(8 + (index % 3)),
            minter: address
          }
        }))

        setOwnedNFTs(mockOwnedNFTs)
      } catch (error) {
        console.error("Error fetching owned NFTs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOwnedNFTs()
  }, [address, studentNFTIds, senseiNFTIds])

  const filteredNFTs = ownedNFTs.filter(nft => {
    const matchesSearch = nft.metadata.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.metadata.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || nft.metadata.subject === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = ["All", ...Array.from(new Set(ownedNFTs.map(nft => nft.metadata.subject)))]

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp)).toLocaleDateString()
  }

  const formatPrice = (price: bigint) => {
    return (Number(price) / 1e18).toFixed(3)
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Wallet Not Connected
            </CardTitle>
            <CardDescription>
              Connect your wallet to view your owned NFTs
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
          <h2 className="text-2xl font-bold text-foreground">My NFT Collection</h2>
          <p className="text-muted-foreground">
            Your lesson NFTs and knowledge certificates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Total: {nftBalance?.toString() || "0"} NFTs
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchBalance()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search your NFTs..."
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
      </div>

      {/* NFT Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="aspect-video bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredNFTs.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNFTs.map((nft) => (
            <Card key={nft.tokenId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg line-clamp-1">
                  {nft.metadata.lessonTitle}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {nft.metadata.lessonDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{nft.metadata.subject}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{nft.metadata.lessonQuality.toString()}/10</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Duration</div>
                      <div className="font-medium">{nft.metadata.sessionDuration.toString()}min</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Mint Price</div>
                      <div className="font-medium">{formatPrice(nft.metadata.mintPrice)} ETH</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <User className="h-3 w-3" />
                      <span>
                        {nft.metadata.senseiAddress === address ? "You taught this" : "You learned this"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Minted {formatDate(nft.metadata.mintTimestamp)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    {nft.metadata.isPublicMintable && (
                      <Button variant="secondary" size="sm" className="flex-1">
                        Share
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Image className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No NFTs Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || selectedCategory !== "All" 
                ? "No NFTs match your current filters" 
                : "You don't own any lesson NFTs yet"}
            </p>
            {(!searchTerm && selectedCategory === "All") && (
              <Button variant="outline">
                Explore Lesson NFTs
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
