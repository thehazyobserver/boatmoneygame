import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './components/Navbar'
import GameDashboard from './components/GameDashboard'
import TokenApproval from './components/TokenApproval'
import { config } from './config/wagmi'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen ocean-gradient">
          <Navbar />
          <div className="container mx-auto px-4 pt-6">
            <TokenApproval />
          </div>
          <GameDashboard />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
