export interface TrainingProgress {
  personaId: string
  status: "pending" | "processing" | "training" | "completed" | "failed"
  progress: number
  currentStage: string
  estimatedTimeRemaining: string
  filesProcessed: number
  totalFiles: number
  startedAt: Date
  updatedAt: Date
  completedAt?: Date
  error?: string
  stages: {
    name: string
    status: "pending" | "processing" | "completed" | "failed"
    progress: number
    startedAt?: Date
    completedAt?: Date
  }[]
}

export interface TrainingMetrics {
  accuracy: number
  responseTime: number
  userSatisfaction: number
  knowledgeRetention: number
  consistency: number
}

export interface TrainingConfig {
  modelType: "gpt-4" | "claude-3" | "custom"
  learningRate: number
  batchSize: number
  epochs: number
  validationSplit: number
  earlyStopping: boolean
  dataAugmentation: boolean
}
