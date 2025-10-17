import { parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

// USDC contract address on Base Sepolia
export const USDC_CONTRACT_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// USDC ABI - minimal interface for approve/transfer/balanceOf
export const USDC_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      }
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// USDC configuration
export const USDC_CONFIG = {
  // Cost per NFT mint in USDC
  MINT_COST_USDC: 0.1, // 0.1 USDC per NFT
  // Maximum number of NFTs that can be minted without additional confirmation
  MAX_MINTS_PER_SESSION: 10,
  // Total spend limit for the session (10 NFTs * 0.1 USDC)
  MAX_SPEND_AMOUNT_USDC: 1, // 1 USDC total
  // Session duration (24 hours)
  SESSION_DURATION: 24 * 60 * 60, // 24 hours in seconds
  // USDC has 6 decimals
  DECIMALS: 6
} as const;

// Utility functions
export function parseUSDC(amount: string): bigint {
  return parseUnits(amount, USDC_CONFIG.DECIMALS);
}

export function formatUSDC(amount: bigint): string {
  return (Number(amount) / Math.pow(10, USDC_CONFIG.DECIMALS)).toFixed(USDC_CONFIG.DECIMALS);
}

export function getUSDCSpendPermissionsInfo() {
  return {
    mintCost: USDC_CONFIG.MINT_COST_USDC,
    maxSpendAmount: USDC_CONFIG.MAX_SPEND_AMOUNT_USDC,
    maxMintsPerSession: USDC_CONFIG.MAX_MINTS_PER_SESSION,
    decimals: USDC_CONFIG.DECIMALS
  };
}

export function canMintUSDC(currentMintCount: number): boolean {
  return currentMintCount < USDC_CONFIG.MAX_MINTS_PER_SESSION;
}

export function getRemainingUSDMints(currentMintCount: number): number {
  return Math.max(0, USDC_CONFIG.MAX_MINTS_PER_SESSION - currentMintCount);
}
