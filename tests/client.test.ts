import { strict as assert } from 'node:assert';
import test from 'node:test';
import { GPUFiClient, CONTRACT_ADDRESSES } from '../dist/index.js';

test('GPUFiClient instantiates with default testnet settings and zero API keys', () => {
  const client = new GPUFiClient();
  assert.equal(client.network, 'testnet');
  assert.equal(client.rpcUrl, 'https://rpc.testnet.chain.robinhood.com');
  assert.equal(client.tokenAddress, CONTRACT_ADDRESSES.TESTNET.GPUF_TOKEN);
  assert.equal(client.miningAddress, CONTRACT_ADDRESSES.TESTNET.MINING_CONTRACT);

  // Sub-clients initialized
  assert.ok(client.token);
  assert.ok(client.mining);
  assert.ok(client.revenue);
});

test('GPUFiClient allows custom contract and RPC overrides', () => {
  const customRpc = 'https://custom-rpc.example.com';
  const customToken = '0x1111111111111111111111111111111111111111';
  const customMining = '0x2222222222222222222222222222222222222222';

  const client = new GPUFiClient({
    rpcUrl: customRpc,
    contracts: {
      gpufToken: customToken,
      miningContract: customMining,
    },
  });

  assert.equal(client.rpcUrl, customRpc);
  assert.equal(client.tokenAddress, customToken);
  assert.equal(client.miningAddress, customMining);
});
