import { ContractRunner, JsonRpcProvider } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIGS } from './constants/contracts';
import { GPUFiClientConfig, NetworkEnvironment } from './types';
import { MiningClient } from './mining';
import { TokenClient } from './token';
import { RevenueClient } from './revenue';

/**
 * Main GPUFi Protocol Client.
 * Unified interface for DePIN compute mining, staking, and token operations.
 * Zero API keys required — connects directly via public Robinhood Chain RPC.
 */
export class GPUFiClient {
  public readonly network: NetworkEnvironment;
  public readonly rpcUrl: string;
  public readonly runner: ContractRunner;

  public readonly tokenAddress: string;
  public readonly miningAddress: string;

  public readonly token: TokenClient;
  public readonly mining: MiningClient;
  public readonly revenue: RevenueClient;

  constructor(config: GPUFiClientConfig = {}) {
    this.network = config.network || 'testnet';

    const netConfig =
      this.network === 'mainnet'
        ? NETWORK_CONFIGS.ROBINHOOD_MAINNET
        : NETWORK_CONFIGS.ROBINHOOD_TESTNET;

    const addresses =
      this.network === 'mainnet'
        ? CONTRACT_ADDRESSES.MAINNET
        : CONTRACT_ADDRESSES.TESTNET;

    this.rpcUrl = config.rpcUrl || netConfig.rpcUrls[0];
    this.runner = config.runner || new JsonRpcProvider(this.rpcUrl);

    this.tokenAddress = config.contracts?.gpufToken || addresses.GPUF_TOKEN;
    this.miningAddress = config.contracts?.miningContract || addresses.MINING_CONTRACT;

    if (!this.tokenAddress) {
      throw new Error(`GPUF Token address not configured for network: ${this.network}`);
    }
    if (!this.miningAddress) {
      throw new Error(`Mining Contract address not configured for network: ${this.network}`);
    }

    this.token = new TokenClient(this.tokenAddress, this.runner);
    this.mining = new MiningClient(this.miningAddress, this.runner);
    this.revenue = new RevenueClient(this.miningAddress, this.runner);
  }

  /**
   * Clone client instance with a new ContractRunner (e.g. attaching a Signer for write transactions).
   */
  public connect(runner: ContractRunner): GPUFiClient {
    return new GPUFiClient({
      network: this.network,
      rpcUrl: this.rpcUrl,
      contracts: {
        gpufToken: this.tokenAddress,
        miningContract: this.miningAddress,
      },
      runner,
    });
  }
}
