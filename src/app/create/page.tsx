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
  SUPER_BOWL,
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
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePayout = (key: keyof PayoutSettings, value: number) => {
    setFormData({
      ...formData,
      payouts: { ...formData.payouts, [key]: value },
    });
  };

  const payoutTotal = Object.values(formData.payouts).reduce((a, b) => a + b, 0);
  const isPayoutValid = payoutTotal === 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;
    
    if (!isPayoutValid) {
      setError('Payout percentages must total 100%');
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

  const totalPool = formData.pricePerSquare * 100;

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
          {SUPER_BOWL.name} • {SUPER_BOWL.teams.afc.shortName} vs {SUPER_BOWL.teams.nfc.shortName}
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
                placeholder="e.g., Office Pool 2025"
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

          {/* Payout Settings */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Payout Structure</h2>
              <span className={`text-sm font-medium ${isPayoutValid ? 'text-green-400' : 'text-red-400'}`}>
                {payoutTotal}% / 100%
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: 'q1', label: 'Q1' },
                { key: 'q2', label: 'Q2 (Half)' },
                { key: 'q3', label: 'Q3' },
                { key: 'q4', label: 'Q4 (Final)' },
                { key: 'house', label: 'House Fee' },
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
              onClick={() => setFormData({ ...formData, payouts: { ...DEFAULT_PAYOUTS } })}
              className="text-purple-400 text-sm hover:underline"
            >
              Reset to defaults (20/20/20/30/10)
            </button>
          </section>

          {/* Summary */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <h3 className="text-white font-semibold mb-4">📊 Pool Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Total Pool:</span>
                <span className="text-white font-bold ml-2">{totalPool.toFixed(2)} {formData.currency}</span>
              </div>
              <div>
                <span className="text-gray-400">Prize Pool:</span>
                <span className="text-purple-400 font-bold ml-2">{(totalPool * (100 - formData.payouts.house) / 100).toFixed(2)} {formData.currency}</span>
              </div>
              <div>
                <span className="text-gray-400">Q1 Winner:</span>
                <span className="text-white ml-2">{(totalPool * formData.payouts.q1 / 100).toFixed(2)} {formData.currency}</span>
              </div>
              <div>
                <span className="text-gray-400">Q2 Winner:</span>
                <span className="text-white ml-2">{(totalPool * formData.payouts.q2 / 100).toFixed(2)} {formData.currency}</span>
              </div>
              <div>
                <span className="text-gray-400">Q3 Winner:</span>
                <span className="text-white ml-2">{(totalPool * formData.payouts.q3 / 100).toFixed(2)} {formData.currency}</span>
              </div>
              <div>
                <span className="text-gray-400">Q4 Winner:</span>
                <span className="text-white ml-2">{(totalPool * formData.payouts.q4 / 100).toFixed(2)} {formData.currency}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !isPayoutValid}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-lg transition"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </main>
  );
}
