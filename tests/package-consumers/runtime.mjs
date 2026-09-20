import assert from 'node:assert/strict';
import { FDXOrderSide, FinaticConnect } from '@finatic/client';

assert.equal(FDXOrderSide.Buy, 'BUY');
assert.equal(typeof FinaticConnect, 'function');
