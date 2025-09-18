import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import Portal from "@/app/(dashboard)/portal/_components/Portal"

export default function PortalPage(): React.JSX.Element {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Portal</h1>
            <p className="text-muted-foreground">Authenticate users and manage broker connections</p>
          </div>
          <Portal />
        </div>
      </main>
    </div>
  )
}


