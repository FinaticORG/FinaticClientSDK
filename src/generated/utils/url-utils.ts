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
  } catch (error) {
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
  } catch (error) {
    // If URL parsing fails, return original URL
    return baseUrl;
  }
}
