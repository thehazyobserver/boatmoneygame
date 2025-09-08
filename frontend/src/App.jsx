import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './components/Navbar'
import GameDashboard from './components/GameDashboard'
import RunResults from './components/RunResults'
import ErrorBoundary from './components/ErrorBoundary'
import NetworkSwitcher from './components/NetworkSwitcher'
import { useAutoRefresh } from './hooks/useAutoRefresh'
import { config } from './config/wagmi'

const queryClient = new QueryClient()

// Component to handle auto-refresh logic inside providers
function AppContent() {
  useAutoRefresh() // This will handle automatic data refreshing
  
  return (
    <div className="min-h-screen night-ocean scanlines relative">
      {/* Network switching modal - appears on top when needed */}
      <NetworkSwitcher />
      
      {/* Enhanced 80s grid overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 245, 255, 0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 245, 255, 0.4) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        animation: 'pulse 4s ease-in-out infinite'
      }}></div>
    
      {/* Navbar with enhanced styling */}
      <Navbar />
      
      {/* Main content with better spacing */}
      <main className="relative z-10">
        {/* Run Results positioned prominently */}
        <div className="container mx-auto px-4 pt-4">
          <RunResults />
        </div>
        
        {/* Game Dashboard with enhanced layout */}
        <GameDashboard />
      </main>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  )
}

export default App
