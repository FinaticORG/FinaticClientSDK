import { PortalTheme, PortalThemeConfig } from '../types/portal';
import { portalThemePresets } from '../themes/portalPresets';

/**
 * Generate a portal URL with theme parameters
 * @param baseUrl The base portal URL
 * @param theme The theme configuration
 * @returns The portal URL with theme parameters
 */
export function generatePortalThemeURL(baseUrl: string, theme?: PortalTheme): string {
  if (!theme) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl);

    if (theme.preset) {
      // Use preset theme
      url.searchParams.set('theme', theme.preset);
    } else if (theme.custom) {
      // Use custom theme
      const encodedTheme = btoa(JSON.stringify(theme.custom));
      url.searchParams.set('theme', 'custom');
      url.searchParams.set('themeObject', encodedTheme);
    }

    return url.toString();
  } catch (error) {
    console.error('Failed to generate theme URL:', error);
    return baseUrl;
  }
}

/**
 * Generate a portal URL with theme parameters, appending to existing query params
 * @param baseUrl The base portal URL (may already have query parameters)
 * @param theme The theme configuration
 * @returns The portal URL with theme parameters appended
 */
export function appendThemeToURL(baseUrl: string, theme?: PortalTheme): string {
  if (!theme) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl);

    if (theme.preset) {
      // Use preset theme
      url.searchParams.set('theme', theme.preset);
    } else if (theme.custom) {
      // Use custom theme
      const encodedTheme = btoa(JSON.stringify(theme.custom));
      url.searchParams.set('theme', 'custom');
      url.searchParams.set('themeObject', encodedTheme);
    }

    return url.toString();
  } catch (error) {
    console.error('Failed to append theme to URL:', error);
    return baseUrl;
  }
}

/**
 * Get a theme configuration by preset name
 * @param preset The preset theme name
 * @returns The theme configuration or undefined if not found
 */
export function getThemePreset(preset: string): PortalThemeConfig | undefined {
  return portalThemePresets[preset];
}

/**
 * Validate a custom theme configuration
 * @param theme The theme configuration to validate
 * @returns True if valid, false otherwise
 */
export function validateCustomTheme(theme: PortalThemeConfig): boolean {
  try {
    // Check required properties
    if (!theme.mode || !['dark', 'light', 'auto'].includes(theme.mode)) {
      return false;
    }

    if (!theme.colors) {
      return false;
    }

    // Check required color sections
    const requiredSections = ['background', 'status', 'text', 'border', 'input', 'button'];
    for (const section of requiredSections) {
      if (!theme.colors[section as keyof typeof theme.colors]) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Theme validation error:', error);
    return false;
  }
}

/**
 * Create a custom theme from a preset with modifications
 * @param preset The base preset theme
 * @param modifications Partial theme modifications
 * @returns The modified theme configuration
 */
export function createCustomThemeFromPreset(
  preset: string,
  modifications: Partial<PortalThemeConfig>
): PortalThemeConfig | null {
  const baseTheme = getThemePreset(preset);
  if (!baseTheme) {
    console.error(`Preset theme '${preset}' not found`);
    return null;
  }

  return {
    ...baseTheme,
    ...modifications,
  };
}
