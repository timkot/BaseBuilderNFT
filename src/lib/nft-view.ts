import { baseSepolia } from 'viem/chains';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { SIMPLE_NFT_ADDRESS } from './nft-minting';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
});

const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)');

const tokenUriFn = parseAbiItem('function tokenURI(uint256 tokenId) view returns (string)');

export async function getOwnerTokenIds(owner: `0x${string}`, contract: `0x${string}` = SIMPLE_NFT_ADDRESS as `0x${string}`) {
  const logs = await publicClient.getLogs({
    address: contract,
    event: transferEvent,
    args: { to: owner },
    fromBlock: 'earliest',
    toBlock: 'latest'
  });
  // Sort by block/tx index descending to get latest first
  const sorted = [...logs].sort((a, b) => {
    if (a.blockNumber === b.blockNumber) return Number(b.logIndex - a.logIndex);
    return Number((b.blockNumber ?? 0n) - (a.blockNumber ?? 0n));
  });
  return sorted.map((l) => l.args.tokenId as bigint);
}

export async function getTokenURI(tokenId: bigint, contract: `0x${string}` = SIMPLE_NFT_ADDRESS as `0x${string}`) {
  return publicClient.readContract({
    address: contract,
    abi: [tokenUriFn],
    functionName: 'tokenURI',
    args: [tokenId]
  }) as Promise<string>;
}

export function extractImageFromTokenURI(tokenURI: string): string | null {
  // Expect data:application/json;base64,<b64>
  try {
    const [, b64] = tokenURI.split('base64,');
    if (!b64) return null;
    const raw = typeof window !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
    // Decode potential UTF-8
    const jsonStr =
      typeof window !== 'undefined' ? decodeURIComponent(escape(raw)) : Buffer.from(raw, 'binary').toString('utf8');
    const meta = JSON.parse(jsonStr);
    return typeof meta.image === 'string' ? meta.image : null;
  } catch {
    return null;
  }
}

export async function getLastMintedImage(owner: `0x${string}`, contract?: `0x${string}`) {
  const tokenIds = await getOwnerTokenIds(owner, contract);
  if (tokenIds.length === 0) return null;
  const latestId = tokenIds[0];
  const tokenURI = await getTokenURI(latestId, contract);
  const image = extractImageFromTokenURI(tokenURI);
  return { tokenId: latestId, tokenURI, image };
}
