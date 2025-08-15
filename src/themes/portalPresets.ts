import { PortalThemeConfig } from '../types/portal';

// Dark theme (default Finatic theme)
export const darkTheme: PortalThemeConfig = {
  mode: 'dark',
  colors: {
    background: {
      primary: '#000000',
      secondary: '#1a1a1a',
      tertiary: '#2a2a2a',
      accent: 'rgba(0, 255, 255, 0.1)',
      glass: 'rgba(255, 255, 255, 0.05)',
    },
    status: {
      connected: '#00FFFF',
      disconnected: '#EF4444',
      warning: '#F59E0B',
      pending: '#8B5CF6',
      error: '#EF4444',
      success: '#00FFFF',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CBD5E1',
      muted: '#94A3B8',
      inverse: '#000000',
    },
    border: {
      primary: 'rgba(0, 255, 255, 0.2)',
      secondary: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(0, 255, 255, 0.4)',
      focus: 'rgba(0, 255, 255, 0.6)',
      accent: '#00FFFF',
    },
    input: {
      background: '#1a1a1a',
      border: 'rgba(0, 255, 255, 0.2)',
      borderFocus: '#00FFFF',
      text: '#FFFFFF',
      placeholder: '#94A3B8',
    },
    button: {
      primary: {
        background: '#00FFFF',
        text: '#000000',
        hover: '#00E6E6',
        active: '#00CCCC',
      },
      secondary: {
        background: 'transparent',
        text: '#00FFFF',
        border: '#00FFFF',
        hover: 'rgba(0, 255, 255, 0.1)',
        active: 'rgba(0, 255, 255, 0.2)',
      },
    },
  },
  branding: {
    primaryColor: '#00FFFF',
  },
};

// Light theme with cyan accents
export const lightTheme: PortalThemeConfig = {
  mode: 'light',
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
      accent: 'rgba(0, 255, 255, 0.1)',
      glass: 'rgba(0, 0, 0, 0.05)',
    },
    status: {
      connected: '#00FFFF',
      disconnected: '#EF4444',
      warning: '#F59E0B',
      pending: '#8B5CF6',
      error: '#EF4444',
      success: '#00FFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
    },
    border: {
      primary: 'rgba(0, 255, 255, 0.2)',
      secondary: 'rgba(0, 0, 0, 0.1)',
      hover: 'rgba(0, 255, 255, 0.4)',
      focus: 'rgba(0, 255, 255, 0.6)',
      accent: '#00FFFF',
    },
    input: {
      background: '#FFFFFF',
      border: 'rgba(0, 255, 255, 0.2)',
      borderFocus: '#00FFFF',
      text: '#1E293B',
      placeholder: '#94A3B8',
    },
    button: {
      primary: {
        background: '#00FFFF',
        text: '#000000',
        hover: '#00E6E6',
        active: '#00CCCC',
      },
      secondary: {
        background: 'transparent',
        text: '#00FFFF',
        border: '#00FFFF',
        hover: 'rgba(0, 255, 255, 0.1)',
        active: 'rgba(0, 255, 255, 0.2)',
      },
    },
  },
  branding: {
    primaryColor: '#00FFFF',
  },
};

// Corporate blue theme
export const corporateBlueTheme: PortalThemeConfig = {
  mode: 'dark',
  colors: {
    background: {
      primary: '#1E293B',
      secondary: '#334155',
      tertiary: '#475569',
      accent: 'rgba(59, 130, 246, 0.1)',
      glass: 'rgba(255, 255, 255, 0.05)',
    },
    status: {
      connected: '#3B82F6',
      disconnected: '#EF4444',
      warning: '#F59E0B',
      pending: '#8B5CF6',
      error: '#EF4444',
      success: '#10B981',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      muted: '#94A3B8',
      inverse: '#1E293B',
    },
    border: {
      primary: 'rgba(59, 130, 246, 0.2)',
      secondary: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(59, 130, 246, 0.4)',
      focus: 'rgba(59, 130, 246, 0.6)',
      accent: '#3B82F6',
    },
    input: {
      background: '#334155',
      border: 'rgba(59, 130, 246, 0.2)',
      borderFocus: '#3B82F6',
      text: '#F8FAFC',
      placeholder: '#94A3B8',
    },
    button: {
      primary: {
        background: '#3B82F6',
        text: '#FFFFFF',
        hover: '#2563EB',
        active: '#1D4ED8',
      },
      secondary: {
        background: 'transparent',
        text: '#3B82F6',
        border: '#3B82F6',
        hover: 'rgba(59, 130, 246, 0.1)',
        active: 'rgba(59, 130, 246, 0.2)',
      },
    },
  },
  branding: {
    primaryColor: '#3B82F6',
  },
};

