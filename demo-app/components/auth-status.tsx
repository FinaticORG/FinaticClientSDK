'use client';

import { useFinatic } from '@/app/providers/FinaticProvider';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, CircleX } from 'lucide-react';

export function AuthStatus() {
  const { isAuthed, currentUserId } = useFinatic();

  return (
    <div className="flex items-center gap-2">
      {isAuthed ? (
        <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
          <CheckCircle2 className="size-3" /> Authenticated
          {currentUserId && (
            <span className="ml-1 text-xs opacity-75">({currentUserId.slice(0, 8)}...)</span>
          )}
        </Badge>
      ) : (
        <Badge variant="destructive" className="gap-1">
          <CircleX className="size-3" /> Not Authenticated
        </Badge>
      )}
    </div>
  );
}
