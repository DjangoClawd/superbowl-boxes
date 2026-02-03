'use client';

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Group, PLATFORM_FEE_PERCENT, calculatePrizeBreakdown } from './types';

// Solana connection (using public RPC for now)
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
// For devnet testing: 'https://api.devnet.solana.com'

export function getConnection(): Connection {
  return new Connection(SOLANA_RPC, 'confirmed');
}

// Convert SOL to lamports
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

// Convert lamports to SOL
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

// Create payment transaction for buying squares
export async function createSquarePurchaseTransaction(
  buyerPubkey: PublicKey,
  recipientPubkey: PublicKey, // Group creator / escrow
  amountSol: number
): Promise<Transaction> {
  const connection = getConnection();
  const transaction = new Transaction();
  
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyerPubkey,
      toPubkey: recipientPubkey,
      lamports: solToLamports(amountSol),
    })
  );
  
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = buyerPubkey;
  
  return transaction;
}

// Create payout transaction (from escrow to winner)
export async function createPayoutTransaction(
  escrowPubkey: PublicKey,
  winnerPubkey: PublicKey,
  amountSol: number
): Promise<Transaction> {
  const connection = getConnection();
  const transaction = new Transaction();
  
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: escrowPubkey,
      toPubkey: winnerPubkey,
      lamports: solToLamports(amountSol),
    })
  );
  
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = escrowPubkey;
  
  return transaction;
}

// Get full prize breakdown for a group
export function getPrizeBreakdown(group: Group): {
  total: number;
  platformFee: number;
  creatorFee: number;
  prizePool: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
} {
  const filledSquares = group.squares.filter(s => s.owner !== null).length;
  const total = filledSquares * group.pricePerSquare;
  
  const breakdown = calculatePrizeBreakdown(total, group.payouts);
  
  return {
    total,
    ...breakdown,
  };
}

// Validate payout settings
export function validatePayouts(payouts: { q1: number; q2: number; q3: number; q4: number; creatorFee: number }): {
  valid: boolean;
  error?: string;
} {
  // Creator fee must be 0-15%
  if (payouts.creatorFee < 0 || payouts.creatorFee > 15) {
    return { valid: false, error: 'Creator fee must be between 0% and 15%' };
  }
  
  // Quarter payouts must sum to a reasonable amount
  const quarterTotal = payouts.q1 + payouts.q2 + payouts.q3 + payouts.q4;
  if (quarterTotal <= 0) {
    return { valid: false, error: 'Prize distribution cannot be zero' };
  }
  
  // All values must be non-negative
  if (payouts.q1 < 0 || payouts.q2 < 0 || payouts.q3 < 0 || payouts.q4 < 0) {
    return { valid: false, error: 'Prize percentages cannot be negative' };
  }
  
  return { valid: true };
}

// Default escrow address (would be a PDA in production)
export const ESCROW_PUBKEY = new PublicKey('11111111111111111111111111111111'); // Placeholder

// Platform fee wallet (where 5% goes)
export const PLATFORM_WALLET = new PublicKey('11111111111111111111111111111111'); // Placeholder

// Sign and send transaction using wallet adapter
export async function signAndSendTransaction(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallet: any, // WalletContextState from @solana/wallet-adapter-react
  transaction: Transaction
): Promise<string> {
  if (!wallet.signTransaction) {
    throw new Error('Wallet does not support signing');
  }
  
  const connection = getConnection();
  const signedTx = await wallet.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signedTx.serialize());
  
  // Wait for confirmation
  await connection.confirmTransaction(signature, 'confirmed');
  
  return signature;
}

// Get SOL balance
export async function getSolBalance(pubkey: PublicKey): Promise<number> {
  const connection = getConnection();
  const balance = await connection.getBalance(pubkey);
  return lamportsToSol(balance);
}

// Format SOL amount for display
export function formatSol(amount: number, decimals = 2): string {
  return amount.toFixed(decimals);
}

// Get platform fee percentage (exported for display)
export { PLATFORM_FEE_PERCENT };
