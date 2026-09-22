import { strict as assert } from 'node:assert';
import test from 'node:test';
import {
  formatTokenAmount,
  parseTokenAmount,
  calculateOffchainMiningPower,
  formatDuration,
  PROTOCOL_CONSTANTS,
} from '../dist/index.js';

test('formatTokenAmount handles zero and decimals cleanly', () => {
  assert.equal(formatTokenAmount(0n), '0.0000');
  assert.equal(formatTokenAmount(10n ** 18n), '1.0000');
  assert.equal(formatTokenAmount(1500000000000000000n, 18, 2), '1.50');
  assert.equal(formatTokenAmount(20_000_000n * 10n ** 18n, 18, 0), '20000000');
});

test('parseTokenAmount converts human values to 18 decimals BigInt', () => {
  assert.equal(parseTokenAmount('1'), 10n ** 18n);
  assert.equal(parseTokenAmount(100), 100n * 10n ** 18n);
  assert.equal(parseTokenAmount('0.5'), 500000000000000000n);
});

test('calculateOffchainMiningPower calculates 21-day linear ramp accurately', () => {
  const locked = 1000n * 10n ** 18n;

  // Day 0: 5% power (500 bps)
  const powerDay0 = calculateOffchainMiningPower(locked, 0);
  assert.equal(powerDay0, (locked * 500n) / 10000n);

  // Day 21+: 100% power (10,000 bps)
  const powerDay21 = calculateOffchainMiningPower(locked, Number(PROTOCOL_CONSTANTS.COMMITMENT_PERIOD_SECONDS));
  assert.equal(powerDay21, locked);

  // Exceeding 21 days stays capped at 100%
  const powerDay30 = calculateOffchainMiningPower(locked, 30 * 86400);
  assert.equal(powerDay30, locked);
});

test('formatDuration formats seconds properly', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(3600), '01:00:00');
  assert.equal(formatDuration(3665), '01:01:05');
});
