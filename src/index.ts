/**
 * Main SDK entry point.
 * 
 * This file is protected - customize exports as needed.
 * 
 * Note: The OpenAPI generator creates its own index.ts that exports from api/models.
 * This file re-exports from our generated wrappers and custom code.
 */

// Re-export all generated wrappers and utilities
export * from './generated/wrappers';
export * from './generated/utils';
export * from './generated/config';

// Re-export all custom code
export * from './custom';

// Also export the raw API clients and models from OpenAPI generator
export * from './generated/api';
// Export models - ValidationError interface is available as ApiValidationError
export type { ValidationError as ApiValidationError } from './generated/models/validation-error';
// Export FinaticError interface separately to avoid conflict with FinaticError class from utils
export type { FinaticError as FinaticErrorInterface } from './generated/models/finatic-error';
// Re-export all models (ValidationError and FinaticError exports are excluded from models/index.ts to avoid conflicts)
export * from './generated/models';
export * from './generated/configuration';
