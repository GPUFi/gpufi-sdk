import { formatUnits, parseUnits } from 'ethers';
import { PROTOCOL_CONSTANTS } from '../constants/contracts';

/**
 * Format 18-decimal token balance to a readable string with fixed precision.
 */
export function formatTokenAmount(amount: bigint | string | number, decimals: number = 18, precision: number = 4): string {
  try {
    const rawBigInt = typeof amount === 'bigint' ? amount : BigInt(amount.toString());
    const formatted = formatUnits(rawBigInt, decimals);
    const parts = formatted.split('.');
    if (precision <= 0) {
      return parts[0];
    }
    const whole = parts[0];
    const fraction = (parts[1] || '').padEnd(precision, '0').slice(0, precision);
    return `${whole}.${fraction}`;
  } catch {
    return '0';
  }
}

/**
 * Parse a human-readable number or string into an 18-decimal BigInt.
 */
export function parseTokenAmount(amount: string | number, decimals: number = 18): bigint {
  const str = typeof amount === 'number' ? amount.toFixed(Math.min(18, decimals)) : amount.trim();
  return parseUnits(str, decimals);
}

/**
 * Calculate expected mining power off-chain based on locked amount and elapsed seconds.
 * Power ramps linearly from 5% (500 bps) on Day 0 to 100% (10,000 bps) on Day 21.
 */
export function calculateOffchainMiningPower(lockedAmount: bigint, elapsedSeconds: number): bigint {
  if (lockedAmount <= 0n) return 0n;
  const commitment = Number(PROTOCOL_CONSTANTS.COMMITMENT_PERIOD_SECONDS);
  if (elapsedSeconds >= commitment) {
    return lockedAmount;
  }
  const baseBps = Number(PROTOCOL_CONSTANTS.BASE_POWER_BPS);
  const rampBpsRange = Number(PROTOCOL_CONSTANTS.MAX_POWER_BPS - PROTOCOL_CONSTANTS.BASE_POWER_BPS);
  const rampBps = BigInt(Math.floor(baseBps + (rampBpsRange * elapsedSeconds) / commitment));
  return (lockedAmount * rampBps) / 10000n;
}

/**
 * Format remaining seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
