"use client"

import { useAuth } from "@/components/auth-provider"
import { useReplica } from "@/lib/replica"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AITrainingStatus } from "@/components/ai-training-status"
import { EarningsOverview } from "@/components/payment/earnings-overview"
import { WithdrawalModal } from "@/components/payment/withdrawal-modal"
import { TransactionHistory } from "@/components/payment/transaction-history"
import {
  Brain,
  Upload,
  Users,
  MessageCircle,
  Settings,
  Plus,
  FileText,
  Video,
  Mic,
  DollarSign,
  Star,
  User,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { user } = useAuth()
  const { replicas } = useReplica()
  const router = useRouter()
  const [aiPersonaProgress, setAiPersonaProgress] = useState(65)
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const userReplica = replicas[0] // For demo, assume user has one replica

  const stats = [
    { label: "Total Earnings", value: "$2,450", icon: DollarSign, change: "+12%" },
    { label: "Active Sessions", value: "23", icon: MessageCircle, change: "+5%" },
    { label: "Knowledge Rating", value: "4.8", icon: Star, change: "+0.2" },
    { label: "Followers", value: "156", icon: Users, change: "+8%" },
  ]

  const recentUploads = [
    { name: "Leadership Principles.pdf", type: "document", date: "2 hours ago", status: "processed" },
    { name: "Team Management Video.mp4", type: "video", date: "1 day ago", status: "processing" },
    { name: "Strategy Session Audio.mp3", type: "audio", date: "3 days ago", status: "processed" },
  ]

  const recentSessions = [
    { user: "Alex Chen", topic: "Product Strategy", duration: "45 min", earnings: "$25", rating: 5 },
    { user: "Sarah Kim", topic: "Leadership Tips", duration: "30 min", earnings: "$18", rating: 5 },
    { user: "Mike Johnson", topic: "Team Building", duration: "60 min", earnings: "$35", rating: 4 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/")}>
                <Brain className="h-6 w-6 text-primary mr-2" />
                Sensei
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>/</span>
                <span>Dashboard</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push("/profile")}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
                     <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.name || "User"}!</h1>
          <p className="text-muted-foreground">Manage your AI replica and track your knowledge sharing journey.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* AI Replica Status */}
          <TabsContent value="overview" className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Replica Status
                </CardTitle>
                <CardDescription>
                  {userReplica ? "Manage your AI replica" : "Create your AI replica to start earning"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userReplica ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">{userReplica.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className="capitalize">{userReplica.status}</span> • Training:{" "}
                          {userReplica.trainingProgress}%
                        </p>
                      </div>
                      <div
                        className={`h-3 w-3 rounded-full ${
                          userReplica.status === "active"
                            ? "bg-green-500"
                            : userReplica.status === "training"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                        }`}
                      ></div>
                    </div>
                    <div className="flex gap-4">
                      <Button className="flex-1" onClick={() => router.push(`/replica/${userReplica.id}`)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Replica
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => router.push(`/replica/${userReplica.id}?tab=content`)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Content
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">No AI Replica Yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your AI replica to start sharing your expertise and earning revenue
                    </p>
                    <Button onClick={() => router.push("/replica/create")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create AI Replica
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Uploads</h4>
                  <div className="space-y-2">
                    {recentUploads.map((upload, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {upload.type === "document" ? (
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          ) : upload.type === "video" ? (
                            <Video className="h-6 w-6 text-muted-foreground" />
                          ) : (
                            <Mic className="h-6 w-6 text-muted-foreground" />
                          )}
                          <span>{upload.name}</span>
                        </div>
                        <Badge variant={upload.status === "processed" ? "default" : "secondary"} className="text-xs">
                          {upload.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <h4 className="font-semibold mt-4">Recent Sessions</h4>
                  <div className="space-y-2">
                    {recentSessions.map((session, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-6 w-6 text-muted-foreground" />
                          <span>{session.user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{session.topic}</span>
                          <span>{session.duration}</span>
                          <span>{session.earnings}</span>
                          <Badge variant="default" className="text-xs">
                            {session.rating}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content */}
          <TabsContent value="content" className="lg:col-span-2 space-y-6">
            {/* Content Section */}
          </TabsContent>

          {/* Training */}
          <TabsContent value="training" className="lg:col-span-2 space-y-6">
            <AITrainingStatus />
          </TabsContent>

          {/* Sessions */}
          <TabsContent value="sessions" className="lg:col-span-2 space-y-6">
            {/* Sessions Section */}
          </TabsContent>

          {/* Earnings */}
          <TabsContent value="earnings" className="space-y-6">
            <EarningsOverview userId="current-user-id" onWithdrawClick={() => setIsWithdrawalModalOpen(true)} />
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments" className="space-y-6">
            <TransactionHistory userId="current-user-id" />
          </TabsContent>
        </Tabs>
      </div>

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        userId="current-user-id"
        availableBalance={1890.25}
      />
    </div>
  )
}
