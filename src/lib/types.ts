// Super Bowl LX - February 8, 2026
// Seattle Seahawks vs New England Patriots
// Levi's Stadium, Santa Clara, CA

export const SUPER_BOWL = {
  number: 60,
  numeral: 'LX',
  year: 2026,
  name: 'Super Bowl LX',
  date: '2026-02-08T15:30:00-08:00', // 3:30 PM PT / 6:30 PM ET
  venue: "Levi's Stadium",
  city: 'Santa Clara, CA',
  teams: {
    afc: {
      name: 'New England Patriots',
      shortName: 'Patriots',
      abbreviation: 'NE',
      color: '#002244',
      emoji: '🔵',
    },
    nfc: {
      name: 'Seattle Seahawks',
      shortName: 'Seahawks', 
      abbreviation: 'SEA',
      color: '#002244',
      emoji: '🦅',
    },
  },
} as const;

// Platform fee is FIXED - this is what the website takes
export const PLATFORM_FEE_PERCENT = 5;

export type TeamSide = 'afc' | 'nfc';

export interface Square {
  index: number;
  owner: string | null; // Wallet address
  ownerDisplay: string | null; // Shortened display
  purchasedAt: number | null;
}

export type NumberRandomization = 'fixed' | 'per-half' | 'per-quarter';
export type LobbyVisibility = 'public' | 'private';

// Payout settings - creator configures prize distribution + their cut
export interface PayoutSettings {
  q1: number; // Percentage (0-100)
  q2: number;
  q3: number;
  q4: number;
  creatorFee: number; // Creator's cut (0-15%)
  // Note: Platform fee (5%) is automatic and not shown here
}

// Default payouts (before platform fee)
// Total should be 100% (platform fee comes off the top)
export const DEFAULT_PAYOUTS: PayoutSettings = {
  q1: 20,
  q2: 20,
  q3: 20,
  q4: 35,
  creatorFee: 5, // Creator takes 5%, players get prizes from remaining 95%
};

export interface NumberAssignment {
  rowNumbers: number[]; // Team 1 (NFC - Seahawks)
  colNumbers: number[]; // Team 2 (AFC - Patriots)
  assignedAt: number;
}

export interface GameScore {
  nfc: number; // Seahawks score
  afc: number; // Patriots score
  quarter: 0 | 1 | 2 | 3 | 4 | 5; // 0 = not started, 5 = final/OT
  timeRemaining: string;
  isLive: boolean;
  lastUpdated: number;
}

export interface QuarterResult {
  quarter: 1 | 2 | 3 | 4;
  nfcScore: number;
  afcScore: number;
  nfcDigit: number;
  afcDigit: number;
  winningSquareIndex: number | null;
  winnerWallet: string | null;
  prizeAmount: number;
  paidOut: boolean;
  paidOutAt: number | null;
  txSignature: string | null;
}

export interface Group {
  id: string;
  name: string;
  
  // Teams - fixed to Super Bowl teams
  team1: string; // Row team (NFC - Seahawks)
  team2: string; // Column team (AFC - Patriots)
  
  // Settings
  pricePerSquare: number;
  currency: 'SOL' | 'USDC';
  visibility: LobbyVisibility;
  inviteCode: string | null; // For private groups
  payouts: PayoutSettings;
  numberRandomization: NumberRandomization;
  
  // Creator info
  creator: string; // Wallet address
  creatorDisplay: string;
  createdAt: number;
  
  // Squares
  squares: Square[];
  
  // Number assignments
  numbers: {
    current: NumberAssignment | null;
    q1: NumberAssignment | null;
    q2: NumberAssignment | null; // halftime
    q3: NumberAssignment | null;
    q4: NumberAssignment | null;
  };
  
  // Game results
  quarterResults: QuarterResult[];
  
  // Status
  status: 'open' | 'full' | 'locked' | 'live' | 'completed';
  lockedAt: number | null;
}

export interface CreateGroupInput {
  name: string;
  pricePerSquare: number;
  currency: 'SOL' | 'USDC';
  visibility: LobbyVisibility;
  payouts: PayoutSettings;
  numberRandomization: NumberRandomization;
}

// Helper to generate unique IDs
export function generateId(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper to generate invite codes
export function generateInviteCode(): string {
  return generateId(6).toUpperCase();
}

// Helper to shuffle array (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate random number assignment
export function generateNumberAssignment(): NumberAssignment {
  return {
    rowNumbers: shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    colNumbers: shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    assignedAt: Date.now(),
  };
}

// Find winning square for a score
export function findWinningSquare(
  nfcScore: number,
  afcScore: number,
  numbers: NumberAssignment
): number | null {
  const nfcDigit = nfcScore % 10;
  const afcDigit = afcScore % 10;
  
  const rowIndex = numbers.rowNumbers.indexOf(nfcDigit);
  const colIndex = numbers.colNumbers.indexOf(afcDigit);
  
  if (rowIndex === -1 || colIndex === -1) return null;
  
  return rowIndex * 10 + colIndex;
}

// Calculate prize pool breakdown
export function calculatePrizeBreakdown(
  totalPool: number,
  payouts: PayoutSettings
): {
  platformFee: number;
  creatorFee: number;
  prizePool: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
} {
  // Platform takes 5% off the top
  const platformFee = (totalPool * PLATFORM_FEE_PERCENT) / 100;
  const afterPlatform = totalPool - platformFee;
  
  // Creator takes their cut
  const creatorFee = (afterPlatform * payouts.creatorFee) / 100;
  const prizePool = afterPlatform - creatorFee;
  
  // Distribute prizes according to settings
  // Normalize the quarter percentages to sum to 100
  const quarterTotal = payouts.q1 + payouts.q2 + payouts.q3 + payouts.q4;
  
  return {
    platformFee,
    creatorFee,
    prizePool,
    q1: (prizePool * payouts.q1) / quarterTotal,
    q2: (prizePool * payouts.q2) / quarterTotal,
    q3: (prizePool * payouts.q3) / quarterTotal,
    q4: (prizePool * payouts.q4) / quarterTotal,
  };
}

// Short wallet display
export function shortenWallet(wallet: string, chars = 4): string {
  if (wallet.length <= chars * 2) return wallet;
  return `${wallet.slice(0, chars)}...${wallet.slice(-chars)}`;
}
