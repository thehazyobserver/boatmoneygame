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
              <span className="text-cyan-400 font-bold">CONNECT WALLET to start your criminal empire.</span>
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
              <div className="text-xs md:text-sm text-pink-400" style={{ fontFamily: 'Rajdhani, monospace' }}>MAX REWARDS</div>
              <div className="text-xs text-yellow-400 mt-1">Elite Status</div>
            </div>
          </div>

          {/* Token Purchase Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center max-w-2xl">
            <a
              href="https://fatfinger.fun/app/token/0x32aF310fA33520ffB91bF8DC73251F0244Efca2C"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-center rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 neon-glow"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              💰 GET MORE $BOAT
            </a>
            <a
              href="https://equalizer.exchange/swap?fromToken=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&toToken=0xC046dCb16592FBb3F9fA0C629b8D93090dD4cB76"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-center rounded-lg hover:from-pink-400 hover:to-purple-400 transition-all duration-300 neon-glow"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              🚀 GET MORE $JOINT
            </a>
          </div>

          {/* Experimental Warning */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-2 border-red-500 rounded-lg p-4 text-center">
              <div className="text-red-400 text-lg font-bold mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
                ⚠️ EXPERIMENTAL GAME WARNING ⚠️
              </div>
              <div className="text-yellow-300 text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
                This is an experimental blockchain game. Use at your own risk.<br/>
                Only play with game tokens you're willing to lose.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Experimental Warning */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-2 border-red-500 rounded-lg p-4 text-center">
          <div className="text-red-400 text-lg font-bold mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
            ⚠️ EXPERIMENTAL GAME WARNING ⚠️
          </div>
          <div className="text-yellow-300 text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
            This is an experimental blockchain game. Use at your own risk.<br/>
            Only play with game tokens you're willing to lose.
          </div>
        </div>
      </div>

      {/* Instructions - Always visible but collapsible */}
      <Instructions />
      
      {/* Token Purchase Buttons */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://fatfinger.fun/app/token/0x32aF310fA33520ffB91bF8DC73251F0244Efca2C"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-center rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 neon-glow"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            💰 GET MORE $BOAT
          </a>
          <a
            href="https://equalizer.exchange/swap?fromToken=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&toToken=0xC046dCb16592FBb3F9fA0C629b8D93090dD4cB76"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-center rounded-lg hover:from-pink-400 hover:to-purple-400 transition-all duration-300 neon-glow"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            🚀 GET MORE $JOINT
          </a>
        </div>
      </div>
      
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
