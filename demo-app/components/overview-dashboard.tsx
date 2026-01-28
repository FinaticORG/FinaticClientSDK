'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, ArrowUpRight, Code2, Database, Globe, Lock, TrendingUp, Zap } from 'lucide-react';
import { useFinatic } from '@/app/providers/FinaticProvider';
import { useEffect, useReducer } from 'react';
import Link from 'next/link';

const quickActions = [
  {
    title: 'Authentication Setup',
    description: 'Configure user authentication and security',
    icon: Lock,
    href: '/auth',
    color: 'text-blue-400',
  },
  {
    title: 'Portal',
    description: 'Connect and manage your broker connections',
    icon: Globe,
    href: '/portal',
    color: 'text-green-400',
  },
  {
    title: 'Trading',
    description: 'Set up trading algorithms and contexts',
    icon: TrendingUp,
    href: '/trading',
    color: 'text-yellow-400',
  },
  {
    title: 'Developer Tools',
    description: 'Advanced development utilities',
    icon: Code2,
    href: '/developer',
    color: 'text-purple-400',
  },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unitIdx = 0;
  while (value >= 1024 && unitIdx < units.length - 1) {
    value /= 1024;
    unitIdx += 1;
  }
  return `${value.toFixed(1)} ${units[unitIdx]}`;
}

export function OverviewDashboard() {
  const { usage, clearUsage } = useFinatic();
  // Force re-render on usage updates without polling/React Query
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const handler = () => force();
    window.addEventListener('finatic-usage-updated', handler);
    return () => window.removeEventListener('finatic-usage-updated', handler);
  }, []);
  const avgApiMs = usage.totals.apiRequests
    ? Math.round(
        usage.totals.apiRequests
          ? Object.values(usage.routes).reduce((sum, r) => sum + r.totalDurationMs, 0) /
              usage.totals.apiRequests
          : 0
      )
    : 0;
  const avgMethodMs = usage.totals.methodCalls
    ? Math.round(
        usage.totals.methodCalls
          ? Object.values(usage.methods).reduce((sum, m) => sum + m.totalDurationMs, 0) /
              usage.totals.methodCalls
          : 0
      )
    : 0;
  const stats = [
    {
      title: 'API Requests',
      value: String(usage.totals.apiRequests),
      change: `${avgApiMs} ms avg`,
      icon: Zap,
    },
    {
      title: 'SDK Method Calls',
      value: String(usage.totals.methodCalls),
      change: `${avgMethodMs} ms avg`,
      icon: Activity,
    },
    {
      title: 'Data Processed',
      value: formatBytes(usage.totals.totalBytes),
      change: `${usage.totals.errors} errors`,
      icon: Database,
    },
    {
      title: 'Tracking Day',
      value: usage.day,
      change: usage.lastSavedAt
        ? `Saved ${new Date(usage.lastSavedAt).toLocaleTimeString()}`
        : 'Not saved',
      icon: Code2,
    },
  ];
  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <p className="text-muted-foreground">
          Manage your authentication, data, trading, and development tools
        </p>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
          All Systems Operational
        </Badge>
        <Button
          variant="outline"
          className="border-border"
          onClick={() => {
            // Clear SDK usage and broadcast a portal-history clear signal
            clearUsage();
            try {
              window.dispatchEvent(new Event('finatic-portal-events-cleared'));
            } catch {}
          }}
        >
          Clear Stats
        </Button>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-stretch">
          {quickActions.map(action => (
            <Link key={action.title} href={action.href} className="block h-full">
              <Card className="h-full flex flex-col bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer group">
                <CardHeader className="flex-1">
                  <div className="flex items-center justify-between">
                    <action.icon className={`h-8 w-8 ${action.color}`} />
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <CardTitle className="text-lg text-foreground">{action.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {action.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Analytics */}
      <h2 className="text-xl font-semibold text-foreground">Analytics</h2>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-green-400">{stat.change} this session</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
          <CardDescription className="text-muted-foreground">
            Latest system events and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium text-foreground mb-2">Top SDK Methods</div>
              <div className="space-y-2">
                {Object.entries(usage.methods).length === 0 && (
                  <div className="text-sm text-muted-foreground">No method calls yet</div>
                )}
                {Object.entries(usage.methods)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 5)
                  .map(([name, m]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="text-foreground">{name}</div>
                      <div className="text-sm text-muted-foreground">
                        {m.count} calls - last {Math.round(m.lastDurationMs)} ms
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground mb-2">Recent API Routes</div>
              <div className="space-y-2">
                {Object.entries(usage.routes).length === 0 && (
                  <div className="text-sm text-muted-foreground">No API requests yet</div>
                )}
                {Object.entries(usage.routes)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 5)
                  .map(([route, r]) => (
                    <div
                      key={route}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="text-foreground">{route}</div>
                      <div className="text-sm text-muted-foreground">
                        {r.count} req - last {Math.round(r.lastDurationMs)} ms -{' '}
                        {formatBytes(r.totalBytes)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
