import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './components/Navbar'
import GameDashboard from './components/GameDashboard'
import RunResults from './components/RunResults'
import { config } from './config/wagmi'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen night-ocean scanlines relative">
          {/* 80s grid overlay */}
          <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 245, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 245, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
          
          <Navbar />
          <div className="container mx-auto px-4 pt-6 relative z-10">
            <RunResults />
          </div>
          <GameDashboard />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
