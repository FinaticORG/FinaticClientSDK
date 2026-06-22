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
// Re-export v1 models (FinaticEnvironment excluded — conflicts with SdkConfig type)
export * from './openapi/models';
export * from './openapi/configuration';
export { V1Api } from './openapi/api/v1-api';
export type { FinaticApiEnvironment, V1RequestOptions } from './openapi/api/v1-api';
// Legacy beta models live under openapi-legacy/ and are not re-exported from the public barrel.

// Main SDK classes
export { FinaticConnect } from './FinaticConnect';
export type { FinaticConnectOptions } from './FinaticConnectCore';
