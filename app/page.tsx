import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Brain, Users, Zap, Star, MessageCircle, Upload, Coins } from "lucide-react"
import { WalletConnectButton } from "@/components/auth/wallet-connect-button"

export default function SenseiHomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Sensei</h1>
            </div>
            <div className="flex items-center gap-4">
              <WalletConnectButton />
              <Button size="sm">Create Replica</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Learn from the <span className="text-primary">Greatest Minds</span> of Our Time
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty font-manrope">
            Connect with AI replicas of industry leaders, experts, and visionaries. Share knowledge across generations
            and monetize your expertise.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search for experts, topics, or industries..."
              className="pl-12 py-6 text-lg bg-card border-border"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="lg" className="gap-2">
              <MessageCircle className="h-5 w-5" />
              Start Learning
            </Button>
            <Button variant="outline" size="lg" className="gap-2 bg-transparent">
              <Upload className="h-5 w-5" />
              Create Your Replica
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">How Sensei Works</h3>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Create AI Replica</CardTitle>
                <CardDescription className="font-manrope">
                  Upload documents, videos, and audio to train your personal AI replica
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Connect & Learn</CardTitle>
                <CardDescription className="font-manrope">
                  Interact with AI replicas of experts and industry leaders
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Earn Revenue</CardTitle>
                <CardDescription className="font-manrope">
                  Monetize your knowledge and expertise through your AI replica
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Experts */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-bold text-foreground">Featured Experts</h3>
            <Button variant="outline">View All</Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Dr. Sarah Chen",
                expertise: "AI Research",
                ens: "sarahchen.eth",
                rating: 4.9,
                sessions: 1247,
                avatar: "/professional-woman-scientist.png",
              },
              {
                name: "Marcus Rodriguez",
                expertise: "Blockchain Development",
                ens: "marcusdev.eth",
                rating: 4.8,
                sessions: 892,
                avatar: "/professional-man-developer.png",
              },
              {
                name: "Prof. Elena Volkov",
                expertise: "Quantum Computing",
                ens: "elenavolkov.eth",
                rating: 5.0,
                sessions: 634,
                avatar: "/professional-woman-professor.png",
              },
            ].map((expert, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={expert.avatar || "/placeholder.svg"} alt={expert.name} />
                      <AvatarFallback>
                        {expert.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{expert.name}</CardTitle>
                      <Badge variant="secondary" className="mb-2">
                        {expert.expertise}
                      </Badge>
                      <p className="text-sm text-muted-foreground font-mono">{expert.ens}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{expert.rating}</span>
                    </div>
                    <span>{expert.sessions} sessions</span>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    Chat with Replica
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-bold text-foreground mb-6">Ready to Share Your Knowledge?</h3>
          <p className="text-xl text-muted-foreground mb-8 font-manrope">
            Create your AI replica today and start earning from your expertise while helping others learn.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="gap-2">
              <Zap className="h-5 w-5" />
              Get Started Now
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-bold text-foreground">Sensei</span>
            </div>
            <p className="text-sm text-muted-foreground font-manrope">
              Built on Base • Powered by Sensay AI • ENS Integration
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
