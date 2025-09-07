import { http, createConfig, fallback } from 'wagmi'
import { sonic } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sonic],
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
  },
})
