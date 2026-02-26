'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFinatic } from '@/app/providers/FinaticProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  CircleX,
  Mail,
  Trash2,
  DoorOpen,
  RefreshCw,
  ChevronDown,
  Palette,
} from 'lucide-react';
import type { BrokerInfo } from '@finatic/client';

type PortalEvent = { type: string; data: unknown; timestamp: string };
type PortalStage = 'production' | 'beta' | 'alpha';

const PORTAL_ASSET_TYPE_OPTIONS = [
  { value: 'equity', label: 'Equity' },
  { value: 'equity_option', label: 'Equity option' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'future', label: 'Future' },
  { value: 'future_option', label: 'Future option' },
] as const;

const PORTAL_STAGE_OPTIONS = [
  { value: 'production' as PortalStage, label: 'Production' },
  { value: 'beta' as PortalStage, label: 'Beta' },
  { value: 'alpha' as PortalStage, label: 'Alpha' },
] as const;

// Removed hard-coded brokers. We'll load from SDK.

export default function PortalPageComponent(): JSX.Element {
  const {
    finatic,
    storedUserId,
    setStoredUserId,
    addLog,
    isAuthed,
    currentUserId,
    checkAuth,
    setAuthState,
    logout,
    isLoading,
  } = useFinatic();
  const [portalMessage, setPortalMessage] = useState<string>('');
  const [portalError, setPortalError] = useState<string>('');
  const [portalEvents, setPortalEvents] = useState<PortalEvent[]>([]);
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);
  const [emailParam, setEmailParam] = useState<string>('');
  const [themePreset, setThemePreset] = useState<string>('');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [portalKind, setPortalKind] = useState<string>('');
  const [portalAssetTypes, setPortalAssetTypes] = useState<string[]>([]);
  const [portalStages, setPortalStages] = useState<PortalStage[]>([]);
  const [availableBrokers, setAvailableBrokers] = useState<BrokerInfo[] | null>(null);
  const [brokersError, setBrokersError] = useState<string>('');
  const [brokersLoading, setBrokersLoading] = useState<boolean>(false);

  const [optionsOpen, setOptionsOpen] = useState<boolean>(true);
  const [eventsOpen, setEventsOpen] = useState<boolean>(true);

  // Persist portal event history for the current day
  const getDayKey = useCallback(
    () => `finatic-portal-events-${new Date().toISOString().slice(0, 10)}`,
    []
  );

  const loadHistory = useCallback(() => {
    try {
      const raw = localStorage.getItem(getDayKey());
      if (!raw) return [] as PortalEvent[];
      const parsed = JSON.parse(raw) as PortalEvent[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [] as PortalEvent[];
    }
  }, [getDayKey]);

  const saveHistory = useCallback(
    (events: PortalEvent[]) => {
      try {
        localStorage.setItem(getDayKey(), JSON.stringify(events));
      } catch {}
    },
    [getDayKey]
  );

  const appendEvent = useCallback(
    (event: PortalEvent) => {
      setPortalEvents(prev => {
        const next = [...prev, event];
        saveHistory(next);
        return next;
      });
    },
    [saveHistory]
  );

  useEffect(() => {
    if (!finatic) {
      setAvailableBrokers(null);
      return;
    }
    // Authentication state is now managed globally by FinaticProvider
  }, [finatic]);

  // Initialize event history for today
  useEffect(() => {
    setPortalEvents(loadHistory());
  }, [loadHistory]);

  // Load email prefill from localStorage on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('finatic-portal-email-prefill');
      if (savedEmail) {
        setEmailParam(savedEmail);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save email prefill to localStorage whenever it changes
  useEffect(() => {
    try {
      if (emailParam.trim()) {
        localStorage.setItem('finatic-portal-email-prefill', emailParam.trim());
      } else {
        localStorage.removeItem('finatic-portal-email-prefill');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [emailParam]);

  const clearEvents = useCallback(() => {
    try {
      localStorage.removeItem(getDayKey());
    } catch {}
    setPortalEvents([]);
    addLog('info', 'Cleared portal events for today');
  }, [getDayKey, addLog]);

  // Load broker list regardless of auth
  useEffect(() => {
    let cancelled = false;
    async function loadBrokers() {
      if (!finatic) return;
      try {
        setBrokersLoading(true);
        setBrokersError('');
        const response = await finatic.getBrokers();
        // Extract data from FinaticResponse
        const list = response?.success?.data || response;
        if (!cancelled) {
          // Ensure list is always an array
          const brokerArray: BrokerInfo[] = Array.isArray(list) 
            ? (list as BrokerInfo[]) 
            : (Object.values(list || {}) as BrokerInfo[]);
          setAvailableBrokers(brokerArray);
        }
      } catch (err: any) {
        if (!cancelled) {
          setBrokersError(err?.message || 'Failed to load brokers');
        }
      } finally {
        if (!cancelled) setBrokersLoading(false);
      }
    }
    void loadBrokers();
    return () => {
      cancelled = true;
    };
  }, [finatic]);

  const brokerFilter: string[] = useMemo(() => selectedBrokers, [selectedBrokers]);
  // Only show default and stockAlgos presets
  const themeOptions = useMemo(() => ['default', 'stockAlgos'], []);

  const handleOpenPortal = useCallback(async () => {
    if (!finatic) return;
    addLog('info', 'Opening portal...');
    setPortalMessage('');
    setPortalError('');
    appendEvent({ type: 'portal-open', data: {}, timestamp: new Date().toLocaleTimeString() });

    if (brokerFilter.length > 0) {
      addLog('info', `Filtering portal to show brokers: ${brokerFilter.join(', ')}`);
    }

    try {
      const options: Record<string, unknown> = {};
      if (brokerFilter.length > 0) options.brokers = brokerFilter;
      if (emailParam.trim()) {
        options.email = emailParam.trim();
        addLog('info', `Opening portal with email prefill: ${emailParam.trim()}`);
      }
      if (themePreset.trim()) {
        options.theme = { preset: themePreset.trim() };
        addLog('info', `Opening portal with theme preset: ${themePreset.trim()}`);
      }
      // Add mode only if not system (system is default, so don't pass it)
      if (themeMode !== 'system') {
        options.mode = themeMode;
        addLog('info', `Opening portal with mode: ${themeMode}`);
      }
      if (portalKind === 'broker' || portalKind === 'exchange') {
        options.kind = portalKind;
        addLog('info', `Opening portal with kind: ${portalKind}`);
      }
      if (portalAssetTypes.length > 0) {
        options.asset_types = portalAssetTypes;
        addLog('info', `Opening portal with asset_types: ${portalAssetTypes.join(', ')}`);
      }
      if (portalStages.length > 0) {
        options.stage = portalStages;
        addLog('info', `Opening portal with stages: ${portalStages.join(', ')}`);
      }

      await finatic.openPortal({
        ...options,
        onSuccess: async (userId: string) => {
          addLog('success', `Portal opened successfully for user: ${userId}`);
          setPortalMessage('Portal opened successfully');
          // Set auth state immediately (SDK already stored userId internally)
          setAuthState(true, userId);
          setStoredUserId(userId);
          addLog('info', `Stored userId in localStorage: ${userId}`);
          // Verify auth state
          await checkAuth();
          appendEvent({
            type: 'portal-success',
            data: { userId },
            timestamp: new Date().toLocaleTimeString(),
          });
        },
        onError: (error: Error) => {
          setPortalError(error.message);
          addLog('error', error.message);
          appendEvent({
            type: 'portal-error',
            data: { message: error.message },
            timestamp: new Date().toLocaleTimeString(),
          });
        },
        onClose: () => {
          addLog('info', 'Portal closed');
          appendEvent({
            type: 'portal-close',
            data: {},
            timestamp: new Date().toLocaleTimeString(),
          });
        },
        onEvent: (type: string, data: unknown) => {
          addLog('info', `Portal event: ${type} - ${JSON.stringify(data)}`);
          appendEvent({ type, data, timestamp: new Date().toLocaleTimeString() });
        },
      } as any);
    } catch (err: any) {
      const errorMsg =
        typeof err?.message === 'string' ? err.message : String(err) || 'Unknown error';
      setPortalError(errorMsg);
      addLog('error', errorMsg);
    }
  }, [
    finatic,
    addLog,
    brokerFilter,
    emailParam,
    themePreset,
    themeMode,
    portalKind,
    portalAssetTypes,
    portalStages,
    setStoredUserId,
    checkAuth,
    setAuthState,
    appendEvent,
  ]);


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

      {/* Portal status messages */}
      {(portalMessage || portalError) && (
        <Card>
          <CardContent className="pt-6">
            {portalMessage && (
              <div className="text-green-600 text-sm flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                {portalMessage}
              </div>
            )}
            {portalError && (
              <div className="text-red-600 text-sm flex items-center gap-2">
                <CircleX className="size-4" />
                {portalError}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <button
            type="button"
            onClick={() => setOptionsOpen(v => !v)}
            className="flex w-full items-center justify-between"
          >
            <div className="text-left">
              <CardTitle>Portal options</CardTitle>
              <CardDescription>
                Open the embedded authentication portal with optional options.
              </CardDescription>
            </div>
            <ChevronDown
              className={`size-4 transition-transform ${optionsOpen ? 'rotate-180' : ''}`}
            />
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
                    onChange={e => setEmailParam(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEmailParam('')}
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
                  <Select
                    value={themePreset || 'default'}
                    onValueChange={v => setThemePreset(v === 'default' ? '' : v)}
                  >
                    <SelectTrigger className="flex-1" aria-label="Select theme preset">
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      {themeOptions.filter(opt => opt !== 'default').map(opt => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setThemePreset('')}
                    aria-label="Clear theme preset"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mode" className="gap-2">
                  <Palette className="size-4" /> Mode (optional)
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={themeMode}
                    onValueChange={v => setThemeMode(v as 'light' | 'dark' | 'system')}
                  >
                    <SelectTrigger className="flex-1" aria-label="Select theme mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setThemeMode('system')}
                    aria-label="Reset to system mode"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="kind">Kind (optional)</Label>
                <Select
                  value={portalKind || 'none'}
                  onValueChange={v => setPortalKind(v === 'none' ? '' : v)}
                >
                  <SelectTrigger id="kind" className="flex-1" aria-label="Filter by provider type">
                    <SelectValue placeholder="No filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No filter</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  Show only brokers or only exchanges (e.g. crypto) in the portal.
                </p>
              </div>

              <div className="grid gap-2 lg:col-span-2">
                <Label>Asset types (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {PORTAL_ASSET_TYPE_OPTIONS.map(opt => {
                    const checked = portalAssetTypes.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setPortalAssetTypes(prev =>
                            prev.includes(opt.value) ? prev.filter(a => a !== opt.value) : [...prev, opt.value]
                          )
                        }
                        className={`text-sm border rounded-md px-3 py-2 transition-colors ${
                          checked ? 'bg-accent border-primary' : 'hover:bg-accent'
                        }`}
                        aria-pressed={checked}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{opt.label}</span>
                          {checked ? <Badge>On</Badge> : <Badge variant="outline">Off</Badge>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-muted-foreground text-xs">
                  Filter providers by capability (AND logic). Leave empty for no filter.
                </p>
              </div>

              <div className="grid gap-2 lg:col-span-2">
                <Label>Stages (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {PORTAL_STAGE_OPTIONS.map(opt => {
                    const checked = portalStages.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setPortalStages(prev =>
                            prev.includes(opt.value)
                              ? prev.filter(s => s !== opt.value)
                              : [...prev, opt.value]
                          )
                        }
                        className={`text-sm border rounded-md px-3 py-2 transition-colors ${
                          checked ? 'bg-accent border-primary' : 'hover:bg-accent'
                        }`}
                        aria-pressed={checked}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{opt.label}</span>
                          {checked ? <Badge>On</Badge> : <Badge variant="outline">Off</Badge>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-muted-foreground text-xs">
                  Filter providers by stage: production (no alpha/beta flags), beta, or alpha. Leave
                  empty for no stage filter.
                </p>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">Current user</div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-mono border rounded-md px-3 py-2 flex-1">
                    {currentUserId || 'Not authenticated'}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => void logout()}
                    disabled={!storedUserId || storedUserId === 'None' || storedUserId === null || storedUserId === undefined || isLoading}
                    aria-label="Logout"
                    className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                  >
                    <Trash2 className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Available brokers (filtered in the portal)</div>
              {brokersLoading ? (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="size-3 animate-spin" /> Loading brokers...
                </div>
              ) : brokersError ? (
                <div className="text-xs text-red-600">{brokersError}</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(availableBrokers || []).map(broker => {
                    const key = broker.name;
                    const checked = selectedBrokers.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setSelectedBrokers(prev =>
                            prev.includes(key) ? prev.filter(b => b !== key) : [...prev, key]
                          )
                        }
                        className={`text-sm border rounded-md px-3 py-2 text-left transition-colors ${
                          checked ? 'bg-accent border-primary' : 'hover:bg-accent'
                        }`}
                        aria-pressed={checked}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{broker.display_name || broker.name}</span>
                          {checked ? <Badge>On</Badge> : <Badge variant="outline">Off</Badge>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {portalMessage ? <div className="text-sm text-green-600">{portalMessage}</div> : null}
            {portalError ? <div className="text-sm text-red-600">Error: {portalError}</div> : null}
          </CardContent>
        ) : null}
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <button
            type="button"
            onClick={() => setEventsOpen(v => !v)}
            className="flex w-full items-center justify-between"
          >
            <CardTitle>Portal events</CardTitle>
            <ChevronDown
              className={`size-4 transition-transform ${eventsOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </CardHeader>
        {eventsOpen ? (
          <CardContent>
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="icon"
                onClick={clearEvents}
                aria-label="Clear portal events"
              >
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
                    <pre className="text-xs mt-2 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}
