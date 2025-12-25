# Finatic Client SDK

A comprehensive browser SDK for integrating Finatic into your web applications. Connect your users to multiple brokerages through a unified, standardized interface.

**Finatic is a brokerage first aggregator. We simplify, standardize and enhance broker data.**

## Installation

```bash
npm install @finatic/client
```

Or using yarn:

```bash
yarn add @finatic/client
```

## Quick Start (5 Minutes)

### 1. Initialize the SDK

```typescript
import { FinaticConnect } from '@finatic/client';

// Initialize with a one-time token (obtained from your backend)
const finatic = await FinaticConnect.init('your-one-time-token', undefined, {
  baseUrl: 'https://api.finatic.dev', // Optional, defaults to production
  logLevel: 'info', // Optional: 'debug' | 'info' | 'warn' | 'error'
});
```

**Note:** The Client SDK requires a one-time token (not an API key). Get this token from your backend server using the Server SDK's `getToken()` method.

### 2. Open the Portal for Authentication

The portal allows users to connect their broker accounts. You can either:

**Option A: Open portal in iframe (recommended)**

```typescript
await finatic.openPortal({
  theme: { preset: 'stockAlgos' }, // Theme: 'light' | 'dark' | theme object
  brokers: ['alpaca', 'tradier'], // Optional: Filter specific brokers
  email: 'user@example.com', // Optional: Pre-fill email
  mode: 'dark', // Optional: 'light' | 'dark'
  onSuccess: (userId) => {
    // User successfully authenticated
    console.log('User authenticated:', userId);
  },
  onError: (error) => {
    // Handle authentication error
    console.error('Portal error:', error);
  },
  onClose: () => {
    // Portal was closed
    console.log('Portal closed');
  }
});
```

**Option B: Get portal URL and redirect**

```typescript
const portalUrl = await finatic.getPortalUrl(
  'dark', // Theme
  ['alpaca'], // Optional: Filter brokers
  'user@example.com', // Optional: Pre-fill email
  'dark' // Mode
);

// Redirect user to portal URL
window.location.href = portalUrl;
```

### 3. Check Authentication Status

```typescript
// Check if user is authenticated
const isAuthenticated = finatic.isAuthed();

// Get current user ID
const userId = finatic.getUserId();
```

### 4. Fetch Data

Once authenticated, you can fetch broker data:

```typescript
// Get all orders (automatically paginates through all pages)
const allOrders = await finatic.getAllOrders();

// Get orders with filters (single page)
const orders = await finatic.getOrders({
  brokerId: 'alpaca',
  accountId: '123456789',
  orderStatus: 'filled',
  limit: 100,
  offset: 0,
});

// Get all positions
const allPositions = await finatic.getAllPositions();

// Get positions with filters
const positions = await finatic.getPositions({
  brokerId: 'alpaca',
  symbol: 'AAPL',
  limit: 50,
});

// Get all accounts
const allAccounts = await finatic.getAllAccounts();

// Get balances
const balances = await finatic.getBalances({
  brokerId: 'alpaca',
  accountId: '123456789',
});
```

## Complete Example

```typescript
import { FinaticConnect } from '@finatic/client';

async function setupFinatic() {
  // 1. Initialize SDK (get token from your backend)
  const token = await fetch('/api/finatic/token').then((r) => r.text());
  const finatic = await FinaticConnect.init(token);

  // 2. Open portal for authentication
  await finatic.openPortal({
    theme: { preset: 'stockAlgos' },
    mode: 'dark',
    onSuccess: async (userId) => {
      console.log('User authenticated:', userId);

      // 3. Fetch data after authentication
      const orders = await finatic.getAllOrders();
      const positions = await finatic.getAllPositions();
      const accounts = await finatic.getAllAccounts();

      console.log('Orders:', orders);
      console.log('Positions:', positions);
      console.log('Accounts:', accounts);
    },
    onError: (error) => {
      console.error('Authentication failed:', error);
    }
  });
}

setupFinatic();
```

## Available Data Methods

### Orders

- `getOrders(params?)` - Get single page of orders
- `getAllOrders(params?)` - Get all orders (auto-paginated)
- `getOrderFills({ orderId, ... })` - Get fills for a specific order
- `getAllOrderFills({ orderId, ... })` - Get all fills (auto-paginated)
- `getOrderEvents({ orderId, ... })` - Get events for a specific order
- `getAllOrderEvents({ orderId, ... })` - Get all events (auto-paginated)
- `getOrderGroups(params?)` - Get order groups
- `getAllOrderGroups(params?)` - Get all order groups (auto-paginated)

### Positions

- `getPositions(params?)` - Get single page of positions
- `getAllPositions(params?)` - Get all positions (auto-paginated)
- `getPositionLots(params?)` - Get position lots
- `getAllPositionLots(params?)` - Get all position lots (auto-paginated)
- `getPositionLotFills({ lotId, ... })` - Get fills for a specific lot
- `getAllPositionLotFills({ lotId, ... })` - Get all fills (auto-paginated)

### Accounts & Balances

- `getAccounts(params?)` - Get single page of accounts
- `getAllAccounts(params?)` - Get all accounts (auto-paginated)
- `getBalances(params?)` - Get balances
- `getAllBalances(params?)` - Get all balances (auto-paginated)

### Broker Management

- `getBrokers()` - Get available brokers
- `getBrokerConnections()` - Get connected broker accounts
- `disconnectCompanyFromBroker({ connectionId })` - Disconnect a broker

### Company

- `getCompany({ companyId })` - Get company information

## Method Parameters

Most data methods accept optional parameters:

```typescript
{
  brokerId?: string;        // Filter by broker (e.g., 'alpaca', 'tradier')
  connectionId?: string;   // Filter by connection ID
  accountId?: string;       // Filter by account ID
  symbol?: string;          // Filter by symbol (e.g., 'AAPL')
  limit?: number;           // Page size (default: varies by endpoint)
  offset?: number;          // Pagination offset (default: 0)
  includeMetadata?: boolean; // Include metadata in response
  // ... other filters specific to each method
}
```

## Event Handling

The SDK extends EventEmitter, so you can listen to events:

```typescript
// Listen for portal events
finatic.on('portal:success', (userId: string) => {
  console.log('Portal authentication successful:', userId);
});

finatic.on('portal:error', (error: Error) => {
  console.error('Portal error:', error);
});

finatic.on('portal:close', () => {
  console.log('Portal closed');
});
```

## Response Format

All data methods return a `FinaticResponse` object:

```typescript
{
  success: {
    data: T[], // Array of data items
    // ... other metadata
  },
  error?: {
    message: string;
    code?: string;
  },
  warning?: string[]
}
```

Access the data:

```typescript
const result = await finatic.getOrders();
if (result.success) {
  const orders = result.success.data;
  // Use orders...
} else {
  console.error('Error:', result.error?.message);
}
```

## Configuration Options

```typescript
const finatic = await FinaticConnect.init(token, userId, {
  baseUrl: 'https://api.finatic.dev', // API base URL
  logLevel: 'info', // 'debug' | 'info' | 'warn' | 'error'
  structuredLogging: false, // Enable structured JSON logging
  // ... other options
});
```

## Documentation

Full API documentation is available at [https://finatic.dev/docs](https://finatic.dev/doc).

## License

PROPRIETARY

## Copyright

© Copyright 2025 Finatic. All Rights Reserved.

---

**Finatic** - Fast. Secure. Standardized.
