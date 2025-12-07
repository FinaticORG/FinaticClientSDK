/**
 * Enum coercion utility (Phase 2C).
 * 
 * Generated - do not edit directly.
 * 
 * Provides case-insensitive matching of enum values.
 * Only matches actual enum value names (case-insensitive), no aliases.
 */

/**
 * Coerce a string or enum value to the matching enum value (case-insensitive).
 * 
 * @param input - String or enum value to coerce
 * @param EnumObj - Enum object to match against
 * @param enumName - Name of the enum (for error messages)
 * @returns The matching enum value, or throws if no match found
 * 
 * @example
 * ```
 * const status = coerceEnumValue('open', PublicPositionStatusEnum, 'positionStatus');
 * // Returns PublicPositionStatusEnum.Open (case-insensitive match)
 * ```
 */
export function coerceEnumValue<T extends Record<string, string>>(
  input: unknown,
  EnumObj: T,
  enumName: string,
): T[keyof T] | undefined {
  if (input === undefined || input === null) {
    return undefined;
  }
  
  // If already an enum value, pass through
  const values = Object.values(EnumObj) as string[];
  if (typeof input === 'string') {
    const normalized = input.trim();
    
    // Direct match by value (case-insensitive)
    const valueMatch = values.find(v => v.toLowerCase() === normalized.toLowerCase());
    if (valueMatch) {
      // Find the enum key that has this value
      const matchingKey = (Object.keys(EnumObj) as Array<keyof T>).find(
        k => EnumObj[k] === valueMatch
      );
      if (matchingKey) {
        return EnumObj[matchingKey];  // Returns enum member (e.g., BrokerDataOrderStatusEnum.Filled)
      }
    }
    
    // Match by key name (case-insensitive)
    const keyMatch = (Object.keys(EnumObj) as Array<keyof T>).find(
      k => String(k).toLowerCase() === normalized.toLowerCase(),
    );
    if (keyMatch) {
      return EnumObj[keyMatch];
    }
  }
  
  // Not coercible - throw descriptive error
  const allowed = values.join(', ');
  throw new Error(`Invalid ${enumName}: ${String(input)}. Allowed values: ${allowed}`);
}
