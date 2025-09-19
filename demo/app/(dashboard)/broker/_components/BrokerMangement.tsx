"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Star,
  Loader2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useFinatic } from "@/app/providers/FinaticProvider"
import type { BrokerConnection as SDKBrokerConnection } from "@finatic/client"

const brokerStats = [
  {
    title: "Active Brokers",
    value: "24",
    change: "+3",
    icon: Building2,
    color: "text-blue-400",
  },
  {
    title: "Total Volume",
    value: "$2.4M",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-green-400",
  },
  {
    title: "Active Trades",
    value: "156",
    change: "+8.2%",
    icon: TrendingUp,
    color: "text-yellow-400",
  },
  {
    title: "Success Rate",
    value: "94.2%",
    change: "+2.1%",
    icon: Activity,
    color: "text-purple-400",
  },
]

const brokers = [
  {
    id: "1",
    name: "AlphaTrade Pro",
    type: "Institutional",
    status: "active",
    commission: "0.05%",
    volume: "$450K",
    trades: "89",
    rating: 4.8,
    lastActive: "2 minutes ago",
    features: ["API Access", "Real-time Data", "Advanced Orders"],
  },
  {
    id: "2",
    name: "TradeMaster",
    type: "Retail",
    status: "active",
    commission: "0.1%",
    volume: "$280K",
    trades: "156",
    rating: 4.6,
    lastActive: "5 minutes ago",
    features: ["Mobile App", "Research Tools", "Paper Trading"],
  },
  {
    id: "3",
    name: "QuickTrade",
    type: "Retail",
    status: "pending",
    commission: "0.08%",
    volume: "$120K",
    trades: "45",
    rating: 4.3,
    lastActive: "1 hour ago",
    features: ["Low Fees", "Fast Execution", "24/7 Support"],
  },
  {
    id: "4",
    name: "ProBroker Elite",
    type: "Institutional",
    status: "inactive",
    commission: "0.03%",
    volume: "$890K",
    trades: "234",
    rating: 4.9,
    lastActive: "2 days ago",
    features: ["Prime Brokerage", "DMA", "Algorithmic Trading"],
  },
]

 

export function BrokerManagement() {
  const [selectedBroker, setSelectedBroker] = useState("")
  const [autoRebalance, setAutoRebalance] = useState(true)
  const { finatic } = useFinatic()
  const [connections, setConnections] = useState<SDKBrokerConnection[]>([])
  const [isLoadingConnections, setIsLoadingConnections] = useState(false)
  const [connectionsError, setConnectionsError] = useState<string | null>(null)
  const [brokerNamesById, setBrokerNamesById] = useState<Record<string, string>>({})

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "inactive":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  

  const getConnectionDotColor = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
        return "bg-green-400"
      case "needs_reauth":
      case "pending":
        return "bg-yellow-400"
      case "error":
      case "disconnected":
        return "bg-red-400"
      default:
        return "bg-gray-400"
    }
  }

  const getConnectionBadge = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
        return { className: "bg-green-500/10 text-green-400 border-green-500/20", label: "Online" }
      case "needs_reauth":
        return { className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "Reauth needed" }
      case "pending":
        return { className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "Pending" }
      case "disconnected":
        return { className: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Disconnected" }
      case "error":
        return { className: "bg-red-500/10 text-red-400 border-red-500/20", label: "Error" }
      default:
        return { className: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: status || "Unknown" }
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!finatic) return
      setIsLoadingConnections(true)
      try {
        try {
          const list = await finatic.getBrokerList()
          if (!cancelled) {
            const map: Record<string, string> = {}
            for (const b of list) {
              map[b.id] = (b as any).display_name || (b as any).name || b.id
            }
            setBrokerNamesById(map)
          }
        } catch {}

        const conns = await finatic.getBrokerConnections()
        if (!cancelled) {
          setConnections(conns)
          setConnectionsError(null)
        }
      } catch (err: any) {
        if (!cancelled) setConnectionsError(err?.message || "Failed to load connections")
      } finally {
        if (!cancelled) setIsLoadingConnections(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [finatic])

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Broker Management</h1>
          <p className="text-muted-foreground">Manage trading brokers, connections, and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border text-foreground hover:bg-accent bg-transparent">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Broker
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {brokerStats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-green-400">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="brokers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="brokers">Brokers</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="brokers" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search brokers..." className="pl-9 bg-input border-border text-foreground" />
            </div>
            <Select>
              <SelectTrigger className="w-48 bg-input border-border text-foreground">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="institutional">Institutional</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {brokers.map((broker) => (
              <Card key={broker.id} className="bg-card border-border hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-foreground">{broker.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {broker.type}
                          </Badge>
                          <Badge variant="secondary" className={getStatusColor(broker.status)}>
                            {broker.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Commission:</span>
                      <div className="font-medium text-foreground">{broker.commission}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Volume:</span>
                      <div className="font-medium text-foreground">{broker.volume}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trades:</span>
                      <div className="font-medium text-foreground">{broker.trades}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-foreground">{broker.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {broker.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-border text-muted-foreground">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">Last active: {broker.lastActive}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground hover:bg-accent bg-transparent"
                      >
                        Configure
                      </Button>
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Connect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-1">
            <div>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Connection Status</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Monitor broker connections and API status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingConnections ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading connections...
                      </div>
                    ) : connectionsError ? (
                      <div className="text-sm text-red-400">{connectionsError}</div>
                    ) : connections.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No connections found.</div>
                    ) : (
                      connections.map((conn) => {
                        const badge = getConnectionBadge((conn as any).status)
                        return (
                          <div
                            key={conn.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${getConnectionDotColor((conn as any).status)}`} />
                              <div>
                                <div className="font-medium text-foreground">{brokerNamesById[conn.broker_id] || conn.broker_id}</div>
                                <div className="text-sm text-muted-foreground">{(conn as any).status || "Unknown status"}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className={badge.className}>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {badge.label}
                              </Badge>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Execution Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">45ms</div>
                <p className="text-xs text-green-400">-12ms from last week</p>
                <div className="mt-4 space-y-2">
                  {brokers.slice(0, 3).map((broker) => (
                    <div key={broker.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{broker.name}</span>
                      <span className="text-foreground">{Math.floor(Math.random() * 50 + 20)}ms</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">94.2%</div>
                <p className="text-xs text-green-400">+2.1% from last week</p>
                <div className="mt-4 space-y-2">
                  {brokers.slice(0, 3).map((broker) => (
                    <div key={broker.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{broker.name}</span>
                      <span className="text-foreground">{(Math.random() * 10 + 90).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">$2,847</div>
                <p className="text-xs text-red-400">+$234 from last week</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Commissions</span>
                    <span className="text-foreground">$1,245</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Data Fees</span>
                    <span className="text-foreground">$892</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fees</span>
                    <span className="text-foreground">$710</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Global Settings</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure broker management preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Auto-Rebalancing</Label>
                    <p className="text-xs text-muted-foreground">Automatically rebalance across brokers</p>
                  </div>
                  <Switch checked={autoRebalance} onCheckedChange={setAutoRebalance} />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Default Broker</Label>
                  <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select default broker" />
                    </SelectTrigger>
                    <SelectContent>
                      {brokers.map((broker) => (
                        <SelectItem key={broker.id} value={broker.id}>
                          {broker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Risk Tolerance</Label>
                  <Select>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Notifications</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure broker alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Connection Alerts</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Trade Confirmations</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Performance Reports</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Cost Alerts</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
