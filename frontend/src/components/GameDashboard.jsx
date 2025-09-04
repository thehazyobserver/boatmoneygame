import { useAccount } from 'wagmi'
import PoolStats from './PoolStats'
import UserStats from './UserStats'
import BoatGallery from './BoatGallery'
import BuyRaftCard from './BuyRaftCard'
import Instructions from './Instructions'

export default function GameDashboard() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        {/* Instructions for non-connected users */}
        <Instructions />
        
        <div className="flex flex-col items-center justify-center min-h-64 text-center relative">
          <div className="text-9xl mb-6 float neon-glow" style={{ filter: 'drop-shadow(0 0 20px currentColor)' }}>🚤</div>
          <h2 className="text-5xl font-bold text-cyan-400 mb-6 neon-pulse" style={{ fontFamily: 'Orbitron, monospace' }}>
            BOAT RUNNER
          </h2>
          <h3 className="text-2xl font-bold text-pink-400 mb-4" style={{ fontFamily: 'Rajdhani, monospace' }}>
            [ MIAMI '85 OPERATION ]
          </h3>
          <p className="text-xl text-yellow-400 font-semibold mb-8 max-w-3xl" style={{ fontFamily: 'Rajdhani, monospace' }}>
            High-speed smuggling runs in the neon-soaked waters of Miami. 
            Outrun the Coast Guard, upgrade your ride, stack that paper.
            JACK IN to start your criminal empire.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="terminal-bg p-6 rounded-lg border border-cyan-400 neon-glow">
              <div className="text-4xl mb-3">🪜</div>
              <div className="font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, monospace' }}>RAFT</div>
              <div className="text-sm text-pink-400" style={{ fontFamily: 'Rajdhani, monospace' }}>ENTRY LEVEL</div>
            </div>
            <div className="terminal-bg p-6 rounded-lg border border-cyan-400 neon-glow">
              <div className="text-4xl mb-3">🛶</div>
              <div className="font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, monospace' }}>DINGHY</div>
              <div className="text-sm text-pink-400" style={{ fontFamily: 'Rajdhani, monospace' }}>BETTER ODDS</div>
            </div>
            <div className="terminal-bg p-6 rounded-lg border border-cyan-400 neon-glow">
              <div className="text-4xl mb-3">🚤</div>
              <div className="font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, monospace' }}>SPEEDBOAT</div>
              <div className="text-sm text-pink-400" style={{ fontFamily: 'Rajdhani, monospace' }}>HIGH STAKES</div>
            </div>
            <div className="terminal-bg p-6 rounded-lg border border-cyan-400 neon-glow">
              <div className="text-4xl mb-3">🛥️</div>
              <div className="font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, monospace' }}>YACHT</div>
              <div className="text-sm text-pink-400" style={{ fontFamily: 'Rajdhani, monospace' }}>MAX PROFIT</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Instructions */}
      <Instructions />
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PoolStats />
        <UserStats />
      </div>
      
      {/* Buy Raft Card - BOAT game only */}
      <BuyRaftCard />
      
      {/* User's Boats */}
      <BoatGallery />
    </div>
  )
}
