'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { FinaticProvider, useFinatic } from '@/app/(home)/providers/FinaticProvider';

function Header() {
  const { isMockMode, sessionInfo, reinitialize, isLoading } = useFinatic();
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finatic SDK Demo</h1>
            <p className="text-sm text-gray-600 mt-1">
              {sessionInfo} • {isMockMode ? '🔧 Mock Mode' : '🚀 Real Mode'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => reinitialize()} disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Loading...' : 'Reinitialize'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const NAV_LINKS = [
  { href: '/fetchers/accounts', label: 'Accounts' },
  { href: '/fetchers/orders', label: 'Orders' },
  { href: '/fetchers/positions', label: 'Positions' },
  { href: '/portal', label: 'Portal' },
  { href: '/advanced', label: 'Advanced' },
  { href: '/executors/trading', label: 'Trading' },
];

function NavBar() {
  const pathname = usePathname();
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <button className={`py-2 px-4 border-b-2 font-medium text-sm rounded-t-md transition-colors ${isActive ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}>
                {link.label}
              </button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function ConsolePanel() {
  const { logs } = useFinatic();
  const [open, setOpen] = useState(true);
  return (
    <div className={`fixed top-0 right-0 h-full bg-gray-900 text-white shadow-lg transition-all duration-300 ${open ? 'w-96' : 'w-10'} flex flex-col z-50`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <span className="font-mono text-sm truncate">Console</span>
        <div className="flex items-center space-x-2">
          <span className="text-xs">{open ? '◨' : '◧'}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-xs px-3 py-2">
        {logs.length === 0 ? (
          <div className="text-gray-400">No logs yet.</div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-200'}`}>[{log.timestamp}] {log.type.toUpperCase()}: {log.message}</div>
          ))
        )}
      </div>
    </div>
  );
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <FinaticProvider>
      <div className={`min-h-screen bg-gray-50 pr-96`}>
        <Header />
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </div>
      <ConsolePanel />
    </FinaticProvider>
  );
}


