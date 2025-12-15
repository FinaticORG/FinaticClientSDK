# How to Run the Simple Demo App

## Quick Start

1. **Navigate to the directory**:

   ```bash
   cd codebases/SDKs/Client/FinaticClientSDK/simple-demo-app
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   ```

3. **Create `.env` file**:

   ```bash
   echo "VITE_FINATIC_API_KEY=your_api_key_here" > .env
   ```

   Or manually create `.env` with:

   ```
   VITE_FINATIC_API_KEY=your_api_key_here
   ```

4. **Run the app**:

   ```bash
   yarn dev
   ```

5. **Open in browser**:
   - Go to `http://localhost:5174`
   - The app will automatically initialize the SDK
   - Click "Open Authentication Portal" to authenticate
   - Once authenticated, click "Load Data" to see your accounts, orders, positions, etc.

## Available Scripts

- `yarn dev` - Start development server (port 5174)
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

## Troubleshooting

### Port already in use?

If port 5174 is already in use, you can change it in `vite.config.ts`:

```typescript
server: {
  port: 5175, // or any other port
}
```

### API Key not working?

- Make sure your `.env` file is in the `simple-demo-app` directory
- Restart the dev server after creating/modifying `.env`
- Check that `VITE_FINATIC_API_KEY` is set correctly

### SDK not found?

- Make sure you ran `yarn install`
- The app uses `@finatic/client` from npm (latest version)
- If you have issues, try: `yarn add @finatic/client@latest`
