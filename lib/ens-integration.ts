import { createPublicClient, createWalletClient, http, custom } from "viem"
import { mainnet } from "viem/chains"
import { addEnsContracts } from "@ensdomains/ensjs"
import { getEnsName, getEnsAvatar } from "viem/ens"

interface ENSRegistrationData {
  name: string
  owner: string
  duration: number
  secret: string
  resolver?: string
  reverseRecord?: boolean
}

interface ENSCommitment {
  commitment: string
  name: string
  owner: string
  duration: number
  secret: string
}

export class ENSService {
  private publicClient: any
  private walletClient: any

  constructor() {
    const mainnetWithEns = addEnsContracts(mainnet)

    this.publicClient = createPublicClient({
      chain: mainnetWithEns,
      transport: http(),
    })
  }

  async initWalletClient() {
    if (typeof window !== "undefined" && window.ethereum) {
      const mainnetWithEns = addEnsContracts(mainnet)
      this.walletClient = createWalletClient({
        chain: mainnetWithEns,
        transport: custom(window.ethereum),
      })
    }
  }

  // Check if a name is available
  async isNameAvailable(name: string): Promise<boolean> {
    try {
      const label = name.replace(".eth", "")

      // Call the ETHRegistrarController's available function
      const available = await this.publicClient.readContract({
        address: "0x253553366Da8546fC250F225fe3d25d0C782303b", // ETHRegistrarController address
        abi: [
          {
            inputs: [{ name: "name", type: "string" }],
            name: "available",
            outputs: [{ name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "available",
        args: [label],
      })

      return available as boolean
    } catch (error) {
      console.error("Error checking name availability:", error)
      return false
    }
  }

  // Get rent price for a name
  async getRentPrice(name: string, duration: number): Promise<bigint> {
    try {
      const label = name.replace(".eth", "")

      const price = await this.publicClient.readContract({
        address: "0x253553366Da8546fC250F225fe3d25d0C782303b",
        abi: [
          {
            inputs: [
              { name: "name", type: "string" },
              { name: "duration", type: "uint256" },
            ],
            name: "rentPrice",
            outputs: [
              { name: "base", type: "uint256" },
              { name: "premium", type: "uint256" },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "rentPrice",
        args: [label, BigInt(duration)],
      })

      const [base, premium] = price as [bigint, bigint]
      return base + premium
    } catch (error) {
      console.error("Error getting rent price:", error)
      return BigInt(0)
    }
  }

  // Generate commitment hash
  async makeCommitment(data: ENSRegistrationData): Promise<string> {
    try {
      const label = data.name.replace(".eth", "")
      const resolverAddress = data.resolver || "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63" // Public resolver

      const commitment = await this.publicClient.readContract({
        address: "0x253553366Da8546fC250F225fe3d25d0C782303b",
        abi: [
          {
            inputs: [
              { name: "name", type: "string" },
              { name: "owner", type: "address" },
              { name: "duration", type: "uint256" },
              { name: "secret", type: "bytes32" },
              { name: "resolver", type: "address" },
              { name: "data", type: "bytes[]" },
              { name: "reverseRecord", type: "bool" },
              { name: "ownerControlledFuses", type: "uint16" },
            ],
            name: "makeCommitment",
            outputs: [{ name: "", type: "bytes32" }],
            stateMutability: "pure",
            type: "function",
          },
        ],
        functionName: "makeCommitment",
        args: [
          label,
          data.owner as `0x${string}`,
          BigInt(data.duration),
          data.secret as `0x${string}`,
          resolverAddress as `0x${string}`,
          [], // data array
          data.reverseRecord || false,
          0, // ownerControlledFuses
        ],
      })

      return commitment as string
    } catch (error) {
      console.error("Error making commitment:", error)
      throw error
    }
  }

  // Submit commitment
  async commitName(commitment: string): Promise<string> {
    try {
      if (!this.walletClient) {
        await this.initWalletClient()
      }

      const hash = await this.walletClient!.writeContract({
        address: "0x253553366Da8546fC250F225fe3d25d0C782303b",
        abi: [
          {
            inputs: [{ name: "commitment", type: "bytes32" }],
            name: "commit",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "commit",
        args: [commitment as `0x${string}`],
      })

      return hash
    } catch (error) {
      console.error("Error committing name:", error)
      throw error
    }
  }

  // Register name after commitment
  async registerName(data: ENSRegistrationData, price: bigint): Promise<string> {
    try {
      if (!this.walletClient) {
        await this.initWalletClient()
      }

      const label = data.name.replace(".eth", "")
      const resolverAddress = data.resolver || "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"

      // Add 5% slippage to price
      const priceWithSlippage = (price * BigInt(105)) / BigInt(100)

      const hash = await this.walletClient!.writeContract({
        address: "0x253553366Da8546fC250F225fe3d25d0C782303b",
        abi: [
          {
            inputs: [
              { name: "name", type: "string" },
              { name: "owner", type: "address" },
              { name: "duration", type: "uint256" },
              { name: "secret", type: "bytes32" },
              { name: "resolver", type: "address" },
              { name: "data", type: "bytes[]" },
              { name: "reverseRecord", type: "bool" },
              { name: "ownerControlledFuses", type: "uint16" },
            ],
            name: "register",
            outputs: [],
            stateMutability: "payable",
            type: "function",
          },
        ],
        functionName: "register",
        args: [
          label,
          data.owner as `0x${string}`,
          BigInt(data.duration),
          data.secret as `0x${string}`,
          resolverAddress as `0x${string}`,
          [],
          data.reverseRecord || false,
          0,
        ],
        value: priceWithSlippage,
      })

      return hash
    } catch (error) {
      console.error("Error registering name:", error)
      throw error
    }
  }

  // Resolve ENS name to address
  async resolveName(name: string): Promise<string | null> {
    try {
      const address = await this.publicClient.getEnsAddress({
        name: name as any,
      })
      return address
    } catch (error) {
      console.error("Error resolving name:", error)
      return null
    }
  }

  // Get primary name for address
  async getPrimaryName(address: string): Promise<string | null> {
    try {
      const name = await getEnsName(this.publicClient, {
        address: address as `0x${string}`,
      })
      return name
    } catch (error) {
      console.error("Error getting primary name:", error)
      return null
    }
  }

  // Get ENS avatar
  async getAvatar(name: string): Promise<string | null> {
    try {
      const avatar = await getEnsAvatar(this.publicClient, {
        name: name as any,
      })
      return avatar
    } catch (error) {
      console.error("Error getting avatar:", error)
      return null
    }
  }

  // Set primary name (reverse record)
  async setPrimaryName(name: string): Promise<string> {
    try {
      if (!this.walletClient) {
        await this.initWalletClient()
      }

      const hash = await this.walletClient!.writeContract({
        address: "0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb", // Reverse Registrar
        abi: [
          {
            inputs: [{ name: "name", type: "string" }],
            name: "setName",
            outputs: [{ name: "", type: "bytes32" }],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "setName",
        args: [name],
      })

      return hash
    } catch (error) {
      console.error("Error setting primary name:", error)
      throw error
    }
  }

  // Generate random secret for commitment
  generateSecret(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return "0x" + Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  // Generate ENS name suggestions based on user info
  generateNameSuggestions(userName: string, expertise: string[]): string[] {
    const cleanName = userName.toLowerCase().replace(/[^a-z0-9]/g, "")
    const suggestions = [`${cleanName}.eth`, `${cleanName}ai.eth`, `${cleanName}sensei.eth`]

    // Add expertise-based suggestions
    expertise.forEach((skill) => {
      const cleanSkill = skill.toLowerCase().replace(/[^a-z0-9]/g, "")
      suggestions.push(`${cleanName}${cleanSkill}.eth`)
      suggestions.push(`${cleanSkill}${cleanName}.eth`)
    })

    return suggestions.slice(0, 8) // Return top 8 suggestions
  }
}

export const ensService = new ENSService()

// Helper function for complete ENS registration flow
export async function registerENSForReplica(
  replicaName: string,
  ownerAddress: string,
  duration = 31536000, // 1 year in seconds
): Promise<{ success: boolean; ensName?: string; transactionHash?: string }> {
  try {
    const ensName = `${replicaName.toLowerCase().replace(/[^a-z0-9]/g, "")}.eth`

    // Check availability
    const available = await ensService.isNameAvailable(ensName)
    if (!available) {
      throw new Error("ENS name not available")
    }

    // Get price
    const price = await ensService.getRentPrice(ensName, duration)

    // Generate secret and commitment
    const secret = ensService.generateSecret()
    const registrationData: ENSRegistrationData = {
      name: ensName,
      owner: ownerAddress,
      duration,
      secret,
      reverseRecord: true,
    }

    // Make commitment
    const commitment = await ensService.makeCommitment(registrationData)

    // Submit commitment
    const commitHash = await ensService.commitName(commitment)

    // Wait for commitment confirmation (in real app, you'd wait for the transaction to be mined)
    console.log("Commitment submitted:", commitHash)

    // Note: In production, you'd need to wait 60 seconds before registering
    // For now, we'll return the commitment info
    return {
      success: true,
      ensName,
      transactionHash: commitHash,
    }
  } catch (error) {
    console.error("Error registering ENS for replica:", error)
    return { success: false }
  }
}
