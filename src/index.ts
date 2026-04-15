/**
 * Main SDK entry point.
 *
 * This file is protected - customize exports as needed.
 *
 * Note: The OpenAPI generator creates its own index.ts that exports from api/models.
 * This file re-exports from our generated wrappers and custom code.
 *
 * Raw CLI-only OpenAPI output (parallel tree): `src/openapi/` — see `src/openapi/README.md`.
 * Regenerate: `make openapi-generate-clients-only` from the Finatic workspace root.
 */

// Re-export SDK wrappers/utilities/config
export * from './wrappers';
export * from './utils';
export * from './config';

// Also export the raw API clients and models from OpenAPI generator
// Client SDK uses FinaticConnect instead of raw API clients
// Export models - ValidationError interface is available as ApiValidationError
export type { ValidationError as ApiValidationError } from './openapi/models/validation-error';
// Re-export all models (ValidationError export is excluded from models/index.ts to avoid conflict)
export * from './openapi/models';
export * from './openapi/configuration';

// Main SDK classes
export { FinaticConnect } from './FinaticConnect';
export type { FinaticConnectOptions } from './FinaticConnectCore';
