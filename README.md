# gpufi-sdk

<div align="center">

[![NPM Version](https://img.shields.io/badge/npm-v1.0.0-cb3837?style=flat-square&logo=npm)](https://www.npmjs.com/package/gpufi-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![X](https://img.shields.io/badge/X-@GPUFi__RH-000000?style=flat-square&logo=x)](https://x.com/GPUFi_RH)
[![Network](https://img.shields.io/badge/Network-Robinhood%20Chain-111827?style=flat-square)](https://robinhoodchain.blockscout.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**The official TypeScript & JavaScript SDK for interacting with GPUFi Protocol on Robinhood Chain.**

</div>

---

## Features

- **Zero API Key Architecture**: Operates directly over public decentralized RPC nodes or standard Web3 providers without requiring vendor API keys.
- **Full TypeScript Type Safety**: Complete contract ABIs, typed miner states, epoch metrics, and quote calculations.
- **Dual CJS & ESM Support**: Works out of the box in Node.js, Next.js, Vite, Bun, and browser environments.
- **DePIN Staking & Mining Power**: Methods to track on-chain miner weight with the protocol's 21-day linear power ramp.
- **Dual-Reward Settlements**: Single-transaction and batch claim utilities for both native `$ETH` and `$GPUF` / `$RIG`.
- **Autonomous Keeper Automation**: Pre-built logic for epoch advancement bots with 0.1% keeper fee capture.

---

## Installation

```bash
npm install gpufi-sdk ethers
```

Or via package managers of your choice:

```bash
# yarn
yarn add gpufi-sdk ethers

# pnpm
pnpm add gpufi-sdk ethers

# bun
bun add gpufi-sdk ethers
```

---

## Quickstart

### 1. Read Protocol Telemetry (Zero Configuration / Read-Only)

Connect to the public Robinhood Chain Mainnet without needing an API key, wallet, or private key:

```typescript
import { GPUFiClient, formatDuration } from 'gpufi-sdk';

const client = new GPUFiClient();

async function checkNetwork() {
  const stats = await client.mining.getProtocolStats();

  console.log(`Current Epoch: #${stats.currentEpoch}`);
  console.log(`Time to next epoch: ${formatDuration(stats.timeRemainingSeconds)}`);
  console.log(`Total Staked: ${stats.totalStakedFormatted} GPUF`);
  console.log(`Active Miners: ${stats.totalMinersCount}`);
  console.log(`Pending Pool: ${stats.pendingEthPoolFormatted} ETH + ${stats.pendingGpufPoolFormatted} GPUF`);
}

checkNetwork();
```

---

### 2. Signer Mode (Staking & Mining)

Pass an authenticated ethers `Signer` (from MetaMask, Coinbase Wallet, or a private key in a secure backend):

```typescript
import { GPUFiClient } from 'gpufi-sdk';
import { BrowserProvider } from 'ethers';

// Example with browser extension (window.ethereum)
const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const client = new GPUFiClient().connect(signer);
const userAddress = await signer.getAddress();

async function stake(amount: string) {
  // 1. Check & Approve GPUF token allowance
  const hasAllowance = await client.token.hasSufficientAllowance(
    userAddress,
    client.miningAddress,
    amount
  );

  if (!hasAllowance) {
    const approveTx = await client.token.approve(client.miningAddress, amount);
    await approveTx.wait();
  }

  // 2. Lock GPUF to activate mining power
  const lockTx = await client.mining.lock(amount);
  await lockTx.wait();

  // 3. Inspect updated miner state
  const info = await client.mining.getMinerInfo(userAddress);
  console.log(`Mining Active! Locked: ${info.lockedAmountFormatted} GPUF (Power: ${info.powerPercentageOfLock}%)`);
}
```

---

### 3. Claim Epoch Rewards

Miners can claim dual rewards from previous finalized epochs:

```typescript
// Find all finalized epochs not yet claimed by this miner
const unclaimed = await client.mining.getUnclaimedEpochs(userAddress);

if (unclaimed.length > 0) {
  // Batch claim all pending epochs in one transaction
  const claimTx = await client.mining.claimBatch(unclaimed);
  await claimTx.wait();
  console.log(`Successfully claimed rewards for epochs: ${unclaimed.join(', ')}`);
}
```

---

### 4. Build an Epoch Keeper Bot

Anyone can advance the epoch once its 1-hour window expires and earn a **0.1% keeper bounty** on the entire accumulated epoch pool:

```typescript
import { GPUFiClient, formatDuration } from 'gpufi-sdk';
import { Wallet } from 'ethers';

const keeperWallet = new Wallet(process.env.KEEPER_PRIVATE_KEY!);
const client = new GPUFiClient().connect(keeperWallet);

async function runKeeper() {
  const stats = await client.mining.getProtocolStats();
  console.log(`Epoch #${stats.currentEpoch} - Remaining: ${formatDuration(stats.timeRemainingSeconds)}`);

  if (stats.canAdvanceEpoch) {
    console.log('Advancing epoch and capturing 0.1% bounty...');
    const tx = await client.mining.advanceEpoch();
    await tx.wait();
    console.log('Epoch advanced successfully!');
  }
}

// Run periodically
setInterval(runKeeper, 30_000);
```

---

## Smart Contract References

### Robinhood Chain Mainnet (`Chain ID: 4663`)

| Contract | Address |
| :--- | :--- |
| **GPUFi Token (`$RIG`)** | `0x741352fA5EB05642C02fA0658743328e76C1B5cb` |
| **Mining Contract** | `0x1BF7C5E78b92cd91EAe35cDE6D99Ddc64b154B5A` |
| **Pons V2 Factory** | `0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e` |
| **NVDA Reward Token** | `0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC` |

Public Mainnet RPC: `https://rpc.mainnet.chain.robinhood.com`  
Explorer: `https://robinhoodchain.blockscout.com`

### Robinhood Chain Testnet (`Chain ID: 46630`)

| Contract | Address |
| :--- | :--- |
| **GPUFi Token (`$GPUF`)** | `0xa22D071A400099BF00911ef344CA79ae877540ae` |
| **Mining Contract** | `0x31B1e4eEaD1DD90211038594538653220705cCae` |

Public Testnet RPC: `https://rpc.testnet.chain.robinhood.com`  
Explorer: `https://explorer.testnet.chain.robinhood.com`

---

## Core API Reference

### `GPUFiClient`

- `new GPUFiClient(config?: GPUFiClientConfig)`
  - `config.network`: `'mainnet'` | `'testnet'` (defaults to `'mainnet'`)
  - `config.rpcUrl`: Custom RPC URL (optional)
  - `config.runner`: ethers `ContractRunner` (Signer or Provider)
  - `config.contracts`: Override token or mining contract addresses
- `client.connect(runner: ContractRunner)`: Returns a new `GPUFiClient` connected to the supplied runner.
- `client.mining`: Instance of `MiningClient`.
- `client.token`: Instance of `TokenClient`.
- `client.revenue`: Instance of `RevenueClient`.

### `MiningClient`

- `getProtocolStats(): Promise<ProtocolStats>`
- `getMinerInfo(address: string): Promise<MinerInfo>`
- `getMiningPower(address: string): Promise<bigint>`
- `computeTotalMiningPower(): Promise<bigint>`
- `getEpoch(epochId: number): Promise<EpochInfo>`
- `isEpochClaimed(epochId: number, address: string): Promise<boolean>`
- `estimateEpochReward(epochId: number, address: string): Promise<EstimatedClaimReward>`
- `getUnclaimedEpochs(address: string, maxLookback?: number): Promise<number[]>`
- `getEmergencyExitQuote(address: string): Promise<EmergencyExitQuote>`
- `lock(amount: bigint | string | number): Promise<ContractTransactionResponse>`
- `advanceEpoch(): Promise<ContractTransactionResponse>`
- `claim(epochId: number): Promise<ContractTransactionResponse>`
- `claimBatch(epochIds: number[]): Promise<ContractTransactionResponse>`
- `emergencyExit(): Promise<ContractTransactionResponse>`

### `TokenClient`

- `getBalance(address: string): Promise<bigint>`
- `getBalanceFormatted(address: string, precision?: number): Promise<string>`
- `getAllowance(owner: string, spender: string): Promise<bigint>`
- `hasSufficientAllowance(owner: string, spender: string, amount: bigint | string | number): Promise<boolean>`
- `approve(spender: string, amount: bigint | string | number): Promise<ContractTransactionResponse>`
- `approveMax(spender: string): Promise<ContractTransactionResponse>`
- `transfer(recipient: string, amount: bigint | string | number): Promise<ContractTransactionResponse>`
- `getTotalSupply(): Promise<bigint>`

---

## Protocol Math & Power Ramp

Miner power follows a strict 21-day linear maturation schedule to incentivize stability:

$$\text{Power} = \text{Locked Amount} \times \left(5\% + 95\% \times \frac{\text{Elapsed Seconds}}{21 \times 86400}\right)$$

- **Day 0**: Miner starts at **5%** mining power.
- **Day 10.5**: Miner reaches **52.5%** mining power.
- **Day 21+**: Miner achieves **100%** full mining power.

---

## Security

`gpufi-sdk` is built to be non-custodial and secure. For responsible disclosure details, see [SECURITY.md](./SECURITY.md).

---

## License

Distributed under the **MIT License**. See [LICENSE](./LICENSE) for details.
