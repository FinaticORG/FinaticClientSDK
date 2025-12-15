/**
 * Finatic SDK Singleton
 * 
 * This file demonstrates how to initialize and use the Finatic Client SDK.
 * In production, the token should be fetched from your backend server, not directly
 * from the frontend. This is shown here for simplicity in the demo.
 */

import { FinaticConnect } from '@finatic/client';

// Singleton instance
let finaticInstance: FinaticConnect | null = null;

/**
 * Get stored user ID from localStorage
 * 
 * @returns string | null - The stored user ID, or null if not found
 */
function getStoredUserId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem('finatic_user_id');
  } catch {
    return null;
  }
}

/**
 * Store user ID in localStorage
 * 
 * ⚠️ PRODUCTION NOTE: In production, you should store the user ID in your database
 * linked to your user account, not in localStorage. This ensures the user ID persists
 * across devices and browsers, and is more secure.
 * 
 * @param userId - The user ID to store
 */
function storeUserId(userId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem('finatic_user_id', userId);
  } catch {
    // Ignore localStorage errors (e.g., in private browsing mode)
  }
}

/**
 * Initialize the Finatic SDK
 * 
 * NOTE: In production, you should fetch the token from your backend server,
 * not directly from the Finatic API. This prevents exposing your API key
 * in the frontend code.
 * 
 * @returns Promise<FinaticConnect> - The initialized SDK instance
 */
export async function initializeSDK(): Promise<FinaticConnect> {
  if (finaticInstance) {
    return finaticInstance;
  }

  // Get API key from environment variables
  const apiKey = (import.meta as any).env?.VITE_FINATIC_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_FINATIC_API_KEY environment variable is required');
  }

  // ⚠️ PRODUCTION NOTE: In production, this token fetch should be done on your backend server.
  // Your frontend should call YOUR backend API endpoint (e.g., /api/finatic/token),
  // which then securely calls the Finatic API with your API key.
  // This prevents exposing your API key in the frontend bundle.
  
  // Fetch token from Finatic API
  const response = await fetch('https://api.finatic.dev/api/v1/session/init', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const token = data.success?.data?.one_time_token ?? data.data?.one_time_token;

  if (!token) {
    throw new Error('No token found in API response');
  }

  // Get stored user ID from localStorage (if available)
  const storedUserId = getStoredUserId();

  // Initialize the SDK with token and user ID (if available)
  // Since userId is optional, we can pass it directly - undefined/null will be treated as not provided
  finaticInstance = await FinaticConnect.init(token, storedUserId ?? undefined);

  return finaticInstance;
}

/**
 * Get the current Finatic SDK instance
 * 
 * @returns FinaticConnect | null - The SDK instance, or null if not initialized
 */
export function getSDK(): FinaticConnect | null {
  return finaticInstance;
}

/**
 * Check if the SDK is initialized
 * 
 * @returns boolean - True if SDK is initialized
 */
export function isSDKInitialized(): boolean {
  return finaticInstance !== null;
}

/**
 * Check if the user is authenticated
 * 
 * @returns boolean - True if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (!finaticInstance) {
    return false;
  }
  return finaticInstance.isAuthed();
}

/**
 * Get the current user ID
 * 
 * @returns string | null - The user ID, or null if not authenticated
 */
export function getUserId(): string | null {
  if (!finaticInstance) {
    return null;
  }
  return finaticInstance.getUserId() || null;
}

/**
 * Open the authentication portal
 * 
 * @param onSuccess - Callback when authentication succeeds
 * @param onError - Callback when authentication fails
 * @param onClose - Callback when portal is closed
 */
export async function openPortal(
  onSuccess?: (userId: string) => void,
  onError?: (error: Error) => void,
  onClose?: () => void
): Promise<void> {
  if (!finaticInstance) {
    throw new Error('SDK not initialized. Call initializeSDK() first.');
  }

  // Wrap onSuccess to store user ID in localStorage
  const wrappedOnSuccess = (userId: string) => {
    // Store user ID in localStorage
    // ⚠️ PRODUCTION NOTE: In production, store this in your database linked to your user account
    storeUserId(userId);
    
    // Call original callback if provided
    onSuccess?.(userId);
  };

  await finaticInstance.openPortal({}, wrappedOnSuccess, onError, onClose);
}

/**
 * Get all brokers
 * 
 * @returns Promise<any[]> - Array of brokers
 */
export async function getBrokers(): Promise<any[]> {
  if (!finaticInstance) {
    throw new Error('SDK not initialized. Call initializeSDK() first.');
  }

  const response = await finaticInstance.getBrokers();
  return extractData(response) || [];
}

/**
 * Get all accounts
 * 
 * @returns Promise<any[]> - Array of accounts
 */
export async function getAllAccounts(): Promise<any[]> {
  if (!finaticInstance) {
    throw new Error('SDK not initialized. Call initializeSDK() first.');
  }

  const response = await finaticInstance.getAllAccounts();
  return extractData(response) || [];
}

/**
 * Get all orders
 * 
 * @returns Promise<any[]> - Array of orders
 */
export async function getAllOrders(): Promise<any[]> {
  if (!finaticInstance) {
    throw new Error('SDK not initialized. Call initializeSDK() first.');
  }

  const response = await finaticInstance.getAllOrders();
  return extractData(response) || [];
}

/**
 * Get all positions
 * 
 * @returns Promise<any[]> - Array of positions
 */
export async function getAllPositions(): Promise<any[]> {
  if (!finaticInstance) {
    throw new Error('SDK not initialized. Call initializeSDK() first.');
  }

  const response = await finaticInstance.getAllPositions();
  return extractData(response) || [];
}

/**
 * Get all balances
 * 
 * @returns Promise<any[]> - Array of balances
 */
export async function getAllBalances(): Promise<any[]> {
  if (!finaticInstance) {
    throw new Error('SDK not initialized. Call initializeSDK() first.');
  }

  const response = await finaticInstance.getAllBalances();
  return extractData(response) || [];
}

/**
 * Extract data from FinaticResponse format
 * Handles both new format { success: { data: [...] } } and legacy formats
 * 
 * @param response - The response from an SDK method
 * @returns any[] - Extracted array data
 */
function extractData(response: any): any[] {
  if (response?.success?.data) {
    return Array.isArray(response.success.data) ? response.success.data : [];
  }
  if (response?.data) {
    return Array.isArray(response.data) ? response.data : [];
  }
  return Array.isArray(response) ? response : [];
}

