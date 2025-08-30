import type { TrainingProgress } from "./TrainingProgress" // Assuming TrainingProgress is a type defined in another file

export class AITrainingService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl = "https://api.glazed.ai") {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  async createPersona(config: any): Promise<{ personaId: string; ensName?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/characters`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: config.name,
          personality: config.personality,
          expertise: config.expertise,
          responseStyle: config.responseStyle,
          knowledgeDepth: config.knowledgeDepth,
          ensIntegration: true, // Enable ENS minting
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create AI persona")
      }

      return response.json()
    } catch (error) {
      console.error("Error creating persona:", error)
      throw error
    }
  }

  async uploadTrainingData(
    personaId: string,
    files: File[],
    onProgress?: (progress: number) => void,
  ): Promise<{ uploadId: string; processedFiles: number }> {
    const batchSize = 5 // Process files in batches
    const results = []

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)
      const formData = new FormData()

      batch.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })
      formData.append("personaId", personaId)
      formData.append("batchIndex", Math.floor(i / batchSize).toString())

      try {
        const response = await fetch(`${this.baseUrl}/characters/${personaId}/train`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload batch ${Math.floor(i / batchSize) + 1}`)
        }

        const result = await response.json()
        results.push(result)

        // Update progress
        if (onProgress) {
          const progress = ((i + batch.length) / files.length) * 100
          onProgress(Math.min(progress, 100))
        }
      } catch (error) {
        console.error(`Error uploading batch ${Math.floor(i / batchSize) + 1}:`, error)
        throw error
      }
    }

    return {
      uploadId: results[0]?.uploadId || `upload_${Date.now()}`,
      processedFiles: results.reduce((acc, r) => acc + (r.processedFiles || 0), 0),
    }
  }

  async getTrainingStatus(personaId: string): Promise<TrainingProgress & { analytics: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/characters/${personaId}/training-status`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to get training status")
      }

      const data = await response.json()
      return {
        ...data,
        analytics: {
          knowledgeExtracted: data.analytics?.knowledgeExtracted || 0,
          conceptsMapped: data.analytics?.conceptsMapped || 0,
          responseAccuracy: data.analytics?.responseAccuracy || 0,
          trainingQuality: data.analytics?.trainingQuality || 0,
        },
      }
    } catch (error) {
      console.error("Error getting training status:", error)
      throw error
    }
  }

  async testPersona(
    personaId: string,
    message: string,
    context?: string,
  ): Promise<{ response: string; confidence: number; sources: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/characters/${personaId}/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          context: context || "test",
          includeMetadata: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to test persona")
      }

      return response.json()
    } catch (error) {
      console.error("Error testing persona:", error)
      throw error
    }
  }

  async deployPersona(
    personaId: string,
    ensName?: string,
  ): Promise<{ deploymentUrl: string; ensName: string; farcasterFrameUrl: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/characters/${personaId}/deploy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: "farcaster",
          baseMinikit: true,
          ensName: ensName,
          mintENS: !ensName, // Only mint if not provided
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to deploy persona")
      }

      return response.json()
    } catch (error) {
      console.error("Error deploying persona:", error)
      throw error
    }
  }

  async analyzeContentQuality(files: File[]): Promise<{
    overallScore: number
    recommendations: string[]
    fileAnalysis: Array<{ filename: string; score: number; issues: string[] }>
  }> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file)
    })

    try {
      const response = await fetch(`${this.baseUrl}/analyze/content-quality`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to analyze content quality")
      }

      return response.json()
    } catch (error) {
      console.error("Error analyzing content quality:", error)
      // Return mock data for development
      return {
        overallScore: 85,
        recommendations: [
          "Add more diverse content types for better training",
          "Include more specific examples in your expertise areas",
          "Consider adding video content for better engagement",
        ],
        fileAnalysis: files.map((file) => ({
          filename: file.name,
          score: Math.floor(Math.random() * 30) + 70,
          issues: [],
        })),
      }
    }
  }
}
