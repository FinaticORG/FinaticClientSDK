import { AppSidebar } from "@/components/app-sidebar"
import { DataManagement } from "@/app/(dashboard)/database/_components/database"

export default function DataPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <DataManagement />
      </main>
    </div>
  )
}
