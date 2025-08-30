"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, AlertCircle, Loader2, Zap } from "lucide-react"
import { ensService } from "@/lib/ens"

interface ENSRegistrationProps {
  aiPersonaId: string
  personaName: string
  onRegistrationComplete: (ensName: string) => void
}

export function ENSRegistration({ aiPersonaId, personaName, onRegistrationComplete }: ENSRegistrationProps) {
  const [ensName, setEnsName] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [availability, setAvailability] = useState<boolean | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string>("")

  useEffect(() => {
    // Generate initial suggestions based on persona name
    const generateSuggestions = async () => {
      const baseName = personaName.toLowerCase().replace(/\s+/g, "")
      const suggested = await ensService.suggestNames(baseName, [])
      setSuggestions(suggested)

      // Set first suggestion as default
      if (suggested.length > 0) {
        setEnsName(suggested[0])
      }
    }

    generateSuggestions()
  }, [personaName])

  useEffect(() => {
    const checkAvailability = async () => {
      if (!ensName) {
        setAvailability(null)
        return
      }

      const validation = ensService.validateENSName(ensName)
      if (!validation.valid) {
        setValidationError(validation.error || "")
        setAvailability(null)
        return
      }

      setValidationError("")
      setIsChecking(true)

      try {
        const available = await ensService.checkAvailability(ensName)
        setAvailability(available)
      } catch (error) {
        console.error("Error checking ENS availability:", error)
        setAvailability(null)
      } finally {
        setIsChecking(false)
      }
    }

    const debounceTimer = setTimeout(checkAvailability, 500)
    return () => clearTimeout(debounceTimer)
  }, [ensName])

  const handleRegister = async () => {
    if (!availability || validationError) return

    setIsRegistering(true)
    try {
      // Mock user address - in production, get from wallet
      const userAddress = "0x" + Math.random().toString(16).substr(2, 40)

      const registration = await ensService.registerENS(ensName, userAddress, aiPersonaId)
      onRegistrationComplete(registration.name)
    } catch (error) {
      console.error("Error registering ENS:", error)
    } finally {
      setIsRegistering(false)
    }
  }

  const getStatusIcon = () => {
    if (isChecking) return <Loader2 className="h-4 w-4 animate-spin" />
    if (validationError) return <AlertCircle className="h-4 w-4 text-red-500" />
    if (availability === true) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (availability === false) return <AlertCircle className="h-4 w-4 text-red-500" />
    return null
  }

  const getStatusText = () => {
    if (validationError) return validationError
    if (isChecking) return "Checking availability..."
    if (availability === true) return "Available!"
    if (availability === false) return "Not available"
    return ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Claim Your ENS Name
        </CardTitle>
        <CardDescription>
          Your AI persona will be accessible through a unique ENS name on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="ens-name">ENS Name</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="ens-name"
              value={ensName}
              onChange={(e) => setEnsName(e.target.value.toLowerCase())}
              placeholder="your-name"
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">.eth</span>
            {getStatusIcon()}
          </div>
          {getStatusText() && (
            <Alert
              variant={
                validationError || availability === false
                  ? "destructive"
                  : "default"
              }
            >
              <AlertDescription>{getStatusText()}</AlertDescription>
            </Alert>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <Label>Suggested Names</Label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setEnsName(suggestion)}
                >
                  {suggestion}.eth
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium">What you get:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Unique blockchain identity for your AI persona</li>
            <li>• Verifiable ownership and authenticity</li>
            <li>• Easy sharing with memorable name</li>
            <li>• Integration with Web3 ecosystem</li>
          </ul>
        </div>

        <Button
          onClick={handleRegister}
          disabled={!availability || isRegistering || !!validationError}
          className="w-full"
        >
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering ENS Name...
            </>
          ) : (
            "Register ENS Name"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default ENSRegistration
