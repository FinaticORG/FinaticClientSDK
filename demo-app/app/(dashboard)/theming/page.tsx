import { AppSidebar } from "@/components/app-sidebar"
import { ThemingSystemPageComponent } from "@/app/(dashboard)/theming/_components/ThemingSystemPageComponent"

export default function ThemingPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <ThemingSystemPageComponent />
      </main>
    </div>
  )
}
