const assert = require('node:assert/strict');
const { FDXOrderSide, FinaticConnect } = require('@finatic/client');

assert.equal(FDXOrderSide.Buy, 'BUY');
assert.equal(typeof FinaticConnect, 'function');
