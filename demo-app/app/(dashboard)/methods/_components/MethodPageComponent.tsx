"use client"

import { useMemo } from "react"

import {
  MethodHarness,
  type MethodDefinition,
  type MethodGroup,
} from "@/app/(dashboard)/methods/_components/MethodHarness"

function parseNumberField(
  values: Record<string, string> | undefined,
  key: string,
  fallback: number,
  label: string
) {
  const raw = values?.[key]
  if (raw == null || raw === "") {
    return fallback
  }
  const parsed = Number(raw)
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number for ${label}`)
  }
  return parsed
}

function parseOptionalJson(raw?: string, label?: string) {
  if (!raw || !raw.trim()) return undefined
  try {
    return JSON.parse(raw)
  } catch (error) {
    throw new Error(`Invalid JSON${label ? ` for ${label}` : ""}`)
  }
}

export function MethodPageComponent() {
  const methodGroups = useMemo<MethodGroup[]>(() => {
    const groups: MethodGroup[] = []

    const sessionMethods: MethodDefinition[] = [
      {
        key: "setUserId",
        label: "Set user id",
        description: "Persists the provided user id into the active SDK session.",
        input: {
          type: "fields",
          fields: [
            {
              name: "userId",
              label: "User id",
              placeholder: "demo-user-123",
              defaultValue: "demo-user-001",
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const value = fieldValues?.userId?.trim()
          if (!value) {
            throw new Error("Please provide a user id before executing this method.")
          }
          return [value]
        },
      },
      {
        key: "getUserId",
        label: "Get user id",
        description: "Returns the current user id from the SDK session.",
        input: { type: "none" },
      },
      {
        key: "isAuthed",
        label: "Is authed?",
        description: "Returns true when the SDK has an authenticated session.",
        input: { type: "none" },
      },
      {
        key: "getSessionUser",
        label: "Get session user",
        description: "Fetches the hydrated session payload including issued tokens.",
        input: { type: "none" },
      },
      {
        key: "openPortal",
        label: "Open broker portal",
        description: "Opens the hosted onboarding portal in a modal or new tab.",
        input: {
          type: "json",
          defaultValue: JSON.stringify(
            {
              path: "/",
              mode: "modal",
            },
            null,
            2
          ),
          placeholder: "{\n  \"path\": \"/\",\n  \"mode\": \"modal\"\n}",
        },
        prepareArgs: ({ inputValue }) => {
          const payload = parseOptionalJson(inputValue, "portal options")
          return payload ? [payload] : []
        },
      },
      {
        key: "closePortal",
        label: "Close portal",
        description: "Closes the hosted onboarding portal.",
        input: { type: "none" },
      },
      {
        key: "disconnectCompany",
        label: "Disconnect company",
        description: "Calls the revoke endpoint for a connection id.",
        input: {
          type: "fields",
          fields: [
            {
              name: "connectionId",
              label: "Connection id",
              placeholder: "connection-uuid",
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const value = fieldValues?.connectionId?.trim()
          if (!value) {
            throw new Error("Enter a connection id to disconnect.")
          }
          return [value]
        },
      },
    ]

    groups.push({
      key: "session",
      title: "Session & Portal",
      description: "Manage authentication context and hosted portal lifecycle.",
      methods: sessionMethods,
    })

    const tradingContextMethods: MethodDefinition[] = [
      {
        key: "setTradingContextBroker",
        label: "Set trading context - broker",
        description: "Sets broker used for trading operations.",
        methodName: "setBroker",
        input: {
          type: "fields",
          fields: [
            { name: "broker", label: "Broker id", placeholder: "tasty_trade", defaultValue: "tasty_trade" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const broker = fieldValues?.broker?.trim()
          if (!broker) throw new Error("Provide a broker id")
          return [broker]
        },
      },
      {
        key: "setTradingContextAccount",
        label: "Set trading context - account",
        description: "Sets account used for trading operations.",
        methodName: "setAccount",
        input: {
          type: "fields",
          fields: [
            { name: "accountNumber", label: "Account number", placeholder: "12345", defaultValue: "12345" },
            { name: "accountId", label: "Account id (optional)", placeholder: "uuid-optional" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const accountNumber = fieldValues?.accountNumber?.trim()
          const accountId = fieldValues?.accountId?.trim()
          if (!accountNumber) throw new Error("Provide an account number")
          return accountId ? [accountNumber, accountId] : [accountNumber]
        },
      },
      {
        key: "getTradingContext",
        label: "Get trading context",
        description: "Returns current broker/account trading context.",
        input: { type: "none" },
      },
      {
        key: "clearTradingContext",
        label: "Clear trading context",
        description: "Clears current trading context.",
        input: { type: "none" },
      },
    ]

    groups.push({
      key: "tradingContext",
      title: "Trading context",
      description: "Manage broker and account context for trading APIs.",
      methods: tradingContextMethods,
    })

    const directoryMethods: MethodDefinition[] = [
      {
        key: "getBrokerList",
        label: "Get broker directory",
        description: "Loads the supported broker catalogue (with CDN logo paths).",
        input: { type: "none" },
      },
      {
        key: "getBrokerConnections",
        label: "Get broker connections",
        description: "Retrieves active broker connections for the authenticated user.",
        input: { type: "none" },
      },
    ]

    groups.push({
      key: "directory",
      title: "Broker directory",
      description: "Inspect broker metadata and existing user connections.",
      methods: directoryMethods,
    })

    const accountMethods: MethodDefinition[] = [
      {
        key: "getAccounts",
        label: "Get accounts",
        description: "Convenience wrapper around getAccountsPage with paging options.",
        input: {
          type: "fields",
          fields: [
            {
              name: "page",
              label: "Page",
              defaultValue: "1",
              type: "number",
            },
            {
              name: "perPage",
              label: "Per page",
              defaultValue: "25",
              type: "number",
            },
            {
              name: "filter",
              label: "Filter JSON",
              placeholder: "{\"status\":\"active\"}",
              description: "Optional filter payload (JSON).",
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const page = parseNumberField(fieldValues, "page", 1, "page")
          const perPage = parseNumberField(fieldValues, "perPage", 25, "per page")
          const filter = parseOptionalJson(fieldValues?.filter, "filter")
          return [{ page, perPage, filter }]
        },
      },
      {
        key: "getActiveAccounts",
        label: "Get active accounts",
        description: "Returns only active accounts using the convenience helper.",
        input: { type: "none" },
      },
      {
        key: "getAccountsPage",
        label: "Get accounts page",
        description: "Retrieves a paginated account page from the broker API.",
        input: {
          type: "fields",
          fields: [
            { name: "page", label: "Page", defaultValue: "1", type: "number" },
            { name: "perPage", label: "Per page", defaultValue: "1", type: "number" },
            {
              name: "filter",
              label: "Filter JSON",
              placeholder: "{\"status\":\"active\"}",
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const page = parseNumberField(fieldValues, "page", 1, "page")
          const perPage = parseNumberField(fieldValues, "perPage", 1, "per page")
          const filter = parseOptionalJson(fieldValues?.filter, "filter")
          return [page, perPage, filter]
        },
        onSuccess: (result, helpers) => {
          helpers.setPagination("accounts", result ?? null)
        },
      },
      {
        key: "getNextAccountsPage",
        label: "Get next accounts page",
        description: "Uses the stored pagination cursor from the previous accounts page.",
        input: { type: "none" },
        canRun: (context) => ({
          allowed: Boolean(context.pagination.accounts),
          reason: context.pagination.accounts
            ? undefined
            : "Run \"Get accounts page\" first to seed pagination.",
        }),
        prepareArgs: (_, context) => {
          const previous = context.pagination.accounts
          if (!previous) {
            throw new Error("No accounts page is cached yet. Run getAccountsPage first.")
          }
          return [previous]
        },
        onSuccess: (result, helpers) => {
          helpers.setPagination("accounts", result ?? null)
        },
      },
      {
        key: "getAllAccounts",
        label: "Get all accounts",
        description: "Iterates through pagination to return the full account list.",
        input: {
          type: "fields",
          fields: [
            {
              name: "filter",
              label: "Filter JSON",
              placeholder: "{\"status\":\"active\"}",
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, "filter")
          return filter ? [filter] : []
        },
      },
    ]

    groups.push({
      key: "accounts",
      title: "Account data",
      description: "Query accounts using filters, pagination, and aggregations.",
      methods: accountMethods,
    })

    const balanceMethods: MethodDefinition[] = [
      {
        key: "getBalances",
        label: "Get balances",
        description: "High-level convenience helper that proxies to the balances endpoint.",
        input: {
          type: "fields",
          fields: [
            {
              name: "filter",
              label: "Filter JSON",
              placeholder: "{\"currency\":\"USD\"}",
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, "filter")
          return filter ? [filter] : []
        },
      },
      {
        key: "getBalancesPage",
        label: "Get balances page",
        description: "Requests balance data with pagination metadata.",
        input: {
          type: "fields",
          fields: [
            { name: "page", label: "Page", defaultValue: "1", type: "number" },
            { name: "perPage", label: "Per page", defaultValue: "1", type: "number" },
            { name: "filter", label: "Filter JSON", placeholder: "{\"currency\":\"USD\"}" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const page = parseNumberField(fieldValues, "page", 1, "page")
          const perPage = parseNumberField(fieldValues, "perPage", 1, "per page")
          const filter = parseOptionalJson(fieldValues?.filter, "filter")
          return [page, perPage, filter]
        },
        onSuccess: (result, helpers) => {
          helpers.setPagination("balances", result ?? null)
        },
      },
      {
        key: "getNextBalancesPage",
        label: "Get next balances page",
        description: "Loads the next page using the stored balances pagination state.",
        input: { type: "none" },
        canRun: (context) => ({
          allowed: Boolean(context.pagination.balances),
          reason: context.pagination.balances
            ? undefined
            : "Run \"Get balances page\" first to seed pagination.",
        }),
        prepareArgs: (_, context) => {
          const previous = context.pagination.balances
          if (!previous) {
            throw new Error("No balances page cached yet. Run getBalancesPage first.")
          }
          return [previous]
        },
        onSuccess: (result, helpers) => {
          helpers.setPagination("balances", result ?? null)
        },
      },
      {
        key: "getAllBalances",
        label: "Get all balances",
        description: "Aggregates balances by iterating through pagination.",
        input: {
          type: "fields",
          fields: [
            {
              name: "filter",
              label: "Filter JSON",
              placeholder: "{\"currency\":\"USD\"}",
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, "filter")
          return filter ? [filter] : []
        },
      },
    ]

    groups.push({
      key: "balances",
      title: "Balance data",
      description: "Validate cash, margin, and buying power endpoints.",
      methods: balanceMethods,
    })

    const orderMethods: MethodDefinition[] = [
      {
        key: "getOrders",
        label: "Get orders",
        description: "Primary method for paginated order retrieval.",
        input: {
          type: "fields",
          fields: [
            { name: "page", label: "Page", defaultValue: "1", type: "number" },
            { name: "perPage", label: "Per page", defaultValue: "25", type: "number" },
            {
              name: "filter",
              label: "Filter JSON",
              placeholder: "{\"status\":\"filled\"}",
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const page = parseNumberField(fieldValues, "page", 1, "page")
          const perPage = parseNumberField(fieldValues, "perPage", 25, "per page")
          const filter = parseOptionalJson(fieldValues?.filter, "filter")
          return [{ page, perPage, filter }]
        },
      },
      {
        key: "getFilledOrders",
        label: "Get filled orders",
        description: "Convenience helper returning only filled orders.",
        input: { type: "none" },
      },
      {
        key: "getPendingOrders",
        label: "Get pending orders",
        description: "Convenience helper returning only pending orders.",
        input: { type: "none" },
      },
      {
        key: "getOrdersBySymbol",
        label: "Get orders by symbol",
        description: "Filters orders by symbol across all brokers.",
        input: {
          type: "fields",
          fields: [
            { name: "symbol", label: "Symbol", placeholder: "AAPL", defaultValue: "AAPL" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const symbol = fieldValues?.symbol?.trim()
          if (!symbol) {
            throw new Error("Provide a symbol to query orders.")
          }
          return [symbol]
        },
      },
      {
        key: "getOrdersByBroker",
        label: "Get orders by broker",
        description: "Returns orders for a specific broker id.",
        input: {
          type: "fields",
          fields: [
            { name: "brokerId", label: "Broker id", placeholder: "tasty_trade" , defaultValue: "tasty_trade" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const brokerId = fieldValues?.brokerId?.trim()
          if (!brokerId) {
            throw new Error("Provide a broker id to query orders.")
          }
          return [brokerId]
        },
      },
      {
        key: "getOrdersPage",
        label: "Get orders page",
        description: "Retrieves paginated orders directly from the broker API.",
        input: {
          type: "fields",
          fields: [
            { name: "page", label: "Page", defaultValue: "1", type: "number" },
            { name: "perPage", label: "Per page", defaultValue: "1", type: "number" },
            { name: "filter", label: "Filter JSON", placeholder: "{\"status\":\"pending\"}" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const page = parseNumberField(fieldValues, "page", 1, "page")
          const perPage = parseNumberField(fieldValues, "perPage", 1, "per page")
          const filter = parseOptionalJson(fieldValues?.filter, "filter")
          return [page, perPage, filter]
        },
        onSuccess: (result, helpers) => {
          helpers.setPagination("orders", result ?? null)
        },
      },
      {
        key: "getNextOrdersPage",
        label: "Get next orders page",
        description: "Traverses to the next orders page using cached pagination.",
        input: { type: "none" },
        canRun: (context) => ({
          allowed: Boolean(context.pagination.orders),
          reason: context.pagination.orders
            ? undefined
            : "Run \"Get orders page\" first to seed pagination.",
        }),
        prepareArgs: (_, context) => {
          const previous = context.pagination.orders
          if (!previous) {
            throw new Error("No orders page cached yet. Run getOrdersPage first.")
          }
          return [previous]
        },
        onSuccess: (result, helpers) => {
          helpers.setPagination("orders", result ?? null)
        },
      },
      {
        key: "getAllOrders",
        label: "Get all orders",
        description: "Aggregates orders by iterating across every page.",
        input: {
          type: "fields",
          fields: [
            { name: "filter", label: "Filter JSON", placeholder: "{\"status\":\"pending\"}" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, "filter")
          return filter ? [filter] : []
        },
      },
    ]

    groups.push({
      key: "orders",
      title: "Order data",
      description: "Validate historical, open, and paginated broker orders.",
      methods: orderMethods,
    })

    const positionMethods: MethodDefinition[] = [
      {
        key: "getPositions",
        label: "Get positions",
        description: "Primary method for paginated position retrieval.",
        input: {
          type: "fields",
          fields: [
            { name: "page", label: "Page", defaultValue: "1", type: "number" },
            { name: "perPage", label: "Per page", defaultValue: "25", type: "number" },
            {
              name: "filter",
              label: "Filter JSON",
              placeholder: "{\"position_status\":\"open\"}",
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const page = parseNumberField(fieldValues, "page", 1, "page")
          const perPage = parseNumberField(fieldValues, "perPage", 25, "per page")
          const filter = parseOptionalJson(fieldValues?.filter, "filter")
          return [{ page, perPage, filter }]
        },
      },
      {
        key: "getOpenPositions",
        label: "Get open positions",
        description: "Convenience helper returning only open positions.",
        input: { type: "none" },
      },
      {
        key: "getPositionsBySymbol",
        label: "Get positions by symbol",
        description: "Returns positions filtered by symbol.",
        input: {
          type: "fields",
          fields: [
            { name: "symbol", label: "Symbol", placeholder: "AAPL" , defaultValue: "AAPL" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const symbol = fieldValues?.symbol?.trim()
          if (!symbol) {
            throw new Error("Provide a symbol to query positions.")
          }
          return [symbol]
        },
      },
      {
        key: "getPositionsByBroker",
        label: "Get positions by broker",
        description: "Returns positions scoped to a specific broker id.",
        input: {
          type: "fields",
          fields: [
            { name: "brokerId", label: "Broker id", placeholder: "tasty_trade" , defaultValue: "tasty_trade" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const brokerId = fieldValues?.brokerId?.trim()
          if (!brokerId) {
            throw new Error("Provide a broker id to query positions.")
          }
          return [brokerId]
        },
      },
      {
        key: "getPositionsPage",
        label: "Get positions page",
        description: "Fetches paginated positions with metadata.",
        input: {
          type: "fields",
          fields: [
            { name: "page", label: "Page", defaultValue: "1", type: "number" },
            { name: "perPage", label: "Per page", defaultValue: "1", type: "number" },
            {
              name: "filter",
              label: "Filter JSON",
              placeholder: "{\"position_status\":\"open\"}",
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const page = parseNumberField(fieldValues, "page", 1, "page")
          const perPage = parseNumberField(fieldValues, "perPage", 1, "per page")
          const filter = parseOptionalJson(fieldValues?.filter, "filter")
          return [page, perPage, filter]
        },
        onSuccess: (result, helpers) => {
          helpers.setPagination("positions", result ?? null)
        },
      },
      {
        key: "getNextPositionsPage",
        label: "Get next positions page",
        description: "Retrieves the next positions page using cached pagination.",
        input: { type: "none" },
        canRun: (context) => ({
          allowed: Boolean(context.pagination.positions),
          reason: context.pagination.positions
            ? undefined
            : "Run \"Get positions page\" first to seed pagination.",
        }),
        prepareArgs: (_, context) => {
          const previous = context.pagination.positions
          if (!previous) {
            throw new Error("No positions page cached yet. Run getPositionsPage first.")
          }
          return [previous]
        },
        onSuccess: (result, helpers) => {
          helpers.setPagination("positions", result ?? null)
        },
      },
      {
        key: "getAllPositions",
        label: "Get all positions",
        description: "Aggregates positions across the full result set.",
        input: {
          type: "fields",
          fields: [
            {
              name: "filter",
              label: "Filter JSON",
              placeholder: "{\"position_status\":\"open\"}",
            },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const filter = parseOptionalJson(fieldValues?.filter, "filter")
          return filter ? [filter] : []
        },
      },
    ]

    groups.push({
      key: "positions",
      title: "Position data",
      description: "Inspect open, closed, and broker scoped positions.",
      methods: positionMethods,
    })

    return groups
  }, [])

  return (
    <MethodHarness
      title="Finatic SDK Method lab"
      description="Interactive playground covering every broker data method exposed by the Finatic SDK."
      methodGroups={methodGroups}
    />
  )
}

