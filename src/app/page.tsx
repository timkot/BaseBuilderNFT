'use client';

import { useState } from 'react';
import { WalletConnection } from '@/components/WalletConnection';
import { PictureGenerator } from '@/components/PictureGenerator';
import { NFTMinter } from '@/components/NFTMinter';
import { GeneratedPicture } from '@/lib/picture-generator';
import { useBaseAccount } from '@/hooks/useBaseAccount';
import { NFTGallery } from '@/components/NFTGallery';

export default function Home() {
  const { subAccount, connected, universalAddress } = useBaseAccount();
  const [generatedPicture, setGeneratedPicture] = useState<GeneratedPicture | null>(null);

  // Consider the wallet connected if any account detail is present
  const isWalletConnected = connected || !!universalAddress || !!subAccount;

  const handlePictureGenerated = (picture: GeneratedPicture) => {
    setGeneratedPicture(picture);
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-16 space-y-6 text-center lg:text-left">
          <span className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Base Meme Editions
          </span>
          <h1 className="font-heading-tight text-4xl font-semibold tracking-tight sm:text-5xl">
            Memes for Base builders who ship
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 lg:mx-0">
            Grab yourself one-off meme posters—Pepe, Doge, Wojak, anons, apes, wizards, and whatever other degen bulders spawned.
            Mint them as on-chain collectibles through a Sub Account, completely  gasless to keep you keep typing
            &quot;gm&quot; while the wallet does the boring parts.
          </p>
          <div className="flex flex-col items-center gap-2 text-sm text-slate-500 lg:flex-row lg:items-center">
            <span className="font-mono text-xs uppercase tracking-wide text-slate-400">Flow</span>
            <span className="h-px w-12 bg-slate-300 lg:w-16" aria-hidden="true"></span>
            <span>Connect wallet → Generate meme poster → Mint on Base Sepolia → Tweet wagmi</span>
          </div>
        </header>

  <section className="grid gap-6 md:grid-cols-3">
          <WalletConnection />
          <PictureGenerator onPictureGenerated={handlePictureGenerated} disabled={!isWalletConnected} />
          <NFTMinter
            picture={generatedPicture}
            recipientAddress={subAccount?.address || ''}
            disabled={!isWalletConnected || !generatedPicture}
          />
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold">Your mint history</h2>
              <p className="text-sm text-slate-500">Live data from BaseScan for the currently connected sub account.</p>
            </div>
          </div>
          <NFTGallery owner={subAccount?.address || null} />
        </section>

        <section className="mt-16 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wide text-slate-400">
                Paymaster Integration
              </h3>
              <p className="font-heading mt-2 text-base font-semibold text-slate-900">Base Sub Accounts</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Wallet-free signing with batched approvals keeps every mint smooth, recoverable, and gm-friendly. No more
                clicking through modal purgatory.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wide text-slate-400">Curated metadata</h3>
              <p className="font-heading mt-2 text-base font-semibold text-slate-900">Meme-first SVG art</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Posters embed meme mood, palette, timestamps, and extra punchlines straight into the SVG and tokenURI.
                It&apos;s a lore drop that lints.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wide text-slate-400">Testnet native</h3>
              <p className="font-heading mt-2 text-base font-semibold text-slate-900">Base Sepolia deployment</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Mint, refresh, and inspect editions instantly with BaseScan-powered gallery tooling. Confetti not included,
                gm thread encouraged.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-16 text-center text-xs text-slate-400">
          Built with Base Account SDK · Meme drop experiment for web3 builders who laugh while they ship
        </footer>
      </div>
    </main>
  );
}
