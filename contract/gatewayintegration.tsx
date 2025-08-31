"use client"

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther, formatEther } from "viem"
import { 
  SENSEI_GATEWAY_ADDRESS, 
  SENSEI_TOKEN_ADDRESS, 
  LESSON_NFT_ADDRESS,
  SENSEI_GATEWAY_ABI, 
  SENSEI_TOKEN_ABI, 
  LESSON_NFT_ABI 
} from "./abi"

// Types for contract interactions
export interface SenseiProfile {
  senseiAddress: string
  name: string
  expertise: string
  description: string
  hourlyRate: bigint
  isActive: boolean
  totalSessions: bigint
  rating: bigint
  skills: string[]
}

export interface LessonMetadata {
  sessionId: bigint
  senseiAddress: string
  studentAddress: string
  subject: string
  lessonTitle: string
  mintPrice: bigint
  isMinted: boolean
  isPublicMintable: boolean
}

export interface PlatformStats {
  totalSenseis: bigint
  totalSessions: bigint
  totalNFTsMinted: bigint
  totalTokensCirculating: bigint
  totalKnowledgeValue: bigint
  totalEarnings: bigint
}

// Custom hook for Sensei registration
export function useSenseiRegistration() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  const registerSensei = async (
    name: string,
    expertise: string,
    description: string,
    hourlyRateETH: string,
    isRetired: boolean,
    skills: string[]
  ) => {
    if (!SENSEI_GATEWAY_ADDRESS) {
      throw new Error("Gateway address not configured")
    }

    await writeContract({
      address: SENSEI_GATEWAY_ADDRESS as `0x${string}`,
      abi: SENSEI_GATEWAY_ABI,
      functionName: "registerSensei",
      args: [
        name,
        expertise,
        description,
        parseEther(hourlyRateETH),
        isRetired,
        skills
      ]
    })
  }

  return {
    registerSensei,
    hash,
    isPending,
    isConfirming
  }
}

// Custom hook for getting active senseis
export function useActiveSenseis() {
  const { data: senseiIds, isLoading, error, refetch } = useReadContract({
    address: SENSEI_GATEWAY_ADDRESS as `0x${string}`,
    abi: SENSEI_GATEWAY_ABI,
    functionName: "getActiveSenseis",
    query: {
      enabled: !!SENSEI_GATEWAY_ADDRESS
    }
  })

  return {
    senseiIds: senseiIds as bigint[] | undefined,
    isLoading,
    error,
    refetch
  }
}

// Custom hook for SenseiToken operations
export function useSenseiToken() {
  const { address } = useAccount()
  
  // Read functions
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: SENSEI_TOKEN_ADDRESS as `0x${string}`,
    abi: SENSEI_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!SENSEI_TOKEN_ADDRESS
    }
  })

  const { data: mintRate } = useReadContract({
    address: SENSEI_TOKEN_ADDRESS as `0x${string}`,
    abi: SENSEI_TOKEN_ABI,
    functionName: "getCurrentMintRate",
    query: {
      enabled: !!SENSEI_TOKEN_ADDRESS
    }
  })

  // Write functions
  const { 
    writeContract: mintTokens, 
    data: mintHash,
    isPending: isMinting 
  } = useWriteContract()

  const { 
    writeContract: burnTokens, 
    data: burnHash,
    isPending: isBurning 
  } = useWriteContract()

  // Wait for confirmations
  const { isLoading: isMintConfirming } = useWaitForTransactionReceipt({ hash: mintHash })
  const { isLoading: isBurnConfirming } = useWaitForTransactionReceipt({ hash: burnHash })

  const mintWithETH = async (ethAmount: string) => {
    if (!SENSEI_TOKEN_ADDRESS) {
      throw new Error("Token address not configured")
    }

    await mintTokens({
      address: SENSEI_TOKEN_ADDRESS as `0x${string}`,
      abi: SENSEI_TOKEN_ABI,
      functionName: "mintWithETH",
      value: parseEther(ethAmount)
    })
  }

  const burn = async (tokenAmount: string) => {
    if (!SENSEI_TOKEN_ADDRESS) {
      throw new Error("Token address not configured")
    }

    await burnTokens({
      address: SENSEI_TOKEN_ADDRESS as `0x${string}`,
      abi: SENSEI_TOKEN_ABI,
      functionName: "burn",
      args: [parseEther(tokenAmount)]
    })
  }

  const getTokensForETH = (ethAmount: string) => {
    if (!mintRate) return "0"
    const ethWei = parseEther(ethAmount)
    const tokens = (ethWei * mintRate) / parseEther("1")
    return formatEther(tokens)
  }

  return {
    // State
    balance: balance ? formatEther(balance) : "0",
    mintRate: mintRate ? formatEther(mintRate) : "0",
    
    // Actions
    mintWithETH,
    burn,
    getTokensForETH,
    refetchBalance,
    
    // Transaction states
    isMinting,
    isBurning,
    isMintConfirming,
    isBurnConfirming,
    mintHash,
    burnHash
  }
}

