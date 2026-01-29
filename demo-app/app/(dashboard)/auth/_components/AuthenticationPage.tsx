'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, RefreshCw, User, Shield, Trash2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useFinatic } from '@/app/providers/FinaticProvider';
import { useEnvironmentConfig } from '@/app/providers/EnvironmentConfigProvider';

export function AuthenticationPageComponent() {
  const {
    finatic,
    isLoading,
    error,
    sessionInfo,
    logs,
    addLog,
    reinitialize,
    storedUserId,
    setStoredUserId,
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

  const connectionBadge = useMemo(() => {
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
    return (
      <Badge variant="secondary" className="bg-green-500/10 text-green-800 border-green-500/20">
        <CheckCircle className="w-3 h-3 mr-1" /> Ready
      </Badge>
    );
  }, [error, isLoading]);

  const handleCheckAuth = async () => {
    if (!isSdkReady) return;
    try {
      addLog('info', 'Checking authentication status');
      // Use the context checkAuth function which handles both client and server SDKs
      await checkAuth();
      addLog('success', 'Authentication check completed');
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Authentication</h1>
          <p className="text-muted-foreground">
            Interact with the Finatic SDK and inspect auth state
          </p>
        </div>
        <div className="flex items-center gap-2">{connectionBadge}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" /> SDK Session
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Initialization and environment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mode</span>
              <span className="text-foreground font-medium capitalize">{mode}</span>
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="text-muted-foreground">Session</div>
              <div className="text-foreground">{sessionInfo}</div>
            </div>
            {error && <div className="text-xs text-red-500">{error}</div>}
            <div className="pt-2">
              <Button
                disabled={isLoading}
                onClick={() => void reinitialize()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Reinitialize SDK
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> User
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage the active user id
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-foreground text-sm">Stored User ID</Label>
              <div className="text-sm text-muted-foreground break-all">
                {storedUserId ?? 'None'}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => void handleClearUser()}
                className="border-border"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Auth Status
            </CardTitle>
            <CardDescription className="text-muted-foreground">Query the SDK</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => void handleCheckAuth()}
                disabled={!isSdkReady}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Check Authentication
              </Button>
            </div>
            <div className="rounded-md border border-border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">isAuthed()</span>
                <span
                  className={`font-medium ${isAuthedStatus ? 'text-green-500' : 'text-muted-foreground'}`}
                >
                  {isAuthedStatus === null ? '-' : String(isAuthedStatus)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">getUserId()</span>
                <span className="font-mono text-foreground">{currentUserId ?? '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Logs</CardTitle>
              <CardDescription className="text-muted-foreground">
                SDK initialization and actions
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
