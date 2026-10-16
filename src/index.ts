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
// Finatic PR #112 at 38ff4b30d70941340c1a304637002541ab2e669f
// (artifact SHA-256 c788d74954e3914f5ba228a3e1bea439a9020bc7cff1a8be0b5eaee479833021).
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
