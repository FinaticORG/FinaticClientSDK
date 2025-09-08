'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { FinaticProvider, useFinatic } from '@/app/(home)/providers/FinaticProvider';

function Header() {
  const { isMockMode, sessionInfo, reinitialize, isLoading } = useFinatic();
  const infoText = (sessionInfo || '').replace(/^(Real Mode|Mock Mode|Mock API Only Mode)\s*-\s*/i, '').trim();
  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div>
                <div className="flex flex-wrap md:flex-nowrap items-baseline gap-3">
                  <h1 className="text-2xl leading-tight font-bold text-gray-900">
                    Finatic SDK Demo
                  </h1>
                  <button 
                    onClick={() => reinitialize()} 
                    disabled={isLoading} 
                    className="inline-flex items-center whitespace-nowrap space-x-1 px-3 py-1.5 text-xs font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title="Reinitialize SDK"
                  >
                    {isLoading ? (
                      <>
                        <span className="text-xs">⟳</span>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs">🔄</span>
                        <span>Reinitialize</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isMockMode ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                    {isMockMode ? '🔧 Mock Mode' : '🚀 Real Mode'}
                  </span>
                  <span className="text-sm text-gray-600">{infoText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const NAV_LINKS = [
  { href: '/fetchers/accounts', label: 'Accounts', icon: '👤' },
  { href: '/fetchers/orders', label: 'Orders', icon: '📋' },
  { href: '/fetchers/positions', label: 'Positions', icon: '📊' },
  { href: '/portal', label: 'Portal', icon: '🚪' },
  { href: '/advanced', label: 'Advanced', icon: '⚙️' },
  { href: '/executors/trading', label: 'Trading', icon: '💹' },
];

function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-[89px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <button className={`
                  flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-[1.02]' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 hover:shadow-sm'
                  }
                `}>
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function ConsolePanel() {
  const { logs } = useFinatic();
  const [open, setOpen] = useState(false);
  
  return (
    <div className={`fixed bottom-4 right-4 bg-gray-900 text-white shadow-2xl rounded-lg transition-all duration-300 ${open ? 'w-96 h-80' : 'w-48 h-12'} flex flex-col z-50 border border-gray-700`}>
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-800 rounded-t-lg" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-mono text-sm font-medium">Console</span>
          <span className="text-xs text-gray-400">({logs.length})</span>
        </div>
        <div className="text-gray-400 hover:text-white">
          <span className="text-sm">{open ? '▼' : '▲'}</span>
        </div>
      </div>
      {open && (
        <div className="flex-1 overflow-y-auto font-mono text-xs px-4 py-2 bg-gray-950 rounded-b-lg">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No logs yet</div>
          ) : (
            <div className="space-y-1">
              {logs.slice(-50).map((log, idx) => (
                <div key={idx} className={`flex items-start space-x-2 p-2 rounded ${log.type === 'error' ? 'bg-red-900/20 text-red-300' : log.type === 'success' ? 'bg-green-900/20 text-green-300' : 'bg-gray-800/50 text-gray-300'}`}>
                  <span className="text-gray-500 text-xs shrink-0">[{log.timestamp}]</span>
                  <span className={`font-semibold text-xs uppercase shrink-0 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-blue-400'}`}>{log.type}</span>
                  <span className="text-xs break-words">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <FinaticProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
      <ConsolePanel />
    </FinaticProvider>
  );
}


