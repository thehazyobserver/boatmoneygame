import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI, GAME_CONFIGS } from '../config/contracts'
import { formatTokenAmount, formatInteger } from '../utils/formatters'

export default function UserStats() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('BOAT')

  // Get game config for active tab - fallback to BOAT if JOINT not deployed
  const gameConfig = GAME_CONFIGS[activeTab] || GAME_CONFIGS.BOAT
  
  // Ensure we don't try to access JOINT if it's not deployed
  const safeActiveTab = (activeTab === 'JOINT' && !GAME_CONFIGS.JOINT.isDeployed) ? 'BOAT' : activeTab
  
  // Get contract configuration based on active tab
  const getGameContract = () => {
    return safeActiveTab === 'JOINT' ? contracts.jointBoatGame : contracts.boatGame
  }

  // Read user's token balance from the token contract
  const { data: tokenBalance } = useReadContract({
    address: gameConfig.tokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: isConnected }
  })

  // Read user's boat count
  const { data: boatCount } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: isConnected }
  })

  // Read user's game statistics
  const { data: userStats } = useReadContract({
    ...getGameContract(),
    functionName: 'getStats',
    args: [address],
    query: { 
      enabled: isConnected && !!address && gameConfig.isDeployed,
      retry: false,
      onError: (error) => {
        console.warn(`Error fetching ${activeTab} stats:`, error)
      }
    }
  })

  if (!isConnected) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          👤 Your Stats
        </h2>
        <div className="text-center text-white opacity-80">
          Connect your wallet to view your statistics
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: `${gameConfig.symbol} Tokens`,
      value: tokenBalance ? formatTokenAmount(tokenBalance) : '0.00',
      suffix: gameConfig.symbol,
      icon: '🪙'
    },
    {
      label: 'Your Boats',
      value: boatCount?.toString?.() ?? '0',
      suffix: 'boats',
      icon: '🚤'
    },
    {
      label: 'Total Runs',
      value: userStats?.runsStarted !== undefined ? String(userStats.runsStarted) : '0',
      suffix: 'runs',
      icon: '🏃'
    },
    {
      label: 'Success Rate',
      value: (() => {
        const started = Number(userStats?.runsStarted ?? 0)
        const won = Number(userStats?.runsWon ?? 0)
        return started > 0 ? Math.round((won / started) * 100).toString() : '0'
      })(),
      suffix: '%',
      icon: '📈'
    }
  ]

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        👤 Your Stats
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
        {GAME_CONFIGS.JOINT.isDeployed && (
          <button
            onClick={() => {
              if (GAME_CONFIGS.JOINT.isDeployed) {
                setActiveTab('JOINT')
              }
            }}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'JOINT'
                ? 'bg-green-500 text-white'
                : 'text-white hover:bg-white hover:bg-opacity-10'
            }`}
          >
            🌿 $JOINT
          </button>
        )}
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

      {/* Additional detailed stats if user has played */}
  {Number(userStats?.runsStarted ?? 0) > 0 && (
        <div className="mt-6 pt-4 border-t border-white border-opacity-20">
          <div className="grid grid-cols-2 gap-4 text-white text-sm">
            <div className="text-center">
      <div className="font-bold text-green-400">{String(userStats?.runsWon ?? 0)}</div>
              <div className="opacity-80">Runs Won</div>
            </div>
            <div className="text-center">
      <div className="font-bold text-red-400">{String(userStats?.boatsLost ?? 0)}</div>
              <div className="opacity-80">Boats Lost</div>
            </div>
          </div>
          {/* Only show max fleet size if it exists (BOAT game only) */}
      {userStats?.boatsOwnedMax !== undefined && (
            <div className="text-center mt-3">
              <div className="text-sm text-white opacity-80">
        🏆 Max Fleet Size: {String(userStats?.boatsOwnedMax ?? 0)} boats
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-white border-opacity-20">
        <div className="text-center text-white opacity-80 text-sm">
          {userStats && userStats.runsStarted && userStats.runsStarted > 0 
            ? '🎯 Keep playing to improve your success rate!' 
            : '🎮 Buy your first boat to start earning tokens!'
          }
        </div>
      </div>
    </div>
  )
}
