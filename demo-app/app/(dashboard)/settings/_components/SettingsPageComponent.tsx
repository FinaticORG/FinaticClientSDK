'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnvironmentSettings } from '@/app/(dashboard)/settings/_components/EnvironmentSettingsComponent';
import { useFinatic, type SdkType } from '@/app/providers/FinaticProvider';
import { useEnvironmentConfig, type EnvironmentMode, type EnvironmentType } from '@/app/providers/EnvironmentConfigProvider';
import {
  Settings,
  Palette,
  Monitor,
  Sun,
  Moon,
  Computer,
  Smartphone,
  Code,
  Server,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function SettingsPageComponent() {
  const { theme, setTheme } = useTheme();
  const { sdkType, setSdkType, sessionInfo } = useFinatic();
  const { mode, environment, setMode, setEnvironment } = useEnvironmentConfig();
  const [mounted, setMounted] = useState(false);

  // Local state for the select to ensure it updates properly
  const [localSdkType, setLocalSdkType] = useState<SdkType>(sdkType);

  // Debug: Log SDK type changes
  useEffect(() => {
    console.log('🔍 SDK Type changed to:', sdkType);
  }, [sdkType]);

  // Debug: Log setSdkType function
  useEffect(() => {
    console.log('🔍 setSdkType function:', setSdkType);
  }, [setSdkType]);

  // Sync local state with context state
  useEffect(() => {
    setLocalSdkType(sdkType);
  }, [sdkType]);
  const [serverStatus, setServerStatus] = useState<{ python: boolean; node: boolean }>({
    python: false,
    node: false,
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check server status
  useEffect(() => {
    if (!mounted) return;

    const checkServerStatus = async () => {
      try {
        const [pythonResponse, nodeResponse] = await Promise.allSettled([
          fetch('http://localhost:8002/api/health', {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
          })
            .then(r => r.ok)
            .catch(() => false),
          fetch('http://localhost:8003/api/health', {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
          })
            .then(r => r.ok)
            .catch(() => false),
        ]);

        setServerStatus({
          python: pythonResponse.status === 'fulfilled' && pythonResponse.value,
          node: nodeResponse.status === 'fulfilled' && nodeResponse.value,
        });
      } catch {
        setServerStatus({ python: false, node: false });
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Computer },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application preferences and environment settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-border text-foreground">
            <Settings className="w-3 h-3 mr-1" />
            Settings
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="environment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Environment Settings */}
        <TabsContent value="environment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Mode Selection (Sandbox/Live) */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Mode Selection
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choose between Sandbox (test) or Live (production) mode
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={mode} onValueChange={(value) => setMode(value as EnvironmentMode)}>
                  <TabsList className="grid w-full grid-cols-2 bg-muted">
                    <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
                    <TabsTrigger value="live">Live</TabsTrigger>
                  </TabsList>
                  <TabsContent value="sandbox" className="mt-4">
                    <div className="p-4 bg-muted/20 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-foreground">Sandbox Mode</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Uses test data and sandbox API keys. Safe for development and testing.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="live" className="mt-4">
                    <div className="p-4 bg-muted/20 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-foreground">Live Mode</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Uses real production data and live API keys. Use with caution.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Environment Selection (Dev/Staging/Prod) */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Environment Selection
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choose the API environment to connect to
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Environment</Label>
                  <Select value={environment} onValueChange={(value) => setEnvironment(value as EnvironmentType)}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dev">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Development</div>
                            <div className="text-xs text-muted-foreground">Local development server</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="staging">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Staging</div>
                            <div className="text-xs text-muted-foreground">Pre-production environment</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="prod">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Production</div>
                            <div className="text-xs text-muted-foreground">Live production environment</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Current Configuration</span>
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
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Changing the environment will update the API URL and API key used for all requests.
                    You may need to refresh the page for changes to take full effect.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Theme Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Customize the appearance of your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Color Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="w-4 h-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Current Theme</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {theme === 'light' && <Sun className="w-4 h-4 text-yellow-500" />}
                    {theme === 'dark' && <Moon className="w-4 h-4 text-blue-400" />}
                    {theme === 'system' && <Computer className="w-4 h-4 text-green-500" />}
                    <span className="text-sm text-muted-foreground">
                      {theme === 'system' ? 'Following system preference' : `${theme} mode`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Display Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure how content is displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Compact Mode</Label>
                    <p className="text-xs text-muted-foreground">Reduce spacing for more content</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">Show Animations</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable smooth transitions and animations
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground">High Contrast</Label>
                    <p className="text-xs text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-4">
          {/* SDK Configuration - Full width on mobile, side panel on large screens */}
          <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  SDK Configuration
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choose which SDK implementation to use for API calls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">SDK Type</Label>
                  <Select
                    value={localSdkType}
                    onValueChange={(value: SdkType) => {
                      console.log('📝 Select onValueChange called with:', value);
                      console.log('📝 Current localSdkType before change:', localSdkType);
                      console.log('📝 Current sdkType before change:', sdkType);
                      setLocalSdkType(value);
                      setSdkType(value);
                    }}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select SDK type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Client SDK</div>
                            <div className="text-xs text-muted-foreground">
                              Direct SDK usage (default)
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="python">
                        <div className="flex items-center gap-2">
                          <Server className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Python Server SDK</div>
                            <div className="text-xs text-muted-foreground">
                              Via API server (port 8002)
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="node">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Node Server SDK</div>
                            <div className="text-xs text-muted-foreground">
                              Via API server (port 8003)
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Current Configuration
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">SDK Type:</span>
                      <span className="text-foreground font-medium capitalize">{sdkType} SDK</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-foreground text-xs">{sessionInfo}</span>
                    </div>
                    {sdkType !== 'client' && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Server:</span>
                        <div className="flex items-center gap-1">
                          {serverStatus[sdkType] ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-green-600 text-xs">Online</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-red-500" />
                              <span className="text-red-600 text-xs">Offline</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {sdkType !== 'client' && !serverStatus[sdkType as 'python' | 'node'] && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {sdkType.charAt(0).toUpperCase() + sdkType.slice(1)}
                      API server is not running. Please start the server on port{' '}
                      {sdkType === 'python' ? '8002' : '8003'} to use this SDK.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Environment Settings - Takes remaining space */}
            <div className="min-w-0 overflow-hidden">
              <EnvironmentSettings />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
