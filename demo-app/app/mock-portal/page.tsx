'use client';
import React, { useState } from 'react';

export default function MockPortal() {
  const [permissions, setPermissions] = useState<string[]>(['read', 'write']);
  const [brokerStatus, setBrokerStatus] = useState<'disconnected' | 'connected'>('disconnected');

  const sendMessage = (type: string, data: any = {}) => {
    window.parent.postMessage({ type, data }, '*');
  };

  const handleConnect = () => {
    const mockUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
    const mockAccessToken = 'mock_access_token_' + Math.random().toString(36).substr(2, 8);
    const mockRefreshToken = 'mock_refresh_token_' + Math.random().toString(36).substr(2, 8);
    sendMessage('portal-success', {
      userId: mockUserId,
      access_token: mockAccessToken,
      refresh_token: mockRefreshToken
    });
  };

  const handleDisconnect = () => {
    sendMessage('event', { 
      type: 'user_disconnected', 
      data: { message: 'User disconnected from portal' }
    });
  };

  const handleUpdatePermissions = () => {
    const mockBrokerId = 'mock_broker_123';
    sendMessage('event', { 
      type: 'permissions_updated', 
      data: { 
        brokerId: mockBrokerId,
        permissions: permissions 
      } 
    });
  };

  const handleBrokerToggle = () => {
    const newStatus = brokerStatus === 'disconnected' ? 'connected' : 'disconnected';
    setBrokerStatus(newStatus);
    
    const mockBrokerId = 'mock_broker_123';
    sendMessage('event', { 
      type: newStatus === 'connected' ? 'broker_connected' : 'broker_disconnected',
      data: { brokerId: mockBrokerId, status: newStatus }
    });
  };

  const handleError = () => {
    sendMessage('portal-error', { message: 'Simulated error from mock portal' });
  };

  const handleClose = () => {
    sendMessage('portal-close');
  };

  const handlePermissionsChange = (permission: string) => {
    const newPermissions = permissions.includes(permission)
      ? permissions.filter(p => p !== permission)
      : [...permissions, permission];
    
    setPermissions(newPermissions);
  };

  return (
    <div style={{ 
      padding: 32, 
      fontFamily: 'sans-serif',
      maxWidth: 500,
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Portal</h1>
        <button 
          onClick={handleClose}
          style={{
            padding: '8px 16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Connect Section */}
        <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Portal Actions</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button 
              onClick={handleConnect}
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Authenticate User
            </button>
            <button 
              onClick={handleDisconnect}
              style={{
                padding: '8px 16px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Disconnect User
            </button>
            <button 
              onClick={handleError}
              style={{
                padding: '8px 16px',
                background: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Simulate Error
            </button>
          </div>
        </div>

        {/* Permissions Section */}
        <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Permissions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {['read', 'write', 'full'].map(permission => (
              <label key={permission} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={permissions.includes(permission)}
                  onChange={() => handlePermissionsChange(permission)}
                />
                {permission.charAt(0).toUpperCase() + permission.slice(1)}
              </label>
            ))}
          </div>
          <button 
            onClick={handleUpdatePermissions}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Update Permissions
          </button>
        </div>

        {/* Broker Section */}
        <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Broker Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>Status: <strong>{brokerStatus}</strong></span>
            <button 
              onClick={handleBrokerToggle}
              style={{
                padding: '8px 16px',
                background: brokerStatus === 'connected' ? '#dc3545' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              {brokerStatus === 'connected' ? 'Disconnect' : 'Connect'} Broker
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          background: '#f8f9fa', 
          borderRadius: 4,
          fontSize: 14,
          color: '#666'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>This is a mock portal for SDK integration testing.</p>
          <p style={{ margin: 0 }}>Use the controls above to simulate portal actions and send messages to the SDK.</p>
        </div>
      </div>
    </div>
  );
} 