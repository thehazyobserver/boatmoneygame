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
    // Use multiple Sonic public RPC endpoints with fallback for reliability
    [sonic.id]: fallback([
      http('https://rpc.sonic.fantom.network/'),
      http('https://sonic.drpc.org/'),
      http('https://rpc.sonic.fantom.network/')
    ]),
  },
})
