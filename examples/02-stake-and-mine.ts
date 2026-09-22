import { Wallet } from 'ethers';
import { GPUFiClient, parseTokenAmount } from '../src';

/**
 * Example 02: Stake GPUF & Activate Mining
 * Demonstrates wallet connection, ERC-20 approval, and staking lock.
 */
async function main() {
  const client = new GPUFiClient();

  // Developers supply their own standard ethers Wallet or Signer
  // Replace with your wallet signer (e.g. from browser provider or secure private key)
  const dummyPrivateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const provider = client.runner as any;
  const signer = new Wallet(dummyPrivateKey, provider);

  // Connect client with authenticated signer
  const authedClient = client.connect(signer);
  const userAddress = await signer.getAddress();
  const stakeAmount = '1000'; // 1,000 GPUF

  console.log(`Connecting wallet: ${userAddress}`);

  // 1. Check current balance
  const balance = await authedClient.token.getBalance(userAddress);
  console.log(`Balance: ${authedClient.token.getBalanceFormatted(userAddress)} GPUF`);

  // 2. Check & approve allowance
  const hasAllowance = await authedClient.token.hasSufficientAllowance(
    userAddress,
    authedClient.miningAddress,
    stakeAmount
  );

  if (!hasAllowance) {
    console.log(`Approving ${stakeAmount} GPUF for mining contract...`);
    const approveTx = await authedClient.token.approve(authedClient.miningAddress, stakeAmount);
    console.log(`Approve tx sent: ${approveTx.hash}. Waiting for confirmation...`);
    await approveTx.wait();
    console.log('Approval confirmed!');
  }

  // 3. Lock / Stake tokens
  console.log(`Locking ${stakeAmount} GPUF into mining contract...`);
  const lockTx = await authedClient.mining.lock(stakeAmount);
  console.log(`Lock tx sent: ${lockTx.hash}`);
  await lockTx.wait();

  // 4. Fetch updated miner status
  const minerInfo = await authedClient.mining.getMinerInfo(userAddress);
  console.log(`Successfully locked! Total active lock: ${minerInfo.lockedAmountFormatted} GPUF`);
  console.log(`Current power: ${minerInfo.powerPercentageOfLock}% (Linear 21-day ramp active)`);
}

main().catch(console.error);
