/**
 * URL utility functions for portal URL manipulation.
 *
 * Generated - do not edit directly.
 */

/**
 * Append theme parameters to a portal URL.
 * @param baseUrl The base portal URL (may already have query parameters)
 * @param theme The theme configuration (preset string or custom object)
 * @returns The portal URL with theme parameters appended
 */
export function appendThemeToURL(
  baseUrl: string,
  theme?: string | { preset?: string; custom?: Record<string, unknown> }
): string {
  if (!theme) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl);

    if (typeof theme === 'string') {
      // Preset theme
      url.searchParams.set('theme', theme);
    } else if (theme.preset) {
      // Preset theme from object
      url.searchParams.set('theme', theme.preset);
    } else if (theme.custom) {
      // Custom theme
      const encodedTheme = btoa(JSON.stringify(theme.custom));
      url.searchParams.set('theme', 'custom');
      url.searchParams.set('themeObject', encodedTheme);
    }

    return url.toString();
  } catch {
    // If URL parsing fails, return original URL
    return baseUrl;
  }
}

/**
 * Append broker filter parameters to a portal URL.
 * @param baseUrl The base portal URL (may already have query parameters)
 * @param brokerNames Array of broker names/IDs to filter by
 * @returns The portal URL with broker filter parameters appended
 */
export function appendBrokerFilterToURL(baseUrl: string, brokerNames?: string[]): string {
  if (!brokerNames || brokerNames.length === 0) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl);
    const encodedBrokers = btoa(JSON.stringify(brokerNames));
    url.searchParams.set('brokers', encodedBrokers);
    return url.toString();
  } catch {
    // If URL parsing fails, return original URL
    return baseUrl;
  }
}

/**
 * Append broker/exchange type filter to a portal URL.
 * @param baseUrl The base portal URL (may already have query parameters)
 * @param kind Filter by provider type: 'broker' or 'exchange'
 * @returns The portal URL with type parameter appended
 */
export function appendKindToURL(baseUrl: string, kind?: 'broker' | 'exchange'): string {
  if (!kind) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('type', kind);
    return url.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Append asset types (capabilities) filter to a portal URL.
 * Multiple values are AND-filtered (brokers that support all listed asset types).
 * @param baseUrl The base portal URL (may already have query parameters)
 * @param assetTypes Array of capability names (e.g. ['equity', 'crypto', 'options'])
 * @returns The portal URL with capabilities parameter appended
 */
export function appendAssetTypesToURL(baseUrl: string, assetTypes?: string[]): string {
  if (!assetTypes || assetTypes.length === 0) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('capabilities', assetTypes.join(','));
    return url.toString();
  } catch {
    return baseUrl;
  }
}

/** Stage filter: production (no alpha/beta), beta, or alpha. Portal filters brokers client-side by these. */
export type PortalStage = 'production' | 'beta' | 'alpha';

/**
 * Append stage filter to a portal URL.
 * Portal shows only brokers in any of the given stages (OR). Omit or empty = show all.
 * @param baseUrl The base portal URL (may already have query parameters)
 * @param stages One or more of 'production' | 'beta' | 'alpha'
 * @returns The portal URL with stage parameter appended
 */
export function appendStageToURL(baseUrl: string, stages?: PortalStage[]): string {
  if (!stages || stages.length === 0) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('stage', stages.join(','));
    return url.toString();
  } catch {
    return baseUrl;
  }
}
