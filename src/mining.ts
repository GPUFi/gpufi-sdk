import { Contract, ContractRunner } from 'ethers';
import { MINING_CONTRACT_ABI } from './constants/abis';
import { PROTOCOL_CONSTANTS } from './constants/contracts';
import {
  MinerInfo,
  EpochInfo,
  ProtocolStats,
  EstimatedClaimReward,
  EmergencyExitQuote,
} from './types';
import { formatTokenAmount, parseTokenAmount } from './utils/format';

export class MiningClient {
  public readonly contract: Contract;
  public readonly address: string;

  constructor(miningContractAddress: string, runner: ContractRunner) {
    this.address = miningContractAddress;
    this.contract = new Contract(miningContractAddress, MINING_CONTRACT_ABI, runner);
  }

  /**
   * Connect with a new ContractRunner (e.g. switching from Provider to Signer).
   */
  public connect(runner: ContractRunner): MiningClient {
    return new MiningClient(this.address, runner);
  }

  /**
   * Fetch comprehensive global telemetry and protocol stats.
   */
  public async getProtocolStats(): Promise<ProtocolStats> {
    const [
      currentEpoch,
      currentEpochStartTime,
      totalStaked,
      totalMinersCount,
      pendingEthPool,
      pendingGpufPool,
      totalNetworkMiningPower,
    ] = await Promise.all([
      this.contract.currentEpoch(),
      this.contract.currentEpochStartTime(),
      this.contract.totalStaked(),
      this.contract.totalMinersCount(),
      this.contract.pendingEthPool(),
      this.contract.pendingGpufPool(),
      this.contract.computeTotalMiningPower(),
    ]);

    const epochStartNum = Number(currentEpochStartTime);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const duration = PROTOCOL_CONSTANTS.EPOCH_DURATION_SECONDS;
    const elapsed = Math.max(0, nowSeconds - epochStartNum);
    const timeRemainingSeconds = Math.max(0, duration - elapsed);
    const canAdvanceEpoch = timeRemainingSeconds === 0;

    return {
      currentEpoch: Number(currentEpoch),
      currentEpochStartTime: epochStartNum,
      epochStartDate: new Date(epochStartNum * 1000),
      timeRemainingSeconds,
      canAdvanceEpoch,
      totalStaked,
      totalStakedFormatted: formatTokenAmount(totalStaked),
      totalMinersCount: Number(totalMinersCount),
      pendingEthPool,
      pendingEthPoolFormatted: formatTokenAmount(pendingEthPool),
      pendingGpufPool,
      pendingGpufPoolFormatted: formatTokenAmount(pendingGpufPool),
      totalNetworkMiningPower,
      totalNetworkMiningPowerFormatted: formatTokenAmount(totalNetworkMiningPower),
    };
  }

  /**
   * Fetch detailed staking and mining data for a specific address.
   */
  public async getMinerInfo(minerAddress: string): Promise<MinerInfo> {
    const [minerData, onChainPower] = await Promise.all([
      this.contract.miners(minerAddress),
      this.contract.getMiningPower(minerAddress),
    ]);

    const lockedAmount = minerData.lockedAmount as bigint;
    const lockStartTime = Number(minerData.lockStartTime);
    const lastClaimEpoch = Number(minerData.lastClaimEpoch);
    const unlockedWithdrawn = minerData.unlockedWithdrawn as bigint;

    const nowSeconds = Math.floor(Date.now() / 1000);
    const elapsedSeconds = lockStartTime > 0 ? Math.max(0, nowSeconds - lockStartTime) : 0;
    const daysLocked = Math.floor(elapsedSeconds / 86400);
    const isFullyMatured = elapsedSeconds >= PROTOCOL_CONSTANTS.COMMITMENT_PERIOD_SECONDS;

    let powerPercentageOfLock = 0;
    if (lockedAmount > 0n) {
      powerPercentageOfLock = Number((onChainPower * 10000n) / lockedAmount) / 100;
    }

    return {
      address: minerAddress,
      lockedAmount,
      lockedAmountFormatted: formatTokenAmount(lockedAmount),
      lockStartTime,
      lockStartDate: new Date(lockStartTime * 1000),
      lastClaimEpoch,
      unlockedWithdrawn,
      miningPower: onChainPower,
      miningPowerFormatted: formatTokenAmount(onChainPower),
      powerPercentageOfLock,
      daysLocked,
      isFullyMatured,
    };
  }

  /**
   * Read raw mining power for a given miner address on-chain.
   */
  public async getMiningPower(minerAddress: string): Promise<bigint> {
    return await this.contract.getMiningPower(minerAddress);
  }

  /**
   * Calculate total aggregate mining power across all active miners.
   */
  public async computeTotalMiningPower(): Promise<bigint> {
    return await this.contract.computeTotalMiningPower();
  }

