'use client';

import { useState, useEffect, use } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  team1: string;
  team2: string;
  pricePerSquare: number;
  currency: string;
  creator: string;
  createdAt: number;
  squares: (string | null)[];
  numbersAssigned: boolean;
  rowNumbers: number[] | null;
  colNumbers: number[] | null;
}

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { connected, publicKey } = useWallet();
  const [group, setGroup] = useState<Group | null>(null);
  const [selectedSquares, setSelectedSquares] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const groups = JSON.parse(localStorage.getItem('sbboxes_groups') || '{}');
    if (groups[id]) {
      setGroup(groups[id]);
    }
  }, [id]);

  const handleSquareClick = (index: number) => {
    if (!group || group.squares[index]) return; // Already taken
    
    if (selectedSquares.includes(index)) {
      setSelectedSquares(selectedSquares.filter(i => i !== index));
    } else {
      setSelectedSquares([...selectedSquares, index]);
    }
  };

  const handlePurchase = async () => {
    if (!publicKey || !group || selectedSquares.length === 0) return;
    
    setLoading(true);
    
    // Simulate payment - in production this would be actual Solana transaction
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update squares
    const newSquares = [...group.squares];
    selectedSquares.forEach(i => {
      newSquares[i] = publicKey.toString().slice(0, 8);
    });
    
    const updatedGroup = { ...group, squares: newSquares };
    const groups = JSON.parse(localStorage.getItem('sbboxes_groups') || '{}');
    groups[id] = updatedGroup;
    localStorage.setItem('sbboxes_groups', JSON.stringify(groups));
    
    setGroup(updatedGroup);
    setSelectedSquares([]);
    setLoading(false);
  };

  const assignNumbers = () => {
    if (!group || group.numbersAssigned) return;
    
    const shuffle = (arr: number[]) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    
    const rowNumbers = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const colNumbers = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    const updatedGroup = { ...group, numbersAssigned: true, rowNumbers, colNumbers };
    const groups = JSON.parse(localStorage.getItem('sbboxes_groups') || '{}');
    groups[id] = updatedGroup;
    localStorage.setItem('sbboxes_groups', JSON.stringify(groups));
    
    setGroup(updatedGroup);
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/group/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const squaresFilled = group?.squares.filter(s => s !== null).length || 0;
  const totalCost = selectedSquares.length * (group?.pricePerSquare || 0);
  const isCreator = publicKey?.toString() === group?.creator;

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

  return (
    <main className="min-h-screen pt-24 px-4 pb-12">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏈</span>
            <span className="font-bold text-xl text-white">Super Bowl Boxes</span>
          </Link>
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Group Info */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{group.name}</h1>
            <p className="text-gray-400">
              {group.pricePerSquare} {group.currency} per square • {squaresFilled}/100 filled
            </p>
          </div>
          <button
            onClick={copyInviteLink}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition"
          >
            {copied ? '✓ Copied!' : '🔗 Copy Invite Link'}
          </button>
        </div>

        {/* Grid */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 overflow-x-auto mb-6">
          <div className="min-w-[500px]">
            {/* Column headers (Team 2) */}
            <div className="flex mb-2">
              <div className="w-12 h-8"></div>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                <div key={i} className="w-12 h-8 flex items-center justify-center text-purple-400 font-bold text-sm">
                  {group.numbersAssigned && group.colNumbers ? group.colNumbers[i] : '?'}
                </div>
              ))}
            </div>
            <div className="text-center text-xs text-gray-500 mb-2">{group.team2}</div>
            
            {/* Grid rows */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(row => (
              <div key={row} className="flex">
                {/* Row header (Team 1) */}
                <div className="w-12 h-12 flex items-center justify-center text-purple-400 font-bold text-sm">
                  {group.numbersAssigned && group.rowNumbers ? group.rowNumbers[row] : '?'}
                </div>
                
                {/* Squares */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(col => {
                  const index = row * 10 + col;
                  const owner = group.squares[index];
                  const isSelected = selectedSquares.includes(index);
                  const isOwn = owner && publicKey && owner === publicKey.toString().slice(0, 8);
                  
                  return (
                    <button
                      key={col}
                      onClick={() => handleSquareClick(index)}
                      disabled={!!owner}
                      className={`w-12 h-12 border border-white/10 text-xs font-medium transition-all
                        ${owner 
                          ? isOwn 
                            ? 'bg-purple-600 text-white cursor-default' 
                            : 'bg-white/10 text-gray-400 cursor-default'
                          : isSelected
                            ? 'bg-green-600 text-white'
                            : 'bg-white/5 hover:bg-white/10 text-gray-500 cursor-pointer'
                        }
                      `}
                    >
                      {owner || (isSelected ? '✓' : '')}
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="text-center text-xs text-gray-500 mt-2 -rotate-90 origin-center w-12 absolute -left-4">
              {group.team1}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/5 border border-white/10 rounded"></div>
            <span className="text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-400">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-600 rounded"></div>
            <span className="text-gray-400">Your squares</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/10 rounded"></div>
            <span className="text-gray-400">Taken</span>
          </div>
        </div>

        {/* Purchase section */}
        {connected ? (
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
        )}

        {/* Admin section */}
        {isCreator && (
          <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <h3 className="text-white font-medium mb-2">🔧 Group Admin</h3>
            {!group.numbersAssigned ? (
              <div>
                <p className="text-gray-400 text-sm mb-3">
                  Once all squares are filled (or when you&apos;re ready), assign the random numbers.
                </p>
                <button
                  onClick={assignNumbers}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition"
                >
                  🎲 Assign Random Numbers
                </button>
              </div>
            ) : (
              <p className="text-green-400 text-sm">✓ Numbers have been assigned!</p>
            )}
          </div>
        )}

        {/* Pool info */}
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-white font-medium mb-3">💰 Pool Info</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Pool</p>
              <p className="text-white font-bold">{(group.pricePerSquare * 100).toFixed(2)} {group.currency}</p>
            </div>
            <div>
              <p className="text-gray-500">Collected</p>
              <p className="text-white font-bold">{(group.pricePerSquare * squaresFilled).toFixed(2)} {group.currency}</p>
            </div>
            <div>
              <p className="text-gray-500">Prize Pool (90%)</p>
              <p className="text-purple-400 font-bold">{(group.pricePerSquare * squaresFilled * 0.9).toFixed(2)} {group.currency}</p>
            </div>
            <div>
              <p className="text-gray-500">Squares Left</p>
              <p className="text-white font-bold">{100 - squaresFilled}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
