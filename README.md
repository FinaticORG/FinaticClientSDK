# Finatic Client SDK

A comprehensive browser SDK for integrating Finatic Client into your web applications.

## Installation

```bash
npm install @finatic/client
# or
yarn add @finatic/client
```

## Basic Usage

### Simple Initialization

```typescript
import { FinaticConnect } from '@finatic/client';

// Just pass the token - everything else uses defaults
const finatic = await FinaticConnect.init('your-one-time-token');
```

### With User ID (for returning users)

```typescript
// Pass token and user ID from previous session
const finatic = await FinaticConnect.init('your-one-time-token', 'user-123');
```

### With Custom Configuration

```typescript
// Pass token, user ID, and custom API URL
const finatic = await FinaticConnect.init('your-one-time-token', 'user-123', {
  baseUrl: 'https://api.finatic.dev',
});
```

## Portal Management

### Opening the Portal

```typescript
// Open the portal with basic configuration
await finatic.openPortal({
  onSuccess: userId => {
    console.log('Authentication successful:', userId);
  },
  onError: error => {
    console.error('Authentication failed:', error);
  },
  onClose: () => {
    console.log('Portal closed');
  },
});

// Open portal with broker filtering
await finatic.openPortal({
  brokers: ['alpaca', 'robinhood'], // Only show these brokers
  onSuccess: userId => {
    console.log('Authentication successful:', userId);
  },
});

// Open portal with theming
await finatic.openPortal({
  theme: {
    primaryColor: '#007bff',
    logoUrl: 'https://example.com/logo.png',
  },
});
```

### Closing the Portal

```typescript
// Close the portal
await finatic.closePortal();
```

## Data Access

### Paginated Data Access

The SDK provides a consistent pagination pattern using `get*()` methods with navigation:

```typescript
// Get orders with pagination
const ordersPage = await finatic.getOrders({
  page: 1,
  perPage: 50,
  filter: { status: 'filled', symbol: 'AAPL' },
});

// Navigate through pages
const nextPage = await ordersPage.nextPage();
const prevPage = await ordersPage.previousPage();

// Check pagination status
console.log('Has next page:', ordersPage.hasNext);
console.log('Has previous page:', ordersPage.hasPrevious);
console.log('Current page:', ordersPage.page);
console.log('Total pages:', ordersPage.totalPages);
```

### Get All Data (Convenience Methods)

```typescript
// Get all data across all pages
const allOrders = await finatic.getAllOrders();
const allPositions = await finatic.getAllPositions();
const allAccounts = await finatic.getAllAccounts();
const allBalances = await finatic.getAllBalances();
```

### Convenience Filter Methods

```typescript
// Get filtered data
const openPositions = await finatic.getOpenPositions();
const filledOrders = await finatic.getFilledOrders();
const pendingOrders = await finatic.getPendingOrders();
const activeAccounts = await finatic.getActiveAccounts();

// Get data by symbol
const aaplOrders = await finatic.getOrdersBySymbol('AAPL');
const aaplPositions = await finatic.getPositionsBySymbol('AAPL');

// Get data by broker
const robinhoodOrders = await finatic.getOrdersByBroker('robinhood');
const robinhoodPositions = await finatic.getPositionsByBroker('robinhood');
```

## Trading Operations

### General Order Placement

```typescript
// Place a market order
const orderResponse = await finatic.placeOrder({
  symbol: 'AAPL',
  side: 'buy',
  quantity: 10,
  orderType: 'market',
  timeInForce: 'day',
});

// Place a limit order
const limitOrderResponse = await finatic.placeOrder({
  symbol: 'AAPL',
  side: 'buy',
  quantity: 10,
  orderType: 'limit',
  price: 150.0,
  timeInForce: 'gtc',
});
```

### Asset-Specific Order Methods

#### Stock Orders

```typescript
// Stock market order
const response = await finatic.placeStockMarketOrder('AAPL', 10, 'buy', 'robinhood', '123456789');

// Stock limit order
const response = await finatic.placeStockLimitOrder(
  'AAPL',
  10,
  'buy',
  150.0,
  'gtc',
  'robinhood',
  '123456789'
);

// Stock stop order
const response = await finatic.placeStockStopOrder(
  'AAPL',
  10,
  'sell',
  140.0,
  'gtc',
  'robinhood',
  '123456789'
);
```

#### Crypto Orders

```typescript
// Crypto market order
const response = await finatic.placeCryptoMarketOrder(
  'BTC-USD',
  0.1,
  'buy',
  'coinbase',
  '123456789'
);

// Crypto limit order
const response = await finatic.placeCryptoLimitOrder(
  'BTC-USD',
  0.1,
  'buy',
  50000.0,
  'gtc',
  'coinbase',
  '123456789'
);
```

#### Options Orders

