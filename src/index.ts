/**
 * Main SDK entry point.
 *
 * Hand-authored exports compose ``src/openapi/`` (OpenAPI Generator output) with wrappers and utilities.
 *
 * Regenerate: ``make openapi-generate`` from the Finatic workspace root.
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
