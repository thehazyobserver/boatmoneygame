import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI, GAME_CONFIGS } from '../config/contracts'

export default function PoolStats({ selectedToken }) {
  const [activeTab, setActiveTab] = useState(selectedToken || 'BOAT')
  
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
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        🌊 Pool Statistics
      </h2>
      
      {/* Tab Selector */}
      <div className="flex space-x-1 mb-6 bg-white bg-opacity-10 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('BOAT')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'BOAT'
              ? 'bg-blue-500 text-white'
              : 'text-white hover:bg-white hover:bg-opacity-10'
          }`}
        >
          🚤 $BOAT
        </button>
        <button
          onClick={() => setActiveTab('JOINT')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'JOINT'
              ? 'bg-green-500 text-white'
              : 'text-white hover:bg-white hover:bg-opacity-10'
          }`}
        >
          🌿 $JOINT
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-lg font-bold text-white">
              {stat.value} <span className="text-sm font-normal">{stat.suffix}</span>
            </div>
            <div className="text-sm text-white opacity-80">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white border-opacity-20">
        <div className="text-center text-white opacity-80 text-sm">
          💡 The prize pool grows with every failed smuggling run!
        </div>
      </div>
    </div>
  )
}
