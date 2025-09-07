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
      http('https://sonic.drpc.org'),
      http('https://rpc.soniclabs.com'),
    ]),
  },
})
