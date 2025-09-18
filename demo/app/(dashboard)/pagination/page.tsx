import { AppSidebar } from "@/components/app-sidebar"
import { PaginationHelpers } from "@/components/pagination-helpers"

export default function PaginationPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <PaginationHelpers />
      </main>
    </div>
  )
}
