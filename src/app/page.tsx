'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { SUPER_BOWL } from '@/lib/types';
import { getGameCountdown, formatCountdown } from '@/lib/scores';

export default function Home() {
  const { connected } = useWallet();
  const [countdown, setCountdown] = useState(getGameCountdown());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getGameCountdown());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏈</span>
            <span className="font-bold text-xl text-white">Super Bowl Boxes</span>
          </div>
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg" />
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Teams */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="text-center">
              <div className="text-4xl mb-2">🏈</div>
              <div className="text-xl font-bold text-white">{SUPER_BOWL.teams.afc.shortName}</div>
            </div>
            <div className="text-3xl text-gray-500">vs</div>
            <div className="text-center">
              <div className="text-4xl mb-2">🦅</div>
              <div className="text-xl font-bold text-white">{SUPER_BOWL.teams.nfc.shortName}</div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">Super Bowl Boxes</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              on Solana
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            The classic football squares game, now with crypto. Create a group, invite friends, 
            buy squares, and win SOL every quarter!
          </p>

          {/* Countdown */}
          {countdown && (
            <div className="inline-block px-6 py-3 rounded-xl bg-white/10 mb-8">
              <p className="text-sm text-gray-400 mb-1">Kickoff in</p>
              <p className="text-2xl font-bold text-white">{formatCountdown(countdown)}</p>
            </div>
          )}
          
          <div className="flex flex-wrap justify-center gap-4">
            {connected ? (
              <>
                <Link
                  href="/create"
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-lg transition transform hover:scale-105"
                >
                  Create Group
                </Link>
                <Link
                  href="/join"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-lg transition"
                >
                  Join Group
                </Link>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 mb-4">Connect your wallet to get started</p>
                <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-xl !py-4 !px-8 !text-lg" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: '📝', title: 'Create or Join', desc: 'Start your own pool or join a public/private group' },
              { icon: '🎯', title: 'Buy Squares', desc: 'Pick your squares on the 10x10 grid with SOL' },
              { icon: '🎲', title: 'Random Numbers', desc: 'Numbers 0-9 are randomly assigned to rows/columns' },
              { icon: '💰', title: 'Win Prizes', desc: 'Match the score each quarter and get paid instantly' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
              <div className="text-3xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-white mb-2">Public & Private Lobbies</h3>
              <p className="text-gray-400">Browse public pools or create private groups with invite codes</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Live Score Updates</h3>
              <p className="text-gray-400">Real-time scores during the game with automatic winner detection</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant Payouts</h3>
              <p className="text-gray-400">Winners get paid in SOL automatically at the end of each quarter</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30">
              <div className="text-3xl mb-4">🎲</div>
              <h3 className="text-xl font-semibold text-white mb-2">Flexible Number Modes</h3>
              <p className="text-gray-400">Choose fixed, per-half, or per-quarter number randomization</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <div className="text-3xl mb-4">⚙️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Custom Payouts</h3>
              <p className="text-gray-400">Set your own payout percentages for each quarter</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <div className="text-3xl mb-4">🎁</div>
              <h3 className="text-xl font-semibold text-white mb-2">Referral Program</h3>
              <p className="text-gray-400">Earn 1% of every square purchased by your referrals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Payout Structure */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Default Payout Structure</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">💵 Prize Pool</h3>
              <ul className="space-y-3">
                {[
                  { label: 'Q1 Winner', value: '20%' },
                  { label: 'Q2 (Halftime) Winner', value: '20%' },
                  { label: 'Q3 Winner', value: '20%' },
                  { label: 'Q4 (Final) Winner', value: '30%' },
                  { label: 'House Fee', value: '10%' },
                ].map((item, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white font-bold">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">🎯 Example Pool</h3>
              <p className="text-gray-400 mb-4">100 squares × 0.1 SOL = 10 SOL pool</p>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-300">• Q1 Winner: 2.0 SOL</li>
                <li className="text-gray-300">• Q2 Winner: 2.0 SOL</li>
                <li className="text-gray-300">• Q3 Winner: 2.0 SOL</li>
                <li className="text-gray-300">• Q4 Winner: 3.0 SOL</li>
                <li className="text-gray-500">• House: 1.0 SOL</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Play?</h2>
          <p className="text-xl text-gray-400 mb-8">
            {SUPER_BOWL.name} • {SUPER_BOWL.teams.afc.name} vs {SUPER_BOWL.teams.nfc.name}
            <br />
            <span className="text-lg">February 9, 2025</span>
          </p>
          
          {connected ? (
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/create"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-lg transition"
              >
                Create Group
              </Link>
              <Link
                href="/join"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-lg transition"
              >
                Browse Groups
              </Link>
            </div>
          ) : (
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-xl !py-4 !px-8 !text-lg" />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center text-gray-500">
          <p>Built by Django 🤠 • Powered by Solana</p>
        </div>
      </footer>
    </main>
  );
}
