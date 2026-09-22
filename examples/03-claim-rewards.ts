import { Wallet } from 'ethers';
import { GPUFiClient } from '../src';

/**
 * Example 03: Claim Dual Mining Rewards (ETH + GPUF)
 * Demonstrates inspecting past epochs and batch claiming.
 */
async function main() {
  const client = new GPUFiClient();

  const dummyPrivateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const provider = client.runner as any;
  const signer = new Wallet(dummyPrivateKey, provider);
  const authedClient = client.connect(signer);
  const userAddress = await signer.getAddress();

  console.log(`Checking unclaimed epochs for: ${userAddress}...`);
  const unclaimedEpochs = await authedClient.mining.getUnclaimedEpochs(userAddress, 10);

  if (unclaimedEpochs.length === 0) {
    console.log('No unclaimed rewards found for past epochs.');
    return;
  }

  console.log(`Found ${unclaimedEpochs.length} unclaimed epoch(s): ${unclaimedEpochs.join(', ')}`);

  // Inspect each unclaimed epoch
  for (const ep of unclaimedEpochs) {
    const reward = await authedClient.mining.estimateEpochReward(ep, userAddress);
    console.log(`- Epoch #${ep}: ${reward.userEthRewardFormatted} ETH + ${reward.userGpufRewardFormatted} GPUF`);
  }

  // Claim all in a single batch transaction
  console.log('Executing batch claim...');
  const tx = await authedClient.mining.claimBatch(unclaimedEpochs);
  console.log(`Batch claim submitted: ${tx.hash}`);
  await tx.wait();
  console.log('Claim successfully confirmed! Rewards deposited directly to wallet.');
}

main().catch(console.error);
