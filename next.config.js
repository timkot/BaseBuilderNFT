/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false
    };

    // Exclude broken coinbaseWallet connector
    config.resolve.alias = {
      ...config.resolve.alias,
      '@wagmi/connectors/coinbaseWallet': false
    };

    // Ignore optional dependencies that cause warnings
    config.ignoreWarnings = [{ module: /node_modules\/@metamask\/sdk/ }, { module: /node_modules\/pino/ }];

    // Handle React Native async storage (optional dependency)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false
      };
    }

    return config;
  }
};

module.exports = nextConfig;
