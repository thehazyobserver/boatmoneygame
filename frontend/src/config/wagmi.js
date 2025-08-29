import { http, createConfig } from 'wagmi'
import { sonic } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sonic],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [sonic.id]: http('https://sonic-mainnet.g.alchemy.com/v2/QiDLI_B9X1EAVYatlN9Jm'),
  },
})
