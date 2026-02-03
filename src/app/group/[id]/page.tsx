'use client';

import { useState, useEffect, use } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { 
  Group, 
  GameScore, 
  SUPER_BOWL,
  PLATFORM_FEE_PERCENT,
  QuarterResult,
  shortenWallet,
} from '@/lib/types';
import { 
  getGroup, 
  purchaseSquares, 
  lockGroup, 
  recordQuarterResult,
  markPaidOut,
} from '@/lib/store';
import { fetchLiveScore, getGameCountdown, formatCountdown } from '@/lib/scores';
import { getPrizeBreakdown, formatSol } from '@/lib/solana';

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { connected, publicKey } = useWallet();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [selectedSquares, setSelectedSquares] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liveScore, setLiveScore] = useState<GameScore | null>(null);
  const [countdown, setCountdown] = useState(getGameCountdown());
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Load group
  useEffect(() => {
    const g = getGroup(id);
    setGroup(g);
  }, [id]);

  // Refresh group periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const g = getGroup(id);
      if (g) setGroup(g);
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getGameCountdown());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live score polling
  useEffect(() => {
    const pollScores = async () => {
      const score = await fetchLiveScore();
      setLiveScore(score);
    };
    
    pollScores();
    const interval = setInterval(pollScores, 15000); // Every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSquareClick = (index: number) => {
    if (!group || group.squares[index].owner || group.status !== 'open') return;
    
    if (selectedSquares.includes(index)) {
      setSelectedSquares(selectedSquares.filter(i => i !== index));
    } else {
      setSelectedSquares([...selectedSquares, index]);
    }
  };

  const handlePurchase = async () => {
    if (!publicKey || !group || selectedSquares.length === 0) return;
    
    setLoading(true);
    
    // TODO: Implement actual Solana payment
    // For now, simulate purchase
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedGroup = purchaseSquares(id, selectedSquares, publicKey.toString());
    if (updatedGroup) {
      setGroup(updatedGroup);
    }
    
    setSelectedSquares([]);
    setLoading(false);
  };

  const handleLockGroup = () => {
    const updatedGroup = lockGroup(id);
    if (updatedGroup) {
      setGroup(updatedGroup);
    }
  };

  const handleRecordScore = (quarter: 1 | 2 | 3 | 4, nfcScore: number, afcScore: number) => {
    const updatedGroup = recordQuarterResult(id, quarter, nfcScore, afcScore);
    if (updatedGroup) {
      setGroup(updatedGroup);
    }
  };

  const handlePayout = async (quarter: 1 | 2 | 3 | 4) => {
    // TODO: Implement actual Solana payout
    const txSig = 'simulated_' + Date.now();
    const updatedGroup = markPaidOut(id, quarter, txSig);
    if (updatedGroup) {
      setGroup(updatedGroup);
    }
  };

  const copyInviteLink = () => {
    const url = group?.visibility === 'private' && group?.inviteCode
      ? `Code: ${group.inviteCode}`
      : `${window.location.origin}/group/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!group) {
    return (
      <main className="min-h-screen pt-24 px-4 text-center">
        <h1 className="text-3xl font-bold text-white">Group not found</h1>
        <Link href="/" className="text-purple-400 hover:underline mt-4 inline-block">
          Go home
        </Link>
      </main>
    );
  }

  const squaresFilled = group.squares.filter(s => s.owner !== null).length;
  const totalCost = selectedSquares.length * group.pricePerSquare;
  const isCreator = publicKey?.toString() === group.creator;
  const prizeBreakdown = getPrizeBreakdown(group);
  const currentNumbers = group.numbers.current;

  // Get the winning square for current display
  const getWinningSquareIndex = (result: QuarterResult) => {
    const numbers = group.numbers[`q${result.quarter}` as 'q1' | 'q2' | 'q3' | 'q4'];
    if (!numbers) return null;
    const rowIndex = numbers.rowNumbers.indexOf(result.nfcDigit);
    const colIndex = numbers.colNumbers.indexOf(result.afcDigit);
    return rowIndex * 10 + colIndex;
  };

  return (
    <main className="min-h-screen pt-24 px-4 pb-12">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏈</span>
            <span className="font-bold text-xl text-white">Super Bowl Boxes</span>
          </Link>
          <div className="flex items-center gap-4">
            {liveScore?.isLive && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-lg">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-white font-bold">
                  {SUPER_BOWL.teams.nfc.abbreviation} {liveScore.nfc} - {liveScore.afc} {SUPER_BOWL.teams.afc.abbreviation}
                </span>
                <span className="text-gray-400 text-sm">Q{liveScore.quarter} {liveScore.timeRemaining}</span>
              </div>
            )}
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Group Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{group.name}</h1>
              {group.visibility === 'private' && (
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">🔒 Private</span>
              )}
              {group.status === 'live' && (
                <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 animate-pulse">🔴 LIVE</span>
              )}
            </div>
            <p className="text-gray-400">
              {group.pricePerSquare} {group.currency} per square • {squaresFilled}/100 filled
              {group.numberRandomization !== 'fixed' && ` • Numbers: ${group.numberRandomization.replace('-', ' ')}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyInviteLink}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition"
            >
              {copied ? '✓ Copied!' : group.visibility === 'private' ? '🔑 Copy Code' : '🔗 Share'}
            </button>
          </div>
        </div>

        {/* Live Score Banner */}
        {liveScore?.isLive && (
          <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-[#002244]/40 via-slate-800/40 to-[#002244]/40 border border-white/10 shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <span className="px-3 py-1 bg-red-500/20 rounded-full text-red-400 text-xs font-bold animate-pulse">
                🔴 LIVE
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-sm text-[#69BE28] font-medium mb-1">{SUPER_BOWL.teams.nfc.emoji} {SUPER_BOWL.teams.nfc.shortName}</div>
                <div className="text-5xl font-bold text-white">{liveScore.nfc}</div>
              </div>
              <div className="text-center px-4">
                <div className="text-xs text-gray-500 mb-1">Quarter</div>
                <div className="text-3xl font-bold text-white">Q{liveScore.quarter}</div>
                <div className="text-lg font-mono text-gray-400">{liveScore.timeRemaining}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-[#C60C30] font-medium mb-1">{SUPER_BOWL.teams.afc.shortName} {SUPER_BOWL.teams.afc.emoji}</div>
                <div className="text-5xl font-bold text-white">{liveScore.afc}</div>
              </div>
            </div>
          </div>
        )}

        {/* Countdown (if game hasn't started) */}
        {countdown && group.status !== 'live' && group.status !== 'completed' && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-gray-400 text-sm mb-1">Game starts in</p>
            <p className="text-2xl font-bold text-white">{formatCountdown(countdown)}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Grid Column */}
          <div className="lg:col-span-2">
            {/* Grid */}
            <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/10 overflow-x-auto mb-6">
              <div className="min-w-[540px]">
                {/* Patriots header (columns) */}
                <div className="flex items-center justify-center gap-2 mb-3 ml-12">
                  <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-transparent via-[#C60C30] to-[#002244]"></div>
                  <span className="text-sm font-bold text-white px-3 py-1 rounded-full bg-[#002244] border border-[#C60C30]/50">
                    {SUPER_BOWL.teams.afc.emoji} {SUPER_BOWL.teams.afc.shortName}
                  </span>
                  <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-[#002244] via-[#C60C30] to-transparent"></div>
                </div>
                
                {/* Column numbers - Patriots colors */}
                <div className="flex mb-1">
                  <div className="w-12 h-10"></div>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                    <div 
                      key={i} 
                      className={`w-11 h-10 flex items-center justify-center rounded-t-lg ${
                        currentNumbers ? 'bg-[#002244]/80' : 'bg-white/5'
                      }`}
                    >
                      <span className={`text-lg font-bold ${currentNumbers ? 'text-[#C60C30]' : 'text-gray-600'}`}>
                        {currentNumbers ? currentNumbers.colNumbers[i] : '?'}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Grid rows */}
                <div className="flex">
                  {/* Seahawks label (rows) */}
                  <div className="flex flex-col items-center justify-center w-12 mr-0">
                    <div className="flex items-center gap-1 transform -rotate-90 whitespace-nowrap">
                      <span className="text-sm font-bold text-white px-2 py-1 rounded-full bg-[#002244] border border-[#69BE28]/50">
                        {SUPER_BOWL.teams.nfc.emoji} {SUPER_BOWL.teams.nfc.shortName}
                      </span>
                    </div>
                  </div>
                  
                  {/* Grid with row numbers */}
                  <div>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(row => (
                      <div key={row} className="flex">
                        {/* Row number - Seahawks colors */}
                        <div className={`w-11 h-11 flex items-center justify-center rounded-l-lg ${
                          currentNumbers ? 'bg-[#002244]/80' : 'bg-white/5'
                        }`}>
                          <span className={`text-lg font-bold ${currentNumbers ? 'text-[#69BE28]' : 'text-gray-600'}`}>
                            {currentNumbers ? currentNumbers.rowNumbers[row] : '?'}
                          </span>
                        </div>
                        
                        {/* Squares */}
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(col => {
                          const index = row * 10 + col;
                          const square = group.squares[index];
                          const isSelected = selectedSquares.includes(index);
                          const isOwn = square.owner && publicKey && square.owner === publicKey.toString();
                          const isWinner = group.quarterResults.some(r => getWinningSquareIndex(r) === index);
                          
                          return (
                            <button
                              key={col}
                              onClick={() => handleSquareClick(index)}
                              disabled={!!square.owner || group.status !== 'open'}
                              className={`w-11 h-11 border border-white/10 text-xs font-medium transition-all flex items-center justify-center
                                ${isWinner 
                                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black ring-2 ring-yellow-300 animate-pulse' 
                                  : square.owner 
                                    ? isOwn 
                                      ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white cursor-default shadow-lg shadow-purple-500/20' 
                                      : 'bg-white/10 text-gray-400 cursor-default'
                                    : isSelected
                                      ? 'bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg shadow-green-500/20'
                                      : group.status === 'open'
                                        ? 'bg-white/5 hover:bg-white/15 hover:border-white/30 text-gray-500 cursor-pointer'
                                        : 'bg-white/5 text-gray-600 cursor-default'
                                }
                              `}
                            >
                              {isWinner ? '🏆' : square.ownerDisplay || (isSelected ? '✓' : '')}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/5 border border-white/20 rounded"></div>
                <span className="text-gray-400">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-green-700 rounded"></div>
                <span className="text-gray-400">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded"></div>
                <span className="text-gray-400">Your squares</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/15 rounded"></div>
                <span className="text-gray-400">Taken</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded animate-pulse"></div>
                <span className="text-gray-400">Winner</span>
              </div>
              <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                <div className="w-4 h-4 bg-[#69BE28] rounded"></div>
                <span className="text-gray-400">{SUPER_BOWL.teams.nfc.shortName}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#C60C30] rounded"></div>
                <span className="text-gray-400">{SUPER_BOWL.teams.afc.shortName}</span>
              </div>
            </div>

            {/* Purchase section */}
            {group.status === 'open' && (
              connected ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  {selectedSquares.length > 0 ? (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-white font-medium">
                          {selectedSquares.length} square{selectedSquares.length > 1 ? 's' : ''} selected
                        </p>
                        <p className="text-gray-400 text-sm">
                          Total: {totalCost.toFixed(2)} {group.currency}
                        </p>
                      </div>
                      <button
                        onClick={handlePurchase}
                        disabled={loading}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold rounded-xl transition"
                      >
                        {loading ? 'Processing...' : `Buy Squares`}
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center">Click on squares to select them</p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-gray-400 mb-4">Connect wallet to buy squares</p>
                  <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-xl" />
                </div>
              )
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quarter Results */}
            {group.quarterResults.length > 0 && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-white font-semibold mb-4">🏆 Results</h3>
                <div className="space-y-3">
                  {group.quarterResults.map(result => (
                    <div key={result.quarter} className="p-3 rounded-lg bg-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">
                          {result.quarter === 2 ? 'Halftime' : result.quarter === 4 ? 'Final' : `Q${result.quarter}`}
                        </span>
                        <span className="text-gray-400">
                          {result.nfcScore} - {result.afcScore}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">
                          Winner: {result.winnerWallet ? shortenWallet(result.winnerWallet) : 'N/A'}
                        </span>
                        <span className="text-purple-400">{formatSol(result.prizeAmount)} {group.currency}</span>
                      </div>
                      {result.paidOut ? (
                        <span className="text-green-400 text-xs">✓ Paid</span>
                      ) : (
                        <span className="text-yellow-400 text-xs">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prize Pool */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-white font-semibold mb-4">💰 Pool Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Collected</span>
                  <span className="text-white font-bold">{formatSol(prizeBreakdown.total)} {group.currency}</span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform ({PLATFORM_FEE_PERCENT}%)</span>
                  <span className="text-gray-400">-{formatSol(prizeBreakdown.platformFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Creator ({group.payouts.creatorFee}%)</span>
                  <span className="text-green-400">+{formatSol(prizeBreakdown.creatorFee)}</span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between font-medium">
                  <span className="text-white">Prize Pool</span>
                  <span className="text-purple-400">{formatSol(prizeBreakdown.prizePool)} {group.currency}</span>
                </div>
                <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white/5 rounded text-center">
                    <div className="text-gray-500">Q1</div>
                    <div className="text-white">{formatSol(prizeBreakdown.q1)}</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded text-center">
                    <div className="text-gray-500">Half</div>
                    <div className="text-white">{formatSol(prizeBreakdown.q2)}</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded text-center">
                    <div className="text-gray-500">Q3</div>
                    <div className="text-white">{formatSol(prizeBreakdown.q3)}</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded text-center">
                    <div className="text-gray-500">Final</div>
                    <div className="text-white">{formatSol(prizeBreakdown.q4)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Group Info */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-white font-semibold mb-4">ℹ️ Group Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Creator</span>
                  <span className="text-white">{group.creatorDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Visibility</span>
                  <span className="text-white capitalize">{group.visibility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Number Mode</span>
                  <span className="text-white capitalize">{group.numberRandomization.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`capitalize ${
                    group.status === 'live' ? 'text-red-400' : 
                    group.status === 'open' ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {group.status}
                  </span>
                </div>
                {group.visibility === 'private' && group.inviteCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Invite Code</span>
                    <span className="text-purple-400 font-mono">{group.inviteCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Panel */}
            {isCreator && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="w-full flex items-center justify-between text-white font-semibold"
                >
                  <span>🔧 Admin Panel</span>
                  <span>{showAdminPanel ? '▼' : '▶'}</span>
                </button>
                
                {showAdminPanel && (
                  <div className="mt-4 space-y-4">
                    {/* Creator Earnings */}
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="text-sm text-gray-400">Your Earnings</div>
                      <div className="text-xl font-bold text-green-400">
                        {formatSol(prizeBreakdown.creatorFee)} {group.currency}
                      </div>
                    </div>
                    
                    {group.status === 'open' && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">
                          Lock the group to assign numbers and start the game.
                        </p>
                        <button
                          onClick={handleLockGroup}
                          className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition"
                        >
                          🔒 Lock & Assign Numbers
                        </button>
                      </div>
                    )}
                    
                    {(group.status === 'locked' || group.status === 'live') && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Record quarter scores:</p>
                        <div className="space-y-2">
                          {[1, 2, 3, 4].map(q => {
                            const existing = group.quarterResults.find(r => r.quarter === q);
                            return (
                              <div key={q} className="flex items-center gap-2">
                                <span className="text-white w-8">Q{q}</span>
                                {existing ? (
                                  <span className="text-green-400 text-sm">
                                    ✓ {existing.nfcScore}-{existing.afcScore}
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const nfc = prompt(`${SUPER_BOWL.teams.nfc.abbreviation} score Q${q}:`, '0');
                                      const afc = prompt(`${SUPER_BOWL.teams.afc.abbreviation} score Q${q}:`, '0');
                                      if (nfc !== null && afc !== null) {
                                        handleRecordScore(q as 1|2|3|4, parseInt(nfc), parseInt(afc));
                                      }
                                    }}
                                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm text-white transition"
                                  >
                                    Enter Score
                                  </button>
                                )}
                                {existing && !existing.paidOut && (
                                  <button
                                    onClick={() => handlePayout(q as 1|2|3|4)}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm text-white transition ml-auto"
                                  >
                                    Pay Out
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
