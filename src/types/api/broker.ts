/**
 * Broker-related types
 */

export interface BrokerAccount {
  id: string;
  user_broker_connection_id: string;
  broker_provided_account_id: string;
  account_name: string;
  account_type: string;
  currency: string;
  cash_balance: number;
  buying_power: number;
  status: string;
  /** ISO 8601 timestamp with timezone information */
  created_at: string;
  /** ISO 8601 timestamp with timezone information */
  updated_at: string;
  /** ISO 8601 timestamp with timezone information */
  last_synced_at: string;
  /** ISO 8601 timestamp with timezone information - when positions were last synced */
  positions_synced_at: string | null;
  /** ISO 8601 timestamp with timezone information - when orders were last synced */
  orders_synced_at: string | null;
  /** ISO 8601 timestamp with timezone information - when balances were last synced */
  balances_synced_at: string | null;
  /** ISO 8601 timestamp with timezone information - when the account was created */
  account_created_at: string | null;
  /** ISO 8601 timestamp with timezone information - when the account was last updated */
  account_updated_at: string | null;
  /** ISO 8601 timestamp with timezone information - when the first trade occurred */
  account_first_trade_at: string | null;
}

export interface BrokerOrder {
  id: string;
  user_broker_connection_id: string;
  broker_provided_account_id: string;
  order_id: string;
  symbol: string;
  order_type: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: string;
  /** ISO 8601 timestamp with timezone information */
  created_at: string;
  /** ISO 8601 timestamp with timezone information */
  updated_at: string;
  /** ISO 8601 timestamp with timezone information, null if not filled */
  filled_at: string | null;
  filled_quantity: number;
  filled_avg_price: number;
}

export interface BrokerPosition {
  id: string;
  user_broker_connection_id: string;
  broker_provided_account_id: string;
  symbol: string;
  asset_type: string;
  quantity: number;
  average_price: number;
  market_value: number;
  cost_basis: number;
  unrealized_gain_loss: number;
  unrealized_gain_loss_percent: number;
  current_price: number;
  last_price: number;
  /** ISO 8601 timestamp with timezone information */
  last_price_updated_at: string;
  /** ISO 8601 timestamp with timezone information */
  created_at: string;
  /** ISO 8601 timestamp with timezone information */
  updated_at: string;
}

export interface BrokerBalance {
  id: string;
  account_id: string;
  total_cash_value: number | null;
  net_liquidation_value: number | null;
  initial_margin: number | null;
  maintenance_margin: number | null;
  available_to_withdraw: number | null;
  total_realized_pnl: number | null;
  balance_created_at: string | null;
  balance_updated_at: string | null;
  is_end_of_day_snapshot: boolean | null;
  raw_payload: any | null;
  /** ISO 8601 timestamp with timezone information */
  created_at: string;
  /** ISO 8601 timestamp with timezone information */
  updated_at: string;
}

export interface BrokerDataOptions {
  broker_name?: string;
  account_id?: string;
  symbol?: string;
}

export interface BrokerInfo {
  id: string;
  name: string;
  display_name: string;
  description: string;
  website: string;
  features: string[];
  auth_type: 'oauth' | 'api_key';
  logo_path: string;
  is_active: boolean;
}

export interface BrokerOrderParams {
  broker: 'robinhood' | 'tasty_trade' | 'ninja_trader';
  order_id?: string; // Optional order_id field for modify operations
  orderType: 'Market' | 'Limit' | 'Stop' | 'StopLimit';
  assetType: 'Stock' | 'Option' | 'Crypto' | 'Future';
  action: 'Buy' | 'Sell';
  timeInForce: 'day' | 'gtc' | 'gtd' | 'ioc' | 'fok';
  accountNumber: string | number;
  symbol: string;
  orderQty: number;
  price?: number;
  stopPrice?: number;
}

export interface BrokerExtras {
  robinhood?: {
    extendedHours?: boolean;
    marketHours?: 'regular_hours' | 'extended_hours';
    trailType?: 'percentage' | 'amount';
  };
  ninjaTrader?: {
    accountSpec?: string;
    isAutomated?: boolean;
    activationTime?: string;
    text?: string;
    pegDifference?: number;
    expireTime?: string;
  };
  tastyTrade?: {
    automatedSource?: boolean;
    priceEffect?: 'Debit' | 'Credit';
    externalIdentifier?: string;
    partitionKey?: string;
    preflightId?: string;
    source?: string;
    valueEffect?: 'Debit' | 'Credit';
  };
}

