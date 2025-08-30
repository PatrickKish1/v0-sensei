"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Lightbulb, FileText } from "lucide-react"

interface ContentQualityProps {
  files: File[]
  onAnalysisComplete: (analysis: any) => void
}

export function ContentQualityAnalyzer({ files, onAnalysisComplete }: ContentQualityProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const analyzeContent = async () => {
    setIsAnalyzing(true)
    try {
      // Mock analysis for development
      const mockAnalysis = {
        overallScore: 87,
        recommendations: [
          "Add more video content to improve engagement",
          "Include specific case studies in your documents",
          "Consider adding audio explanations for complex topics",
        ],
        fileAnalysis: files.map((file) => ({
          filename: file.name,
          score: Math.floor(Math.random() * 30) + 70,
          issues: Math.random() > 0.7 ? ["Low text density", "Missing metadata"] : [],
        })),
      }

      // Simulate analysis time
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setAnalysis(mockAnalysis)
      onAnalysisComplete(mockAnalysis)
    } catch (error) {
      console.error("Error analyzing content:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "default"
    if (score >= 70) return "secondary"
    return "destructive"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Quality Analysis
        </CardTitle>
        <CardDescription>Analyze your training content to optimize AI persona performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <div className="text-center py-6">
            <Button onClick={analyzeContent} disabled={isAnalyzing || files.length === 0} className="w-full">
              {isAnalyzing ? "Analyzing Content..." : "Analyze Content Quality"}
            </Button>
            {files.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">Upload files first to analyze content quality</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}%
              </div>
              <p className="text-sm text-muted-foreground">Overall Content Quality</p>
              <Badge variant={getScoreBadge(analysis.overallScore)} className="mt-2">
                {analysis.overallScore >= 90 ? "Excellent" : analysis.overallScore >= 70 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Recommendations
              </h4>
              {analysis.recommendations.map((rec: string, index: number) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{rec}</AlertDescription>
                </Alert>
              ))}
            </div>

            {/* File Analysis */}
            <div className="space-y-2">
              <h4 className="font-medium">File Analysis</h4>
              <div className="space-y-2">
                {analysis.fileAnalysis.map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{file.filename}</p>
                      {file.issues.length > 0 && (
                        <p className="text-xs text-muted-foreground">Issues: {file.issues.join(", ")}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getScoreColor(file.score)}`}>{file.score}%</span>
                      {file.score >= 80 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => setAnalysis(null)} variant="outline" className="w-full">
              Analyze Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
