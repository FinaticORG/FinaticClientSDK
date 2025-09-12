import { Theme } from './ui/theme';

export interface PortalConfig {
  width?: string;
  height?: string;
  position?: 'center' | 'top' | 'bottom';
  zIndex?: number;
}

export interface PortalThemeConfig {
  mode?: 'dark' | 'light' | 'auto';
  colors?: {
    background?: {
      primary?: string; // Main background color
      secondary?: string; // Secondary background color
      tertiary?: string; // Tertiary background color
      accent?: string; // Accent background color
      glass?: string; // Glassmorphism background
    };
    status?: {
      connected?: string; // Connected status color
      disconnected?: string; // Disconnected status color
      warning?: string; // Warning status color
      pending?: string; // Pending status color
      error?: string; // Error status color
      success?: string; // Success status color
    };
    text?: {
      primary?: string; // Primary text color
      secondary?: string; // Secondary text color
      muted?: string; // Muted text color
      inverse?: string; // Inverse text color
    };
    border?: {
      primary?: string; // Primary border color
      secondary?: string; // Secondary border color
      hover?: string; // Hover border color
      focus?: string; // Focus border color
      accent?: string; // Accent border color
    };
    input?: {
      background?: string; // Input background color
      border?: string; // Input border color
      borderFocus?: string; // Input focus border color
      text?: string; // Input text color
      placeholder?: string; // Input placeholder color
    };
    button?: {
      primary?: {
        background?: string; // Primary button background
        text?: string; // Primary button text
        hover?: string; // Primary button hover
        active?: string; // Primary button active
      };
      secondary?: {
        background?: string; // Secondary button background
        text?: string; // Secondary button text
        border?: string; // Secondary button border
        hover?: string; // Secondary button hover
        active?: string; // Secondary button active
      };
    };
  };
  typography?: {
    fontFamily?: {
      primary?: string;
      secondary?: string;
    };
    fontSize?: {
      xs?: string;
      sm?: string;
      base?: string;
      lg?: string;
      xl?: string;
      '2xl'?: string;
      '3xl'?: string;
      '4xl'?: string;
    };
    fontWeight?: {
      normal?: number;
      medium?: number;
      semibold?: number;
      bold?: number;
      extrabold?: number;
    };
    lineHeight?: {
      tight?: string;
      normal?: string;
      relaxed?: string;
    };
  };
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    '3xl'?: string;
  };
  layout?: {
    containerMaxWidth?: string;
    gridGap?: string;
    cardPadding?: string;
    borderRadius?: {
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      '2xl'?: string;
      full?: string;
    };
  };
  components?: {
    brokerCard?: {
      width?: string;
      height?: string;
      logoSize?: string;
      padding?: string;
    };
    statusIndicator?: {
      size?: string;
      glowIntensity?: number;
    };
    modal?: {
      background?: string;
      backdrop?: string;
    };
    brokerCardModern?: {
      width?: string;
      height?: string;
      padding?: string;
      logoSize?: string;
      statusSize?: string;
    };
    connectButton?: {
      width?: string;
      height?: string;
    };
    themeSwitcher?: {
      indicatorSize?: string;
    };
  };
  effects?: {
    glassmorphism?: {
      enabled?: boolean;
      blur?: string;
      opacity?: number;
      border?: string;
    };
    animations?: {
      enabled?: boolean;
      duration?: {
        fast?: string;
        normal?: string;
        slow?: string;
      };
      easing?: {
        default?: string;
        smooth?: string;
        bounce?: string;
      };
    };
    shadows?: {
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      card?: string;
      cardHover?: string;
      glow?: string;
      focus?: string;
    };
  };
  branding?: {
    logo?: string;
    companyName?: string;
    favicon?: string;
    primaryColor?: string;
  };
  
  // Glow effect customization
  glow?: {
    primary?: string;       // Primary glow color
    secondary?: string;     // Secondary glow color
    card?: string;          // Card glow effect
    cardHover?: string;     // Card hover glow
    button?: string;        // Button glow effect
    focus?: string;         // Focus ring glow
    scrollbar?: string;     // Scrollbar glow
  };
  
  // Gradient customization
  gradients?: {
    start?: string;         // Gradient start color
    end?: string;           // Gradient end color
    hoverStart?: string;    // Hover gradient start
    hoverEnd?: string;      // Hover gradient end
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
