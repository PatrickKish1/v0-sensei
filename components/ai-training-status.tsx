"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, RefreshCw, Brain, Zap } from "lucide-react"

type TrainingStatus = {
  stage: string
  progress: number
  currentTask: string
  estimatedTime: string
  filesProcessed: number
  totalFiles: number
}

export function AITrainingStatus() {
  const [status, setStatus] = useState<TrainingStatus>({
    stage: "processing",
    progress: 45,
    currentTask: "Analyzing video content and extracting key insights",
    estimatedTime: "12 minutes",
    filesProcessed: 8,
    totalFiles: 15,
  })

  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setStatus((prev) => {
        const newProgress = Math.min(prev.progress + Math.random() * 3, 100)
        let newStage = prev.stage
        let newTask = prev.currentTask

        if (newProgress > 80 && prev.stage === "processing") {
          newStage = "training"
          newTask = "Training AI model with processed knowledge"
        } else if (newProgress > 95 && prev.stage === "training") {
          newStage = "optimizing"
          newTask = "Optimizing response quality and accuracy"
        } else if (newProgress >= 100) {
          newStage = "completed"
          newTask = "AI persona training completed successfully"
          setIsActive(false)
        }

        return {
          ...prev,
          progress: newProgress,
          stage: newStage,
          currentTask: newTask,
          estimatedTime:
            newProgress >= 100 ? "0 minutes" : `${Math.max(1, Math.floor((100 - newProgress) / 5))} minutes`,
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [isActive])

  const getStageIcon = () => {
    switch (status.stage) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <RefreshCw className="h-5 w-5 text-primary animate-spin" />
    }
  }

  const getStageColor = () => {
    switch (status.stage) {
      case "completed":
        return "default"
      case "error":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Training Status</CardTitle>
          </div>
          <Badge variant={getStageColor()} className="capitalize">
            {status.stage}
          </Badge>
        </div>
        <CardDescription>Real-time training progress and status updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.floor(status.progress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${status.progress}%` }}></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {getStageIcon()}
            <div className="flex-1">
              <p className="text-sm font-medium">{status.currentTask}</p>
              <p className="text-xs text-muted-foreground">Estimated time remaining: {status.estimatedTime}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{status.filesProcessed}</div>
              <div className="text-xs text-muted-foreground">Files Processed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">{status.totalFiles}</div>
              <div className="text-xs text-muted-foreground">Total Files</div>
            </div>
          </div>
        </div>

        {status.stage === "completed" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Training Completed Successfully!</span>
            </div>
            <p className="text-xs text-green-700 mb-3">
              Your AI persona is now ready to interact with users and share your knowledge.
            </p>
            <Button size="sm" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Deploy AI Persona
            </Button>
          </div>
        )}

        {status.stage === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Training Error</span>
            </div>
            <p className="text-xs text-red-700 mb-3">
              There was an issue processing your content. Please check your files and try again.
            </p>
            <Button size="sm" variant="outline" className="w-full bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Training
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AITrainingStatus
