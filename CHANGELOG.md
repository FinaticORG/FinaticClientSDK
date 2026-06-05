# Changelog

## Unreleased

- Added account-first v1 API and wrapper surface pinned to FinaticAPI PR #174 head `669860e84fd8ba7beacbe554e603d6302f4f1c6d`, including explicit account resource routes, session sync-status polling, and FDX consent creation.
- Added session sync-status polling for the current account-first API contract.
- Added `apiEnvironment: 'live' | 'sandbox'` configuration support for `X-Finatic-Environment`.
- Kept beta connection-first wrappers importable while documenting `finatic.v1` as the browser-safe path for new workflows.
- Added beta-to-v1 migration notes tied to FinaticAPI PR #174 beta migration metadata.
