'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Group, SUPER_BOWL } from '@/lib/types';
import { getPublicGroups, getGroupByInviteCode } from '@/lib/store';

export default function JoinPage() {
  const { connected } = useWallet();
  const router = useRouter();
  
  const [tab, setTab] = useState<'public' | 'private'>('public');
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPublicGroups(getPublicGroups());
    setLoading(false);
  }, []);

  const handleJoinPrivate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const group = getGroupByInviteCode(inviteCode.trim());
    if (group) {
      router.push(`/group/${group.id}`);
    } else {
      setError('Invalid invite code. Please check and try again.');
    }
  };

  const getStatusBadge = (status: Group['status']) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Open</span>;
      case 'full':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Full</span>;
      case 'locked':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Locked</span>;
      case 'live':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 animate-pulse">🔴 Live</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">Completed</span>;
    }
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
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Join a Group</h1>
        <p className="text-gray-400 mb-8">
          {SUPER_BOWL.name} • {SUPER_BOWL.teams.nfc.shortName} vs {SUPER_BOWL.teams.afc.shortName}
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab('public')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              tab === 'public'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            🌐 Public Lobbies
          </button>
          <button
            onClick={() => setTab('private')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              tab === 'private'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            🔒 Join Private
          </button>
        </div>

        {/* Public Lobbies */}
        {tab === 'public' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Loading groups...</p>
              </div>
            ) : publicGroups.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏈</div>
                <h2 className="text-xl font-semibold text-white mb-2">No public groups yet</h2>
                <p className="text-gray-400 mb-6">Be the first to create one!</p>
                <Link
                  href="/create"
                  className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition"
                >
                  Create Group
                </Link>
              </div>
            ) : (
              publicGroups.map(group => {
                const filledSquares = group.squares.filter(s => s.owner !== null).length;
                const totalPool = filledSquares * group.pricePerSquare;
                
                return (
                  <Link
                    key={group.id}
                    href={`/group/${group.id}`}
                    className="block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-white">{group.name}</h3>
                          {getStatusBadge(group.status)}
                        </div>
                        <p className="text-gray-400 text-sm">
                          Created by {group.creatorDisplay}
                          {group.payouts.creatorFee > 0 && (
                            <span className="text-green-400 ml-2">• {group.payouts.creatorFee}% creator fee</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {group.pricePerSquare} {group.currency}
                        </div>
                        <div className="text-gray-400 text-sm">per square</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">Squares:</span>
                        <span className="text-white ml-2 font-medium">{filledSquares}/100</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Pool:</span>
                        <span className="text-purple-400 ml-2 font-medium">{totalPool.toFixed(2)} {group.currency}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Numbers:</span>
                        <span className="text-white ml-2 font-medium capitalize">{group.numberRandomization.replace('-', ' ')}</span>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                          style={{ width: `${filledSquares}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}

        {/* Private Join */}
        {tab === 'private' && (
          <div className="max-w-md mx-auto">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-4xl mb-4 text-center">🔐</div>
              <h2 className="text-xl font-semibold text-white text-center mb-2">
                Enter Invite Code
              </h2>
              <p className="text-gray-400 text-center text-sm mb-6">
                Got an invite code from a friend? Enter it below to join their private group.
              </p>
              
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleJoinPrivate} className="space-y-4">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="ABCD12"
                  maxLength={6}
                  className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white text-center text-2xl font-mono tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                />
                <button
                  type="submit"
                  disabled={inviteCode.length < 6}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition"
                >
                  Join Group
                </button>
              </form>
            </div>
            
            {!connected && (
              <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
                <p className="text-yellow-400 text-sm mb-3">
                  Connect your wallet to purchase squares
                </p>
                <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-xl" />
              </div>
            )}
          </div>
        )}

        {/* Create CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Want to run your own pool?</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition"
          >
            <span>➕</span>
            Create Your Own Group
          </Link>
        </div>
      </div>
    </main>
  );
}
