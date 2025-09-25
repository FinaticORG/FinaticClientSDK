// Types (explicit re-exports to avoid conflicts)
export type {
  // Core API types
  ApiConfig,
  ApiResponse,
  Order,
  OptionsOrder,
  BrokerAccount,
  PortfolioSnapshot,
  PerformanceMetrics,
  UserToken,
  Holding,
  Portfolio,
  PortalResponse,
  SessionInitResponse,
  SessionStartResponse,
  SessionResponse,
  OtpRequestResponse,
  OtpVerifyResponse,
  PortalUrlResponse,
  SessionValidationResponse,
  SessionAuthenticateResponse,
  RequestHeaders,
  SessionStatus,
  BrokerOrderParams,
  BrokerExtras,
  CryptoOrderOptions,
  OptionsOrderOptions,
  OrderResponse,
  TradingContext,
  DeviceInfo,
  BrokerOrder,
  BrokerPosition,
  BrokerBalance,
  BrokerDataOptions,
  BrokerInfo,
  TokenInfo,
  RefreshTokenRequest,
  RefreshTokenResponse,
  AccountsFilter,
  OrdersFilter,
  PositionsFilter,
  BalancesFilter,
  BrokerDataOrder,
  BrokerDataPosition,
  BrokerDataAccount,
  FilteredOrdersResponse,
  FilteredPositionsResponse,
  FilteredAccountsResponse,
  FilteredBalancesResponse,
  BrokerConnection,
} from './types';

export type { FinaticConnectOptions, FinaticUserToken, PortalMessage } from './types/connect';
export type {
  PortalProps,
  PortalTheme,
  PortalThemeConfig,
  PortalThemePreset,
} from './types/portal';

// Error types
export type {
  TradeAccessDeniedError,
  OrderNotFoundError,
  ValidationError,
} from './types/api/errors';

// Main SDK classes
export { ApiClient } from './core/client/ApiClient';
export { FinaticConnect } from './core/client/FinaticConnect';

// Supabase configuration
export { supabase } from './core/supabase';

// Core types and classes
export { PaginatedResult } from './types/common/pagination';

// Utilities
export * from './utils/errors';
export * from './utils/events';
export * from './utils/themeUtils';

// Theme presets
export { portalThemePresets } from './themes/portalPresets';

// Mocks (optional, for testing)
export { MockFactory } from './mocks/MockFactory';
