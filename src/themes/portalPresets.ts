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
  typography: {
    fontFamily: {
      primary: 'Orbitron, Futura, Inter, system-ui, sans-serif',
      secondary: 'Orbitron, Futura, Inter, system-ui, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  layout: {
    containerMaxWidth: '1440px',
    gridGap: '1rem',
    cardPadding: '1.5rem',
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px',
    },
  },
  components: {
    brokerCard: {
      width: '100%',
      height: '180px',
      logoSize: '64px',
      padding: '1.5rem',
    },
    statusIndicator: {
      size: '22px',
      glowIntensity: 0.9,
    },
    modal: {
      background: 'rgba(0, 0, 0, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    },
    brokerCardModern: {
      width: '150px',
      height: '150px',
      padding: '16px',
      logoSize: '48px',
      statusSize: '22px',
    },
    connectButton: {
      width: '120px',
      height: '120px',
    },
    themeSwitcher: {
      indicatorSize: '24px',
    },
  },
  effects: {
    glassmorphism: {
      enabled: true,
      blur: '12px',
      opacity: 0.15,
      border: 'rgba(0, 255, 255, 0.3)',
    },
    animations: {
      enabled: true,
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      md: '0 4px 6px rgba(0, 0, 0, 0.6)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.7)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.8)',
      card: '0px 4px 12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 255, 255, 0.2)',
      cardHover: '0px 4px 24px rgba(0, 255, 255, 0.3), 0 0 30px rgba(0, 255, 255, 0.25)',
      glow: '0 0 20px rgba(0, 255, 255, 0.8)',
      focus: '0 0 0 2px #00FFFF, 0 0 8px 2px rgba(0, 255, 255, 0.8)',
    },
  },
  branding: {
    primaryColor: '#00FFFF',
  },
  glow: {
    primary: 'rgba(0, 255, 255, 0.4)',
    secondary: 'rgba(0, 255, 255, 0.6)',
    card: 'rgba(0, 255, 255, 0.2)',
    cardHover: 'rgba(0, 255, 255, 0.3)',
    button: 'rgba(0, 255, 255, 0.6)',
    focus: 'rgba(0, 255, 255, 0.8)',
    scrollbar: 'rgba(0, 255, 255, 0.4)',
  },
  gradients: {
    start: 'rgba(0, 255, 255, 0.08)',
    end: 'rgba(0, 255, 255, 0.03)',
    hoverStart: 'rgba(0, 255, 255, 0.15)',
    hoverEnd: 'rgba(0, 255, 255, 0.08)',
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
  typography: {
    fontFamily: {
      primary: 'Orbitron, Futura, Inter, system-ui, sans-serif',
      secondary: 'Orbitron, Futura, Inter, system-ui, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  layout: {
    containerMaxWidth: '1440px',
    gridGap: '1rem',
    cardPadding: '1.5rem',
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px',
    },
  },
  components: {
    brokerCard: {
      width: '100%',
      height: '180px',
      logoSize: '64px',
      padding: '1.5rem',
    },
    statusIndicator: {
      size: '22px',
      glowIntensity: 0.9,
    },
    modal: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.5)',
    },
  },
  effects: {
    glassmorphism: {
      enabled: true,
      blur: '12px',
      opacity: 0.15,
      border: 'rgba(0, 255, 255, 0.3)',
    },
    animations: {
      enabled: true,
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
      card: '0px 4px 12px rgba(0, 0, 0, 0.1), 0 0 20px rgba(0, 255, 255, 0.2)',
      cardHover: '0px 4px 24px rgba(0, 255, 255, 0.3), 0 0 30px rgba(0, 255, 255, 0.25)',
      glow: '0 0 20px rgba(0, 255, 255, 0.8)',
      focus: '0 0 0 2px #00FFFF, 0 0 8px 2px rgba(0, 255, 255, 0.8)',
    },
  },
  branding: {
    primaryColor: '#00FFFF',
  },
  glow: {
    primary: 'rgba(0, 255, 255, 0.4)',
    secondary: 'rgba(0, 255, 255, 0.6)',
    card: 'rgba(0, 255, 255, 0.2)',
    cardHover: 'rgba(0, 255, 255, 0.3)',
    button: 'rgba(0, 255, 255, 0.6)',
    focus: 'rgba(0, 255, 255, 0.8)',
    scrollbar: 'rgba(0, 255, 255, 0.4)',
  },
  gradients: {
    start: 'rgba(0, 255, 255, 0.08)',
    end: 'rgba(0, 255, 255, 0.03)',
    hoverStart: 'rgba(0, 255, 255, 0.15)',
    hoverEnd: 'rgba(0, 255, 255, 0.08)',
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
  typography: {
    fontFamily: {
      primary: 'Orbitron, Futura, Inter, system-ui, sans-serif',
      secondary: 'Orbitron, Futura, Inter, system-ui, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  layout: {
    containerMaxWidth: '1440px',
    gridGap: '1rem',
    cardPadding: '1.5rem',
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px',
    },
  },
  components: {
    brokerCard: {
      width: '100%',
      height: '180px',
      logoSize: '64px',
      padding: '1.5rem',
    },
    statusIndicator: {
      size: '22px',
      glowIntensity: 0.9,
    },
    modal: {
      background: 'rgba(0, 0, 0, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    },
    brokerCardModern: {
      width: '150px',
      height: '150px',
      padding: '16px',
      logoSize: '48px',
      statusSize: '22px',
    },
    connectButton: {
      width: '120px',
      height: '120px',
    },
    themeSwitcher: {
      indicatorSize: '24px',
    },
  },
  effects: {
    glassmorphism: {
      enabled: true,
      blur: '12px',
      opacity: 0.15,
      border: 'rgba(59, 130, 246, 0.3)',
    },
    animations: {
      enabled: true,
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      md: '0 4px 6px rgba(0, 0, 0, 0.6)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.7)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.8)',
      card: '0px 4px 12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.2)',
      cardHover: '0px 4px 24px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.25)',
      glow: '0 0 20px rgba(59, 130, 246, 0.8)',
      focus: '0 0 0 2px #3B82F6, 0 0 8px 2px rgba(59, 130, 246, 0.8)',
    },
  },
  branding: {
    primaryColor: '#3B82F6',
  },
  glow: {
    primary: 'rgba(59, 130, 246, 0.4)',
    secondary: 'rgba(59, 130, 246, 0.6)',
    card: 'rgba(59, 130, 246, 0.2)',
    cardHover: 'rgba(59, 130, 246, 0.3)',
    button: 'rgba(59, 130, 246, 0.6)',
    focus: 'rgba(59, 130, 246, 0.8)',
    scrollbar: 'rgba(59, 130, 246, 0.4)',
  },
  gradients: {
    start: 'rgba(59, 130, 246, 0.08)',
    end: 'rgba(59, 130, 246, 0.03)',
    hoverStart: 'rgba(59, 130, 246, 0.15)',
    hoverEnd: 'rgba(59, 130, 246, 0.08)',
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
  typography: {
    fontFamily: {
      primary: 'Orbitron, Futura, Inter, system-ui, sans-serif',
      secondary: 'Orbitron, Futura, Inter, system-ui, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  layout: {
    containerMaxWidth: '1440px',
    gridGap: '1rem',
    cardPadding: '1.5rem',
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px',
    },
  },
  components: {
    brokerCard: {
      width: '100%',
      height: '180px',
      logoSize: '64px',
      padding: '1.5rem',
    },
    statusIndicator: {
      size: '22px',
      glowIntensity: 0.9,
    },
    modal: {
      background: 'rgba(0, 0, 0, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    },
    brokerCardModern: {
      width: '150px',
      height: '150px',
      padding: '16px',
      logoSize: '48px',
      statusSize: '22px',
    },
    connectButton: {
      width: '120px',
      height: '120px',
    },
    themeSwitcher: {
      indicatorSize: '24px',
    },
  },
  effects: {
    glassmorphism: {
      enabled: true,
      blur: '12px',
      opacity: 0.15,
      border: 'rgba(168, 85, 247, 0.3)',
    },
    animations: {
      enabled: true,
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      md: '0 4px 6px rgba(0, 0, 0, 0.6)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.7)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.8)',
      card: '0px 4px 12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(168, 85, 247, 0.2)',
      cardHover: '0px 4px 24px rgba(168, 85, 247, 0.3), 0 0 30px rgba(168, 85, 247, 0.25)',
      glow: '0 0 20px rgba(168, 85, 247, 0.8)',
      focus: '0 0 0 2px #A855F7, 0 0 8px 2px rgba(168, 85, 247, 0.8)',
    },
  },
  branding: {
    primaryColor: '#A855F7',
  },
  glow: {
    primary: 'rgba(168, 85, 247, 0.4)',
    secondary: 'rgba(168, 85, 247, 0.6)',
    card: 'rgba(168, 85, 247, 0.2)',
    cardHover: 'rgba(168, 85, 247, 0.3)',
    button: 'rgba(168, 85, 247, 0.6)',
    focus: 'rgba(168, 85, 247, 0.8)',
    scrollbar: 'rgba(168, 85, 247, 0.4)',
  },
  gradients: {
    start: 'rgba(168, 85, 247, 0.08)',
    end: 'rgba(168, 85, 247, 0.03)',
    hoverStart: 'rgba(168, 85, 247, 0.15)',
    hoverEnd: 'rgba(168, 85, 247, 0.08)',
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
  typography: {
    fontFamily: {
      primary: 'Orbitron, Futura, Inter, system-ui, sans-serif',
      secondary: 'Orbitron, Futura, Inter, system-ui, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  layout: {
    containerMaxWidth: '1440px',
    gridGap: '1rem',
    cardPadding: '1.5rem',
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px',
    },
  },
  components: {
    brokerCard: {
      width: '100%',
      height: '180px',
      logoSize: '64px',
      padding: '1.5rem',
    },
    statusIndicator: {
      size: '22px',
      glowIntensity: 0.9,
    },
    modal: {
      background: 'rgba(0, 0, 0, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    },
    brokerCardModern: {
      width: '150px',
      height: '150px',
      padding: '16px',
      logoSize: '48px',
      statusSize: '22px',
    },
    connectButton: {
      width: '120px',
      height: '120px',
    },
    themeSwitcher: {
      indicatorSize: '24px',
    },
  },
  effects: {
    glassmorphism: {
      enabled: true,
      blur: '12px',
      opacity: 0.15,
      border: 'rgba(34, 197, 94, 0.3)',
    },
    animations: {
      enabled: true,
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      md: '0 4px 6px rgba(0, 0, 0, 0.6)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.7)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.8)',
      card: '0px 4px 12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(34, 197, 94, 0.2)',
      cardHover: '0px 4px 24px rgba(34, 197, 94, 0.3), 0 0 30px rgba(34, 197, 94, 0.25)',
      glow: '0 0 20px rgba(34, 197, 94, 0.8)',
      focus: '0 0 0 2px #22C55E, 0 0 8px 2px rgba(34, 197, 94, 0.8)',
    },
  },
  branding: {
    primaryColor: '#22C55E',
  },
  glow: {
    primary: 'rgba(34, 197, 94, 0.4)',
    secondary: 'rgba(34, 197, 94, 0.6)',
    card: 'rgba(34, 197, 94, 0.2)',
    cardHover: 'rgba(34, 197, 94, 0.3)',
    button: 'rgba(34, 197, 94, 0.6)',
    focus: 'rgba(34, 197, 94, 0.8)',
    scrollbar: 'rgba(34, 197, 94, 0.4)',
  },
  gradients: {
    start: 'rgba(34, 197, 94, 0.08)',
    end: 'rgba(34, 197, 94, 0.03)',
    hoverStart: 'rgba(34, 197, 94, 0.15)',
    hoverEnd: 'rgba(34, 197, 94, 0.08)',
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
  typography: {
    fontFamily: {
      primary: 'Orbitron, Futura, Inter, system-ui, sans-serif',
      secondary: 'Orbitron, Futura, Inter, system-ui, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  layout: {
    containerMaxWidth: '1440px',
    gridGap: '1rem',
    cardPadding: '1.5rem',
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px',
    },
  },
  components: {
    brokerCard: {
      width: '100%',
      height: '180px',
      logoSize: '64px',
      padding: '1.5rem',
    },
    statusIndicator: {
      size: '22px',
      glowIntensity: 0.9,
    },
    modal: {
      background: 'rgba(0, 0, 0, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    },
    brokerCardModern: {
      width: '150px',
      height: '150px',
      padding: '16px',
      logoSize: '48px',
      statusSize: '22px',
    },
    connectButton: {
      width: '120px',
      height: '120px',
    },
    themeSwitcher: {
      indicatorSize: '24px',
    },
  },
  effects: {
    glassmorphism: {
      enabled: true,
      blur: '12px',
      opacity: 0.15,
      border: 'rgba(249, 115, 22, 0.3)',
    },
    animations: {
      enabled: true,
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      md: '0 4px 6px rgba(0, 0, 0, 0.6)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.7)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.8)',
      card: '0px 4px 12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(249, 115, 22, 0.2)',
      cardHover: '0px 4px 24px rgba(249, 115, 22, 0.3), 0 0 30px rgba(249, 115, 22, 0.25)',
      glow: '0 0 20px rgba(249, 115, 22, 0.8)',
      focus: '0 0 0 2px #F97316, 0 0 8px 2px rgba(249, 115, 22, 0.8)',
    },
  },
  branding: {
    primaryColor: '#F97316',
  },
  glow: {
    primary: 'rgba(249, 115, 22, 0.4)',
    secondary: 'rgba(249, 115, 22, 0.6)',
    card: 'rgba(249, 115, 22, 0.2)',
    cardHover: 'rgba(249, 115, 22, 0.3)',
    button: 'rgba(249, 115, 22, 0.6)',
    focus: 'rgba(249, 115, 22, 0.8)',
    scrollbar: 'rgba(249, 115, 22, 0.4)',
  },
  gradients: {
    start: 'rgba(249, 115, 22, 0.08)',
    end: 'rgba(249, 115, 22, 0.03)',
    hoverStart: 'rgba(249, 115, 22, 0.15)',
    hoverEnd: 'rgba(249, 115, 22, 0.08)',
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