// Custom hook for Lesson NFT operations
export function useLessonNFT() {
  const { address } = useAccount()

  // Read user's NFT balance
  const { data: nftBalance, refetch: refetchNFTBalance } = useReadContract({
    address: LESSON_NFT_ADDRESS as `0x${string}`,
    abi: LESSON_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!LESSON_NFT_ADDRESS
    }
  })

  // Write function for minting NFTs
  const { 
    writeContract: mintNFT, 
    data: mintHash,
    isPending: isMinting 
  } = useWriteContract()

  const { isLoading: isMintConfirming } = useWaitForTransactionReceipt({ hash: mintHash })

  const mintLessonNFT = async (tokenId: string) => {
    if (!LESSON_NFT_ADDRESS) {
      throw new Error("NFT address not configured")
    }

    await mintNFT({
      address: LESSON_NFT_ADDRESS as `0x${string}`,
      abi: LESSON_NFT_ABI,
      functionName: "mintLessonNFT",
      args: [BigInt(tokenId)]
    })
  }

  return {
    nftBalance: nftBalance ? nftBalance.toString() : "0",
    mintLessonNFT,
    refetchNFTBalance,
    isMinting,
    isMintConfirming,
    mintHash
  }
}

// Custom hook for lesson booking
export function useLessonBooking() {
  const { 
    writeContract: bookLesson, 
    data: bookHash,
    isPending: isBooking 
  } = useWriteContract()

  const { isLoading: isBookConfirming } = useWaitForTransactionReceipt({ hash: bookHash })

  const bookLessonWithETH = async (
    senseiId: string,
    subject: string,
    sessionTitle: string,
    sessionDescription: string,
    durationMinutes: number,
    nftMintable: boolean,
    paymentETH: string
  ) => {
    if (!SENSEI_GATEWAY_ADDRESS) {
      throw new Error("Gateway address not configured")
    }

    await bookLesson({
      address: SENSEI_GATEWAY_ADDRESS as `0x${string}`,
      abi: SENSEI_GATEWAY_ABI,
      functionName: "bookLessonWithETH",
      args: [
        BigInt(senseiId),
        subject,
        sessionTitle,
        sessionDescription,
        BigInt(durationMinutes),
        nftMintable
      ],
      value: parseEther(paymentETH)
    })
  }

  return {
    bookLessonWithETH,
    isBooking,
    isBookConfirming,
    bookHash
  }
}

// Custom hook for AI chat
export function useSenseiAI() {
  const { 
    writeContract: chatWithAI, 
    data: chatHash,
    isPending: isChatting 
  } = useWriteContract()

  const { isLoading: isChatConfirming } = useWaitForTransactionReceipt({ hash: chatHash })

  const chatWithSenseiAI = async (senseiId: string, query: string) => {
    if (!SENSEI_GATEWAY_ADDRESS) {
      throw new Error("Gateway address not configured")
    }

    await chatWithAI({
      address: SENSEI_GATEWAY_ADDRESS as `0x${string}`,
      abi: SENSEI_GATEWAY_ABI,
      functionName: "chatWithSenseiAI",
      args: [BigInt(senseiId), query]
    })
  }

  return {
    chatWithSenseiAI,
    isChatting,
    isChatConfirming,
    chatHash
  }
}

// Utility functions for formatting
export const formatTokenAmount = (amount: bigint | string): string => {
  if (typeof amount === "string") return amount
  return formatEther(amount)
}

export const parseTokenAmount = (amount: string): bigint => {
  return parseEther(amount)
}

// Contract configuration check
export const isContractConfigured = (): boolean => {
  return !!(SENSEI_GATEWAY_ADDRESS && SENSEI_TOKEN_ADDRESS && LESSON_NFT_ADDRESS)
}

// Error handling utility
export const getContractError = (error: any): string => {
  if (error?.message?.includes("User rejected")) {
    return "Transaction was rejected by user"
  }
  if (error?.message?.includes("insufficient funds")) {
    return "Insufficient funds for transaction"
  }
  if (error?.message?.includes("execution reverted")) {
    return "Transaction failed - contract requirements not met"
  }
  return error?.message || "Unknown error occurred"
}
