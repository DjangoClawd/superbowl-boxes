'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateGroup() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    team1: 'Kansas City Chiefs',
    team2: 'San Francisco 49ers',
    pricePerSquare: '0.1',
    currency: 'SOL',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;
    
    setLoading(true);
    
    // Generate a unique group ID
    const groupId = Math.random().toString(36).substring(2, 10);
    
    // Store in localStorage for MVP (would be database in production)
    const groups = JSON.parse(localStorage.getItem('sbboxes_groups') || '{}');
    groups[groupId] = {
      ...formData,
      id: groupId,
      creator: publicKey.toString(),
      createdAt: Date.now(),
      squares: Array(100).fill(null),
      numbersAssigned: false,
      rowNumbers: null,
      colNumbers: null,
      pricePerSquare: parseFloat(formData.pricePerSquare),
    };
    localStorage.setItem('sbboxes_groups', JSON.stringify(groups));
    
    setLoading(false);
    router.push(`/group/${groupId}`);
  };

  if (!connected) {
    return (
      <main className="min-h-screen pt-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Connect Wallet</h1>
          <p className="text-gray-400 mb-8">Connect your wallet to create a group</p>
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-xl" />
        </div>
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

      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Create Group</h1>
        <p className="text-gray-400 mb-8">Set up your Super Bowl Boxes pool</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-white font-medium mb-2">Group Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Office Pool 2025"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Teams */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">Team 1 (Rows)</label>
              <input
                type="text"
                required
                value={formData.team1}
                onChange={(e) => setFormData({ ...formData, team1: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Team 2 (Columns)</label>
              <input
                type="text"
                required
                value={formData.team2}
                onChange={(e) => setFormData({ ...formData, team2: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-white font-medium mb-2">Price per Square</label>
            <div className="flex gap-2">
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                value={formData.pricePerSquare}
                onChange={(e) => setFormData({ ...formData, pricePerSquare: e.target.value })}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="SOL">SOL</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              Total pool: {(parseFloat(formData.pricePerSquare || '0') * 100).toFixed(2)} {formData.currency}
            </p>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <h3 className="text-white font-medium mb-2">Pool Summary</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 100 squares at {formData.pricePerSquare} {formData.currency} each</li>
              <li>• Total pool: {(parseFloat(formData.pricePerSquare || '0') * 100).toFixed(2)} {formData.currency}</li>
              <li>• 10% house fee ({(parseFloat(formData.pricePerSquare || '0') * 10).toFixed(2)} {formData.currency})</li>
              <li>• Prize pool: {(parseFloat(formData.pricePerSquare || '0') * 90).toFixed(2)} {formData.currency}</li>
            </ul>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold rounded-xl text-lg transition"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </main>
  );
}
