"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { TrendingUp, TrendingDown, DollarSign, Target, Play, Pause, Square, Activity, CheckCircle } from "lucide-react"
import { useState } from "react"

const tradingStats = [
  {
    title: "Active Strategies",
    value: "12",
    change: "+2",
    icon: Target,
    color: "text-blue-400",
  },
  {
    title: "Total P&L",
    value: "+$45,230",
    change: "+8.2%",
    icon: DollarSign,
    color: "text-green-400",
  },
  {
    title: "Win Rate",
    value: "73.5%",
    change: "+2.1%",
    icon: TrendingUp,
    color: "text-yellow-400",
  },
  {
    title: "Active Positions",
    value: "28",
    change: "+5",
    icon: Activity,
    color: "text-purple-400",
  },
]

const strategies = [
  {
    id: "1",
    name: "Momentum Scalper",
    type: "Scalping",
    status: "running",
    pnl: "+$2,847",
    trades: "156",
    winRate: "68.2%",
    risk: "Medium",
    timeframe: "1m",
    instruments: ["EURUSD", "GBPUSD", "USDJPY"],
  },
  {
    id: "2",
    name: "Mean Reversion",
    type: "Swing",
    status: "paused",
    pnl: "+$1,234",
    trades: "89",
    winRate: "75.3%",
    risk: "Low",
    timeframe: "4h",
    instruments: ["SPY", "QQQ", "IWM"],
  },
  {
    id: "3",
    name: "Breakout Hunter",
    type: "Momentum",
    status: "running",
    pnl: "-$456",
    trades: "45",
    winRate: "62.2%",
    risk: "High",
    timeframe: "15m",
    instruments: ["BTCUSD", "ETHUSD"],
  },
  {
    id: "4",
    name: "Grid Trading",
    type: "Grid",
    status: "stopped",
    pnl: "+$3,567",
    trades: "234",
    winRate: "71.8%",
    risk: "Medium",
    timeframe: "1h",
    instruments: ["XAUUSD", "XAGUSD"],
  },
]

const positions = [
  {
    symbol: "EURUSD",
    side: "Long",
    size: "100,000",
    entry: "1.0845",
    current: "1.0867",
    pnl: "+$220",
    time: "2h 15m",
  },
  {
    symbol: "GBPUSD",
    side: "Short",
    size: "50,000",
    entry: "1.2634",
    current: "1.2618",
    pnl: "+$80",
    time: "45m",
  },
  {
    symbol: "BTCUSD",
    side: "Long",
    size: "0.5",
    entry: "42,150",
    current: "42,890",
    pnl: "+$370",
    time: "1h 30m",
  },
  {
    symbol: "SPY",
    side: "Long",
    size: "200",
    entry: "485.20",
    current: "487.45",
    pnl: "+$450",
    time: "3h 20m",
  },
]

const recentTrades = [
  {
    symbol: "EURUSD",
    side: "Long",
    size: "100,000",
    entry: "1.0823",
    exit: "1.0845",
    pnl: "+$220",
    time: "15 minutes ago",
    strategy: "Momentum Scalper",
  },
  {
    symbol: "GBPUSD",
    side: "Short",
    size: "75,000",
    entry: "1.2678",
    exit: "1.2645",
    pnl: "+$247.50",
    time: "1 hour ago",
    strategy: "Mean Reversion",
  },
  {
    symbol: "USDJPY",
    side: "Long",
    size: "100,000",
    entry: "149.85",
    exit: "149.65",
    pnl: "-$133",
    time: "2 hours ago",
    strategy: "Momentum Scalper",
  },
]

export function TradingContext() {
  const [selectedStrategy, setSelectedStrategy] = useState("")
  const [autoTrade, setAutoTrade] = useState(true)
  const [riskManagement, setRiskManagement] = useState(true)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "paused":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "stopped":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "text-green-400"
      case "Medium":
        return "text-yellow-400"
      case "High":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Trading Context</h1>
          <p className="text-muted-foreground">Manage trading strategies, positions, and market context</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Markets Open
          </Badge>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Play className="w-4 h-4 mr-2" />
            Start All
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tradingStats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-green-400">{stat.change} from yesterday</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="strategies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {strategies.map((strategy) => (
              <Card key={strategy.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{strategy.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {strategy.type}
                        </Badge>
                        <Badge variant="secondary" className={getStatusColor(strategy.status)}>
                          {strategy.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {strategy.status === "running" ? (
                        <Button variant="ghost" size="sm">
                          <Pause className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Square className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">P&L:</span>
                      <div
                        className={`font-medium ${strategy.pnl.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                      >
                        {strategy.pnl}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trades:</span>
                      <div className="font-medium text-foreground">{strategy.trades}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Win Rate:</span>
                      <div className="font-medium text-foreground">{strategy.winRate}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk:</span>
                      <div className={`font-medium ${getRiskColor(strategy.risk)}`}>{strategy.risk}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Timeframe: {strategy.timeframe}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {strategy.instruments.map((instrument, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-border text-muted-foreground">
                          {instrument}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-border text-foreground hover:bg-accent bg-transparent"
                    >
                      Configure
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Open Positions</CardTitle>
              <CardDescription className="text-muted-foreground">Currently active trading positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {position.side === "Long" ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <div>
                          <div className="font-medium text-foreground">{position.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {position.side} {position.size}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="text-muted-foreground">Entry: {position.entry}</div>
                        <div className="text-foreground">Current: {position.current}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-medium ${position.pnl.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                      >
                        {position.pnl}
                      </div>
                      <div className="text-sm text-muted-foreground">{position.time}</div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                      Close
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Trades</CardTitle>
              <CardDescription className="text-muted-foreground">Latest completed trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrades.map((trade, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {trade.side === "Long" ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <div>
                          <div className="font-medium text-foreground">{trade.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {trade.side} {trade.size}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="text-muted-foreground">
                          {trade.entry} → {trade.exit}
                        </div>
                        <div className="text-muted-foreground">{trade.strategy}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${trade.pnl.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                        {trade.pnl}
                      </div>
                      <div className="text-sm text-muted-foreground">{trade.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Trading Settings</CardTitle>
                <CardDescription className="text-muted-foreground">Configure trading behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Auto Trading</Label>
                    <p className="text-xs text-muted-foreground">Enable automatic trade execution</p>
                  </div>
                  <Switch checked={autoTrade} onCheckedChange={setAutoTrade} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Risk Management</Label>
                    <p className="text-xs text-muted-foreground">Enable automatic risk controls</p>
                  </div>
                  <Switch checked={riskManagement} onCheckedChange={setRiskManagement} />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Max Daily Loss (%)</Label>
                  <Input type="number" defaultValue="5" className="bg-input border-border text-foreground" />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Position Size (%)</Label>
                  <Input type="number" defaultValue="2" className="bg-input border-border text-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Market Context</CardTitle>
                <CardDescription className="text-muted-foreground">Current market conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Market Sentiment</Label>
                  <Select>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Auto-detect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bullish">Bullish</SelectItem>
                      <SelectItem value="bearish">Bearish</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Volatility Filter</Label>
                  <Select>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Medium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">News Filter</Label>
                  <Textarea
                    placeholder="Keywords to avoid trading during news..."
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
