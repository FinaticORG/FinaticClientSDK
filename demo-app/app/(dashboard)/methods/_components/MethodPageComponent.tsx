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
        key: 'getUserId',
        label: 'Get user id',
        description: 'Returns the current user id from the SDK session.',
        input: { type: 'none' },
      },
      {
        key: 'getSessionId',
        label: 'Get session id',
        description: 'Returns the current session ID from the SDK session.',
        input: { type: 'none' },
      },
      {
        key: 'getCompanyId',
        label: 'Get company id',
        description: 'Returns the current company ID from the SDK session.',
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
        key: 'getPortalUrl',
        label: 'Get portal URL',
        description: 'Returns the portal URL for authentication (server SDKs use this, client SDKs typically use openPortal).',
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
      {
        key: 'getCompany',
        label: 'Get company',
        description: 'Get public company details by ID.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'companyId',
              label: 'Company id',
              placeholder: 'company-uuid',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const value = fieldValues?.companyId?.trim();
          if (!value) {
            throw new Error('Enter a company id.');
          }
          return [{ companyId: value }];
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

    const transactionMethods: MethodDefinition[] = [
      {
        key: 'getTransactions',
        label: 'Get transactions',
        description:
          'Retrieves paginated transactions (deposits, withdrawals, dividends, transfers, etc.).',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder:
                '{"accountId":"","transactionType":"DIVIDEND","startDate":"","endDate":"","limit":50,"offset":0}',
              description:
                'Optional GetTransactionsParams (brokerId, connectionId, accountId, transactionType, dates, limit, offset, …).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return filter ? [filter] : [];
        },
      },
      {
        key: 'getAllTransactions',
        label: 'Get all transactions',
        description: 'Aggregates transactions by iterating across every page.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{"connectionId":"","accountId":""}',
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
      key: 'transactions',
      title: 'Transaction data',
      description: 'Cash movements and other non-order activity from broker connections.',
      methods: transactionMethods,
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
        description: 'Retrieves fills for a specific order by order ID.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'orderId',
              label: 'Order ID',
              placeholder: 'order-uuid',
              description: 'Required order ID.',
            },
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{}',
              description: 'Optional filter payload (JSON).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const orderId = fieldValues?.orderId?.trim();
          if (!orderId) {
            throw new Error('Enter an order ID.');
          }
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          const params: { orderId: string; connectionId?: string; limit?: number; offset?: number; includeMetadata?: boolean } = { orderId };
          if (filter && typeof filter === 'object' && !Array.isArray(filter)) {
            if (filter.connectionId != null) params.connectionId = String(filter.connectionId);
            if (filter.limit != null) params.limit = Number(filter.limit);
            if (filter.offset != null) params.offset = Number(filter.offset);
            if (filter.includeMetadata != null) params.includeMetadata = Boolean(filter.includeMetadata);
          }
          return [params];
        },
      },
      {
        key: 'getOrderEvents',
        label: 'Get order events',
        description: 'Retrieves events for a specific order by order ID.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'orderId',
              label: 'Order ID',
              placeholder: 'order-uuid',
              description: 'Required order ID.',
            },
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{}',
              description: 'Optional filter payload (JSON).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const orderId = fieldValues?.orderId?.trim();
          if (!orderId) {
            throw new Error('Enter an order ID.');
          }
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          const params: { orderId: string; connectionId?: string; limit?: number; offset?: number; includeMetadata?: boolean } = { orderId };
          if (filter && typeof filter === 'object' && !Array.isArray(filter)) {
            if (filter.connectionId != null) params.connectionId = String(filter.connectionId);
            if (filter.limit != null) params.limit = Number(filter.limit);
            if (filter.offset != null) params.offset = Number(filter.offset);
            if (filter.includeMetadata != null) params.includeMetadata = Boolean(filter.includeMetadata);
          }
          return [params];
        },
      },
      {
        key: 'getOrderGroups',
        label: 'Get order groups',
        description: 'Retrieves paginated order groups with built-in pagination controls.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{}',
              description: 'Optional filter payload (JSON).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return [filter];
        },
      },
      {
        key: 'getAllOrderGroups',
        label: 'Get all order groups',
        description: 'Aggregates order groups by iterating across every page.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{}',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return [filter];
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
        description: 'Retrieves paginated position lots with built-in pagination controls.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{}',
              description: 'Optional filter payload (JSON).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return [filter];
        },
      },
      {
        key: 'getAllPositionLots',
        label: 'Get all position lots',
        description: 'Aggregates position lots by iterating across every page.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{}',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return [filter];
        },
      },
      {
        key: 'getPositionLotFills',
        label: 'Get position lot fills',
        description: 'Retrieves fills for a specific position lot by lot ID.',
        input: {
          type: 'fields',
          fields: [
            {
              name: 'lotId',
              label: 'Lot ID',
              placeholder: 'lot-uuid',
              description: 'Required position lot ID.',
            },
            {
              name: 'filter',
              label: 'Filter JSON',
              placeholder: '{}',
              description: 'Optional filter payload (JSON).',
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const lotId = fieldValues?.lotId?.trim();
          if (!lotId) {
            throw new Error('Enter a lot ID.');
          }
          const filter = parseOptionalJson(fieldValues?.filter, 'filter');
          return [lotId, filter];
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
