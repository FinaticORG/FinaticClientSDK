/**
 * Broker filtering utility functions
 */

import { setupLogger, buildLoggerExtra, LoggerExtra } from '../lib/logger';

const brokerLogger = setupLogger('FinaticClientSDK.BrokerUtils', undefined, {
  codebase: 'FinaticClientSDK',
});

const buildBrokerExtra = (functionName: string, metadata?: Record<string, unknown>): LoggerExtra => ({
  module: 'BrokerUtils',
  function: functionName,
  ...(metadata ? buildLoggerExtra(metadata) : {}),
});

// Supported broker names and their corresponding IDs (including aliases)
const SUPPORTED_BROKERS: Record<string, string> = {
  'alpaca': 'alpaca',
  'robinhood': 'robinhood',
  'tasty_trade': 'tasty_trade',
  'ninja_trader': 'ninja_trader',
  'tradovate': 'tradovate', // Alias for ninja_trader
  'interactive_brokers': 'interactive_brokers',
};

/**
 * Convert broker names to broker IDs, filtering out unsupported ones
 * @param brokerNames Array of broker names to convert
 * @returns Object containing valid broker IDs and any warnings about unsupported names
 */
export function convertBrokerNamesToIds(brokerNames: string[]): {
  brokerIds: string[];
  warnings: string[];
} {
  const brokerIds: string[] = [];
  const warnings: string[] = [];

  for (const brokerName of brokerNames) {
    const brokerId = SUPPORTED_BROKERS[brokerName.toLowerCase()];
    if (brokerId) {
      brokerIds.push(brokerId);
    } else {
      warnings.push(`Broker name '${brokerName}' is not supported. Supported brokers: ${Object.keys(SUPPORTED_BROKERS).join(', ')}`);
    }
  }

  return { brokerIds, warnings };
}

/**
 * Append broker filter parameters to a portal URL
 * @param baseUrl The base portal URL (may already have query parameters)
 * @param brokerNames Array of broker names to filter by
 * @returns The portal URL with broker filter parameters appended
 */
export function appendBrokerFilterToURL(baseUrl: string, brokerNames?: string[]): string {
  if (!brokerNames || brokerNames.length === 0) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl);
    const { brokerIds, warnings } = convertBrokerNamesToIds(brokerNames);

    // Log warnings for unsupported broker names
    warnings.forEach(warning =>
      brokerLogger.warn('Unsupported broker name provided', buildBrokerExtra('appendBrokerFilterToURL', {
        warning,
      })),
    );

    // Only add broker filter if we have valid broker IDs
    if (brokerIds.length > 0) {
      const encodedBrokers = btoa(JSON.stringify(brokerIds));
      url.searchParams.set('brokers', encodedBrokers);
    }

    return url.toString();
  } catch (error) {
    brokerLogger.exception('Failed to append broker filter to URL', error, buildBrokerExtra('appendBrokerFilterToURL', {
      base_url: baseUrl,
      brokers_count: brokerNames?.length ?? 0,
    }));
    return baseUrl;
  }
}

/**
 * Get list of supported broker names
 * @returns Array of supported broker names
 */
export function getSupportedBrokerNames(): string[] {
  return Object.keys(SUPPORTED_BROKERS);
}

/**
 * Check if a broker name is supported
 * @param brokerName The broker name to check
 * @returns True if the broker is supported, false otherwise
 */
export function isBrokerSupported(brokerName: string): boolean {
  return brokerName.toLowerCase() in SUPPORTED_BROKERS;
}
