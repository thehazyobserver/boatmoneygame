import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI, GAME_CONFIGS } from '../config/contracts'

export default function PoolStats() {
  const [activeTab, setActiveTab] = useState('BOAT')
  
  // Get game config for active tab
  const gameConfig = GAME_CONFIGS[activeTab]
  
  // Get contract configuration based on active tab
  const getGameContract = () => {
    return activeTab === 'JOINT' ? contracts.jointBoatGame : contracts.boatGame
  }

  // Read total supply of tokens from the token contract
  const { data: totalSupply } = useReadContract({
    address: gameConfig.tokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'totalSupply'
  })

  // Read prize pool balance from game contract
  const { data: prizePool } = useReadContract({
    ...getGameContract(),
    functionName: 'poolBalance'
  })

  // Read total boats minted
  const { data: totalBoats } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'totalSupply'
  })

  // Read buy raft cost - only for BOAT game
  const { data: buyRaftCost } = useReadContract({
    ...contracts.boatGame, // Always use BOAT game contract for raft cost
    functionName: 'buyRaftCost',
    query: { enabled: activeTab === 'BOAT' } // Only fetch for BOAT token
  })

  const baseStats = [
    {
      label: 'Prize Pool',
      value: prizePool ? parseInt(formatEther(prizePool)).toLocaleString() : '0',
      suffix: gameConfig.symbol,
      icon: '💰'
    },
    {
      label: 'Total Boats',
      value: totalBoats ? totalBoats.toString() : '0',
      suffix: 'boats',
      icon: '🚤'
    }
  ]

  // Only add raft cost for BOAT token
  const stats = activeTab === 'BOAT' ? [
    ...baseStats,
    {
      label: 'Raft Cost',
      value: buyRaftCost ? parseInt(formatEther(buyRaftCost)).toLocaleString() : '100,000',
      suffix: '$BOAT',
      icon: '🪜'
    }
  ] : baseStats

  return (
    <div className="terminal-bg rounded-xl p-6 border-2 border-cyan-400 relative overflow-hidden">
      {/* Retro scan lines */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none"></div>
      
      <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
        🌊 OPERATION INTEL
      </h2>
      
      {/* Tab Selector */}
      <div className="flex space-x-2 mb-8 bg-black/50 rounded-lg p-2 border border-pink-500">
        <button
          onClick={() => setActiveTab('BOAT')}
          className={`flex-1 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
            activeTab === 'BOAT'
              ? 'vice-button neon-glow'
              : 'text-cyan-400 hover:bg-cyan-900/20 border border-cyan-400/50'
          }`}
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          🚤 $BOAT
        </button>
        <button
          onClick={() => setActiveTab('JOINT')}
          className={`flex-1 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
            activeTab === 'JOINT'
              ? 'vice-button neon-glow'
              : 'text-cyan-400 hover:bg-cyan-900/20 border border-cyan-400/50'
          }`}
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          🌿 $JOINT
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-6 relative z-10">
        {stats.map((stat, index) => (
          <div key={index} className="text-center p-4 border border-pink-500/50 rounded-lg bg-black/30">
            <div className="text-4xl mb-3 neon-glow" style={{ filter: 'drop-shadow(0 0 10px currentColor)' }}>
              {stat.icon}
            </div>
            <div className="text-xl font-bold text-cyan-400 neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
              {stat.value} <span className="text-sm font-normal text-pink-400">{stat.suffix}</span>
            </div>
            <div className="text-sm text-pink-400 font-semibold mt-2" style={{ fontFamily: 'Rajdhani, monospace' }}>
              {stat.label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-cyan-400/50">
        <div className="text-center text-yellow-400 font-bold text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
          ⚠️ INTEL: Pool grows with every bust. High risk, high reward.
        </div>
      </div>
    </div>
  )
}
