"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ENSRegistration } from "@/components/ens/ens-registration"
import { ENSProfileManager } from "@/components/ens-profile-manager"

const ENSPage = () => {
  // Added default export
  return (
    <div>
      {/* Inserted code here */}
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
              <ENSRegistration />
            </TabsContent>
            <TabsContent value="manage">
              <ENSProfileManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default ENSPage
