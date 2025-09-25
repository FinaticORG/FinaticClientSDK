"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Code,
  Terminal,
  Zap,
  Bug,
  Cpu,
  HardDrive,
  Activity,
  Clock,
  Play,
  Download,
  Upload,
  RefreshCw,
  Settings,
} from "lucide-react"
import { useState } from "react"

const devStats = [
  {
    title: "API Calls",
    value: "45.2K",
    change: "+12.5%",
    icon: Zap,
    color: "text-blue-400",
  },
  {
    title: "Build Time",
    value: "2.3s",
    change: "-0.8s",
    icon: Clock,
    color: "text-green-400",
  },
  {
    title: "Memory Usage",
    value: "847MB",
    change: "+23MB",
    icon: HardDrive,
    color: "text-yellow-400",
  },
  {
    title: "CPU Usage",
    value: "23.4%",
    change: "-5.2%",
    icon: Cpu,
    color: "text-purple-400",
  },
]

const tools = [
  {
    name: "Code Generator",
    description: "Generate boilerplate code and components",
    icon: Code,
    status: "active",
    lastUsed: "2 minutes ago",
  },
  {
    name: "API Tester",
    description: "Test and debug API endpoints",
    icon: Bug,
    status: "active",
    lastUsed: "15 minutes ago",
  },
  {
    name: "Performance Monitor",
    description: "Monitor application performance metrics",
    icon: Activity,
    status: "running",
    lastUsed: "1 hour ago",
  },
  {
    name: "Build Optimizer",
    description: "Optimize build processes and dependencies",
    icon: Settings,
    status: "idle",
    lastUsed: "3 hours ago",
  },
]

const recentLogs = [
  {
    level: "info",
    message: "API endpoint /users successfully tested",
    timestamp: "2024-01-15 14:32:15",
    source: "api-tester",
  },
  {
    level: "warning",
    message: "Build time increased by 15% - consider optimization",
    timestamp: "2024-01-15 14:28:42",
    source: "build-optimizer",
  },
  {
    level: "error",
    message: "Memory leak detected in component UserList",
    timestamp: "2024-01-15 14:25:18",
    source: "performance-monitor",
  },
  {
    level: "info",
    message: "Code generation completed for AuthProvider",
    timestamp: "2024-01-15 14:20:33",
    source: "code-generator",
  },
]

export function DeveloperPageComponent() {
  const [debugMode, setDebugMode] = useState(false)
  const [autoOptimize, setAutoOptimize] = useState(true)
  const [codeInput, setCodeInput] = useState("")

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-400"
      case "warning":
        return "text-yellow-400"
      case "info":
        return "text-blue-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "running":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "idle":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Advanced Developer Tools</h1>
          <p className="text-muted-foreground">Professional development utilities and debugging tools</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
            <Terminal className="w-3 h-3 mr-1" />
            Dev Mode Active
          </Badge>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Play className="w-4 h-4 mr-2" />
            Run All Tools
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {devStats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p
                className={`text-xs ${stat.change.startsWith("+") ? "text-red-400" : stat.change.startsWith("-") ? "text-green-400" : "text-yellow-400"}`}
              >
                {stat.change} from last hour
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tools" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="tools">Dev Tools</TabsTrigger>
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="generator">Code Gen</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {tools.map((tool, index) => (
              <Card key={index} className="bg-card border-border hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                        <tool.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-foreground">{tool.name}</CardTitle>
                        <CardDescription className="text-muted-foreground">{tool.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(tool.status)}>
                      {tool.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last used: {tool.lastUsed}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground hover:bg-accent bg-transparent"
                      >
                        Configure
                      </Button>
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Launch
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="console" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Developer Console</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Real-time logs and debugging information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto bg-black/50 p-4 rounded-lg font-mono text-sm">
                    {recentLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-muted-foreground text-xs">{log.timestamp}</span>
                        <span className={`text-xs font-medium ${getLogLevelColor(log.level)}`}>
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="text-foreground text-xs flex-1">{log.message}</span>
                        <span className="text-muted-foreground text-xs">{log.source}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground hover:bg-accent bg-transparent"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground hover:bg-accent bg-transparent"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90">
                    <Terminal className="w-4 h-4 mr-2" />
                    Open Terminal
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border text-foreground hover:bg-accent bg-transparent"
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Debug Mode
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border text-foreground hover:bg-accent bg-transparent"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Performance Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border text-foreground hover:bg-accent bg-transparent"
                  >
                    <HardDrive className="w-4 h-4 mr-2" />
                    Memory Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="generator" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Code Generator</CardTitle>
              <CardDescription className="text-muted-foreground">
                Generate boilerplate code and components automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Component Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="border-border text-foreground hover:bg-accent bg-transparent">
                    React Component
                  </Button>
                  <Button variant="outline" className="border-border text-foreground hover:bg-accent bg-transparent">
                    API Route
                  </Button>
                  <Button variant="outline" className="border-border text-foreground hover:bg-accent bg-transparent">
                    Database Model
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Component Name</Label>
                <Input placeholder="UserProfile" className="bg-input border-border text-foreground" />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Props/Parameters</Label>
                <Textarea
                  placeholder="name: string, email: string, isActive: boolean"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="flex gap-2">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Code className="w-4 h-4 mr-2" />
                  Generate Code
                </Button>
                <Button variant="outline" className="border-border text-foreground hover:bg-accent bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Template
                </Button>
              </div>

              <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-2">Generated Code Preview</h4>
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  <code>{`// Generated React Component
interface UserProfileProps {
  name: string;
  email: string;
  isActive: boolean;
}

export function UserProfile({ name, email, isActive }: UserProfileProps) {
  return (
    <div className="user-profile">
      <h2>{name}</h2>
      <p>{email}</p>
      <span className={isActive ? 'active' : 'inactive'}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
}`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Development Settings</CardTitle>
                <CardDescription className="text-muted-foreground">Configure development environment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Debug Mode</Label>
                    <p className="text-xs text-muted-foreground">Enable detailed debugging information</p>
                  </div>
                  <Switch checked={debugMode} onCheckedChange={setDebugMode} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Auto Optimization</Label>
                    <p className="text-xs text-muted-foreground">Automatically optimize code and builds</p>
                  </div>
                  <Switch checked={autoOptimize} onCheckedChange={setAutoOptimize} />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Log Level</Label>
                  <Input defaultValue="info" className="bg-input border-border text-foreground" />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Build Target</Label>
                  <Input defaultValue="development" className="bg-input border-border text-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Performance Settings</CardTitle>
                <CardDescription className="text-muted-foreground">Configure performance monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Memory Limit (MB)</Label>
                  <Input type="number" defaultValue="1024" className="bg-input border-border text-foreground" />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">CPU Threshold (%)</Label>
                  <Input type="number" defaultValue="80" className="bg-input border-border text-foreground" />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Monitoring Interval (ms)</Label>
                  <Input type="number" defaultValue="1000" className="bg-input border-border text-foreground" />
                </div>

                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Apply Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
