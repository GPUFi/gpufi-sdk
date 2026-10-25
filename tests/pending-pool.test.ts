import { strict as assert } from 'node:assert';
import test from 'node:test';
import { readPendingTokenPool } from '../dist/index.js';

const reverted = async () => {
  throw new Error('execution reverted (no data present; likely require(false) occurred (data 0xdfcb4f4d)');
};

test('readPendingTokenPool reads pendingGpufPool() on the testnet contract', async () => {
  const contract = { pendingGpufPool: async () => 5n, pendingNvdaPool: reverted };
  assert.equal(await readPendingTokenPool(contract as never), 5n);
});

test('readPendingTokenPool falls back to pendingNvdaPool() on the mainnet contract, which has no pendingGpufPool()', async () => {
  const contract = { pendingGpufPool: reverted, pendingNvdaPool: async () => 7n };
  assert.equal(await readPendingTokenPool(contract as never), 7n);
});
