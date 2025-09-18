import { AppSidebar } from "@/components/app-sidebar"
import { TradingContext } from "@/components/trading-context"

export default function TradingPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <TradingContext />
      </main>
    </div>
  )
}
