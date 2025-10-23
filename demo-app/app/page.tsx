import { AppSidebar } from '@/components/app-sidebar';
import { OverviewDashboard } from '@/components/overview-dashboard';
import { AuthStatus } from '@/components/auth-status';

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Developer Platform</h1>
            <AuthStatus />
          </div>
          <OverviewDashboard />
        </div>
      </main>
    </div>
  );
}
