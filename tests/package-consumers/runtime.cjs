const assert = require('node:assert/strict');
const { FDXAssetType, FDXOrderSide, FinaticConnect } = require('@finatic/client');

assert.equal(FDXOrderSide.Buy, 'BUY');
assert.equal(FDXAssetType.EventContract, 'EVENT_CONTRACT');
assert.equal(typeof FinaticConnect, 'function');
