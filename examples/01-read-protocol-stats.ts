import { GPUFiClient, formatDuration } from '../src';

/**
 * Example 01: Read Global Protocol Stats
 * Demonstrates public read-only query — zero API keys or signer required.
 */
async function main() {
  // Connects automatically to public Robinhood Chain Mainnet RPC
  const client = new GPUFiClient();

  console.log('Connecting to GPUFi Protocol on Robinhood Chain...');
  const stats = await client.mining.getProtocolStats();

  console.log('\n--- Protocol Telemetry ---');
  console.log(`Current Epoch: #${stats.currentEpoch}`);
  console.log(`Epoch Started: ${stats.epochStartDate.toLocaleString()}`);
  console.log(`Time Remaining: ${formatDuration(stats.timeRemainingSeconds)}`);
  console.log(`Can Advance Epoch: ${stats.canAdvanceEpoch ? 'YES (Keeper reward available)' : 'NO'}`);
  console.log(`Total Staked: ${stats.totalStakedFormatted} GPUF`);
  console.log(`Total Miners: ${stats.totalMinersCount}`);
  console.log(`Network Mining Power: ${stats.totalNetworkMiningPowerFormatted}`);
  console.log(`Pending Epoch Pool: ${stats.pendingEthPoolFormatted} ETH + ${stats.pendingGpufPoolFormatted} GPUF`);
}

main().catch(console.error);
