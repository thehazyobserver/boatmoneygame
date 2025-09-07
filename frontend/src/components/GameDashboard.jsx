import { useAccount } from 'wagmi'
import PoolStats from './PoolStats'
import UserStats from './UserStats'
import BoatGallery from './BoatGallery'
import BuyRaftCard from './BuyRaftCard'
import Instructions from './Instructions'
import LeaderboardSubgraph from './LeaderboardSubgraph'

export default function GameDashboard() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        {/* Instructions for non-connected users */}
        <Instructions />
        
        <div className="flex flex-col items-center justify-center min-h-96 text-center relative py-12">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl mb-6 float neon-glow" style={{ filter: 'drop-shadow(0 0 30px currentColor)' }}>🚤</div>
            <h2 className="text-4xl md:text-6xl font-bold text-cyan-400 mb-4 neon-pulse" style={{ fontFamily: 'Orbitron, monospace' }}>
              BOAT RUNNER
            </h2>
            <h3 className="text-xl md:text-2xl font-bold text-pink-400 mb-6" style={{ fontFamily: 'Rajdhani, monospace' }}>
              [ MIAMI '85 CRIMINAL OPERATION ]
            </h3>
            <p className="text-lg md:text-xl text-yellow-400 font-semibold mb-8 max-w-4xl leading-relaxed" style={{ fontFamily: 'Rajdhani, monospace' }}>
              High-speed smuggling runs through the neon-soaked waters of Miami.<br/>
              Outrun the Coast Guard, upgrade your fleet, stack that paper.<br/>
              <span className="text-cyan-400 font-bold">JACK IN to start your criminal empire.</span>
            </p>
          </div>

          {/* Boat Level Showcase */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl">
            <div className="terminal-bg p-4 md:p-6 rounded-lg border border-cyan-400 neon-glow hover:border-yellow-400 transition-all duration-300">
              <div className="text-3xl md:text-4xl mb-3">🚣</div>
              <div className="font-bold text-cyan-400 text-sm md:text-base" style={{ fontFamily: 'Orbitron, monospace' }}>RAFT</div>
              <div className="text-xs md:text-sm text-pink-400" style={{ fontFamily: 'Rajdhani, monospace' }}>ENTRY LEVEL</div>
              <div className="text-xs text-yellow-400 mt-1">Start Here</div>
            </div>
            <div className="terminal-bg p-4 md:p-6 rounded-lg border border-cyan-400 neon-glow hover:border-yellow-400 transition-all duration-300">
              <div className="text-3xl md:text-4xl mb-3">🛶</div>
              <div className="font-bold text-cyan-400 text-sm md:text-base" style={{ fontFamily: 'Orbitron, monospace' }}>DINGHY</div>
              <div className="text-xs md:text-sm text-pink-400" style={{ fontFamily: 'Rajdhani, monospace' }}>BETTER ODDS</div>
              <div className="text-xs text-yellow-400 mt-1">Safer Runs</div>
            </div>
            <div className="terminal-bg p-4 md:p-6 rounded-lg border border-cyan-400 neon-glow hover:border-yellow-400 transition-all duration-300">
              <div className="text-3xl md:text-4xl mb-3">🚤</div>
              <div className="font-bold text-cyan-400 text-sm md:text-base" style={{ fontFamily: 'Orbitron, monospace' }}>SPEEDBOAT</div>
              <div className="text-xs md:text-sm text-pink-400" style={{ fontFamily: 'Rajdhani, monospace' }}>HIGH RISK</div>
              <div className="text-xs text-yellow-400 mt-1">Big Risk</div>
            </div>
            <div className="terminal-bg p-4 md:p-6 rounded-lg border border-cyan-400 neon-glow hover:border-yellow-400 transition-all duration-300">
              <div className="text-3xl md:text-4xl mb-3">🛥️</div>
              <div className="font-bold text-cyan-400 text-sm md:text-base" style={{ fontFamily: 'Orbitron, monospace' }}>YACHT</div>
              <div className="text-xs md:text-sm text-pink-400" style={{ fontFamily: 'Rajdhani, monospace' }}>MAX PROFIT</div>
              <div className="text-xs text-yellow-400 mt-1">Elite Status</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Instructions - Always visible but collapsible */}
      <Instructions />
      
      {/* Top Stats Row - Enhanced responsive design */}
      <div className="responsive-grid">
        <PoolStats />
        <UserStats />
      </div>
      
      {/* Buy Raft Card - BOAT game only, prominently displayed */}
      <div className="max-w-2xl mx-auto">
        <BuyRaftCard />
      </div>
      
      {/* User's Boats - Main content area */}
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-cyan-400 text-center neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
          YOUR FLEET
        </h2>
        <BoatGallery />
      </div>
      
      {/* Leaderboard */}
      <div className="space-y-4">
        <LeaderboardSubgraph />
      </div>
    </div>
  )
}
