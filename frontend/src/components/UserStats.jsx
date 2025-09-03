import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI } from '../config/contracts'

export default function UserStats() {
  const { address, isConnected } = useAccount()

  // First, read the BOAT token address from the game contract
  const { data: boatTokenAddress } = useReadContract({
    ...contracts.boatGame,
    functionName: 'BOAT'
  })

  // Read user's BOAT token balance from the actual BOAT token contract
  const { data: boatBalance } = useReadContract({
    address: boatTokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: isConnected && !!boatTokenAddress }
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
    ...contracts.boatGame,
    functionName: 'getStats',
    args: [address],
    query: { enabled: isConnected && !!address }
  })

  if (!isConnected) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
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
      label: 'BOAT Tokens',
      value: boatBalance ? parseFloat(formatEther(boatBalance)).toFixed(2) : '0.00',
      suffix: 'BOAT',
      icon: '🪙'
    },
    {
      label: 'Your Boats',
      value: boatCount ? boatCount.toString() : '0',
      suffix: 'boats',
      icon: '🚤'
    },
    {
      label: 'Total Runs',
      value: userStats ? userStats.runsStarted.toString() : '0',
      suffix: 'runs',
      icon: '🏃'
    },
    {
      label: 'Success Rate',
      value: userStats && userStats.runsStarted > 0 
        ? Math.round((Number(userStats.runsWon) / Number(userStats.runsStarted)) * 100).toString() 
        : '0',
      suffix: '%',
      icon: '📈'
    }
  ]

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        👤 Your Stats
      </h2>
      
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
      {userStats && userStats.runsStarted > 0 && (
        <div className="mt-6 pt-4 border-t border-white border-opacity-20">
          <div className="grid grid-cols-2 gap-4 text-white text-sm">
            <div className="text-center">
              <div className="font-bold text-green-400">{userStats.runsWon.toString()}</div>
              <div className="opacity-80">Runs Won</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-400">{userStats.boatsLost.toString()}</div>
              <div className="opacity-80">Boats Lost</div>
            </div>
          </div>
          <div className="text-center mt-3">
            <div className="text-sm text-white opacity-80">
              🏆 Max Fleet Size: {userStats.boatsOwnedMax.toString()} boats
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-white border-opacity-20">
        <div className="text-center text-white opacity-80 text-sm">
          {userStats && userStats.runsStarted > 0 
            ? '🎯 Keep playing to improve your success rate!' 
            : '🎮 Buy your first boat to start earning BOAT tokens!'
          }
        </div>
      </div>
    </div>
  )
}