```typescript
// Options market order
const response = await finatic.placeOptionsMarketOrder(
  'AAPL240315C00150000',
  1,
  'buy',
  'tasty_trade',
  '123456789'
);

// Options limit order
const response = await finatic.placeOptionsLimitOrder(
  'AAPL240315C00150000',
  1,
  'buy',
  5.0,
  'gtc',
  'tasty_trade',
  '123456789'
);
```

#### Futures Orders

```typescript
// Futures market order
const response = await finatic.placeFuturesMarketOrder('ES', 1, 'buy', 'ninja_trader', '123456789');

// Futures limit order
const response = await finatic.placeFuturesLimitOrder(
  'ES',
  1,
  'buy',
  4500.0,
  'gtc',
  'ninja_trader',
  '123456789'
);
```

### Order Management

```typescript
// Cancel an order
const response = await finatic.cancelOrder('order-123', 'robinhood', 'connection-456');

// Modify an order
const response = await finatic.modifyOrder(
  'order-123',
  { price: 155.0, quantity: 5 },
  'robinhood',
  'connection-456'
);
```

## Broker Information

```typescript
// Get list of supported brokers
const brokers = await finatic.getBrokerList();

// Get broker connections
const connections = await finatic.getBrokerConnections();

// Disconnect a company from a broker connection
const disconnectResponse = await finatic.disconnectCompany('connection-uuid-here');
console.log('Disconnect action:', disconnectResponse.response_data.action);
```

## Authentication

```typescript
// Check authentication status
const isAuthenticated = finatic.isAuthed();
const isAuthenticatedAlt = finatic.is_authenticated();

// Get user ID
const userId = finatic.getUserId();

// Set user ID (for returning users)
finatic.setUserId('user-123');
```

## Error Handling

```typescript
import { AuthenticationError, ApiError, ValidationError } from '@finatic/client';

try {
  const orders = await finatic.getOrders();
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Invalid request:', error.message);
  } else if (error instanceof ApiError) {
    console.error('API error:', error.message);
  }
}
```

## Advanced Usage

### Custom Filters

```typescript
// Get orders with custom filters
const orders = await finatic.getOrders({
  page: 1,
  perPage: 50,
  filter: {
    status: 'filled',
    symbol: 'AAPL',
    broker: 'robinhood',
  },
});
```

### Pagination Navigation

```typescript
// Get paginated results with navigation
const ordersPage = await finatic.getOrders({ page: 1, perPage: 100 });

// Navigate through pages
if (ordersPage.hasNext) {
  const nextPage = await ordersPage.nextPage();
}

if (ordersPage.hasPrevious) {
  const prevPage = await ordersPage.previousPage();
}
```

### Session Management

```typescript
// The SDK automatically manages sessions
// Sessions are kept alive for 24 hours by default
// No manual session management required
```

## Order and Position Detail Data

### Getting Order Fills

Order fills represent individual execution fills for an order:

```typescript
// Get fills for a specific order
const fills = await finatic.getOrderFills('order-123', {
  connection_id: 'connection-456',
  limit: 50,
  offset: 0,
});
```

### Getting Order Events

Order events represent lifecycle events for an order:

```typescript
// Get events for a specific order
const events = await finatic.getOrderEvents('order-123', {
  connection_id: 'connection-456',
  limit: 100,
});
```

### Getting Order Groups

Order groups contain multiple related orders:

```typescript
// Get order groups with filters
const groups = await finatic.getOrderGroups({
  broker_id: 'robinhood',
  connection_id: 'connection-456',
  created_after: '2024-01-01T00:00:00Z',
  limit: 50,
});
```

### Getting Position Lots (Tax Lots)

Position lots are used for tax reporting and track when positions were opened/closed:

```typescript
// Get position lots for tax reporting
const lots = await finatic.getPositionLots({
  broker_id: 'robinhood',
  account_id: '123456789',
  symbol: 'AAPL',
  limit: 100,
});
```

### Getting Position Lot Fills

Position lot fills show the execution details for each lot:

```typescript
// Get fills for a specific position lot
const lotFills = await finatic.getPositionLotFills('lot-123', {
  connection_id: 'connection-456',
  limit: 50,
});
```

## Type Definitions

The SDK includes comprehensive TypeScript definitions for all data structures:

- `BrokerDataOrder`: Order information
- `BrokerDataPosition`: Position information
- `BrokerDataAccount`: Account information
- `BrokerBalance`: Balance information
- `BrokerInfo`: Broker information
- `BrokerConnection`: Connection information
- `OrderResponse`: Order operation responses
- `PaginatedResult`: Paginated data responses
- `OrderFill`: Order fill information
- `OrderEvent`: Order event information
- `OrderGroup`: Order group information
- `PositionLot`: Position lot (tax lot) information
- `PositionLotFill`: Position lot fill information

## Error Types

- `AuthenticationError`: Authentication failures
- `ApiError`: API request failures
- `ValidationError`: Invalid request parameters
- `ConnectionError`: Network connectivity issues

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Requirements

- Modern browser with ES2018+ support
- No external dependencies

## License

MIT License
