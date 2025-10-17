# Base NFT App

A Next.js application that demonstrates Base Account Sub Accounts integration with NFT minting functionality. Users can generate unique pictures with today's date, time, and random glowing colors, then mint them as NFTs on Base Sepolia.

## Features

- **Base Account Sub Accounts**: Seamless wallet integration with automatic sub account creation
- **Picture Generation**: Create unique images with timestamp and random glowing colors
- **NFT Minting**: Mint generated pictures as NFTs on Base Sepolia testnet
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS

## Prerequisites

- Node.js 18+
- npm or yarn
- A Base Account (for testing on Base Sepolia)

## Installation

1. Clone or download this project
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Connect Wallet**: Click "Connect Base Account" to connect your Base Account
2. **Create Sub Account**: The app will automatically prompt you to create a Sub Account
3. **Generate Picture**: Click "Generate Picture" to create a unique image with today's date, time, and a random glowing color
4. **Mint NFT**: Click "Mint NFT" to mint your generated picture as an NFT on Base Sepolia

## Technical Details

### Base Account SDK Integration

The app uses the Base Account SDK with the following configuration:

```typescript
const sdk = createBaseAccountSDK({
  appName: 'Base NFT App',
  appLogoUrl: 'https://base.org/logo.png',
  appChainIds: [baseSepolia.id],
  subAccounts: {
    creation: 'on-connect',
    defaultAccount: 'sub'
  }
});
```

### Picture Generation

Pictures are generated as compact SVGs using a shared generator that is also used to build on-chain metadata. This ensures the preview image matches the image stored in tokenURI exactly.

### NFT Minting

The app includes NFT minting functionality that:

- Creates metadata (JSON) with an SVG image data URL
- Batches USDC approve (0.1 USDC) + NFT mint via `wallet_sendCalls`
- Targets Base Sepolia testnet
- Can request gas sponsorship via Paymaster capabilities when configured

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── NFTMinter.tsx
│   ├── PictureGenerator.tsx
│   └── WalletConnection.tsx
├── hooks/
│   └── useBaseAccount.ts
└── lib/
    ├── base-account.ts
    ├── nft-minting.ts
    └── picture-generator.ts
```

## Dependencies

- `@base-org/account`: Base Account SDK
- `next`: React framework
- `react`: UI library
- `tailwindcss`: CSS framework
- `viem`: Ethereum library
- `wagmi`: React hooks for Ethereum
- `@tanstack/react-query`: Data fetching

## Development

To run the development server:

```bash
npm run dev
```

To build for production:

```bash
npm run build
npm start
```

## Environment

Create a `.env.local` file with:

- `NEXT_PUBLIC_ETHERSCAN_API_KEY` — Etherscan (or BaseScan) API key for NFT ownership lookup
- `NEXT_PUBLIC_PAYMASTER_URL` — Optional direct Paymaster URL override. By default the app uses the Coinbase Developer Platform Paymaster URL you provided. If you need to change it, set this variable.

## Notes

- This is a demo application for Base Sepolia testnet
- Ensure your Paymaster service allowlists your NFT contract and function calls if you enable sponsorship
- Sponsored calls depend on wallet paymaster support and provider availability

## Learn More

- [Base Account Documentation](https://docs.base.org/base-account)
- [Base Sepolia Testnet](https://docs.base.org/base-sepolia)
- [Next.js Documentation](https://nextjs.org/docs)
