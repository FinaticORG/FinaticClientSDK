/**
 * Core API types
 */

import { ApiPaginationInfo } from '../common/pagination';

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  sandbox?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  response_data: T;
  message: string;
  status_code: number;
  pagination?: ApiPaginationInfo;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface RequestHeaders {
  'Content-Type': string;
  'X-API-Key'?: string;
  Authorization?: string;
  'X-CSRF-Token'?: string;
  token?: string;
  'User-Agent'?: string;
  'X-Device-Info'?: string;
  'X-Request-ID'?: string;
  'X-Request-Timestamp'?: string;
  'X-Request-Signature'?: string;
  [key: string]: string | undefined;
}

export interface PortalResponse {
  portalUrl: string;
  token: string;
  expiresIn: number;
}

export interface PortalUrlResponse {
  success: boolean;
  message: string;
  data: {
    portal_url: string;
  };
} 