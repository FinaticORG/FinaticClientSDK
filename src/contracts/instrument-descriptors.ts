import type {
  AccountOrderCommandRequest as GeneratedAccountOrderCommandRequest,
  AccountOrderPayload as GeneratedAccountOrderPayload,
  FDXBrokerOrder as GeneratedFDXBrokerOrder,
  FDXBrokerOrderCommandResult as GeneratedFDXBrokerOrderCommandResult,
  FDXBrokerOrderEvent as GeneratedFDXBrokerOrderEvent,
  FDXBrokerOrderFill as GeneratedFDXBrokerOrderFill,
  FDXBrokerPosition as GeneratedFDXBrokerPosition,
  FDXBrokerPositionLot as GeneratedFDXBrokerPositionLot,
  FDXBrokerPositionLotFill as GeneratedFDXBrokerPositionLotFill,
  FDXFutureInstrumentDetails,
  FDXInstrumentDescriptor,
  FDXOrderLeg as GeneratedFDXOrderLeg,
} from '../openapi/models';

type Override<T, TFields> = Omit<T, keyof TFields> & TFields;
type FDXDecimal = string | number;

/**
 * Public adaptations for OpenAPI 3.1 `anyOf` primitive schemas that
 * OpenAPI Generator 7.22 emits as structurally empty interfaces.
 *
 * The generated transport models remain untouched. These types preserve the
 * exact wire contract from the pinned API artifact at the package boundary.
 */
export type FDXOrderLeg = Override<
  GeneratedFDXOrderLeg,
  {
    assetType: string;
    averageFillPrice?: FDXDecimal | null;
    filledQuantity?: FDXDecimal | null;
    futureUnderlyingAssetType?: string | null;
    limitPrice?: FDXDecimal | null;
    notional?: FDXDecimal | null;
    positionIntent?: string | null;
    quantity: FDXDecimal;
    remainingQuantity?: FDXDecimal | null;
    securityIdType: string;
    side: string;
    stopPrice?: FDXDecimal | null;
    strikePrice?: FDXDecimal | null;
  }
>;

export type FDXBrokerOrder = Override<
  GeneratedFDXBrokerOrder,
  {
    commission?: FDXDecimal | null;
    legs?: FDXOrderLeg[];
    orderClass?: string | null;
    orderType?: string | null;
    status: string;
    timeInForce?: string | null;
  }
>;

export type FDXBrokerOrderFill = Override<
  GeneratedFDXBrokerOrderFill,
  {
    assetType: string;
    commission?: FDXDecimal | null;
    price: FDXDecimal;
    quantity: FDXDecimal;
    securityIdType: string;
    side: string;
  }
>;

export type FDXBrokerOrderEvent = Override<
  GeneratedFDXBrokerOrderEvent,
  {
    eventType: string;
    orderStatus?: string | null;
    previousStatus?: string | null;
  }
>;

export type FDXBrokerPosition = Override<
  GeneratedFDXBrokerPosition,
  {
    assetType: string;
    averageBuyPrice?: FDXDecimal | null;
    averageSellPrice?: FDXDecimal | null;
    costBasis?: FDXDecimal | null;
    costBasisWithCommission?: FDXDecimal | null;
    currentPrice?: FDXDecimal | null;
    marketValue?: FDXDecimal | null;
    quantity: FDXDecimal;
    realizedProfitLoss?: FDXDecimal | null;
    realizedProfitLossPercent?: FDXDecimal | null;
    realizedProfitLossWithCommission?: FDXDecimal | null;
    securityIdType: string;
    side?: string | null;
    status?: string | null;
    units?: FDXDecimal | null;
    unrealizedProfitLoss?: FDXDecimal | null;
    unrealizedProfitLossPercent?: FDXDecimal | null;
  }
>;

export type FDXBrokerPositionLotFill = Override<
  GeneratedFDXBrokerPositionLotFill,
  {
    commissionShare?: FDXDecimal | null;
    fillPrice: FDXDecimal;
    fillQuantity: FDXDecimal;
  }
>;

export type FDXBrokerPositionLot = Override<
  GeneratedFDXBrokerPositionLot,
  {
    assetType: string;
    closePriceAvg?: FDXDecimal | null;
    closedQuantity: FDXDecimal;
    costBasis: FDXDecimal;
    costBasisWithCommission: FDXDecimal;
    openPrice: FDXDecimal;
    openQuantity: FDXDecimal;
    positionLotFills?: FDXBrokerPositionLotFill[];
    realizedProfitLoss: FDXDecimal;
    realizedProfitLossWithCommission: FDXDecimal;
    remainingQuantity: FDXDecimal;
    side?: string | null;
  }
>;

export type AccountOrderPayload = Override<
  GeneratedAccountOrderPayload,
  {
    finaticInstrumentId?: string | null;
    instrumentId?: string | number | null;
  }
>;

export type AccountOrderCommandRequest = Override<
  GeneratedAccountOrderCommandRequest,
  { order: AccountOrderPayload }
>;

export type FDXBrokerOrderCommandResult = Override<
  GeneratedFDXBrokerOrderCommandResult,
  { order: FDXBrokerOrder }
>;

export type { FDXFutureInstrumentDetails, FDXInstrumentDescriptor };
