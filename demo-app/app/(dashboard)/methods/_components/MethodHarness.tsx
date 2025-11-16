'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Minimize2,
  Maximize2,
  Info,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useFinatic } from '@/app/providers/FinaticProvider';

export type MethodExecutionRecord = {
  status: 'idle' | 'loading' | 'success' | 'error';
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  result?: unknown;
  error?: string;
};

export type MethodField = {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: 'text' | 'number';
  description?: string;
};

export type MethodDefinition = {
  key: string;
  label: string;
  description?: string;
  methodName?: string;
  input?:
    | { type: 'none' }
    | { type: 'json'; defaultValue?: string; placeholder?: string }
    | { type: 'fields'; fields: MethodField[] };
  prepareArgs?: (
    params: {
      inputValue?: string;
      fieldValues?: Record<string, string>;
    },
    context: HarnessContext
  ) => any[] | Promise<any[]>;
  run?: (params: {
    finatic: any;
    inputValue?: string;
    fieldValues?: Record<string, string>;
    context: HarnessContext;
    helpers: HarnessHelpers;
  }) => any | Promise<any>;
  buttonLabel?: string;
  dependsOn?: string[];
  canRun?: (context: HarnessContext) => { allowed: boolean; reason?: string };
  onSuccess?: (result: unknown, helpers: HarnessHelpers) => void;
  onError?: (error: Error, helpers: HarnessHelpers) => void;
};

export type MethodGroup = {
  key: string;
  title: string;
  description?: string;
  methods: MethodDefinition[];
};

export type HarnessContext = {
  records: Record<string, MethodExecutionRecord | undefined>;
  pagination: Record<string, unknown>;
};

export type HarnessHelpers = {
  setRecord: (key: string, value: MethodExecutionRecord) => void;
  updateRecord: (
    key: string,
    updater: (previous?: MethodExecutionRecord) => MethodExecutionRecord
  ) => void;
  setPagination: (key: string, value: unknown) => void;
  getPagination: <T = unknown>(key: string) => T | undefined;
};

export interface MethodHarnessProps {
  title: string;
  description?: string;
  methodGroups: MethodGroup[];
}

function isJsonInput(
  input: MethodDefinition['input']
): input is { type: 'json'; defaultValue?: string; placeholder?: string } {
  return input?.type === 'json';
}

function isFieldsInput(
  input: MethodDefinition['input']
): input is { type: 'fields'; fields: MethodField[] } {
  return input?.type === 'fields';
}

