import { baseSepolia } from 'viem/chains';
import { USDC_CONFIG, parseUSDC } from './usdc';

// NFT minting configuration using USDC
export const NFT_MINTING_CONFIG = {
  // Cost per NFT mint in USDC
  MINT_COST: USDC_CONFIG.MINT_COST_USDC, // 0.1 USDC per NFT
  // Maximum number of NFTs that can be minted without additional confirmation
  MAX_MINTS_PER_SESSION: USDC_CONFIG.MAX_MINTS_PER_SESSION, // 100 NFTs
  // Total spend limit for the session
  MAX_SPEND_AMOUNT: USDC_CONFIG.MAX_SPEND_AMOUNT_USDC, // 10 USDC total
  // Session duration (24 hours)
  SESSION_DURATION: USDC_CONFIG.SESSION_DURATION // 24 hours in seconds
} as const;

// Spend permissions configuration for Base Account SDK
export const SPEND_PERMISSIONS_CONFIG = {
  [baseSepolia.id]: {
    maxSpendAmount: parseUSDC(NFT_MINTING_CONFIG.MAX_SPEND_AMOUNT.toString()),
    maxSpendDuration: NFT_MINTING_CONFIG.SESSION_DURATION,
    autoApprove: true
  }
} as const;

// Utility functions for spend permissions
export function getSpendPermissionsInfo() {
  return {
    maxSpendAmount: NFT_MINTING_CONFIG.MAX_SPEND_AMOUNT,
    maxMintsPerSession: NFT_MINTING_CONFIG.MAX_MINTS_PER_SESSION,
    mintCost: NFT_MINTING_CONFIG.MINT_COST,
    sessionDuration: NFT_MINTING_CONFIG.SESSION_DURATION
  };
}

export function canMintNFT(currentMintCount: number): boolean {
  return currentMintCount < NFT_MINTING_CONFIG.MAX_MINTS_PER_SESSION;
}

export function getRemainingMints(currentMintCount: number): number {
  return Math.max(0, NFT_MINTING_CONFIG.MAX_MINTS_PER_SESSION - currentMintCount);
}

export function getTotalSpendAmount(mintCount: number): number {
  return NFT_MINTING_CONFIG.MINT_COST * mintCount;
}
