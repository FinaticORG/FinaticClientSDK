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

export interface SessionResponseData {
  session_id: string; // Unique session identifier
  company_id: string; // ID of the company this session is for
  status: 'pending'; // Always starts as pending
  expires_at: string; // ISO datetime when session expires
}

export interface SessionStartResponse {
  data: SessionResponseData;
  message: 'Session started successfully';
}

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
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user_id: string;
  tokenType: string;
  scope: string;
}

export interface SessionValidationResponse {
  valid: boolean;
  company_id: string;
  status: string;
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

export interface SessionResponse {
  data: {
    session_id: string;
    state: SessionState;
    device_info?: Record<string, string>;
    company_id?: string;
    status?: string;
    expires_at?: string;
    user_id?: string | null;
    auto_login?: boolean;
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
  };
  message: string;
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