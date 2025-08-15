/**
 * Theme-related types
 */

export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  colors: {
    primary: string;
    secondary: string;
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
      error: string;
      success: string;
      warning: string;
    };
    border: {
      light: string;
      medium: string;
      dark: string;
    };
    status: {
      active: string;
      inactive: string;
      pending: string;
      error: string;
      success: string;
    };
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      none: number;
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  components: {
    button: {
      borderRadius: string;
      padding: string;
      fontSize: string;
      fontWeight: number;
    };
    input: {
      borderRadius: string;
      padding: string;
      fontSize: string;
    };
    card: {
      borderRadius: string;
      padding: string;
      shadow: string;
    };
    modal: {
      borderRadius: string;
      padding: string;
      backdrop: string;
    };
  };
} 