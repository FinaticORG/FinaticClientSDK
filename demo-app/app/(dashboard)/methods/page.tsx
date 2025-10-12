import { AppSidebar } from '@/components/app-sidebar';
import { MethodPageComponent } from '@/app/(dashboard)/methods/_components/MethodPageComponent';
import { AuthStatus } from '@/components/auth-status';

export default function MethodsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Method Labs</h1>
            <AuthStatus />
          </div>
          <MethodPageComponent />
        </div>
      </main>
    </div>
  );
}
