import { AppSidebar } from "@/components/app-sidebar"
import { AdvancedDeveloper } from "@/app/(dashboard)/developer/_components/AdvancedDeveloper"

export default function DeveloperPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <AdvancedDeveloper />
      </main>
    </div>
  )
}
