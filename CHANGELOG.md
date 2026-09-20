# Changelog

## 1.1.2

- Release from 716f54d1f795c7c3aefd0a02f92cecf2624ad46d.


## 1.1.1

- Release from 7b57d7559284702505fe233159ea4c3c5e73c298.


## 1.1.0

- Release from 371e0f89be8d5c35e3d85100370cbe2489c010dd.


## 1.0.1

- Release from 7ae30c729bf87fb25a84646dea773121e3b9e212.


## Unreleased

- Added API-generated exact instrument descriptors and concrete order, fill, event, position, lot, and lot-fill types at the package root; typed account order placement now supports canonical `finaticInstrumentId` alongside provider-native `instrumentId`. Generated from FinaticAPI PR #748 head `82fba8df3ee811771bca705542ef6e0ce92850ad` with OpenAPI Generator 7.22.0 (artifact SHA-256 `5c450a4e43aaad1e0f30d0bf0705183b0b882c86308ff78d9ff05cf2bde8054f`).
- Published the CommonJS runtime bundle as `.cjs` and added packed-package ESM/CommonJS runtime smoke tests for the public enum and `FinaticConnect` exports.
- Added the FinaticConnect PR #535 schema-v1 `portal.lifecycle` type contract, guard-based payload narrowing, and fail-closed runtime validation that separates portal authentication, persisted broker connections, and connector/data readiness while preserving broad callback compatibility.
- Added optional `openPortal({ onEvent })` handling for structured account-grant lifecycle events without changing authentication or close behavior.
- Added account-first v1 API and wrapper surface pinned to FinaticAPI PR #174 head `969cccc50b44cd8c701f47dddf8cb3b95c9b8f6e`, including explicit account resource routes, portal discovered-account binding with optional sync-status inclusion, session sync-status polling, and FDX consent creation.
- Added session sync-status polling for the current account-first API contract.
- Added `apiEnvironment: 'live' | 'sandbox'` configuration support for `X-Finatic-Environment`.
- Kept beta connection-first wrappers importable while documenting `finatic.v1` as the browser-safe path for new workflows.
- Added beta-to-v1 migration notes tied to FinaticAPI PR #174 beta migration metadata.
- Guarded API-key-owned v1 session routes from the browser-safe wrapper; create sessions and portal links through backend/server SDK flows.
- Added portal-audience v1 wrapper coverage for token exchange, OAuth completion, user link, institutions, auth attempts, discovered accounts, grant creation, and completion.
