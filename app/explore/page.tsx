"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Brain, Search, Star, MessageCircle, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"

interface AIPersona {
  id: string
  name: string
  ensName: string
  description: string
  expertise: string[]
  rating: number
  totalSessions: number
  pricePerSession: number
  isOnline: boolean
  avatar?: string
}

export default function ExplorePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const personas: AIPersona[] = [
    {
      id: "persona-1",
      name: "Dr. Sarah Chen",
      ensName: "sarahchen.eth",
      description: "Tech executive with 20+ years of experience in AI/ML and team leadership",
      expertise: ["Leadership", "AI/ML", "Product Strategy", "Team Management"],
      rating: 4.9,
      totalSessions: 156,
      pricePerSession: 45,
      isOnline: true,
    },
    {
      id: "persona-2",
      name: "Prof. Michael Rodriguez",
      ensName: "profmike.eth",
      description: "Economics professor and financial advisor specializing in market analysis",
      expertise: ["Economics", "Finance", "Market Analysis", "Investment Strategy"],
      rating: 4.8,
      totalSessions: 203,
      pricePerSession: 35,
      isOnline: true,
    },
    {
      id: "persona-3",
      name: "Chef Isabella Martinez",
      ensName: "chefbella.eth",
      description: "Michelin-starred chef and culinary instructor with expertise in Mediterranean cuisine",
      expertise: ["Culinary Arts", "Mediterranean Cuisine", "Restaurant Management", "Food Science"],
      rating: 4.7,
      totalSessions: 89,
      pricePerSession: 25,
      isOnline: false,
    },
  ]

  const categories = ["All", "Technology", "Business", "Education", "Creative", "Health", "Finance"]

  const filteredPersonas = personas.filter((persona) => {
    const matchesSearch =
      persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.expertise.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesSearch
  })

  const startChat = (personaId: string) => {
    router.push(`/chat/${personaId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Explore AI Personas</h1>
            <p className="text-muted-foreground">Connect with expert AI replicas and learn from their knowledge</p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, expertise, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Found {filteredPersonas.length} AI persona{filteredPersonas.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Persona Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersonas.map((persona) => (
            <Card key={persona.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        <Brain className="h-6 w-6 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{persona.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {persona.ensName}
                      </Badge>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${persona.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                </div>
                <CardDescription className="text-sm">{persona.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-1">
                  {persona.expertise.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {persona.expertise.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{persona.expertise.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-current" />
                      <span className="text-sm font-medium">{persona.rating}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <MessageCircle className="h-3 w-3 text-primary" />
                      <span className="text-sm font-medium">{persona.totalSessions}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Sessions</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-medium">${persona.pricePerSession}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Per session</div>
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full" onClick={() => startChat(persona.id)} disabled={!persona.isOnline}>
                  {persona.isOnline ? (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start Chat
                    </>
                  ) : (
                    "Currently Offline"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPersonas.length === 0 && (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No personas found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or browse different categories</p>
          </div>
        )}
      </div>
    </div>
  )
}
