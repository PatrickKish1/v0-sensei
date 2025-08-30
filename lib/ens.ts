import type { ethers } from "ethers"

export interface ENSRegistration {
  name: string
  address: string
  owner: string
  registrationDate: Date
  expirationDate: Date
  status: "available" | "registered" | "pending" | "expired"
}

export class ENSService {
  private provider: ethers.Provider | null = null

  constructor() {
    // Initialize with mock provider for development
    // In production, this would connect to actual ENS contracts
  }

  async checkAvailability(name: string): Promise<boolean> {
    // Mock implementation - in production would check actual ENS registry
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate some names being taken
    const takenNames = ["john", "jane", "expert", "ai", "sensei"]
    return !takenNames.includes(name.toLowerCase())
  }

  async suggestNames(baseName: string, expertise: string[]): Promise<string[]> {
    const suggestions = [
      `${baseName}-sensei`,
      `${baseName}-expert`,
      `${baseName}-ai`,
      `${expertise[0]?.toLowerCase()}-${baseName}`,
      `${baseName}-${expertise[0]?.toLowerCase()}`,
      `${baseName}${Math.floor(Math.random() * 999)}`,
    ].filter(Boolean)

    return suggestions.slice(0, 5)
  }

  async registerENS(name: string, ownerAddress: string, replicaId: string): Promise<ENSRegistration> {
    // Mock registration process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const registration: ENSRegistration = {
      name: `${name}.eth`,
      address: ownerAddress,
      owner: ownerAddress,
      registrationDate: new Date(),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      status: "registered",
    }

    // Store the registration (in production, this would be on-chain)
    localStorage.setItem(`ens-${replicaId}`, JSON.stringify(registration))

    return registration
  }

  async getRegistration(replicaId: string): Promise<ENSRegistration | null> {
    const stored = localStorage.getItem(`ens-${replicaId}`)
    return stored ? JSON.parse(stored) : null
  }

  async resolveENS(ensName: string): Promise<string | null> {
    // Mock ENS resolution
    await new Promise((resolve) => setTimeout(resolve, 500))

    // In production, would resolve actual ENS name to address
    return "0x" + Math.random().toString(16).substr(2, 40)
  }

  formatENSName(name: string): string {
    return name.endsWith(".eth") ? name : `${name}.eth`
  }

  validateENSName(name: string): { valid: boolean; error?: string } {
    if (!name || name.length < 3) {
      return { valid: false, error: "Name must be at least 3 characters" }
    }

    if (name.length > 63) {
      return { valid: false, error: "Name must be less than 64 characters" }
    }

    if (!/^[a-z0-9-]+$/.test(name)) {
      return { valid: false, error: "Name can only contain lowercase letters, numbers, and hyphens" }
    }

    if (name.startsWith("-") || name.endsWith("-")) {
      return { valid: false, error: "Name cannot start or end with a hyphen" }
    }

    return { valid: true }
  }
}

export const ensService = new ENSService()
