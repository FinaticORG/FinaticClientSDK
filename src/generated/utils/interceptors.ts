/**
 * Request/Response interceptor utilities (Phase 2B).
 * 
 * Generated - do not edit directly.
 */

import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { SdkConfig } from '../config';

export type RequestInterceptor = (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
export type ResponseInterceptor = (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
export type ErrorInterceptor = (error: any) => any;

export interface InterceptorChain {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
  error: ErrorInterceptor[];
}

let _interceptors: InterceptorChain = {
  request: [],
  response: [],
  error: [],
};

/**
 * Add request interceptor.
 */
export function addRequestInterceptor(interceptor: RequestInterceptor): void {
  _interceptors.request.push(interceptor);
}

/**
 * Add response interceptor.
 */
export function addResponseInterceptor(interceptor: ResponseInterceptor): void {
  _interceptors.response.push(interceptor);
}

/**
 * Add error interceptor.
 */
export function addErrorInterceptor(interceptor: ErrorInterceptor): void {
  _interceptors.error.push(interceptor);
}

/**
 * Apply request interceptors.
 */
export async function applyRequestInterceptors(
  config: AxiosRequestConfig,
  sdkConfig?: SdkConfig
): Promise<AxiosRequestConfig> {
  if (!sdkConfig?.requestInterceptorsEnabled) {
    return config;
  }
  
  let result = config;
  for (const interceptor of _interceptors.request) {
    result = await interceptor(result);
  }
  return result;
}

/**
 * Apply response interceptors.
 */
export async function applyResponseInterceptors(
  response: AxiosResponse,
  sdkConfig?: SdkConfig
): Promise<AxiosResponse> {
  if (!sdkConfig?.responseInterceptorsEnabled) {
    return response;
  }
  
  let result = response;
  for (const interceptor of _interceptors.response) {
    result = await interceptor(result);
  }
  return result;
}

/**
 * Apply error interceptors.
 */
export async function applyErrorInterceptors(
  error: any,
  sdkConfig?: SdkConfig
): Promise<any> {
  if (!sdkConfig?.responseInterceptorsEnabled) {
    throw error;
  }
  
  let result = error;
  for (const interceptor of _interceptors.error) {
    result = await interceptor(result);
  }
  return result;
}
