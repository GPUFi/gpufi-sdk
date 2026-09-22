import { Contract, ContractRunner } from 'ethers';
import { MINING_CONTRACT_ABI } from './constants/abis';
import { formatTokenAmount, parseTokenAmount } from './utils/format';

export interface DepositRevenueOptions {
  ethAmount?: string | number | bigint;
  gpufAmount?: string | number | bigint;
}

export class RevenueClient {
  public readonly contract: Contract;
  public readonly address: string;

  constructor(miningContractAddress: string, runner: ContractRunner) {
    this.address = miningContractAddress;
    this.contract = new Contract(miningContractAddress, MINING_CONTRACT_ABI, runner);
  }

  /**
   * Connect with a new ContractRunner (e.g. switching from Provider to Signer).
   */
  public connect(runner: ContractRunner): RevenueClient {
    return new RevenueClient(this.address, runner);
  }

  /**
   * Read currently accumulated pending ETH and GPUF reward pools.
   */
  public async getPendingPools() {
    const [pendingEth, pendingGpuf] = await Promise.all([
      this.contract.pendingEthPool(),
      this.contract.pendingGpufPool(),
    ]);

    return {
      pendingEthPool: pendingEth as bigint,
      pendingEthPoolFormatted: formatTokenAmount(pendingEth),
      pendingGpufPool: pendingGpuf as bigint,
      pendingGpufPoolFormatted: formatTokenAmount(pendingGpuf),
    };
  }

  /**
   * Inject compute protocol revenues into the mining reward pool.
   * Can accept native ETH, GPUF tokens, or both simultaneously.
   * Note: If injecting GPUF tokens, caller must approve the mining contract beforehand.
   */
  public async depositRevenue(options: DepositRevenueOptions) {
    const ethVal = options.ethAmount ? (typeof options.ethAmount === 'bigint' ? options.ethAmount : parseTokenAmount(options.ethAmount)) : 0n;
    const gpufVal = options.gpufAmount ? (typeof options.gpufAmount === 'bigint' ? options.gpufAmount : parseTokenAmount(options.gpufAmount)) : 0n;

    return await this.contract.depositRevenue(gpufVal, {
      value: ethVal,
    });
  }
}
