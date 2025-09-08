/**
 * Error response types matching API documentation
 */

export interface TradeAccessDeniedError {
  success: false;
  response_data: null;
  message: string;
  status_code: 403;
  category: 'TRADE_ACCESS_DENIED';
}

export interface OrderNotFoundError {
  success: false;
  response_data: null;
  message: string;
  status_code: 404;
  category: 'ORDER_NOT_FOUND';
}

export interface ValidationError {
  success: false;
  response_data: null;
  message: string;
  status_code: 400;
}

export interface TradingNotEnabledError {
  success: false;
  response_data: null;
  message: string;
  status_code: 403;
  code: 'TRADING_NOT_ENABLED';
  requires_action: null;
} 