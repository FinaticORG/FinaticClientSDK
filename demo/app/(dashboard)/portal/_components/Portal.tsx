"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useFinatic } from "@/app/providers/FinaticProvider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, CircleX, Mail, Filter, Trash2, DoorOpen, RefreshCw } from "lucide-react"
import type { BrokerInfo } from "@/../src/types/api/broker"

type PortalEvent = { type: string; data: unknown; timestamp: string }

// Removed hard-coded brokers. We'll load from SDK.

export default function Portal(): JSX.Element {
  const { finatic, storedUserId, setStoredUserId, clearStoredUserId, addLog } = useFinatic()
  const [portalMessage, setPortalMessage] = useState<string>("")
  const [portalError, setPortalError] = useState<string>("")
  const [portalEvents, setPortalEvents] = useState<PortalEvent[]>([])
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([])
  const [customBrokers, setCustomBrokers] = useState<string>("")
  const [emailParam, setEmailParam] = useState<string>("")
  const [availableBrokers, setAvailableBrokers] = useState<BrokerInfo[] | null>(null)
  const [brokersError, setBrokersError] = useState<string>("")
  const [brokersLoading, setBrokersLoading] = useState<boolean>(false)

  // Avoid calling SDK methods during render - compute in effects and store locally
  const [isAuthed, setIsAuthed] = useState<boolean>(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!finatic) {
      setIsAuthed(false)
      setCurrentUserId(null)
      setAvailableBrokers(null)
      return
    }
    // Read synchronously but in effect to avoid rendering phase side-effects
    try {
      const authed = typeof finatic.isAuthed === "function" ? Boolean(finatic.isAuthed()) : false
      const uid = typeof finatic.getUserId === "function" ? (finatic.getUserId() as unknown as string | null) : null
      if (!cancelled) {
        setIsAuthed(authed)
        setCurrentUserId(uid || null)
      }
    } catch {
      if (!cancelled) {
        setIsAuthed(false)
        setCurrentUserId(null)
      }
    }
    return () => {
      cancelled = true
    }
  }, [finatic])

  // Load broker list regardless of auth
  useEffect(() => {
    let cancelled = false
    async function loadBrokers() {
      if (!finatic) return
      try {
        setBrokersLoading(true)
        setBrokersError("")
        const list = await finatic.getBrokerList()
        if (!cancelled) {
          setAvailableBrokers(list)
        }
      } catch (err: any) {
        if (!cancelled) {
          setBrokersError(err?.message || 'Failed to load brokers')
        }
      } finally {
        if (!cancelled) setBrokersLoading(false)
      }
    }
    void loadBrokers()
    return () => {
      cancelled = true
    }
  }, [finatic])

  const brokerFilter: string[] = useMemo(() => {
    if (customBrokers.trim()) {
      return customBrokers
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean)
    }
    return selectedBrokers
  }, [customBrokers, selectedBrokers])

  const handleOpenPortal = useCallback(async () => {
    if (!finatic) return
    addLog("info", "Opening portal...")
    setPortalMessage("")
    setPortalError("")
    setPortalEvents([])

    if (brokerFilter.length > 0) {
      addLog("info", `Filtering portal to show brokers: ${brokerFilter.join(", ")}`)
    }

    try {
      const options: Record<string, unknown> = {}
      if (brokerFilter.length > 0) options.brokers = brokerFilter
      if (emailParam.trim()) {
        options.email = emailParam.trim()
        addLog("info", `Opening portal with email prefill: ${emailParam.trim()}`)
      }

      await finatic.openPortal({
        ...options,
        onSuccess: (userId: string) => {
          addLog("success", `Portal opened successfully for user: ${userId}`)
          setPortalMessage("Portal opened successfully")
          setStoredUserId(userId)
          addLog("info", `Stored userId in localStorage: ${userId}`)
          setIsAuthed(true)
          setCurrentUserId(userId)
          setPortalEvents((prev) => [
            ...prev,
            { type: "portal-success", data: { userId }, timestamp: new Date().toLocaleTimeString() },
          ])
        },
        onError: (error: Error) => {
          setPortalError(error.message)
          addLog("error", error.message)
          setPortalEvents((prev) => [
            ...prev,
            { type: "portal-error", data: { message: error.message }, timestamp: new Date().toLocaleTimeString() },
          ])
        },
        onClose: () => {
          addLog("info", "Portal closed")
          setPortalEvents((prev) => [...prev, { type: "portal-close", data: {}, timestamp: new Date().toLocaleTimeString() }])
        },
        onEvent: (type: string, data: unknown) => {
          addLog("info", `Portal event: ${type} - ${JSON.stringify(data)}`)
          setPortalEvents((prev) => [...prev, { type, data, timestamp: new Date().toLocaleTimeString() }])
        },
      } as any)
    } catch (err: any) {
      setPortalError(err?.message || "Unknown error")
      addLog("error", err?.message || "Unknown error")
    }
  }, [finatic, addLog, brokerFilter, emailParam, setStoredUserId])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="size-3" /> Authenticated
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <CircleX className="size-3" /> Not authenticated
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portal</CardTitle>
          <CardDescription>Open the embedded authentication portal with optional filters.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="gap-2">
                  <Mail className="size-4" /> Email prefill (optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={emailParam}
                    onChange={(e) => setEmailParam(e.target.value)}
                  />
                  <Button variant="outline" onClick={() => setEmailParam("")}>
                    Clear
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="custom-brokers" className="gap-2">
                  <Filter className="size-4" /> Broker filter (comma-separated)
                </Label>
                <Input
                  id="custom-brokers"
                  placeholder="e.g., tradovate, ib, schwab"
                  value={customBrokers}
                  onChange={(e) => setCustomBrokers(e.target.value)}
                />
                <div className="text-xs text-muted-foreground">Overrides the checkboxes below when provided.</div>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">Available brokers</div>
                {brokersLoading ? (
                  <div className="text-xs text-muted-foreground flex items-center gap-2"><RefreshCw className="size-3 animate-spin"/> Loading brokers...</div>
                ) : brokersError ? (
                  <div className="text-xs text-red-600">{brokersError}</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(availableBrokers || []).map((broker) => {
                      const key = broker.name
                      const checked = selectedBrokers.includes(key)
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setSelectedBrokers((prev) =>
                              prev.includes(key) ? prev.filter((b) => b !== key) : [...prev, key]
                            )
                          }
                          className={`text-sm border rounded-md px-3 py-2 text-left transition-colors ${
                            checked ? "bg-accent border-primary" : "hover:bg-accent"
                          }`}
                          aria-pressed={checked}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{broker.display_name || broker.name}</span>
                            {checked ? <Badge>On</Badge> : <Badge variant="outline">Off</Badge>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Current user</div>
                <div className="text-sm font-mono border rounded-md px-3 py-2">{currentUserId || "Not authenticated"}</div>
                {storedUserId ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => clearStoredUserId()} className="gap-2">
                      <Trash2 className="size-4" /> Clear stored user
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">Effective options</div>
                <div className="flex flex-wrap gap-2">
                  {emailParam.trim() ? <Badge className="gap-1"><Mail className="size-3"/> {emailParam.trim()}</Badge> : null}
                  {brokerFilter.length > 0 ? (
                    <Badge variant="secondary" className="gap-1">
                      <Filter className="size-3" /> {brokerFilter.join(", ")}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <Button onClick={handleOpenPortal} disabled={!finatic} className="gap-2">
                <DoorOpen className="size-4" /> Open Portal
              </Button>

              {portalMessage ? (
                <div className="text-sm text-green-600">{portalMessage}</div>
              ) : null}
              {portalError ? (
                <div className="text-sm text-red-600">Error: {portalError}</div>
              ) : null}
            </div>
          </div>

          {portalEvents.length > 0 ? (
            <div className="grid gap-2">
              <div className="text-sm font-medium">Portal events</div>
              <Card className="border-dashed">
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="p-2 grid gap-2">
                      {portalEvents.map((event, idx) => (
                        <div key={idx} className="border rounded-md bg-background p-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-mono">{event.type}</span>
                            <span className="font-mono">{event.timestamp}</span>
                          </div>
                          <pre className="text-xs mt-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(event.data, null, 2)}</pre>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}


