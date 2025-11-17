/**
 * Plain object conversion utility (Phase 2C).
 *
 * Generated - do not edit directly.
 *
 * Converts class instances to plain objects for consistent SDK output.
 */

/**
 * Convert data to plain objects, ensuring no class instances are returned.
 * Handles arrays, objects, and recursively converts nested structures.
 *
 * @param data - Data to convert (can be any type)
 * @returns Plain object/array/primitive (no class instances)
 *
 * @example
 * ```
 * const result = convertToPlainObject(someModelInstance);
 * // Returns plain object instead of class instance
 * ```
 */
export function convertToPlainObject(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertToPlainObject(item));
  }

  if (typeof data === 'object') {
    // Check if it's a class instance (has constructor and constructor.name !== 'Object')
    if (
      data.constructor &&
      data.constructor.name !== 'Object' &&
      data.constructor.name !== 'Array'
    ) {
      // Convert class instance to plain object by spreading
      return convertToPlainObject({ ...data });
    }

    // Recursively convert nested objects
    const result: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        result[key] = convertToPlainObject(data[key]);
      }
    }
    return result;
  }

  // Primitive types (string, number, boolean, etc.) - return as-is
  return data;
}
