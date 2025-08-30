"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ENSRegistration } from "@/components/ens/ens-registration"
import { ENSProfileManager } from "@/components/ens-profile-manager"

const ENSPage = () => {
  const [currentEnsName, setCurrentEnsName] = useState<string>("")
  const [aiPersonaId] = useState("default-persona-id")
  const [personaName] = useState("AI Assistant")

  const handleRegistrationComplete = (ensName: string) => {
    setCurrentEnsName(ensName)
    // Switch to manage tab after registration
    const tabs = document.querySelector('[role="tablist"]') as HTMLElement
    if (tabs) {
      const manageTab = tabs.querySelector('[value="manage"]') as HTMLElement
      if (manageTab) manageTab.click()
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>ENS Management</CardTitle>
          <CardDescription>Register and manage your ENS names.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="register">
            <TabsList>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="manage">Manage</TabsTrigger>
            </TabsList>
            <TabsContent value="register">
              <ENSRegistration 
                aiPersonaId={aiPersonaId}
                personaName={personaName}
                onRegistrationComplete={handleRegistrationComplete}
              />
            </TabsContent>
            <TabsContent value="manage">
              {currentEnsName ? (
                <ENSProfileManager ensName={currentEnsName} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Register an ENS name first to manage your profile
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default ENSPage
