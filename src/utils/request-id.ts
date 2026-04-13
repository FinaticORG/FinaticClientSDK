/**
 * Request ID generator utility.
 *
 * Generated - do not edit directly.
 */

/**
 * Generate a unique request ID (UUID v4).
 */
export function generateRequestId(): string {
  // Use crypto.randomUUID() if available (Node 14.17+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older Node versions or browser
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
