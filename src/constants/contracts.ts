/**
 * Official Contract Addresses for GPUFi Protocol
 */
export const CONTRACT_ADDRESSES = {
  TESTNET: {
    GPUF_TOKEN: '0xa22D071A400099BF00911ef344CA79ae877540ae',
    MINING_CONTRACT: '0x31B1e4eEaD1DD90211038594538653220705cCae',
    PONS_V2_FACTORY: '0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e',
    NVDA_STOCK_TOKEN: '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC',
  },
  MAINNET: {
    GPUF_TOKEN: '0x741352fA5EB05642C02fA0658743328e76C1B5cb',
    MINING_CONTRACT: '0x1BF7C5E78b92cd91EAe35cDE6D99Ddc64b154B5A',
    PONS_V2_FACTORY: '0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e',
    NVDA_STOCK_TOKEN: '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC',
  },
} as const;

/**
 * Supported Network Configurations
 * Note: Default RPC endpoints are purely public and require zero API keys.
 */
export const NETWORK_CONFIGS = {
  ROBINHOOD_TESTNET: {
    chainId: 46630,
    chainName: 'Robinhood Chain Testnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    // Pure public RPC - No API key required
    rpcUrls: ['https://rpc.testnet.chain.robinhood.com'],
    blockExplorerUrls: ['https://explorer.testnet.chain.robinhood.com'],
  },
  ROBINHOOD_MAINNET: {
    chainId: 4663,
    chainName: 'Robinhood Chain Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.mainnet.chain.robinhood.com'],
    blockExplorerUrls: ['https://robinhoodchain.blockscout.com'],
  },
} as const;

/**
 * Protocol Economic & Operating Parameters
 */
export const PROTOCOL_CONSTANTS = {
  COMMITMENT_PERIOD_SECONDS: 21 * 24 * 60 * 60, // 21 days (1,814,400 seconds)
  EPOCH_DURATION_SECONDS: 3600, // 1 hour
  MAX_WALLET_LOCK_GPUF: 20_000_000n * 10n ** 18n, // 2% of 1B supply (20 Million GPUF)
  EMERGENCY_PENALTY_BPS: 1000n, // 10% penalty (1000 / 10000)
  KEEPER_REWARD_BPS: 10n, // 0.1% keeper bounty (10 / 10000)
  BASE_POWER_BPS: 500n, // 5% power on Day 0 (500 / 10000)
  MAX_POWER_BPS: 10000n, // 100% power on Day 21 (10000 / 10000)
} as const;
