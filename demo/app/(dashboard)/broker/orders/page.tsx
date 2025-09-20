import { AppSidebar } from "@/components/app-sidebar"
import { OrderExecutionLab } from "@/app/(dashboard)/broker/orders/_components/OrderExecutionLab"

export default function BrokerOrdersPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <OrderExecutionLab />
      </main>
    </div>
  )
}

