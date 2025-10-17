import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { baseAccount } from 'wagmi/connectors';

export function getConfig() {
  const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_SERVICE_URL;

  return createConfig({
    chains: [baseSepolia],
    connectors: [
      baseAccount({
        appName: 'Base Roulette Game',
        appLogoUrl: 'https://base.org/logo.png',
        appChainIds: [baseSepolia.id],
        subAccounts: {
          //@ts-ignore
          creation: 'on-connect', // Automatically creates sub account when user connects
          defaultAccount: 'sub', // Uses sub account as default for transactions
          funding: 'universal' // Automatically funds from Universal Account
        },

        paymasterUrls: {
          [baseSepolia.id]: process.env.NEXT_PUBLIC_PAYMASTER_SERVICE_URL!
        }
      })
    ],
    transports: {
      [baseSepolia.id]: http('https://sepolia.base.org/', {
        // Add timeout and retry configuration
        timeout: 30000,
        retryCount: 3,
        retryDelay: 1000
      })
    }
  });
}

export const config = getConfig();
