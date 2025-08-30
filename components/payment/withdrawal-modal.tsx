"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { paymentService, type PaymentMethod, type WithdrawalRequest } from "@/lib/payment"
import { Wallet, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface WithdrawalModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  availableBalance: number
}

export function WithdrawalModal({ isOpen, onClose, userId, availableBalance }: WithdrawalModalProps) {
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<"USD" | "ETH" | "USDC">("USD")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [withdrawalRequest, setWithdrawalRequest] = useState<WithdrawalRequest | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods()
    }
  }, [isOpen, userId])

  const fetchPaymentMethods = async () => {
    setIsLoading(true)
    try {
      const methods = await paymentService.getPaymentMethods(userId)
      setPaymentMethods(methods)
      const defaultMethod = methods.find((m) => m.isDefault)
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id)
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error)
      setError("Failed to load payment methods")
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdrawal = async () => {
    if (!amount || !selectedPaymentMethod) {
      setError("Please fill in all required fields")
      return
    }

    const withdrawalAmount = Number.parseFloat(amount)
    if (withdrawalAmount <= 0 || withdrawalAmount > availableBalance) {
      setError("Invalid withdrawal amount")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const request = await paymentService.requestWithdrawal(userId, withdrawalAmount, currency, selectedPaymentMethod)
      setWithdrawalRequest(request)
    } catch (error) {
      console.error("Withdrawal request failed:", error)
      setError("Failed to process withdrawal request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setAmount("")
    setCurrency("USD")
    setSelectedPaymentMethod("")
    setWithdrawalRequest(null)
    setError("")
    onClose()
  }

  const withdrawalFee = Number.parseFloat(amount) * 0.02 // 2% fee
  const netAmount = Number.parseFloat(amount) - withdrawalFee

  if (withdrawalRequest) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Withdrawal Requested
            </DialogTitle>
            <DialogDescription>Your withdrawal request has been submitted successfully</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Request ID:</span>
                  <span className="text-sm font-mono">{withdrawalRequest.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-sm font-medium">
                    ${withdrawalRequest.amount.toFixed(2)} {withdrawalRequest.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fee:</span>
                  <span className="text-sm">${withdrawalRequest.feeAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-sm">Net Amount:</span>
                  <span className="text-sm">${withdrawalRequest.netAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your withdrawal will be processed within 1-3 business days. You'll receive an email confirmation once
                completed.
              </AlertDescription>
            </Alert>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Withdraw Earnings
          </DialogTitle>
          <DialogDescription>Transfer your available earnings to your preferred payment method</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={availableBalance}
                step="0.01"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                {currency}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Available balance: ${availableBalance.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={(value: "USD" | "ETH" | "USDC") => setCurrency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center gap-2">
                        <span>{method.name}</span>
                        <span className="text-muted-foreground">({method.details})</span>
                        {method.isDefault && <span className="text-xs text-primary">Default</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {amount && Number.parseFloat(amount) > 0 && (
            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <span>Withdrawal amount:</span>
                <span>${Number.parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Processing fee (2%):</span>
                <span>${withdrawalFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-1">
                <span>Net amount:</span>
                <span>${netAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleWithdrawal}
              disabled={!amount || !selectedPaymentMethod || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Withdraw"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
