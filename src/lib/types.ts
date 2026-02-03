// Super Bowl LIX - February 9, 2025
// Kansas City Chiefs vs Philadelphia Eagles

export const SUPER_BOWL = {
  year: 2025,
  name: 'Super Bowl LIX',
  date: '2025-02-09T18:30:00-05:00', // 6:30 PM ET
  teams: {
    afc: {
      name: 'Kansas City Chiefs',
      shortName: 'Chiefs',
      abbreviation: 'KC',
      color: '#E31837',
    },
    nfc: {
      name: 'Philadelphia Eagles', 
      shortName: 'Eagles',
      abbreviation: 'PHI',
      color: '#004C54',
    },
  },
} as const;

export type TeamSide = 'afc' | 'nfc';

export interface Square {
  index: number;
  owner: string | null; // Wallet address
  ownerDisplay: string | null; // Shortened display
  purchasedAt: number | null;
}

export type NumberRandomization = 'fixed' | 'per-half' | 'per-quarter';
export type LobbyVisibility = 'public' | 'private';

export interface PayoutSettings {
  q1: number; // Percentage (0-100)
  q2: number;
  q3: number;
  q4: number;
  house: number;
}

export const DEFAULT_PAYOUTS: PayoutSettings = {
  q1: 20,
  q2: 20,
  q3: 20,
  q4: 30,
  house: 10,
};

export interface NumberAssignment {
  rowNumbers: number[]; // Team 1 (AFC - Chiefs)
  colNumbers: number[]; // Team 2 (NFC - Eagles)
  assignedAt: number;
}

export interface GameScore {
  afc: number; // Chiefs score
  nfc: number; // Eagles score
  quarter: 0 | 1 | 2 | 3 | 4 | 5; // 0 = not started, 5 = final/OT
  timeRemaining: string;
  isLive: boolean;
  lastUpdated: number;
}

export interface QuarterResult {
  quarter: 1 | 2 | 3 | 4;
  afcScore: number;
  nfcScore: number;
  afcDigit: number;
  nfcDigit: number;
  winningSquareIndex: number | null;
  winnerWallet: string | null;
  paidOut: boolean;
  paidOutAt: number | null;
  txSignature: string | null;
}

export interface Group {
  id: string;
  name: string;
  
  // Teams - defaults to Super Bowl teams
  team1: string; // Row team (AFC)
  team2: string; // Column team (NFC)
  
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
  afcScore: number,
  nfcScore: number,
  numbers: NumberAssignment
): number | null {
  const afcDigit = afcScore % 10;
  const nfcDigit = nfcScore % 10;
  
  const rowIndex = numbers.rowNumbers.indexOf(afcDigit);
  const colIndex = numbers.colNumbers.indexOf(nfcDigit);
  
  if (rowIndex === -1 || colIndex === -1) return null;
  
  return rowIndex * 10 + colIndex;
}

// Calculate payout amount
export function calculatePayout(
  totalPool: number,
  payouts: PayoutSettings,
  quarter: 1 | 2 | 3 | 4
): number {
  const percentage = payouts[`q${quarter}` as keyof PayoutSettings] as number;
  return (totalPool * percentage) / 100;
}

// Short wallet display
export function shortenWallet(wallet: string, chars = 4): string {
  if (wallet.length <= chars * 2) return wallet;
  return `${wallet.slice(0, chars)}...${wallet.slice(-chars)}`;
}
