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
    // Use Sonic's official RPC endpoint that supports CORS
    [sonic.id]: http('https://rpc.sonic.fantom.network/'),
  },
})
