import { AppSidebar } from "@/components/app-sidebar"
import { MethodLab } from "@/app/(dashboard)/methods/_components/MethodLab"

export default function MethodsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <MethodLab />
      </main>
    </div>
  )
}

