"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { paymentService, type EarningsData } from "@/lib/payment"
import { DollarSign, TrendingUp, Clock, Wallet, ArrowUpRight } from "lucide-react"

interface EarningsOverviewProps {
  userId: string
  onWithdrawClick: () => void
}

export function EarningsOverview({ userId, onWithdrawClick }: EarningsOverviewProps) {
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const data = await paymentService.getEarningsData(userId)
        setEarnings(data)
      } catch (error) {
        console.error("Failed to fetch earnings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEarnings()
  }, [userId])

  if (isLoading || !earnings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const pendingPercentage = (earnings.pendingBalance / earnings.totalEarnings) * 100

  return (
    <div className="space-y-6">
      {/* Main Earnings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Earnings Overview
          </CardTitle>
          <CardDescription>Track your revenue from AI persona interactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Available Balance */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">${earnings.availableBalance.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mb-4">Available for withdrawal</p>
            <Button onClick={onWithdrawClick} className="w-full">
              <Wallet className="h-4 w-4 mr-2" />
              Withdraw Earnings
            </Button>
          </div>

          {/* Pending Balance */}
          {earnings.pendingBalance > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Balance</span>
                <span className="text-sm text-muted-foreground">${earnings.pendingBalance.toFixed(2)}</span>
              </div>
              <Progress value={pendingPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Funds will be available after session completion and review period
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">${earnings.thisWeekEarnings.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">${earnings.thisMonthEarnings.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">${earnings.averagePerSession.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Avg per Session</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{earnings.totalSessions}</div>
              <div className="text-xs text-muted-foreground">Total Sessions</div>
            </div>
          </div>

          {/* Platform Fee Info */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Platform Fee</span>
              <Badge variant="secondary">{(earnings.platformFeeRate * 100).toFixed(0)}%</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Platform fee is automatically deducted from each session payment
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-xl font-bold">${earnings.totalEarnings.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessions Today</p>
                <p className="text-xl font-bold">3</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <p className="text-xl font-bold">+12%</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
