import { AppSidebar } from "@/components/app-sidebar"
import { TradingPageComponent } from "@/app/(dashboard)/trading/_components/TradingPageComponent"

export default function TradingPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <TradingPageComponent />
      </main>
    </div>
  )
}