// Purple theme
export const purpleTheme: PortalThemeConfig = {
  mode: 'dark',
  colors: {
    background: {
      primary: '#1a1a1a',
      secondary: '#2a2a2a',
      tertiary: '#3a3a3a',
      accent: 'rgba(168, 85, 247, 0.1)',
      glass: 'rgba(255, 255, 255, 0.05)',
    },
    status: {
      connected: '#A855F7',
      disconnected: '#EF4444',
      warning: '#F59E0B',
      pending: '#8B5CF6',
      error: '#EF4444',
      success: '#10B981',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      muted: '#94A3B8',
      inverse: '#1a1a1a',
    },
    border: {
      primary: 'rgba(168, 85, 247, 0.2)',
      secondary: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(168, 85, 247, 0.4)',
      focus: 'rgba(168, 85, 247, 0.6)',
      accent: '#A855F7',
    },
    input: {
      background: '#334155',
      border: 'rgba(168, 85, 247, 0.2)',
      borderFocus: '#A855F7',
      text: '#F8FAFC',
      placeholder: '#94A3B8',
    },
    button: {
      primary: {
        background: '#A855F7',
        text: '#FFFFFF',
        hover: '#9333EA',
        active: '#7C3AED',
      },
      secondary: {
        background: 'transparent',
        text: '#A855F7',
        border: '#A855F7',
        hover: 'rgba(168, 85, 247, 0.1)',
        active: 'rgba(168, 85, 247, 0.2)',
      },
    },
  },
  branding: {
    primaryColor: '#A855F7',
  },
};

// Green theme
export const greenTheme: PortalThemeConfig = {
  mode: 'dark',
  colors: {
    background: {
      primary: '#1a1a1a',
      secondary: '#2a2a2a',
      tertiary: '#3a3a3a',
      accent: 'rgba(34, 197, 94, 0.1)',
      glass: 'rgba(255, 255, 255, 0.05)',
    },
    status: {
      connected: '#22C55E',
      disconnected: '#EF4444',
      warning: '#F59E0B',
      pending: '#8B5CF6',
      error: '#EF4444',
      success: '#22C55E',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      muted: '#94A3B8',
      inverse: '#1a1a1a',
    },
    border: {
      primary: 'rgba(34, 197, 94, 0.2)',
      secondary: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(34, 197, 94, 0.4)',
      focus: 'rgba(34, 197, 94, 0.6)',
      accent: '#22C55E',
    },
    input: {
      background: '#334155',
      border: 'rgba(34, 197, 94, 0.2)',
      borderFocus: '#22C55E',
      text: '#F8FAFC',
      placeholder: '#94A3B8',
    },
    button: {
      primary: {
        background: '#22C55E',
        text: '#FFFFFF',
        hover: '#16A34A',
        active: '#15803D',
      },
      secondary: {
        background: 'transparent',
        text: '#22C55E',
        border: '#22C55E',
        hover: 'rgba(34, 197, 94, 0.1)',
        active: 'rgba(34, 197, 94, 0.2)',
      },
    },
  },
  branding: {
    primaryColor: '#22C55E',
  },
};

// Orange theme
export const orangeTheme: PortalThemeConfig = {
  mode: 'dark',
  colors: {
    background: {
      primary: '#1a1a1a',
      secondary: '#2a2a2a',
      tertiary: '#3a3a3a',
      accent: 'rgba(249, 115, 22, 0.1)',
      glass: 'rgba(255, 255, 255, 0.05)',
    },
    status: {
      connected: '#F97316',
      disconnected: '#EF4444',
      warning: '#F59E0B',
      pending: '#8B5CF6',
      error: '#EF4444',
      success: '#10B981',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      muted: '#94A3B8',
      inverse: '#1a1a1a',
    },
    border: {
      primary: 'rgba(249, 115, 22, 0.2)',
      secondary: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(249, 115, 22, 0.4)',
      focus: 'rgba(249, 115, 22, 0.6)',
      accent: '#F97316',
    },
    input: {
      background: '#334155',
      border: 'rgba(249, 115, 22, 0.2)',
      borderFocus: '#F97316',
      text: '#F8FAFC',
      placeholder: '#94A3B8',
    },
    button: {
      primary: {
        background: '#F97316',
        text: '#FFFFFF',
        hover: '#EA580C',
        active: '#DC2626',
      },
      secondary: {
        background: 'transparent',
        text: '#F97316',
        border: '#F97316',
        hover: 'rgba(249, 115, 22, 0.1)',
        active: 'rgba(249, 115, 22, 0.2)',
      },
    },
  },
  branding: {
    primaryColor: '#F97316',
  },
};

// Theme preset mapping
export const portalThemePresets: Record<string, PortalThemeConfig> = {
  dark: darkTheme,
  light: lightTheme,
  corporateBlue: corporateBlueTheme,
  purple: purpleTheme,
  green: greenTheme,
  orange: orangeTheme,
};
