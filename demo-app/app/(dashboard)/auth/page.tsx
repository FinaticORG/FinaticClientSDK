import { AppSidebar } from "@/components/app-sidebar"
import { AuthenticationPageComponent } from "@/app/(dashboard)/auth/_components/AuthenticationPage"

export default function AuthenticationPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <AuthenticationPageComponent />
      </main>
    </div>
  )
}
