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

## Operational Boundaries

- API key and privileged server flows remain in server SDKs.
- Backend authority remains in `finaticAPI`.
