import { ApiClient } from '../core/client/ApiClient';
import { MockApiClient } from './MockApiClient';
import { MockConfig } from './MockDataProvider';
import { shouldUseMocks, shouldMockApiOnly, getMockConfig } from './utils';
import { DeviceInfo } from '../types';

/**
 * Factory class for creating API clients (real or mock)
 */
export class MockFactory {
  /**
   * Create an API client based on environment configuration
   * @param baseUrl - The base URL for the API
   * @param deviceInfo - Optional device information
   * @param mockConfig - Optional mock configuration (only used if mocks are enabled)
   * @returns ApiClient or MockApiClient instance
   */
  static createApiClient(
    baseUrl: string,
    deviceInfo?: DeviceInfo,
    mockConfig?: MockConfig
  ): ApiClient | MockApiClient {
    const useMocks = shouldUseMocks();
    const mockApiOnly = shouldMockApiOnly();

    if (useMocks || mockApiOnly) {
      // Merge environment config with provided config
      const envConfig = getMockConfig();
      const finalConfig: MockConfig = {
        delay: mockConfig?.delay || envConfig.delay,
        scenario: mockConfig?.scenario || 'success',
        customData: mockConfig?.customData || {},
        mockApiOnly: mockApiOnly, // Pass this flag to the mock client
      };

      return new MockApiClient(baseUrl, deviceInfo, finalConfig);
    } else {
      return new ApiClient(baseUrl, deviceInfo);
    }
  }

  /**
   * Force create a mock API client regardless of environment settings
   * @param baseUrl - The base URL for the API
   * @param deviceInfo - Optional device information
   * @param mockConfig - Optional mock configuration
   * @returns MockApiClient instance
   */
  static createMockApiClient(
    baseUrl: string,
    deviceInfo?: DeviceInfo,
    mockConfig?: MockConfig
  ): MockApiClient {
    return new MockApiClient(baseUrl, deviceInfo, mockConfig);
  }

  /**
   * Force create a real API client regardless of environment settings
   * @param baseUrl - The base URL for the API
   * @param deviceInfo - Optional device information
   * @returns ApiClient instance
   */
  static createRealApiClient(baseUrl: string, deviceInfo?: DeviceInfo): ApiClient {
    return new ApiClient(baseUrl, deviceInfo);
  }

  /**
   * Check if mocks are currently enabled
   * @returns boolean indicating if mocks are enabled
   */
  static isMockMode(): boolean {
    return shouldUseMocks();
  }

  /**
   * Get current mock configuration
   * @returns Mock configuration object
   */
  static getMockConfig(): { enabled: boolean; delay?: number } {
    return getMockConfig();
  }
}

/**
 * Convenience function to create an API client
 * @param baseUrl - The base URL for the API
 * @param deviceInfo - Optional device information
 * @param mockConfig - Optional mock configuration
 * @returns ApiClient or MockApiClient instance
 */
export function createMockApiClient(
  baseUrl: string,
  deviceInfo?: DeviceInfo,
  mockConfig?: MockConfig
): ApiClient | MockApiClient {
  return MockFactory.createApiClient(baseUrl, deviceInfo, mockConfig);
}
