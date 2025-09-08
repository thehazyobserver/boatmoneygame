import { useState, useEffect } from 'react'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { formatEther } from 'viem'
import { contracts, GAME_CONFIGS } from '../config/contracts'
import { formatTokenAmount, formatInteger } from '../utils/formatters'

export default function RunResults() {
  const { address } = useAccount()
  const [results, setResults] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [currentResult, setCurrentResult] = useState(null)

  // Watch events from both BOAT and JOINT contracts

  // Get event name based on selected token
  // Watch for BOAT game RunResult events
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'RunResult',
    onLogs(logs) {
      logs.forEach((log) => {
        const { user, tokenId, level, stake, success, rewardPaid } = log.args
        
        // Only show results for the current user
        if (user?.toLowerCase() === address?.toLowerCase()) {
          const result = {
            id: Date.now() + Math.random(),
            tokenId: tokenId.toString(),
            level: parseInt(level),
            stakeWei: stake, // Store original BigInt for accurate formatting
            stake: formatTokenAmount(stake), // For backward compatibility
            success,
            rewardPaidWei: rewardPaid || 0n, // Store original BigInt
            rewardPaid: rewardPaid ? formatTokenAmount(rewardPaid) : '0',
            timestamp: new Date(),
            type: 'run',
            gameToken: 'BOAT' // Track which game this result is from
          }
          
          setCurrentResult(result)
          setResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
          setShowModal(true)
          
          // Auto-hide modal after 8 seconds
          setTimeout(() => setShowModal(false), 8000)
        }
      })
    }
  })

  // Watch for JOINT game JointRun events
  useWatchContractEvent({
    ...contracts.jointBoatGame,
    eventName: 'JointRun',
    onLogs(logs) {
      logs.forEach((log) => {
        const { user, tokenId, level, stake, success, rewardPaid } = log.args
        
        // Only show results for the current user
        if (user?.toLowerCase() === address?.toLowerCase()) {
          const result = {
            id: Date.now() + Math.random(),
            tokenId: tokenId.toString(),
            level: parseInt(level),
            stakeWei: stake, // Store original BigInt for accurate formatting
            stake: formatTokenAmount(stake), // For backward compatibility
            success,
            rewardPaidWei: rewardPaid || 0n, // Store original BigInt
            rewardPaid: rewardPaid ? formatTokenAmount(rewardPaid) : '0',
            timestamp: new Date(),
            type: 'run',
            gameToken: 'JOINT' // Track which game this result is from
          }
          
          setCurrentResult(result)
          setResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
          setShowModal(true)
          
          // Auto-hide modal after 8 seconds
          setTimeout(() => setShowModal(false), 8000)
        }
      })
    }
  })

  // Watch for BOAT game BoatBurned events
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'BoatBurned',
    onLogs(logs) {
      logs.forEach((log) => {
        const { tokenId, level } = log.args
        
        const result = {
          id: Date.now() + Math.random(),
          tokenId: tokenId.toString(),
          level: parseInt(level),
          timestamp: new Date(),
          type: 'burned',
          gameToken: 'BOAT'
        }
        
        setResults(prev => [result, ...prev.slice(0, 9)])
      })
    }
  })

  // Watch for JOINT game BoatBurned events
  useWatchContractEvent({
    ...contracts.jointBoatGame,
    eventName: 'BoatBurned',
    onLogs(logs) {
      logs.forEach((log) => {
        const { tokenId, level } = log.args
        
        const result = {
          id: Date.now() + Math.random(),
          tokenId: tokenId.toString(),
          level: parseInt(level),
          timestamp: new Date(),
          type: 'burned',
          gameToken: 'JOINT'
        }
        
        setResults(prev => [result, ...prev.slice(0, 9)])
      })
    }
  })

  // Watch for BOAT game BoatDowngraded events
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'BoatDowngraded',
    onLogs(logs) {
      logs.forEach((log) => {
        const { tokenId, fromLevel, toLevel } = log.args
        
        const result = {
          id: Date.now() + Math.random(),
          tokenId: tokenId.toString(),
          fromLevel: parseInt(fromLevel),
          toLevel: parseInt(toLevel),
          timestamp: new Date(),
          type: 'downgraded',
          gameToken: 'BOAT'
        }
        
        setResults(prev => [result, ...prev.slice(0, 9)])
      })
    }
  })

  // Watch for JOINT game BoatDowngraded events
  useWatchContractEvent({
    ...contracts.jointBoatGame,
    eventName: 'BoatDowngraded',
    onLogs(logs) {
      logs.forEach((log) => {
        const { tokenId, fromLevel, toLevel } = log.args
        
        const result = {
          id: Date.now() + Math.random(),
          tokenId: tokenId.toString(),
          fromLevel: parseInt(fromLevel),
          toLevel: parseInt(toLevel),
          timestamp: new Date(),
          type: 'downgraded',
          gameToken: 'JOINT'
        }
        
        setResults(prev => [result, ...prev.slice(0, 9)])
      })
    }
  })

  // Watch for RaftSpawned events (bonus rafts from yachts) - BOAT game only
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'RaftSpawned',
    onLogs(logs) {
      logs.forEach((log) => {
        const { to, tokenId } = log.args
        
        // Only show for current user
        if (to?.toLowerCase() === address?.toLowerCase()) {
          const result = {
            id: Date.now() + Math.random(),
            tokenId: tokenId.toString(),
            timestamp: new Date(),
            type: 'spawned',
            gameToken: 'BOAT'
          }
          
          setResults(prev => [result, ...prev.slice(0, 9)])
        }
      })
    }
  })

  const getBoatEmoji = (level) => {
    const emojis = { 1: '⛵', 2: '🛶', 3: '🚤', 4: '🛥️' }
    return emojis[level] || '🚤'
  }

  const getBoatName = (level) => {
    const names = { 1: 'Raft', 2: 'Dinghy', 3: 'Speedboat', 4: 'Yacht' }
    return names[level] || 'Boat'
  }

  const formatResult = (result) => {
    const tokenSymbol = result.gameToken === 'JOINT' ? 'JOINT' : 'BOAT'
    
    switch (result.type) {
      case 'run':
        return {
          title: result.success ? '🎉 Successful Run!' : '💥 Run Failed!',
          message: result.success 
            ? `Your ${getBoatName(result.level)} #${result.tokenId} completed a successful smuggling run! You won ${formatTokenAmount(result.rewardPaidWei, 0)} ${tokenSymbol} tokens.`
            : `Your ${getBoatName(result.level)} #${result.tokenId} failed the smuggling run. You lost ${formatTokenAmount(result.stakeWei, 0)} ${tokenSymbol} from your play amount. ${result.level === 1 ? 'Your raft will be BURNED!' : 'Your boat will be DOWNGRADED!'}`,
          color: result.success ? 'green' : 'red',
          emoji: result.success ? '💰' : '💸'
        }
      case 'burned':
        return {
          title: '🔥 Boat Burned!',
          message: `Your ${getBoatName(result.level)} #${result.tokenId} was burned after the failed run!`,
          color: 'red',
          emoji: '🔥'
        }
      case 'downgraded':
        return {
          title: '⬇️ Boat Downgraded',
          message: `Your ${getBoatName(result.fromLevel)} #${result.tokenId} was downgraded to a ${getBoatName(result.toLevel)} after the failed run.`,
          color: 'yellow',
          emoji: '📉'
        }
      case 'spawned':
        return {
          title: '🎁 Bonus Raft!',
          message: `Your yacht spawned a free raft! New Raft #${result.tokenId} has been added to your fleet.`,
          color: 'blue',
          emoji: '🎁'
        }
      default:
        return {
          title: 'Unknown Event',
          message: 'Something happened with your boat.',
          color: 'gray',
          emoji: '❓'
        }
    }
  }

  if (!address) return null

  return (
    <>
      {/* Modal for latest result */}
      {showModal && currentResult && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className={`terminal-bg rounded-xl p-8 max-w-lg mx-auto border-2 neon-glow relative overflow-hidden ${
            formatResult(currentResult).color === 'green' ? 'border-green-400' :
            formatResult(currentResult).color === 'red' ? 'border-red-400' :
            formatResult(currentResult).color === 'yellow' ? 'border-yellow-400' :
            formatResult(currentResult).color === 'blue' ? 'border-cyan-400' :
            'border-pink-400'
          }`}>
            
            {/* Animated background effect */}
            <div className="absolute inset-0 opacity-10">
              <div className={`absolute inset-0 bg-gradient-to-br ${
                formatResult(currentResult).color === 'green' ? 'from-green-400 to-cyan-400' :
                formatResult(currentResult).color === 'red' ? 'from-red-400 to-pink-400' :
                formatResult(currentResult).color === 'yellow' ? 'from-yellow-400 to-orange-400' :
                formatResult(currentResult).color === 'blue' ? 'from-cyan-400 to-blue-400' :
                'from-pink-400 to-purple-400'
              } animate-pulse`}></div>
            </div>

            <div className="text-center relative z-10">
              <div className="text-8xl mb-6 animate-bounce">{formatResult(currentResult).emoji}</div>
              <h3 className={`text-3xl font-bold mb-4 neon-text ${
                formatResult(currentResult).color === 'green' ? 'text-green-400' :
                formatResult(currentResult).color === 'red' ? 'text-red-400' :
                formatResult(currentResult).color === 'yellow' ? 'text-yellow-400' :
                formatResult(currentResult).color === 'blue' ? 'text-cyan-400' :
                'text-pink-400'
              }`} style={{ fontFamily: 'Orbitron, monospace' }}>
                {formatResult(currentResult).title}
              </h3>
              <div className="bg-black bg-opacity-50 rounded-lg p-4 mb-6 border border-cyan-400 border-opacity-30">
                <p className="text-lg text-white leading-relaxed" style={{ fontFamily: 'Rajdhani, monospace' }}>
                  {formatResult(currentResult).message}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="px-8 py-3 vice-button text-white font-bold text-lg transition-all duration-300 neon-glow"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent results list */}
      {results.length > 0 && (
        <div className="terminal-bg rounded-xl p-6 border-2 border-cyan-400 mb-4 neon-glow">
          <h3 className="text-xl font-bold text-cyan-400 neon-text mb-4 flex items-center" style={{ fontFamily: 'Orbitron, monospace' }}>
            📊 RECENT ACTIVITY
            <span className="ml-2 text-sm opacity-80 text-pink-400">({results.length}/10)</span>
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
            {results.map((result) => {
              const formatted = formatResult(result)
              const tokenSymbol = result.gameToken === 'BOAT' ? '$BOAT' : '$JOINT'
              
              return (
                <div key={result.id} className="flex items-center justify-between p-3 terminal-bg border border-cyan-400 border-opacity-30 rounded-lg hover:border-opacity-60 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{formatted.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${
                          formatted.color === 'green' ? 'text-green-400' :
                          formatted.color === 'red' ? 'text-red-400' :
                          'text-yellow-400'
                        }`} style={{ fontFamily: 'Orbitron, monospace' }}>
                          {result.type === 'run' ? (result.success ? 'WON' : 'LOST') : result.type.toUpperCase()}
                        </span>
                        <span className="text-white text-xs" style={{ fontFamily: 'Rajdhani, monospace' }}>
                          {getBoatName(result.level)} #{result.tokenId}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400" style={{ fontFamily: 'Rajdhani, monospace' }}>
                        {result.timestamp.toLocaleTimeString()} • {result.gameToken}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {result.type === 'run' && (
                      <div className={`text-lg font-bold ${
                        result.success ? 'text-green-400' : 'text-red-400'
                      }`} style={{ fontFamily: 'Orbitron, monospace' }}>
                        {result.success ? '+' : '-'}{formatTokenAmount(result.success ? result.rewardPaidWei : result.stakeWei, 0)} {tokenSymbol}
                      </div>
                    )}
                    {(result.type === 'burned' || result.type === 'upgraded' || result.type === 'downgraded') && (
                      <div className="text-sm text-yellow-400 font-semibold" style={{ fontFamily: 'Rajdhani, monospace' }}>
                        Level Change
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