export interface BrokerConnection {
  id: string;
  broker_id: string;
  user_id: string;
  company_id: string;
  status: 'connected' | 'disconnected' | 'error';
  connected_at: string;
  last_synced_at: string | null;
  permissions: {
    read: boolean;
    write: boolean;
  };
  metadata: {
    nickname?: string;
    [key: string]: any;
  };
  needs_reauth: boolean;
}

// Enhanced broker data types
export interface BrokerDataOrder {
  id: string;
  broker_id: string;
  connection_id: string;
  account_id: string;
  order_id: string;
  symbol: string;
  order_type: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: 'filled' | 'pending' | 'cancelled' | 'rejected' | 'partially_filled';
  asset_type: 'stock' | 'option' | 'crypto' | 'future';
  created_at: string;
  updated_at: string;
  filled_at?: string;
  filled_quantity: number;
  filled_avg_price: number;
  metadata?: Record<string, any>;
}

export interface BrokerDataPosition {
  id: string;
  broker_id: string;
  connection_id: string;
  account_id: string;
  symbol: string;
  asset_type: 'stock' | 'option' | 'crypto' | 'future';
  side: 'long' | 'short';
  quantity: number;
  average_price: number;
  market_value: number;
  cost_basis: number;
  unrealized_gain_loss: number;
  unrealized_gain_loss_percent: number;
  current_price: number;
  last_price: number;
  last_price_updated_at: string;
  position_status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface BrokerDataAccount {
  id: string;
  broker_id: string;
  connection_id: string;
  account_id: string;
  account_name: string;
  account_type: 'margin' | 'cash' | 'crypto_wallet' | 'live' | 'sim';
  status: 'active' | 'inactive';
  currency: string;
  cash_balance: number;
  buying_power: number;
  equity: number;
  created_at: string;
  updated_at: string;
  last_synced_at: string;
  metadata?: Record<string, any>;
}

// Filter types
export interface OrdersFilter {
  broker_id?: string;
  connection_id?: string;
  account_id?: string;
  symbol?: string;
  status?: 'filled' | 'pending' | 'cancelled' | 'rejected' | 'partially_filled';
  side?: 'buy' | 'sell';
  asset_type?: 'stock' | 'option' | 'crypto' | 'future';
  limit?: number;
  offset?: number;
  created_after?: string; // ISO 8601 format
  created_before?: string; // ISO 8601 format
  with_metadata?: boolean;
}

export interface PositionsFilter {
  broker_id?: string;
  connection_id?: string;
  account_id?: string;
  symbol?: string;
  side?: 'long' | 'short';
  asset_type?: 'stock' | 'option' | 'crypto' | 'future';
  position_status?: 'open' | 'closed';
  limit?: number;
  offset?: number;
  updated_after?: string; // ISO 8601 format
  updated_before?: string; // ISO 8601 format
  with_metadata?: boolean;
}

export interface AccountsFilter {
  broker_id?: string;
  connection_id?: string;
  account_type?: 'margin' | 'cash' | 'crypto_wallet' | 'live' | 'sim';
  status?: 'active' | 'inactive';
  currency?: string;
  limit?: number;
  offset?: number;
  with_metadata?: boolean;
}

export interface BalancesFilter {
  broker_id?: string;
  connection_id?: string;
  account_id?: string;
  is_end_of_day_snapshot?: boolean;
  limit?: number;
  offset?: number;
  balance_created_after?: string; // ISO 8601 format
  balance_created_before?: string; // ISO 8601 format
  with_metadata?: boolean;
}

// Response types for filtered data
export interface FilteredOrdersResponse {
  orders: BrokerDataOrder[];
  total: number;
  limit: number;
  offset: number;
}

export interface FilteredPositionsResponse {
  positions: BrokerDataPosition[];
  total: number;
  limit: number;
  offset: number;
}

export interface FilteredAccountsResponse {
  accounts: BrokerDataAccount[];
  total: number;
  limit: number;
  offset: number;
}

export interface FilteredBalancesResponse {
  balances: BrokerBalance[];
  total: number;
  limit: number;
  offset: number;
}

// Disconnect company response types
export interface DisconnectCompanyResponse {
  success: boolean;
  response_data: {
    connection_id: string;
    action: 'company_access_removed' | 'connection_deleted';
    remaining_companies?: number;
    message: string;
  };
  message: string;
  status_code: number;
} 