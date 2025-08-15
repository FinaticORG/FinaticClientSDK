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
  baseUrl: 'https://api.finatic.dev'
});
```

// Open the portal
await finatic.openPortal({
  onSuccess: (userId) => {
    console.log('Authentication successful:', userId);
  },
  onError: (error) => {
    console.error('Authentication failed:', error);
  },
  onClose: () => {
    console.log('Portal closed');
  }
});

// After successful authentication, you can use these methods:

// Get list of supported brokers
const brokers = await finatic.getBrokerList();

// Get broker accounts with pagination
const accountsPage = await finatic.getAccounts({
  page: 1,
  perPage: 100
});

// Navigate through pages
const nextPage = await accountsPage.nextPage();
const prevPage = await accountsPage.previousPage();

// Get all accounts (convenience method)
const allAccounts = await finatic.getAllAccounts();

// Get orders with filtering
const ordersPage = await finatic.getOrders({
  page: 1,
  perPage: 50,
  filter: { status: 'filled', symbol: 'AAPL' }
});

// Get positions
const positionsPage = await finatic.getPositions({
  page: 1,
  perPage: 100
});

// Place orders
await finatic.placeOrder({
  symbol: 'AAPL',
  side: 'buy',
  quantity: 10,
  type: 'market',
  timeInForce: 'day'
});

// Open portal with broker filtering
await finatic.openPortal({
  brokers: ['alpaca', 'robinhood'] // Only show these brokers
});

// Disconnect a company from a broker connection
const disconnectResponse = await finatic.disconnectCompany('connection-uuid-here');
console.log('Disconnect action:', disconnectResponse.response_data.action);

// Close the portal when done
finatic.closePortal();
```

## API Reference

### Initialization

#### `FinaticConnect.init(token, userId?, options?)`

Initialize the Finatic Client SDK.

- `token` (string): One-time token from your backend
- `userId` (string, optional): Pre-authenticated user ID from previous session
- `options` (object, optional): Configuration options
  - `baseUrl` (string, optional): Custom API base URL

Returns: Promise<FinaticConnect>

### Portal Management

#### `openPortal(options?)`

Opens the authentication portal in an iframe.

- `options` (object, optional): Portal options
  - `onSuccess` (function): Called when authentication succeeds
  - `onError` (function): Called when authentication fails
  - `onClose` (function): Called when portal is closed
  - `onEvent` (function): Called when portal events occur
  - `theme` (object, optional): Theme configuration
    - `preset` (string, optional): Preset theme name ('dark', 'light', 'corporateBlue', 'purple', 'green', 'orange')
    - `custom` (object, optional): Custom theme configuration object
  - `brokers` (string[], optional): List of broker names to filter by (only these brokers will be shown)

#### `closePortal()`

Closes the authentication portal.

### Portal Theming

The Finatic Portal supports dynamic theme switching via URL parameters. You can customize the portal's appearance to match your application's branding.

#### Using Preset Themes

```javascript
// Use a preset theme
await finatic.openPortal({
  theme: { preset: 'corporateBlue' }
});

// Available presets: 'dark', 'light', 'corporateBlue', 'purple', 'green', 'orange'
```

#### Using Custom Themes

```javascript
// Use a custom theme
const customTheme = {
  mode: 'dark',
  colors: {
    background: {
      primary: '#1a1a1a',
      secondary: '#2a2a2a',
      tertiary: '#3a3a3a',
      accent: 'rgba(59, 130, 246, 0.1)',
      glass: 'rgba(255, 255, 255, 0.05)'
    },
    status: {
      connected: '#10B981',
      disconnected: '#EF4444',
      warning: '#F59E0B',
      pending: '#8B5CF6',
      error: '#EF4444',
      success: '#10B981'
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      muted: '#94A3B8',
      inverse: '#1a1a1a'
    },
    border: {
      primary: 'rgba(59, 130, 246, 0.2)',
      secondary: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(59, 130, 246, 0.4)',
      focus: 'rgba(59, 130, 246, 0.6)',
      accent: '#3B82F6'
    },
    input: {
      background: '#334155',
      border: 'rgba(59, 130, 246, 0.2)',
      borderFocus: '#3B82F6',
      text: '#F8FAFC',
      placeholder: '#94A3B8'
    },
    button: {
      primary: {
        background: '#3B82F6',
        text: '#FFFFFF',
        hover: '#2563EB',
        active: '#1D4ED8'
      },
      secondary: {
        background: 'transparent',
        text: '#3B82F6',
        border: '#3B82F6',
        hover: 'rgba(59, 130, 246, 0.1)',
        active: 'rgba(59, 130, 246, 0.2)'
      }
    }
  },
  branding: {
    primaryColor: '#3B82F6'
  }
};

await finatic.openPortal({
  theme: { custom: customTheme }
});
```

