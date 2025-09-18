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
import { Play, Activity, CheckCircle, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useFinatic } from "@/app/providers/FinaticProvider"

// Removed static demo arrays

export function Trading() {
  const [selectedStrategy, setSelectedStrategy] = useState("")
  const [autoTrade, setAutoTrade] = useState(true)
  const [riskManagement, setRiskManagement] = useState(true)

  // Finatic SDK
  const { finatic, addLog } = useFinatic()

  // Broker routing context
  const [selectedBroker, setSelectedBroker] = useState<"tasty_trade" | "ninja_trader" | "robinhood" | "">("")
  const [brokers, setBrokers] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [accountNumber, setAccountNumber] = useState("")
  const [connectionId, setConnectionId] = useState("")
  const [placingId, setPlacingId] = useState<string | null>(null)

  // Load supported brokers (logos, names)
  useEffect(() => {
    let cancelled = false
    const f = finatic
    async function loadBrokers() {
      try {
        if (!f) return
        const list = await f.getBrokerList()
        if (!cancelled) setBrokers(list)
      } catch {}
    }
    void loadBrokers()
    return () => {
      cancelled = true
    }
  }, [finatic])

  // Apply broker context to SDK and fetch accounts for that broker
  useEffect(() => {
    if (!finatic || !selectedBroker) return
    const f = finatic
    try {
      f.setBroker(selectedBroker as any)
    } catch {}
    let cancelled = false
    async function loadAccounts() {
      try {
        const all = await f.getActiveAccounts()
        const filtered = Array.isArray(all) ? all.filter((a: any) => a.broker_id === selectedBroker) : []
        if (!cancelled) {
          setAccounts(filtered)
          if (filtered.length && !accountNumber) {
            const candidate = (filtered[0] as any).account_id || (filtered[0] as any).broker_provided_account_id || ""
            setAccountNumber(String(candidate))
          }
        }
      } catch {}
    }
    void loadAccounts()
    return () => {
      cancelled = true
    }
  }, [finatic, selectedBroker])

  type ExampleOrder = {
    id: string
    title: string
    broker: "tasty_trade" | "ninja_trader"
    params: {
      symbol: string
      orderQty: number
      action: "Buy" | "Sell"
      orderType: "Market" | "Limit" | "Stop" | "StopLimit"
      assetType: "Stock" | "Option" | "Crypto" | "Future"
      timeInForce: "day" | "gtc" | "gtd" | "ioc" | "fok"
      price?: number
      stopPrice?: number
    }
    extras?: any
  }

  const makeDefaultExamples = useCallback((broker: "tasty_trade" | "ninja_trader"): ExampleOrder[] => {
    if (broker === "ninja_trader") {
      return [
        {
          id: "ninja-fut-mkt-buy-day",
          title: "Futures Market Buy (Day)",
          broker: "ninja_trader",
          params: {
            symbol: "MNQU5",
            orderQty: 1,
            action: "Buy",
            orderType: "Market",
            assetType: "Future",
            timeInForce: "day",
          },
          extras: { ninjaTrader: { accountSpec: "", isAutomated: true } },
        },
        {
          id: "ninja-fut-limit-sell-gtc",
          title: "Futures Limit Sell (GTC)",
          broker: "ninja_trader",
          params: {
            symbol: "MNQU5",
            orderQty: 1,
            action: "Sell",
            orderType: "Limit",
            assetType: "Future",
            timeInForce: "gtc",
            price: 1500,
          },
          extras: { ninjaTrader: { accountSpec: "", isAutomated: true } },
        },
        {
          id: "ninja-fut-stop-buy-day",
          title: "Futures Stop Buy (Day)",
          broker: "ninja_trader",
          params: {
            symbol: "MNQU5",
            orderQty: 1,
            action: "Buy",
            orderType: "Stop",
            assetType: "Future",
            timeInForce: "day",
            stopPrice: 120.5,
          },
          extras: { ninjaTrader: { accountSpec: "", isAutomated: true } },
        },
      ]
    }
    // tasty_trade
    return [
      {
        id: "tasty-equity-mkt-buy-day",
        title: "Equity Market Buy (Day)",
        broker: "tasty_trade",
        params: {
          symbol: "MSFT",
          orderQty: 3,
          action: "Buy",
          orderType: "Market",
          assetType: "Stock",
          timeInForce: "day",
        },
      },
      {
        id: "tasty-option-limit-buy-gtc",
        title: "Option Limit Buy (GTC)",
        broker: "tasty_trade",
        params: {
          symbol: "AAPL  260101C00115000",
          orderQty: 1,
          action: "Buy",
          orderType: "Limit",
          assetType: "Option",
          timeInForce: "gtc",
          price: 0.75,
        },
        extras: { tastyTrade: { priceEffect: "Debit" } },
      },
    ]
  }, [])

  const [exampleOrders, setExampleOrders] = useState<ExampleOrder[]>([])

  useEffect(() => {
    if (selectedBroker === "ninja_trader" || selectedBroker === "tasty_trade") {
      setExampleOrders(makeDefaultExamples(selectedBroker))
    } else {
      setExampleOrders([])
    }
  }, [selectedBroker, makeDefaultExamples])

  const onBrokerClick = (brokerId: "tasty_trade" | "ninja_trader" | "robinhood") => {
    setSelectedBroker(brokerId)
  }

  const updateExampleField = (id: string, key: keyof ExampleOrder["params"], value: string | number) => {
    setExampleOrders((prev) => prev.map((ex) => (ex.id === id ? { ...ex, params: { ...ex.params, [key]: value } } : ex)))
  }

  const updateExampleExtras = (id: string, path: string, value: any) => {
    setExampleOrders((prev) =>
      prev.map((ex) => {
        if (ex.id !== id) return ex
        const next = { ...(ex.extras || {}) }
        // Support shallow keys or broker-scoped extras
        const parts = path.split(".")
        let cursor: any = next
        for (let i = 0; i < parts.length - 1; i++) {
          const p = parts[i]
          cursor[p] = cursor[p] || {}
          cursor = cursor[p]
        }
        cursor[parts[parts.length - 1]] = value
        return { ...ex, extras: next }
      })
    )
  }

  const placeExampleOrder = async (ex: ExampleOrder) => {
    if (!finatic) {
      addLog("error", "SDK not initialized")
      return
    }
    if (!selectedBroker) {
      addLog("error", "Select a broker first")
      return
    }
    if (!accountNumber) {
      addLog("error", "Set an account number first")
      return
    }
    setPlacingId(ex.id)
    try {
      // Set context
      try {
        finatic.setBroker(selectedBroker as any)
        finatic.setAccount(String(accountNumber))
      } catch {}

      // Call low-level ApiClient to support all broker types
      const client: any = finatic as any
      const response = await client.apiClient.placeBrokerOrder(
        {
          broker: selectedBroker,
          accountNumber: String(accountNumber),
          ...ex.params,
        },
        ex.extras || {},
        connectionId || undefined
      )
      addLog("success", `Placed: ${ex.title} - ${response?.message || "ok"}`)
    } catch (e: any) {
      const msg = e?.message || "Order failed"
      addLog("error", msg)
    } finally {
      setPlacingId(null)
    }
  }

  // Removed unused helpers

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

      {/* Broker Selector */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Broker Router</CardTitle>
          <CardDescription className="text-muted-foreground">Select a broker and route test orders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {(brokers.length ? brokers : [
              { id: "tasty_trade", display_name: "Tastytrade", logo_path: "" },
              { id: "ninja_trader", display_name: "NinjaTrader", logo_path: "" },
            ]).map((b: any) => (
              <button
                key={b.id}
                onClick={() => onBrokerClick(b.id)}
                className={`flex items-center gap-3 rounded-lg border px-4 py-2 transition-colors ${
                  selectedBroker === b.id ? "border-primary bg-primary/10" : "border-border hover:bg-accent/10"
                }`}
              >
                {b.logo_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.logo_path} alt={b.display_name} className="h-6 w-6 rounded" />
                ) : (
                  <Activity className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm text-foreground">{b.display_name || b.id}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-foreground">Account Number</Label>
              <Input
                placeholder="e.g. 112233"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="bg-input border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">Override or select from your accounts</p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Select Account</Label>
              <Select
                value={accountNumber || undefined}
                onValueChange={(val) => setAccountNumber(val)}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder={accounts.length ? "Pick an account" : "No accounts found"} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a: any) => {
                    const val = String(a.account_id || a.broker_provided_account_id || "")
                    return (
                      <SelectItem key={val} value={val}>
                        {a.account_name || val}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Connection ID (optional)</Label>
              <Input
                placeholder="connection_id"
                value={connectionId}
                onChange={(e) => setConnectionId(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <span>Context: </span>
            <Badge variant="outline" className="mr-2">{selectedBroker || "none"}</Badge>
            <Badge variant="outline">{accountNumber || "no-account"}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Removed static stats grid */}

      {/* Main Content */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-muted">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Orders Playground</CardTitle>
              <CardDescription className="text-muted-foreground">Quickly test orders for the selected broker</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedBroker ? (
                <div className="text-sm text-muted-foreground">Select a broker above to show examples.</div>
              ) : exampleOrders.length === 0 ? (
                <div className="text-sm text-muted-foreground">No examples available.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {exampleOrders.map((ex) => (
                    <Card key={ex.id} className="bg-card border-border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-foreground text-base">{ex.title}</CardTitle>
                          <Badge variant="secondary" className="text-xs">{selectedBroker}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-foreground">Symbol</Label>
                            <Input
                              className="bg-input border-border text-foreground"
                              value={ex.params.symbol}
                              onChange={(e) => updateExampleField(ex.id, "symbol", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-foreground">Qty</Label>
                            <Input
                              type="number"
                              className="bg-input border-border text-foreground"
                              value={ex.params.orderQty}
                              onChange={(e) => updateExampleField(ex.id, "orderQty", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-foreground">Side</Label>
                            <Select value={ex.params.action} onValueChange={(v) => updateExampleField(ex.id, "action", v)}>
                              <SelectTrigger className="bg-input border-border text-foreground">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Buy">Buy</SelectItem>
                                <SelectItem value="Sell">Sell</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-foreground">Time In Force</Label>
                            <Select value={ex.params.timeInForce} onValueChange={(v) => updateExampleField(ex.id, "timeInForce", v)}>
                              <SelectTrigger className="bg-input border-border text-foreground">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="day">day</SelectItem>
                                <SelectItem value="gtc">gtc</SelectItem>
                                <SelectItem value="gtd">gtd</SelectItem>
                                <SelectItem value="ioc">ioc</SelectItem>
                                <SelectItem value="fok">fok</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {(ex.params.orderType === "Limit" || ex.params.orderType === "StopLimit" || typeof ex.params.price === "number") && (
                            <div className="space-y-1">
                              <Label className="text-foreground">Price</Label>
                              <Input
                                type="number"
                                className="bg-input border-border text-foreground"
                                value={ex.params.price ?? 0}
                                onChange={(e) => updateExampleField(ex.id, "price", Number(e.target.value))}
                              />
                            </div>
                          )}
                          {(ex.params.orderType === "Stop" || ex.params.orderType === "StopLimit" || typeof ex.params.stopPrice === "number") && (
                            <div className="space-y-1">
                              <Label className="text-foreground">Stop Price</Label>
                              <Input
                                type="number"
                                className="bg-input border-border text-foreground"
                                value={ex.params.stopPrice ?? 0}
                                onChange={(e) => updateExampleField(ex.id, "stopPrice", Number(e.target.value))}
                              />
                            </div>
                          )}
                        </div>

                        {/* Broker-specific extras (compact) */}
                        {selectedBroker === "ninja_trader" && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-foreground">Account Spec (NT)</Label>
                              <Input
                                className="bg-input border-border text-foreground"
                                value={ex.extras?.ninjaTrader?.accountSpec || ""}
                                onChange={(e) => updateExampleExtras(ex.id, "ninjaTrader.accountSpec", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-foreground">Automated</Label>
                              <Select
                                value={(ex.extras?.ninjaTrader?.isAutomated ?? true) ? "true" : "false"}
                                onValueChange={(v) => updateExampleExtras(ex.id, "ninjaTrader.isAutomated", v === "true")}
                              >
                                <SelectTrigger className="bg-input border-border text-foreground">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">true</SelectItem>
                                  <SelectItem value="false">false</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {selectedBroker === "tasty_trade" && ex.params.orderType === "Limit" && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-foreground">Price Effect</Label>
                              <Select
                                value={ex.extras?.tastyTrade?.priceEffect || "Debit"}
                                onValueChange={(v) => updateExampleExtras(ex.id, "tastyTrade.priceEffect", v)}
                              >
                                <SelectTrigger className="bg-input border-border text-foreground">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Debit">Debit</SelectItem>
                                  <SelectItem value="Credit">Credit</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => placeExampleOrder(ex)}
                            disabled={!selectedBroker || !accountNumber || placingId === ex.id}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {placingId === ex.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Placing...
                              </>
                            ) : (
                              <>Place</>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
