"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  Coins, 
  Users, 
  Image, 
  ChevronRight,
  ChevronLeft,
  Brain,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

export type SidebarTab = "wallet" | "nfts" | "owned-nfts" | "senseis"

interface SidebarProps {
  activeTab: SidebarTab
  onTabChange: (tab: SidebarTab) => void
  className?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const sidebarItems = [
  {
    id: "wallet" as const,
    label: "Sensei Wallet",
    icon: Wallet,
    description: "Mint & burn tokens",
    color: "text-blue-500"
  },
  {
    id: "nfts" as const,
    label: "Lesson NFTs",
    icon: Coins,
    description: "Available NFTs",
    color: "text-green-500"
  },
  {
    id: "owned-nfts" as const,
    label: "My NFTs",
    icon: Image,
    description: "Your collection",
    color: "text-purple-500"
  },
  {
    id: "senseis" as const,
    label: "All Senseis",
    icon: Users,
    description: "Browse experts",
    color: "text-orange-500"
  }
]

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  className, 
  isCollapsed = false, 
  onToggleCollapse 
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen)

  const handleTabClick = (tabId: SidebarTab) => {
    onTabChange(tabId)
    setIsMobileOpen(false) // Close mobile sidebar when tab is selected
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMobile}
          className="bg-background/95 backdrop-blur-sm"
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:sticky top-0 left-0 h-screen bg-card border-r border-border z-50 transition-all duration-300",
        isCollapsed ? "w-16" : "w-72",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg">Dashboard</span>
                </div>
              )}
              {onToggleCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-auto p-3",
                    isActive && "bg-primary/10 text-primary border-primary/20",
                    isCollapsed && "px-2"
                  )}
                  onClick={() => handleTabClick(item.id)}
                >
                  <Icon className={cn("h-5 w-5", item.color)} />
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  )}
                  {!isCollapsed && isActive && (
                    <Badge variant="secondary" className="ml-auto">
                      Active
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-border">
              <Card>
                <CardContent className="p-3">
                  <div className="text-sm text-muted-foreground text-center">
                    <Brain className="h-4 w-4 mx-auto mb-1" />
                    <div className="font-medium">Sensei Platform</div>
                    <div className="text-xs">Knowledge Economy</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
