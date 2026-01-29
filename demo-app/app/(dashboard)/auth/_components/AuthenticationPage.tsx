'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, RefreshCw, User, Shield, Trash2, ArrowRight, DoorOpen, Zap } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useFinatic } from '@/app/providers/FinaticProvider';
import { useEnvironmentConfig } from '@/app/providers/EnvironmentConfigProvider';
import Link from 'next/link';

export function AuthenticationPageComponent() {
  const {
    finatic,
    isLoading,
    error,
    logs,
    addLog,
    reinitialize,
    storedUserId,
    clearStoredUserId,
    clearLogs,
    isAuthed,
    currentUserId: contextUserId,
    checkAuth,
  } = useFinatic();
  const { mode } = useEnvironmentConfig();
  const [isAuthedStatus, setIsAuthedStatus] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Helper to determine if SDK is ready for auth checks
  const isSdkReady = useMemo(() => {
    return !!finatic;
  }, [finatic]);

  // Automatically sync local state with context values
  useEffect(() => {
    setIsAuthedStatus(isAuthed);
    setCurrentUserId(contextUserId);
  }, [isAuthed, contextUserId]);

  // Get session ID from finatic instance
  const sessionId = useMemo(() => {
    if (!finatic) return null;
    try {
      return finatic.getSessionId?.() ?? null;
    } catch {
      return null;
    }
  }, [finatic]);

  const statusBadge = useMemo(() => {
    if (error) {
      return (
        <Badge variant="secondary" className="bg-red-500/10 text-red-800 border-red-500/20">
          <AlertTriangle className="w-3 h-3 mr-1" /> Error
        </Badge>
      );
    }
    if (isLoading) {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-500/10 text-yellow-800 border-yellow-500/20"
        >
          <Shield className="w-3 h-3 mr-1" /> Initializing
        </Badge>
      );
    }
    if (!isSdkReady) {
      return (
        <Badge variant="secondary" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
          <Shield className="w-3 h-3 mr-1" /> Not Initialized
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-green-500/10 text-green-800 border-green-500/20">
        <CheckCircle className="w-3 h-3 mr-1" /> Initialized
      </Badge>
    );
  }, [error, isLoading, isSdkReady]);

  const handleCheckAuth = async () => {
    if (!isSdkReady) {
      addLog('error', 'SDK not ready - cannot check authentication');
      return;
    }
    try {
      addLog('info', 'Checking authentication status...');
      await checkAuth();
      const sdkIsAuthed = finatic?.isAuthed() ?? false;
      const sdkUserId = finatic?.getUserId() ?? null;
      addLog('success', `Authentication check completed - isAuthed: ${sdkIsAuthed}, userId: ${sdkUserId ?? 'none'}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to check authentication';
      addLog('error', msg);
    }
  };

  const handleClearUser = async () => {
    addLog('info', 'Clearing stored userId and reinitializing SDK');
    clearStoredUserId();
    await reinitialize();
    setIsAuthedStatus(null);
    setCurrentUserId(null);
  };

  const handleClearLogs = () => {
    addLog('info', 'Clearing logs');
    clearLogs();
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">SDK Initialization</h1>
          <p className="text-muted-foreground">
            Initialize the Finatic SDK using <code className="text-xs bg-muted px-1 py-0.5 rounded">FinaticConnect.init()</code>
          </p>
        </div>
        <div className="flex items-center gap-2">{statusBadge}</div>
      </div>

      {/* Authentication CTA - Show when not authenticated */}
      {isSdkReady && !isAuthedStatus && (
        <Alert className="border-blue-500/30 bg-blue-500/5">
          <DoorOpen className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-foreground">Ready to Authenticate</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            The SDK is initialized but you haven&apos;t authenticated yet. Open the Portal to connect your brokerage accounts.
          </AlertDescription>
          <div className="mt-3">
            <Link href="/portal">
              <Button className="gap-2">
                <DoorOpen className="h-4 w-4" />
                Open Portal to Authenticate
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {/* Authenticated status - Show when authenticated */}
      {isSdkReady && isAuthedStatus && (
        <Alert className="border-green-500/30 bg-green-500/5">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-foreground">Authenticated</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            You are authenticated as user: <code className="text-xs bg-muted px-1 py-0.5 rounded">{currentUserId}</code>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* SDK Initialization Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" /> SDK Status
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              FinaticConnect.init() configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Environment</span>
              <Badge variant="outline" className="capitalize">{mode}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Initialized</span>
              <span className={`font-medium ${isSdkReady ? 'text-green-500' : 'text-muted-foreground'}`}>
                {isSdkReady ? 'Yes' : 'No'}
              </span>
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="text-muted-foreground">Session ID</div>
              <div className="text-foreground font-mono text-xs break-all">
                {sessionId ?? 'None'}
              </div>
            </div>
            {error && <div className="text-xs text-red-500">{error}</div>}
            <div className="pt-2">
              <Button
                disabled={isLoading}
                onClick={() => void reinitialize()}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> 
                {isLoading ? 'Reinitializing...' : 'Reinitialize SDK'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> User Session
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Stored user ID from authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-foreground text-sm">Stored User ID</Label>
              <div className="text-sm text-muted-foreground break-all font-mono">
                {storedUserId ?? <span className="text-muted-foreground/50 italic">Not authenticated</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => void handleClearUser()}
                className="border-border"
                disabled={!storedUserId}
              >
                Clear User
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Auth Status Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Auth Status
            </CardTitle>
            <CardDescription className="text-muted-foreground">Query SDK auth state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => void handleCheckAuth()}
                disabled={!isSdkReady}
                variant="outline"
                className="w-full"
              >
                Refresh Auth Status
              </Button>
            </div>
            <div className="rounded-md border border-border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-mono text-xs">isAuthed()</span>
                <span
                  className={`font-medium ${isAuthedStatus ? 'text-green-500' : 'text-muted-foreground'}`}
                >
                  {isAuthedStatus === null ? '-' : String(isAuthedStatus)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-mono text-xs">getUserId()</span>
                <span className="font-mono text-xs text-foreground">{currentUserId ?? '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Initialization Logs</CardTitle>
              <CardDescription className="text-muted-foreground">
                SDK initialization events and actions
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearLogs}
              disabled={logs.length === 0}
              className="border-border hover:bg-destructive/10 hover:border-destructive/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-auto space-y-1 text-sm">
            {logs.length === 0 && <div className="text-muted-foreground">No logs yet</div>}
            {logs.map((log, idx) => (
              <div key={`${log.timestamp}-${idx}`} className="grid grid-cols-12 items-center gap-2">
                <div className="col-span-2 text-xs text-muted-foreground">{log.timestamp}</div>
                <div className="col-span-2">
                  <Badge
                    variant="outline"
                    className={
                      log.type === 'error'
                        ? 'border-red-500/30 text-red-400'
                        : log.type === 'success'
                          ? 'border-green-500/30 text-green-400'
                          : 'border-blue-500/30 text-blue-400'
                    }
                  >
                    {log.type}
                  </Badge>
                </div>
                <div className="col-span-8 text-foreground truncate">{log.message}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
