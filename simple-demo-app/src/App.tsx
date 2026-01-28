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
  placeOrder,
  // getBrokers,
  // getAllAccounts,
  // getAllOrders,
  // getAllPositions,
  // getAllBalances,
  // getAllTransactions,
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

  // Trading State
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

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

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!authStatus.isAuthenticated) {
      setOrderError('Please authenticate first');
      return;
    }

    setPlacingOrder(true);
    setOrderError(null);
    setOrderResult(null);

    try {
      // Example order - adjust these values for your testing
      const result = await placeOrder({
        broker: 'robinhood', // Change to your broker
        accountNumber: 123456789, // Change to your account number
        order: {
          orderType: 'market',
          assetType: 'equity',
          action: 'buy',
          timeInForce: 'day',
          symbol: 'AAPL',
          orderQty: 1,
        },
      });

      setOrderResult(result);
      console.log('Order placed successfully:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place order';
      setOrderError(errorMessage);
      console.error('Error placing order:', err);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Handle portal authentication
  const handleOpenPortal = async () => {
    try {
      await openPortal({
        onSuccess: () => {
          updateAuthStatus();
        },
        onError: (err: Error) => {
          setError(err.message);
        },
        onClose: () => {
          console.log('Portal closed');
        },
      });
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
  if (error && !authStatus.isAuthenticated) {
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
              <button 
                onClick={handlePlaceOrder} 
                className="btn btn-primary" 
                disabled={placingOrder}
              >
                {placingOrder ? 'Placing Order...' : 'Place Order (Test)'}
              </button>
            </div>

            {orderError && (
              <div className="error" style={{ marginTop: '1rem' }}>
                Order Error: {orderError}
              </div>
            )}

            {orderResult && (
              <div className="data-card" style={{ marginTop: '1rem' }}>
                <h3>Order Result</h3>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '1rem', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '400px'
                }}>
                  {JSON.stringify(orderResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
