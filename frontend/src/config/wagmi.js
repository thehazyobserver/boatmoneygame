import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, sonic } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Configure chains - add Sonic mainnet and testnet
const sonicTestnet = {
  id: 64165,
  name: 'Sonic Testnet',
  network: 'sonic-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    public: { http: ['https://rpc.sonic.fantom.network/'] },
    default: { http: ['https://rpc.sonic.fantom.network/'] },
  },
  blockExplorers: {
    default: { name: 'Sonic Explorer', url: 'https://explorer.sonic.fantom.network/' },
  },
}

export const config = createConfig({
  chains: [sonic, sonicTestnet, mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    // walletConnect({ projectId: 'your-project-id' }), // Add if you want WalletConnect
  ],
  transports: {
    [sonic.id]: http('https://sonic-mainnet.g.alchemy.com/v2/QiDLI_B9X1EAVYatlN9Jm'),
    [sonicTestnet.id]: http(),
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`),
  },
})
