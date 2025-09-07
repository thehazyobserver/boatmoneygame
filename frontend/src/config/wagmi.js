import { http, createConfig } from 'wagmi'
import { sonic } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sonic],
  connectors: [
    injected(),
    metaMask(),
  ],
  // No custom transports: use wallet's provider for all interactions
})
