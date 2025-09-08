# Finatic Client SDK Demo

This is a Next.js demo application for testing the Finatic Client SDK with real API integration.

## Features

- 🔐 **Real API Integration** - Uses actual Finatic API endpoints
- 🧪 **SDK Testing** - Test all SDK methods and functionality
- 🪟 **Portal Testing** - Test portal opening and broker connection
- 📊 **Live Logging** - See real-time logs of all operations
- 🔧 **Environment Configuration** - Easy setup with environment variables
- 🔧 **Mock Mode** - Toggle between real API calls and mock data for testing

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Finatic API key

### Installation

1. **Install dependencies:**
   ```bash
   cd demo-app/js
   npm install
   ```

2. **Build the SDK (if not already built):**
   ```bash
   # From the root directory
   node dev.js build client
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp env.example .env.local
   
   # Edit .env.local with your actual values
   FINATIC_API_KEY=your_actual_api_key_here
   FINATIC_API_URL=http://localhost:8000  # or your actual API URL
   ```

4. **Start the demo:**
   ```bash
   npm run dev
   ```

The demo will open automatically in your browser at `http://localhost:3000`.

## Usage

### Automatic Testing

1. **SDK Initialization** - The app automatically initializes the SDK on load
2. **Token Fetching** - Gets a one-time token from your API endpoint
3. **Portal Connection** - Click "Connect Broker" to test portal functionality
4. **Method Testing** - Use the test buttons to call various SDK methods

### Manual Testing

- **Connect Broker** - Opens the Finatic portal for broker connection
- **Test Methods** - Test individual SDK methods (getBrokerList, getBrokerAccounts, etc.)
- **View Logs** - See real-time logs of all operations
- **Clear Logs** - Clear the log display

### Mock Mode

The demo app supports **Mock Mode** via environment variable:

- **Enable Mock Mode** - All API calls return realistic mock data instead of making real requests
- **Test Without API Server** - Perfect for development and testing without a running API
- **Environment Variable Control** - Set `NEXT_PUBLIC_FINATIC_USE_MOCKS=true` to enable
- **Visual Indicator** - Purple indicator shows when mock mode is active

**To use Mock Mode:**
1. Set `NEXT_PUBLIC_FINATIC_USE_MOCKS=true` in your environment
2. Restart the development server
3. The SDK will automatically use mock data for all API calls
4. You'll see "Mock Data" in the API Mode status indicator
5. All API calls will return realistic mock responses instantly

## Configuration

### Environment Variables

- `FINATIC_API_KEY` - Your Finatic API key (required)
- `FINATIC_API_URL` - Base URL for Finatic API (default: http://localhost:8000)
- `NEXT_PUBLIC_FINATIC_API_URL` - Public API URL for client-side use
- `NEXT_PUBLIC_FINATIC_USE_MOCKS` - Enable mock mode (default: false)

### Mock Mode Configuration

Mock mode is controlled through environment variable:

- **Environment Variable** - Set `NEXT_PUBLIC_FINATIC_USE_MOCKS=true` to enable mock mode
- **Default Behavior** - Mock mode is disabled by default (uses real API calls)
- **Visual Indicator** - Purple indicator shows when mock mode is active
- **No UI Toggle** - Mock mode is controlled via environment variable only

### API Endpoint

The demo includes a `/api/getToken` endpoint that:
- Uses your server-side API key
- Calls the Finatic API to get a one-time token
- Returns the token for SDK initialization

## Troubleshooting

### SDK Not Loading
- Make sure the SDK is built: `node dev.js build client`
- Check browser console for import errors
- Verify the file path in `package.json` is correct

### API Key Issues
- Ensure `FINATIC_API_KEY` is set in `.env.local`
- Check server logs for API key errors
- Verify the API key has proper permissions

### Portal Not Working
- Ensure the client is initialized first
- Check if portal module is available in the SDK
- Look for console errors in browser dev tools

### API Connection Issues
- Verify `FINATIC_API_URL` is correct
- Check if the Finatic API is running
- Look at server logs for connection errors

## Development

### Adding New Tests

1. Add new test functions in `app/page.tsx`
2. Add corresponding buttons to the UI
3. Update the logging to track new operations

### API Route

The `/api/getToken` route in `app/api/getToken/route.ts` handles:
- Server-side API key management
- Finatic API communication
- Error handling and logging

## File Structure

```
demo-app/js/
├── app/
│   ├── api/
│   │   └── getToken/
│   │       └── route.ts          # API endpoint for token
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main demo page
├── package.json                  # Dependencies and scripts
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── env.example                  # Environment variables example
└── README.md                    # This file
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The demo shows how to:
1. Use server-side API keys securely
2. Get one-time tokens from Finatic API
3. Initialize the SDK with tokens
4. Test real API calls and portal functionality

## Mock System Usage

The mock system is automatically integrated into the SDK. Here's how it works:

### Automatic Detection

The SDK automatically detects mock mode through multiple methods:
1. Environment variable: `FINATIC_USE_MOCKS=true`
2. Global variable: `window.FINATIC_USE_MOCKS = 'true'`
3. localStorage: `finatic_mock_mode = 'true'`

### Programmatic Usage

```typescript
import { FinaticConnect, MockFactory, setMockMode } from '@finatic/client';

// Enable mock mode programmatically
setMockMode(true);

// Or use the factory to create clients
const client = MockFactory.createApiClient('https://api.finatic.dev');

// Check if mocks are enabled
const isMockMode = MockFactory.isMockMode();
```

### Mock Data Features

- **Realistic Data** - All mock responses match real API structure
- **Configurable Delays** - Simulate network latency
- **Session Management** - Mock sessions and tokens work like real ones
- **Trading Operations** - Place orders, get portfolios, etc.
- **Broker Integration** - Mock broker connections and accounts 