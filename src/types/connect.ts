import { Theme } from './ui/theme';
import { UserToken } from './api/auth';
import { PortalTheme } from './portal';

export interface FinaticConnectOptions {
  /** The portal token from your backend */
  token: string;
  /** Optional base URL for API requests */
  baseUrl?: string;
  /** Optional origin for the portal */
  origin?: string;
  /** Callback when user successfully connects */
  onSuccess?: (tokens: UserToken) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback when the portal is closed */
  onClose?: () => void;
  /** Optional theme configuration */
  theme?: Theme;
  /** Callback when tokens are received */
  onTokensReceived?: (tokens: { access_token?: string; refresh_token?: string }) => void;
}

export interface FinaticUserToken {
  accessToken: string;
  refreshToken: string;
  userId: string;
  companyId: string;
  expiresAt: Date;
}

export interface PortalMessage {
  type: 'success' | 'error' | 'close' | 'resize';
  userId?: string;
  error?: string;
  height?: number;
  access_token?: string;
  refresh_token?: string;
}

export interface PortalOptions {
  /** Callback when user successfully connects */
  onSuccess?: (userId: string) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback when the portal is closed */
  onClose?: () => void;
  /** Callback when portal events occur */
  onEvent?: (type: string, data: any) => void;
  /** Optional theme configuration for the portal */
  theme?: PortalTheme;
  /** Optional list of broker names to filter by (only these brokers will be shown) */
  brokers?: string[];
  /** Optional email address to prefill in the portal */
  email?: string;
}