#### Theme Utilities

```javascript
import { 
  generatePortalThemeURL, 
  appendThemeToURL, 
  getThemePreset, 
  validateCustomTheme,
  createCustomThemeFromPreset,
  portalThemePresets 
} from 'finatic-sdk';

// Generate a themed portal URL
const themedUrl = generatePortalThemeURL('http://localhost:5173/companies', { preset: 'corporateBlue' });

// Get a theme preset
const darkTheme = getThemePreset('dark');

// Validate a custom theme
const isValid = validateCustomTheme(customTheme);

// Create a custom theme from a preset
const modifiedTheme = createCustomThemeFromPreset('dark', {
  colors: {
    background: {
      primary: '#000000'
    }
  }
});
```

### Portal Broker Filtering

The Finatic Portal supports broker filtering via URL parameters. You can restrict which brokers are displayed in the portal by specifying a list of allowed broker names.

#### Supported Brokers

The following broker names are supported:
- `alpaca` - Alpaca Markets
- `robinhood` - Robinhood
- `tasty_trade` - TastyTrade
- `ninja_trader` - NinjaTrader

#### Using Broker Filtering

```javascript
// Show only specific brokers
await finatic.openPortal({
  brokers: ['alpaca', 'robinhood']
});

// Show only one broker
await finatic.openPortal({
  brokers: ['tasty_trade']
});

// Combine with theme
await finatic.openPortal({
  theme: { preset: 'dark' },
  brokers: ['alpaca', 'ninja_trader']
});
```

#### Error Handling

If you pass an unsupported broker name, it will be logged as a warning to the console, but the portal will still open with the supported brokers:

```javascript
// This will log a warning for 'unsupported_broker' but continue with 'alpaca'
await finatic.openPortal({
  brokers: ['alpaca', 'unsupported_broker']
});
```

#### Broker Filtering Utilities

```javascript
import { 
  convertBrokerNamesToIds, 
  appendBrokerFilterToURL, 
  getSupportedBrokerNames,
  isBrokerSupported 
} from 'finatic-sdk';

// Convert broker names to IDs
const { brokerIds, warnings } = convertBrokerNamesToIds(['alpaca', 'robinhood']);

// Get list of supported broker names
const supportedBrokers = getSupportedBrokerNames();

// Check if a broker is supported
const isSupported = isBrokerSupported('alpaca');
```

### Data Access (Paginated)

#### `getAccounts(params?)`

Returns paginated broker accounts.

- `params` (object, optional): Query parameters
  - `page` (number, optional): Page number (default: 1)
  - `perPage` (number, optional): Items per page (default: 100)
  - `filter` (object, optional): Filter parameters

Returns: Promise<PaginatedResult<BrokerDataAccount[]>>

#### `getOrders(params?)`

Returns paginated order history.

- `params` (object, optional): Query parameters
  - `page` (number, optional): Page number (default: 1)
  - `perPage` (number, optional): Items per page (default: 100)
  - `filter` (object, optional): Filter parameters

Returns: Promise<PaginatedResult<BrokerDataOrder[]>>

#### `getPositions(params?)`

Returns paginated positions.

- `params` (object, optional): Query parameters
  - `page` (number, optional): Page number (default: 1)
  - `perPage` (number, optional): Items per page (default: 100)
  - `filter` (object, optional): Filter parameters

Returns: Promise<PaginatedResult<BrokerDataPosition[]>>

### Data Access (Get All - Convenience Methods)

#### `getAllAccounts(filter?)`

Returns all broker accounts across all pages.

- `filter` (object, optional): Filter parameters

Returns: Promise<BrokerDataAccount[]>

#### `getAllOrders(filter?)`

Returns all orders across all pages.

- `filter` (object, optional): Filter parameters

Returns: Promise<BrokerDataOrder[]>

#### `getAllPositions(filter?)`

Returns all positions across all pages.

- `filter` (object, optional): Filter parameters

