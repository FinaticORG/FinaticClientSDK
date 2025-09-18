"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Database,
  Table,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  BarChart3,
  HardDrive,
  Zap,
  Clock,
} from "lucide-react"
import { useState } from "react"

const dataStats = [
  {
    title: "Total Records",
    value: "2.4M",
    change: "+12.5%",
    icon: Database,
    color: "text-blue-400",
  },
  {
    title: "Storage Used",
    value: "847GB",
    change: "+8.2%",
    icon: HardDrive,
    color: "text-green-400",
  },
  {
    title: "Queries/Hour",
    value: "15.2K",
    change: "+23.1%",
    icon: Zap,
    color: "text-yellow-400",
  },
  {
    title: "Avg Response",
    value: "45ms",
    change: "-5.3%",
    icon: Clock,
    color: "text-purple-400",
  },
]

const tables = [
  {
    name: "users",
    records: "125,847",
    size: "2.3GB",
    lastUpdated: "2 minutes ago",
    status: "active",
  },
  {
    name: "orders",
    records: "892,156",
    size: "15.7GB",
    lastUpdated: "5 minutes ago",
    status: "active",
  },
  {
    name: "products",
    records: "45,923",
    size: "890MB",
    lastUpdated: "1 hour ago",
    status: "active",
  },
  {
    name: "analytics",
    records: "1,234,567",
    size: "45.2GB",
    lastUpdated: "3 hours ago",
    status: "syncing",
  },
]

const recentQueries = [
  {
    query: "SELECT * FROM users WHERE created_at > '2024-01-01'",
    duration: "23ms",
    rows: "1,247",
    time: "2 minutes ago",
    status: "success",
  },
  {
    query: "UPDATE orders SET status = 'shipped' WHERE id IN (...)",
    duration: "156ms",
    rows: "89",
    time: "5 minutes ago",
    status: "success",
  },
  {
    query: "SELECT COUNT(*) FROM products GROUP BY category",
    duration: "45ms",
    rows: "12",
    time: "10 minutes ago",
    status: "success",
  },
  {
    query: "DELETE FROM temp_data WHERE created_at < NOW() - INTERVAL 7 DAY",
    duration: "2.3s",
    rows: "15,678",
    time: "1 hour ago",
    status: "warning",
  },
]

export function DataManagement() {
  const [selectedTable, setSelectedTable] = useState("users")
  const [queryText, setQueryText] = useState("")

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Management</h1>
          <p className="text-muted-foreground">Manage databases, tables, and data operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border text-foreground hover:bg-accent bg-transparent">
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Table
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dataStats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p
                className={`text-xs ${stat.change.startsWith("+") ? "text-green-400" : stat.change.startsWith("-") ? "text-red-400" : "text-yellow-400"}`}
              >
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tables" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="query">Query Builder</TabsTrigger>
          <TabsTrigger value="backup">Backup & Sync</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tables..." className="pl-9 bg-input border-border text-foreground" />
            </div>
            <Button variant="outline" className="border-border text-foreground hover:bg-accent bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="border-border text-foreground hover:bg-accent bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Database Tables</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your database tables and records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tables.map((table, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                        <Table className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{table.name}</h3>
                          <Badge
                            variant={table.status === "active" ? "default" : "secondary"}
                            className={
                              table.status === "active"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            }
                          >
                            {table.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{table.records} records</span>
                          <span>{table.size}</span>
                          <span>Updated {table.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">SQL Query Builder</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Write and execute SQL queries against your database
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Select Table</Label>
                    <Select value={selectedTable} onValueChange={setSelectedTable}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tables.map((table) => (
                          <SelectItem key={table.name} value={table.name}>
                            {table.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">SQL Query</Label>
                    <Textarea
                      placeholder="SELECT * FROM users WHERE..."
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                      className="min-h-32 bg-input border-border text-foreground font-mono"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Execute Query</Button>
                    <Button variant="outline" className="border-border text-foreground hover:bg-accent bg-transparent">
                      Save Query
                    </Button>
                    <Button variant="outline" className="border-border text-foreground hover:bg-accent bg-transparent">
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Query Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Execute a query to see results here</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentQueries.map((query, index) => (
                      <div key={index} className="p-3 border border-border rounded-lg space-y-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground block truncate">
                          {query.query}
                        </code>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{query.duration}</span>
                          <span>{query.rows} rows</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{query.time}</span>
                          <Badge
                            variant={query.status === "success" ? "default" : "secondary"}
                            className={
                              query.status === "success"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            }
                          >
                            {query.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Database Backup</CardTitle>
                <CardDescription className="text-muted-foreground">Create and manage database backups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Backup Name</Label>
                  <Input placeholder="backup-2024-01-15" className="bg-input border-border text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Tables to Include</Label>
                  <Select>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select tables" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tables</SelectItem>
                      <SelectItem value="users">Users Only</SelectItem>
                      <SelectItem value="orders">Orders Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Create Backup</Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Sync Settings</CardTitle>
                <CardDescription className="text-muted-foreground">Configure data synchronization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Sync Frequency</Label>
                  <Select>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Destination</Label>
                  <Input placeholder="s3://backup-bucket" className="bg-input border-border text-foreground" />
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Update Sync Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Database Analytics</CardTitle>
              <CardDescription className="text-muted-foreground">Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-foreground">Query Performance</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">98.5%</div>
                  <p className="text-xs text-muted-foreground">Queries under 100ms</p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-foreground">Index Usage</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">87.2%</div>
                  <p className="text-xs text-muted-foreground">Queries using indexes</p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-foreground">Storage Efficiency</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">76.8%</div>
                  <p className="text-xs text-muted-foreground">Storage optimization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
