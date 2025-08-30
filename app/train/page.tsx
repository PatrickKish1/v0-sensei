"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContentQualityAnalyzer } from "@/components/content-quality-analyzer"

export default function TrainPage() {
  const [files, setFiles] = useState<any[]>([])
  const [contentAnalysis, setContentAnalysis] = useState<any>(null)

  const handleContentAnalysis = (analysis: any) => {
    setContentAnalysis(analysis)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload Content</TabsTrigger>
            <TabsTrigger value="analyze">Quality Analysis</TabsTrigger>
            <TabsTrigger value="configure">Configure AI</TabsTrigger>
            <TabsTrigger value="preview">Preview & Test</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6"></TabsContent>

          <TabsContent value="analyze" className="space-y-6">
            <ContentQualityAnalyzer
              files={files.map((f) => new File([], f.name))}
              onAnalysisComplete={handleContentAnalysis}
            />

            {contentAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Training Optimization</CardTitle>
                  <CardDescription>
                    Based on your content analysis, here's how to improve your AI persona
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{contentAnalysis.overallScore}%</div>
                      <div className="text-sm text-muted-foreground">Content Quality</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {Math.floor(contentAnalysis.overallScore * 0.8)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Expected Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {Math.floor(contentAnalysis.overallScore * 0.9)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Training Efficiency</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="configure" className="space-y-6"></TabsContent>

          <TabsContent value="preview" className="space-y-6"></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
