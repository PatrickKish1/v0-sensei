"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Brain, User, Settings, Upload, Star, MessageCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    expertise: [] as string[],
    isExpert: false,
  })

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    setFormData({
      name: user.name || "",
      bio: user.bio || "",
      expertise: user.expertise || [],
      isExpert: user.isExpert || false,
    })
  }, [user, router])

  if (!user) {
    return null
  }

  const handleSave = async () => {
    await updateProfile(formData)
    setIsEditing(false)
  }

  const addExpertise = (skill: string) => {
    if (skill && !formData.expertise.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        expertise: [...prev.expertise, skill],
      }))
    }
  }

  const removeExpertise = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((s) => s !== skill),
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/")}>
              <Brain className="h-6 w-6 text-primary mr-2" />
              Sensei
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>/</span>
              <User className="h-4 w-4" />
              <span>Profile</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || user.walletAddress} />
                  <AvatarFallback className="text-2xl">
                    {user.name ? user.name[0] : user.walletAddress.slice(2, 4)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl">{user.name || "Anonymous User"}</CardTitle>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                      className="gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                  </div>
                  <p className="text-muted-foreground font-mono mb-2">
                    {user.ensName || `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                  </p>
                  <p className="text-muted-foreground mb-4">{user.bio || "No bio provided"}</p>
                  <div className="flex flex-wrap gap-2">
                    {user.expertise?.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {user.isExpert && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Star className="h-3 w-3 mr-1" />
                        Expert
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Edit Profile Form */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information and expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                                  <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your display name"
                />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell others about yourself..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expertise</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.expertise.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeExpertise(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add expertise (e.g., AI, Blockchain)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addExpertise(e.currentTarget.value)
                          e.currentTarget.value = ""
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        addExpertise(input.value)
                        input.value = ""
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isExpert"
                    checked={formData.isExpert}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isExpert: checked }))}
                  />
                  <Label htmlFor="isExpert">I want to share my expertise as an AI replica</Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats & Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sessions Completed</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Knowledge Shared</span>
                    <span className="font-semibold">0 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-semibold">{user.joinedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  AI Replica Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.isExpert ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Replica Active</span>
                    </div>
                    <Button className="w-full bg-transparent" variant="outline">
                      Manage Replica
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Create your AI replica to start sharing knowledge and earning revenue.
                    </p>
                    <Button className="w-full">Create AI Replica</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
