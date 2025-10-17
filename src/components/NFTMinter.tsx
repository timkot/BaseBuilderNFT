'use client';

import { useEffect, useState } from 'react';
import { GeneratedPicture } from '@/lib/picture-generator';
import { getSpendPermissionsInfo, canMintNFT, getRemainingMints } from '@/lib/spend-permissions';
import { mintNftWithUsdc, SIMPLE_NFT_ADDRESS } from '@/lib/nft-minting';
import { getLastMintedImageFromBaseScan } from '@/lib/nft-view-basescan';
import { NFTGallery } from '@/components/NFTGallery';

interface NFTMinterProps {
  picture: GeneratedPicture | null;
  recipientAddress: string;
  disabled?: boolean;
}

export function NFTMinter({ picture, recipientAddress, disabled }: NFTMinterProps) {
  const [mintCount, setMintCount] = useState(0);
  const [isMinting, setIsMinting] = useState(false);
  const [result, setResult] = useState<{ callsId: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastMint, setLastMint] = useState<{ tokenId: bigint; tokenURI: string; image: string | null } | null>(null);

  // Get spend permissions info
  const spendInfo = getSpendPermissionsInfo();
  const canMintMore = canMintNFT(mintCount);
  const remainingMints = getRemainingMints(mintCount);

  const handleMint = async () => {
    if (!picture || !recipientAddress) return;
    setIsMinting(true);
    setErrorMsg(null);
    setResult(null);
    try {
      const res = await mintNftWithUsdc({
        toAddress: recipientAddress,
        picture,
        contractAddress: SIMPLE_NFT_ADDRESS as `0x${string}`
      });
      setResult(res);
      setMintCount((c) => c + 1);
    } catch (err) {
      console.error('Mint failed:', err);
      // Ensure we always have a string, never an Error object
      let msg = 'Unknown error';
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === 'string') {
        msg = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        msg = String(err.message);
      }
      setErrorMsg(msg);
    } finally {
      setIsMinting(false);
    }
  };

  // Fetch last minted NFT image for the connected recipient
  useEffect(() => {
    let cancelled = false;
    async function fetchLast() {
      if (!recipientAddress) return setLastMint(null);
      try {
        const data = await getLastMintedImageFromBaseScan(recipientAddress as `0x${string}`);
        if (!cancelled) setLastMint(data);
      } catch (e) {
        if (!cancelled) setLastMint(null);
      }
    }
    fetchLast();
    return () => {
      cancelled = true;
    };
  }, [recipientAddress, result]);

  const canMintNow = Boolean(picture && recipientAddress && !disabled && canMintMore);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <span className="font-heading inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Step 3
        </span>
        <span className="font-heading text-xs font-medium uppercase tracking-wide text-slate-400">Mint</span>
      </div>

      <div className="mb-6 space-y-2">
        <h2 className="font-heading-tight text-2xl font-semibold text-slate-900">Mint Your Meme Edition</h2>
        <p className="text-sm leading-relaxed text-slate-500">
          Batch the USDC approve and mint call in one sponsored transaction. The minted tokenURI rehydrates the exact SVG you
          previewed in the generator—no surprise art, just pure builder comedy on-chain.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold text-slate-700">Spend Permissions</h3>
          <span className="font-heading text-xs uppercase tracking-wide text-slate-400">Session</span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-slate-500">
          <div>
            <dt className="font-heading text-[11px] font-medium uppercase tracking-wide text-slate-500">Cost / Mint</dt>
            <dd>{spendInfo.mintCost} USDC</dd>
          </div>
          <div>
            <dt className="font-heading text-[11px] font-medium uppercase tracking-wide text-slate-500">Limit</dt>
            <dd>{spendInfo.maxSpendAmount} USDC</dd>
          </div>
          <div>
            <dt className="font-heading text-[11px] font-medium uppercase tracking-wide text-slate-500">Minted</dt>
            <dd>
              {mintCount}/{spendInfo.maxMintsPerSession}
            </dd>
          </div>
          <div>
            <dt className="font-heading text-[11px] font-medium uppercase tracking-wide text-slate-500">Remaining</dt>
            <dd>{remainingMints}</dd>
          </div>
        </dl>
      </div>

      {picture ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading text-xs font-semibold uppercase tracking-wide text-slate-500">Selected Edition</p>
              <p className="font-heading mt-1 text-sm font-semibold text-slate-700">
                {picture.meme.emoji} {picture.meme.name}
              </p>
            </div>
            <span className="font-heading text-xs uppercase tracking-wide text-slate-400">{picture.meme.mood}</span>
          </div>
          <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-slate-500">{picture.meme.tagline}</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-emerald-500">Certified wagmi lore drop</p>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
          Generate a poster in Step 2 to unlock minting.
        </div>
      )}

      {!recipientAddress && (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
          Connect your wallet to choose a recipient address. Builders without wallets are just comedians.
        </div>
      )}

      {!canMintMore && mintCount > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-600">
          Spend limit reached for this session. Limits reset every 24 hours.
        </div>
      )}

      <button
        onClick={handleMint}
        disabled={!canMintNow || isMinting}
        className={`font-heading mt-6 w-full rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
          !canMintNow || isMinting
            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            : 'border-slate-900 bg-slate-900 text-slate-100 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg'
        }`}
      >
        {isMinting ? 'Minting edition…' : `Mint NFT (0.1 USDC) — ${remainingMints} left`}
      </button>

      {result && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-700">
          <p className="font-heading text-sm font-semibold text-emerald-700">Mint transaction prepared</p>
          <p className="mt-1 text-xs leading-relaxed">
            Calls ID:
            <span className="mt-1 block font-mono text-[11px] text-emerald-600 break-all">{String(result.callsId)}</span>
          </p>
          <p className="mt-2 text-xs">
            Approve and mint calls are bundled and will execute once the wallet confirms the batched request. Drop a gm when
            the block hits.
          </p>
        </div>
      )}

      {lastMint && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold text-slate-700">Last minted token</h3>
            <span className="font-heading text-xs uppercase tracking-wide text-slate-400">
              #{lastMint.tokenId.toString()}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            {lastMint.image ? (
              <img
                src={lastMint.image}
                alt="Minted NFT"
                className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-500">
                no image
              </div>
            )}
            <details className="w-full text-xs text-slate-500">
              <summary className="cursor-pointer font-medium text-slate-600">tokenURI</summary>
              <div className="mt-2 max-h-28 overflow-y-auto break-all rounded border border-slate-200 bg-slate-50 p-2 font-mono text-[11px]">
                {lastMint.tokenURI}
              </div>
            </details>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-700">
          <p className="font-heading text-sm font-semibold text-rose-700">Mint failed</p>
          <p className="mt-1 text-xs leading-relaxed">{String(errorMsg || 'Unknown error')}</p>
          <p className="mt-2 text-[11px] text-rose-500">Debug tip: sacrifice a stale meme to the testnet gods and retry.</p>
        </div>
      )}
    </div>
  );
}
