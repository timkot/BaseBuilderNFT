import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { WagmiProviderWrapper } from '@/components/WagmiProvider';
import { BaseAccountProvider } from '@/contexts/BaseAccountContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata: Metadata = {
  title: 'Base NFT Minter | Create & Mint NFTs with Base Account',
  description:
    'Mint unique NFTs on Base Sepolia with Base Account Sub Accounts. Seamless transactions, gas sponsorship, and automatic approval. Generate timestamped artwork and mint instantly.',
  keywords: [
    'Base',
    'NFT',
    'Mint',
    'Base Account',
    'Sub Accounts',
    'Blockchain',
    'Web3',
    'Base Sepolia',
    'Crypto',
    'Digital Art',
    'USDC',
    'Gas Sponsorship'
  ],
  authors: [{ name: 'Base NFT App' }],
  creator: 'Base NFT App',
  publisher: 'Base NFT App',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://basenft.app',
    title: 'Base NFT Minter | Create & Mint NFTs with Base Account',
    description:
      'Mint unique NFTs on Base Sepolia with Base Account Sub Accounts. Seamless transactions and automatic gas sponsorship.',
    siteName: 'Base NFT Minter',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Base NFT Minter - Create Unique NFTs'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base NFT Minter | Create & Mint NFTs',
    description: 'Mint unique NFTs on Base Sepolia with seamless Base Account integration.',
    images: ['/og-image.png']
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
  },
  themeColor: '#0052FF',
  manifest: '/manifest.json'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <WagmiProviderWrapper>
          <BaseAccountProvider>{children}</BaseAccountProvider>
        </WagmiProviderWrapper>
      </body>
    </html>
  );
}
