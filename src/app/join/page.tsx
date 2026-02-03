'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
}

export default function JoinPage() {
  const { connected } = useWallet();
  const router = useRouter();
  const [groupCode, setGroupCode] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('sbboxes_groups') || '{}');
    setGroups(Object.values(stored));
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupCode.trim()) {
      router.push(`/group/${groupCode.trim()}`);
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

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Join Group</h1>
        <p className="text-gray-400 mb-8">Enter a group code or browse available groups</p>

        {/* Join by code */}
        <form onSubmit={handleJoin} className="mb-12">
          <label className="block text-white font-medium mb-2">Group Code</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              placeholder="Enter group code..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition"
            >
              Join
            </button>
          </div>
        </form>

        {/* Available groups */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Available Groups</h2>
          {groups.length === 0 ? (
            <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-gray-400">No groups yet.</p>
              {connected && (
                <Link href="/create" className="text-purple-400 hover:underline mt-2 inline-block">
                  Create the first one!
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map(group => {
                const filled = group.squares.filter(s => s !== null).length;
                return (
                  <Link
                    key={group.id}
                    href={`/group/${group.id}`}
                    className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-bold">{group.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {group.team1} vs {group.team2}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold">
                          {group.pricePerSquare} {group.currency}
                        </p>
                        <p className="text-gray-500 text-sm">{filled}/100 filled</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
