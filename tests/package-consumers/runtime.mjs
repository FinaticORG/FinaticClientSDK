import assert from 'node:assert/strict';
import { FDXAssetType, FDXOrderSide, FinaticConnect } from '@finatic/client';

assert.equal(FDXOrderSide.Buy, 'BUY');
assert.equal(FDXAssetType.EventContract, 'EVENT_CONTRACT');
assert.equal(typeof FinaticConnect, 'function');
