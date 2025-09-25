import { AppSidebar } from "@/components/app-sidebar"
import { DeveloperPageComponent } from "@/app/(dashboard)/developer/_components/DeveloperPageComponent"

export default function DeveloperPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <DeveloperPageComponent />
      </main>
    </div>
  )
}
