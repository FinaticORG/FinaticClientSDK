# Changelog

## Unreleased

- Added account-first v1 API and wrapper surface pinned to FinaticAPI PR #174 head `bf7fa4e44c7cb2621704777c24433636ad3a69af`, including explicit account resource routes, session sync-status polling, and FDX consent creation.
- Added session sync-status polling for the current account-first API contract.
- Added `apiEnvironment: 'live' | 'sandbox'` configuration support for `X-Finatic-Environment`.
- Kept beta connection-first wrappers importable while documenting `finatic.v1` as the browser-safe path for new workflows.
- Added beta-to-v1 migration notes tied to FinaticAPI PR #174 beta migration metadata.
