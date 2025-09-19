import { AppSidebar } from "@/components/app-sidebar"
import { AuthenticationPortal } from "@/app/(dashboard)/auth/_components/Authentication"

export default function AuthPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <AuthenticationPortal />
      </main>
    </div>
  )
}
