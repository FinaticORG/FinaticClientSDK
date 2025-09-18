import { AppSidebar } from "@/components/app-sidebar"
import { OverviewDashboard } from "@/components/overview-dashboard"

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <OverviewDashboard />
      </main>
    </div>
  )
}
