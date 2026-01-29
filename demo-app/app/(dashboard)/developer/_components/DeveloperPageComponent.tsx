'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnvironmentSettings } from '@/app/(dashboard)/developer/_components/EnvironmentSettingsComponent';
import { useFinatic } from '@/app/providers/FinaticProvider';
import { useEnvironmentConfig } from '@/app/providers/EnvironmentConfigProvider';
import type { EnvironmentMode, EnvironmentType } from '@/lib/utils';
import {
  Code,
  Monitor,
  Server,
  Globe,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function DeveloperPageComponent() {
  const { sessionInfo } = useFinatic();
  const { mode, environment, setRuntime, getPublicApiUrl } = useEnvironmentConfig();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const runtimeOptions: Array<{
    id: string;
    mode: EnvironmentMode;
    environment: EnvironmentType;
    title: string;
    description: string;
    icon: typeof Globe;
  }> = [
    {
      id: 'sandbox:dev',
      mode: 'sandbox',
      environment: 'dev',
      title: 'Sandbox - Development',
      description: 'Test data + local development server',
      icon: Code,
    },
    {
      id: 'sandbox:staging',
      mode: 'sandbox',
      environment: 'staging',
      title: 'Sandbox - Staging',
      description: 'Test data + pre-production environment',
      icon: Globe,
    },
    {
      id: 'sandbox:prod',
      mode: 'sandbox',
      environment: 'prod',
      title: 'Sandbox - Production',
      description: 'Test data + production endpoints',
      icon: AlertCircle,
    },
    {
      id: 'live:dev',
      mode: 'live',
      environment: 'dev',
      title: 'Live - Development',
      description: 'Real mode + local development server',
      icon: Code,
    },
    {
      id: 'live:staging',
      mode: 'live',
      environment: 'staging',
      title: 'Live - Staging',
      description: 'Real mode + pre-production environment',
      icon: Globe,
    },
    {
      id: 'live:prod',
      mode: 'live',
      environment: 'prod',
      title: 'Live - Production',
      description: 'Real production data and keys',
      icon: CheckCircle,
    },
  ];

  const selectedRuntimeId = `${mode}:${environment}`;
  const selectedRuntime = runtimeOptions.find((o) => o.id === selectedRuntimeId);
  const publicApiUrl = getPublicApiUrl();

  const bestEffortClearBrowserCaches = async () => {
    if (typeof window === 'undefined') return;

    try {
      // Cache API - best effort (only affects CacheStorage, not HTTP cache)
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }
    } catch {
      // Ignore cache clearing errors
    }

    try {
      // Session storage is commonly used for runtime scoped state
      window.sessionStorage?.clear();
    } catch {
      // Ignore storage clearing errors
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Advanced Developer</h1>
          <p className="text-muted-foreground">
            Mode, environment, SDK, and management settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-border text-foreground">
            <Code className="w-3 h-3 mr-1" />
            Developer
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="environment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-muted">
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="environment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border md:col-span-2">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Runtime Selection
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Select the exact Mode + Environment combination used for token and API URL resolution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Runtime</Label>
                  <Select
                    value={selectedRuntimeId}
                    onValueChange={async (value) => {
                      const [nextMode, nextEnvironment] = value.split(':') as [
                        EnvironmentMode,
                        EnvironmentType,
                      ];
                      setRuntime(nextMode, nextEnvironment);

                      // Runtime changes affect token + portal URL resolution.
                      // Force a full reload to avoid any stale, in-memory SDK/portal state.
                      await bestEffortClearBrowserCaches();

                      try {
                        const url = new URL(window.location.href);
                        url.searchParams.set('__finatic_runtime_reload', Date.now().toString());
                        window.location.replace(url.toString());
                      } catch {
                        window.location.reload();
                      }
                    }}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select runtime..." />
                    </SelectTrigger>
                    <SelectContent>
                      {runtimeOptions.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <SelectItem key={opt.id} value={opt.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <div>
                                <div className="font-medium">{opt.title}</div>
                                <div className="text-xs text-muted-foreground">{opt.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Current Runtime</span>
                    {mode === 'live' ? (
                      <Badge variant="outline" className="ml-auto border-green-500/30 text-green-400">
                        LIVE
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-auto border-yellow-500/30 text-yellow-400">
                        SANDBOX
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Mode:</span>
                      <span className="text-foreground font-medium capitalize">{mode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Environment:</span>
                      <span className="text-foreground font-medium capitalize">{environment}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">API URL:</span>
                      <span className="text-foreground font-medium truncate max-w-[60%]">
                        {publicApiUrl || 'Not set'}
                      </span>
                    </div>
                    {selectedRuntime?.description ? (
                      <div className="text-xs text-muted-foreground pt-1">{selectedRuntime.description}</div>
                    ) : null}
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Changing runtime updates the API URL and key resolution for requests. The SDK will reinitialize automatically.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  SDK Status
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Current SDK initialization status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/20 rounded-lg border border-border">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-foreground text-xs">{sessionInfo}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="min-w-0 overflow-hidden">
              <EnvironmentSettings />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
