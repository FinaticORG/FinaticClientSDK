import { AppSidebar } from "@/components/app-sidebar"
import { SettingsPageComponent } from "@/app/(dashboard)/settings/_components/SettingsPageComponent"

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <SettingsPageComponent />
      </main>
    </div>
  )
}
