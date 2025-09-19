import { AppSidebar } from "@/components/app-sidebar"
import { BrokerManagement } from "@/app/(dashboard)/broker/_components/BrokerMangement"

export default function BrokerPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <BrokerManagement />
      </main>
    </div>
  )
}
