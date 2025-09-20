"use client"

import { useMemo } from "react"

import {
  MethodHarness,
  type MethodDefinition,
  type MethodGroup,
} from "@/app/(dashboard)/broker/_components/MethodHarness"

type FieldBag = Record<string, string>

function requireString(values: FieldBag | undefined, key: string, label: string) {
  const raw = values?.[key]?.trim()
  if (!raw) {
    throw new Error(`Enter a value for ${label}.`)
  }
  return raw
}

function optionalString(values: FieldBag | undefined, key: string) {
  const raw = values?.[key]?.trim()
  return raw ? raw : undefined
}

function requireNumber(values: FieldBag | undefined, key: string, label: string) {
  const raw = values?.[key]
  if (!raw || raw.trim() === "") {
    throw new Error(`Enter a numeric value for ${label}.`)
  }
  const parsed = Number(raw)
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number provided for ${label}.`)
  }
  return parsed
}

function parseSide(values: FieldBag | undefined, key = "side") {
  const raw = values?.[key]?.trim().toLowerCase()
  if (raw !== "buy" && raw !== "sell") {
    throw new Error("Side must be either 'buy' or 'sell'.")
  }
  return raw as "buy" | "sell"
}

function parseJson(raw?: string, label?: string) {
  if (!raw || !raw.trim()) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error(`Invalid JSON${label ? ` for ${label}` : ""}`)
  }
}

const baseOrderPayload = JSON.stringify(
  {
    symbol: "AAPL",
    quantity: 1,
    side: "buy",
    orderType: "market",
    timeInForce: "day",
    broker: "tasty_trade",
    assetType: "Stock",
  },
  null,
  2
)

const modifyOrderPayload = JSON.stringify(
  {
    orderId: "sample-order-id",
    modifications: {
      price: 120.5,
      quantity: 2,
      timeInForce: "gtc",
    },
    broker: "tasty_trade",
  },
  null,
  2
)

export function OrderExecutionLab() {
  const methodGroups = useMemo<MethodGroup[]>(() => {
    const groups: MethodGroup[] = []

    const contextMethods: MethodDefinition[] = [
      {
        key: "setBroker",
        label: "Set broker context",
        description: "Stores the default broker used for subsequent order helpers.",
        input: {
          type: "fields",
          fields: [
            {
              name: "broker",
              label: "Broker id",
              placeholder: "tasty_trade",
              defaultValue: "tasty_trade",
            },
          ],
        },
        run: ({ finatic, fieldValues }) => {
          const broker = requireString(fieldValues, "broker", "broker id")
          finatic.setBroker(broker)
          return finatic.getTradingContext()
        },
      },
      {
        key: "setAccount",
        label: "Set account context",
        description: "Caches the default account number for order helpers.",
        input: {
          type: "fields",
          fields: [
            {
              name: "accountNumber",
              label: "Account number",
              placeholder: "123456789",
            },
          ],
        },
        run: ({ finatic, fieldValues }) => {
          const account = requireString(fieldValues, "accountNumber", "account number")
          finatic.setAccount(account)
          return finatic.getTradingContext()
        },
      },
      {
        key: "getTradingContext",
        label: "Get trading context",
        description: "Displays the current broker + account context cache.",
        input: { type: "none" },
        run: ({ finatic }) => finatic.getTradingContext(),
      },
      {
        key: "clearTradingContext",
        label: "Clear trading context",
        description: "Removes the stored broker and account hints from the SDK.",
        input: { type: "none" },
        run: ({ finatic }) => {
          finatic.clearTradingContext()
          return finatic.getTradingContext()
        },
      },
    ]

    groups.push({
      key: "context",
      title: "Trading context",
      description: "Configure the default broker + account before placing orders.",
      methods: contextMethods,
    })

    const genericOrderMethods: MethodDefinition[] = [
      {
        key: "placeOrder",
        label: "Place generic order",
        description: "Low-level helper that accepts the cross-asset payload.",
        input: {
          type: "json",
          defaultValue: baseOrderPayload,
          placeholder: baseOrderPayload,
        },
        prepareArgs: ({ inputValue }) => {
          const payload = parseJson(inputValue, "order payload")
          if (!payload) {
            throw new Error("Provide a valid order payload.")
          }
          return [payload]
        },
      },
      {
        key: "cancelOrder",
        label: "Cancel order",
        description: "Cancels an existing order id (mock ids are accepted).",
        input: {
          type: "fields",
          fields: [
            { name: "orderId", label: "Order id", placeholder: "mock-order-id" },
            { name: "broker", label: "Broker (optional)", placeholder: "tasty_trade" },
            { name: "connectionId", label: "Connection id (optional)", placeholder: "connection-uuid" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const orderId = requireString(fieldValues, "orderId", "order id")
          const broker = optionalString(fieldValues, "broker")
          const connectionId = optionalString(fieldValues, "connectionId")
          return [orderId, broker, connectionId]
        },
      },
      {
        key: "modifyOrder",
        label: "Modify order",
        description: "Applies modifications to an existing order id.",
        input: {
          type: "json",
          defaultValue: modifyOrderPayload,
          placeholder: modifyOrderPayload,
        },
        prepareArgs: ({ inputValue }) => {
          const payload = parseJson(inputValue, "modification payload")
          if (!payload || typeof payload !== "object") {
            throw new Error("The modification payload must include orderId and modifications.")
          }
          const orderId = (payload as any).orderId ?? (payload as any).order_id
          if (!orderId || typeof orderId !== "string") {
            throw new Error("The payload must contain an orderId field.")
          }
          const modifications = (payload as any).modifications || {}
          const broker = (payload as any).broker
          const connectionId = (payload as any).connectionId ?? (payload as any).connection_id
          return [orderId, modifications, broker, connectionId]
        },
      },
    ]

    groups.push({
      key: "generic",
      title: "Order lifecycle",
      description: "Exercise the generic place, modify, and cancel flows.",
      methods: genericOrderMethods,
    })

    const stockMethods: MethodDefinition[] = [
      {
        key: "placeStockMarketOrder",
        label: "Stock market order",
        description: "Places a stock market order for the provided symbol.",
        input: {
          type: "fields",
          fields: [
            { name: "symbol", label: "Symbol", defaultValue: "AAPL" },
            { name: "quantity", label: "Quantity", defaultValue: "1", type: "number" },
            { name: "side", label: "Side", defaultValue: "buy" },
            { name: "broker", label: "Broker (optional)", placeholder: "tasty_trade" },
            { name: "account", label: "Account (optional)", placeholder: "123456" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const symbol = requireString(fieldValues, "symbol", "symbol")
          const quantity = requireNumber(fieldValues, "quantity", "quantity")
          const side = parseSide(fieldValues)
          const broker = optionalString(fieldValues, "broker")
          const account = optionalString(fieldValues, "account")
          return [symbol, quantity, side, broker, account]
        },
      },
      {
        key: "placeStockLimitOrder",
        label: "Stock limit order",
        description: "Places a stock limit order at the specified price.",
        input: {
          type: "fields",
          fields: [
            { name: "symbol", label: "Symbol", defaultValue: "AAPL" },
            { name: "quantity", label: "Quantity", defaultValue: "1", type: "number" },
            { name: "side", label: "Side", defaultValue: "buy" },
            { name: "price", label: "Limit price", defaultValue: "150", type: "number" },
            { name: "timeInForce", label: "Time in force", defaultValue: "gtc" },
            { name: "broker", label: "Broker (optional)", placeholder: "tasty_trade" },
            { name: "account", label: "Account (optional)", placeholder: "123456" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const symbol = requireString(fieldValues, "symbol", "symbol")
          const quantity = requireNumber(fieldValues, "quantity", "quantity")
          const side = parseSide(fieldValues)
          const price = requireNumber(fieldValues, "price", "limit price")
          const tif = requireString(fieldValues, "timeInForce", "time in force") as
            | "day"
            | "gtc"
            | "gtd"
            | "ioc"
            | "fok"
          const broker = optionalString(fieldValues, "broker")
          const account = optionalString(fieldValues, "account")
          return [symbol, quantity, side, price, tif, broker, account]
        },
      },
      {
        key: "placeStockStopOrder",
        label: "Stock stop order",
        description: "Places a stop order for the provided stop price.",
        input: {
          type: "fields",
          fields: [
            { name: "symbol", label: "Symbol", defaultValue: "AAPL" },
            { name: "quantity", label: "Quantity", defaultValue: "1", type: "number" },
            { name: "side", label: "Side", defaultValue: "sell" },
            { name: "stopPrice", label: "Stop price", defaultValue: "140", type: "number" },
            { name: "timeInForce", label: "Time in force", defaultValue: "gtc" },
            { name: "broker", label: "Broker (optional)", placeholder: "tasty_trade" },
            { name: "account", label: "Account (optional)", placeholder: "123456" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const symbol = requireString(fieldValues, "symbol", "symbol")
          const quantity = requireNumber(fieldValues, "quantity", "quantity")
          const side = parseSide(fieldValues)
          const stopPrice = requireNumber(fieldValues, "stopPrice", "stop price")
          const tif = requireString(fieldValues, "timeInForce", "time in force") as
            | "day"
            | "gtc"
            | "gtd"
            | "ioc"
            | "fok"
          const broker = optionalString(fieldValues, "broker")
          const account = optionalString(fieldValues, "account")
          return [symbol, quantity, side, stopPrice, tif, broker, account]
        },
      },
    ]

    groups.push({
      key: "stock",
      title: "Equity helpers",
      description: "Exercise stock-specific market, limit, and stop convenience helpers.",
      methods: stockMethods,
    })

    const cryptoMethods: MethodDefinition[] = [
      {
        key: "placeCryptoMarketOrder",
        label: "Crypto market order",
        description: "Places a crypto market order (broker optional).",
        input: {
          type: "fields",
          fields: [
            { name: "symbol", label: "Symbol", defaultValue: "BTC-USD" },
            { name: "quantity", label: "Quantity", defaultValue: "0.01", type: "number" },
            { name: "side", label: "Side", defaultValue: "buy" },
            { name: "broker", label: "Broker (optional)", placeholder: "coinbase" },
            { name: "account", label: "Account (optional)", placeholder: "crypto-account" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const symbol = requireString(fieldValues, "symbol", "symbol")
          const quantity = requireNumber(fieldValues, "quantity", "quantity")
          const side = parseSide(fieldValues)
          const broker = optionalString(fieldValues, "broker")
          const account = optionalString(fieldValues, "account")
          return [symbol, quantity, side, broker, account]
        },
      },
      {
        key: "placeCryptoLimitOrder",
        label: "Crypto limit order",
        description: "Places a crypto limit order at a specific price.",
        input: {
          type: "fields",
          fields: [
            { name: "symbol", label: "Symbol", defaultValue: "BTC-USD" },
            { name: "quantity", label: "Quantity", defaultValue: "0.01", type: "number" },
            { name: "side", label: "Side", defaultValue: "sell" },
            { name: "price", label: "Limit price", defaultValue: "70000", type: "number" },
            { name: "broker", label: "Broker (optional)", placeholder: "coinbase" },
            { name: "account", label: "Account (optional)", placeholder: "crypto-account" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const symbol = requireString(fieldValues, "symbol", "symbol")
          const quantity = requireNumber(fieldValues, "quantity", "quantity")
          const side = parseSide(fieldValues)
          const price = requireNumber(fieldValues, "price", "limit price")
          const broker = optionalString(fieldValues, "broker")
          const account = optionalString(fieldValues, "account")
          return [symbol, quantity, side, price, broker, account]
        },
      },
    ]

    groups.push({
      key: "crypto",
      title: "Crypto helpers",
      description: "Validate digital asset order helpers with mock payloads.",
      methods: cryptoMethods,
    })

    const optionsMethods: MethodDefinition[] = [
      {
        key: "placeOptionsMarketOrder",
        label: "Options market order",
        description: "Places an options market order using OCC symbols.",
        input: {
          type: "fields",
          fields: [
            {
              name: "symbol",
              label: "OCC symbol",
              defaultValue: "AAPL  240621C00195000",
            },
            { name: "quantity", label: "Quantity", defaultValue: "1", type: "number" },
            { name: "side", label: "Side", defaultValue: "buy" },
            { name: "broker", label: "Broker (optional)", placeholder: "tasty_trade" },
            { name: "account", label: "Account (optional)", placeholder: "options-account" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const symbol = requireString(fieldValues, "symbol", "symbol")
          const quantity = requireNumber(fieldValues, "quantity", "quantity")
          const side = parseSide(fieldValues)
          const broker = optionalString(fieldValues, "broker")
          const account = optionalString(fieldValues, "account")
          return [symbol, quantity, side, broker, account]
        },
      },
      {
        key: "placeOptionsLimitOrder",
        label: "Options limit order",
        description: "Places an options limit order at a target price.",
        input: {
          type: "fields",
          fields: [
            {
              name: "symbol",
              label: "OCC symbol",
              defaultValue: "AAPL  240621C00195000",
            },
            { name: "quantity", label: "Quantity", defaultValue: "1", type: "number" },
            { name: "side", label: "Side", defaultValue: "sell" },
            { name: "price", label: "Limit price", defaultValue: "2.5", type: "number" },
            { name: "timeInForce", label: "Time in force", defaultValue: "gtc" },
            { name: "broker", label: "Broker (optional)", placeholder: "tasty_trade" },
            { name: "account", label: "Account (optional)", placeholder: "options-account" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const symbol = requireString(fieldValues, "symbol", "symbol")
          const quantity = requireNumber(fieldValues, "quantity", "quantity")
          const side = parseSide(fieldValues)
          const price = requireNumber(fieldValues, "price", "limit price")
          const tif = requireString(fieldValues, "timeInForce", "time in force") as
            | "day"
            | "gtc"
            | "gtd"
            | "ioc"
            | "fok"
          const broker = optionalString(fieldValues, "broker")
          const account = optionalString(fieldValues, "account")
          return [symbol, quantity, side, price, tif, broker, account]
        },
      },
    ]

    groups.push({
      key: "options",
      title: "Options helpers",
      description: "Cover OCC symbology with market and limit helpers.",
      methods: optionsMethods,
    })

    const futuresMethods: MethodDefinition[] = [
      {
        key: "placeFuturesMarketOrder",
        label: "Futures market order",
        description: "Places a futures market order using the provided contract symbol.",
        input: {
          type: "fields",
          fields: [
            { name: "symbol", label: "Symbol", defaultValue: "MNQU5" },
            { name: "quantity", label: "Quantity", defaultValue: "1", type: "number" },
            { name: "side", label: "Side", defaultValue: "buy" },
            { name: "broker", label: "Broker (optional)", placeholder: "ninja_trader" },
            { name: "account", label: "Account (optional)", placeholder: "futures-account" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const symbol = requireString(fieldValues, "symbol", "symbol")
          const quantity = requireNumber(fieldValues, "quantity", "quantity")
          const side = parseSide(fieldValues)
          const broker = optionalString(fieldValues, "broker")
          const account = optionalString(fieldValues, "account")
          return [symbol, quantity, side, broker, account]
        },
      },
      {
        key: "placeFuturesLimitOrder",
        label: "Futures limit order",
        description: "Places a futures limit order at a target price.",
        input: {
          type: "fields",
          fields: [
            { name: "symbol", label: "Symbol", defaultValue: "MNQU5" },
            { name: "quantity", label: "Quantity", defaultValue: "1", type: "number" },
            { name: "side", label: "Side", defaultValue: "sell" },
            { name: "price", label: "Limit price", defaultValue: "1500", type: "number" },
            { name: "timeInForce", label: "Time in force", defaultValue: "day" },
            { name: "broker", label: "Broker (optional)", placeholder: "ninja_trader" },
            { name: "account", label: "Account (optional)", placeholder: "futures-account" },
          ],
        },
        prepareArgs: ({ fieldValues }) => {
          const symbol = requireString(fieldValues, "symbol", "symbol")
          const quantity = requireNumber(fieldValues, "quantity", "quantity")
          const side = parseSide(fieldValues)
          const price = requireNumber(fieldValues, "price", "limit price")
          const tif = requireString(fieldValues, "timeInForce", "time in force") as
            | "day"
            | "gtc"
            | "gtd"
            | "ioc"
            | "fok"
          const broker = optionalString(fieldValues, "broker")
          const account = optionalString(fieldValues, "account")
          return [symbol, quantity, side, price, tif, broker, account]
        },
      },
    ]

    groups.push({
      key: "futures",
      title: "Futures helpers",
      description: "Validate futures order helpers with default symbols.",
      methods: futuresMethods,
    })

    return groups
  }, [])

  return (
    <MethodHarness
      title="Order execution lab"
      description="Purpose-built surface for exercising every trading helper available in the Finatic SDK."
      methodGroups={methodGroups}
    />
  )
}

