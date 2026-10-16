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
export { AccountOrderSchemaResponseActionEnum, FDXAssetType } from './openapi/models';
export type {
  AccountOrderSchemaResponse,
  EventContractCapabilityResponse,
  FinaticAPIErrorResponse,
} from './openapi/models';

// Stable, browser-safe identity and account-resource contracts generated from
// Finatic PR #112 at e894335bba3ce8bf59543457c25b373dee28a1cc
// (artifact SHA-256 ffee54688da302eda523038e199aca4c5aa1bc2c3b9a88c17221364b2809f4fc).
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
