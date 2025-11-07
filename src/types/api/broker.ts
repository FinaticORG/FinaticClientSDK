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

// Base order fields common to all brokers
// Mirrors the structure from order_place_query_params_request.py examples
interface BaseOrderParams {
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  assetType: 'equity' | 'equity_option' | 'crypto' | 'forex' | 'future' | 'future_option';
  action: 'buy' | 'sell';
  timeInForce: 'day' | 'gtc' | 'gtd' | 'ioc' | 'fok';
  accountNumber: string | number;
  symbol: string;
  orderQty: number;
  price?: number; // Required for limit and stop_limit orders
  stopPrice?: number; // Required for stop, stop_limit, and trailing_stop orders
  limitPrice?: number; // Required for stop_limit orders
  expireTime?: string; // ISO 8601 format (e.g., "2025-01-15T14:30:00Z"), required for GTD timeInForce
}

// Robinhood-specific order fields
// Based on examples in order_place_query_params_request.py
interface RobinhoodOrderParams extends BaseOrderParams {
  extendedHours?: boolean; // Default: false
  marketHours?: 'regular_hours' | 'extended_hours' | 'all_day_hours'; // Default: 'regular_hours'
}

// NinjaTrader-specific order fields
// Based on examples in order_place_query_params_request.py
interface NinjaTraderOrderParams extends BaseOrderParams {
  accountSpec?: string; // e.g., "MyAcct"
  isAutomated?: boolean; // Default: true
  activationTime?: string; // ISO 8601 format
  text?: string; // Max 64 chars, custom order description
  pegDifference?: number;
}

// TastyTrade-specific order fields (structure TBD based on examples)
interface TastyTradeOrderParams extends BaseOrderParams {
  // TODO: Add TastyTrade-specific fields when examples are available
}

// Discriminated union matching the Python request body structure
// Mirrors BrokerOrderPlaceRequestBody from order_place_query_params_request.py
export type BrokerOrderParams =
  | { broker: 'robinhood'; order: RobinhoodOrderParams }
  | { broker: 'ninja_trader'; order: NinjaTraderOrderParams }
  | { broker: 'tasty_trade'; order: TastyTradeOrderParams }
  | { broker: 'tradovate'; order: BaseOrderParams };

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

// Order detail types
export interface OrderFill {
  id: string;
  order_id: string;
  leg_id: string | null;
  price: number;
  quantity: number;
  executed_at: string;
  execution_id: string | null;
  trade_id: string | null;
  venue: string | null;
  commission_fee: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  order_group_id: string | null;
  event_type: string | null;
  event_time: string;
  event_id: string | null;
  order_status: string | null;
  inferred: boolean;
  confidence: number | null;
  reason_code: string | null;
  recorded_at: string | null;
}

export interface OrderLeg {
  id: string;
  order_id: string;
  leg_index: number;
  asset_type: string;
  broker_provided_symbol: string | null;
  quantity: number;
  filled_quantity: number | null;
  avg_fill_price: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface OrderGroupOrder extends BrokerDataOrder {
  legs: OrderLeg[];
}

export interface OrderGroup {
  id: string;
  user_broker_connection_id: string | null;
  created_at: string;
  updated_at: string;
  orders: OrderGroupOrder[];
}

// Position detail types
export interface PositionLot {
  id: string;
  position_id: string | null;
  user_broker_connection_id: string;
  broker_provided_account_id: string;
  instrument_key: string;
  asset_type: string | null;
  side: 'long' | 'short' | null;
  open_quantity: number;
  closed_quantity: number;
  remaining_quantity: number;
  open_price: number;
  close_price_avg: number | null;
  cost_basis: number;
  cost_basis_w_commission: number;
  realized_pl: number;
  realized_pl_w_commission: number;
  lot_opened_at: string;
  lot_closed_at: string | null;
  position_group_id: string | null;
  created_at: string;
  updated_at: string;
  position_lot_fills?: PositionLotFill[];
}

export interface PositionLotFill {
  id: string;
  lot_id: string;
  order_fill_id: string;
  fill_price: number;
  fill_quantity: number;
  executed_at: string;
  commission_share: number | null;
  created_at: string;
  updated_at: string;
}

// Filter types for detail endpoints
export interface OrderFillsFilter {
  connection_id?: string;
  limit?: number;
  offset?: number;
}

export interface OrderEventsFilter {
  connection_id?: string;
  limit?: number;
  offset?: number;
}

export interface OrderGroupsFilter {
  broker_id?: string;
  connection_id?: string;
  limit?: number;
  offset?: number;
  created_after?: string;
  created_before?: string;
}

export interface PositionLotsFilter {
  broker_id?: string;
  connection_id?: string;
  account_id?: string;
  symbol?: string;
  position_id?: string;
  limit?: number;
  offset?: number;
}

export interface PositionLotFillsFilter {
  connection_id?: string;
  limit?: number;
  offset?: number;
}
