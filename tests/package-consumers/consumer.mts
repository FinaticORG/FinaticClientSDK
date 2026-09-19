import { FDXOrderSide, type FDXOrderLeg } from '@finatic/client';

const esmOrderLeg: FDXOrderLeg = {
  assetType: 'FUTURE',
  legIndex: 0,
  quantity: 1,
  securityId: 'MGCZ6',
  securityIdType: 'SYMBOL',
  side: FDXOrderSide.Buy,
};

void esmOrderLeg;
