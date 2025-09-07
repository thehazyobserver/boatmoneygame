import { useState, useEffect } from 'react'
import { request, gql } from 'graphql-request'

const BOAT_EMOJIS = {
  1: '🚣',
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

// The Graph endpoint for your subgraph
const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/109706/boatgame/v0.0.1'

export default function Leaderboard() {
  const [selectedGame, setSelectedGame] = useState('BOAT')
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Cache management
  const getCachedData = (game) => {
    try {
      const cached = localStorage.getItem(`leaderboard_subgraph_${game}`)
      if (cached) {
        const data = JSON.parse(cached)
        // Cache is valid for 2 minutes
        if (Date.now() - data.timestamp < 120000) {
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
      localStorage.setItem(`leaderboard_subgraph_${game}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Error writing cache:', error)
    }
  }

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

  const fetchLeaderboardData = async () => {
    // Rate limiting
    const now = Date.now()
    if (now - lastFetch < 10000) {
      setError('Please wait 10 seconds between requests')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      console.log(`Fetching ${selectedGame} leaderboard from subgraph...`)
      
      // Dynamic query based on selected game
      const query = gql`
        query GetLeaderboard {
          users(
            first: 20
            orderBy: ${selectedGame === 'BOAT' ? 'boatWins' : 'jointWins'}
            orderDirection: desc
            where: { ${selectedGame === 'BOAT' ? 'boatWins_gt: 0' : 'jointWins_gt: 0'} }
          ) {
            id
            boatWins
            jointWins
          }
        }
      `

      const data = await request(SUBGRAPH_URL, query)
      
      // Transform subgraph data to match existing component structure
      const transformedData = data.users.map((user, index) => ({
        address: user.id,
        totalWins: selectedGame === 'BOAT' ? user.boatWins : user.jointWins,
        winRate: 100, // We don't track total runs yet, so assume all tracked events are wins
        highestLevel: 4, // Default to highest level for display
        netProfit: BigInt(user.boatWins * 1000 + user.jointWins * 1500) * BigInt(10**18), // Mock profit calculation
        totalRuns: selectedGame === 'BOAT' ? user.boatWins : user.jointWins,
        totalEarnings: BigInt(user.boatWins * 1200 + user.jointWins * 1800) * BigInt(10**18), // Mock earnings
        totalWagered: BigInt(user.boatWins * 200 + user.jointWins * 300) * BigInt(10**18) // Mock wagered
      }))

      setLeaderboardData(transformedData)
      setCachedData(selectedGame, transformedData)
      setError(`LIVE DATA - ${data.users.length} players from subgraph`)
      setLastFetch(now)
      setHasLoaded(true)
      
      console.log(`Successfully loaded ${transformedData.length} players from subgraph`)
    } catch (error) {
      console.error('Error fetching from subgraph:', error)
      setError('SUBGRAPH ERROR - Unable to fetch data')
      
      // Fallback to mock data
      const mockData = [
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          totalWins: 12,
          winRate: 80,
          highestLevel: 4,
          netProfit: BigInt(1200) * BigInt(10**18),
          totalRuns: 15,
          totalEarnings: BigInt(2400) * BigInt(10**18),
          totalWagered: BigInt(1200) * BigInt(10**18)
        }
      ]
      setLeaderboardData(mockData)
      setCachedData(selectedGame, mockData)
      setLastFetch(now)
      setHasLoaded(true)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadLeaderboard = () => {
    fetchLeaderboardData()
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value.toString()) / (10**18)
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
          disabled={loading}
          className={`vice-button px-8 py-3 text-lg font-bold transition-all duration-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          {loading ? '🔄 LOADING...' : 
           hasLoaded ? '🔄 REFRESH' : '📊 LOAD LEADERBOARD'}
        </button>
        <div className="mt-2">
          <p className="text-pink-400 font-semibold text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
            [ TOP WINNERS BY GAMES WON - {selectedGame} GAME ]
          </p>
          <p className="text-yellow-400 text-xs mt-1" style={{ fontFamily: 'Rajdhani, monospace' }}>
            🔗 Powered by The Graph • Fast & Reliable
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
            QUERYING SUBGRAPH...
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !hasLoaded && leaderboardData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-yellow-400 text-lg font-bold mb-4" style={{ fontFamily: 'Orbitron, monospace' }}>
            📊 LEADERBOARD NOT LOADED
          </div>
          <p className="text-pink-400" style={{ fontFamily: 'Rajdhani, monospace' }}>
            Click "LOAD LEADERBOARD" to fetch the latest winner rankings
          </p>
          <p className="text-cyan-400 text-sm mt-2" style={{ fontFamily: 'Rajdhani, monospace' }}>
            Fast loading • No wallet required • Always up-to-date
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
                <th className="text-left py-3 text-cyan-400 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>PLAYER</th>
                <th className="text-center py-3 text-cyan-400 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>FLEET</th>
                <th className="text-right py-3 text-cyan-400 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>WINS</th>
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
                    <div className="flex flex-col items-center">
                      <span className="text-2xl">{BOAT_EMOJIS[player.highestLevel]}</span>
                      <span className="text-xs text-yellow-400 mt-1" style={{ fontFamily: 'Rajdhani, monospace' }}>
                        {BOAT_NAMES[player.highestLevel]}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="text-green-400 font-bold text-lg" style={{ fontFamily: 'Orbitron, monospace' }}>
                      {player.totalWins}
                    </div>
                    <div className="text-xs text-gray-400" style={{ fontFamily: 'Rajdhani, monospace' }}>
                      games won
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
            <span className="text-green-400 font-bold">WINS:</span>
            <span className="text-yellow-400 ml-1" style={{ fontFamily: 'Rajdhani, monospace' }}>Successful games</span>
          </div>
          <div>
            <span className="text-cyan-400 font-bold">RATE:</span>
            <span className="text-yellow-400 ml-1" style={{ fontFamily: 'Rajdhani, monospace' }}>Win percentage</span>
          </div>
          <div>
            <span className="text-pink-400 font-bold">RUNS:</span>
            <span className="text-yellow-400 ml-1" style={{ fontFamily: 'Rajdhani, monospace' }}>Total games played</span>
          </div>
        </div>
      </div>
    </div>
  )
}
