"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { paymentService, type Transaction } from "@/lib/payment"
import { ArrowUpRight, ArrowDownLeft, RefreshCw, ExternalLink } from "lucide-react"

interface TransactionHistoryProps {
  userId: string
}

export function TransactionHistory({ userId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "payment" | "withdrawal">("all")

  useEffect(() => {
    fetchTransactions()
  }, [userId])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const data = await paymentService.getTransactionHistory(userId)
      setTransactions(data)
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((tx) => filter === "all" || tx.type === filter)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />
      case "refund":
        return <RefreshCw className="h-4 w-4 text-orange-500" />
      default:
        return <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === "withdrawal" ? "-" : "+"
    return `${prefix}$${Math.abs(amount).toFixed(2)}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent payments and withdrawals</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All
            </Button>
            <Button
              variant={filter === "payment" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("payment")}
            >
              Payments
            </Button>
            <Button
              variant={filter === "withdrawal" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("withdrawal")}
            >
              Withdrawals
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">{getTransactionIcon(transaction.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{transaction.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{transaction.timestamp.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{transaction.timestamp.toLocaleTimeString()}</span>
                      {transaction.txHash && (
                        <>
                          <span>•</span>
                          <Button variant="ghost" size="sm" className="h-auto p-0">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-medium ${transaction.type === "withdrawal" ? "text-red-600" : "text-green-600"}`}
                  >
                    {formatAmount(transaction.amount, transaction.type)}
                  </div>
                  <div className="flex items-center space-x-2">{getStatusBadge(transaction.status)}</div>
                  {transaction.feeAmount && (
                    <div className="text-xs text-muted-foreground">Fee: ${transaction.feeAmount.toFixed(2)}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
