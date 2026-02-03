'use client';

import { GameScore, SUPER_BOWL } from './types';

// ESPN Scoreboard API (unofficial but reliable)
const ESPN_API = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';

// Mock scores for testing
let mockScore: GameScore = {
  afc: 0,
  nfc: 0,
  quarter: 0,
  timeRemaining: '15:00',
  isLive: false,
  lastUpdated: Date.now(),
};

// For demo/testing - manually update scores
export function setMockScore(score: Partial<GameScore>): void {
  mockScore = { ...mockScore, ...score, lastUpdated: Date.now() };
  // Broadcast to listeners
  scoreListeners.forEach(listener => listener(mockScore));
}

// Score listeners for real-time updates
const scoreListeners: ((score: GameScore) => void)[] = [];

export function subscribeToScores(listener: (score: GameScore) => void): () => void {
  scoreListeners.push(listener);
  return () => {
    const index = scoreListeners.indexOf(listener);
    if (index > -1) scoreListeners.splice(index, 1);
  };
}

// Parse ESPN response to find Super Bowl game
interface ESPNEvent {
  id: string;
  name: string;
  status: {
    type: {
      state: string;
      completed: boolean;
    };
    period: number;
    displayClock: string;
  };
  competitions: Array<{
    competitors: Array<{
      team: {
        abbreviation: string;
        displayName: string;
      };
      score: string;
    }>;
  }>;
}

interface ESPNResponse {
  events: ESPNEvent[];
}

function parseESPNResponse(data: ESPNResponse): GameScore | null {
  // Find Chiefs vs Eagles game
  const game = data.events?.find(event => {
    const name = event.name?.toLowerCase() || '';
    return (
      (name.includes('chiefs') && name.includes('eagles')) ||
      name.includes('super bowl')
    );
  });
  
  if (!game) return null;
  
  const competition = game.competitions?.[0];
  if (!competition) return null;
  
  let afcScore = 0;
  let nfcScore = 0;
  
  competition.competitors.forEach(team => {
    const abbr = team.team.abbreviation?.toUpperCase();
    const score = parseInt(team.score) || 0;
    
    if (abbr === 'KC' || team.team.displayName?.includes('Chiefs')) {
      afcScore = score;
    } else if (abbr === 'PHI' || team.team.displayName?.includes('Eagles')) {
      nfcScore = score;
    }
  });
  
  const state = game.status?.type?.state || 'pre';
  const isLive = state === 'in';
  const isCompleted = game.status?.type?.completed || state === 'post';
  
  let quarter: 0 | 1 | 2 | 3 | 4 | 5 = 0;
  if (isLive) {
    quarter = Math.min(game.status?.period || 1, 4) as 1 | 2 | 3 | 4;
  } else if (isCompleted) {
    quarter = 5; // Final
  }
  
  return {
    afc: afcScore,
    nfc: nfcScore,
    quarter,
    timeRemaining: game.status?.displayClock || '0:00',
    isLive,
    lastUpdated: Date.now(),
  };
}

// Fetch live scores
export async function fetchLiveScore(): Promise<GameScore> {
  // Check if we're in mock mode (for testing)
  if (typeof window !== 'undefined' && (window as unknown as { MOCK_SCORES?: boolean }).MOCK_SCORES) {
    return mockScore;
  }
  
  try {
    const response = await fetch(ESPN_API, {
      next: { revalidate: 10 }, // Cache for 10 seconds
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch scores');
    }
    
    const data = await response.json();
    const score = parseESPNResponse(data);
    
    if (score) {
      // Notify listeners
      scoreListeners.forEach(listener => listener(score));
      return score;
    }
    
    // No game found - check if it's game day
    const gameDate = new Date(SUPER_BOWL.date);
    const now = new Date();
    
    if (now < gameDate) {
      return {
        afc: 0,
        nfc: 0,
        quarter: 0,
        timeRemaining: '15:00',
        isLive: false,
        lastUpdated: Date.now(),
      };
    }
    
    return mockScore;
  } catch (error) {
    console.error('Error fetching scores:', error);
    return mockScore;
  }
}

// Hook for polling scores
export function useScorePolling(intervalMs = 10000): void {
  if (typeof window === 'undefined') return;
  
  const poll = async () => {
    await fetchLiveScore();
  };
  
  // Initial fetch
  poll();
  
  // Set up interval
  const interval = setInterval(poll, intervalMs);
  
  // Cleanup on unmount
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => clearInterval(interval));
  }
}

// Get countdown to game
export function getGameCountdown(): { days: number; hours: number; minutes: number; seconds: number } | null {
  const gameDate = new Date(SUPER_BOWL.date);
  const now = new Date();
  
  const diff = gameDate.getTime() - now.getTime();
  
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
}

// Format countdown string
export function formatCountdown(countdown: ReturnType<typeof getGameCountdown>): string {
  if (!countdown) return 'Game Started!';
  
  const { days, hours, minutes, seconds } = countdown;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}
