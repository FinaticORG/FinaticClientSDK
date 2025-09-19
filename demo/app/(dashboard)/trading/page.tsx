import { AppSidebar } from "@/components/app-sidebar"
import { Trading } from "@/app/(dashboard)/trading/_components/Trading"

export default function TradingPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Trading />
      </main>
    </div>
  )
}
