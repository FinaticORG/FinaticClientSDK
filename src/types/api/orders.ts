/**
 * Order-related types
 */

export interface Order {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  type_: 'market' | 'limit' | 'stop' | 'stop_limit';
  price?: number;
  stopPrice?: number;
  timeInForce: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
}

export interface OptionsOrder extends Order {
  optionType: 'call' | 'put';
  strikePrice: number;
  expirationDate: string;
}

export interface CryptoOrderOptions {
  quantity?: number;
  notional?: number;
}

export interface OptionsOrderOptions {
  strikePrice: number;
  expirationDate: string;
  optionType: 'call' | 'put';
  contractSize?: number;
}

export interface OrderResponse {
  success: boolean;
  response_data: any; // More flexible for broker-specific response data
  message: string;
  status_code: number;
  category?: string; // For error categorization
}

export interface TradingContext {
  broker?: string;
  accountNumber?: string;
  accountId?: string;
} 