import { useState, useEffect } from 'react'
import { usePublicClient, useAccount } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { contracts } from '../config/contracts'

const BOAT_EMOJIS = {
  1: '🪜',
  2: '🛶', 
  3: '🚤',
  4: '🛥️'
}

const BOAT_NAMES = {
  1: 'Raft',
  2: 'Dinghy',
  3: 'Speedboat', 
  4: 'Yacht'
}

export default function Leaderboard() {
  const [selectedGame, setSelectedGame] = useState('BOAT')
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)
  const publicClient = usePublicClient()
  const { isConnected } = useAccount()

  // Mock data for when API limits are hit
  const getMockData = () => {
    const mockPlayers = [
      {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        totalRuns: 15,
        totalWins: 12,
        totalEarnings: parseEther('2400'),
        totalWagered: parseEther('1200'),
        highestLevel: 4,
        winRate: 80,
        netProfit: parseEther('1200')
      },
      {
        address: '0xabcdef1234567890abcdef1234567890abcdef12',
        totalRuns: 10,
        totalWins: 7,
        totalEarnings: parseEther('1400'),
        totalWagered: parseEther('800'),
        highestLevel: 3,
        winRate: 70,
        netProfit: parseEther('600')
      },
      {
        address: '0x9876543210fedcba9876543210fedcba98765432',
        totalRuns: 8,
        totalWins: 5,
        totalEarnings: parseEther('1000'),
        totalWagered: parseEther('640'),
        highestLevel: 3,
        winRate: 62.5,
        netProfit: parseEther('360')
      },
      {
        address: '0xfedcba9876543210fedcba9876543210fedcba98',
        totalRuns: 12,
        totalWins: 6,
        totalEarnings: parseEther('720'),
        totalWagered: parseEther('960'),
        highestLevel: 2,
        winRate: 50,
        netProfit: parseEther('-240')
      }
    ]
    
    return mockPlayers
  }

  // Simple sleep function for rate limiting
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  // Load cached data on component mount
  useEffect(() => {
    const cached = getCachedData(selectedGame)
    if (cached) {
      setLeaderboardData(cached.data)
      setLastFetch(cached.timestamp)
      setHasLoaded(true)
      setError('CACHED DATA - Click "Refresh" for latest')
    }
  }, [selectedGame])

  // Cache management
  const getCachedData = (game) => {
    try {
      const cached = localStorage.getItem(`leaderboard_${game}`)
      if (cached) {
        const data = JSON.parse(cached)
        // Cache is valid for 5 minutes
        if (Date.now() - data.timestamp < 300000) {
          return data
        }
      }
    } catch (error) {
      console.error('Error reading cache:', error)
    }
    return null
  }

  const setCachedData = (game, data) => {
    try {
      localStorage.setItem(`leaderboard_${game}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Error writing cache:', error)
    }
  }

  const fetchLeaderboardData = async () => {
    // Check if user has wallet connected for RPC access
    if (!publicClient || !isConnected) {
      setError('Connect wallet to load leaderboard data via your RPC')
      return
    }
    
    // Check if we've fetched recently to avoid overwhelming user's RPC
    const now = Date.now()
    if (now - lastFetch < 15000) { // Reduced to 15 seconds since using user's RPC
      console.log('Rate limit protection: please wait 15 seconds between requests')
      setError('Please wait 15 seconds between requests')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Check if we have cached data first (extended cache time)
      const cached = getCachedData(selectedGame)
      if (cached && Date.now() - cached.timestamp < 120000) { // 2 minute cache for user RPC
        setLeaderboardData(cached.data)
        setError('CACHED DATA - Using your wallet RPC (Sonic network)')
        setLastFetch(cached.timestamp)
        setLoading(false)
        setHasLoaded(true)
        return
      }

      console.log(`Fetching ${selectedGame} events via wallet RPC on Sonic network...`)

      // Use user's wallet RPC - much more efficient and no external API dependencies
      const currentBlock = await publicClient.getBlockNumber()
      const contract = selectedGame === 'BOAT' ? contracts.boatGame : contracts.jointBoatGame
      const eventName = selectedGame === 'BOAT' ? 'RunResult' : 'JointRun'
      
      // Start with very recent blocks first (last 50 blocks = ~10 minutes)
      let fromBlock = currentBlock - 50n
      let allLogs = []
      
      try {
        // Single request for recent activity using wallet's Sonic RPC
        const logs = await publicClient.getLogs({
          address: contract.address,
          event: {
            type: 'event',
            name: eventName,
            inputs: [
              { name: 'user', type: 'address', indexed: true },
              { name: 'tokenId', type: 'uint256', indexed: true },
              { name: 'level', type: 'uint8', indexed: false },
              { name: 'stake', type: 'uint256', indexed: false },
              { name: 'success', type: 'bool', indexed: false },
              { name: 'rewardPaid', type: 'uint256', indexed: false }
            ]
          },
          fromBlock,
          toBlock: 'latest'
        })

        allLogs = logs
        
        // If we don't have enough data, try a slightly larger range
        if (logs.length < 5 && fromBlock > currentBlock - 200n) {
          console.log('Expanding search to last 200 blocks for more data...')
          await sleep(500) // Brief pause for user's RPC
          
          const expandedLogs = await publicClient.getLogs({
            address: contract.address,
            event: {
              type: 'event',
              name: eventName,
              inputs: [
                { name: 'user', type: 'address', indexed: true },
                { name: 'tokenId', type: 'uint256', indexed: true },
                { name: 'level', type: 'uint8', indexed: false },
                { name: 'stake', type: 'uint256', indexed: false },
                { name: 'success', type: 'bool', indexed: false },
                { name: 'rewardPaid', type: 'uint256', indexed: false }
              ]
            },
            fromBlock: currentBlock - 200n,
            toBlock: 'latest'
          })
          
          allLogs = expandedLogs
        }
        
      } catch (blockError) {
        console.warn('RPC request failed, using minimal range:', blockError)
        // Final fallback to very small range
        fromBlock = currentBlock - 20n
        await sleep(300)
        
        allLogs = await publicClient.getLogs({
          address: contract.address,
          event: {
            type: 'event',
            name: eventName,
            inputs: [
              { name: 'user', type: 'address', indexed: true },
              { name: 'tokenId', type: 'uint256', indexed: true },
              { name: 'level', type: 'uint8', indexed: false },
              { name: 'stake', type: 'uint256', indexed: false },
              { name: 'success', type: 'bool', indexed: false },
              { name: 'rewardPaid', type: 'uint256', indexed: false }
            ]
          },
          fromBlock,
          toBlock: 'latest'
        })
      }

      // Process logs to create leaderboard
      const playerStats = {}
      
      allLogs.forEach((log) => {
        const { user, level, stake, success, rewardPaid } = log.args
        const userAddress = user.toLowerCase()
        
        if (!playerStats[userAddress]) {
          playerStats[userAddress] = {
            address: userAddress,
            totalRuns: 0,
            totalWins: 0,
            totalEarnings: 0n,
            totalWagered: 0n,
            highestLevel: 0,
            winRate: 0,
            netProfit: 0n
          }
        }
        
        const stats = playerStats[userAddress]
        stats.totalRuns++
        stats.totalWagered += stake
        
        if (success) {
          stats.totalWins++
          stats.totalEarnings += rewardPaid
        }
        
        if (Number(level) > stats.highestLevel) {
          stats.highestLevel = Number(level)
        }
        
        stats.winRate = (stats.totalWins / stats.totalRuns) * 100
        stats.netProfit = stats.totalEarnings - stats.totalWagered
      })

      // Convert to array and sort by net profit
      const sortedPlayers = Object.values(playerStats)
        .filter(player => player.totalRuns >= 1) // Minimum 1 run to qualify
        .sort((a, b) => {
          if (b.netProfit === a.netProfit) {
            return b.totalEarnings - a.totalEarnings
          }
          return Number(b.netProfit - a.netProfit)
        })
        .slice(0, 20) // Top 20 players

      // If no recent data, use mock data to show the interface
      if (sortedPlayers.length === 0) {
        console.log('No recent activity found via wallet RPC, showing demo data')
        const mockData = getMockData()
        setLeaderboardData(mockData)
        setCachedData(selectedGame, mockData)
        setError('DEMO DATA - No recent blockchain activity (via your wallet RPC)')
      } else {
        setLeaderboardData(sortedPlayers)
        setCachedData(selectedGame, sortedPlayers)
        setError(`LIVE DATA - ${allLogs.length} events found via Sonic network RPC`)
        console.log(`Successfully loaded ${sortedPlayers.length} players from ${allLogs.length} events`)
      }
      
      setLastFetch(now)
      setHasLoaded(true)
    } catch (error) {
      console.error('Error fetching leaderboard via wallet RPC:', error)
      
      // Provide specific error messages for common issues
      let errorMessage = 'DEMO DATA - Wallet RPC error'
      if (error.message?.includes('CORS')) {
        errorMessage = 'DEMO DATA - Network configuration issue (CORS)'
      } else if (error.message?.includes('fetch')) {
        errorMessage = 'DEMO DATA - Network connection issue'
      } else if (error.message?.includes('chain')) {
        errorMessage = 'DEMO DATA - Please switch to Sonic network in wallet'
      }
      
      // Use mock data when RPC fails or other errors
      console.log('Wallet RPC error, showing demo data')
      const mockData = getMockData()
      setLeaderboardData(mockData)
      setCachedData(selectedGame, mockData)
      setError(errorMessage)
      setLastFetch(now)
      setHasLoaded(true)
    } finally {
      setLoading(false)
    }
  }

  // Manual load function for the button
  const handleLoadLeaderboard = () => {
    fetchLeaderboardData()
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(formatEther(value))
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(decimals)
  }

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  const getNetProfitColor = (netProfit) => {
    if (netProfit > 0) return 'text-green-400'
    if (netProfit < 0) return 'text-red-400'
    return 'text-yellow-400'
  }

  return (
    <div className="terminal-bg rounded-xl p-6 border-2 border-cyan-400 neon-glow">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-cyan-400 neon-text mb-4 md:mb-0" style={{ fontFamily: 'Orbitron, monospace' }}>
          🏆 LEADERBOARD
        </h2>
        
        {/* Game Toggle */}
        <div className="flex space-x-1 terminal-bg border border-pink-400 rounded-lg p-1">
          {['BOAT', 'JOINT'].map((game) => (
            <button
              key={game}
              onClick={() => setSelectedGame(game)}
              className={`px-4 py-2 rounded-md font-bold transition-all duration-300 ${
                selectedGame === game
                  ? 'vice-button'
                  : 'text-pink-400 hover:text-cyan-400'
              }`}
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              ${game}
            </button>
          ))}
        </div>
      </div>

      {/* Load/Refresh Button */}
      <div className="text-center mb-6">
        <button
          onClick={handleLoadLeaderboard}
          disabled={loading || !isConnected}
          className={`vice-button px-8 py-3 text-lg font-bold transition-all duration-300 ${
            loading || !isConnected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          {!isConnected ? '🔌 CONNECT WALLET' : 
           loading ? '🔄 SCANNING RPC...' : 
           hasLoaded ? '🔄 REFRESH VIA RPC' : '📊 LOAD VIA WALLET RPC'}
        </button>
        <div className="mt-2">
          <p className="text-pink-400 font-semibold text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
            [ TOP SMUGGLERS BY NET PROFIT - {selectedGame} GAME ]
          </p>
          <p className="text-yellow-400 text-xs mt-1" style={{ fontFamily: 'Rajdhani, monospace' }}>
            {isConnected 
              ? '🔗 Using your wallet RPC • No API limits • Smart caching'
              : '⚠️ Connect wallet to load leaderboard data'}
          </p>
          {error && (
            <p className="text-orange-400 text-xs mt-1" style={{ fontFamily: 'Rajdhani, monospace' }}>
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-cyan-400 text-lg font-bold animate-pulse" style={{ fontFamily: 'Orbitron, monospace' }}>
            SCANNING YOUR WALLET RPC...
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !hasLoaded && leaderboardData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-yellow-400 text-lg font-bold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
            {!isConnected ? '� WALLET NOT CONNECTED' : '�📊 LEADERBOARD NOT LOADED'}
          </div>
          <p className="text-pink-400" style={{ fontFamily: 'Rajdhani, monospace' }}>
            {!isConnected 
              ? 'Connect your wallet to access leaderboard via your RPC connection'
              : 'Click "LOAD VIA WALLET RPC" to fetch the latest smuggler rankings'}
          </p>
          <p className="text-cyan-400 text-sm mt-2" style={{ fontFamily: 'Rajdhani, monospace' }}>
            {!isConnected 
              ? 'Uses your wallet RPC • No external API limits • Better privacy'
              : 'Smart caching • Uses your wallet RPC connection'}
          </p>
        </div>
      )}

      {/* Leaderboard Table */}
      {!loading && hasLoaded && leaderboardData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-400">
                <th className="text-left py-3 text-cyan-400 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>RANK</th>
                <th className="text-left py-3 text-cyan-400 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>SMUGGLER</th>
                <th className="text-center py-3 text-cyan-400 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>FLEET</th>
                <th className="text-right py-3 text-cyan-400 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>NET PROFIT</th>
                <th className="text-right py-3 text-cyan-400 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>WIN RATE</th>
                <th className="text-right py-3 text-cyan-400 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>RUNS</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((player, index) => (
                <tr 
                  key={player.address} 
                  className="border-b border-pink-400/30 hover:bg-cyan-400/10 transition-colors duration-300"
                >
                  <td className="py-4">
                    <span className="text-xl">{getRankEmoji(index)}</span>
                  </td>
                  <td className="py-4">
                    <div className="font-bold text-pink-400" style={{ fontFamily: 'Rajdhani, monospace' }}>
                      {formatAddress(player.address)}
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-2xl">{BOAT_EMOJIS[player.highestLevel]}</span>
                      <span className="text-yellow-400 text-sm font-bold" style={{ fontFamily: 'Rajdhani, monospace' }}>
                        {BOAT_NAMES[player.highestLevel]}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className={`font-bold ${getNetProfitColor(player.netProfit)}`} style={{ fontFamily: 'Orbitron, monospace' }}>
                      {player.netProfit >= 0 ? '+' : ''}{formatNumber(player.netProfit)} ${selectedGame}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="text-cyan-400 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
                      {player.winRate.toFixed(1)}%
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="text-yellow-400 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
                      {player.totalRuns}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-cyan-400 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-green-400 font-bold">+PROFIT:</span>
            <span className="text-yellow-400 ml-1" style={{ fontFamily: 'Rajdhani, monospace' }}>Successful smuggler</span>
          </div>
          <div>
            <span className="text-red-400 font-bold">-LOSS:</span>
            <span className="text-yellow-400 ml-1" style={{ fontFamily: 'Rajdhani, monospace' }}>Coast Guard got them</span>
          </div>
          <div>
            <span className="text-yellow-400 font-bold">BREAK EVEN:</span>
            <span className="text-yellow-400 ml-1" style={{ fontFamily: 'Rajdhani, monospace' }}>Playing it safe</span>
          </div>
        </div>
      </div>
    </div>
  )
}
