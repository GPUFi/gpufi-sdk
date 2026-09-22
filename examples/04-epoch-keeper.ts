import { Wallet } from 'ethers';
import { GPUFiClient, formatDuration } from '../src';

/**
 * Example 04: Automated Epoch Keeper Bot
 * Monitors epoch countdown and triggers advanceEpoch() to earn the 0.1% keeper bounty.
 */
async function main() {
  const client = new GPUFiClient();

  // Keeper wallet setup
  const keeperPrivateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const provider = client.runner as any;
  const keeperSigner = new Wallet(keeperPrivateKey, provider);
  const authedClient = client.connect(keeperSigner);

  console.log('--- GPUFi Autonomous Keeper Bot Initialized ---');

  async function checkAndAdvance() {
    try {
      const stats = await authedClient.mining.getProtocolStats();
      console.log(`[Epoch #${stats.currentEpoch}] Time remaining: ${formatDuration(stats.timeRemainingSeconds)} | Pool: ${stats.pendingEthPoolFormatted} ETH, ${stats.pendingGpufPoolFormatted} GPUF`);

      if (stats.canAdvanceEpoch) {
        console.log('⚡ Epoch duration reached! Advancing epoch and claiming keeper bounty...');
        const tx = await authedClient.mining.advanceEpoch();
        console.log(`Advance transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log(`✓ Epoch advanced successfully! New current epoch: #${stats.currentEpoch + 1}`);
      }
    } catch (err: any) {
      console.error('Keeper error:', err.message);
    }
  }

  // Poll every 30 seconds
  await checkAndAdvance();
  setInterval(checkAndAdvance, 30_000);
}

main().catch(console.error);
