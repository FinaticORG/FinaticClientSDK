"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, ArrowUpRight, Code2, Database, Lock, TrendingUp, Zap, Clock } from "lucide-react"

const quickActions = [
  {
    title: "Authentication Setup",
    description: "Configure user authentication and security",
    icon: Lock,
    href: "/auth",
    color: "text-blue-400",
  },
  {
    title: "Database Management",
    description: "Manage your data models and queries",
    icon: Database,
    href: "/data",
    color: "text-green-400",
  },
  {
    title: "Trading Context",
    description: "Set up trading algorithms and contexts",
    icon: TrendingUp,
    href: "/trading",
    color: "text-yellow-400",
  },
  {
    title: "Developer Tools",
    description: "Advanced development utilities",
    icon: Code2,
    href: "/developer",
    color: "text-purple-400",
  },
]

const stats = [
  {
    title: "Active Sessions",
    value: "2,847",
    change: "+12.5%",
    icon: Activity,
  },
  {
    title: "API Requests",
    value: "45.2K",
    change: "+8.2%",
    icon: Zap,
  },
  {
    title: "Data Processed",
    value: "1.2TB",
    change: "+23.1%",
    icon: Database,
  },
  {
    title: "Uptime",
    value: "99.9%",
    change: "+0.1%",
    icon: Clock,
  },
]

export function OverviewDashboard() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Developer Platform</h1>
          <p className="text-muted-foreground">Manage your authentication, data, trading, and development tools</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
            All Systems Operational
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-green-400">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer group"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <action.icon className={`h-8 w-8 ${action.color}`} />
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <CardTitle className="text-lg text-foreground">{action.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{action.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
          <CardDescription className="text-muted-foreground">Latest system events and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "Authentication system updated",
                time: "2 minutes ago",
                type: "security",
              },
              {
                action: "Database backup completed",
                time: "15 minutes ago",
                type: "data",
              },
              {
                action: "Trading algorithm deployed",
                time: "1 hour ago",
                type: "trading",
              },
              {
                action: "New developer tools installed",
                time: "3 hours ago",
                type: "development",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-foreground">{activity.action}</span>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
