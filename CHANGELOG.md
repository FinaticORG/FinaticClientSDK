# Changelog

## Unreleased

- Added account-first v1 API and wrapper surface pinned to FinaticAPI PR #174 head `441c160842b7c6a539f578bf8f5b8c4ee900e0d4`, including explicit account resource routes, portal discovered-account binding with optional sync-status inclusion, session sync-status polling, and FDX consent creation.
- Added session sync-status polling for the current account-first API contract.
- Added `apiEnvironment: 'live' | 'sandbox'` configuration support for `X-Finatic-Environment`.
- Removed legacy beta generated broker/company API clients, connection-first models, and position-lot generated types from the 1.0 SDK source.
- Guarded API-key-owned v1 session routes from the browser-safe wrapper; create sessions and portal links through backend/server SDK flows.
- Added generated-equivalent portal-audience v1 API coverage for token exchange, OAuth completion, user link, institutions, auth attempts, discovered accounts, grant creation, and completion while keeping those flows out of the browser-safe wrapper.
