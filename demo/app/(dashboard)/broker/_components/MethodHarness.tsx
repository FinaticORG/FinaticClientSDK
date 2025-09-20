"use client"

import { useMemo, useState } from "react"
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useFinatic } from "@/app/providers/FinaticProvider"

export type MethodExecutionRecord = {
  status: "idle" | "loading" | "success" | "error"
  startedAt?: string
  finishedAt?: string
  durationMs?: number
  result?: unknown
  error?: string
}

export type MethodField = {
  name: string
  label: string
  placeholder?: string
  defaultValue?: string
  type?: "text" | "number"
  description?: string
}

export type MethodDefinition = {
  key: string
  label: string
  description?: string
  methodName?: string
  input?:
    | { type: "none" }
    | { type: "json"; defaultValue?: string; placeholder?: string }
    | { type: "fields"; fields: MethodField[] }
  prepareArgs?: (
    params: {
      inputValue?: string
      fieldValues?: Record<string, string>
    },
    context: HarnessContext
  ) => any[] | Promise<any[]>
  run?: (
    params: {
      finatic: any
      inputValue?: string
      fieldValues?: Record<string, string>
      context: HarnessContext
      helpers: HarnessHelpers
    }
  ) => any | Promise<any>
  buttonLabel?: string
  dependsOn?: string[]
  canRun?: (context: HarnessContext) => { allowed: boolean; reason?: string }
  onSuccess?: (result: unknown, helpers: HarnessHelpers) => void
  onError?: (error: Error, helpers: HarnessHelpers) => void
}

export type MethodGroup = {
  key: string
  title: string
  description?: string
  methods: MethodDefinition[]
}

export type HarnessContext = {
  records: Record<string, MethodExecutionRecord | undefined>
  pagination: Record<string, unknown>
}

export type HarnessHelpers = {
  setRecord: (key: string, value: MethodExecutionRecord) => void
  updateRecord: (
    key: string,
    updater: (previous?: MethodExecutionRecord) => MethodExecutionRecord
  ) => void
  setPagination: (key: string, value: unknown) => void
  getPagination: <T = unknown>(key: string) => T | undefined
}

export interface MethodHarnessProps {
  title: string
  description?: string
  methodGroups: MethodGroup[]
}

