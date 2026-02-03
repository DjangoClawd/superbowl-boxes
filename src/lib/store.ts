'use client';

import { 
  Group, 
  Square, 
  CreateGroupInput, 
  generateId, 
  generateInviteCode,
  generateNumberAssignment,
  DEFAULT_PAYOUTS,
  shortenWallet,
  SUPER_BOWL,
  calculatePrizeBreakdown,
  GRID_CONFIGS,
} from './types';

const STORAGE_KEY = 'sbboxes_v3';

// Get all groups
export function getAllGroups(): Record<string, Group> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

// Get single group
export function getGroup(id: string): Group | null {
  const groups = getAllGroups();
  return groups[id] || null;
}

// Get group by invite code
export function getGroupByInviteCode(code: string): Group | null {
  const groups = getAllGroups();
  const upperCode = code.toUpperCase();
  return Object.values(groups).find(g => g.inviteCode === upperCode) || null;
}

// Get public groups
export function getPublicGroups(): Group[] {
  const groups = getAllGroups();
  return Object.values(groups)
    .filter(g => g.visibility === 'public' && g.status !== 'completed')
    .sort((a, b) => b.createdAt - a.createdAt);
}

// Save groups
function saveGroups(groups: Record<string, Group>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

// Create group
export function createGroup(input: CreateGroupInput, creatorWallet: string): Group {
  const groups = getAllGroups();
  const id = generateId();
  
  // Get grid config
  const gridConfig = GRID_CONFIGS[input.gridSize];
  const totalSquares = gridConfig.totalSquares;
  
  // Create empty squares
  const squares: Square[] = Array(totalSquares).fill(null).map((_, i) => ({
    index: i,
    owner: null,
    ownerDisplay: null,
    purchasedAt: null,
  }));
  
  const group: Group = {
    id,
    name: input.name,
    team1: SUPER_BOWL.teams.nfc.name, // Rows = Seahawks
    team2: SUPER_BOWL.teams.afc.name, // Columns = Patriots
    pricePerSquare: input.pricePerSquare,
    currency: input.currency,
    visibility: input.visibility,
    inviteCode: input.visibility === 'private' ? generateInviteCode() : null,
    payouts: input.payouts,
    numberRandomization: input.numberRandomization,
    gridSize: input.gridSize,
    creator: creatorWallet,
    creatorName: input.creatorName || 'Anonymous',
    creatorDisplay: shortenWallet(creatorWallet),
    createdAt: Date.now(),
    squares,
    numbers: {
      current: null,
      q1: null,
      q2: null,
      q3: null,
      q4: null,
    },
    quarterResults: [],
    status: 'open',
    lockedAt: null,
  };
  
  groups[id] = group;
  saveGroups(groups);
  
  return group;
}

// Purchase squares
export function purchaseSquares(
  groupId: string, 
  squareIndices: number[], 
  buyerWallet: string
): Group | null {
  const groups = getAllGroups();
  const group = groups[groupId];
  
  if (!group) return null;
  
  const gridConfig = GRID_CONFIGS[group.gridSize || '10x10'];
  const totalSquares = gridConfig.totalSquares;
  
  const buyerDisplay = shortenWallet(buyerWallet);
  const now = Date.now();
  
  squareIndices.forEach(index => {
    if (index >= 0 && index < totalSquares && !group.squares[index].owner) {
      group.squares[index] = {
        index,
        owner: buyerWallet,
        ownerDisplay: buyerDisplay,
        purchasedAt: now,
      };
    }
  });
  
  // Check if full
  const filledCount = group.squares.filter(s => s.owner !== null).length;
  if (filledCount === totalSquares) {
    group.status = 'full';
  }
  
  groups[groupId] = group;
  saveGroups(groups);
  
  return group;
}

// Lock group and assign numbers
export function lockGroup(groupId: string): Group | null {
  const groups = getAllGroups();
  const group = groups[groupId];
  
  if (!group) return null;
  
  const gridSize = group.gridSize || '10x10';
  
  // Assign numbers based on randomization setting
  const assignment = generateNumberAssignment(gridSize);
  
  if (group.numberRandomization === 'fixed') {
    // Same numbers for all quarters
    group.numbers = {
      current: assignment,
      q1: assignment,
      q2: assignment,
      q3: assignment,
      q4: assignment,
    };
  } else if (group.numberRandomization === 'per-half') {
    // Different for each half
    const secondHalf = generateNumberAssignment(gridSize);
    group.numbers = {
      current: assignment,
      q1: assignment,
      q2: assignment,
      q3: secondHalf,
      q4: secondHalf,
    };
  } else {
    // per-quarter - different for each quarter
    group.numbers = {
      current: assignment,
      q1: assignment,
      q2: generateNumberAssignment(gridSize),
      q3: generateNumberAssignment(gridSize),
      q4: generateNumberAssignment(gridSize),
    };
  }
  
  group.status = 'locked';
  group.lockedAt = Date.now();
  
  groups[groupId] = group;
  saveGroups(groups);
  
  return group;
}

// Update numbers for a quarter (for per-quarter/per-half modes)
export function updateQuarterNumbers(groupId: string, quarter: 1 | 2 | 3 | 4): Group | null {
  const groups = getAllGroups();
  const group = groups[groupId];
  
  if (!group) return null;
  
  const quarterKey = `q${quarter}` as 'q1' | 'q2' | 'q3' | 'q4';
  const numbers = group.numbers[quarterKey];
  
  if (numbers) {
    group.numbers.current = numbers;
  }
  
  groups[groupId] = group;
  saveGroups(groups);
  
  return group;
}

// Record quarter result
export function recordQuarterResult(
  groupId: string,
  quarter: 1 | 2 | 3 | 4,
  nfcScore: number,
  afcScore: number
): Group | null {
  const groups = getAllGroups();
  const group = groups[groupId];
  
  if (!group) return null;
  
  // Get the numbers for this quarter
  const quarterKey = `q${quarter}` as 'q1' | 'q2' | 'q3' | 'q4';
  const numbers = group.numbers[quarterKey];
  
  if (!numbers) return null;
  
  const nfcDigit = nfcScore % 10;
  const afcDigit = afcScore % 10;
  
  const rowIndex = numbers.rowNumbers.indexOf(nfcDigit);
  const colIndex = numbers.colNumbers.indexOf(afcDigit);
  const winningSquareIndex = rowIndex * 10 + colIndex;
  const winnerWallet = group.squares[winningSquareIndex]?.owner || null;
  
  // Calculate prize amount
  const filledSquares = group.squares.filter(s => s.owner !== null).length;
  const totalPool = filledSquares * group.pricePerSquare;
  const breakdown = calculatePrizeBreakdown(totalPool, group.payouts);
  const prizeAmount = breakdown[quarterKey];
  
  // Check if we already have this quarter
  const existingIndex = group.quarterResults.findIndex(r => r.quarter === quarter);
  
  const result = {
    quarter,
    nfcScore,
    afcScore,
    nfcDigit,
    afcDigit,
    winningSquareIndex,
    winnerWallet,
    prizeAmount,
    paidOut: false,
    paidOutAt: null,
    txSignature: null,
  };
  
  if (existingIndex >= 0) {
    group.quarterResults[existingIndex] = result;
  } else {
    group.quarterResults.push(result);
  }
  
  // Update status
  if (quarter === 4) {
    group.status = 'completed';
  } else {
    group.status = 'live';
  }
  
  // Update current numbers for next quarter display
  if (quarter < 4 && group.numberRandomization !== 'fixed') {
    const nextQuarter = (quarter + 1) as 1 | 2 | 3 | 4;
    const nextKey = `q${nextQuarter}` as 'q1' | 'q2' | 'q3' | 'q4';
    group.numbers.current = group.numbers[nextKey];
  }
  
  groups[groupId] = group;
  saveGroups(groups);
  
  return group;
}

// Mark quarter as paid out
export function markPaidOut(
  groupId: string,
  quarter: 1 | 2 | 3 | 4,
  txSignature: string
): Group | null {
  const groups = getAllGroups();
  const group = groups[groupId];
  
  if (!group) return null;
  
  const result = group.quarterResults.find(r => r.quarter === quarter);
  if (result) {
    result.paidOut = true;
    result.paidOutAt = Date.now();
    result.txSignature = txSignature;
  }
  
  groups[groupId] = group;
  saveGroups(groups);
  
  return group;
}

// Delete group (creator only)
export function deleteGroup(groupId: string): boolean {
  const groups = getAllGroups();
  if (groups[groupId]) {
    delete groups[groupId];
    saveGroups(groups);
    return true;
  }
  return false;
}
