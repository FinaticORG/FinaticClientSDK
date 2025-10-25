/**
 * Utility functions for mock system environment detection
 */

// Type declarations for Node.js environment
// Note: process is already declared globally in Node.js types

/**
 * Check if mocks should be used based on environment variables
 * Supports both browser and Node.js environments
 */
export function shouldUseMocks(): boolean {
  // Check Node.js environment
  if (typeof process !== 'undefined' && process?.env) {
    return (
      process.env.FINATIC_USE_MOCKS === 'true' ||
      process.env.NEXT_PUBLIC_FINATIC_USE_MOCKS === 'true'
    );
  }

  // Check browser environment
  if (typeof window !== 'undefined') {
    // Check global variable
    if ((window as any).FINATIC_USE_MOCKS === 'true') {
      return true;
    }

    // Check Next.js public environment variables
    if ((window as any).NEXT_PUBLIC_FINATIC_USE_MOCKS === 'true') {
      return true;
    }

    // Check localStorage
    try {
      return localStorage.getItem('FINATIC_USE_MOCKS') === 'true';
    } catch (error) {
      // localStorage might not be available
      return false;
    }
  }

  return false;
}

/**
 * Set mock mode in the current environment
 */
export function setMockMode(enabled: boolean): void {
  // Set in Node.js environment
  if (typeof process !== 'undefined' && process?.env) {
    process.env.FINATIC_USE_MOCKS = enabled ? 'true' : 'false';
  }

  // Set in browser environment
  if (typeof window !== 'undefined') {
    (window as any).FINATIC_USE_MOCKS = enabled ? 'true' : 'false';

    try {
      if (enabled) {
        localStorage.setItem('FINATIC_USE_MOCKS', 'true');
      } else {
        localStorage.removeItem('FINATIC_USE_MOCKS');
      }
    } catch (error) {
      // localStorage might not be available
    }
  }
}

/**
 * Check if only API should be mocked (but portal should use real URL)
 */
export function shouldMockApiOnly(): boolean {
  // Check Node.js environment
  if (typeof process !== 'undefined' && process?.env) {
    return (
      process.env.FINATIC_MOCK_API_ONLY === 'true' ||
      process.env.NEXT_PUBLIC_FINATIC_MOCK_API_ONLY === 'true'
    );
  }

  // Check browser environment
  if (typeof window !== 'undefined') {
    // Check global variable
    if ((window as any).FINATIC_MOCK_API_ONLY === 'true') {
      return true;
    }

    // Check Next.js public environment variables
    if ((window as any).NEXT_PUBLIC_FINATIC_MOCK_API_ONLY === 'true') {
      return true;
    }

    // Check localStorage
    try {
      return localStorage.getItem('FINATIC_MOCK_API_ONLY') === 'true';
    } catch (error) {
      // localStorage might not be available
      return false;
    }
  }

  return false;
}

/**
 * Get mock configuration from environment
 */
export function getMockConfig(): { enabled: boolean; delay?: number; mockApiOnly?: boolean } {
  const enabled = shouldUseMocks();
  const mockApiOnly = shouldMockApiOnly();

  let delay: number | undefined;

  // Check for custom delay in Node.js
  if (typeof process !== 'undefined' && process?.env?.FINATIC_MOCK_DELAY) {
    delay = parseInt(process.env.FINATIC_MOCK_DELAY, 10);
  }

  // Check for custom delay in browser
  if (typeof window !== 'undefined') {
    try {
      const storedDelay = localStorage.getItem('FINATIC_MOCK_DELAY');
      if (storedDelay) {
        delay = parseInt(storedDelay, 10);
      }
    } catch (error) {
      // localStorage might not be available
    }
  }

  return { enabled, delay, mockApiOnly };
}
