# Finatic Client SDK - Simple Demo

A simple React demo application that demonstrates the Finatic Client SDK usage. This is a minimal example similar to the server SDK demo apps, but with a UI.

## Features

- **Clean Architecture**: SDK logic separated from UI (`src/sdk.ts` vs `src/App.tsx`)
- **Singleton Pattern**: Single SDK instance managed in `sdk.ts`
- **Simple API**: Easy-to-understand functions for all SDK operations
- **Authentication**: Via Finatic portal
- **Data Display**: Accounts, orders, positions, balances, and brokers
- **Runs on port 5174** (separate from the main demo app)

## Project Structure

```
src/
├── sdk.ts          # All SDK logic - initialization, authentication, data fetching
├── App.tsx         # UI only - displays data and handles user interactions
├── App.css         # Styling
└── main.tsx        # Entry point
```

## Setup

1. **Navigate to the directory**:

```bash
cd codebases/SDKs/Client/FinaticClientSDK/simple-demo-app
```

2. **Install dependencies**:

```bash
yarn install
```

This will install:
- `@finatic/client` (latest version from npm)
- React and React DOM
- Vite and other dev dependencies

3. **Create a `.env` file** in the `simple-demo-app` directory:

```bash
VITE_FINATIC_API_KEY=your_api_key_here
```

**⚠️ Production Note**: In production, you should NOT fetch tokens directly from the frontend. Instead:
- Create a backend API endpoint (e.g., `/api/finatic/token`)
- Your frontend calls your backend
- Your backend securely calls the Finatic API with your API key
- This prevents exposing your API key in the frontend bundle

See `src/sdk.ts` for more details and the production note.

## Running

```bash
yarn dev
```

The app will start and be available at **`http://localhost:5174`**

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

## Usage

1. The app automatically initializes the SDK on load (see `src/sdk.ts`)
2. Click "Open Authentication Portal" to authenticate
3. Once authenticated, click "Load Data" to fetch accounts, orders, positions, balances, and brokers
4. Data will be displayed in cards below

## How to Use the SDK

### Understanding the Code

**`src/sdk.ts`** - This is where all SDK logic lives:
- `initializeSDK()` - Initializes the SDK singleton
- `isAuthenticated()` - Check auth status
- `getUserId()` - Get current user ID
- `openPortal()` - Open authentication portal
- `getBrokers()`, `getAllAccounts()`, etc. - Fetch data

**`src/App.tsx`** - This is pure UI:
- Displays authentication status
- Shows data in cards
- Handles button clicks
- All SDK calls go through functions from `sdk.ts`

### Example: Using the SDK in Your Code

```typescript
import { initializeSDK, getAllAccounts, isAuthenticated } from './sdk';

// Initialize once (creates singleton)
await initializeSDK();

// Check auth
if (isAuthenticated()) {
  // Fetch data
  const accounts = await getAllAccounts();
  console.log('Accounts:', accounts);
}
```

### Key Concepts

1. **Singleton Pattern**: The SDK instance is created once and reused
2. **Separation of Concerns**: SDK logic is separate from UI
3. **Simple API**: Each SDK operation has a simple function
4. **Error Handling**: Functions throw errors that you can catch

## Architecture

This app demonstrates best practices:

- ✅ **SDK Logic Separated**: All SDK code in `sdk.ts`
- ✅ **UI Separated**: All UI code in `App.tsx`
- ✅ **Singleton Pattern**: One SDK instance for the entire app
- ✅ **Simple Functions**: Easy-to-use API for SDK operations
- ✅ **Minimal Dependencies**: Just React and the client SDK

## Comparison with Main Demo App

| Feature | Simple Demo | Main Demo App |
|---------|------------|---------------|
| Complexity | Low | High |
| SDK Usage | Direct | Through adapter/provider |
| Port | 5174 | 3000 |
| Dependencies | Minimal | Many (Next.js, shadcn, etc.) |
| Use Case | Quick testing, learning | Full-featured demo |

## Notes

- This app runs separately from the main demo app
- It's designed to be simple and easy to understand
- Perfect for quick testing or learning the SDK basics
- The main demo app remains unchanged and continues to work as before

