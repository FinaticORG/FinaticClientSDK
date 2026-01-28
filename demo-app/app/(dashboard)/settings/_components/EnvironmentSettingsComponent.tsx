"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Settings, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Key,
  Globe,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Info
} from "lucide-react"
import { useState, useEffect } from "react"
import { useEnvironmentConfig } from "@/app/providers/EnvironmentConfigProvider"

interface EnvironmentVariable {
  key: string
  value: string
  description: string
  isPublic: boolean
  isPassword: boolean
  isActive?: boolean
  activeReason?: string
  category: 'api-keys' | 'server-urls' | 'public-urls' | 'mock-settings'
}

const getAllEnvironmentVariables = (
  mode: 'sandbox' | 'live',
  environment: 'dev' | 'staging' | 'prod'
): EnvironmentVariable[] => {
  const baseVars: EnvironmentVariable[] = [
    // API Keys (mode-specific)
    {
      key: "FINATIC_API_KEY",
      value: "",
      description: "API key for Live mode",
      isPublic: false,
      isPassword: true,
      isActive: mode === 'live',
      activeReason: mode === 'live' ? "Live mode selected" : "Live mode not selected",
      category: 'api-keys'
    },
    {
      key: "FINATIC_API_KEY_SANDBOX",
      value: "",
      description: "API key for Sandbox mode",
      isPublic: false,
      isPassword: true,
      isActive: mode === 'sandbox',
      activeReason: mode === 'sandbox' ? "Sandbox mode selected" : "Sandbox mode not selected",
      category: 'api-keys'
    },
    // API URLs (environment-specific, server-side)
    {
      key: "FINATIC_API_URL",
      value: "",
      description: "Default API URL (server-side fallback)",
      isPublic: false,
      isPassword: false,
      isActive: false,
      activeReason: "Fallback only",
      category: 'server-urls'
    },
    {
      key: "FINATIC_API_URL_DEV",
      value: "",
      description: "Development environment (server-side)",
      isPublic: false,
      isPassword: false,
      isActive: environment === 'dev',
      activeReason: environment === 'dev' ? "Dev selected" : "Dev not selected",
      category: 'server-urls'
    },
    {
      key: "FINATIC_API_URL_STAGING",
      value: "",
      description: "Staging environment (server-side)",
      isPublic: false,
      isPassword: false,
      isActive: environment === 'staging',
      activeReason: environment === 'staging' ? "Staging selected" : "Staging not selected",
      category: 'server-urls'
    },
    {
      key: "FINATIC_API_URL_PROD",
      value: "",
      description: "Production environment (server-side)",
      isPublic: false,
      isPassword: false,
      isActive: environment === 'prod',
      activeReason: environment === 'prod' ? "Prod selected" : "Prod not selected",
      category: 'server-urls'
    },
    // Public API URLs (environment-specific, client-side)
    {
      key: "NEXT_PUBLIC_FINATIC_API_URL",
      value: "",
      description: "Default public API URL (browser fallback)",
      isPublic: true,
      isPassword: false,
      isActive: false,
      activeReason: "Fallback only",
      category: 'public-urls'
    },
    {
      key: "NEXT_PUBLIC_FINATIC_API_URL_DEV",
      value: "",
      description: "Development environment (browser)",
      isPublic: true,
      isPassword: false,
      isActive: environment === 'dev',
      activeReason: environment === 'dev' ? "Dev selected" : "Dev not selected",
      category: 'public-urls'
    },
    {
      key: "NEXT_PUBLIC_FINATIC_API_URL_STAGING",
      value: "",
      description: "Staging environment (browser)",
      isPublic: true,
      isPassword: false,
      isActive: environment === 'staging',
      activeReason: environment === 'staging' ? "Staging selected" : "Staging not selected",
      category: 'public-urls'
    },
    {
      key: "NEXT_PUBLIC_FINATIC_API_URL_PROD",
      value: "",
      description: "Production environment (browser)",
      isPublic: true,
      isPassword: false,
      isActive: environment === 'prod',
      activeReason: environment === 'prod' ? "Prod selected" : "Prod not selected",
      category: 'public-urls'
    },
    // Mock mode settings
    {
      key: "NEXT_PUBLIC_FINATIC_USE_MOCKS",
      value: "",
      description: "Enable mock mode for development",
      isPublic: true,
      isPassword: false,
      category: 'mock-settings'
    },
    {
      key: "NEXT_PUBLIC_FINATIC_MOCK_API_ONLY",
      value: "",
      description: "Use only mock data (no real API calls)",
      isPublic: true,
      isPassword: false,
      category: 'mock-settings'
    }
  ]

  return baseVars
}

