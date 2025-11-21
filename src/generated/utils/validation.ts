/**
 * Input validation utility with zod package (Phase 2B).
 * 
 * Generated - do not edit directly.
 */

import * as z from 'zod';
import type { SdkConfig } from '../config';
// Import ValidationError but don't re-export to avoid duplicate exports
import { ValidationError as _ValidationError } from './error-handling';

/**
 * Validate parameters using zod schema.
 */
export function validateParams<T>(
  schema: z.ZodSchema<T>,
  params: unknown,
  config?: SdkConfig
): T {
  if (!config?.validationEnabled) {
    return params as T;
  }
  
  try {
    return schema.parse(params);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const message = `Validation failed: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
      
      if (config?.validationStrict) {
        throw new _ValidationError(message);
      } else {
        console.warn(`[Validation Warning] ${message}`);
        return params as T;
      }
    }
    throw error;
  }
}

/**
 * Create a number schema with min/max constraints.
 */
export function numberSchema(min?: number, max?: number, defaultVal?: number) {
  let schema = z.number();
  if (min !== undefined) schema = schema.min(min);
  if (max !== undefined) schema = schema.max(max);
  if (defaultVal !== undefined) {
    // Use .default() which automatically makes the field optional
    // This avoids the ZodUnion issue with .optional().default()
    schema = (schema as any).default(defaultVal);
  }
  return schema;
}

/**
 * Create a string schema with length constraints.
 */
export function stringSchema(min?: number, max?: number, defaultVal?: string) {
  let schema = z.string();
  if (min !== undefined) schema = schema.min(min);
  if (max !== undefined) schema = schema.max(max);
  if (defaultVal !== undefined) {
    // Use .default() which automatically makes the field optional
    // This avoids the ZodUnion issue with .optional().default()
    schema = (schema as any).default(defaultVal);
  }
  return schema;
}
