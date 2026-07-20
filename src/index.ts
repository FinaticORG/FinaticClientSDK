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

export { FinaticConnect } from './FinaticConnect';
export type { FinaticConnectOptions } from './FinaticConnectCore';
