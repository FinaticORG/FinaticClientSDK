import { AppSidebar } from "@/components/app-sidebar"
import { ThemingSystem } from "@/components/theming-system"

export default function ThemingPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <ThemingSystem />
      </main>
    </div>
  )
}
