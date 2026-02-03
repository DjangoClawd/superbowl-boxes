'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CreateGroupInput, 
  DEFAULT_PAYOUTS, 
  PayoutSettings,
  LobbyVisibility,
  NumberRandomization,
  GridSize,
  SUPER_BOWL,
  PLATFORM_FEE_PERCENT,
  calculatePrizeBreakdown,
  GRID_CONFIGS,
} from '@/lib/types';
import { createGroup } from '@/lib/store';
import { validatePayouts } from '@/lib/solana';

export default function CreateGroup() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  
  const [formData, setFormData] = useState<CreateGroupInput>({
    name: '',
    pricePerSquare: 0.1,
    currency: 'SOL',
    visibility: 'public',
    payouts: { ...DEFAULT_PAYOUTS },
    numberRandomization: 'fixed',
    gridSize: '10x10',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePayout = (key: keyof PayoutSettings, value: number) => {
    setFormData({
      ...formData,
      payouts: { ...formData.payouts, [key]: value },
    });
  };

  // Calculate breakdown
  const gridConfig = GRID_CONFIGS[formData.gridSize];
  const totalSquares = gridConfig.totalSquares;
  const totalPool = formData.pricePerSquare * totalSquares;
  const breakdown = calculatePrizeBreakdown(totalPool, formData.payouts);
  const validation = validatePayouts(formData.payouts);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid settings');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const group = createGroup(formData, publicKey.toString());
      router.push(`/group/${group.id}`);
    } catch (err) {
      setError('Failed to create group');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Create Group</h1>
        <p className="text-gray-400 mb-8">
          {SUPER_BOWL.name} • {SUPER_BOWL.teams.nfc.shortName} vs {SUPER_BOWL.teams.afc.shortName}
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Basic Info</h2>
            
            <div>
              <label className="block text-white font-medium mb-2">Group Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Office Pool 2026"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Price per Square</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={formData.pricePerSquare}
                  onChange={(e) => setFormData({ ...formData, pricePerSquare: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'SOL' | 'USDC' })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
            </div>
          </section>

          {/* Grid Size */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Grid Size</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gridSize: '10x10' })}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  formData.gridSize === '10x10'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="text-white font-medium">10×10 Standard</div>
                <div className="text-gray-400 text-sm">100 squares • Classic format</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gridSize: '5x5' })}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  formData.gridSize === '5x5'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-white font-medium">5×5 Mini</div>
                <div className="text-gray-400 text-sm">25 squares • Smaller groups</div>
              </button>
            </div>
          </section>

          {/* Visibility */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Visibility</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, visibility: 'public' })}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  formData.visibility === 'public'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-2">🌐</div>
                <div className="text-white font-medium">Public</div>
                <div className="text-gray-400 text-sm">Anyone can find and join</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, visibility: 'private' })}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  formData.visibility === 'private'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-white font-medium">Private</div>
                <div className="text-gray-400 text-sm">Invite-only with code</div>
              </button>
            </div>
          </section>

          {/* Number Randomization */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Number Assignment</h2>
            <p className="text-gray-400 text-sm">When should numbers be randomly assigned to rows/columns?</p>
            
            <div className="space-y-3">
              {[
                { value: 'fixed', label: 'Fixed (Once)', desc: 'Numbers assigned once and stay the same all game' },
                { value: 'per-half', label: 'Per Half', desc: 'New random numbers at halftime' },
                { value: 'per-quarter', label: 'Per Quarter', desc: 'New random numbers each quarter' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, numberRandomization: option.value as NumberRandomization })}
                  className={`w-full p-4 rounded-xl border-2 transition text-left flex items-center gap-4 ${
                    formData.numberRandomization === option.value
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.numberRandomization === option.value
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-white/40'
                  }`}>
                    {formData.numberRandomization === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">{option.label}</div>
                    <div className="text-gray-400 text-sm">{option.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Creator Fee */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Your Creator Fee</h2>
            <p className="text-gray-400 text-sm">
              Earn from your group! Set your fee (0-15%) that you&apos;ll receive when the pool is distributed.
            </p>
            
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={formData.payouts.creatorFee}
                onChange={(e) => updatePayout('creatorFee', parseInt(e.target.value))}
                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <div className="w-20 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-center">
                <span className="text-green-400 font-bold">{formData.payouts.creatorFee}%</span>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Your earnings (if 100 squares sold):</span>
                <span className="text-green-400 font-bold">{breakdown.creatorFee.toFixed(2)} {formData.currency}</span>
              </div>
            </div>
          </section>

          {/* Prize Distribution */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Prize Distribution</h2>
            <p className="text-gray-400 text-sm">
              Set how the prize pool is split between quarters. Values are relative (will be normalized).
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'q1', label: 'Q1' },
                { key: 'q2', label: 'Halftime' },
                { key: 'q3', label: 'Q3' },
                { key: 'q4', label: 'Final' },
              ].map(item => (
                <div key={item.key}>
                  <label className="block text-gray-400 text-sm mb-1">{item.label}</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.payouts[item.key as keyof PayoutSettings]}
                      onChange={(e) => updatePayout(item.key as keyof PayoutSettings, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFormData({ 
                ...formData, 
                payouts: { ...DEFAULT_PAYOUTS, creatorFee: formData.payouts.creatorFee } 
              })}
              className="text-purple-400 text-sm hover:underline"
            >
              Reset to defaults (20/20/20/35)
            </button>
          </section>

          {/* Fee Summary */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <h3 className="text-white font-semibold mb-4">💰 Fee Breakdown ({totalSquares} squares)</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Pool:</span>
                <span className="text-white font-bold">{totalPool.toFixed(2)} {formData.currency}</span>
              </div>
              
              <hr className="border-white/10" />
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Platform Fee ({PLATFORM_FEE_PERCENT}%):</span>
                <span className="text-gray-400">-{breakdown.platformFee.toFixed(2)} {formData.currency}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Your Fee ({formData.payouts.creatorFee}%):</span>
                <span className="text-green-400 font-medium">+{breakdown.creatorFee.toFixed(2)} {formData.currency}</span>
              </div>
              
              <hr className="border-white/10" />
              
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Prize Pool:</span>
                <span className="text-purple-400 font-bold">{breakdown.prizePool.toFixed(2)} {formData.currency}</span>
              </div>
              
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="text-center p-2 bg-white/5 rounded">
                  <div className="text-xs text-gray-500">Q1</div>
                  <div className="text-white font-medium">{breakdown.q1.toFixed(2)}</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded">
                  <div className="text-xs text-gray-500">Half</div>
                  <div className="text-white font-medium">{breakdown.q2.toFixed(2)}</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded">
                  <div className="text-xs text-gray-500">Q3</div>
                  <div className="text-white font-medium">{breakdown.q3.toFixed(2)}</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded">
                  <div className="text-xs text-gray-500">Final</div>
                  <div className="text-white font-medium">{breakdown.q4.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !validation.valid}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-lg transition"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </main>
  );
}
