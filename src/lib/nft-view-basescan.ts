import { baseSepolia } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import { SIMPLE_NFT_ADDRESS } from './nft-minting';
import { extractImageFromTokenURI } from './nft-view';

const publicClient = createPublicClient({ chain: baseSepolia, transport: http('https://sepolia.base.org') });

// Use Etherscan V2 unified API (works across chains). Base Sepolia chainId = 84532
const ETHERSCAN_V2_API = 'https://api.etherscan.io/v2/api';
const CHAIN_ID_BASE_SEPOLIA = 84532;

function withApiKey(url: URL) {
  // Prefer unified V2 key; fallback to legacy BaseScan key if provided
  const key = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || process.env.NEXT_PUBLIC_BASESCAN_API_KEY;
  if (key) url.searchParams.set('apikey', key);
  return url;
}

async function fetchTokenNftTx(params: {
  owner: `0x${string}`;
  contract: `0x${string}`;
  page: number;
  offset: number;
  sort: 'asc' | 'desc';
}) {
  const url = new URL(ETHERSCAN_V2_API);
  url.searchParams.set('chainid', String(CHAIN_ID_BASE_SEPOLIA));
  url.searchParams.set('module', 'account');
  url.searchParams.set('action', 'tokennfttx');
  url.searchParams.set('contractaddress', params.contract);
  url.searchParams.set('address', params.owner);
  url.searchParams.set('page', String(params.page));
  url.searchParams.set('offset', String(params.offset));
  url.searchParams.set('sort', params.sort);
  withApiKey(url);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`BaseScan error ${res.status}`);
  const data = (await res.json()) as {
    status: string;
    message: string;
    result: Array<{ tokenID: string; from: string; to: string; timeStamp?: string }>;
  };
  return data;
}

export async function getOwnerTokenIdsBaseScan(
  owner: `0x${string}`,
  contract: `0x${string}` = SIMPLE_NFT_ADDRESS as `0x${string}`,
  options?: { pages?: number; offset?: number }
) {
  const pages = options?.pages ?? 1;
  const offset = options?.offset ?? 100;
  const lowerOwner = owner.toLowerCase();
  const owned = new Set<string>();

  // Идём от старых к новым: sort=asc и последовательно по страницам
  for (let page = 1; page <= pages; page++) {
    const data = await fetchTokenNftTx({ owner, contract, page, offset, sort: 'asc' });
    if (data.status !== '1' || !Array.isArray(data.result) || data.result.length === 0) break;
    for (const r of data.result) {
      const idStr = r.tokenID;
      const from = r.from?.toLowerCase?.() ?? '';
      const to = r.to?.toLowerCase?.() ?? '';
      if (!idStr) continue;
      if (to === lowerOwner) owned.add(idStr);
      if (from === lowerOwner) owned.delete(idStr);
    }
    if (data.result.length < offset) break; // последняя страница
  }

  return Array.from(owned)
    .map((s) => {
      try {
        return BigInt(s);
      } catch {
        return null;
      }
    })
    .filter((x): x is bigint => x !== null)
    .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
}

export async function readTokenURI(tokenId: bigint, contract: `0x${string}` = SIMPLE_NFT_ADDRESS as `0x${string}`) {
  return publicClient.readContract({
    address: contract,
    abi: [
      {
        type: 'function',
        name: 'tokenURI',
        stateMutability: 'view',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [{ name: '', type: 'string' }]
      }
    ] as const,
    functionName: 'tokenURI',
    args: [tokenId]
  }) as Promise<string>;
}

export async function getLastMintedImageFromBaseScan(owner: `0x${string}`, contract?: `0x${string}`) {
  const tokenIds = await getOwnerTokenIdsBaseScan(owner, contract ?? (SIMPLE_NFT_ADDRESS as `0x${string}`));
  if (tokenIds.length === 0) return null;
  const tokenId = tokenIds[0];
  const tokenURI = await readTokenURI(tokenId, contract ?? (SIMPLE_NFT_ADDRESS as `0x${string}`));
  const image = extractImageFromTokenURI(tokenURI);
  return { tokenId, tokenURI, image };
}

export async function getOwnerTokensDetailed(
  owner: `0x${string}`,
  options?: { contract?: `0x${string}`; limit?: number; pages?: number; offset?: number }
) {
  const contract = options?.contract ?? (SIMPLE_NFT_ADDRESS as `0x${string}`);
  const limit = options?.limit ?? 12;
  const ids = await getOwnerTokenIdsBaseScan(owner, contract, {
    pages: options?.pages ?? 1,
    offset: options?.offset ?? 100
  });
  const take = ids.slice(0, limit);
  const results = await Promise.all(
    take.map(async (id) => {
      try {
        const tokenURI = await readTokenURI(id, contract);
        const image = extractImageFromTokenURI(tokenURI);
        return { tokenId: id, tokenURI, image };
      } catch {
        return { tokenId: id, tokenURI: '', image: null as string | null };
      }
    })
  );
  return results;
}
