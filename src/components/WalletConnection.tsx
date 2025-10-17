'use client';

import { useCallback, useMemo, useState } from 'react';
import { encodeFunctionData, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { useBaseAccount } from '@/hooks/useBaseAccount';

const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const;
const RECIPIENT_ADDRESS = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045' as const;

const ERC20_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

export function WalletConnection() {
  const { provider, connected, subAccount, universalAddress, loading, status, connectWallet, setStatus } = useBaseAccount();

  const [amount, setAmount] = useState('1');
  const [txLoading, setTxLoading] = useState(false);

  const isProviderReady = useMemo(() => !!provider, [provider]);
  const canSend = useMemo(
    () => connected && !!subAccount?.address && !txLoading && !!provider,
    [connected, subAccount, txLoading, provider]
  );

  const sendUSDC = useCallback(async () => {
    if (!provider || !subAccount?.address) {
      setStatus('Not connected or sub account unavailable');
      return;
    }

    setTxLoading(true);
    setStatus('Preparing USDC transfer...');

    try {
      const amountValue = parseFloat(amount);
      if (!amountValue || amountValue <= 0) {
        setStatus('Enter a valid USDC amount greater than zero');
        return;
      }

      const amountInUnits = parseUnits(amount, 6);
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [RECIPIENT_ADDRESS, amountInUnits]
      });

      setStatus('Sending transaction...');

      const paymasterUrl =
        (process.env.NEXT_PUBLIC_PAYMASTER_SERVICE_URL as string | undefined) ||
        (process.env.NEXT_PUBLIC_PAYMASTER_URL as string | undefined) ||
        (process.env.NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL as string | undefined);

      // Optional capability check
      try {
        const caps = (await provider.request({
          method: 'wallet_getCapabilities',
          params: [subAccount.address]
        })) as any;
        const pmSupported = caps?.[baseSepolia.id]?.paymasterService?.supported;
        if (!pmSupported) {
          console.warn('Paymaster service not reported as supported by wallet on Base Sepolia');
        }
      } catch (e) {
        // non-blocking
      }

      const callsResult = (await provider.request({
        method: 'wallet_sendCalls',
        params: [
          {
            version: '1.0',
            chainId: `0x${baseSepolia.id.toString(16)}`,
            from: subAccount.address,
            calls: [
              {
                to: USDC_ADDRESS,
                data,
                value: '0x0'
              }
            ],
            ...(paymasterUrl
              ? {
                  capabilities: {
                    paymasterService: {
                      url: paymasterUrl
                    }
                  }
                }
              : {})
          }
        ]
      })) as string | { id: string; capabilities?: unknown };

      console.log('wallet_sendCalls result:', callsResult);

      // Handle both string and object response formats
      const callsId = typeof callsResult === 'string' ? callsResult : callsResult?.id ?? 'unknown';

      console.log('Extracted callsId:', callsId);

      setStatus(`Transaction sent! Calls ID: ${String(callsId)}`);
    } catch (error) {
      console.error('Transaction failed:', error);
      setStatus(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTxLoading(false);
    }
  }, [provider, subAccount, amount, setStatus]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <span className="font-heading inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Step 1
        </span>
        <span className="font-heading text-xs font-medium uppercase tracking-wide text-slate-400">Wallet</span>
      </div>

      <div className="mb-6 space-y-2">
        <h2 className="font-heading-tight text-2xl font-semibold text-slate-900">Connect Base Account</h2>
        <p className="text-sm leading-relaxed text-slate-500">
          Deploy a Base subAccount account completely gasless. Once connected you can mint meme editions without touching
          private keys again—gm to fewer popups and more punchlines.
        </p>
      </div>

      <div
        className={`mb-6 flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
          connected ? 'border-emerald-200 bg-emerald-50/70 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}
      >
        <span className="font-heading flex items-center gap-2 text-sm font-medium">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={connected ? 'M5 13l4 4L19 7' : 'M12 8v4m0 0v4m0-4h4m-4 0H8'}
            />
          </svg>
          {connected ? `${status} · wagmi` : status}
        </span>
        {connected && <span className="font-heading text-xs uppercase tracking-wide text-emerald-500">Ready</span>}
      </div>

      {!connected && (
        <button
          onClick={connectWallet}
          disabled={loading || !isProviderReady}
          className={`font-heading w-full rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
            loading || !isProviderReady
              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
              : 'border-slate-900 bg-slate-900 text-slate-100 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V2C5.582 2 2 5.582 2 10h2zm2 5.291A7.962 7.962 0 014 12H2c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Connecting…
            </span>
          ) : isProviderReady ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Connect Base Account (gm)
            </span>
          ) : (
            'Initializing SDK…'
          )}
        </button>
      )}

      {connected && (
        <div className="mt-6 space-y-4">
          {subAccount?.address && (
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
              <div className="flex items-center justify-between">
                <p className="font-heading text-sm font-semibold text-slate-700">Active Sub Account</p>
                <span className="font-heading text-xs font-medium uppercase tracking-wide text-emerald-500">Live</span>
              </div>
              <p className="mt-2 font-mono text-xs leading-relaxed text-slate-600 break-all">{String(subAccount.address)}</p>
            </div>
          )}

          {universalAddress && (
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
              <p className="font-heading text-sm font-semibold text-slate-700">Universal Account</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-slate-600 break-all">{String(universalAddress)}</p>
              <p className="mt-2 text-[11px] text-slate-500">
                Auto-spend vault for when the front-end dev buys the dip mid mint.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold text-slate-700">Test USDC Transfer</h3>
              <span className="font-heading text-xs uppercase tracking-wide text-slate-400">Optional</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Send a tiny amount of USDC via the Base Account provider to confirm spend permissions, impress teammates, and
              prove you really did read the docs.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="font-heading text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Recipient
                </label>
                <p className="mt-1 rounded-xl border border-slate-200 bg-white/70 p-2 font-mono text-[11px] text-slate-600 break-all">
                  {RECIPIENT_ADDRESS}
                </p>
              </div>

              <div>
                <label className="font-heading text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Amount (USDC)
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    disabled={!canSend}
                    className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                    placeholder="1.00"
                  />
                  <span className="font-heading text-xs font-semibold text-slate-400">USDC</span>
                </div>
              </div>

              <button
                onClick={sendUSDC}
                disabled={!canSend || !amount || Number(amount) <= 0}
                className={`font-heading w-full rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                  !canSend || !amount || Number(amount) <= 0
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                    : 'border-slate-900 bg-slate-900 text-slate-100 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg'
                }`}
              >
                {txLoading ? 'Sending…' : `Send ${amount || '0'} USDC`}
              </button>

              <p className="text-[11px] leading-relaxed text-slate-500">
                Auto-spend permissions will route from your universal account if the sub account balance drops. All calls are
                batched through{' '}
                <code className="rounded bg-slate-200 px-1 font-mono text-[10px] text-slate-600">wallet_sendCalls</code>—the
                devrel-approved meme spell.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-500">
        Base Accounts keep approvals off your critical wallet. Once you grant spend permissions you can mint, approve, and
        transfer in a single sponsored call. Builder ergonomics, meme approved.
      </div>
    </div>
  );
}
