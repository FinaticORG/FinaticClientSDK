import {
  FDXFutureInstrumentDetailsIdentityQualityEnum,
  FDXInstrumentDescriptorVersionEnum,
  type AccountOrderCommandInput,
  type FDXBrokerOrder,
  type FDXBrokerOrderEvent,
  type FDXBrokerOrderFill,
  type FDXBrokerPosition,
  type FDXBrokerPositionLot,
  type FDXBrokerPositionLotFill,
  type FDXFutureInstrumentDetails,
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

void exactContractOrder;
void rootOnlyOrder;
void FDXInstrumentDescriptorVersionEnum._10;
void FDXFutureInstrumentDetailsIdentityQualityEnum.Exact;
void FDXFutureInstrumentDetailsIdentityQualityEnum.RootOnly;

const malformedCanonicalId: AccountOrderCommandInput = {
  order: {
    // @ts-expect-error canonical Finatic ids are strings
    finaticInstrumentId: 123,
  },
};

const malformedProviderId: AccountOrderCommandInput = {
  order: {
    // @ts-expect-error provider-native instrument ids are strings
    instrumentId: 456,
  },
};

void malformedCanonicalId;
void malformedProviderId;

const malformedIdentityQuality: FDXFutureInstrumentDetails = {
  // @ts-expect-error identity quality is EXACT or ROOT_ONLY
  identityQuality: 'INFERRED',
};

void malformedIdentityQuality;
