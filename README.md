# Finatic Client SDK

Browser SDK for embedding Finatic Connect and account-first data into **your frontend**. The company API key never belongs in this package. Your backend (Server SDK) mints a one-time token; the browser only receives that token.

## Install

```bash
npm install @finatic/client
```

## Quick start

```ts
import { FinaticConnect } from '@finatic/client';

const finatic = await FinaticConnect.init('one-time-token', undefined, {
  apiEnvironment: 'sandbox', // or 'live'
});

await finatic.openPortal({
  mode: 'dark',
  onSuccess: (userId) => {
    // OTP / session ready. The user has not necessarily granted an account yet.
    console.log('Portal user linked:', userId);
  },
  onEvent: async (eventName, payload) => {
    if (eventName !== 'account.grant.created') return;
    const grant = payload as { accountId?: string };
    const accounts = await finatic.v1.listAccounts({ includeSyncStatus: true });
    const ready = accounts.success?.data ?? [];
    console.log('Grant created for', grant.accountId, 'accounts', ready);
  },
});
```

`openPortal` must use the **object** form to receive `onEvent`. The positional overload has no grant events.

Client data methods return the wire envelope `{ success, error, warning }` (not `{ data, errors }`).

Call `FinaticConnect.reset()` before `init` when you need a new session boundary.

## Token handoff

```ts
// Backend (@finatic/server-node) — keep FINATIC_API_KEY here
const token = await finatic.v1.getToken();
// 90 seconds. Send token to the browser only.
```

Never set an API key in Vite/`NEXT_PUBLIC_` env vars for production.

## Migrating from beta

| Beta route family | v1 replacement |
|---|---|
| `/api/beta/session/init` | Backend `v1.getToken()` / `session/init` |
| `/api/beta/session/start` | `FinaticConnect.init(oneTimeToken)` |
| `/api/beta/session/portal` | `finatic.openPortal(...)` or backend `v1.getPortalUrl()` |
| `/api/beta/brokers/data/accounts` | `finatic.v1.listAccounts(...)` |
| `/api/beta/brokers/data/balances` | `finatic.v1.listBalances({ accountId })` |
| `/api/beta/brokers/data/positions` | `finatic.v1.listPositions({ accountId })` |
| `/api/beta/brokers/data/orders` | `finatic.v1.listOrders({ accountId })` |
| `/api/beta/brokers/data/transactions` | `finatic.v1.listTransactions({ accountId })` |
| `/api/beta/brokers/orders` | `finatic.v1.createAccountOrder({ accountId, body, idempotencyKey })` |
| `/api/beta/brokers/connections` | `finatic.v1.listAccounts()` plus `finatic.v1.listAccountGrants()` |

Connect owns portal institution/auth/consent UX. Those flows are not published methods on `finatic.v1`. Position lots are not on the v1 façade — use `listPositions`. Do not pass beta `connectionId` as `{accountId}`.

## Environments

`apiEnvironment` is `live` | `sandbox` (`X-Finatic-Environment`). URL presets (`environment: 'staging' | 'production' | ...`) are separate from sandbox vs live data.

## Common commands

| Task | Command |
|------|---------|
| Build | `npm run build` |
| Test | `npm test` |
| Lint | `npm run lint` |

## Documentation

This README is the Client SDK contract. Fetch the rest before writing a full integration:

- Quick start: [https://finatic.dev/docs/quick-start/quick-start](https://finatic.dev/docs/quick-start/quick-start)
- Node backend README: [https://github.com/FinaticORG/FinaticServerSDK-Node/blob/develop/README.md](https://github.com/FinaticORG/FinaticServerSDK-Node/blob/develop/README.md)
- Python backend README: [https://github.com/FinaticORG/FinaticServerSDK-Python/blob/develop/README.md](https://github.com/FinaticORG/FinaticServerSDK-Python/blob/develop/README.md)
- Embed Connect: [https://github.com/FinaticORG/FinaticConnect/blob/develop/docs/embedding.md](https://github.com/FinaticORG/FinaticConnect/blob/develop/docs/embedding.md)
- Demo apps: [https://github.com/FinaticORG/FinaticDemoApps/blob/develop/README.md](https://github.com/FinaticORG/FinaticDemoApps/blob/develop/README.md)
- API reference: [https://finatic.dev/docs/api-reference](https://finatic.dev/docs/api-reference)
- OpenAPI: [https://finatic.dev/openapi.json](https://finatic.dev/openapi.json)
- Agent index: [https://finatic.dev/llms.txt](https://finatic.dev/llms.txt)
- Agent notes: [https://finatic.dev/AGENTS.md](https://finatic.dev/AGENTS.md)