  /**
   * Fetch historical or current epoch details.
   */
  public async getEpoch(epochId: number): Promise<EpochInfo> {
    const epochData = await this.contract.epochs(epochId);
    return {
      epochId,
      ethRewardPool: epochData.ethRewardPool,
      ethRewardPoolFormatted: formatTokenAmount(epochData.ethRewardPool),
      gpufRewardPool: epochData.gpufRewardPool,
      gpufRewardPoolFormatted: formatTokenAmount(epochData.gpufRewardPool),
      totalWeight: epochData.totalWeight,
      totalWeightFormatted: formatTokenAmount(epochData.totalWeight),
      finalized: epochData.finalized,
    };
  }

  /**
   * Check if a miner has claimed rewards for a specific epoch.
   */
  public async isEpochClaimed(epochId: number, minerAddress: string): Promise<boolean> {
    return await this.contract.epochClaimed(epochId, minerAddress);
  }

  /**
   * Estimate claimable rewards for a miner in a past finalized epoch.
   */
  public async estimateEpochReward(epochId: number, minerAddress: string): Promise<EstimatedClaimReward> {
    const [epoch, minerPower, alreadyClaimed] = await Promise.all([
      this.getEpoch(epochId),
      this.getMiningPower(minerAddress),
      this.isEpochClaimed(epochId, minerAddress),
    ]);

    let userEthReward = 0n;
    let userGpufReward = 0n;

    if (epoch.finalized && epoch.totalWeight > 0n && minerPower > 0n && !alreadyClaimed) {
      userEthReward = (epoch.ethRewardPool * minerPower) / epoch.totalWeight;
      userGpufReward = (epoch.gpufRewardPool * minerPower) / epoch.totalWeight;
    }

    return {
      epochId,
      userEthReward,
      userEthRewardFormatted: formatTokenAmount(userEthReward),
      userGpufReward,
      userGpufRewardFormatted: formatTokenAmount(userGpufReward),
      alreadyClaimed,
    };
  }

  /**
   * Identify all finalized epochs that the miner has not claimed yet.
   */
  public async getUnclaimedEpochs(minerAddress: string, maxLookback: number = 20): Promise<number[]> {
    const currentEpochBn = await this.contract.currentEpoch();
    const currentEpoch = Number(currentEpochBn);
    const miner = await this.getMinerInfo(minerAddress);

    if (miner.lockedAmount === 0n) return [];

    const start = Math.max(1, Math.max(miner.lastClaimEpoch, currentEpoch - maxLookback));
    const unclaimed: number[] = [];

    for (let ep = start; ep < currentEpoch; ep++) {
      const claimed = await this.isEpochClaimed(ep, minerAddress);
      if (!claimed) {
        unclaimed.push(ep);
      }
    }

    return unclaimed;
  }

  /**
   * Calculate penalty and returned tokens if emergency exit is executed.
   */
  public async getEmergencyExitQuote(minerAddress: string): Promise<EmergencyExitQuote> {
    const miner = await this.getMinerInfo(minerAddress);
    const locked = miner.lockedAmount;
    const penalty = (locked * PROTOCOL_CONSTANTS.EMERGENCY_PENALTY_BPS) / 10000n;
    const returned = locked - penalty;

    return {
      totalLocked: locked,
      totalLockedFormatted: formatTokenAmount(locked),
      penaltyAmount: penalty,
      penaltyAmountFormatted: formatTokenAmount(penalty),
      penaltyPercentage: 10,
      returnedAmount: returned,
      returnedAmountFormatted: formatTokenAmount(returned),
    };
  }

  // ===================== WRITE TRANSACTIONS (Requires Signer) =====================

  /**
   * Stake GPUF tokens into the contract to begin or augment mining.
   * Enforces 2% wallet cap (20,000,000 GPUF).
   * Note: The caller must approve the mining contract beforehand.
   */
  public async lock(amount: bigint | string | number) {
    const target = typeof amount === 'bigint' ? amount : parseTokenAmount(amount);
    if (target <= 0n) throw new Error('Lock amount must be greater than 0');
    return await this.contract.lock(target);
  }

  /**
   * Advance to the next epoch once the 1-hour epoch duration has elapsed.
   * The caller receives a 0.1% keeper bounty of all accumulated pending revenue.
   */
  public async advanceEpoch() {
    return await this.contract.advanceEpoch();
  }

  /**
   * Claim accumulated dual rewards (ETH + GPUF) for a finalized epoch.
   */
  public async claim(epochId: number) {
    return await this.contract.claim(epochId);
  }

  /**
   * Claim multiple finalized epochs in a single atomic transaction.
   */
  public async claimBatch(epochIds: number[]) {
    if (!epochIds || epochIds.length === 0) {
      throw new Error('Epoch IDs array cannot be empty');
    }
    return await this.contract.claimBatch(epochIds);
  }

  /**
   * Immediately withdraw all locked GPUF tokens subject to a 10% emergency penalty.
   * The 10% penalty is injected into the next epoch reward pool.
   */
  public async emergencyExit() {
    return await this.contract.emergencyExit();
  }
}