Returns: Promise<BrokerDataPosition[]>

### Convenience Methods

#### `getOpenPositions()`

Returns only open positions.

Returns: Promise<BrokerDataPosition[]>

#### `getFilledOrders()`

Returns only filled orders.

Returns: Promise<BrokerDataOrder[]>

#### `getPendingOrders()`

Returns only pending orders.

Returns: Promise<BrokerDataOrder[]>

#### `getActiveAccounts()`

Returns only active accounts.

Returns: Promise<BrokerDataAccount[]>

#### `getOrdersBySymbol(symbol)`

Returns orders for a specific symbol.

- `symbol` (string): Stock symbol

Returns: Promise<BrokerDataOrder[]>

#### `getPositionsBySymbol(symbol)`

Returns positions for a specific symbol.

- `symbol` (string): Stock symbol

Returns: Promise<BrokerDataPosition[]>

#### `getOrdersByBroker(brokerId)`

Returns orders for a specific broker.

- `brokerId` (string): Broker ID

Returns: Promise<BrokerDataOrder[]>

#### `getPositionsByBroker(brokerId)`

Returns positions for a specific broker.

- `brokerId` (string): Broker ID

Returns: Promise<BrokerDataPosition[]>

### Broker Information

#### `getBrokerList()`

Returns a list of supported brokers.

Returns: Promise<BrokerInfo[]>

#### `getBrokerConnections()`

Returns broker connections for the authenticated user.

Returns: Promise<BrokerConnection[]>

#### `disconnectCompany(connectionId)`

Disconnects a company from a broker connection.

- `connectionId` (string): The connection ID to disconnect

Returns: Promise<DisconnectCompanyResponse>

The response includes:
- `success` (boolean): Whether the operation was successful
- `response_data.action` (string): Either 'company_access_removed' or 'connection_deleted'
- `response_data.remaining_companies` (number, optional): Number of remaining companies if connection still exists
- `response_data.message` (string): Human-readable message about the action taken

### Trading

#### `placeOrder(order)`

Places a new order.

- `order` (object): Order details
  - `symbol` (string): Stock symbol
  - `side` (string): 'buy' or 'sell'
  - `quantity` (number): Number of shares
  - `type` (string): 'market', 'limit', 'stop', or 'stop_limit'
  - `timeInForce` (string): 'day', 'gtc', 'opg', 'cls', 'ioc', or 'fok'
  - `price` (number, optional): Limit price
  - `stopPrice` (number, optional): Stop price

#### `cancelOrder(orderId, broker?)`

Cancels an existing order.

- `orderId` (string): Order ID to cancel
- `broker` (string, optional): Broker name

#### `modifyOrder(orderId, modifications, broker?)`

Modifies an existing order.

- `orderId` (string): Order ID to modify
- `modifications` (object): Order modifications
- `broker` (string, optional): Broker name

### Authentication

#### `isAuthed()`

Returns true if the user is fully authenticated (has userId, access token, and refresh token).

#### `getUserId()`

Returns the current user ID, or `null` if not authenticated.

#### `revokeToken()`

Revokes the current access token.

### Pagination Navigation

The `PaginatedResult` object returned by paginated methods includes navigation methods:

#### `nextPage()`

Returns the next page of results.

Returns: Promise<PaginatedResult<T> | null>

#### `previousPage()`

Returns the previous page of results.

Returns: Promise<PaginatedResult<T> | null>

#### `firstPage()`

Returns the first page of results.

Returns: Promise<PaginatedResult<T>>

#### `goToPage(pageNumber)`

Goes to a specific page.

- `pageNumber` (number): Page number to navigate to

Returns: Promise<PaginatedResult<T> | null>

## Error Handling

The SDK throws specific error types for different scenarios:

```typescript
import { 
  ApiError, 
  SessionError, 
  AuthenticationError, 
  AuthorizationError,
  RateLimitError,
  CompanyAccessError 
} from '@finatic/client';

try {
  await finatic.openPortal();
} catch (error) {
  if (error instanceof CompanyAccessError) {
    console.log('No broker connections found for this company');
  } else if (error instanceof AuthenticationError) {
    console.log('Authentication failed');
  }
}
```

## Browser Support

This SDK is designed for modern browsers and requires:

- ES2020 support
- Fetch API
- Promise support
- LocalStorage (for token caching)

## License

MIT 