/**
 * Main SDK entry point.
 *
 * Hand-authored exports compose ``src/openapi/`` (OpenAPI Generator output) with wrappers and utilities.
 *
 * Regenerate: ``make openapi-generate`` from the Finatic workspace root.
 */

// Re-export SDK wrappers/utilities/config
export * from './wrappers';
export * from './utils';
export * from './config';

// Stable, browser-safe identity and account-resource contracts generated from
// FinaticAPI PR #748 at 82fba8df3ee811771bca705542ef6e0ce92850ad.
export type {
  AccountOrderCommandRequest,
  AccountOrderPayload,
  FDXBrokerOrder,
  FDXBrokerOrderCommandResult,
  FDXBrokerOrderEvent,
  FDXBrokerOrderFill,
  FDXBrokerPosition,
  FDXBrokerPositionLot,
  FDXBrokerPositionLotFill,
  FDXFutureInstrumentDetails,
  FDXInstrumentDescriptor,
  FDXOrderLeg,
} from './contracts/instrument-descriptors';
export {
  FDXBrokerOrderCommandResultActionEnum,
  FDXBrokerOrderCommandResultExecutionStrategyEnum,
  FDXFutureInstrumentDetailsIdentityQualityEnum,
  FDXInstrumentDescriptorVersionEnum,
  FDXOrderPositionIntent,
  FDXOrderSide,
  FDXPositionSide,
} from './openapi/models';

export { FinaticConnect } from './FinaticConnect';
export type { FinaticConnectOptions } from './FinaticConnectCore';
export { PORTAL_LIFECYCLE_SCHEMA_VERSION, isPortalLifecycleEventPayload } from './portal/PortalUI';
export type {
  KnownPortalEventName,
  PortalConnectorState,
  PortalEventArguments,
  PortalEventCallback,
  PortalEventName,
  PortalEventPayloadMap,
  PortalLifecycleEventPayload,
  PortalLifecycleSchemaVersion,
  PortalLifecycleStage,
} from './portal/PortalUI';
