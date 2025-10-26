/**
 * Authentication-related types
 */

export interface SessionInitResponse {
  success: boolean;
  message: string;
  data: {
    one_time_token: string;
    expires_at: string;
  };
}

// SessionResponseData moved below to match backend response format

// SessionStartResponse removed - using SessionResponse instead

export interface OtpRequestResponse {
  success: boolean;
  message: string;
  data: boolean;
}

export interface OtpVerifyResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user_id: string;
    expires_in: number;
    scope: string;
    token_type: 'Bearer';
  };
}

export interface UserToken {
  user_id: string;
  // Removed token fields - we no longer use Supabase tokens in the SDK
}

export interface SessionValidationResponse {
  valid: boolean;
  company_id: string;
  status: string;
  is_sandbox: boolean; // Whether this session is in sandbox mode
  environment: string; // Environment context (production or sandbox)
}

export interface SessionAuthenticateResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  response_data: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
    company_id: string;
    company_name: string;
    email_verified: boolean;
  };
  message: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId?: string;
}

export interface SessionResponseData {
  session_id: string;
  company_id: string;
  status: string;
  expires_at: string;
  user_id?: string | null;
  auto_login?: boolean;
}

export interface SessionResponse {
  success: boolean;
  message: string;
  data: SessionResponseData;
}

export enum SessionState {
  PENDING = 'PENDING',
  AUTHENTICATING = 'AUTHENTICATING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

export type SessionStatus = SessionState;

export interface DeviceInfo {
  ip_address: string;
  user_agent: string;
  fingerprint: string;
} 