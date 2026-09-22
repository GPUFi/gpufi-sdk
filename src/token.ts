import { Contract, ContractRunner, MaxUint256 } from 'ethers';
import { GPUF_TOKEN_ABI } from './constants/abis';
import { formatTokenAmount, parseTokenAmount } from './utils/format';

export class TokenClient {
  public readonly contract: Contract;
  public readonly address: string;

  constructor(tokenAddress: string, runner: ContractRunner) {
    this.address = tokenAddress;
    this.contract = new Contract(tokenAddress, GPUF_TOKEN_ABI, runner);
  }

  /**
   * Connect with a new ContractRunner (e.g. switching from Provider to Signer).
   */
  public connect(runner: ContractRunner): TokenClient {
    return new TokenClient(this.address, runner);
  }

  /**
   * Read raw balance of an account in BigInt (18 decimals).
   */
  public async getBalance(account: string): Promise<bigint> {
    return await this.contract.balanceOf(account);
  }

  /**
   * Read formatted balance with precision.
   */
  public async getBalanceFormatted(account: string, precision: number = 4): Promise<string> {
    const balance = await this.getBalance(account);
    return formatTokenAmount(balance, 18, precision);
  }

  /**
   * Check allowance granted to a spender.
   */
  public async getAllowance(owner: string, spender: string): Promise<bigint> {
    return await this.contract.allowance(owner, spender);
  }

  /**
   * Check if allowance is sufficient for a specific amount.
   */
  public async hasSufficientAllowance(owner: string, spender: string, amount: bigint | string | number): Promise<boolean> {
    const target = typeof amount === 'bigint' ? amount : parseTokenAmount(amount);
    const allowance = await this.getAllowance(owner, spender);
    return allowance >= target;
  }

  /**
   * Approve a spender to withdraw a specific amount of GPUF.
   * Requires a Signer runner.
   */
  public async approve(spender: string, amount: bigint | string | number) {
    const target = typeof amount === 'bigint' ? amount : parseTokenAmount(amount);
    return await this.contract.approve(spender, target);
  }

  /**
   * Approve unlimited allowance (MaxUint256) for a spender.
   * Requires a Signer runner.
   */
  public async approveMax(spender: string) {
    return await this.contract.approve(spender, MaxUint256);
  }

  /**
   * Transfer GPUF tokens to a recipient.
   * Requires a Signer runner.
   */
  public async transfer(recipient: string, amount: bigint | string | number) {
    const target = typeof amount === 'bigint' ? amount : parseTokenAmount(amount);
    return await this.contract.transfer(recipient, target);
  }

  /**
   * Get total supply of GPUF.
   */
  public async getTotalSupply(): Promise<bigint> {
    return await this.contract.totalSupply();
  }
}
