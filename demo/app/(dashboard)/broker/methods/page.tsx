import { AppSidebar } from "@/components/app-sidebar"
import { BrokerMethodLab } from "@/app/(dashboard)/broker/methods/_components/BrokerMethodLab"

export default function BrokerMethodsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <BrokerMethodLab />
      </main>
    </div>
  )
}

