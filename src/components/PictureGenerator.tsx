'use client';

import { useState } from 'react';
import { generatePicture, GeneratedPicture } from '@/lib/picture-generator';

interface PictureGeneratorProps {
  onPictureGenerated: (picture: GeneratedPicture) => void;
  disabled?: boolean;
}

export function PictureGenerator({ onPictureGenerated, disabled }: PictureGeneratorProps) {
  const [generatedPicture, setGeneratedPicture] = useState<GeneratedPicture | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const picture = generatePicture();
      setGeneratedPicture(picture);
      onPictureGenerated(picture);
    } catch (error) {
      console.error('Failed to generate picture:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <span className="font-heading inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Step 2
        </span>
        <span className="font-heading text-xs font-medium uppercase tracking-wide text-slate-400">Meme Studio</span>
      </div>

      <div className="mb-6 space-y-2">
        <h2 className="font-heading-tight text-2xl font-semibold text-slate-900">Which builder I am today?</h2>
        <p className="text-sm leading-relaxed text-slate-500">
          Spin up a builder poster starring Pepe, Doge, Wojak, anons, apes, and wizards. Every render mixes builder mood,
          palette, and timestamp for a one-off edition the standup will talk about.
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={disabled || isGenerating}
        className={`font-heading w-full rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
          disabled || isGenerating
            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            : 'border-slate-900 bg-slate-900 text-slate-100 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg'
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V2C5.582 2 2 5.582 2 10h2zm2 5.291A7.962 7.962 0 014 12H2c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating your poster...
          </span>
        ) : disabled ? (
          <span className="flex items-center justify-center gap-2 text-slate-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Connect wallet to unlock
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
            What builder I am today?
          </span>
        )}
      </button>

      {generatedPicture ? (
        <div className="mt-6 space-y-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <img src={generatedPicture.dataUrl} alt="Generated meme poster" className="w-full" />
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{generatedPicture.meme.emoji}</span>
                <div>
                  <p className="font-heading text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {generatedPicture.meme.mood}
                  </p>
                  <p className="font-heading-tight text-lg font-semibold text-slate-900">{generatedPicture.meme.name}</p>
                </div>
              </div>
              <span className="font-heading rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {generatedPicture.meme.id.toUpperCase()}
              </span>
            </div>

            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{generatedPicture.meme.tagline}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-500">
              {generatedPicture.meme.mood} • Web3 builder humor
            </p>

            <dl className="grid grid-cols-1 gap-3 text-xs text-slate-500 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-slate-600">Mint timestamp</dt>
                <dd className="font-mono text-[12px] text-slate-700">{generatedPicture.timestamp}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600">ISO</dt>
                <dd className="font-mono text-[11px] text-slate-500">{generatedPicture.isoTimestamp}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-slate-600">Palette</dt>
                <dd className="mt-1 flex items-center gap-3">
                  {(['background', 'card', 'accent'] as const).map((key) => (
                    <span key={key} className="flex items-center gap-2">
                      <span
                        className="h-6 w-6 rounded-lg border border-white shadow"
                        style={{ backgroundColor: generatedPicture.palette[key] }}
                      ></span>
                      <span className="font-mono text-[11px] text-slate-500">{generatedPicture.palette[key]}</span>
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
          <p className="text-sm font-semibold text-slate-600">No poster yet</p>
          <p className="mt-2 text-xs text-slate-500">Warm up those gm vibes and generate once your wallet is connected.</p>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-500">
        Meme metadata is embedded directly into the SVG and mirrored in the on-chain tokenURI, so the artwork you preview is
        exactly what gets minted. No shitty vibes, only pure builder extasy.
      </div>
    </div>
  );
}
