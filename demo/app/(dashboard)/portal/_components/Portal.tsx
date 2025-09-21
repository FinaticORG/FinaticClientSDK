"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useFinatic } from "@/app/providers/FinaticProvider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, CircleX, Mail, Trash2, DoorOpen, RefreshCw, ChevronDown, Palette } from "lucide-react"
import type { BrokerInfo } from "@/../src/types/api/broker"

type PortalEvent = { type: string; data: unknown; timestamp: string }

// Removed hard-coded brokers. We'll load from SDK.

export default function Portal(): JSX.Element {
  const { finatic, storedUserId, setStoredUserId, clearStoredUserId, addLog } = useFinatic()
  const [portalMessage, setPortalMessage] = useState<string>("")
  const [portalError, setPortalError] = useState<string>("")
  const [portalEvents, setPortalEvents] = useState<PortalEvent[]>([])
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([])
  const [emailParam, setEmailParam] = useState<string>("")
  const [themePreset, setThemePreset] = useState<string>("")
  const [availableBrokers, setAvailableBrokers] = useState<BrokerInfo[] | null>(null)
  const [brokersError, setBrokersError] = useState<string>("")
  const [brokersLoading, setBrokersLoading] = useState<boolean>(false)

  // Avoid calling SDK methods during render - compute in effects and store locally
  const [isAuthed, setIsAuthed] = useState<boolean>(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [optionsOpen, setOptionsOpen] = useState<boolean>(true)
  const [eventsOpen, setEventsOpen] = useState<boolean>(true)

  // Persist portal event history for the current day
  const getDayKey = useCallback(() => `finatic-portal-events-${new Date().toISOString().slice(0, 10)}` , [])

  const loadHistory = useCallback(() => {
    try {
      const raw = localStorage.getItem(getDayKey())
      if (!raw) return [] as PortalEvent[]
      const parsed = JSON.parse(raw) as PortalEvent[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return [] as PortalEvent[]
    }
  }, [getDayKey])

  const saveHistory = useCallback((events: PortalEvent[]) => {
    try {
      localStorage.setItem(getDayKey(), JSON.stringify(events))
    } catch {}
  }, [getDayKey])

  const appendEvent = useCallback((event: PortalEvent) => {
    setPortalEvents((prev) => {
      const next = [...prev, event]
      saveHistory(next)
      return next
    })
  }, [saveHistory])

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

  // Initialize event history for today
  useEffect(() => {
    setPortalEvents(loadHistory())
  }, [loadHistory])

  const clearEvents = useCallback(() => {
    try {
      localStorage.removeItem(getDayKey())
    } catch {}
    setPortalEvents([])
    addLog("info", "Cleared portal events for today")
  }, [getDayKey, addLog])

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

  const brokerFilter: string[] = useMemo(() => selectedBrokers, [selectedBrokers])

  const handleOpenPortal = useCallback(async () => {
    if (!finatic) return
    addLog("info", "Opening portal...")
    setPortalMessage("")
    setPortalError("")
    appendEvent({ type: "portal-open", data: {}, timestamp: new Date().toLocaleTimeString() })

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
      if (themePreset.trim()) {
        options.theme = { preset: themePreset.trim() }
        addLog("info", `Opening portal with theme preset: ${themePreset.trim()}`)
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
          appendEvent({ type: "portal-success", data: { userId }, timestamp: new Date().toLocaleTimeString() })
        },
        onError: (error: Error) => {
          setPortalError(error.message)
          addLog("error", error.message)
          appendEvent({ type: "portal-error", data: { message: error.message }, timestamp: new Date().toLocaleTimeString() })
        },
        onClose: () => {
          addLog("info", "Portal closed")
          appendEvent({ type: "portal-close", data: {}, timestamp: new Date().toLocaleTimeString() })
        },
        onEvent: (type: string, data: unknown) => {
          addLog("info", `Portal event: ${type} - ${JSON.stringify(data)}`)
          appendEvent({ type, data, timestamp: new Date().toLocaleTimeString() })
        },
      } as any)
    } catch (err: any) {
      setPortalError(err?.message || "Unknown error")
      addLog("error", err?.message || "Unknown error")
    }
  }, [finatic, addLog, brokerFilter, emailParam, themePreset, setStoredUserId, appendEvent])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle2 className="size-3" /> Authenticated
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <CircleX className="size-3" /> Not authenticated
            </Badge>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleOpenPortal} disabled={!finatic} className="gap-2 px-6">
          <DoorOpen className="size-4" /> Open Portal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <button type="button" onClick={() => setOptionsOpen((v) => !v)} className="flex w-full items-center justify-between">
            <div className="text-left">
              <CardTitle>Portal options</CardTitle>
              <CardDescription>Open the embedded authentication portal with optional options.</CardDescription>
            </div>
            <ChevronDown className={`size-4 transition-transform ${optionsOpen ? 'rotate-180' : ''}`} />
          </button>
        </CardHeader>
        {optionsOpen ? (
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEmailParam("")}
                  aria-label="Clear email prefill"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="theme" className="gap-2">
                <Palette className="size-4" /> Theme preset (optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="theme"
                  type="text"
                  placeholder="corporateBlue"
                  value={themePreset}
                  onChange={(e) => setThemePreset(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setThemePreset("")}
                  aria-label="Clear theme preset"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Current user</div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-mono border rounded-md px-3 py-2 flex-1">{currentUserId || "Not authenticated"}</div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => clearStoredUserId()}
                  disabled={!storedUserId}
                  aria-label="Clear stored user"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Available brokers (filtered in the portal)</div>
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

          {portalMessage ? (
            <div className="text-sm text-green-600">{portalMessage}</div>
          ) : null}
          {portalError ? (
            <div className="text-sm text-red-600">Error: {portalError}</div>
          ) : null}
        </CardContent>
        ) : null}
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <button type="button" onClick={() => setEventsOpen((v) => !v)} className="flex w-full items-center justify-between">
            <CardTitle>Portal events</CardTitle>
            <ChevronDown className={`size-4 transition-transform ${eventsOpen ? 'rotate-180' : ''}`} />
          </button>
        </CardHeader>
        {eventsOpen ? (
        <CardContent>
          <div className="flex justify-end mb-2">
            <Button variant="outline" size="icon" onClick={clearEvents} aria-label="Clear portal events">
              <Trash2 className="size-4" />
            </Button>
          </div>
          <ScrollArea className="h-64">
            <div className="p-2 grid gap-2">
              {[...portalEvents].reverse().map((event, idx) => (
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
        ) : null}
      </Card>
    </div>
  )
}


