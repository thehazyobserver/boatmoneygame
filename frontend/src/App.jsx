import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import Navbar from './components/Navbar'
import GameDashboard from './components/GameDashboard'
import RunResults from './components/RunResults'
import TokenSelector from './components/TokenSelector'
import { config } from './config/wagmi'

const queryClient = new QueryClient()

function App() {
  const [selectedToken, setSelectedToken] = useState('BOAT') // Default to BOAT game

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen ocean-gradient">
          <Navbar />
          <div className="container mx-auto px-4 pt-6">
            <TokenSelector 
              selectedToken={selectedToken}
              onTokenChange={setSelectedToken}
            />
            <RunResults selectedToken={selectedToken} />
          </div>
          <GameDashboard selectedToken={selectedToken} />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
