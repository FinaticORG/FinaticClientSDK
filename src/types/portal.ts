import { Theme } from './ui/theme';

export interface PortalConfig {
  width?: string;
  height?: string;
  position?: 'center' | 'top' | 'bottom';
  zIndex?: number;
}

export interface PortalThemeConfig {
  mode: 'dark' | 'light' | 'auto';
  colors: {
    background: {
      primary: string; // Main background color
      secondary: string; // Secondary background color
      tertiary: string; // Tertiary background color
      accent: string; // Accent background color
      glass: string; // Glassmorphism background
    };
    status: {
      connected: string; // Connected status color
      disconnected: string; // Disconnected status color
      warning: string; // Warning status color
      pending: string; // Pending status color
      error: string; // Error status color
      success: string; // Success status color
    };
    text: {
      primary: string; // Primary text color
      secondary: string; // Secondary text color
      muted: string; // Muted text color
      inverse: string; // Inverse text color
    };
    border: {
      primary: string; // Primary border color
      secondary: string; // Secondary border color
      hover: string; // Hover border color
      focus: string; // Focus border color
      accent: string; // Accent border color
    };
    input: {
      background: string; // Input background color
      border: string; // Input border color
      borderFocus: string; // Input focus border color
      text: string; // Input text color
      placeholder: string; // Input placeholder color
    };
    button: {
      primary: {
        background: string; // Primary button background
        text: string; // Primary button text
        hover: string; // Primary button hover
        active: string; // Primary button active
      };
      secondary: {
        background: string; // Secondary button background
        text: string; // Secondary button text
        border: string; // Secondary button border
        hover: string; // Secondary button hover
        active: string; // Secondary button active
      };
    };
  };
  branding?: {
    primaryColor?: string; // Brand primary color
  };
}

export type PortalThemePreset = 'dark' | 'light' | 'corporateBlue' | 'purple' | 'green' | 'orange';

export interface PortalTheme {
  preset?: PortalThemePreset;
  custom?: PortalThemeConfig;
}

export interface PortalProps {
  config: PortalConfig;
  onClose?: () => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
}