export function MethodHarness({ title, description, methodGroups }: MethodHarnessProps) {
  const { finatic, addLog, isLoading, error } = useFinatic()

  const initialFieldState = useMemo(() => {
    const state: Record<string, Record<string, string>> = {}
    for (const group of methodGroups) {
      for (const method of group.methods) {
        if (method.input?.type === "fields") {
          state[method.key] = {}
          for (const field of method.input.fields) {
            state[method.key][field.name] = field.defaultValue ?? ""
          }
        }
      }
    }
    return state
  }, [methodGroups])

  const initialJsonState = useMemo(() => {
    const state: Record<string, string> = {}
    for (const group of methodGroups) {
      for (const method of group.methods) {
        if (method.input?.type === "json") {
          state[method.key] = method.input.defaultValue ?? ""
        }
      }
    }
    return state
  }, [methodGroups])

  const [fieldValues, setFieldValues] = useState(initialFieldState)
  const [jsonValues, setJsonValues] = useState(initialJsonState)
  const [records, setRecords] = useState<Record<string, MethodExecutionRecord>>({})
  const [pagination, setPagination] = useState<Record<string, unknown>>({})

  const context: HarnessContext = useMemo(
    () => ({
      records,
      pagination,
    }),
    [records, pagination]
  )

  const helpers: HarnessHelpers = useMemo(
    () => ({
      setRecord: (key, value) => {
        setRecords((prev) => ({ ...prev, [key]: value }))
      },
      updateRecord: (key, updater) => {
        setRecords((prev) => ({ ...prev, [key]: updater(prev[key]) }))
      },
      setPagination: (key, value) => {
        setPagination((prev) => ({ ...prev, [key]: value }))
      },
      getPagination: (key) => pagination[key],
    }),
    [pagination]
  )

  const runMethod = async (definition: MethodDefinition) => {
    if (!finatic) {
      addLog("error", "Finatic SDK is not ready yet")
      return
    }

    const key = definition.key
    const startedAt = new Date().toISOString()

    setRecords((prev) => ({
      ...prev,
      [key]: {
        status: "loading",
        startedAt,
        error: undefined,
        result: undefined,
      },
    }))

    const inputValue = definition.input?.type === "json" ? jsonValues[key] : undefined
    const currentFieldValues =
      definition.input?.type === "fields" ? fieldValues[key] ?? {} : undefined

    try {
      let args: any[] = []
      if (definition.prepareArgs) {
        args = await definition.prepareArgs(
          { inputValue, fieldValues: currentFieldValues },
          context
        )
      }

      const startTime = performance.now()
      let result: unknown
      if (definition.run) {
        result = await Promise.resolve(
          definition.run({
            finatic,
            inputValue,
            fieldValues: currentFieldValues,
            context,
            helpers,
          })
        )
      } else {
        const methodName = definition.methodName ?? definition.key
        const target = (finatic as Record<string, unknown>)[methodName]
        if (typeof target !== "function") {
          throw new Error(`Method ${methodName} is not available on the Finatic SDK instance`)
        }
        result = await Promise.resolve((target as (...args: any[]) => unknown).apply(finatic, args))
      }
      const durationMs = performance.now() - startTime

      setRecords((prev) => ({
        ...prev,
        [key]: {
          status: "success",
          startedAt,
          finishedAt: new Date().toISOString(),
          durationMs,
          result,
        },
      }))

      definition.onSuccess?.(result, helpers)
      addLog("success", `${definition.methodName ?? definition.key} succeeded in ${durationMs.toFixed(0)}ms`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setRecords((prev) => ({
        ...prev,
        [key]: {
          status: "error",
          startedAt,
          finishedAt: new Date().toISOString(),
          error: message,
        },
      }))
      if (err instanceof Error) {
        definition.onError?.(err, helpers)
      }
      addLog("error", `${definition.methodName ?? definition.key} failed: ${message}`)
    }
  }

  const renderStatusBadge = (record?: MethodExecutionRecord) => {
    if (!record) {
      return <Badge variant="secondary">Idle</Badge>
    }
    switch (record.status) {
      case "loading":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Running
          </Badge>
        )
      case "success":
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Success
          </Badge>
        )
      case "error":
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20">
            <XCircle className="mr-1 h-3 w-3" /> Failed
          </Badge>
        )
      default:
        return <Badge variant="secondary">Idle</Badge>
    }
  }

  const formatResult = (value: unknown) => {
    if (value == null) return "null"
    if (typeof value === "string") return value
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center justify-end gap-2">
              {finatic ? (
                <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                  Ready
                </Badge>
              ) : isLoading ? (
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Initializing
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20">
                  Unavailable
                </Badge>
              )}
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        </div>
        <Separator className="bg-border" />
      </div>

      <div className="space-y-8">
        {methodGroups.map((group) => (
          <section key={group.key} className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{group.title}</h2>
              {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {group.methods.map((method) => {
                const record = records[method.key]
                const inputType = method.input?.type ?? "none"

                let dependencyMessage: string | null = null
                if (method.dependsOn?.length) {
                  const missing = method.dependsOn.find((dep) => records[dep]?.status !== "success")
                  if (missing) {
                    dependencyMessage = `Run ${missing} first to populate required data.`
                  }
                }

                if (method.canRun) {
                  const validation = method.canRun(context)
                  if (!validation.allowed && validation.reason) {
                    dependencyMessage = validation.reason
                  }
                }

                return (
                  <Card key={method.key} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg text-foreground">{method.label}</CardTitle>
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
                      {inputType === "json" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Payload</label>
                          <Textarea
                            value={jsonValues[method.key] ?? ""}
                            onChange={(event) => {
                              const value = event.target.value
                              setJsonValues((prev) => ({ ...prev, [method.key]: value }))
                            }}
                            placeholder={method.input?.placeholder ?? "{\n  \"example\": true\n}"}
                            className="min-h-[160px] font-mono text-xs bg-muted/30 border-border"
                          />
                        </div>
                      )}

                      {inputType === "fields" && method.input?.fields.length ? (
                        <div className="space-y-3">
                          {method.input.fields.map((field) => (
                            <div key={field.name} className="space-y-1">
                              <label className="text-sm font-medium text-foreground">{field.label}</label>
                              <Input
                                value={fieldValues[method.key]?.[field.name] ?? ""}
                                onChange={(event) => {
                                  const value = event.target.value
                                  setFieldValues((prev) => ({
                                    ...prev,
                                    [method.key]: {
                                      ...prev[method.key],
                                      [field.name]: value,
                                    },
                                  }))
                                }}
                                placeholder={field.placeholder}
                                type={field.type === "number" ? "number" : "text"}
                                className="bg-muted/30 border-border"
                              />
                              {field.description && (
                                <p className="text-xs text-muted-foreground">{field.description}</p>
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
                            !finatic ||
                            record?.status === "loading" ||
                            Boolean(dependencyMessage)
                          }
                        >
                          {record?.status === "loading" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running
                            </>
                          ) : (
                            method.buttonLabel ?? "Execute"
                          )}
                        </Button>
                        {dependencyMessage && (
                          <p className="text-xs text-yellow-500">{dependencyMessage}</p>
                        )}
                      </div>

                      {record?.status === "error" && record.error && (
                        <div className="rounded border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                          {record.error}
                        </div>
                      )}

                      {record?.result !== undefined && record.status === "success" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Latest result</label>
                          <pre className="max-h-64 overflow-auto rounded border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                            {formatResult(record.result)}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