export function MethodHarness({ title, description, methodGroups }: MethodHarnessProps) {
  const { finatic, sdkAdapter, addLog, isLoading, error, isAuthed, sdkType, checkAuth } =
    useFinatic();

  const initialFieldState = useMemo(() => {
    const state: Record<string, Record<string, string>> = {};
    for (const group of methodGroups) {
      for (const method of group.methods) {
        if (method.input?.type === 'fields') {
          state[method.key] = {};
          for (const field of method.input.fields) {
            state[method.key][field.name] = field.defaultValue ?? '';
          }
        }
      }
    }
    return state;
  }, [methodGroups]);

  const initialJsonState = useMemo(() => {
    const state: Record<string, string> = {};
    for (const group of methodGroups) {
      for (const method of group.methods) {
        if (method.input?.type === 'json') {
          state[method.key] = method.input.defaultValue ?? '';
        }
      }
    }
    return state;
  }, [methodGroups]);

  const [fieldValues, setFieldValues] = useState(initialFieldState);
  const [jsonValues, setJsonValues] = useState(initialJsonState);
  const [records, setRecords] = useState<Record<string, MethodExecutionRecord>>({});
  const [pagination, setPagination] = useState<Record<string, unknown>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of methodGroups) {
      initial[group.key] = true;
    }
    return initial;
  });
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [lastRunSummary, setLastRunSummary] = useState<{
    total: number;
    succeeded: { key: string; label: string; durationMs?: number }[];
    failed: { key: string; label: string }[];
    averageMs?: number;
    minMs?: number;
    maxMs?: number;
  } | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const methodKeyToGroupKey = useMemo(() => {
    const map: Record<string, string> = {};
    for (const group of methodGroups) {
      for (const method of group.methods) {
        map[method.key] = group.key;
      }
    }
    return map;
  }, [methodGroups]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const minimizeAllGroups = () => {
    const minimized: Record<string, boolean> = {};
    for (const group of methodGroups) {
      minimized[group.key] = false;
    }
    setExpandedGroups(minimized);
  };

  const maximizeAllGroups = () => {
    const maximized: Record<string, boolean> = {};
    for (const group of methodGroups) {
      maximized[group.key] = true;
    }
    setExpandedGroups(maximized);
  };

  const anchorToMethod = (methodKey: string) => {
    const groupKey = methodKeyToGroupKey[methodKey];
    if (groupKey) {
      setExpandedGroups(prev => ({ ...prev, [groupKey]: true }));
    }
    setTimeout(() => {
      const el = document.getElementById(`method-${methodKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  const getRunAllOrder = () => {
    const all: MethodDefinition[] = [];
    for (const group of methodGroups) {
      for (const method of group.methods) {
        all.push(method);
      }
    }
    // Weight methods so seed page requests run before next-page requests
    // -2: openPortal, -1: closePortal, 0: get*Page (not Next), 1: others, 2: getNext*Page
    const weight = (key: string) => {
      if (key === 'openPortal') return -2;
      if (key === 'closePortal') return -1;
      const isNextPage = /^getNext.*Page$/i.test(key);
      const isSeedPage = /^get.*Page$/i.test(key) && !isNextPage;
      if (isSeedPage) return 0;
      if (isNextPage) return 2;
      return 1;
    };
    return all.slice().sort((a, b) => weight(a.key) - weight(b.key));
  };

  const context: HarnessContext = useMemo(
    () => ({
      records,
      pagination,
    }),
    [records, pagination]
  );

  const helpers: HarnessHelpers = useMemo(
    () => ({
      setRecord: (key, value) => {
        setRecords(prev => ({ ...prev, [key]: value }));
      },
      updateRecord: (key, updater) => {
        setRecords(prev => ({ ...prev, [key]: updater(prev[key]) }));
      },
      setPagination: (key, value) => {
        setPagination(prev => ({ ...prev, [key]: value }));
      },
      getPagination: <T = unknown,>(key: string) => pagination[key] as T | undefined,
    }),
    [pagination]
  );

  // Compute test coverage for info panel
  const sdkMethodNames = useMemo(
    () => [
      'isAuthenticated',
      'openPortal',
      'getPortalUrl',
      'closePortal',
      'getUserId',
      'getSessionId',
      'getCompanyId',
      'disconnectCompany',
      'getBrokerList',
      'getBrokerConnections',
      'getAccounts',
      'getAllAccounts',
      'getActiveAccounts',
      'getBalances',
      'getAllBalances',
      'getOrders',
      'getAllOrders',
      'getFilledOrders',
      'getPendingOrders',
      'getOrdersBySymbol',
      'getOrdersByBroker',
      'getPositions',
      'getAllPositions',
      'getOpenPositions',
      'getPositionsBySymbol',
      'getPositionsByBroker',
      'getOrderFills',
      'getOrderEvents',
      'getOrderGroups',
      'getAllOrderGroups',
      'getPositionLots',
      'getAllPositionLots',
      'getPositionLotFills',
    ],
    []
  );

  const testedMethodNames = useMemo(() => {
    const names = new Set<string>();
    for (const group of methodGroups) {
      for (const method of group.methods) {
        names.add(method.methodName ?? method.key);
      }
    }
    return Array.from(names);
  }, [methodGroups]);

  const untestedMethodNames = useMemo(
    () => sdkMethodNames.filter(name => !testedMethodNames.includes(name)),
    [sdkMethodNames, testedMethodNames]
  );

  const sdkReady = Boolean(sdkAdapter) && !isLoading;
  const allReady = sdkReady && isAuthed === true;

  const handlePrimaryAction = async () => {
    if (!sdkAdapter) return;
    if (allReady) {
      await runAllMethods();
      return;
    }
    try {
      await sdkAdapter.openPortal({ path: '/', mode: 'modal' });
      // Re-check auth shortly after opening portal
      setTimeout(async () => {
        await checkAuth();
      }, 1000);
    } catch (err) {
      addLog('error', 'Failed to open portal');
    }
  };

  const runMethod = async (definition: MethodDefinition): Promise<MethodExecutionRecord> => {
    if (!sdkAdapter) {
      addLog('error', 'SDK adapter is not ready yet');
      return { status: 'error', error: 'SDK not ready' };
    }

    const key = definition.key;
    const startedAt = new Date().toISOString();

    setRecords(prev => ({
      ...prev,
      [key]: {
        status: 'loading',
        startedAt,
        error: undefined,
        result: undefined,
      },
    }));

    const inputValue = definition.input?.type === 'json' ? jsonValues[key] : undefined;
    const currentFieldValues =
      definition.input?.type === 'fields' ? (fieldValues[key] ?? {}) : undefined;

    try {
      let args: any[] = [];
      if (definition.prepareArgs) {
        args = await definition.prepareArgs(
          { inputValue, fieldValues: currentFieldValues },
          context
        );
      }

      const startTime = performance.now();
      let result: unknown;
      if (definition.run) {
        result = await Promise.resolve(
          definition.run({
            finatic: sdkAdapter, // Pass adapter as finatic for backward compatibility
            inputValue,
            fieldValues: currentFieldValues,
            context,
            helpers,
          })
        );
      } else {
        const methodName = definition.methodName ?? definition.key;
        const target = (sdkAdapter as unknown as Record<string, unknown>)[methodName];
        if (typeof target !== 'function') {
          throw new Error(`Method ${methodName} is not available on the SDK adapter`);
        }
        result = await Promise.resolve(
          (target as (...args: any[]) => unknown).apply(sdkAdapter, args)
        );
      }
      const durationMs = performance.now() - startTime;

      const finalRecord: MethodExecutionRecord = {
        status: 'success',
        startedAt,
        finishedAt: new Date().toISOString(),
        durationMs,
        result,
      };
      setRecords(prev => ({
        ...prev,
        [key]: finalRecord,
      }));

      definition.onSuccess?.(result, helpers);
      addLog(
        'success',
        `${definition.methodName ?? definition.key} succeeded in ${durationMs.toFixed(0)}ms`
      );
      return finalRecord;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      const finalRecord: MethodExecutionRecord = {
        status: 'error',
        startedAt,
        finishedAt: new Date().toISOString(),
        error: message,
      };
      setRecords(prev => ({
        ...prev,
        [key]: finalRecord,
      }));
      if (err instanceof Error) {
        definition.onError?.(err, helpers);
      }
      addLog('error', `${definition.methodName ?? definition.key} failed: ${message}`);
      return finalRecord;
    }
  };

  const runAllMethods = async () => {
    if (isRunningAll) return;
    setIsRunningAll(true);
    setLastRunSummary(null);
    const order = getRunAllOrder();
    const succeeded: { key: string; label: string; durationMs?: number }[] = [];
    const failed: { key: string; label: string }[] = [];
    for (const method of order) {
      const record = await runMethod(method);
      if (record.status === 'success') {
        succeeded.push({ key: method.key, label: method.label, durationMs: record.durationMs });
      } else {
        failed.push({ key: method.key, label: method.label });
      }
    }
    const durations = succeeded.map(r => r.durationMs ?? 0);
    const averageMs = durations.length
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : undefined;
    const minMs = durations.length ? Math.min(...durations) : undefined;
    const maxMs = durations.length ? Math.max(...durations) : undefined;
    setLastRunSummary({
      total: order.length,
      succeeded,
      failed,
      averageMs,
      minMs,
      maxMs,
    });
    setIsRunningAll(false);
  };

  const renderStatusBadge = (record?: MethodExecutionRecord) => {
    if (!record) {
      return <Badge variant="secondary">Idle</Badge>;
    }
    switch (record.status) {
      case 'loading':
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Running
          </Badge>
        );
      case 'success':
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Success
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20">
            <XCircle className="mr-1 h-3 w-3" /> Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">Idle</Badge>;
    }
  };

  const formatResult = (value: unknown) => {
    if (value == null) return 'null';
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground relative">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowInfo(prev => !prev)}
                className="h-8 w-8 rounded-full"
                title="Show method coverage"
              >
                <Info className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={minimizeAllGroups}
                  className="h-8 px-2 text-xs"
                >
                  <Minimize2 className="mr-1 h-3 w-3" />
                  Minimize all
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={maximizeAllGroups}
                  className="h-8 px-2 text-xs"
                >
                  <Maximize2 className="mr-1 h-3 w-3" />
                  Maximize all
                </Button>
              </div>
              <Button
                className={`ml-2 ${allReady ? 'bg-green-600 hover:bg-green-600/90' : 'bg-red-600 hover:bg-red-600/90'} text-primary-foreground`}
                onClick={() => void handlePrimaryAction()}
                disabled={!sdkAdapter || isRunningAll}
                title={
                  allReady
                    ? 'SDK is authenticated. Run all methods.'
                    : !sdkReady
                      ? 'SDK not initialized'
                      : 'Not authenticated - open portal to connect'
                }
              >
                {isRunningAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running all
                  </>
                ) : allReady ? (
                  'Run all methods'
                ) : (
                  'Open portal to connect'
                )}
              </Button>
            </div>
            {showInfo && (
              <div className="absolute right-0 mt-2 w-96 rounded-md border border-border bg-card p-3 text-left shadow-lg z-50">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">SDK method coverage</span>
                  <Badge variant="secondary" className="text-xs">
                    {testedMethodNames.length}/{sdkMethodNames.length} covered
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-auto">
                  <div>
                    <label className="text-xs font-medium text-foreground">Tested</label>
                    <ul className="mt-1 space-y-1">
                      {testedMethodNames.sort().map(name => (
                        <li key={`tested-${name}`} className="text-xs text-muted-foreground">
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Not tested</label>
                    <ul className="mt-1 space-y-1">
                      {untestedMethodNames.sort().map(name => (
                        <li key={`untested-${name}`} className="text-xs text-muted-foreground">
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {!allReady && (
              <p className="text-xs text-red-400">
                {!sdkReady
                  ? 'SDK is not ready yet'
                  : !isAuthed
                    ? 'User is not authenticated - open the portal to connect'
                    : 'Evaluating authentication...'}
              </p>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        </div>
        <Separator className="bg-border" />
      </div>

      {lastRunSummary && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">Run summary</CardTitle>
              <div className="text-xs text-muted-foreground">
                <span className="mr-3">Total: {lastRunSummary.total}</span>
                <span className="mr-3 text-green-400">
                  Succeeded: {lastRunSummary.succeeded.length}
                </span>
                <span className="text-red-400">Failed: {lastRunSummary.failed.length}</span>
              </div>
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              {lastRunSummary.averageMs != null && (
                <span className="mr-3">Avg: {Math.round(lastRunSummary.averageMs)}ms</span>
              )}
              {lastRunSummary.minMs != null && (
                <span className="mr-3">Min: {Math.round(lastRunSummary.minMs)}ms</span>
              )}
              {lastRunSummary.maxMs != null && (
                <span>Max: {Math.round(lastRunSummary.maxMs)}ms</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {lastRunSummary.succeeded.length > 0 && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium text-foreground">Succeeded methods</label>
                <div className="flex flex-wrap gap-2">
                  {lastRunSummary.succeeded.map(m => (
                    <Button
                      key={m.key}
                      variant="secondary"
                      className="h-7 px-2 py-0 text-xs bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25"
                      onClick={() => anchorToMethod(m.key)}
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {lastRunSummary.failed.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Failed methods</label>
                <div className="flex flex-wrap gap-2">
                  {lastRunSummary.failed.map(m => (
                    <Button
                      key={m.key}
                      variant="destructive"
                      className="h-7 px-2 py-0 text-xs"
                      onClick={() => anchorToMethod(m.key)}
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        {methodGroups.map(group => (
          <section key={group.key} className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader
                onClick={() => toggleGroup(group.key)}
                className="cursor-pointer select-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl text-foreground">{group.title}</CardTitle>
                    {group.description && (
                      <CardDescription className="text-sm text-muted-foreground">
                        {group.description}
                      </CardDescription>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {expandedGroups[group.key] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>
                </div>
              </CardHeader>
              {expandedGroups[group.key] && (
                <CardContent id={`group-${group.key}`} className="pt-0">
                  <div className="grid gap-4 lg:grid-cols-2">
                    {group.methods.map(method => {
                      const record = records[method.key];
                      const inputType = method.input?.type ?? 'none';

                      let dependencyMessage: string | null = null;
                      if (method.dependsOn?.length) {
                        const missing = method.dependsOn.find(
                          dep => records[dep]?.status !== 'success'
                        );
                        if (missing) {
                          dependencyMessage = `Run ${missing} first to populate required data.`;
                        }
                      }

                      if (method.canRun) {
                        const validation = method.canRun(context);
                        if (!validation.allowed && validation.reason) {
                          dependencyMessage = validation.reason;
                        }
                      }

                      return (
                        <Card
                          key={method.key}
                          id={`method-${method.key}`}
                          className="bg-card border-border"
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <CardTitle className="text-lg text-foreground">
                                  {method.label}
                                </CardTitle>
                                {method.description && (
                                  <CardDescription className="text-muted-foreground text-sm">
                                    {method.description}
                                  </CardDescription>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                                {renderStatusBadge(record)}
                                {record?.durationMs != null && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {Math.round(record.durationMs)}ms
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {isJsonInput(method.input) && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                  Payload
                                </label>
                                <Textarea
                                  value={jsonValues[method.key] ?? ''}
                                  onChange={event => {
                                    const value = event.target.value;
                                    setJsonValues(prev => ({ ...prev, [method.key]: value }));
                                  }}
                                  placeholder={
                                    method.input.placeholder ?? '{\n  "example": true\n}'
                                  }
                                  className="min-h-[160px] font-mono text-xs bg-muted/30 border-border"
                                />
                              </div>
                            )}

                            {isFieldsInput(method.input) && method.input.fields.length ? (
                              <div className="space-y-3">
                                {method.input.fields.map((field: MethodField) => (
                                  <div key={field.name} className="space-y-1">
                                    <label className="text-sm font-medium text-foreground">
                                      {field.label}
                                    </label>
                                    <Input
                                      value={fieldValues[method.key]?.[field.name] ?? ''}
                                      onChange={event => {
                                        const value = event.target.value;
                                        setFieldValues(prev => ({
                                          ...prev,
                                          [method.key]: {
                                            ...prev[method.key],
                                            [field.name]: value,
                                          },
                                        }));
                                      }}
                                      placeholder={field.placeholder}
                                      type={field.type === 'number' ? 'number' : 'text'}
                                      className="bg-muted/30 border-border"
                                    />
                                    {field.description && (
                                      <p className="text-xs text-muted-foreground">
                                        {field.description}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : null}

                            <div className="space-y-2">
                              <Button
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={() => void runMethod(method)}
                                disabled={
                                  !sdkAdapter ||
                                  record?.status === 'loading' ||
                                  Boolean(dependencyMessage)
                                }
                              >
                                {record?.status === 'loading' ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running
                                  </>
                                ) : (
                                  (method.buttonLabel ?? 'Execute')
                                )}
                              </Button>
                              {dependencyMessage && (
                                <p className="text-xs text-yellow-500">{dependencyMessage}</p>
                              )}
                            </div>

                            {record?.status === 'error' && record.error && (
                              <div className="rounded border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                                {record.error}
                              </div>
                            )}

                            {record?.result !== undefined && record.status === 'success' && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                  Latest result
                                </label>
                                <pre className="max-h-64 overflow-auto rounded border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                                  {formatResult(record.result)}
                                </pre>

                                {/* Pagination controls for methods that return paginated results */}
                                {record.result &&
                                  typeof record.result === 'object' &&
                                  'hasNext' in record.result &&
                                  'nextPage' in record.result && (
                                    <div className="mt-3 flex items-center gap-2">
                                      <label className="text-sm font-medium text-foreground">
                                        Pagination
                                      </label>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={async () => {
                                            try {
                                              if (
                                                record.result &&
                                                typeof record.result === 'object' &&
                                                'previousPage' in record.result
                                              ) {
                                                const prevResult = await (
                                                  record.result as any
                                                ).previousPage();
                                                setRecords(prev => ({
                                                  ...prev,
                                                  [record.key]: {
                                                    ...prev[record.key],
                                                    result: prevResult,
                                                  },
                                                }));
                                              }
                                            } catch (error) {
                                              console.error('Failed to get previous page:', error);
                                            }
                                          }}
                                          disabled={!(record.result as any)?.hasPrevious}
                                          className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          Previous
                                        </button>
                                        <button
                                          onClick={async () => {
                                            try {
                                              if (
                                                record.result &&
                                                typeof record.result === 'object' &&
                                                'nextPage' in record.result
                                              ) {
                                                const nextResult = await (
                                                  record.result as any
                                                ).nextPage();
                                                setRecords(prev => ({
                                                  ...prev,
                                                  [record.key]: {
                                                    ...prev[record.key],
                                                    result: nextResult,
                                                  },
                                                }));
                                              }
                                            } catch (error) {
                                              console.error('Failed to get next page:', error);
                                            }
                                          }}
                                          disabled={!(record.result as any)?.hasNext}
                                          className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          Next
                                        </button>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          </section>
        ))}
      </div>
    </div>
  );
}
