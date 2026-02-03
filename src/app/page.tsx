'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { SUPER_BOWL, PLATFORM_FEE_PERCENT } from '@/lib/types';
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
          {/* Super Bowl Badge */}
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full mb-6">
            <span className="text-yellow-400 font-semibold">{SUPER_BOWL.name}</span>
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-gray-300">{SUPER_BOWL.venue}</span>
          </div>
          
          {/* Teams */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
            <div className="text-center p-3 sm:p-5 rounded-2xl bg-gradient-to-br from-[#002244]/50 to-[#69BE28]/20 border border-[#69BE28]/30">
              <img 
                src={SUPER_BOWL.teams.nfc.logo} 
                alt={SUPER_BOWL.teams.nfc.name}
                className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-2 drop-shadow-lg"
              />
              <div className="text-lg sm:text-2xl font-bold text-[#69BE28]">{SUPER_BOWL.teams.nfc.shortName}</div>
              <div className="text-xs sm:text-sm text-gray-400">NFC Champions</div>
            </div>
            <div className="text-2xl sm:text-4xl text-gray-500 font-light">vs</div>
            <div className="text-center p-3 sm:p-5 rounded-2xl bg-gradient-to-br from-[#002244]/50 to-[#C60C30]/20 border border-[#C60C30]/30">
              <img 
                src={SUPER_BOWL.teams.afc.logo} 
                alt={SUPER_BOWL.teams.afc.name}
                className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-2 drop-shadow-lg"
              />
              <div className="text-lg sm:text-2xl font-bold text-[#C60C30]">{SUPER_BOWL.teams.afc.shortName}</div>
              <div className="text-xs sm:text-sm text-gray-400">AFC Champions</div>
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
              <p className="text-xs text-gray-500 mt-1">February 8, 2026 • 6:30 PM ET</p>
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
              <div className="text-3xl mb-4">💵</div>
              <h3 className="text-xl font-semibold text-white mb-2">Creator Earnings</h3>
              <p className="text-gray-400">Earn up to 15% from groups you create — set your own fee!</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <div className="text-3xl mb-4">⚙️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Custom Prizes</h3>
              <p className="text-gray-400">Set your own payout distribution for each quarter</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fee Structure */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Transparent Fees</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">💸 Fee Structure</h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-white font-medium">Platform Fee</span>
                    <p className="text-gray-500 text-sm">Powers the platform</p>
                  </div>
                  <span className="text-gray-400 font-bold">{PLATFORM_FEE_PERCENT}%</span>
                </li>
                <li className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div>
                    <span className="text-white font-medium">Creator Fee</span>
                    <p className="text-gray-500 text-sm">Set by group creator</p>
                  </div>
                  <span className="text-green-400 font-bold">0-15%</span>
                </li>
                <li className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div>
                    <span className="text-white font-medium">Prize Pool</span>
                    <p className="text-gray-500 text-sm">Goes to winners</p>
                  </div>
                  <span className="text-purple-400 font-bold">Remainder</span>
                </li>
              </ul>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">🎯 Default Prize Split</h3>
              <p className="text-gray-400 mb-4 text-sm">Customizable by group creator</p>
              <ul className="space-y-3">
                {[
                  { label: 'Q1 Winner', value: '20%', color: 'text-white' },
                  { label: 'Halftime Winner', value: '20%', color: 'text-white' },
                  { label: 'Q3 Winner', value: '20%', color: 'text-white' },
                  { label: 'Final Winner', value: '35%', color: 'text-yellow-400' },
                  { label: 'Creator', value: '5%', color: 'text-green-400' },
                ].map((item, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <span className="text-gray-400">{item.label}</span>
                    <span className={`${item.color} font-bold`}>{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Play?</h2>
          <p className="text-xl text-gray-400 mb-2">
            {SUPER_BOWL.name}
          </p>
          <p className="text-lg text-gray-300 mb-2">
            {SUPER_BOWL.teams.nfc.name} vs {SUPER_BOWL.teams.afc.name}
          </p>
          <p className="text-gray-500 mb-8">
            February 8, 2026 • {SUPER_BOWL.venue}, {SUPER_BOWL.city}
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
