"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ENSRegistration } from "@/components/ens/ens-registration"
import { ENSProfileManager } from "@/components/ens-profile-manager"
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletModal,
} from "@coinbase/onchainkit/wallet"
import {
  Name,
  Identity,
  Address,
  Avatar as CoinbaseAvatar,
  EthBalance,
} from "@coinbase/onchainkit/identity"

export default function ENSPage() {
  const [currentEnsName, setCurrentEnsName] = useState<string | null>(null)
  const [aiPersonaId] = useState("demo-persona-123")
  const [personaName] = useState("Demo AI Persona")
  const [showWalletModal, setShowWalletModal] = useState(false)

  const handleRegistrationComplete = (ensName: string) => {
    setCurrentEnsName(ensName)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">ENS Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <Wallet className="z-10">
                <ConnectWallet>
                  <Name className="text-inherit" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <CoinbaseAvatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
                <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
              </Wallet>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="register" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">Register ENS</TabsTrigger>
            <TabsTrigger value="manage">Manage Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Register Your ENS Name</h2>
              <p className="text-muted-foreground">
                Secure your blockchain identity and connect it to your AI persona
              </p>
            </div>
            <ENSRegistration
              aiPersonaId={aiPersonaId}
              personaName={personaName}
              onRegistrationComplete={handleRegistrationComplete}
            />
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Manage Your ENS Profile</h2>
              <p className="text-muted-foreground">
                Update your profile information and manage your ENS settings
              </p>
            </div>
            {currentEnsName ? (
              <ENSProfileManager ensName={currentEnsName} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  You need to register an ENS name first to manage your profile
                </p>
                <p className="text-sm text-muted-foreground">
                  Switch to the "Register ENS" tab to get started
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
