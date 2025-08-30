"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Save, X, Globe, User } from "lucide-react"
import { ensService } from "@/lib/ens"

interface ENSProfile {
  name: string
  address: string
  avatar?: string
  description?: string
  socialLinks?: {
    twitter?: string
    github?: string
    website?: string
  }
}

interface ENSProfileManagerProps {
  ensName: string
  onProfileUpdate?: (profile: ENSProfile) => void
}

export function ENSProfileManager({ ensName, onProfileUpdate }: ENSProfileManagerProps) {
  const [profile, setProfile] = useState<ENSProfile>({
    name: ensName,
    address: "",
    description: "",
    socialLinks: {}
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [ensName])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      // In a real app, you'd fetch the profile from the blockchain or your backend
      const stored = localStorage.getItem(`ens-profile-${ensName}`)
      if (stored) {
        setProfile(JSON.parse(stored))
      } else {
        // Set default profile
        setProfile({
          name: ensName,
          address: "0x...", // Would be resolved from ENS
          description: `AI Persona: ${ensName}`,
          socialLinks: {}
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      // In a real app, you'd update the profile on the blockchain
      localStorage.setItem(`ens-profile-${ensName}`, JSON.stringify(profile))
      setIsEditing(false)
      onProfileUpdate?.(profile)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    loadProfile() // Reset to original values
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                {profile.name}.eth
              </CardTitle>
              <CardDescription>
                {profile.address}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                placeholder="Describe your AI persona..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Social Links</Label>
              <div className="grid grid-cols-1 gap-2">
                <Input
                  placeholder="Twitter username"
                  value={profile.socialLinks?.twitter || ""}
                  onChange={(e) => setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, twitter: e.target.value }
                  })}
                />
                <Input
                  placeholder="GitHub username"
                  value={profile.socialLinks?.github || ""}
                  onChange={(e) => setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, github: e.target.value }
                  })}
                />
                <Input
                  placeholder="Website URL"
                  value={profile.socialLinks?.website || ""}
                  onChange={(e) => setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, website: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.description && (
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{profile.description}</p>
              </div>
            )}

            {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
              <div>
                <Label className="text-sm font-medium">Social Links</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.socialLinks.twitter && (
                    <Badge variant="secondary">
                      Twitter: @{profile.socialLinks.twitter}
                    </Badge>
                  )}
                  {profile.socialLinks.github && (
                    <Badge variant="secondary">
                      GitHub: {profile.socialLinks.github}
                    </Badge>
                  )}
                  {profile.socialLinks.website && (
                    <Badge variant="secondary">
                      Website: {profile.socialLinks.website}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ENSProfileManager
