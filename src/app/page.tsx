'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

export default function Home() {
  const { connected } = useWallet();

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
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Super Bowl Boxes
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              on Solana
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The classic football squares game, now with crypto. Create a group, 
            invite friends, buy squares, and win SOL every quarter!
          </p>
          
          {connected ? (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/create" className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-lg transition">
                Create Group
              </Link>
              <Link href="/join" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-lg transition border border-white/20">
                Join Group
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 mb-4">Connect your wallet to get started</p>
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-xl !py-4 !px-8 !text-lg" />
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: '📝', title: 'Create Group', desc: 'Set the price per square and invite your friends' },
              { icon: '🎯', title: 'Buy Squares', desc: 'Pick your squares on the 10x10 grid' },
              { icon: '🎲', title: 'Random Numbers', desc: 'Once full, numbers 0-9 are randomly assigned' },
              { icon: '💰', title: 'Win Prizes', desc: 'Match the score each quarter and win!' },
            ].map((step, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payouts */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Payout Structure</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">💵 Prize Pool</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex justify-between">
                  <span>Q1 Winner</span>
                  <span className="text-purple-400 font-bold">20%</span>
                </li>
                <li className="flex justify-between">
                  <span>Q2 (Halftime) Winner</span>
                  <span className="text-purple-400 font-bold">20%</span>
                </li>
                <li className="flex justify-between">
                  <span>Q3 Winner</span>
                  <span className="text-purple-400 font-bold">20%</span>
                </li>
                <li className="flex justify-between">
                  <span>Q4 (Final) Winner</span>
                  <span className="text-purple-400 font-bold">30%</span>
                </li>
                <li className="flex justify-between border-t border-white/10 pt-3 mt-3">
                  <span>House Fee</span>
                  <span className="text-gray-400">10%</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Example</h3>
              <p className="text-gray-300 mb-4">
                100 squares × 0.1 SOL = <span className="text-white font-bold">10 SOL pool</span>
              </p>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Q1 Winner: 1.8 SOL</li>
                <li>• Q2 Winner: 1.8 SOL</li>
                <li>• Q3 Winner: 1.8 SOL</li>
                <li>• Q4 Winner: 2.7 SOL</li>
                <li className="text-gray-500">• House: 1.0 SOL</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Referral */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">🎁 Referral Program</h2>
          <p className="text-xl text-gray-300 mb-8">
            Share your referral link and earn <span className="text-purple-400 font-bold">1%</span> of every square purchased by your referrals!
          </p>
          {connected && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 inline-block">
              <p className="text-gray-400 text-sm mb-2">Your referral link (connect wallet to see)</p>
              <code className="text-purple-400">Coming soon...</code>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Play?</h2>
          <p className="text-gray-300 mb-8">Super Bowl LVIII • Chiefs vs 49ers • February 9, 2025</p>
          {connected ? (
            <Link href="/create" className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-lg transition inline-block">
              Create Your Group Now
            </Link>
          ) : (
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-xl !py-4 !px-8 !text-lg" />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>Built by Django 🤠 • Powered by Solana</p>
        </div>
      </footer>
    </main>
  );
}
