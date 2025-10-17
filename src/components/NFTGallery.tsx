'use client';

import { useEffect, useState } from 'react';
import { getOwnerTokensDetailed } from '@/lib/nft-view-basescan';

type OwnedToken = { tokenId: bigint; tokenURI: string; image: string | null };

interface NFTGalleryProps {
  owner: string | null | undefined;
  contractAddress?: `0x${string}`;
  limit?: number;
}

export function NFTGallery({ owner, contractAddress, limit = 24 }: NFTGalleryProps) {
  const [items, setItems] = useState<OwnedToken[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState(1);

  const fetchData = async (opts?: { reset?: boolean }) => {
    if (!owner) {
      setItems(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const currentPages = opts?.reset ? 1 : pages;
      const data = await getOwnerTokensDetailed(owner as `0x${string}`, {
        contract: contractAddress,
        limit,
        pages: currentPages
      });
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load NFTs');
      setItems(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPages(1);
    fetchData({ reset: true });
  }, [owner, contractAddress, limit]);

  if (!owner) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
        Connect your wallet to view your Base meme editions.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading-tight text-lg font-semibold text-slate-800">Your collection</h3>
        <button
          onClick={() => fetchData()}
          disabled={loading}
          className={`font-heading rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            loading
              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
              : 'border-slate-900 bg-slate-900 text-slate-100 hover:-translate-y-0.5 hover:bg-slate-800'
          }`}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-sm text-rose-700">
          {error} · ping the devops wizard ser.
        </div>
      )}

      {items && items.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          You don&apos;t have any NFTs from this collection yet. Time to ship another meme and mint it.
        </div>
      )}

      {(!items || loading) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      )}

      {items && items.length > 0 && !loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((it) => (
            <div key={it.tokenId.toString()} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image} alt={`Token ${it.tokenId.toString()}`} className="aspect-square w-full object-cover" />
              ) : (
                <div className="grid aspect-square w-full place-items-center text-xs text-slate-500">no image</div>
              )}
              <div className="px-3 py-2 text-xs text-slate-500">ID: {it.tokenId.toString()}</div>
            </div>
          ))}
        </div>
      )}

      {items && items.length >= limit && (
        <div className="flex justify-center mt-4">
          <button
            disabled={loading}
            onClick={async () => {
              if (loading || !owner) return;
              const nextPages = pages + 1;
              setPages(nextPages);
              setLoading(true);
              try {
                const data = await getOwnerTokensDetailed(owner as `0x${string}`, {
                  contract: contractAddress,
                  limit,
                  pages: nextPages
                });
                setItems(data);
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load more');
              } finally {
                setLoading(false);
              }
            }}
            className={`font-heading rounded-full border px-4 py-2 text-sm font-semibold transition ${
              loading
                ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                : 'border-slate-900 bg-slate-900 text-slate-100 hover:-translate-y-0.5 hover:bg-slate-800'
            }`}
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
