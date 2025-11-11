"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "../../../../components/ui/alert"
import { 
  Settings, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Key,
  Globe,
  Eye,
  EyeOff
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
}

const getAllEnvironmentVariables = (mode: 'sandbox' | 'live', environment: 'dev' | 'staging' | 'prod'): EnvironmentVariable[] => {
  const baseVars: EnvironmentVariable[] = [
    // API Keys (mode-specific)
    {
      key: "FINATIC_API_KEY",
      value: "",
      description: "Default API key (fallback if mode-specific keys not set)",
      isPublic: false,
      isPassword: true,
      isActive: false,
      activeReason: "Used as fallback only"
    },
    {
      key: "FINATIC_API_KEY_LIVE",
      value: "",
      description: "API key for Live mode",
      isPublic: false,
      isPassword: true,
      isActive: mode === 'live',
      activeReason: mode === 'live' ? "Active (Live mode selected)" : "Inactive (Live mode not selected)"
    },
    {
      key: "FINATIC_API_KEY_SANDBOX",
      value: "",
      description: "API key for Sandbox mode",
      isPublic: false,
      isPassword: true,
      isActive: mode === 'sandbox',
      activeReason: mode === 'sandbox' ? "Active (Sandbox mode selected)" : "Inactive (Sandbox mode not selected)"
    },
    // API URLs (environment-specific, server-side)
    {
      key: "FINATIC_API_URL",
      value: "",
      description: "Default API URL (server-side, fallback if env-specific URLs not set)",
      isPublic: false,
      isPassword: false,
      isActive: false,
      activeReason: "Used as fallback only"
    },
    {
      key: "FINATIC_API_URL_DEV",
      value: "",
      description: "API URL for Development environment (server-side)",
      isPublic: false,
      isPassword: false,
      isActive: environment === 'dev',
      activeReason: environment === 'dev' ? "Active (Dev environment selected)" : "Inactive (Dev environment not selected)"
    },
    {
      key: "FINATIC_API_URL_STAGING",
      value: "",
      description: "API URL for Staging environment (server-side)",
      isPublic: false,
      isPassword: false,
      isActive: environment === 'staging',
      activeReason: environment === 'staging' ? "Active (Staging environment selected)" : "Inactive (Staging environment not selected)"
    },
    {
      key: "FINATIC_API_URL_PROD",
      value: "",
      description: "API URL for Production environment (server-side)",
      isPublic: false,
      isPassword: false,
      isActive: environment === 'prod',
      activeReason: environment === 'prod' ? "Active (Prod environment selected)" : "Inactive (Prod environment not selected)"
    },
    // Public API URLs (environment-specific, client-side)
    {
      key: "NEXT_PUBLIC_FINATIC_API_URL",
      value: "",
      description: "Default public API URL (accessible in browser, fallback)",
      isPublic: true,
      isPassword: false,
      isActive: false,
      activeReason: "Used as fallback only"
    },
    {
      key: "NEXT_PUBLIC_FINATIC_API_URL_DEV",
      value: "",
      description: "Public API URL for Development environment (accessible in browser)",
      isPublic: true,
      isPassword: false,
      isActive: environment === 'dev',
      activeReason: environment === 'dev' ? "Active (Dev environment selected)" : "Inactive (Dev environment not selected)"
    },
    {
      key: "NEXT_PUBLIC_FINATIC_API_URL_STAGING",
      value: "",
      description: "Public API URL for Staging environment (accessible in browser)",
      isPublic: true,
      isPassword: false,
      isActive: environment === 'staging',
      activeReason: environment === 'staging' ? "Active (Staging environment selected)" : "Inactive (Staging environment not selected)"
    },
    {
      key: "NEXT_PUBLIC_FINATIC_API_URL_PROD",
      value: "",
      description: "Public API URL for Production environment (accessible in browser)",
      isPublic: true,
      isPassword: false,
      isActive: environment === 'prod',
      activeReason: environment === 'prod' ? "Active (Prod environment selected)" : "Inactive (Prod environment not selected)"
    },
    // Mock mode settings
    {
      key: "NEXT_PUBLIC_FINATIC_USE_MOCKS",
      value: "",
      description: "Enable mock mode for development",
      isPublic: true,
      isPassword: false
    },
    {
      key: "NEXT_PUBLIC_FINATIC_MOCK_API_ONLY",
      value: "",
      description: "Use only mock data (no real API calls)",
      isPublic: true,
      isPassword: false
    }
  ]

  return baseVars
}

export function EnvironmentSettings() {
  const { mode, environment } = useEnvironmentConfig()
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>(() => getAllEnvironmentVariables(mode, environment))
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isReloading, setIsReloading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Environment Variables</h2>
          <p className="text-muted-foreground">Manage your application's environment configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={isLoading || isSaving || isReloading}
            className="border-border text-foreground hover:bg-accent bg-transparent"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={saveEnvironmentVariables}
            disabled={isLoading || isSaving || isReloading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : isReloading ? 'Reloading...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Environment Variables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isReloading && (
          <div className="col-span-full flex items-center justify-center p-4 bg-muted/20 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Reloading environment variables...</span>
            </div>
          </div>
        )}
        {envVars.map((envVar) => (
          <Card key={envVar.key} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    {envVar.isPassword ? (
                      <Key className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                    ) : (
                      <Globe className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg text-foreground break-all">{envVar.key}</CardTitle>
                    </div>
                  </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {envVar.isPublic && (
                        <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded inline-block">
                          PUBLIC
                        </span>
                      )}
                      {envVar.isActive !== undefined && (
                        <span className={`px-2 py-1 text-xs rounded inline-block ${
                          envVar.isActive 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}>
                          {envVar.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      )}
                    </div>
                </div>
                {envVar.isPassword && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility(envVar.key)}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    {showPasswords[envVar.key] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
              <CardDescription className="text-muted-foreground">
                {envVar.description}
                {envVar.activeReason && (
                  <span className="block mt-1 text-xs italic">
                    {envVar.activeReason}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {envVar.key.includes('USE_MOCKS') || envVar.key.includes('MOCK_API_ONLY') ? (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Enable</Label>
                    <p className="text-xs text-muted-foreground">
                      {envVar.value === 'true' ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <Switch
                    checked={envVar.value === 'true'}
                    onCheckedChange={() => handleBooleanChange(envVar.key, envVar.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-foreground">Value</Label>
                  <div className="relative">
                    <Input
                      type={getInputType(envVar)}
                      value={envVar.value}
                      onChange={(e) => updateEnvVar(envVar.key, e.target.value)}
                      placeholder={getDefaultValue(envVar.key)}
                      className="bg-input border-border text-foreground pr-10"
                    />
                    {envVar.isPassword && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility(envVar.key)}
                      >
                        {showPasswords[envVar.key] ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-muted/20 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>PUBLIC</strong> variables are accessible in the browser and should not contain sensitive data</p>
          <p>• Changes will be applied after saving and refreshing the page</p>
          <p>• Make sure to restart your development server after changing environment variables</p>
          <p>• API keys and sensitive data should only be set in non-public variables</p>
        </CardContent>
      </Card>
    </div>
  )
}
