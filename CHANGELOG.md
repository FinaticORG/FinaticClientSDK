# Changelog

## Unreleased

- Added account-first v1 API and wrapper surface pinned to FinaticAPI PR #174 head `969cccc50b44cd8c701f47dddf8cb3b95c9b8f6e`, including explicit account resource routes, portal discovered-account binding with optional sync-status inclusion, session sync-status polling, and FDX consent creation.
- Added session sync-status polling for the current account-first API contract.
- Added `apiEnvironment: 'live' | 'sandbox'` configuration support for `X-Finatic-Environment`.
- Kept beta connection-first wrappers importable while documenting `finatic.v1` as the browser-safe path for new workflows.
- Added beta-to-v1 migration notes tied to FinaticAPI PR #174 beta migration metadata.
- Guarded API-key-owned v1 session routes from the browser-safe wrapper; create sessions and portal links through backend/server SDK flows.
- Added portal-audience v1 wrapper coverage for token exchange, OAuth completion, user link, institutions, auth attempts, discovered accounts, grant creation, and completion.
