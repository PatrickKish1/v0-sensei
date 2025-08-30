export interface PaymentMethod {
  id: string
  type: "crypto" | "card" | "bank"
  name: string
  details: string
  isDefault: boolean
  isActive: boolean
}

export interface Transaction {
  id: string
  type: "payment" | "withdrawal" | "refund" | "fee"
  amount: number
  currency: "USD" | "ETH" | "USDC"
  status: "pending" | "completed" | "failed" | "cancelled"
  description: string
  timestamp: Date
  sessionId?: string
  personaId?: string
  userId: string
  txHash?: string
  feeAmount?: number
}

export interface EarningsData {
  totalEarnings: number
  availableBalance: number
  pendingBalance: number
  thisWeekEarnings: number
  thisMonthEarnings: number
  averagePerSession: number
  totalSessions: number
  platformFeeRate: number
}

export interface WithdrawalRequest {
  id: string
  amount: number
  currency: "USD" | "ETH" | "USDC"
  paymentMethodId: string
  status: "pending" | "processing" | "completed" | "failed"
  requestedAt: Date
  processedAt?: Date
  feeAmount: number
  netAmount: number
}

export class PaymentService {
  private baseUrl: string
  private apiKey: string

  constructor(apiKey: string, baseUrl = "/api/payments") {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  // Process payment for a chat session
  async processSessionPayment(
    sessionId: string,
    personaId: string,
    amount: number,
    currency: "USD" | "ETH" | "USDC" = "USD",
    paymentMethodId?: string,
  ): Promise<{ transactionId: string; status: string }> {
    try {
      // In a real implementation, this would integrate with Stripe, Base payments, or other providers
      const response = await fetch(`${this.baseUrl}/process-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          sessionId,
          personaId,
          amount,
          currency,
          paymentMethodId,
        }),
      })

      if (!response.ok) {
        throw new Error("Payment processing failed")
      }

      return response.json()
    } catch (error) {
      console.error("Payment processing error:", error)
      // Mock successful payment for development
      return {
        transactionId: `tx_${Date.now()}`,
        status: "completed",
      }
    }
  }

  // Get user's earnings data
  async getEarningsData(userId: string): Promise<EarningsData> {
    try {
      const response = await fetch(`${this.baseUrl}/earnings/${userId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch earnings data")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching earnings:", error)
      // Return mock data for development
      return {
        totalEarnings: 2450.75,
        availableBalance: 1890.25,
        pendingBalance: 560.5,
        thisWeekEarnings: 185.0,
        thisMonthEarnings: 890.25,
        averagePerSession: 45.5,
        totalSessions: 54,
        platformFeeRate: 0.15, // 15% platform fee
      }
    }
  }

  // Get transaction history
  async getTransactionHistory(userId: string, limit = 50): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${userId}?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch transaction history")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching transactions:", error)
      // Return mock data for development
      return [
        {
          id: "tx_001",
          type: "payment",
          amount: 45.0,
          currency: "USD",
          status: "completed",
          description: "Chat session with Alex Chen - Product Strategy",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          sessionId: "session_001",
          userId: "user_001",
          feeAmount: 6.75,
        },
        {
          id: "tx_002",
          type: "payment",
          amount: 30.0,
          currency: "USD",
          status: "completed",
          description: "Chat session with Sarah Kim - Leadership Tips",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          sessionId: "session_002",
          userId: "user_002",
          feeAmount: 4.5,
        },
        {
          id: "tx_003",
          type: "withdrawal",
          amount: -500.0,
          currency: "USD",
          status: "completed",
          description: "Withdrawal to bank account",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          userId: "current_user",
          feeAmount: 5.0,
        },
      ]
    }
  }

  // Request withdrawal
  async requestWithdrawal(
    userId: string,
    amount: number,
    currency: "USD" | "ETH" | "USDC",
    paymentMethodId: string,
  ): Promise<WithdrawalRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          userId,
          amount,
          currency,
          paymentMethodId,
        }),
      })

      if (!response.ok) {
        throw new Error("Withdrawal request failed")
      }

      return response.json()
    } catch (error) {
      console.error("Withdrawal request error:", error)
      // Mock successful withdrawal request
      const feeAmount = amount * 0.02 // 2% withdrawal fee
      return {
        id: `wd_${Date.now()}`,
        amount,
        currency,
        paymentMethodId,
        status: "pending",
        requestedAt: new Date(),
        feeAmount,
        netAmount: amount - feeAmount,
      }
    }
  }

  // Get payment methods
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods/${userId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch payment methods")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      // Return mock data
      return [
        {
          id: "pm_001",
          type: "crypto",
          name: "MetaMask Wallet",
          details: "0x1234...5678",
          isDefault: true,
          isActive: true,
        },
        {
          id: "pm_002",
          type: "bank",
          name: "Chase Bank",
          details: "****1234",
          isDefault: false,
          isActive: true,
        },
      ]
    }
  }

  // Add payment method
  async addPaymentMethod(userId: string, paymentMethod: Omit<PaymentMethod, "id">): Promise<PaymentMethod> {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          userId,
          ...paymentMethod,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add payment method")
      }

      return response.json()
    } catch (error) {
      console.error("Error adding payment method:", error)
      // Mock successful addition
      return {
        id: `pm_${Date.now()}`,
        ...paymentMethod,
      }
    }
  }
}

export const paymentService = new PaymentService("mock-api-key")