const categoryConfig = {
  'api-keys': { title: 'API Keys', icon: Key, description: 'Authentication keys for API access' },
  'server-urls': { title: 'Server-Side URLs', icon: Globe, description: 'API URLs accessible only from server' },
  'public-urls': { title: 'Public URLs', icon: Globe, description: 'API URLs accessible from browser' },
  'mock-settings': { title: 'Mock Settings', icon: Settings, description: 'Development mock configuration' }
}

export function EnvironmentSettings() {
  const { mode, environment } = useEnvironmentConfig()
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>(() => getAllEnvironmentVariables(mode, environment))
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isReloading, setIsReloading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    'api-keys': true,
    'server-urls': true,
    'public-urls': false,
    'mock-settings': false
  })

  // Update env vars when mode or environment changes
  useEffect(() => {
    const updatedVars = getAllEnvironmentVariables(mode, environment)
    // Preserve existing values
    setEnvVars(prev => updatedVars.map(newVar => {
      const existing = prev.find(p => p.key === newVar.key)
      return existing ? { ...newVar, value: existing.value } : newVar
    }))
  }, [mode, environment])

  // Load environment variables on component mount
  useEffect(() => {
    loadEnvironmentVariables()
  }, [])

  const loadEnvironmentVariables = async (isReload = false) => {
    if (isReload) {
      setIsReloading(true)
    } else {
      setIsLoading(true)
    }
    
    try {
      const response = await fetch('/api/environment')
      if (response.ok) {
        const data = await response.json()
        setEnvVars(prev => prev.map(envVar => ({
          ...envVar,
          value: data[envVar.key] || ''
        })))
      }
    } catch (error) {
      console.error('Failed to load environment variables:', error)
      setMessage({ type: 'error', text: 'Failed to load environment variables' })
    } finally {
      if (isReload) {
        setIsReloading(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  const updateEnvVar = (key: string, value: string) => {
    setEnvVars(prev => prev.map(envVar => 
      envVar.key === key ? { ...envVar, value } : envVar
    ))
  }

  const saveEnvironmentVariables = async () => {
    setIsSaving(true)
    setMessage(null)
    
    try {
      const envData = envVars.reduce((acc, envVar) => {
        if (envVar.value.trim()) {
          acc[envVar.key] = envVar.value.trim()
        }
        return acc
      }, {} as Record<string, string>)

      const response = await fetch('/api/environment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(envData)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Environment variables saved successfully! Reloading data...' })
        // Reload environment variables instead of refreshing the page
        setTimeout(() => {
          loadEnvironmentVariables(true)
          setMessage(null)
        }, 1000)
      } else {
        throw new Error('Failed to save environment variables')
      }
    } catch (error) {
      console.error('Failed to save environment variables:', error)
      setMessage({ type: 'error', text: 'Failed to save environment variables' })
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefaults = () => {
    setEnvVars(prev => prev.map(envVar => ({
      ...envVar,
      value: envVar.key === 'FINATIC_API_URL' ? 'http://localhost:8000' :
             envVar.key === 'NEXT_PUBLIC_FINATIC_API_URL' ? 'http://localhost:8000' :
             envVar.key === 'NEXT_PUBLIC_FINATIC_USE_MOCKS' ? 'false' :
             envVar.key === 'NEXT_PUBLIC_FINATIC_MOCK_API_ONLY' ? 'false' : ''
    })))
  }

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const getInputType = (envVar: EnvironmentVariable) => {
    if (envVar.isPassword) {
      return showPasswords[envVar.key] ? 'text' : 'password'
    }
    return 'text'
  }

  const getDefaultValue = (key: string) => {
    switch (key) {
      case 'FINATIC_API_URL':
      case 'NEXT_PUBLIC_FINATIC_API_URL':
        return 'http://localhost:8000'
      case 'NEXT_PUBLIC_FINATIC_USE_MOCKS':
      case 'NEXT_PUBLIC_FINATIC_MOCK_API_ONLY':
        return 'false'
      default:
        return ''
    }
  }

  const handleBooleanChange = (key: string, value: string) => {
    const booleanValue = value === 'true' ? 'false' : 'true'
    updateEnvVar(key, booleanValue)
  }

  // Group env vars by category
  const groupedEnvVars = envVars.reduce((acc, envVar) => {
    if (!acc[envVar.category]) {
      acc[envVar.category] = []
    }
    acc[envVar.category].push(envVar)
    return acc
  }, {} as Record<string, EnvironmentVariable[]>)

  const categoryOrder: Array<keyof typeof categoryConfig> = ['api-keys', 'server-urls', 'public-urls', 'mock-settings']

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Environment Variables</CardTitle>
            <CardDescription>Configure API keys, URLs, and mock settings</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              disabled={isLoading || isSaving || isReloading}
              className="border-border text-foreground hover:bg-accent bg-transparent"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={saveEnvironmentVariables}
              disabled={isLoading || isSaving || isReloading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : isReloading ? 'Reloading...' : 'Save'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Message Alert */}
        {message && (
          <Alert className={message.type === 'success' ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading indicator */}
        {isReloading && (
          <div className="flex items-center justify-center p-4 bg-muted/20 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Reloading environment variables...</span>
            </div>
          </div>
        )}

        {/* Environment Variables by Category */}
        <div className="space-y-3">
          {categoryOrder.map((category) => {
            const config = categoryConfig[category]
            const variables = groupedEnvVars[category] || []
            const activeCount = variables.filter(v => v.isActive).length
            const IconComponent = config.icon

            return (
              <Collapsible
                key={category}
                open={expandedCategories[category]}
                onOpenChange={() => toggleCategory(category)}
              >
                <div className="rounded-lg border border-border bg-muted/5 overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors text-left">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground">{config.title}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">{config.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {activeCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {activeCount} active
                          </Badge>
                        )}
                        {expandedCategories[category] ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t border-border">
                      {/* Table-like layout for environment variables */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="sr-only">
                            <tr>
                              <th>Status</th>
                              <th>Variable</th>
                              <th>Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {variables.map((envVar) => (
                              <tr key={envVar.key} className="group hover:bg-muted/30 transition-colors">
                                {/* Status indicator */}
                                <td className="w-10 px-3 py-3 align-middle">
                                  <div className="flex items-center justify-center">
                                    {envVar.isActive !== undefined ? (
                                      <div 
                                        className={`w-2 h-2 rounded-full ${
                                          envVar.isActive ? 'bg-green-500' : 'bg-gray-400'
                                        }`}
                                        title={envVar.isActive ? 'Active' : 'Inactive'}
                                      />
                                    ) : (
                                      <div className="w-2 h-2 rounded-full bg-blue-500" title="Always available" />
                                    )}
                                  </div>
                                </td>
                                
                                {/* Variable name and description */}
                                <td className="px-3 py-3 align-middle">
                                  <div className="flex flex-col gap-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground whitespace-nowrap">
                                        {envVar.key}
                                      </code>
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {envVar.isPublic && (
                                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-blue-500/30 text-blue-500">
                                            PUBLIC
                                          </Badge>
                                        )}
                                        {envVar.isActive !== undefined && (
                                          <Badge 
                                            variant="outline" 
                                            className={`text-[10px] px-1 py-0 h-4 ${
                                              envVar.isActive 
                                                ? 'border-green-500/30 text-green-500' 
                                                : 'border-gray-500/30 text-gray-500'
                                            }`}
                                          >
                                            {envVar.isActive ? 'ACTIVE' : 'INACTIVE'}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{envVar.description}</p>
                                    {envVar.activeReason && (
                                      <p className="text-[10px] text-muted-foreground/70 italic">{envVar.activeReason}</p>
                                    )}
                                  </div>
                                </td>
                                
                                {/* Input field */}
                                <td className="px-3 py-3 align-middle w-48 sm:w-64 md:w-72">
                                  {envVar.key.includes('USE_MOCKS') || envVar.key.includes('MOCK_API_ONLY') ? (
                                    <div className="flex items-center justify-end gap-3">
                                      <span className="text-xs text-muted-foreground">
                                        {envVar.value === 'true' ? 'Enabled' : 'Disabled'}
                                      </span>
                                      <Switch
                                        checked={envVar.value === 'true'}
                                        onCheckedChange={() => handleBooleanChange(envVar.key, envVar.value)}
                                      />
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <Input
                                        type={getInputType(envVar)}
                                        value={envVar.value}
                                        onChange={(e) => updateEnvVar(envVar.key, e.target.value)}
                                        placeholder={getDefaultValue(envVar.key) || 'Not set'}
                                        className="bg-input border-border text-foreground text-sm h-8 pr-8 w-full"
                                      />
                                      {envVar.isPassword && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                                          onClick={() => togglePasswordVisibility(envVar.key)}
                                        >
                                          {showPasswords[envVar.key] ? (
                                            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                                          ) : (
                                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
        </div>

        {/* Info footer */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>PUBLIC</strong> variables are accessible in the browser - do not store sensitive data.</p>
            <p>Restart your development server after changing environment variables.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
