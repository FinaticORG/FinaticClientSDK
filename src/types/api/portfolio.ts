/**
 * Portfolio-related types
 */

export interface PortfolioSnapshot {
  timestamp: string;
  totalValue: number;
  cash: number;
  equity: number;
  positions: {
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    marketValue: number;
    unrealizedPnL: number;
  }[];
}

export interface PerformanceMetrics {
  totalReturn: number;
  dailyReturn: number;
  weeklyReturn: number;
  monthlyReturn: number;
  yearlyReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  beta: number;
  alpha: number;
}

export interface Holding {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  realizedPnL: number;
  costBasis: number;
  currency: string;
}

export interface Portfolio {
  id: string;
  name: string;
  type: string;
  status: string;
  cash: number;
  buyingPower: number;
  equity: number;
  longMarketValue: number;
  shortMarketValue: number;
  initialMargin: number;
  maintenanceMargin: number;
  lastEquity: number;
  positions: Holding[];
  performance: PerformanceMetrics;
} 