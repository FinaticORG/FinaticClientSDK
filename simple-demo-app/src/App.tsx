/**
 * Main App Component - UI Only
 *
 * This component demonstrates the UI layer. All SDK logic is separated
 * into src/sdk.ts for clarity. See that file to understand how to use
 * the Finatic Client SDK.
 */

import { useState, useEffect } from 'react';
import {
  initializeSDK,
  isAuthenticated,
  getUserId,
  openPortal,
  getBrokers,
  getAllAccounts,
  getAllOrders,
  getAllPositions,
  getAllBalances,
} from './sdk';
import './App.css';

function App() {
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    userId: null as string | null,
  });

  // Data State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Initialize SDK on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await initializeSDK();
        updateAuthStatus();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize SDK');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Update authentication status
  const updateAuthStatus = () => {
    setAuthStatus({
      isAuthenticated: isAuthenticated(),
      userId: getUserId(),
    });
  };

  // Check auth status periodically
  useEffect(() => {
    const interval = setInterval(updateAuthStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load all data
  const loadData = async () => {
    if (!authStatus.isAuthenticated) return;

    setLoadingData(true);
    setError(null);

    try {
      // Load all data in parallel using SDK functions
      const [brokersData, accountsData, ordersData, positionsData, balancesData] =
        await Promise.all([
          getBrokers(),
          getAllAccounts(),
          getAllOrders(),
          getAllPositions(),
          getAllBalances(),
        ]);

      setBrokers(brokersData);
      setAccounts(accountsData);
      setOrders(ordersData);
      setPositions(positionsData);
      setBalances(balancesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  // Handle portal authentication
  const handleOpenPortal = async () => {
    try {
      await openPortal(
        () => {
          updateAuthStatus();
          loadData();
        },
        (err: Error) => {
          setError(err.message);
        },
        () => {
          console.log('Portal closed');
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open portal');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="app">
        <div className="container">
          <h1>Finatic Client SDK Demo</h1>
          <p>Initializing SDK...</p>
        </div>
      </div>
    );
  }

  // Error state (before SDK initialized)
  if (error && !authStatus.isAuthenticated && brokers.length === 0) {
    return (
      <div className="app">
        <div className="container">
          <h1>Finatic Client SDK Demo</h1>
          <div className="error">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>Finatic Client SDK - Simple Demo</h1>
          <div className="auth-status">
            <span
              className={`status ${
                authStatus.isAuthenticated ? 'authenticated' : 'not-authenticated'
              }`}
            >
              {authStatus.isAuthenticated ? '✓ Authenticated' : '✗ Not Authenticated'}
            </span>
            {authStatus.userId && <span className="user-id">User: {authStatus.userId}</span>}
          </div>
        </header>

        {error && <div className="error">Error: {error}</div>}

        {!authStatus.isAuthenticated && (
          <div className="auth-section">
            <h2>Authentication Required</h2>
            <p>Click the button below to authenticate via the Finatic portal.</p>
            <button onClick={handleOpenPortal} className="btn btn-primary">
              Open Authentication Portal
            </button>
          </div>
        )}

        {authStatus.isAuthenticated && (
          <div className="data-section">
            <div className="actions">
              <button onClick={loadData} className="btn btn-primary" disabled={loadingData}>
                {loadingData ? 'Loading...' : 'Load Data'}
              </button>
            </div>

            <div className="data-grid">
              <div className="data-card">
                <h3>Brokers ({brokers.length})</h3>
                <div className="data-list">
                  {brokers.length === 0 ? (
                    <p className="empty">No brokers found</p>
                  ) : (
                    brokers.map((broker: any, idx: number) => (
                      <div key={idx} className="data-item">
                        <strong>{broker.name || broker.id}</strong>
                        {broker.status && <span className="badge">{broker.status}</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="data-card">
                <h3>Accounts ({accounts.length})</h3>
                <div className="data-list">
                  {accounts.length === 0 ? (
                    <p className="empty">No accounts found</p>
                  ) : (
                    accounts.map((account: any, idx: number) => (
                      <div key={idx} className="data-item">
                        <strong>{account.account_id || account.id}</strong>
                        {account.broker && <span className="badge">{account.broker}</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="data-card">
                <h3>Orders ({orders.length})</h3>
                <div className="data-list">
                  {orders.length === 0 ? (
                    <p className="empty">No orders found</p>
                  ) : (
                    orders.slice(0, 10).map((order: any, idx: number) => (
                      <div key={idx} className="data-item">
                        <strong>{order.symbol || order.instrument?.symbol || 'N/A'}</strong>
                        <span>
                          {order.side || ''} {order.quantity || order.qty || ''}
                        </span>
                        {order.status && <span className="badge">{order.status}</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="data-card">
                <h3>Positions ({positions.length})</h3>
                <div className="data-list">
                  {positions.length === 0 ? (
                    <p className="empty">No positions found</p>
                  ) : (
                    positions.slice(0, 10).map((position: any, idx: number) => (
                      <div key={idx} className="data-item">
                        <strong>{position.symbol || position.instrument?.symbol || 'N/A'}</strong>
                        <span>Qty: {position.quantity || position.size || position.qty || 0}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="data-card">
                <h3>Balances ({balances.length})</h3>
                <div className="data-list">
                  {balances.length === 0 ? (
                    <p className="empty">No balances found</p>
                  ) : (
                    balances.map((balance: any, idx: number) => (
                      <div key={idx} className="data-item">
                        <strong>{balance.account_id || balance.id || 'N/A'}</strong>
                        <span>
                          {balance.total_value || balance.balance
                            ? `$${Number(balance.total_value || balance.balance).toLocaleString()}`
                            : '$N/A'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
