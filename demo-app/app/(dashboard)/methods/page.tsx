import { AppSidebar } from "@/components/app-sidebar"
import { MethodPageComponent } from "@/app/(dashboard)/methods/_components/MethodPageComponent"

export default function MethodsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <MethodPageComponent />
      </main>
    </div>
  )
}

