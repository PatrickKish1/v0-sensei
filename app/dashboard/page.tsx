"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Brain } from "lucide-react"
import { WalletConnectButton } from "@/components/auth/wallet-connect-button"
import { Sidebar, type SidebarTab } from "@/components/dashboard/sidebar"
import { WalletTab } from "@/components/dashboard/wallet-tab"
import { NFTsTab } from "@/components/dashboard/nfts-tab"
import { OwnedNFTsTab } from "@/components/dashboard/owned-nfts-tab"
import { SenseisTab } from "@/components/dashboard/senseis-tab"
import { redirect } from "next/navigation"

export default function DashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<SidebarTab>("wallet")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!user) {
    redirect("/")
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "wallet":
        return <WalletTab />
      case "nfts":
        return <NFTsTab />
      case "owned-nfts":
        return <OwnedNFTsTab />
      case "senseis":
        return <SenseisTab />
      default:
        return <WalletTab />
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? "lg:ml-16" : "lg:ml-72"
      }`}>
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="lg:hidden flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg">Sensei</span>
                </div>
                <div className="hidden lg:block">
                  <h1 className="text-2xl font-bold text-foreground">
                    Welcome back, {user.name}!
                  </h1>
                  <p className="text-muted-foreground">
                    {user.role === "sensei" 
                      ? "Manage your expertise and connect with students" 
                      : "Discover amazing senseis and expand your knowledge"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <WalletConnectButton />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">
          {renderTabContent()}
        </main>
      </div>
    </div>
  )
}