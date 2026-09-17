# FinaticClientSDK Architecture and Runtime

## Package Role

`FinaticClientSDK` provides browser-focused SDK workflows for session initialization, portal usage, and broker-domain data access.

## Internal Structure

- **Public entrypoints**: `src/index.ts`, `src/FinaticConnect.ts`
- **Core runtime**: `src/FinaticConnectCore.ts`
- **Generated API client**: `src/openapi`
- **Domain wrappers**: `src/wrappers`
- **Portal UI integration**: `src/portal/PortalUI.ts`
- **Cross-cutting utilities**: `src/utils`

## Runtime Flow (High Level)

1. SDK initializes with one-time token and config.
2. Core runtime builds API clients/wrappers and portal integration state.
3. Caller invokes auth/portal/data methods.
4. Wrapper/utility layers normalize retries, validation, and response handling.

## Portal Messaging

`PortalUI` validates the message origin before dispatching host callbacks.
`portal-success` invokes `onSuccess` for authentication/session readiness, and
`portal-close` and host-initiated `closePortal()` share one idempotent close
path that invokes `onClose` once and guarantees iframe/listener cleanup. Structured
`portal-event` messages invoke `onEvent(eventName, payload)` and emit
`portal:event`; they never invoke success/close callbacks or hide the iframe.

Authentication and broker readiness are separate contracts. `portal-success`
and lifecycle stage `portal_authenticated` describe portal/session
authentication. Schema-v1 `portal.lifecycle` events then distinguish
`broker_connection_created` from `push_agent_state_changed`. Only connector
states `LIVE_DATA` and `STALE_LIVE_DATA` can assert `dataReady: true`;
credential issuance and live/no-data states never imply accepted account data.
The SDK validates lifecycle payloads against exact stage/state/key allowlists
before invoking callbacks and drops unsupported versions, malformed payloads,
extra secret-bearing fields, and invalid readiness claims. The public callback
retains the broad event-name/unknown-payload shape for source compatibility;
hosts use `isPortalLifecycleEventPayload` to narrow lifecycle payloads
exhaustively while arbitrary non-lifecycle event names remain supported.

Connect currently publishes account-grant lifecycle names
`account.grant.created`, `account.grant.updated`, and
`account.grant.revoked`. Browser hosts may refresh account state and explicitly
close after one of these events. Server consumers continue to use HTTPS
`account.grant.*` webhooks.

## Operational Boundaries

- API key and privileged server flows remain in server SDKs.
- Backend authority remains in `finaticAPI`.
