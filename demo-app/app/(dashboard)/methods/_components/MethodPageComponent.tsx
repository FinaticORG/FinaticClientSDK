'use client';

import { useMemo } from 'react';

import {
  MethodHarness,
  type MethodDefinition,
  type MethodGroup,
} from '@/app/(dashboard)/methods/_components/MethodHarness';

function parseNumberField(
  values: Record<string, string> | undefined,
  key: string,
  fallback: number,
  label: string
) {
  const raw = values?.[key];
  if (raw == null || raw === '') {
    return fallback;
  }
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number for ${label}`);
  }
  return parsed;
}

function parseOptionalJson(raw?: string, label?: string) {
  if (!raw || !raw.trim()) return undefined;
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON${label ? ` for ${label}` : ''}`);
  }
}

export function MethodPageComponent() {
  const methodGroups = useMemo<MethodGroup[]>(() => {
    const groups: MethodGroup[] = [];

    const sessionMethods: MethodDefinition[] = [
      {
        key: 'setUserId',
        label: 'Set user id',
        description: 'Persists the provided user id into the active SDK session.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'userId',
              label: 'User id',
              placeholder: 'demo-user-123',
              defaultValue: 'demo-user-001',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const value = fieldValues?.userId?.trim();
          if (!value) {
            throw new Error('Please provide a user id before executing this method.');
          }
          return [value];
        },
      },
      {
        key: 'getUserId',
        label: 'Get user id',
        description: 'Returns the current user id from the SDK session.',
        input: { type: 'none' },
      },
      {
        key: 'isAuthed',
        label: 'Is authenticated?',
        description: 'Returns true when the SDK has an authenticated session.',
        input: { type: 'none' },
        methodName: 'isAuthenticated',
      },
      {
        key: 'openPortal',
        label: 'Open broker portal',
        description: 'Opens the hosted onboarding portal in a modal or new tab.',
        input: {
          type: 'json',
          defaultValue: JSON.stringify(
            {
              path: '/',
              mode: 'modal',
            },
            null,
            2
          ),
          placeholder: '{\n  "path": "/",\n  "mode": "modal"\n}',
        },
        prepareArgs: ({ inputValue }) => {
          const payload = parseOptionalJson(inputValue, 'portal options');
          return payload ? [payload] : [];
        },
      },
      {
        key: 'closePortal',
        label: 'Close portal',
        description: 'Closes the hosted onboarding portal.',
        input: { type: 'none' },
      },
      {
        key: 'disconnectCompany',
        label: 'Disconnect company',
        description: 'Calls the revoke endpoint for a connection id.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'connectionId',
              label: 'Connection id',
              placeholder: 'connection-uuid',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const value = fieldValues?.connectionId?.trim();
          if (!value) {
            throw new Error('Enter a connection id to disconnect.');
          }
          return [value];
        },
      },
    ];

    groups.push({
      key: 'session',
      title: 'Session & Portal',
      description: 'Manage authentication context and hosted portal lifecycle.',
      methods: sessionMethods,
    });

    const directoryMethods: MethodDefinition[] = [
      {
        key: 'getBrokerList',
        label: 'Get broker directory',
        description: 'Loads the supported broker catalogue (with CDN logo paths).',
        input: { type: 'none' },
      },
      {
        key: 'getBrokerConnections',
        label: 'Get broker connections',
        description: 'Retrieves active broker connections for the authenticated user.',
        input: { type: 'none' },
      },
    ];

    groups.push({
      key: 'directory',
      title: 'Broker directory',
      description: 'Inspect broker metadata and existing user connections.',
      methods: directoryMethods,
    });

    const accountMethods: MethodDefinition[] = [
      {
        key: 'getAccounts',
        label: 'Get accounts',
        description: 'Retrieves paginated accounts with built-in pagination controls.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{"status":"active"}',
              description: 'Optional filter payload (JSON).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return filter ? [filter] : [];
        },
      },
      {
        key: 'getActiveAccounts',
        label: 'Get active accounts',
        description: 'Returns only active accounts using the convenience helper.',
        input: { type: 'none' },
      },
      {
        key: 'getAllAccounts',
        label: 'Get all accounts',
        description: 'Iterates through pagination to return the full account list.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{"status":"active"}',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return filter ? [filter] : [];
        },
      },
    ];

    groups.push({
      key: 'accounts',
      title: 'Account data',
      description: 'Query accounts using filters, pagination, and aggregations.',
      methods: accountMethods,
    });

    const balanceMethods: MethodDefinition[] = [
      {
        key: 'getBalances',
        label: 'Get balances',
        description: 'High-level convenience helper that proxies to the balances endpoint.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{"currency":"USD"}',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return filter ? [filter] : [];
        },
      },
      {
        key: 'getAllBalances',
        label: 'Get all balances',
        description: 'Aggregates balances by iterating through pagination.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{"currency":"USD"}',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return filter ? [filter] : [];
        },
      },
    ];

    groups.push({
      key: 'balances',
      title: 'Balance data',
      description: 'Validate cash, margin, and buying power endpoints.',
      methods: balanceMethods,
    });

    const orderMethods: MethodDefinition[] = [
      {
        key: 'getOrders',
        label: 'Get orders',
        description: 'Retrieves paginated orders with built-in pagination controls.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{"status":"filled"}',
              description: 'Optional filter payload (JSON).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return filter ? [filter] : [];
        },
      },
      {
        key: 'getFilledOrders',
        label: 'Get filled orders',
        description: 'Convenience helper returning only filled orders.',
        input: { type: 'none' },
      },
      {
        key: 'getPendingOrders',
        label: 'Get pending orders',
        description: 'Convenience helper returning only pending orders.',
        input: { type: 'none' },
      },
      {
        key: 'getOrdersBySymbol',
        label: 'Get orders by symbol',
        description: 'Filters orders by symbol across all brokers.',
        input: {
          type: 'fields',
          fields: [{ name: 'symbol', label: 'Symbol', placeholder: 'AAPL', defaultValue: 'AAPL' }],
        },
        prepareArgs: ({ fieldValues }) => {
          const symbol = fieldValues?.symbol?.trim();
          if (!symbol) {
            throw new Error('Provide a symbol to query orders.');
          }
          return [symbol];
        },
      },
      {
        key: 'getOrdersByBroker',
        label: 'Get orders by broker',
        description: 'Returns orders for a specific broker id.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'brokerId',
              label: 'Broker id',
              placeholder: 'tasty_trade',
              defaultValue: 'tasty_trade',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const brokerId = fieldValues?.brokerId?.trim();
          if (!brokerId) {
            throw new Error('Provide a broker id to query orders.');
          }
          return [brokerId];
        },
      },
      {
        key: 'getAllOrders',
        label: 'Get all orders',
        description: 'Aggregates orders by iterating across every page.',
        input: {
          type: 'fields',
          fields: [{ name: 'filter', label: 'Filter JSON', placeholder: '{"status":"pending"}' }],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return filter ? [filter] : [];
        },
      },
      {
        key: 'getOrderFills',
        label: 'Get order fills',
        description: 'Retrieves execution fills for a specific order.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'orderId',
              label: 'Order id',
              placeholder: 'order-uuid',
              description: 'The order ID to get fills for.',
            },
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{"connection_id":"connection-uuid"}',
              description: 'Optional filter payload (JSON).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const orderId = fieldValues?.orderId?.trim();
          if (!orderId) {
            throw new Error('Please provide an order id.');
          }
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return [orderId, filter].filter(Boolean);
        },
      },
      {
        key: 'getOrderEvents',
        label: 'Get order events',
        description: 'Retrieves lifecycle events for a specific order.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'orderId',
              label: 'Order id',
              placeholder: 'order-uuid',
              description: 'The order ID to get events for.',
            },
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{"connection_id":"connection-uuid"}',
              description: 'Optional filter payload (JSON).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const orderId = fieldValues?.orderId?.trim();
          if (!orderId) {
            throw new Error('Please provide an order id.');
          }
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return [orderId, filter].filter(Boolean);
        },
      },
      {
        key: 'getOrderGroups',
        label: 'Get order groups',
        description: 'Retrieves order groups (related orders grouped together).',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{"broker_id":"robinhood","connection_id":"connection-uuid"}',
              description: 'Optional filter payload (JSON).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return filter ? [filter] : [];
        },
      },
    ];

    groups.push({
      key: 'orders',
      title: 'Order data',
      description: 'Validate historical, open, and paginated broker orders.',
      methods: orderMethods,
    });

    const positionMethods: MethodDefinition[] = [
      {
        key: 'getPositions',
        label: 'Get positions',
        description: 'Retrieves paginated positions with built-in pagination controls.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{"position_status":"open"}',
              description: 'Optional filter payload (JSON).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return filter ? [filter] : [];
        },
      },
      {
        key: 'getOpenPositions',
        label: 'Get open positions',
        description: 'Convenience helper returning only open positions.',
        input: { type: 'none' },
      },
      {
        key: 'getPositionsBySymbol',
        label: 'Get positions by symbol',
        description: 'Returns positions filtered by symbol.',
        input: {
          type: 'fields',
          fields: [{ name: 'symbol', label: 'Symbol', placeholder: 'AAPL', defaultValue: 'AAPL' }],
        },
        prepareArgs: ({ fieldValues }) => {
          const symbol = fieldValues?.symbol?.trim();
          if (!symbol) {
            throw new Error('Provide a symbol to query positions.');
          }
          return [symbol];
        },
      },
      {
        key: 'getPositionsByBroker',
        label: 'Get positions by broker',
        description: 'Returns positions scoped to a specific broker id.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'brokerId',
              label: 'Broker id',
              placeholder: 'tasty_trade',
              defaultValue: 'tasty_trade',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const brokerId = fieldValues?.brokerId?.trim();
          if (!brokerId) {
            throw new Error('Provide a broker id to query positions.');
          }
          return [brokerId];
        },
      },
      {
        key: 'getAllPositions',
        label: 'Get all positions',
        description: 'Aggregates positions across the full result set.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{"position_status":"open"}',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return filter ? [filter] : [];
        },
      },
      {
        key: 'getPositionLots',
        label: 'Get position lots',
        description: 'Retrieves position lots (tax lots) for positions. Essential for tax reporting.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{"broker_id":"robinhood","symbol":"AAPL","position_id":"position-uuid"}',
              description: 'Optional filter payload (JSON).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return filter ? [filter] : [];
        },
      },
      {
        key: 'getPositionLotFills',
        label: 'Get position lot fills',
        description: 'Retrieves fills for a specific position lot.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'lotId',
              label: 'Lot id',
              placeholder: 'lot-uuid',
              description: 'The position lot ID to get fills for.',
            },
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{"connection_id":"connection-uuid"}',
              description: 'Optional filter payload (JSON).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const lotId = fieldValues?.lotId?.trim();
          if (!lotId) {
            throw new Error('Please provide a lot id.');
          }
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return [lotId, filter].filter(Boolean);
        },
      },
    ];

    groups.push({
      key: 'positions',
      title: 'Position data',
      description: 'Inspect open, closed, and broker scoped positions.',
      methods: positionMethods,
    });

    return groups;
  }, []);

  return (
    <MethodHarness
      title="Finatic SDK Method lab"
      description="Interactive playground covering every broker data method exposed by the Finatic SDK."
      methodGroups={methodGroups}
    />
  );
}
