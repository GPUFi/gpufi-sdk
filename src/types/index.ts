import { ContractRunner } from 'ethers';

export type NetworkEnvironment = 'testnet' | 'mainnet';

export interface GPUFiClientConfig {
  /**
   * Environment to connect to ('testnet' or 'mainnet').
   * Default: 'testnet'
   */
  network?: NetworkEnvironment;

  /**
   * Custom RPC endpoint.
   * If omitted, defaults to the public Robinhood Chain RPC.
   * NO API keys required.
   */
  rpcUrl?: string;

  /**
   * Optional custom contract addresses.
   */
  contracts?: {
    gpufToken?: string;
    miningContract?: string;
  };

  /**
   * Custom ethers ContractRunner (Signer or Provider).
   * If not provided, a default JsonRpcProvider connected to public RPC is created.
   */
  runner?: ContractRunner;
}

export interface MinerInfo {
  address: string;
  lockedAmount: bigint;
  lockedAmountFormatted: string;
  lockStartTime: number;
  lockStartDate: Date;
  lastClaimEpoch: number;
  unlockedWithdrawn: bigint;
  miningPower: bigint;
  miningPowerFormatted: string;
  powerPercentageOfLock: number; // 5% to 100%
  daysLocked: number;
  isFullyMatured: boolean;
}

export interface EpochInfo {
  epochId: number;
  ethRewardPool: bigint;
  ethRewardPoolFormatted: string;
  gpufRewardPool: bigint;
  gpufRewardPoolFormatted: string;
  totalWeight: bigint;
  totalWeightFormatted: string;
  finalized: boolean;
}

export interface ProtocolStats {
  currentEpoch: number;
  currentEpochStartTime: number;
  epochStartDate: Date;
  timeRemainingSeconds: number;
  canAdvanceEpoch: boolean;
  totalStaked: bigint;
  totalStakedFormatted: string;
  totalMinersCount: number;
  pendingEthPool: bigint;
  pendingEthPoolFormatted: string;
  pendingGpufPool: bigint;
  pendingGpufPoolFormatted: string;
  totalNetworkMiningPower: bigint;
  totalNetworkMiningPowerFormatted: string;
}

export interface EstimatedClaimReward {
  epochId: number;
  userEthReward: bigint;
  userEthRewardFormatted: string;
  userGpufReward: bigint;
  userGpufRewardFormatted: string;
  alreadyClaimed: boolean;
}

export interface EmergencyExitQuote {
  totalLocked: bigint;
  totalLockedFormatted: string;
  penaltyAmount: bigint;
  penaltyAmountFormatted: string;
  penaltyPercentage: number;
  returnedAmount: bigint;
  returnedAmountFormatted: string;
}
