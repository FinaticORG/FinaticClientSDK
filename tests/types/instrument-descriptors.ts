import {
  FDXFutureInstrumentDetailsIdentityQualityEnum,
  FDXInstrumentDescriptorVersionEnum,
  FDXOrderPositionIntent,
  FDXOrderSide,
  FDXPositionSide,
  type AccountOrderCommandInput,
  type FDXBrokerOrder,
  type FDXBrokerOrderEvent,
  type FDXBrokerOrderFill,
  type FDXBrokerPosition,
  type FDXBrokerPositionLot,
  type FDXBrokerPositionLotFill,
  type FDXFutureInstrumentDetails,
  type FDXOrderLeg,
} from '@finatic/client';

declare const orders: FDXBrokerOrder[];
declare const events: FDXBrokerOrderEvent[];
declare const fills: FDXBrokerOrderFill[];
declare const positions: FDXBrokerPosition[];
declare const lots: FDXBrokerPositionLot[];
declare const lotFills: FDXBrokerPositionLotFill[];

const orderInstrumentId: string | undefined = orders[0]?.legs?.[0]?.instrument?.finaticInstrumentId;
const eventInstrumentId: string | undefined =
  events[0]?.affectedInstruments?.[0]?.finaticInstrumentId;
const fillInstrumentId: string | undefined = fills[0]?.instrument?.finaticInstrumentId;
const positionInstrumentId: string | undefined = positions[0]?.instrument?.finaticInstrumentId;
const lotInstrumentId: string | undefined = lots[0]?.instrument?.finaticInstrumentId;
const lotFillInstrumentId: string | undefined = lotFills[0]?.instrument?.finaticInstrumentId;

void [
  orderInstrumentId,
  eventInstrumentId,
  fillInstrumentId,
  positionInstrumentId,
  lotInstrumentId,
  lotFillInstrumentId,
];

const exactContractOrder: AccountOrderCommandInput = {
  order: {
    symbol: 'MGCZ6',
    finaticInstrumentId: 'fininst_mgcz6',
    instrumentId: 'ibkr_12345',
  },
};

const rootOnlyOrder: AccountOrderCommandInput = {
  order: { symbol: 'MGC' },
};

const numericProviderInstrumentOrder: AccountOrderCommandInput = {
  order: { instrumentId: 456 },
};

void exactContractOrder;
void rootOnlyOrder;
void numericProviderInstrumentOrder;
void FDXInstrumentDescriptorVersionEnum._10;
void FDXFutureInstrumentDetailsIdentityQualityEnum.Exact;
void FDXFutureInstrumentDetailsIdentityQualityEnum.RootOnly;

const exactFutureOrderLeg: FDXOrderLeg = {
  assetType: 'FUTURE',
  legIndex: 0,
  positionIntent: FDXOrderPositionIntent.BuyToOpen,
  quantity: 2,
  securityId: 'MGCZ6',
  securityIdType: 'SYMBOL',
  side: FDXOrderSide.Buy,
};

const longFutureLot: FDXBrokerPositionLot = {
  accountId: 'account-id',
  assetType: 'FUTURE',
  closedQuantity: 0,
  costBasis: 5000,
  costBasisWithCommission: 5001,
  lotId: 'lot-id',
  openPrice: 2500,
  openQuantity: 2,
  openedAt: '2026-09-19T00:00:00Z',
  realizedProfitLoss: 0,
  realizedProfitLossWithCommission: -1,
  remainingQuantity: 2,
  securityId: 'MGCZ6',
  side: FDXPositionSide.Long,
};

void exactFutureOrderLeg;
void longFutureLot;

// @ts-expect-error order sides cannot use position-side values
const malformedOrderSide: FDXOrderSide = 'LONG';
// @ts-expect-error position sides cannot use order-side values
const malformedPositionSide: FDXPositionSide = 'BUY';

void malformedOrderSide;
void malformedPositionSide;

const malformedCanonicalId: AccountOrderCommandInput = {
  order: {
    // @ts-expect-error canonical Finatic ids are strings
    finaticInstrumentId: 123,
  },
};

const malformedProviderId: AccountOrderCommandInput = {
  order: {
    // @ts-expect-error provider-native instrument ids are strings or integers
    instrumentId: { broker: 456 },
  },
};

const malformedOrderLeg: FDXOrderLeg = {
  // @ts-expect-error asset types are strings
  assetType: 17,
  legIndex: 0,
  // @ts-expect-error position intent is string-valued
  positionIntent: { invalid: true },
  // @ts-expect-error quantities are decimal strings or numbers
  quantity: {},
  securityId: 'MGCZ6',
  // @ts-expect-error security id types are strings
  securityIdType: [],
  // @ts-expect-error order sides are strings
  side: 42,
};

const malformedOrder: FDXBrokerOrder = {
  accountId: 'account-id',
  orderId: 'order-id',
  status: 'OPEN',
  // @ts-expect-error time in force is string-valued
  timeInForce: { invalid: true },
};

const malformedLotSide: FDXBrokerPositionLot = {
  accountId: 'account-id',
  assetType: 'FUTURE',
  closedQuantity: 0,
  costBasis: 5000,
  costBasisWithCommission: 5001,
  lotId: 'lot-id',
  openPrice: 2500,
  openQuantity: 2,
  openedAt: '2026-09-19T00:00:00Z',
  realizedProfitLoss: 0,
  realizedProfitLossWithCommission: -1,
  remainingQuantity: 2,
  securityId: 'MGCZ6',
  // @ts-expect-error position sides are string-valued
  side: 42,
};

void malformedCanonicalId;
void malformedProviderId;
void malformedOrderLeg;
void malformedOrder;
void malformedLotSide;

const malformedIdentityQuality: FDXFutureInstrumentDetails = {
  // @ts-expect-error identity quality is EXACT or ROOT_ONLY
  identityQuality: 'INFERRED',
};

void malformedIdentityQuality;
