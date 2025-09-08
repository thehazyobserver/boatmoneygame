import { http, createConfig, fallback } from 'wagmi'
import { sonic, mainnet, sepolia, polygon, arbitrum, optimism, base, bsc, avalanche } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [
    sonic,        // Primary chain for the game
    mainnet,      // Ethereum mainnet
    sepolia,      // Ethereum testnet
    polygon,      // Polygon
    arbitrum,     // Arbitrum
    optimism,     // Optimism
    base,         // Base
    bsc,          // Binance Smart Chain
    avalanche,    // Avalanche
  ],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [sonic.id]: fallback([
      http('https://sonic.drpc.org'),                                    // Primary: Public RPC
      http('https://rpc.soniclabs.com'),                                // Secondary: Public RPC  
      http('https://sonic-mainnet.g.alchemy.com/v2/QiDLI_B9X1EAVYatlN9Jm'), // Fallback: Alchemy (rate limited)
    ]),
    // Basic transports for other chains (just for chain detection, not for transactions)
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
  },
})
