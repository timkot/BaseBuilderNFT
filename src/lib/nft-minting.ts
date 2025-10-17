import { encodeFunctionData, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { getBaseAccountProvider } from './base-account';
import { USDC_CONTRACT_ADDRESS, USDC_ABI, USDC_CONFIG } from './usdc';
import type { GeneratedPicture } from './picture-generator';
import { svgFromPicture, svgToDataUrl } from './mint-art';

// On-chain contract (update after deploy)
export const SIMPLE_NFT_ADDRESS = '0x833f2301e412935C35A968297F931A842bc574C6'; // TODO: replace with deployed address

export const SIMPLE_NFT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'string', name: 'tokenURI_', type: 'string' }
    ],
    name: 'mint',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

export function buildTokenMetadata(p: GeneratedPicture) {
  // Build SVG with a shared generator so preview matches on-chain metadata image
  const svg = svgFromPicture(p, { size: 512 });
  const image = svgToDataUrl(svg);
  const taglinePlain = p.meme.tagline.replace(/\s+/g, ' ').trim();
  const metadata = {
    name: `${p.meme.emoji} ${p.meme.name}`,
    description: `${taglinePlain}. Mood: ${p.meme.mood}. Minted ${p.timestamp}.`,
    image,
    attributes: [
      { trait_type: 'Meme', value: p.meme.name },
      { trait_type: 'Mood', value: p.meme.mood },
      { trait_type: 'Timestamp', value: p.isoTimestamp },
      { trait_type: 'Palette Background', value: p.palette.background },
      { trait_type: 'Palette Accent', value: p.palette.accent }
    ]
  };
  // Unicode-safe base64 for JSON
  const json = JSON.stringify(metadata);
  const b64 =
    typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(json))) : Buffer.from(json, 'utf8').toString('base64');
  const tokenURI = `data:application/json;base64,${b64}`;
  return { metadata, tokenURI };
}

// Resolve Paymaster URL (no proxy needed). Environment override supported with multiple var names.
function getPaymasterUrl(): string {
  return (
    (process.env.NEXT_PUBLIC_PAYMASTER_SERVICE_URL as string | undefined) ||
    (process.env.NEXT_PUBLIC_PAYMASTER_URL as string | undefined) ||
    (process.env.NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL as string | undefined) ||
    'https://api.developer.coinbase.com/rpc/v1/base-sepolia/d9najHtQIJJ4GwPdRUiUtgprahGFrvm4'
  );
}

export async function mintNftWithUsdc(params: {
  toAddress: string;
  picture: GeneratedPicture;
  contractAddress?: `0x${string}`;
}): Promise<{ callsId: string }> {
  const provider = getBaseAccountProvider();
  if (!provider) throw new Error('Base Account provider not initialized');

  const contract = params.contractAddress ?? (SIMPLE_NFT_ADDRESS as `0x${string}`);
  if (!contract || contract === '0x0000000000000000000000000000000000000000') {
    throw new Error('Set SIMPLE_NFT_ADDRESS to the deployed contract');
  }

  // Build metadata tokenURI from the generated picture
  const { tokenURI } = buildTokenMetadata(params.picture);

  // 0.1 USDC in 6 decimals
  const price = parseUnits('0.1', USDC_CONFIG.DECIMALS);

  // Prepare batched calls: approve -> mint
  const approveData = encodeFunctionData({
    abi: USDC_ABI,
    functionName: 'approve',
    args: [contract, price]
  } as any);

  const mintData = encodeFunctionData({
    abi: SIMPLE_NFT_ABI,
    functionName: 'mint',
    args: [params.toAddress as `0x${string}`, tokenURI]
  });

  // Optional capability check (non-blocking)
  try {
    const caps = (await provider.request({
      method: 'wallet_getCapabilities',
      params: [params.toAddress as `0x${string}`]
    })) as any;
    const pmSupported = caps?.[baseSepolia.id]?.paymasterService?.supported;
    if (!pmSupported) {
      console.warn('Paymaster service not reported as supported by wallet on Base Sepolia');
    }
  } catch (e) {
    console.debug('wallet_getCapabilities failed (continuing):', e);
  }

  const callsResult = (await provider.request({
    method: 'wallet_sendCalls',
    params: [
      {
        // Use version '1.0' per Base docs for Paymaster examples
        version: '1.0',
        chainId: `0x${baseSepolia.id.toString(16)}`,
        from: params.toAddress as `0x${string}`,
        calls: [
          { to: USDC_CONTRACT_ADDRESS as `0x${string}`, data: approveData, value: '0x0' },
          { to: contract, data: mintData, value: '0x0' }
        ],
        // Paymaster capability to sponsor gas (direct URL, no proxy)
        capabilities: {
          paymasterService: {
            url: getPaymasterUrl()
          }
        }
      }
    ]
  })) as string | { id: string; capabilities?: unknown };

  // Handle both string and object response formats
  const callsId = typeof callsResult === 'string' ? callsResult : callsResult?.id ?? 'unknown';

  return { callsId };
}
