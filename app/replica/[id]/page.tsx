"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { useReplica, type Replica } from "@/lib/replica"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Settings,
  Upload,
  BarChart3,
  MessageCircle,
  Star,
  TrendingUp,
  Users,
  FileText,
  Video,
  Music,
  Trash2,
  Play,
  Pause,
} from "lucide-react"

export default function ReplicaDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { replicas, uploadContent, deleteContent } = useReplica()
  const router = useRouter()
  const [replica, setReplica] = useState<Replica | null>(null)

  useEffect(() => {
    const foundReplica = replicas.find((r) => r.id === params.id)
    if (foundReplica) {
      setReplica(foundReplica)
    } else if (!foundReplica && replicas.length > 0) {
      router.push("/dashboard")
    }
  }, [replicas, params.id, router])

  if (!user || !replica) {
    return null
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await uploadContent(replica.id, files)
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Music className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "training":
        return "bg-yellow-500"
      case "paused":
        return "bg-gray-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={replica.avatar || "/placeholder.svg"} alt={replica.name} />
                  <AvatarFallback>{replica.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold">{replica.name}</h1>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${getStatusColor(replica.status)}`}></div>
                    <span className="text-sm text-muted-foreground capitalize">{replica.status}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              {replica.status === "active" ? (
                <Button variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Activate
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Status Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Training Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{replica.trainingProgress}%</div>
                  <Progress value={replica.trainingProgress} className="mb-2" />
                  <p className="text-xs text-muted-foreground">{replica.content.length} files uploaded</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{replica.analytics.totalSessions}</div>
                  <p className="text-xs text-muted-foreground">+{replica.analytics.monthlyGrowth}% this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${replica.analytics.totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">${replica.pricing.perSession} per session</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{replica.analytics.averageRating || "-"}</div>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-xs text-muted-foreground">{replica.analytics.recentFeedback.length} reviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No sessions yet. Your replica will appear here once activated.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Response Accuracy</span>
                      <span className="font-semibold">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">User Satisfaction</span>
                      <span className="font-semibold">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Knowledge Coverage</span>
                      <span className="font-semibold">{replica.trainingProgress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Training Content
                </CardTitle>
                <CardDescription>
                  Add documents, videos, or audio files to improve your replica's knowledge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">Drag and drop files here, or click to browse</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.mp4,.mp3,.wav"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="content-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="content-upload" className="cursor-pointer">
                      Choose Files
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Content List */}
            <Card>
              <CardHeader>
                <CardTitle>Training Content ({replica.content.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {replica.content.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No content uploaded yet. Add some files to start training your replica.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {replica.content.map((content) => (
                      <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getContentIcon(content.type)}
                          <div>
                            <p className="font-medium">{content.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{(content.size / 1024 / 1024).toFixed(2)} MB</span>
                              <span>•</span>
                              <Badge
                                variant={content.status === "completed" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {content.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteContent(replica.id, content.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Session Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Analytics will appear here once your replica starts receiving sessions.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">User feedback and ratings will be displayed here.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Replica Settings</CardTitle>
                <CardDescription>Configure your replica's behavior and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price per Session</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={replica.pricing.perSession}
                          className="flex-1 px-3 py-2 border rounded-md"
                          readOnly
                        />
                        <div className="px-3 py-2 border rounded-md bg-muted text-sm">{replica.pricing.currency}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Availability</label>
                      <div className="px-3 py-2 border rounded-md bg-muted text-sm">
                        {replica.availability.hours[0]} ({replica.availability.timezone})
                      </div>
                    </div>
                  </div>

                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
