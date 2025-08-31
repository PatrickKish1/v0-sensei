"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Plus, Upload, User, BookOpen, Award } from "lucide-react"

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  expertise: z.array(z.string()).min(1, "Please add at least one expertise"),
  experience: z.string().min(1, "Please select your experience level"),
  linkedIn: z.string().url().optional().or(z.literal("")),
  twitter: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
})

type RegistrationForm = z.infer<typeof registrationSchema>

const categories = [
  "Technology",
  "Business",
  "Finance",
  "Marketing",
  "Design",
  "Science",
  "Education",
  "Healthcare",
  "Arts",
  "Other"
]

const experienceLevels = [
  "1-2 years",
  "3-5 years", 
  "6-10 years",
  "10+ years",
  "Industry Expert"
]

interface SenseiRegistrationModalProps {
  isOpen: boolean
  onComplete: (data: RegistrationForm) => void
  walletAddress: string
}

export function SenseiRegistrationModal({ 
  isOpen, 
  onComplete, 
  walletAddress 
}: SenseiRegistrationModalProps) {
  const [expertiseInput, setExpertiseInput] = useState("")
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      expertise: [],
    },
  })

  const expertise = watch("expertise") || []

  const addExpertise = () => {
    if (expertiseInput.trim() && !expertise.includes(expertiseInput.trim())) {
      const newExpertise = [...expertise, expertiseInput.trim()]
      setValue("expertise", newExpertise)
      setExpertiseInput("")
    }
  }

  const removeExpertise = (item: string) => {
    setValue("expertise", expertise.filter(e => e !== item))
  }

  const nextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ["name", "bio", "category"] as const
      : ["expertise", "experience"] as const
    
    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep(step + 1)
    }
  }

  const onSubmit = (data: RegistrationForm) => {
    onComplete(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Register as Sensei</DialogTitle>
          <DialogDescription className="text-center">
            Complete your profile to start sharing your expertise
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i}
                </div>
                {i < 3 && <div className={`w-8 h-0.5 ${i < step ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio *</Label>
                    <Textarea
                      id="bio"
                      {...register("bio")}
                      placeholder="Tell us about yourself and your expertise..."
                      rows={4}
                    />
                    {errors.bio && (
                      <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Primary Category *</Label>
                    <Select onValueChange={(value) => setValue("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary expertise category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Expertise & Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Areas of Expertise *</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={expertiseInput}
                        onChange={(e) => setExpertiseInput(e.target.value)}
                        placeholder="Add an expertise area"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addExpertise())}
                      />
                      <Button type="button" onClick={addExpertise} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {expertise.map((item) => (
                        <Badge key={item} variant="secondary" className="gap-1">
                          {item}
                          <button
                            type="button"
                            onClick={() => removeExpertise(item)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {errors.expertise && (
                      <p className="text-sm text-destructive mt-1">{errors.expertise.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="experience">Experience Level *</Label>
                    <Select onValueChange={(value) => setValue("experience", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.experience && (
                      <p className="text-sm text-destructive mt-1">{errors.experience.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Social Links (Optional)
                  </CardTitle>
                  <CardDescription>
                    Add your social profiles to build credibility
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                    <Input
                      id="linkedIn"
                      {...register("linkedIn")}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                    {errors.linkedIn && (
                      <p className="text-sm text-destructive mt-1">{errors.linkedIn.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="twitter">Twitter Handle</Label>
                    <Input
                      id="twitter"
                      {...register("twitter")}
                      placeholder="@yourusername"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Personal Website</Label>
                    <Input
                      id="website"
                      {...register("website")}
                      placeholder="https://yourwebsite.com"
                    />
                    {errors.website && (
                      <p className="text-sm text-destructive mt-1">{errors.website.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review & Submit</CardTitle>
                  <CardDescription>
                    Your profile will be reviewed before activation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Connected Wallet: <span className="font-mono">{walletAddress}</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-between">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                Previous
              </Button>
            )}
            <div className="ml-auto">
              {step < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit">
                  Complete Registration
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
