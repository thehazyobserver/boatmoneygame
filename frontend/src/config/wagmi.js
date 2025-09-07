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
    [sonic.id]: [
      http('https://sonic.drpc.org'),
      http('https://rpc.soniclabs.com'),
    ],
  },
})
