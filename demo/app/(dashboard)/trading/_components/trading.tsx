"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Activity, CheckCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useFinatic } from "@/app/providers/FinaticProvider"

// Removed static demo arrays

export function Trading() {
  

  // Finatic SDK
  const { finatic, addLog } = useFinatic()

  // Broker routing context
  const [selectedBroker, setSelectedBroker] = useState<"tasty_trade" | "ninja_trader" | "tradovate" | "robinhood" | "">("")
  const [brokers, setBrokers] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [accountNumber, setAccountNumber] = useState("")
  const [connectionId, setConnectionId] = useState("")
  const [placingId, setPlacingId] = useState<string | null>(null)
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({})
  const [placingAll, setPlacingAll] = useState(false)

  // Connections
  const [connections, setConnections] = useState<any[]>([])
  const [connectedBrokerIds, setConnectedBrokerIds] = useState<Record<string, boolean>>({})

  const onLogoError = useCallback((id: string) => {
    setFailedLogos((prev) => ({ ...prev, [id]: true }))
  }, [])

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

  // Load active broker connections
  useEffect(() => {
    if (!finatic) return
    let cancelled = false
    async function loadConnections() {
      try {
        const f: any = finatic as any
        let list: any[] = []
        if (typeof f.getBrokerConnections === "function") {
          list = (await f.getBrokerConnections()) || []
        } else if (f.apiClient && typeof f.apiClient.getBrokerConnections === "function") {
          list = (await f.apiClient.getBrokerConnections()) || []
        }
        if (!cancelled) {
          setConnections(list)
          const map: Record<string, boolean> = {}
          for (const c of list as any[]) {
            const brokerId = c?.broker_id || c?.broker || c?.id || ""
            const isActive = Boolean(c?.is_active || c?.active || c?.status === "connected")
            if (brokerId && isActive) map[brokerId] = true
          }
          setConnectedBrokerIds(map)
        }
      } catch {}
    }
    void loadConnections()
    return () => {
      cancelled = true
    }
  }, [finatic])

  // Apply broker context to SDK and fetch accounts for that broker
  useEffect(() => {
    if (!finatic || !selectedBroker) return
    const f = finatic
    try {
      ;(f as any).setBroker(selectedBroker as any)
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
      assetType: "equity" | "equity_option" | "crypto" | "forex" | "future" | "future_option"
      timeInForce: "day" | "gtc" | "gtd" | "ioc" | "fok"
      price?: number
      stopPrice?: number
    }
    extras?: any
  }

  const makeDefaultExamples = useCallback((broker: "tasty_trade" | "ninja_trader" | "tradovate"): ExampleOrder[] => {
    if (broker === "ninja_trader" || broker === "tradovate") {
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
            assetType: "future",
            timeInForce: "day",
          },
          extras: { ninjaTrader: { accountSpec: "", isAutomated: true } },
        },
        {
          id: "ninja-fut-mkt-sell-day",
          title: "Futures Market Sell (Day)",
          broker: "ninja_trader",
          params: {
            symbol: "MNQU5",
            orderQty: 1,
            action: "Sell",
            orderType: "Market",
            assetType: "future",
            timeInForce: "day",
          },
          extras: { ninjaTrader: { accountSpec: "", isAutomated: true } },
        },
        {
          id: "ninja-fut-limit-buy-gtc",
          title: "Futures Limit Buy (GTC)",
          broker: "ninja_trader",
          params: {
            symbol: "MNQU5",
            orderQty: 1,
            action: "Buy",
            orderType: "Limit",
            assetType: "future",
            timeInForce: "gtc",
            price: 1500,
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
            assetType: "future",
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
            assetType: "future",
            timeInForce: "day",
            stopPrice: 120.5,
          },
          extras: { ninjaTrader: { accountSpec: "", isAutomated: true } },
        },
        {
          id: "ninja-fut-stop-sell-day",
          title: "Futures Stop Sell (Day)",
          broker: "ninja_trader",
          params: {
            symbol: "MNQU5",
            orderQty: 1,
            action: "Sell",
            orderType: "Stop",
            assetType: "future",
            timeInForce: "day",
            stopPrice: 120.5,
          },
          extras: { ninjaTrader: { accountSpec: "", isAutomated: true } },
        },
        {
          id: "ninja-fut-stoplimit-buy-day",
          title: "Futures Stop Limit Buy (Day)",
          broker: "ninja_trader",
          params: {
            symbol: "MNQU5",
            orderQty: 1,
            action: "Buy",
            orderType: "StopLimit",
            assetType: "future",
            timeInForce: "day",
            price: 1500,
            stopPrice: 120.5,
          },
          extras: { ninjaTrader: { accountSpec: "", isAutomated: true } },
        },
        {
          id: "ninja-fut-stoplimit-sell-day",
          title: "Futures Stop Limit Sell (Day)",
          broker: "ninja_trader",
          params: {
            symbol: "MNQU5",
            orderQty: 1,
            action: "Sell",
            orderType: "StopLimit",
            assetType: "future",
            timeInForce: "day",
            price: 1500,
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
          assetType: "equity",
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
          assetType: "equity_option",
          timeInForce: "gtc",
          price: 0.75,
        },
        extras: { tastyTrade: { priceEffect: "Debit" } },
      },
    ]
  }, [])

  const [exampleOrders, setExampleOrders] = useState<ExampleOrder[]>([])

  useEffect(() => {
    if (selectedBroker === "ninja_trader" || selectedBroker === "tradovate" || selectedBroker === "tasty_trade") {
      setExampleOrders(makeDefaultExamples(selectedBroker as any))
    } else {
      setExampleOrders([])
    }
  }, [selectedBroker, makeDefaultExamples])

  const onBrokerClick = (brokerId: "tasty_trade" | "ninja_trader" | "tradovate" | "robinhood") => {
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
        ;(finatic as any).setBroker(selectedBroker as any)
        ;(finatic as any).setAccount(String(accountNumber))
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

  const placeAllOrders = async () => {
    if (!exampleOrders.length) return
    setPlacingAll(true)
    try {
      for (const ex of exampleOrders) {
        // Sequential to avoid potential rate limits
        // eslint-disable-next-line no-await-in-loop
        await placeExampleOrder(ex)
      }
      addLog("success", "Placed all example orders")
    } catch (e: any) {
      addLog("error", e?.message || "Failed placing all example orders")
    } finally {
      setPlacingAll(false)
    }
  }

  // Ad-hoc order playground state
  const [customOrder, setCustomOrder] = useState<{
    symbol: string
    orderQty: number
    action: "Buy" | "Sell"
    orderType: "Market" | "Limit" | "Stop" | "StopLimit"
    assetType: "equity" | "equity_option" | "crypto" | "forex" | "future" | "future_option"
    timeInForce: "day" | "gtc" | "gtd" | "ioc" | "fok"
    price?: number
    stopPrice?: number
  }>({
    symbol: "",
    orderQty: 1,
    action: "Buy",
    orderType: "Market",
    assetType: "equity",
    timeInForce: "day",
  })
  const [customExtrasText, setCustomExtrasText] = useState<string>("{}")
  const [placingCustom, setPlacingCustom] = useState<boolean>(false)
  const [customResponse, setCustomResponse] = useState<any>(null)
  const [isOrdersPlaygroundOpen, setIsOrdersPlaygroundOpen] = useState(false)
  const [isExamplePlaygroundOpen, setIsExamplePlaygroundOpen] = useState(false)

  const placeCustomOrder = async () => {
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
    let extras: any = {}
    try {
      extras = customExtrasText ? JSON.parse(customExtrasText) : {}
    } catch {
      addLog("error", "Invalid JSON in extras")
      return
    }
    setPlacingCustom(true)
    setCustomResponse(null)
    try {
      try {
        ;(finatic as any).setBroker(selectedBroker as any)
        ;(finatic as any).setAccount(String(accountNumber))
      } catch {}
      const client: any = finatic as any
      const response = await client.apiClient.placeBrokerOrder(
        {
          broker: selectedBroker,
          accountNumber: String(accountNumber),
          ...customOrder,
        },
        extras || {},
        connectionId || undefined
      )
      setCustomResponse(response)
      addLog("success", `Placed custom order - ${response?.message || "ok"}`)
    } catch (e: any) {
      setCustomResponse({ error: e?.message || "Order failed" })
      addLog("error", e?.message || "Order failed")
    } finally {
      setPlacingCustom(false)
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
          <Button onClick={placeAllOrders} disabled={!selectedBroker || !accountNumber || !exampleOrders.length || placingAll} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {placingAll ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Place All Orders
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Place All Orders
              </>
            )}
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
                } ${connectedBrokerIds[b.id] ? "border-green-500 bg-green-500/10 animate-pulse" : ""}`}
              >
                {b.logo_path && !failedLogos[b.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.logo_path} alt={b.display_name} className="h-6 w-6 rounded" onError={() => onLogoError(b.id)} />
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
          {connections.length > 0 && (
            <div className="text-sm text-muted-foreground mt-2 flex flex-wrap items-center gap-2">
              <span>Active connections:</span>
              {connections.map((c: any) => {
                const id = c?.connection_id || c?.id || ""
                const broker = c?.broker_id || c?.broker || ""
                const label = broker && id ? `${broker}:${id}` : id || broker || "unknown"
                const isActive = Boolean(c?.is_active || c?.active || c?.status === "connected")
                return (
                  <Badge key={`${broker}-${id}`} variant={isActive ? "secondary" : "outline"} className={isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : ""}>
                    {label}
                  </Badge>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Playground (ad-hoc) */}
      <Card className="bg-card border-border">
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
            onClick={() => setIsOrdersPlaygroundOpen(!isOrdersPlaygroundOpen)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="text-left">
                <CardTitle className="text-foreground">Orders Playground</CardTitle>
                <CardDescription className="text-muted-foreground">Compose and place any order. Response shown on the right.</CardDescription>
              </div>
              {isOrdersPlaygroundOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </Button>
        </CardHeader>
        {isOrdersPlaygroundOpen && (
          <CardContent>
          {!selectedBroker ? (
            <div className="text-sm text-muted-foreground">Select a broker above to place orders.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-foreground">Symbol</Label>
                    <Input
                      className="bg-input border-border text-foreground w-full"
                      value={customOrder.symbol}
                      onChange={(e) => setCustomOrder((p) => ({ ...p, symbol: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-foreground">Qty</Label>
                    <Input
                      type="number"
                      className="bg-input border-border text-foreground w-full"
                      value={customOrder.orderQty}
                      onChange={(e) => setCustomOrder((p) => ({ ...p, orderQty: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-foreground">Side</Label>
                    <Select value={customOrder.action} onValueChange={(v) => setCustomOrder((p) => ({ ...p, action: v as any }))}>
                      <SelectTrigger className="bg-input border-border text-foreground w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Buy">Buy</SelectItem>
                        <SelectItem value="Sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-foreground">Order Type</Label>
                    <Select value={customOrder.orderType} onValueChange={(v) => setCustomOrder((p) => ({ ...p, orderType: v as any }))}>
                      <SelectTrigger className="bg-input border-border text-foreground w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Market">Market</SelectItem>
                        <SelectItem value="Limit">Limit</SelectItem>
                        <SelectItem value="Stop">Stop</SelectItem>
                        <SelectItem value="StopLimit">StopLimit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-foreground">Asset Type</Label>
                    <Select value={customOrder.assetType} onValueChange={(v) => setCustomOrder((p) => ({ ...p, assetType: v as any }))}>
                      <SelectTrigger className="bg-input border-border text-foreground w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stock">Stock</SelectItem>
                        <SelectItem value="Option">Option</SelectItem>
                        <SelectItem value="Crypto">Crypto</SelectItem>
                        <SelectItem value="Future">Future</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-foreground">Time In Force</Label>
                    <Select value={customOrder.timeInForce} onValueChange={(v) => setCustomOrder((p) => ({ ...p, timeInForce: v as any }))}>
                      <SelectTrigger className="bg-input border-border text-foreground w-full">
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
                  {(customOrder.orderType === "Limit" || customOrder.orderType === "StopLimit") && (
                    <div className="space-y-1">
                      <Label className="text-foreground">Price</Label>
                      <Input
                        type="number"
                        className="bg-input border-border text-foreground w-full"
                        value={customOrder.price ?? 0}
                        onChange={(e) => setCustomOrder((p) => ({ ...p, price: Number(e.target.value) }))}
                      />
                    </div>
                  )}
                  {(customOrder.orderType === "Stop" || customOrder.orderType === "StopLimit") && (
                    <div className="space-y-1">
                      <Label className="text-foreground">Stop Price</Label>
                      <Input
                        type="number"
                        className="bg-input border-border text-foreground w-full"
                        value={customOrder.stopPrice ?? 0}
                        onChange={(e) => setCustomOrder((p) => ({ ...p, stopPrice: Number(e.target.value) }))}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground">Extras (JSON)</Label>
                  <Textarea
                    className="bg-input border-border text-foreground min-h-24"
                    value={customExtrasText}
                    onChange={(e) => setCustomExtrasText(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={placeCustomOrder} disabled={!selectedBroker || !accountNumber || placingCustom} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
                    {placingCustom ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing...
                      </>
                    ) : (
                      <>Place Order</>
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Response</Label>
                <div className="rounded-md border border-border/60 bg-muted/10 p-3 max-h-72 overflow-auto text-xs text-foreground">
                  {customResponse ? (
                    <pre className="whitespace-pre-wrap break-words">{JSON.stringify(customResponse, null, 2)}</pre>
                  ) : (
                    <div className="text-muted-foreground">No response yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
          </CardContent>
        )}
      </Card>

      {/* Orders Example Playground */}
      <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto hover:bg-transparent"
                onClick={() => setIsExamplePlaygroundOpen(!isExamplePlaygroundOpen)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <CardTitle className="text-foreground">Orders Example Playground</CardTitle>
                    <CardDescription className="text-muted-foreground">Quickly test example orders for the selected broker</CardDescription>
                  </div>
                  {isExamplePlaygroundOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </Button>
            </CardHeader>
            {isExamplePlaygroundOpen && (
              <CardContent>
              {!selectedBroker ? (
                <div className="text-sm text-muted-foreground">Select a broker above to show examples.</div>
              ) : exampleOrders.length === 0 ? (
                <div className="text-sm text-muted-foreground">No examples available.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                              className="bg-input border-border text-foreground w-full"
                              value={ex.params.symbol}
                              onChange={(e) => updateExampleField(ex.id, "symbol", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-foreground">Qty</Label>
                            <Input
                              type="number"
                              className="bg-input border-border text-foreground w-full"
                              value={ex.params.orderQty}
                              onChange={(e) => updateExampleField(ex.id, "orderQty", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-foreground">Side</Label>
                            <Select value={ex.params.action} onValueChange={(v) => updateExampleField(ex.id, "action", v)}>
                              <SelectTrigger className="bg-input border-border text-foreground w-full">
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
                              <SelectTrigger className="bg-input border-border text-foreground w-full">
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
                        </div>

                        <details className="rounded-md border border-border/60 p-3 mt-1">
                          <summary className="cursor-pointer text-sm text-muted-foreground">Advanced</summary>
                          <div className="mt-3 grid grid-cols-2 gap-3">
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

                            {selectedBroker === "ninja_trader" && (
                              <>
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
                              </>
                            )}

                            {selectedBroker === "tasty_trade" && ex.params.orderType === "Limit" && (
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
                            )}
                          </div>
                        </details>

                        <div className="flex gap-2 pt-1">
                          <Button
                            onClick={() => placeExampleOrder(ex)}
                            disabled={!selectedBroker || !accountNumber || placingId === ex.id}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
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
            )}
          </Card>
      </div>
    </div>
  )
}
