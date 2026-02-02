'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFinatic } from '@/app/providers/FinaticProvider';
import { useEnvironmentConfig } from '@/app/providers/EnvironmentConfigProvider';

type SupportedAssetType =
  | 'equity'
  | 'equity_option'
  | 'crypto'
  | 'forex'
  | 'future'
  | 'future_option';

type SupportedOrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';

type OrderPresetConfig = {
  id: string;
  label: string;
  description: string;
  assetType: SupportedAssetType;
  orderType: SupportedOrderType;
  defaultOrder: Record<string, unknown>;
};

/**
 * Get the nearest Friday date in YYYY-MM-DD format.
 * If today is Friday, returns today. Otherwise returns the next Friday.
 * Robinhood options expire on Fridays (weeklies).
 */
const getNearestFriday = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday

  // Calculate days until next Friday
  // If today is Friday (5), use today (0 days)
  // If today is Saturday (6), use next Friday (6 days)
  // Otherwise, use (5 - dayOfWeek) days
  let daysUntilFriday: number;
  if (dayOfWeek === 5) {
    // Today is Friday, use today
    daysUntilFriday = 0;
  } else if (dayOfWeek === 6) {
    // Today is Saturday, use next Friday (6 days)
    daysUntilFriday = 6;
  } else {
    // Monday (1) through Thursday (4), use next Friday
    daysUntilFriday = 5 - dayOfWeek;
  }

  const fridayDate = new Date(today);
  fridayDate.setDate(today.getDate() + daysUntilFriday);

  const year = fridayDate.getFullYear();
  const month = String(fridayDate.getMonth() + 1).padStart(2, '0');
  const day = String(fridayDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const BROKER_ORDER_PRESETS: Record<string, OrderPresetConfig[]> = {
  robinhood: [
    {
      id: 'robinhood-equity-market-buy-regular-hours',
      label: 'Equity - Market Buy (Regular Hours)',
      description: 'Market equity buy order - matches Robinhood example (regular market hours).',
      assetType: 'equity',
      orderType: 'market',
      defaultOrder: {
        orderType: 'market',
        assetType: 'equity',
        action: 'buy',
        timeInForce: 'day',
        symbol: 'AAPL',
        orderQty: 10,
        extendedHours: false,
        marketHours: 'regular_hours',
      },
    },
    {
      id: 'robinhood-equity-limit-sell-extended-hours',
      label: 'Equity - Limit Sell (Extended Hours)',
      description: 'Limit equity sell order - matches Robinhood example (extended hours).',
      assetType: 'equity',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'equity',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'GOOGL',
        orderQty: 5,
        price: 1500.0,
        extendedHours: true,
        marketHours: 'extended_hours',
      },
    },
    {
      id: 'robinhood-equity-stop-buy-gtc',
      label: 'Equity - Stop Buy (GTC)',
      description: 'Stop equity buy order - matches Robinhood example (GTC).',
      assetType: 'equity',
      orderType: 'stop',
      defaultOrder: {
        orderType: 'stop',
        assetType: 'equity',
        action: 'buy',
        timeInForce: 'gtc',
        symbol: 'MSFT',
        orderQty: 20,
        stopPrice: 310.0,
        extendedHours: false,
        marketHours: 'regular_hours',
      },
    },
    {
      id: 'robinhood-equity-stop-limit-sell-gtd',
      label: 'Equity - Stop Limit Sell (GTD)',
      description: 'Stop-limit equity sell order - matches Robinhood example with expire time.',
      assetType: 'equity',
      orderType: 'stop_limit',
      defaultOrder: {
        orderType: 'stop_limit',
        assetType: 'equity',
        action: 'sell',
        timeInForce: 'gtd',
        expireTime: '2025-01-15T14:30:00Z',
        symbol: 'TSLA',
        orderQty: 3,
        stopPrice: 200.0,
        limitPrice: 195.0,
        extendedHours: false,
        marketHours: 'regular_hours',
      },
    },
    {
      id: 'robinhood-equity-trailing-stop-buy-gtc',
      label: 'Equity - Trailing Stop Buy (GTC)',
      description: 'Trailing-stop equity buy order - matches Robinhood example (GTC).',
      assetType: 'equity',
      orderType: 'trailing_stop',
      defaultOrder: {
        orderType: 'trailing_stop',
        assetType: 'equity',
        action: 'buy',
        timeInForce: 'gtc',
        symbol: 'NFLX',
        orderQty: 8,
        stopPrice: 450.0,
        extendedHours: false,
        marketHours: 'regular_hours',
      },
    },
    {
      id: 'robinhood-equity-option-limit-buy-single-leg',
      label: 'Equity Option - Limit Buy (Single Leg)',
      description: 'Single-leg equity option limit buy - matches Robinhood example.',
      assetType: 'equity_option',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'equity_option',
        action: 'buy',
        timeInForce: 'day',
        symbol: 'AAPL',
        orderQty: 1,
        price: 1.25,
        positionEffect: 'open',
        creditOrDebit: 'debit',
        expirationDate: '2025-06-21',
        strikePrice: 150.0,
        optionType: 'call',
      },
    },
    {
      id: 'robinhood-equity-option-limit-sell-single-leg',
      label: 'Equity Option - Limit Sell (Single Leg)',
      description: 'Single-leg equity option limit sell - matches Robinhood example.',
      assetType: 'equity_option',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'equity_option',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'AAPL',
        orderQty: 1,
        price: 2.1,
        positionEffect: 'open',
        creditOrDebit: 'credit',
        expirationDate: '2025-06-21',
        strikePrice: 140.0,
        optionType: 'put',
      },
    },
    {
      id: 'robinhood-equity-option-stop-limit-buy-single-leg',
      label: 'Equity Option - Stop Limit Buy (Single Leg)',
      description: 'Single-leg equity option stop-limit buy - matches Robinhood example.',
      assetType: 'equity_option',
      orderType: 'stop_limit',
      defaultOrder: {
        orderType: 'stop_limit',
        assetType: 'equity_option',
        action: 'buy',
        timeInForce: 'day',
        symbol: 'MSFT',
        orderQty: 2,
        limitPrice: 3.5,
        stopPrice: 3.0,
        positionEffect: 'open',
        creditOrDebit: 'debit',
        expirationDate: '2025-07-19',
        strikePrice: 300.0,
        optionType: 'call',
      },
    },
    {
      id: 'robinhood-equity-option-stop-limit-sell-single-leg',
      label: 'Equity Option - Stop Limit Sell (Single Leg)',
      description: 'Single-leg equity option stop-limit sell - matches Robinhood example.',
      assetType: 'equity_option',
      orderType: 'stop_limit',
      defaultOrder: {
        orderType: 'stop_limit',
        assetType: 'equity_option',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'MSFT',
        orderQty: 2,
        limitPrice: 4.0,
        stopPrice: 3.5,
        positionEffect: 'close',
        creditOrDebit: 'credit',
        expirationDate: '2025-07-19',
        strikePrice: 300.0,
        optionType: 'call',
      },
    },
    {
      id: 'robinhood-equity-option-limit-buy-debit-spread',
      label: 'Equity Option - Limit Buy (Debit Spread)',
      description: 'Multi-leg equity option limit buy debit spread - matches Robinhood example.',
      assetType: 'equity_option',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'equity_option',
        action: 'buy',
        timeInForce: 'gtc',
        symbol: 'SPY',
        orderQty: 1,
        price: 1.5,
        direction: 'debit',
        creditOrDebit: 'debit',
        spread: [
          {
            expirationDate: '2025-06-21',
            strikePrice: 430.0,
            optionType: 'call',
            positionEffect: 'open',
            action: 'buy',
            ratioQuantity: 1,
          },
          {
            expirationDate: '2025-06-21',
            strikePrice: 435.0,
            optionType: 'call',
            positionEffect: 'open',
            action: 'sell',
            ratioQuantity: 1,
          },
        ],
      },
    },
    {
      id: 'robinhood-equity-option-limit-sell-credit-spread',
      label: 'Equity Option - Limit Sell (Credit Spread)',
      description: 'Multi-leg equity option limit sell credit spread - matches Robinhood example.',
      assetType: 'equity_option',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'equity_option',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'SPY',
        orderQty: 1,
        price: 0.8,
        direction: 'credit',
        creditOrDebit: 'credit',
        spread: [
          {
            expirationDate: '2025-06-21',
            strikePrice: 430.0,
            optionType: 'put',
            positionEffect: 'open',
            action: 'sell',
            ratioQuantity: 1,
          },
          {
            expirationDate: '2025-06-21',
            strikePrice: 425.0,
            optionType: 'put',
            positionEffect: 'open',
            action: 'buy',
            ratioQuantity: 1,
          },
        ],
      },
    },
    {
      id: 'robinhood-crypto-market-buy-quantity',
      label: 'Crypto - Market Buy (Amount In Quantity)',
      description: 'Crypto market buy order using amountIn="quantity" - matches Robinhood example.',
      assetType: 'crypto',
      orderType: 'market',
      defaultOrder: {
        orderType: 'market',
        assetType: 'crypto',
        action: 'buy',
        timeInForce: 'gtc',
        symbol: 'BTC',
        orderQty: 0.001,
        amountIn: 'quantity',
      },
    },
    {
      id: 'robinhood-crypto-market-buy-price',
      label: 'Crypto - Market Buy (Amount In Price)',
      description: 'Crypto market buy order using amountIn="price" - matches Robinhood example.',
      assetType: 'crypto',
      orderType: 'market',
      defaultOrder: {
        orderType: 'market',
        assetType: 'crypto',
        action: 'buy',
        timeInForce: 'gtc',
        symbol: 'ETH',
        orderQty: 100.0,
        amountIn: 'price',
      },
    },
    {
      id: 'robinhood-crypto-limit-buy-quantity',
      label: 'Crypto - Limit Buy (Amount In Quantity)',
      description: 'Crypto limit buy order using amountIn="quantity" - matches Robinhood example.',
      assetType: 'crypto',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'crypto',
        action: 'buy',
        timeInForce: 'gtc',
        symbol: 'BTC',
        orderQty: 0.002,
        price: 30000.0,
        amountIn: 'quantity',
      },
    },
    {
      id: 'robinhood-crypto-limit-sell-price',
      label: 'Crypto - Limit Sell (Amount In Price)',
      description: 'Crypto limit sell order using amountIn="price" - matches Robinhood example.',
      assetType: 'crypto',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'crypto',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'ETH',
        orderQty: 250.0,
        price: 3200.0,
        amountIn: 'price',
      },
    },
  ],
  tasty_trade: [
    {
      id: 'tasty_trade-equity-market-buy',
      label: 'Equity - Market Buy',
      description: 'Market equity buy order for TastyTrade.',
      assetType: 'equity',
      orderType: 'market',
      defaultOrder: {
        orderType: 'market',
        assetType: 'equity',
        action: 'buy',
        timeInForce: 'day',
        symbol: 'AAPL',
        orderQty: 10,
        'automated-source': true,
      },
    },
    {
      id: 'tasty_trade-equity-limit-sell',
      label: 'Equity - Limit Sell',
      description: 'Limit equity sell order for TastyTrade.',
      assetType: 'equity',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'equity',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'GOOGL',
        orderQty: 5,
        price: 1500.0,
        'automated-source': true,
      },
    },
    {
      id: 'tasty_trade-equity-stop-buy-gtc',
      label: 'Equity - Stop Buy (GTC)',
      description: 'Stop equity buy order for TastyTrade (GTC).',
      assetType: 'equity',
      orderType: 'stop',
      defaultOrder: {
        orderType: 'stop',
        assetType: 'equity',
        action: 'buy',
        timeInForce: 'gtc',
        symbol: 'MSFT',
        orderQty: 20,
        stopPrice: 310.0,
        'automated-source': true,
      },
    },
    {
      id: 'tasty_trade-equity-stop-limit-sell-gtd',
      label: 'Equity - Stop Limit Sell (GTD)',
      description: 'Stop-limit equity sell order for TastyTrade with expire time.',
      assetType: 'equity',
      orderType: 'stop_limit',
      defaultOrder: {
        orderType: 'stop_limit',
        assetType: 'equity',
        action: 'sell',
        timeInForce: 'gtd',
        expireTime: '2025-01-15T14:30:00Z',
        symbol: 'TSLA',
        orderQty: 3,
        stopPrice: 200.0,
        limitPrice: 195.0,
        'automated-source': true,
      },
    },
    {
      id: 'tasty_trade-equity-option-limit-buy-single-leg',
      label: 'Equity Option - Limit Buy (Single Leg)',
      description: 'Single-leg equity option limit buy for TastyTrade.',
      assetType: 'equity_option',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'equity_option',
        action: 'buy',
        timeInForce: 'day',
        symbol: 'AAPL',
        orderQty: 1,
        price: 1.25,
        expirationDate: '2025-06-21',
        strikePrice: 150.0,
        optionType: 'call',
        'automated-source': true,
        'price-effect': 'Debit',
      },
    },
    {
      id: 'tasty_trade-equity-option-limit-sell-single-leg',
      label: 'Equity Option - Limit Sell (Single Leg)',
      description: 'Single-leg equity option limit sell for TastyTrade.',
      assetType: 'equity_option',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'equity_option',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'AAPL',
        orderQty: 1,
        price: 2.1,
        expirationDate: '2025-06-21',
        strikePrice: 140.0,
        optionType: 'put',
        'automated-source': true,
        'price-effect': 'Credit',
      },
    },
    {
      id: 'tasty_trade-equity-option-limit-buy-debit-spread',
      label: 'Equity Option - Limit Buy (Debit Spread)',
      description:
        'Multi-leg equity option limit buy debit spread for TastyTrade using legs array.',
      assetType: 'equity_option',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'equity_option',
        action: 'buy',
        timeInForce: 'gtc',
        symbol: 'SPY',
        orderQty: 1,
        price: 1.5,
        'automated-source': true,
        'price-effect': 'Debit',
        legs: [
          {
            'instrument-type': 'Equity Option',
            symbol: 'SPY',
            quantity: 1,
            action: 'Buy to Open',
            expirationDate: '2025-06-21',
            strikePrice: 430.0,
            optionType: 'call',
          },
          {
            'instrument-type': 'Equity Option',
            symbol: 'SPY',
            quantity: 1,
            action: 'Sell to Open',
            expirationDate: '2025-06-21',
            strikePrice: 435.0,
            optionType: 'call',
          },
        ],
      },
    },
    {
      id: 'tasty_trade-equity-option-limit-sell-credit-spread',
      label: 'Equity Option - Limit Sell (Credit Spread)',
      description:
        'Multi-leg equity option limit sell credit spread for TastyTrade using legs array.',
      assetType: 'equity_option',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'equity_option',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'SPY',
        orderQty: 1,
        price: 0.8,
        'automated-source': true,
        'price-effect': 'Credit',
        legs: [
          {
            'instrument-type': 'Equity Option',
            symbol: 'SPY',
            quantity: 1,
            action: 'Sell to Open',
            expirationDate: '2025-06-21',
            strikePrice: 430.0,
            optionType: 'put',
          },
          {
            'instrument-type': 'Equity Option',
            symbol: 'SPY',
            quantity: 1,
            action: 'Buy to Open',
            expirationDate: '2025-06-21',
            strikePrice: 425.0,
            optionType: 'put',
          },
        ],
      },
    },
    {
      id: 'tasty_trade-future-market-buy',
      label: 'Future - Market Buy',
      description: 'Market future buy order for TastyTrade.',
      assetType: 'future',
      orderType: 'market',
      defaultOrder: {
        orderType: 'market',
        assetType: 'future',
        action: 'buy',
        timeInForce: 'day',
        symbol: 'ES',
        orderQty: 1,
        'automated-source': true,
      },
    },
    {
      id: 'tasty_trade-future-limit-sell',
      label: 'Future - Limit Sell',
      description: 'Limit future sell order for TastyTrade.',
      assetType: 'future',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'future',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'NQ',
        orderQty: 1,
        price: 15000.0,
        'automated-source': true,
      },
    },
    {
      id: 'tasty_trade-future-option-limit-buy',
      label: 'Future Option - Limit Buy',
      description: 'Limit future option buy order for TastyTrade.',
      assetType: 'future_option',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'future_option',
        action: 'buy',
        timeInForce: 'day',
        symbol: 'ES',
        orderQty: 1,
        price: 50.0,
        expirationDate: '2025-06-20',
        strikePrice: 4000.0,
        optionType: 'call',
        'automated-source': true,
        'price-effect': 'Debit',
      },
    },
    {
      id: 'tasty_trade-crypto-market-buy',
      label: 'Crypto - Market Buy',
      description: 'Crypto market buy order for TastyTrade.',
      assetType: 'crypto',
      orderType: 'market',
      defaultOrder: {
        orderType: 'market',
        assetType: 'crypto',
        action: 'buy',
        timeInForce: 'gtc',
        symbol: 'BTC',
        orderQty: 0.001,
        'automated-source': true,
      },
    },
    {
      id: 'tasty_trade-crypto-limit-sell',
      label: 'Crypto - Limit Sell',
      description: 'Crypto limit sell order for TastyTrade.',
      assetType: 'crypto',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'crypto',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'ETH',
        orderQty: 0.1,
        price: 3200.0,
        'automated-source': true,
      },
    },
  ],
  ninja_trader: [
    {
      id: 'ninja_trader-equity-market-buy',
      label: 'Equity - Market Buy',
      description: 'Market equity buy order for NinjaTrader.',
      assetType: 'equity',
      orderType: 'market',
      defaultOrder: {
        orderType: 'market',
        assetType: 'equity',
        action: 'buy',
        timeInForce: 'day',
        symbol: 'AAPL',
        orderQty: 10,
        isAutomated: true,
      },
    },
    {
      id: 'ninja_trader-equity-limit-sell',
      label: 'Equity - Limit Sell',
      description: 'Limit equity sell order for NinjaTrader.',
      assetType: 'equity',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'equity',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'GOOGL',
        orderQty: 5,
        price: 1500.0,
        isAutomated: true,
      },
    },
    {
      id: 'ninja_trader-equity-stop-buy-gtc',
      label: 'Equity - Stop Buy (GTC)',
      description: 'Stop equity buy order for NinjaTrader (GTC).',
      assetType: 'equity',
      orderType: 'stop',
      defaultOrder: {
        orderType: 'stop',
        assetType: 'equity',
        action: 'buy',
        timeInForce: 'gtc',
        symbol: 'MSFT',
        orderQty: 20,
        stopPrice: 310.0,
        isAutomated: true,
      },
    },
    {
      id: 'ninja_trader-equity-stop-limit-sell-gtd',
      label: 'Equity - Stop Limit Sell (GTD)',
      description: 'Stop-limit equity sell order for NinjaTrader with expire time.',
      assetType: 'equity',
      orderType: 'stop_limit',
      defaultOrder: {
        orderType: 'stop_limit',
        assetType: 'equity',
        action: 'sell',
        timeInForce: 'gtd',
        expireTime: '2025-01-15T14:30:00Z',
        symbol: 'TSLA',
        orderQty: 3,
        stopPrice: 200.0,
        limitPrice: 195.0,
        isAutomated: true,
      },
    },
    {
      id: 'ninja_trader-equity-option-limit-buy-single-leg',
      label: 'Equity Option - Limit Buy (Single Leg)',
      description: 'Single-leg equity option limit buy for NinjaTrader.',
      assetType: 'equity_option',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'equity_option',
        action: 'buy',
        timeInForce: 'day',
        symbol: 'AAPL',
        orderQty: 1,
        price: 1.25,
        expirationDate: '2025-06-21',
        strikePrice: 150.0,
        optionType: 'call',
        isAutomated: true,
      },
    },
    {
      id: 'ninja_trader-equity-option-limit-sell-single-leg',
      label: 'Equity Option - Limit Sell (Single Leg)',
      description: 'Single-leg equity option limit sell for NinjaTrader.',
      assetType: 'equity_option',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'equity_option',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'AAPL',
        orderQty: 1,
        price: 2.1,
        expirationDate: '2025-06-21',
        strikePrice: 140.0,
        optionType: 'put',
        isAutomated: true,
      },
    },
    {
      id: 'ninja_trader-future-market-buy',
      label: 'Future - Market Buy',
      description: 'Market future buy order for NinjaTrader.',
      assetType: 'future',
      orderType: 'market',
      defaultOrder: {
        orderType: 'market',
        assetType: 'future',
        action: 'buy',
        timeInForce: 'day',
        symbol: 'ES',
        orderQty: 1,
        isAutomated: true,
      },
    },
    {
      id: 'ninja_trader-future-limit-sell',
      label: 'Future - Limit Sell',
      description: 'Limit future sell order for NinjaTrader.',
      assetType: 'future',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'future',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'NQ',
        orderQty: 1,
        price: 15000.0,
        isAutomated: true,
      },
    },
    {
      id: 'ninja_trader-future-option-limit-buy',
      label: 'Future Option - Limit Buy',
      description: 'Limit future option buy order for NinjaTrader.',
      assetType: 'future_option',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'future_option',
        action: 'buy',
        timeInForce: 'day',
        symbol: 'ES',
        orderQty: 1,
        price: 50.0,
        expirationDate: '2025-06-20',
        strikePrice: 4000.0,
        optionType: 'call',
        isAutomated: true,
      },
    },
    {
      id: 'ninja_trader-crypto-market-buy',
      label: 'Crypto - Market Buy',
      description: 'Crypto market buy order for NinjaTrader.',
      assetType: 'crypto',
      orderType: 'market',
      defaultOrder: {
        orderType: 'market',
        assetType: 'crypto',
        action: 'buy',
        timeInForce: 'gtc',
        symbol: 'BTC',
        orderQty: 0.001,
        isAutomated: true,
      },
    },
    {
      id: 'ninja_trader-crypto-limit-sell',
      label: 'Crypto - Limit Sell',
      description: 'Crypto limit sell order for NinjaTrader.',
      assetType: 'crypto',
      orderType: 'limit',
      defaultOrder: {
        orderType: 'limit',
        assetType: 'crypto',
        action: 'sell',
        timeInForce: 'gtc',
        symbol: 'ETH',
        orderQty: 0.1,
        price: 3200.0,
        isAutomated: true,
      },
    },
  ],
};

