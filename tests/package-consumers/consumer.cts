import {
  FDXAssetType,
  FDXOrderSide,
  type EventContractCapabilityResponse,
  type FDXOrderLeg,
} from '@finatic/client';

const commonJsOrderLeg: FDXOrderLeg = {
  assetType: 'FUTURE',
  legIndex: 0,
  quantity: 1,
  securityId: 'MGCZ6',
  securityIdType: 'SYMBOL',
  side: FDXOrderSide.Buy,
};

void commonJsOrderLeg;
declare const eventContractCapability: EventContractCapabilityResponse;
void eventContractCapability;
void FDXAssetType.EventContract;
