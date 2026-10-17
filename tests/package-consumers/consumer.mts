import {
  FDXAssetType,
  FDXOrderSide,
  type EventContractCapabilityResponse,
  type FDXOrderLeg,
} from '@finatic/client';

const esmOrderLeg: FDXOrderLeg = {
  assetType: 'FUTURE',
  legIndex: 0,
  quantity: 1,
  securityId: 'MGCZ6',
  securityIdType: 'SYMBOL',
  side: FDXOrderSide.Buy,
};

void esmOrderLeg;
const eventContractCapability: EventContractCapabilityResponse = {
  accountEntitled: null,
  closingOnly: null,
  implementationEvidenced: true,
  implementationRef: 'core-sha',
  observedAt: null,
  providerOffered: true,
  publicEnabled: false,
};
void eventContractCapability;
void FDXAssetType.EventContract;