/**
 * Build a preset payload for the given broker and account context.
 * Replaces expiration dates in equity_option orders with the provided expiration date.
 */
const buildPresetPayloadForContext = (
  brokerId: string,
  accountNumber: string | undefined,
  preset: OrderPresetConfig,
  equityOptionExpirationDate?: string
) => {
  const payload: any = {
    broker: brokerId,
    order: {
      ...preset.defaultOrder,
    },
  };

  // Account number goes at top level, not in order object
  if (accountNumber) {
    payload.accountNumber = accountNumber;
  }

  // Replace expiration dates in equity_option orders
  if (preset.assetType === 'equity_option' && equityOptionExpirationDate) {
    // Replace expirationDate in single-leg options
    if (payload.order.expirationDate) {
      payload.order.expirationDate = equityOptionExpirationDate;
    }

    // Replace expirationDate in spread legs
    if (payload.order.spread && Array.isArray(payload.order.spread)) {
      payload.order.spread = payload.order.spread.map((leg: any) => ({
        ...leg,
        expirationDate: equityOptionExpirationDate,
      }));
    }
  }

  return payload;
};

export function TradingPageComponent() {
  const { finatic, addLog } = useFinatic();
  const { mode } = useEnvironmentConfig();
  const isSandboxMode = mode === 'sandbox';

  // Broker and account selection
  const [selectedBroker, setSelectedBroker] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [brokers, setBrokers] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [activeAccounts, setActiveAccounts] = useState<any[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);

  // Order form state
  const [customOrder, setCustomOrder] = useState<{
    symbol: string;
    orderQty: number;
    action: 'buy' | 'sell';
    orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
    assetType: 'equity' | 'equity_option' | 'crypto' | 'forex' | 'future' | 'future_option';
    timeInForce: 'day' | 'gtc' | 'gtd' | 'ioc' | 'fok';
    price?: number;
    stopPrice?: number;
    expireTime?: string;
  }>({
    symbol: '',
    orderQty: 1,
    action: 'buy',
    orderType: 'market',
    assetType: 'equity',
    timeInForce: 'day',
  });

  // Broker-specific extras (JSON)
  const [customExtrasText, setCustomExtrasText] = useState<string>('{}');
  const [placingCustom, setPlacingCustom] = useState<boolean>(false);
  const [customResponse, setCustomResponse] = useState<any>(null);
  const [isOrdersPlaygroundOpen, setIsOrdersPlaygroundOpen] = useState(true);
  const [isOrderPresetsOpen, setIsOrderPresetsOpen] = useState(true);

  // Order presets state
  const [presetAssetFilter, setPresetAssetFilter] = useState<'all' | SupportedAssetType>('all');
  const [presetOrderTypeFilter, setPresetOrderTypeFilter] = useState<'all' | SupportedOrderType>(
    'all'
  );
  const [expandedPresetId, setExpandedPresetId] = useState<string | null>(null);
  const [presetPayloadTextById, setPresetPayloadTextById] = useState<Record<string, string>>({});
  const [placingPresetId, setPlacingPresetId] = useState<string | null>(null);
  const [presetResponseById, setPresetResponseById] = useState<Record<string, any>>({});
  const [expandedResponsePresetIds, setExpandedResponsePresetIds] = useState<Set<string>>(
    new Set()
  );
  const [equityOptionExpirationDate, setEquityOptionExpirationDate] =
    useState<string>(getNearestFriday());

  // Tab state
  const [activeTab, setActiveTab] = useState<'place' | 'cancel' | 'modify'>('place');

  // Cancel order state
  const [cancelOrderId, setCancelOrderId] = useState<string>('');
  const [cancellingOrder, setCancellingOrder] = useState<boolean>(false);
  const [cancelResponse, setCancelResponse] = useState<any>(null);

  // Modify order state
  const [modifyOrderId, setModifyOrderId] = useState<string>('');
  const [modifyOrder, setModifyOrder] = useState<{
    symbol: string;
    orderQty: number;
    action: 'buy' | 'sell';
    orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
    assetType: 'equity' | 'equity_option' | 'crypto' | 'forex' | 'future' | 'future_option';
    timeInForce: 'day' | 'gtc' | 'gtd' | 'ioc' | 'fok';
    price?: number;
    stopPrice?: number;
    expireTime?: string;
  }>({
    symbol: '',
    orderQty: 1,
    action: 'buy',
    orderType: 'market',
    assetType: 'equity',
    timeInForce: 'day',
  });
  const [modifyExtrasText, setModifyExtrasText] = useState<string>('{}');
  const [modifyingOrder, setModifyingOrder] = useState<boolean>(false);
  const [modifyResponse, setModifyResponse] = useState<any>(null);

  // Option fields for equity_option asset type
  type OptionFieldValues = {
    expirationDate: string;
    strikePrice: string;
    optionType: 'call' | 'put';
    positionEffect: 'open' | 'close';
  };

  const [customOptionFields, setCustomOptionFields] = useState<OptionFieldValues>({
    expirationDate: '',
    strikePrice: '',
    optionType: 'call',
    positionEffect: 'open',
  });
  const [modifyOptionFields, setModifyOptionFields] = useState<OptionFieldValues>({
    expirationDate: '',
    strikePrice: '',
    optionType: 'call',
    positionEffect: 'open',
  });

  const optionFieldsComplete = (fields: OptionFieldValues): boolean => {
    if (
      !fields.expirationDate ||
      !fields.strikePrice ||
      !fields.optionType ||
      !fields.positionEffect
    ) {
      return false;
    }
    const strikePriceNumber = Number(fields.strikePrice);
    return !Number.isNaN(strikePriceNumber);
  };

  const buildOptionPayload = (fields: OptionFieldValues) => ({
    expirationDate: fields.expirationDate,
    strikePrice: Number(fields.strikePrice),
    optionType: fields.optionType,
    positionEffect: fields.positionEffect,
  });

  // Reset option fields when asset type changes
  useEffect(() => {
    if (customOrder.assetType !== 'equity_option') {
      setCustomOptionFields({
        expirationDate: '',
        strikePrice: '',
        optionType: 'call',
        positionEffect: 'open',
      });
    }
  }, [customOrder.assetType]);

  useEffect(() => {
    if (modifyOrder.assetType !== 'equity_option') {
      setModifyOptionFields({
        expirationDate: '',
        strikePrice: '',
        optionType: 'call',
        positionEffect: 'open',
      });
    }
  }, [modifyOrder.assetType]);

  // Load supported brokers (exclude aliases and brokers that don't support trading)
  useEffect(() => {
    let cancelled = false;
    async function loadBrokers() {
      try {
        if (!finatic) return;
        const response = await finatic.getBrokers();
        const list = response?.success?.data || response;
        // Filter out aliases and brokers that don't support trading
        const brokerArray = Array.isArray(list) ? list : Object.values(list || {});
        const filteredList = brokerArray.filter(
          (broker: any) => broker.is_alias === false && broker.supports_trading === true
        );
        if (!cancelled) setBrokers(filteredList);
      } catch (err) {
        console.error('Failed to load brokers:', err);
      }
    }
    void loadBrokers();
    return () => {
      cancelled = true;
    };
  }, [finatic]);

  // Load active broker connections
  useEffect(() => {
    if (!finatic) return;
    let cancelled = false;
    async function loadConnections() {
      try {
        if (!finatic) return;
        const response = await finatic.getBrokerConnections();
        const list = response?.success?.data || response;
        if (!cancelled) {
          setConnections(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error('Failed to load connections:', err);
      }
    }
    void loadConnections();
    return () => {
      cancelled = true;
    };
  }, [finatic]);

  // Load active accounts
  useEffect(() => {
    if (!finatic) return;
    let cancelled = false;
    async function loadActiveAccounts() {
      try {
        if (!finatic) return;
        const response = await finatic.getAllAccounts();
        const all = response?.success?.data || response;
        const accounts = Array.isArray(all) ? all : [];
        // Filter active accounts
        const active = accounts.filter(
          (account: any) =>
            account.accountStatus === 'ACTIVE' ||
            account.status === 'ACTIVE' ||
            account.status === 'active' ||
            account.active === true
        );
        if (!cancelled) {
          setActiveAccounts(active);
        }
      } catch (err) {
        console.error('Failed to load active accounts:', err);
      }
    }
    void loadActiveAccounts();
    return () => {
      cancelled = true;
    };
  }, [finatic]);

  // Filter available accounts based on mode and selected broker
  const filteredAccounts = useMemo(() => {
    if (!selectedBroker) return [];

    const normalizedSelectedBroker = String(selectedBroker).toLowerCase().trim();

    // Create a map of connection_id -> broker_id from connections
    // Also create a set of connected connection IDs for the selected broker
    const connectionToBrokerMap = new Map<string, string>();
    const connectedConnectionIds = new Set<string>();

    connections.forEach((c: any) => {
      // Try multiple field names for connection ID (camelCase and snake_case)
      const connectionId = c?.id || c?.connectionId || c?.connection_id || '';
      // Try multiple field names for broker ID (camelCase and snake_case)
      const brokerId = String(c?.brokerId || c?.broker_id || c?.broker || '')
        .toLowerCase()
        .trim();
      const isConnected =
        c?.status === 'connected' ||
        c?.status === 'active' ||
        c?.status === 'ACTIVE' ||
        Boolean(c?.is_active || c?.active || c?.isActive);

      if (connectionId) {
        connectionToBrokerMap.set(connectionId, brokerId);
        if (isConnected && brokerId === normalizedSelectedBroker) {
          connectedConnectionIds.add(connectionId);
        }
      }
    });

    // Filter accounts based on their connection_id or broker_id
    return activeAccounts.filter((a: any) => {
      // Try multiple field names for connection ID (camelCase and snake_case)
      const accountConnectionId =
        a?.connectionId || a?.connection_id || a?.user_broker_connection_id || '';

      // Try multiple field names for broker ID (camelCase and snake_case)
      const accountBrokerId = String(a?.brokerId || a?.broker_id || a?.broker || '')
        .toLowerCase()
        .trim();

      // First, try to match by broker ID directly (most reliable)
      if (accountBrokerId === normalizedSelectedBroker) {
        // In sandbox mode, show all accounts for the selected broker
        if (isSandboxMode) {
          return true;
        }
        // In live mode, verify the connection is connected
        if (accountConnectionId) {
          return connectedConnectionIds.has(accountConnectionId);
        }
        // If no connection ID but broker matches, allow it (fallback)
        return true;
      }

      // Fallback: Match account to broker via connection map
      if (accountConnectionId) {
        const mappedBrokerId = connectionToBrokerMap.get(accountConnectionId);
        if (mappedBrokerId === normalizedSelectedBroker) {
          // In sandbox mode, show all accounts for the selected broker
          if (isSandboxMode) {
            return true;
          }
          // In live mode, verify the connection is connected
          return connectedConnectionIds.has(accountConnectionId);
        }
      }

      return false;
    });
  }, [selectedBroker, activeAccounts, connections, isSandboxMode]);

  // Update available accounts when filtered accounts change
  useEffect(() => {
    setAvailableAccounts(filteredAccounts);
    // Always auto-select first account when accounts change
    if (filteredAccounts.length > 0) {
      const firstAccount = filteredAccounts[0];
      const accountId = firstAccount.broker_provided_account_id || firstAccount.account_id || '';
      setSelectedAccountId(String(accountId));
    } else {
      // Clear selection if no accounts available
      setSelectedAccountId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredAccounts]); // Only depend on filteredAccounts, not selectedAccountId

  // Get selected account details
  const selectedAccount = useMemo(() => {
    return availableAccounts.find(
      (a: any) => String(a.broker_provided_account_id || a.account_id) === selectedAccountId
    );
  }, [availableAccounts, selectedAccountId]);

  // Check if broker is connected
  const isBrokerConnected = useMemo(() => {
    if (!selectedBroker) return false;
    return connections.some((c: any) => {
      // Normalize broker IDs for comparison (handle case sensitivity and format differences)
      const connectionBrokerId = String(c?.broker_id || c?.broker || '')
        .toLowerCase()
        .trim();
      const selectedBrokerId = String(selectedBroker).toLowerCase().trim();

      // Check if status is 'connected' (the actual field name from BrokerConnection type)
      const isConnected =
        c?.status === 'connected' || c?.status === 'active' || Boolean(c?.is_active || c?.active);

      return connectionBrokerId === selectedBrokerId && isConnected;
    });
  }, [selectedBroker, connections]);

  // Seed preset payloads when broker, account context, or expiration date changes
  useEffect(() => {
    if (!selectedBroker) {
      setPresetPayloadTextById({});
      setExpandedPresetId(null);
      return;
    }

    const presetsForBroker = BROKER_ORDER_PRESETS[selectedBroker] ?? [];

    setPresetPayloadTextById((previous) => {
      const next: Record<string, string> = {};
      const accountNumber =
        selectedAccount?.broker_provided_account_id ||
        selectedAccount?.account_id ||
        selectedAccountId ||
        '';

      for (const preset of presetsForBroker) {
        const existing = previous[preset.id];
        // Rebuild payload if it's an equity_option preset (to update expiration date)
        // or if it doesn't exist yet
        if (existing && preset.assetType !== 'equity_option') {
          next[preset.id] = existing;
        } else {
          const payload = buildPresetPayloadForContext(
            selectedBroker,
            accountNumber || undefined,
            preset,
            equityOptionExpirationDate
          );
          next[preset.id] = JSON.stringify(payload, null, 2);
        }
      }

      return next;
    });
  }, [selectedBroker, selectedAccount, selectedAccountId, equityOptionExpirationDate]);

  // Build the payload that will be sent (for preview)
  const orderPayloadPreview = useMemo(() => {
    if (!selectedBroker || !selectedAccountId) return null;

    const accountNumber =
      selectedAccount?.broker_provided_account_id ||
      selectedAccount?.account_id ||
      selectedAccountId;

    let extras: any = {};
    try {
      extras = customExtrasText ? JSON.parse(customExtrasText) : {};
    } catch {
      // Invalid JSON, return null to indicate error
      return null;
    }

    const payload: any = {
      broker: selectedBroker,
      order: {
        orderType: customOrder.orderType,
        assetType: customOrder.assetType,
        action: customOrder.action,
        timeInForce: customOrder.timeInForce,
        accountNumber: accountNumber,
        symbol: customOrder.symbol,
        orderQty: customOrder.orderQty,
      },
    };

    // Add optional fields to order object
    if (customOrder.price !== undefined) {
      payload.order.price = customOrder.price;
    }
    if (customOrder.stopPrice !== undefined) {
      payload.order.stopPrice = customOrder.stopPrice;
    }
    if (customOrder.expireTime) {
      payload.order.expireTime = customOrder.expireTime;
    }

    // Merge broker-specific extras into order object
    if (extras && Object.keys(extras).length > 0) {
      payload.order = { ...payload.order, ...extras };
    }

    // Add option fields if assetType is equity_option
    if (customOrder.assetType === 'equity_option' && optionFieldsComplete(customOptionFields)) {
      payload.order = {
        ...payload.order,
        ...buildOptionPayload(customOptionFields),
      };
    }

    return payload;
  }, [
    selectedBroker,
    selectedAccountId,
    selectedAccount,
    customOrder,
    customExtrasText,
    customOptionFields,
  ]);

  // Place custom order
  const placeCustomOrder = async () => {
    if (!finatic) {
      addLog('error', 'SDK not initialized');
      return;
    }
    if (!selectedBroker) {
      addLog('error', 'Select a broker first');
      return;
    }
    if (!selectedAccountId) {
      addLog('error', 'Select an account first');
      return;
    }

    // In live mode, verify broker is connected
    if (!isSandboxMode && !isBrokerConnected) {
      addLog('error', 'Broker must be connected to place orders in live mode');
      return;
    }

    let extras: any = {};
    try {
      extras = customExtrasText ? JSON.parse(customExtrasText) : {};
    } catch {
      addLog('error', 'Invalid JSON in extras');
      return;
    }

    setPlacingCustom(true);
    setCustomResponse(null);

    try {
      // Validate required fields
      if (!selectedBroker || selectedBroker.trim() === '') {
        throw new Error('Broker is required. Please select a broker.');
      }

      // Build order payload with flattened structure (new SDK format)
      const accountNumber =
        selectedAccount?.broker_provided_account_id ||
        selectedAccount?.account_id ||
        selectedAccountId;

      // Build flat order parameters
      // Double-check broker is still set (should be validated above, but be safe)
      const normalizedBroker =
        selectedBroker && selectedBroker.trim() !== '' ? selectedBroker.trim().toLowerCase() : '';

      if (!normalizedBroker) {
        throw new Error('Broker is required. Please select a broker.');
      }

      // Build nested structure: { broker, accountNumber, order: {...}, connectionId? }
      const orderObject: any = {
        orderType: customOrder.orderType,
        assetType: customOrder.assetType,
        action: customOrder.action,
        timeInForce: customOrder.timeInForce,
        symbol: customOrder.symbol,
        orderQty: customOrder.orderQty,
      };

      // Add optional fields to order object
      if (customOrder.price !== undefined) {
        orderObject.price = customOrder.price;
      }
      if (customOrder.stopPrice !== undefined) {
        orderObject.stopPrice = customOrder.stopPrice;
      }
      if (customOrder.expireTime) {
        orderObject.expireTime = customOrder.expireTime;
      }

      // Merge broker-specific extras into order object
      if (extras && Object.keys(extras).length > 0) {
        Object.assign(orderObject, extras);
      }

      // Add option fields if assetType is equity_option
      if (customOrder.assetType === 'equity_option' && optionFieldsComplete(customOptionFields)) {
        Object.assign(orderObject, buildOptionPayload(customOptionFields));
      }

      // Build final params with nested structure (accountNumber at top level)
      const orderParams: any = {
        broker: normalizedBroker, // Normalize broker name
        accountNumber: accountNumber, // Account number at top level
        order: orderObject,
      };

      // Note: connectionId is optional and can be added if needed

      // Debug: Log the order params being sent
      console.log('🔍 placeCustomOrder - orderParams:', JSON.stringify(orderParams, null, 2));
      console.log('🔍 placeCustomOrder - selectedBroker:', selectedBroker);

      // Use SDK's placeOrder method
      const response = await finatic.placeOrder(orderParams);

      setCustomResponse(response);
      addLog('success', `Order placed successfully - ${response?.success?.data?.message || 'ok'}`);
    } catch (e: any) {
      const errorMsg = e?.message || 'Order failed';
      setCustomResponse({ error: errorMsg });
      addLog('error', errorMsg);
    } finally {
      setPlacingCustom(false);
    }
  };

  /**
   * Place an order using a configured preset payload.
   */
  const placePresetOrder = useCallback(
    async (preset: OrderPresetConfig) => {
      if (!finatic) {
        addLog('error', 'SDK not initialized');
        return;
      }
      // Validate required fields
      if (!selectedBroker || selectedBroker.trim() === '') {
        addLog('error', 'Broker is required. Please select a broker.');
        return;
      }
      if (!selectedBroker) {
        addLog('error', 'Select a broker first');
        return;
      }
      if (!selectedAccountId) {
        addLog('error', 'Select an account first');
        return;
      }

      if (!isSandboxMode && !isBrokerConnected) {
        addLog('error', 'Broker must be connected to place orders from presets in live mode');
        return;
      }

      const accountNumber =
        selectedAccount?.broker_provided_account_id ||
        selectedAccount?.account_id ||
        selectedAccountId;

      let parsedPayload: any;
      try {
        const rawText =
          presetPayloadTextById[preset.id] ??
          JSON.stringify(
            buildPresetPayloadForContext(
              selectedBroker,
              accountNumber,
              preset,
              equityOptionExpirationDate
            ),
            null,
            2
          );
        parsedPayload = JSON.parse(rawText);
      } catch {
        addLog('error', 'Invalid JSON in preset payload');
        return;
      }

      if (!parsedPayload || typeof parsedPayload !== 'object') {
        addLog('error', 'Preset payload must be a JSON object');
        return;
      }

      // Build nested structure: { broker, order: {...}, connectionId? }
      // Extract order fields from parsedPayload (which may have nested structure)
      const orderData = parsedPayload.order || parsedPayload;

      // Use selectedBroker if it's set, otherwise try to get from payload
      // selectedBroker should always be set since we validate it above
      const brokerValue =
        selectedBroker && selectedBroker.trim() !== ''
          ? selectedBroker.trim().toLowerCase()
          : (orderData.broker || parsedPayload.broker || '').trim().toLowerCase();

      // Validate broker is set (double-check)
      if (!brokerValue || brokerValue === '') {
        addLog(
          'error',
          `Broker is required. selectedBroker="${selectedBroker}", orderData.broker="${orderData.broker}", parsedPayload.broker="${parsedPayload.broker}"`
        );
        return;
      }

      // Build order object (without accountNumber - it goes at top level)
      const orderObject: any = {
        orderType: orderData.orderType || preset.defaultOrder.orderType,
        assetType: orderData.assetType || preset.assetType,
        action: orderData.action || preset.defaultOrder.action,
        timeInForce: orderData.timeInForce || preset.defaultOrder.timeInForce,
        symbol: orderData.symbol || preset.defaultOrder.symbol,
        orderQty: orderData.orderQty || preset.defaultOrder.orderQty,
      };

      // Build final params with nested structure (accountNumber at top level)
      const orderParams: any = {
        broker: brokerValue, // Normalize broker name
        accountNumber: accountNumber || orderData.accountNumber, // Account number at top level
        order: orderObject,
      };

      // Add any optional fields from the preset payload to order object
      if (orderData.price !== undefined) {
        orderObject.price = orderData.price;
      }
      if (orderData.stopPrice !== undefined) {
        orderObject.stopPrice = orderData.stopPrice;
      }
      if (orderData.expireTime) {
        orderObject.expireTime = orderData.expireTime;
      }
      // Add any other fields from the preset to order object
      Object.keys(orderData).forEach((key) => {
        if (
          ![
            'accountNumber',
            'orderType',
            'assetType',
            'action',
            'timeInForce',
            'symbol',
            'orderQty',
            'price',
            'stopPrice',
            'expireTime',
            'broker',
          ].includes(key)
        ) {
          orderObject[key] = orderData[key];
        }
      });

      setPlacingPresetId(preset.id);
      setPresetResponseById((previous) => ({ ...previous, [preset.id]: null }));

      try {
        // Use SDK's placeOrder method
        const response = await finatic.placeOrder(orderParams);

        setPresetResponseById((previous) => ({ ...previous, [preset.id]: response }));
        setExpandedResponsePresetIds((previous) => new Set(previous).add(preset.id));
        setCustomResponse(response);
        addLog(
          'success',
          `Preset "${preset.label}" placed successfully - ${response?.success?.data?.message || 'ok'}`
        );
      } catch (error: any) {
        const errorMessage = error?.message || 'Preset order failed';
        const errorResponse = { error: errorMessage };
        setPresetResponseById((previous) => ({ ...previous, [preset.id]: errorResponse }));
        setExpandedResponsePresetIds((previous) => new Set(previous).add(preset.id));
        addLog('error', errorMessage);
      } finally {
        setPlacingPresetId((previousId) => (previousId === preset.id ? null : previousId));
      }
    },
    [
      finatic,
      addLog,
      selectedBroker,
      selectedAccountId,
      isSandboxMode,
      isBrokerConnected,
      selectedAccount,
      presetPayloadTextById,
      equityOptionExpirationDate,
    ]
  );

  // Cancel order
  const cancelOrder = async () => {
    if (!finatic) {
      addLog('error', 'SDK not initialized');
      return;
    }
    if (!cancelOrderId) {
      addLog('error', 'Enter an order ID to cancel');
      return;
    }

    setCancellingOrder(true);
    setCancelResponse(null);

    try {
      // Cancel order using FinaticConnect
      const response = await finatic.cancelOrder({ orderId: cancelOrderId });
      const result = response?.success?.data || response;

      setCancelResponse(result);
      addLog('success', `Order cancelled successfully - ${result?.message || 'ok'}`);
    } catch (e: any) {
      const errorMsg = e?.message || 'Cancel failed';
      setCancelResponse({ error: errorMsg });
      addLog('error', errorMsg);
    } finally {
      setCancellingOrder(false);
    }
  };

  // Build the URL preview for cancel order
  const cancelOrderUrlPreview = useMemo(() => {
    if (!cancelOrderId) return null;

    // New endpoint only requires order_id as path parameter
    // Backend infers broker, account, and connection from the order record
    return {
      method: 'DELETE',
      url: `/api/beta/brokers/orders/${cancelOrderId}`,
      body: null,
      queryParams: null,
    };
  }, [cancelOrderId]);

  // Build the payload for modify order (for preview)
  const modifyOrderPayloadPreview = useMemo(() => {
    if (!selectedBroker || !selectedAccountId || !modifyOrderId) return null;

    const accountNumber =
      selectedAccount?.broker_provided_account_id ||
      selectedAccount?.account_id ||
      selectedAccountId;

    let extras: any = {};
    try {
      extras = modifyExtrasText ? JSON.parse(modifyExtrasText) : {};
    } catch {
      // Invalid JSON, return null to indicate error
      return null;
    }

    // Build nested structure: { orderId, broker, accountNumber, order: {...}, connectionId? }
    const orderObject: any = {
      orderType: modifyOrder.orderType,
      assetType: modifyOrder.assetType,
      action: modifyOrder.action,
      timeInForce: modifyOrder.timeInForce,
      symbol: modifyOrder.symbol,
      orderQty: modifyOrder.orderQty,
    };

    // Add optional fields to order object
    if (modifyOrder.price !== undefined) {
      orderObject.price = modifyOrder.price;
    }
    if (modifyOrder.stopPrice !== undefined) {
      orderObject.stopPrice = modifyOrder.stopPrice;
    }
    if (modifyOrder.expireTime) {
      orderObject.expireTime = modifyOrder.expireTime;
    }

    // Merge broker-specific extras into order object
    if (extras && Object.keys(extras).length > 0) {
      Object.assign(orderObject, extras);
    }

    // Add option fields if assetType is equity_option
    if (modifyOrder.assetType === 'equity_option' && optionFieldsComplete(modifyOptionFields)) {
      Object.assign(orderObject, buildOptionPayload(modifyOptionFields));
    }

    // Build final params with nested structure (accountNumber at top level)
    const orderParams: any = {
      orderId: modifyOrderId,
      broker: selectedBroker.trim().toLowerCase(),
      accountNumber: accountNumber, // Account number at top level
      order: orderObject,
    };

    return orderParams;
  }, [
    selectedBroker,
    selectedAccountId,
    selectedAccount,
    modifyOrderId,
    modifyOrder,
    modifyExtrasText,
    modifyOptionFields,
  ]);

  // Modify order
  const modifyExistingOrder = async () => {
    if (!finatic) {
      addLog('error', 'SDK not initialized');
      return;
    }
    if (!selectedBroker) {
      addLog('error', 'Select a broker first');
      return;
    }
    if (!selectedAccountId) {
      addLog('error', 'Select an account first');
      return;
    }
    if (!modifyOrderId) {
      addLog('error', 'Enter an order ID to modify');
      return;
    }

    // In live mode, verify broker is connected
    if (!isSandboxMode && !isBrokerConnected) {
      addLog('error', 'Broker must be connected to modify orders in live mode');
      return;
    }

    let extras: any = {};
    try {
      extras = modifyExtrasText ? JSON.parse(modifyExtrasText) : {};
    } catch {
      addLog('error', 'Invalid JSON in extras');
      return;
    }

    setModifyingOrder(true);
    setModifyResponse(null);

    try {
      const accountNumber =
        selectedAccount?.broker_provided_account_id ||
        selectedAccount?.account_id ||
        selectedAccountId;

      // Build nested structure: { orderId, broker, accountNumber, order: {...}, connectionId? }
      const orderObject: any = {
        orderType: modifyOrder.orderType,
        assetType: modifyOrder.assetType,
        action: modifyOrder.action,
        timeInForce: modifyOrder.timeInForce,
        symbol: modifyOrder.symbol,
        orderQty: modifyOrder.orderQty,
      };

      // Add optional fields to order object
      if (modifyOrder.price !== undefined) {
        orderObject.price = modifyOrder.price;
      }
      if (modifyOrder.stopPrice !== undefined) {
        orderObject.stopPrice = modifyOrder.stopPrice;
      }
      if (modifyOrder.expireTime) {
        orderObject.expireTime = modifyOrder.expireTime;
      }

      // Merge broker-specific extras into order object
      if (extras && Object.keys(extras).length > 0) {
        Object.assign(orderObject, extras);
      }

      // Add option fields if assetType is equity_option
      if (modifyOrder.assetType === 'equity_option' && optionFieldsComplete(modifyOptionFields)) {
        Object.assign(orderObject, buildOptionPayload(modifyOptionFields));
      }

      // Build final params with nested structure (accountNumber at top level)
      const modifyParams: any = {
        orderId: modifyOrderId,
        broker: selectedBroker.trim().toLowerCase(),
        accountNumber: accountNumber, // Account number at top level
        order: orderObject,
      };

      // Use FinaticConnect modifyOrder - expects { orderId, ...modifications }
      const response = await finatic.modifyOrder({ orderId: modifyOrderId, ...orderObject });
      const result = response?.success?.data || response;

      setModifyResponse(result);
      addLog('success', `Order modified successfully - ${result?.message || 'ok'}`);
    } catch (e: any) {
      const errorMsg = e?.message || 'Modify failed';
      setModifyResponse({ error: errorMsg });
      addLog('error', errorMsg);
    } finally {
      setModifyingOrder(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Orders Playground
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Compose and place orders to connected broker accounts
          </p>
        </div>
        <div className="flex-shrink-0">
          {!isSandboxMode && (
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              Live Mode
            </Badge>
          )}
          {isSandboxMode && (
            <Badge
              variant="secondary"
              className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
            >
              Sandbox Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Orders Playground */}
      <Card className="bg-card border-border">
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
            onClick={() => setIsOrdersPlaygroundOpen(!isOrdersPlaygroundOpen)}
          >
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="text-left min-w-0 flex-1">
                <CardTitle className="text-foreground text-base sm:text-lg">
                  Orders Playground
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs sm:text-sm break-words">
                  Compose and place any order. Response shown on the right.
                </CardDescription>
              </div>
              <div className="flex-shrink-0 mt-0.5 self-start">
                {isOrdersPlaygroundOpen ? (
                  <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </Button>
        </CardHeader>
        {isOrdersPlaygroundOpen && (
          <CardContent className="space-y-4 sm:space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
                <TabsTrigger value="place" className="text-xs sm:text-sm">
                  Place Order
                </TabsTrigger>
                <TabsTrigger value="cancel" className="text-xs sm:text-sm">
                  Cancel Order
                </TabsTrigger>
                <TabsTrigger value="modify" className="text-xs sm:text-sm">
                  Modify Order
                </TabsTrigger>
              </TabsList>

              {/* Place Order Tab */}
              <TabsContent value="place" className="space-y-4 sm:space-y-6">
                {/* Broker and Account Selection */}
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground text-xs sm:text-sm">Broker</Label>
                    <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select a broker" />
                      </SelectTrigger>
                      <SelectContent>
                        {brokers.map((b: any) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.display_name || b.name || b.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedBroker && (
                      <div className="flex items-center gap-2">
                        {!isSandboxMode && isBrokerConnected && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Connected
                          </span>
                        )}
                        {!isSandboxMode && !isBrokerConnected && (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">
                            Not connected. Connect it first to place orders in live mode.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground text-xs sm:text-sm">Account</Label>
                    <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue
                          placeholder={
                            availableAccounts.length
                              ? 'Select an account'
                              : selectedBroker
                                ? 'No accounts available'
                                : 'Select broker first'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAccounts.map((a: any) => {
                          // Use the account's unique ID (UUID) as the key, with fallback to accountId
                          const uniqueKey =
                            a.id ||
                            a.accountId ||
                            a.broker_provided_account_id ||
                            a.account_id ||
                            '';
                          const accountId = String(
                            a.broker_provided_account_id || a.account_id || a.accountId || ''
                          );
                          const accountName =
                            a.account_name ||
                            a.accountName ||
                            a.broker_provided_account_id ||
                            a.account_id ||
                            a.accountId ||
                            'Unknown Account';
                          return (
                            <SelectItem key={uniqueKey} value={accountId}>
                              {accountName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedAccount && (
                      <p className="text-xs text-muted-foreground">
                        Account ID:{' '}
                        {selectedAccount.broker_provided_account_id || selectedAccount.account_id}
                      </p>
                    )}
                  </div>
                </div>

                {selectedBroker && availableAccounts.length === 0 && !isSandboxMode && (
                  <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-3">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      No accounts available for this broker. Make sure the broker is connected and
                      has active accounts.
                    </p>
                  </div>
                )}

                {/* Order Form */}
                {selectedBroker && availableAccounts.length > 0 && (
                  <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-foreground">Symbol</Label>
                          <Input
                            className="bg-input border-border text-foreground w-full"
                            value={customOrder.symbol}
                            onChange={(e) =>
                              setCustomOrder((p) => ({ ...p, symbol: e.target.value }))
                            }
                            placeholder="AAPL"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Quantity</Label>
                          <Input
                            type="number"
                            className="bg-input border-border text-foreground w-full"
                            value={customOrder.orderQty}
                            onChange={(e) =>
                              setCustomOrder((p) => ({ ...p, orderQty: Number(e.target.value) }))
                            }
                            min="1"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Side</Label>
                          <Select
                            value={customOrder.action}
                            onValueChange={(v) =>
                              setCustomOrder((p) => ({ ...p, action: v as any }))
                            }
                          >
                            <SelectTrigger className="bg-input border-border text-foreground w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buy">Buy</SelectItem>
                              <SelectItem value="sell">Sell</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Order Type</Label>
                          <Select
                            value={customOrder.orderType}
                            onValueChange={(v) =>
                              setCustomOrder((p) => ({ ...p, orderType: v as any }))
                            }
                          >
                            <SelectTrigger className="bg-input border-border text-foreground w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="market">Market</SelectItem>
                              <SelectItem value="limit">Limit</SelectItem>
                              <SelectItem value="stop">Stop</SelectItem>
                              <SelectItem value="stop_limit">Stop Limit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Asset Type</Label>
                          <Select
                            value={customOrder.assetType}
                            onValueChange={(v) =>
                              setCustomOrder((p) => ({ ...p, assetType: v as any }))
                            }
                          >
                            <SelectTrigger className="bg-input border-border text-foreground w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equity">Equity</SelectItem>
                              <SelectItem value="equity_option">Equity Option</SelectItem>
                              <SelectItem value="crypto">Crypto</SelectItem>
                              <SelectItem value="forex">Forex</SelectItem>
                              <SelectItem value="future">Future</SelectItem>
                              <SelectItem value="future_option">Future Option</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Time In Force</Label>
                          <Select
                            value={customOrder.timeInForce}
                            onValueChange={(v) =>
                              setCustomOrder((p) => ({ ...p, timeInForce: v as any }))
                            }
                          >
                            <SelectTrigger className="bg-input border-border text-foreground w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Day</SelectItem>
                              <SelectItem value="gtc">GTC (Good Till Cancel)</SelectItem>
                              <SelectItem value="gtd">GTD (Good Till Date)</SelectItem>
                              <SelectItem value="ioc">IOC (Immediate Or Cancel)</SelectItem>
                              <SelectItem value="fok">FOK (Fill Or Kill)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {(customOrder.orderType === 'limit' ||
                          customOrder.orderType === 'stop_limit') && (
                          <div className="space-y-1">
                            <Label className="text-foreground">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              className="bg-input border-border text-foreground w-full"
                              value={customOrder.price ?? ''}
                              onChange={(e) =>
                                setCustomOrder((p) => ({
                                  ...p,
                                  price: e.target.value ? Number(e.target.value) : undefined,
                                }))
                              }
                              placeholder="0.00"
                            />
                          </div>
                        )}
                        {(customOrder.orderType === 'stop' ||
                          customOrder.orderType === 'stop_limit') && (
                          <div className="space-y-1">
                            <Label className="text-foreground">Stop Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              className="bg-input border-border text-foreground w-full"
                              value={customOrder.stopPrice ?? ''}
                              onChange={(e) =>
                                setCustomOrder((p) => ({
                                  ...p,
                                  stopPrice: e.target.value ? Number(e.target.value) : undefined,
                                }))
                              }
                              placeholder="0.00"
                            />
                          </div>
                        )}
                        {customOrder.timeInForce === 'gtd' && (
                          <div className="space-y-1">
                            <Label className="text-foreground">Expire Time (ISO 8601)</Label>
                            <Input
                              type="datetime-local"
                              className="bg-input border-border text-foreground w-full"
                              value={
                                customOrder.expireTime
                                  ? new Date(customOrder.expireTime).toISOString().slice(0, 16)
                                  : ''
                              }
                              onChange={(e) => {
                                if (e.target.value) {
                                  const date = new Date(e.target.value);
                                  setCustomOrder((p) => ({
                                    ...p,
                                    expireTime: date.toISOString(),
                                  }));
                                } else {
                                  setCustomOrder((p) => ({ ...p, expireTime: undefined }));
                                }
                              }}
                            />
                          </div>
                        )}
                        {customOrder.assetType === 'equity_option' && (
                          <>
                            <div className="space-y-1">
                              <Label className="text-foreground">
                                Expiration Date (YYYY-MM-DD)
                              </Label>
                              <Input
                                type="date"
                                className="bg-input border-border text-foreground w-full"
                                value={customOptionFields.expirationDate}
                                onChange={(e) =>
                                  setCustomOptionFields((p) => ({
                                    ...p,
                                    expirationDate: e.target.value,
                                  }))
                                }
                                placeholder="2025-11-20"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-foreground">Strike Price</Label>
                              <Input
                                type="number"
                                step="0.01"
                                className="bg-input border-border text-foreground w-full"
                                value={customOptionFields.strikePrice}
                                onChange={(e) =>
                                  setCustomOptionFields((p) => ({
                                    ...p,
                                    strikePrice: e.target.value,
                                  }))
                                }
                                placeholder="10.00"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-foreground">Option Type</Label>
                              <Select
                                value={customOptionFields.optionType}
                                onValueChange={(v) =>
                                  setCustomOptionFields((p) => ({
                                    ...p,
                                    optionType: v as 'call' | 'put',
                                  }))
                                }
                              >
                                <SelectTrigger className="bg-input border-border text-foreground w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="call">Call</SelectItem>
                                  <SelectItem value="put">Put</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-foreground">Position Effect</Label>
                              <Select
                                value={customOptionFields.positionEffect}
                                onValueChange={(v) =>
                                  setCustomOptionFields((p) => ({
                                    ...p,
                                    positionEffect: v as 'open' | 'close',
                                  }))
                                }
                              >
                                <SelectTrigger className="bg-input border-border text-foreground w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="close">Close</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-foreground">Broker-Specific Extras (JSON)</Label>
                        <Textarea
                          className="bg-input border-border text-foreground min-h-24 font-mono text-xs"
                          value={customExtrasText}
                          onChange={(e) => setCustomExtrasText(e.target.value)}
                          placeholder='{"extendedHours": false, "marketHours": "regular_hours"}'
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional broker-specific fields (e.g., extendedHours for Robinhood,
                          accountSpec for NinjaTrader)
                        </p>
                      </div>

                      {/* Payload Preview */}
                      {orderPayloadPreview && (
                        <details className="rounded-md border border-border/60 bg-muted/10">
                          <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/20">
                            View Payload
                          </summary>
                          <div className="border-t border-border/60 p-3">
                            <pre className="whitespace-pre-wrap break-words text-xs text-foreground font-mono overflow-auto max-h-64">
                              {JSON.stringify(orderPayloadPreview, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                      {orderPayloadPreview === null && customExtrasText && (
                        <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-2">
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            Invalid JSON in extras field. Please fix the JSON syntax.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={placeCustomOrder}
                          disabled={
                            !selectedBroker ||
                            !selectedAccountId ||
                            !customOrder.symbol ||
                            placingCustom ||
                            (!isSandboxMode && !isBrokerConnected) ||
                            orderPayloadPreview === null
                          }
                          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
                        >
                          {placingCustom ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Placing...
                            </>
                          ) : (
                            <>Place Order</>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Response</Label>
                      <div className="rounded-md border border-border/60 bg-muted/10 p-3 max-h-96 overflow-auto text-xs text-foreground">
                        {customResponse ? (
                          <pre className="whitespace-pre-wrap break-words font-mono">
                            {JSON.stringify(customResponse, null, 2)}
                          </pre>
                        ) : (
                          <div className="text-muted-foreground">No response yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Cancel Order Tab */}
              <TabsContent value="cancel" className="space-y-4 sm:space-y-6">
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-foreground">Order ID</Label>
                      <Input
                        className="bg-input border-border text-foreground"
                        value={cancelOrderId}
                        onChange={(e) => setCancelOrderId(e.target.value)}
                        placeholder="Enter order ID to cancel"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the broker-provided order ID that you want to cancel. The backend will
                        automatically infer the broker, account, and connection from the order
                        record.
                      </p>
                    </div>

                    {/* URL Preview */}
                    {cancelOrderUrlPreview && (
                      <details className="rounded-md border border-border/60 bg-muted/10">
                        <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/20">
                          View Request Details
                        </summary>
                        <div className="border-t border-border/60 p-3">
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-semibold text-foreground">
                                Method:{' '}
                              </span>
                              <span className="text-xs text-foreground font-mono">
                                {cancelOrderUrlPreview.method}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-foreground">URL: </span>
                              <span className="text-xs text-foreground font-mono break-all">
                                {cancelOrderUrlPreview.url}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-foreground">Body: </span>
                              <span className="text-xs text-muted-foreground font-mono">null</span>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-foreground">
                                Query Params:{' '}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">null</span>
                            </div>
                          </div>
                        </div>
                      </details>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={cancelOrder}
                        disabled={!cancelOrderId || cancellingOrder}
                        variant="destructive"
                        className="h-9 px-4"
                      >
                        {cancellingOrder ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>Cancel Order</>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Response</Label>
                    <div className="rounded-md border border-border/60 bg-muted/10 p-3 max-h-96 overflow-auto text-xs text-foreground">
                      {cancelResponse ? (
                        <pre className="whitespace-pre-wrap break-words font-mono">
                          {JSON.stringify(cancelResponse, null, 2)}
                        </pre>
                      ) : (
                        <div className="text-muted-foreground">No response yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Modify Order Tab */}
              <TabsContent value="modify" className="space-y-4 sm:space-y-6">
                {/* Broker and Account Selection */}
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Broker</Label>
                    <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select a broker" />
                      </SelectTrigger>
                      <SelectContent>
                        {brokers.map((b: any) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.display_name || b.name || b.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedBroker && (
                      <div className="flex items-center gap-2">
                        {!isSandboxMode && isBrokerConnected && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Connected
                          </span>
                        )}
                        {!isSandboxMode && !isBrokerConnected && (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">
                            Not connected. Connect it first to modify orders in live mode.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Account</Label>
                    <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue
                          placeholder={
                            availableAccounts.length
                              ? 'Select an account'
                              : selectedBroker
                                ? 'No accounts available'
                                : 'Select broker first'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAccounts.map((a: any) => {
                          // Use the account's unique ID (UUID) as the key, with fallback to accountId
                          const uniqueKey =
                            a.id ||
                            a.accountId ||
                            a.broker_provided_account_id ||
                            a.account_id ||
                            '';
                          const accountId = String(
                            a.broker_provided_account_id || a.account_id || a.accountId || ''
                          );
                          const accountName =
                            a.account_name ||
                            a.accountName ||
                            a.broker_provided_account_id ||
                            a.account_id ||
                            a.accountId ||
                            'Unknown Account';
                          return (
                            <SelectItem key={uniqueKey} value={accountId}>
                              {accountName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedAccount && (
                      <p className="text-xs text-muted-foreground">
                        Account ID:{' '}
                        {selectedAccount.broker_provided_account_id || selectedAccount.account_id}
                      </p>
                    )}
                  </div>
                </div>

                {selectedBroker && availableAccounts.length === 0 && !isSandboxMode && (
                  <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-3">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      No accounts available for this broker. Make sure the broker is connected and
                      has active accounts.
                    </p>
                  </div>
                )}

                {selectedBroker && availableAccounts.length > 0 && (
                  <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-foreground">Order ID</Label>
                        <Input
                          className="bg-input border-border text-foreground"
                          value={modifyOrderId}
                          onChange={(e) => setModifyOrderId(e.target.value)}
                          placeholder="Enter order ID to modify"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the broker-provided order ID that you want to modify
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-foreground">Symbol</Label>
                          <Input
                            className="bg-input border-border text-foreground w-full"
                            value={modifyOrder.symbol}
                            onChange={(e) =>
                              setModifyOrder((p) => ({ ...p, symbol: e.target.value }))
                            }
                            placeholder="AAPL"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Quantity</Label>
                          <Input
                            type="number"
                            className="bg-input border-border text-foreground w-full"
                            value={modifyOrder.orderQty}
                            onChange={(e) =>
                              setModifyOrder((p) => ({ ...p, orderQty: Number(e.target.value) }))
                            }
                            min="1"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Side</Label>
                          <Select
                            value={modifyOrder.action}
                            onValueChange={(v) =>
                              setModifyOrder((p) => ({ ...p, action: v as any }))
                            }
                          >
                            <SelectTrigger className="bg-input border-border text-foreground w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buy">Buy</SelectItem>
                              <SelectItem value="sell">Sell</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Order Type</Label>
                          <Select
                            value={modifyOrder.orderType}
                            onValueChange={(v) =>
                              setModifyOrder((p) => ({ ...p, orderType: v as any }))
                            }
                          >
                            <SelectTrigger className="bg-input border-border text-foreground w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="market">Market</SelectItem>
                              <SelectItem value="limit">Limit</SelectItem>
                              <SelectItem value="stop">Stop</SelectItem>
                              <SelectItem value="stop_limit">Stop Limit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Asset Type</Label>
                          <Select
                            value={modifyOrder.assetType}
                            onValueChange={(v) =>
                              setModifyOrder((p) => ({ ...p, assetType: v as any }))
                            }
                          >
                            <SelectTrigger className="bg-input border-border text-foreground w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equity">Equity</SelectItem>
                              <SelectItem value="equity_option">Equity Option</SelectItem>
                              <SelectItem value="crypto">Crypto</SelectItem>
                              <SelectItem value="forex">Forex</SelectItem>
                              <SelectItem value="future">Future</SelectItem>
                              <SelectItem value="future_option">Future Option</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Time In Force</Label>
                          <Select
                            value={modifyOrder.timeInForce}
                            onValueChange={(v) =>
                              setModifyOrder((p) => ({ ...p, timeInForce: v as any }))
                            }
                          >
                            <SelectTrigger className="bg-input border-border text-foreground w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Day</SelectItem>
                              <SelectItem value="gtc">GTC (Good Till Cancel)</SelectItem>
                              <SelectItem value="gtd">GTD (Good Till Date)</SelectItem>
                              <SelectItem value="ioc">IOC (Immediate Or Cancel)</SelectItem>
                              <SelectItem value="fok">FOK (Fill Or Kill)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {(modifyOrder.orderType === 'limit' ||
                          modifyOrder.orderType === 'stop_limit') && (
                          <div className="space-y-1">
                            <Label className="text-foreground">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              className="bg-input border-border text-foreground w-full"
                              value={modifyOrder.price ?? ''}
                              onChange={(e) =>
                                setModifyOrder((p) => ({
                                  ...p,
                                  price: e.target.value ? Number(e.target.value) : undefined,
                                }))
                              }
                              placeholder="0.00"
                            />
                          </div>
                        )}
                        {(modifyOrder.orderType === 'stop' ||
                          modifyOrder.orderType === 'stop_limit') && (
                          <div className="space-y-1">
                            <Label className="text-foreground">Stop Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              className="bg-input border-border text-foreground w-full"
                              value={modifyOrder.stopPrice ?? ''}
                              onChange={(e) =>
                                setModifyOrder((p) => ({
                                  ...p,
                                  stopPrice: e.target.value ? Number(e.target.value) : undefined,
                                }))
                              }
                              placeholder="0.00"
                            />
                          </div>
                        )}
                        {modifyOrder.timeInForce === 'gtd' && (
                          <div className="space-y-1">
                            <Label className="text-foreground">Expire Time (ISO 8601)</Label>
                            <Input
                              type="datetime-local"
                              className="bg-input border-border text-foreground w-full"
                              value={
                                modifyOrder.expireTime
                                  ? new Date(modifyOrder.expireTime).toISOString().slice(0, 16)
                                  : ''
                              }
                              onChange={(e) => {
                                if (e.target.value) {
                                  const date = new Date(e.target.value);
                                  setModifyOrder((p) => ({
                                    ...p,
                                    expireTime: date.toISOString(),
                                  }));
                                } else {
                                  setModifyOrder((p) => ({ ...p, expireTime: undefined }));
                                }
                              }}
                            />
                          </div>
                        )}
                        {modifyOrder.assetType === 'equity_option' && (
                          <>
                            <div className="space-y-1">
                              <Label className="text-foreground">
                                Expiration Date (YYYY-MM-DD)
                              </Label>
                              <Input
                                type="date"
                                className="bg-input border-border text-foreground w-full"
                                value={modifyOptionFields.expirationDate}
                                onChange={(e) =>
                                  setModifyOptionFields((p) => ({
                                    ...p,
                                    expirationDate: e.target.value,
                                  }))
                                }
                                placeholder="2025-11-20"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-foreground">Strike Price</Label>
                              <Input
                                type="number"
                                step="0.01"
                                className="bg-input border-border text-foreground w-full"
                                value={modifyOptionFields.strikePrice}
                                onChange={(e) =>
                                  setModifyOptionFields((p) => ({
                                    ...p,
                                    strikePrice: e.target.value,
                                  }))
                                }
                                placeholder="10.00"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-foreground">Option Type</Label>
                              <Select
                                value={modifyOptionFields.optionType}
                                onValueChange={(v) =>
                                  setModifyOptionFields((p) => ({
                                    ...p,
                                    optionType: v as 'call' | 'put',
                                  }))
                                }
                              >
                                <SelectTrigger className="bg-input border-border text-foreground w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="call">Call</SelectItem>
                                  <SelectItem value="put">Put</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-foreground">Position Effect</Label>
                              <Select
                                value={modifyOptionFields.positionEffect}
                                onValueChange={(v) =>
                                  setModifyOptionFields((p) => ({
                                    ...p,
                                    positionEffect: v as 'open' | 'close',
                                  }))
                                }
                              >
                                <SelectTrigger className="bg-input border-border text-foreground w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="close">Close</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-foreground">Broker-Specific Extras (JSON)</Label>
                        <Textarea
                          className="bg-input border-border text-foreground min-h-24 font-mono text-xs"
                          value={modifyExtrasText}
                          onChange={(e) => setModifyExtrasText(e.target.value)}
                          placeholder='{"extendedHours": false, "marketHours": "regular_hours"}'
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional broker-specific fields (e.g., extendedHours for Robinhood,
                          accountSpec for NinjaTrader)
                        </p>
                      </div>

                      {/* Payload Preview */}
                      {modifyOrderPayloadPreview && (
                        <details className="rounded-md border border-border/60 bg-muted/10">
                          <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/20">
                            View Payload
                          </summary>
                          <div className="border-t border-border/60 p-3">
                            <pre className="whitespace-pre-wrap break-words text-xs text-foreground font-mono overflow-auto max-h-64">
                              {JSON.stringify(modifyOrderPayloadPreview, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                      {modifyOrderPayloadPreview === null && modifyExtrasText && (
                        <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-2">
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            Invalid JSON in extras field. Please fix the JSON syntax.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={modifyExistingOrder}
                          disabled={
                            !selectedBroker ||
                            !selectedAccountId ||
                            !modifyOrderId ||
                            !modifyOrder.symbol ||
                            modifyingOrder ||
                            (!isSandboxMode && !isBrokerConnected) ||
                            modifyOrderPayloadPreview === null
                          }
                          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
                        >
                          {modifyingOrder ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Modifying...
                            </>
                          ) : (
                            <>Modify Order</>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Response</Label>
                      <div className="rounded-md border border-border/60 bg-muted/10 p-3 max-h-96 overflow-auto text-xs text-foreground">
                        {modifyResponse ? (
                          <pre className="whitespace-pre-wrap break-words font-mono">
                            {JSON.stringify(modifyResponse, null, 2)}
                          </pre>
                        ) : (
                          <div className="text-muted-foreground">No response yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>

      {/* Order Presets */}
      <Card className="bg-card border-border">
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
            onClick={() => setIsOrderPresetsOpen(!isOrderPresetsOpen)}
          >
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="text-left min-w-0 flex-1">
                <CardTitle className="text-foreground text-base sm:text-lg">
                  Order Presets
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs sm:text-sm break-words">
                  Quickly send common broker-specific orders. Select a broker above, pick a preset,
                  inspect and edit the JSON payload, then place the order.
                </CardDescription>
              </div>
              <div className="flex-shrink-0 mt-0.5 self-start">
                {isOrderPresetsOpen ? (
                  <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </Button>
        </CardHeader>
        {isOrderPresetsOpen && (
          <CardContent className="space-y-4">
            {!selectedBroker && (
              <p className="text-sm text-muted-foreground">
                Select a broker in the Orders Playground to view presets.
              </p>
            )}

            {selectedBroker && (
              <>
                {!(BROKER_ORDER_PRESETS[selectedBroker]?.length ?? 0) && (
                  <p className="text-sm text-muted-foreground">
                    No presets available yet for this broker.
                  </p>
                )}

                {(BROKER_ORDER_PRESETS[selectedBroker]?.length ?? 0) > 0 && (
                  <>
                    {/* Filters */}
                    <div className="flex flex-col gap-3">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Showing presets for broker{' '}
                        <span className="font-medium text-foreground">{selectedBroker}</span>
                      </p>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div className="space-y-1 flex-1 sm:flex-initial">
                          <Label className="text-xs text-muted-foreground">Asset Class</Label>
                          <Select
                            value={presetAssetFilter}
                            onValueChange={(value) =>
                              setPresetAssetFilter(value as 'all' | SupportedAssetType)
                            }
                          >
                            <SelectTrigger className="bg-input border-border text-foreground h-8 w-full sm:w-40 text-xs sm:text-sm">
                              <SelectValue placeholder="All Asset Classes" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="equity">Equity</SelectItem>
                              <SelectItem value="equity_option">Equity Option</SelectItem>
                              <SelectItem value="crypto">Crypto</SelectItem>
                              <SelectItem value="forex">Forex</SelectItem>
                              <SelectItem value="future">Future</SelectItem>
                              <SelectItem value="future_option">Future Option</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1 flex-1 sm:flex-initial">
                          <Label className="text-xs text-muted-foreground">Order Type</Label>
                          <Select
                            value={presetOrderTypeFilter}
                            onValueChange={(value) =>
                              setPresetOrderTypeFilter(value as 'all' | SupportedOrderType)
                            }
                          >
                            <SelectTrigger className="bg-input border-border text-foreground h-8 w-full sm:w-40 text-xs sm:text-sm">
                              <SelectValue placeholder="All Order Types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="market">Market</SelectItem>
                              <SelectItem value="limit">Limit</SelectItem>
                              <SelectItem value="stop">Stop</SelectItem>
                              <SelectItem value="stop_limit">Stop Limit</SelectItem>
                              <SelectItem value="trailing_stop">Trailing Stop</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {presetAssetFilter === 'equity_option' && (
                          <div className="space-y-1 flex-1 sm:flex-initial">
                            <Label className="text-xs text-muted-foreground">Expiration Date</Label>
                            <Input
                              type="date"
                              className="bg-input border-border text-foreground h-8 w-full sm:w-40 text-xs sm:text-sm"
                              value={equityOptionExpirationDate}
                              onChange={(e) => setEquityOptionExpirationDate(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Sets expiration date for all equity option presets
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Presets list */}
                    <div className="space-y-3">
                      {(BROKER_ORDER_PRESETS[selectedBroker] ?? [])
                        .filter((preset) => {
                          if (
                            presetAssetFilter !== 'all' &&
                            preset.assetType !== presetAssetFilter
                          ) {
                            return false;
                          }
                          if (
                            presetOrderTypeFilter !== 'all' &&
                            preset.orderType !== presetOrderTypeFilter
                          ) {
                            return false;
                          }
                          return true;
                        })
                        .map((preset) => {
                          const isExpanded = expandedPresetId === preset.id;
                          const payloadText = presetPayloadTextById[preset.id] ?? '';

                          return (
                            <div
                              key={preset.id}
                              className="space-y-2 rounded-md border border-border/60 bg-muted/5 p-3"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1 min-w-0 flex-1">
                                  <p className="text-sm font-medium text-foreground break-words">
                                    {preset.label}
                                  </p>
                                  <button
                                    type="button"
                                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                                    onClick={() =>
                                      setExpandedPresetId((previous) =>
                                        previous === preset.id ? null : preset.id
                                      )
                                    }
                                  >
                                    {isExpanded ? 'Hide payload' : 'Show and edit payload JSON'}
                                  </button>
                                  <p className="text-xs text-muted-foreground break-words">
                                    {preset.description}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  className="h-8 px-3 text-xs w-full sm:w-auto flex-shrink-0"
                                  onClick={() => placePresetOrder(preset)}
                                  disabled={
                                    !selectedBroker ||
                                    !selectedAccountId ||
                                    (!isSandboxMode && !isBrokerConnected) ||
                                    placingPresetId === preset.id
                                  }
                                >
                                  {placingPresetId === preset.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                      Placing...
                                    </>
                                  ) : (
                                    <>Place Preset</>
                                  )}
                                </Button>
                              </div>

                              {isExpanded && (
                                <div className="space-y-1">
                                  <Textarea
                                    className="bg-input border-border text-foreground min-h-24 font-mono text-xs"
                                    value={payloadText}
                                    onChange={(event) =>
                                      setPresetPayloadTextById((previous) => ({
                                        ...previous,
                                        [preset.id]: event.target.value,
                                      }))
                                    }
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Payload must match the{' '}
                                    <span className="font-medium">
                                      order_place_query_params_request
                                    </span>{' '}
                                    structure for the selected broker. Broker and accountNumber are
                                    automatically aligned with your current selection when placing.
                                  </p>
                                </div>
                              )}

                              {/* Response Section */}
                              {presetResponseById[preset.id] && (
                                <div className="space-y-2 border-t border-border/60 pt-3">
                                  <button
                                    type="button"
                                    className="flex items-center gap-2 text-xs text-foreground font-medium hover:text-foreground/80 transition-colors"
                                    onClick={() =>
                                      setExpandedResponsePresetIds((previous) => {
                                        const next = new Set(previous);
                                        if (next.has(preset.id)) {
                                          next.delete(preset.id);
                                        } else {
                                          next.add(preset.id);
                                        }
                                        return next;
                                      })
                                    }
                                  >
                                    <span>Response</span>
                                    {expandedResponsePresetIds.has(preset.id) ? (
                                      <ChevronUp className="h-3 w-3" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3" />
                                    )}
                                  </button>
                                  {expandedResponsePresetIds.has(preset.id) && (
                                    <div className="rounded-md border border-border/60 bg-muted/10 p-3 max-h-64 overflow-auto">
                                      <pre className="whitespace-pre-wrap break-words text-xs text-foreground font-mono">
                                        {JSON.stringify(presetResponseById[preset.id], null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
