import { useState, useEffect } from 'react'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { formatEther } from 'viem'
import { contracts, GAME_CONFIGS } from '../config/contracts'

export default function RunResults({ selectedToken }) {
  const { address } = useAccount()
  const [results, setResults] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [currentResult, setCurrentResult] = useState(null)

  // Get contract config based on selected token
  const getContractConfig = () => {
    if (selectedToken === 'BOAT') {
      return contracts.boatGame
    } else if (selectedToken === 'JOINT') {
      return contracts.jointBoatGame
    }
    return contracts.boatGame // fallback
  }

  // Get event name based on selected token
  const getEventName = () => {
    return selectedToken === 'JOINT' ? 'JointRun' : 'RunResult'
  }

  // Watch for RunResult/JointRun events
  useWatchContractEvent({
    ...getContractConfig(),
    eventName: getEventName(),
    onLogs(logs) {
      logs.forEach((log) => {
        const { user, tokenId, level, stake, success, rewardPaid } = log.args
        
        // Only show results for the current user
        if (user?.toLowerCase() === address?.toLowerCase()) {
          const result = {
            id: Date.now() + Math.random(),
            tokenId: tokenId.toString(),
            level: parseInt(level),
            stake: formatEther(stake),
            success,
            rewardPaid: rewardPaid ? formatEther(rewardPaid) : '0',
            timestamp: new Date(),
            type: 'run',
            gameToken: selectedToken // Track which game this result is from
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

  // Watch for BoatBurned events (both contracts emit same event)
  useWatchContractEvent({
    ...getContractConfig(),
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
          gameToken: selectedToken
        }
        
        setResults(prev => [result, ...prev.slice(0, 9)])
      })
    }
  })

  // Watch for BoatDowngraded events (both contracts emit same event)
  useWatchContractEvent({
    ...getContractConfig(),
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
          gameToken: selectedToken
        }
        
        setResults(prev => [result, ...prev.slice(0, 9)])
      })
    }
  })

  // Watch for RaftSpawned events (bonus rafts from yachts) - BOAT game only
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'RaftSpawned',
    enabled: selectedToken === 'BOAT', // Only listen when BOAT game is selected
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
    const emojis = { 1: '🪜', 2: '🛶', 3: '🚤', 4: '🛥️' }
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
            ? `Your ${getBoatName(result.level)} #${result.tokenId} completed a successful smuggling run! You won ${parseFloat(result.rewardPaid).toFixed(0)} ${tokenSymbol} tokens.`
            : `Your ${getBoatName(result.level)} #${result.tokenId} failed the smuggling run. You lost ${parseFloat(result.stake).toFixed(0)} ${tokenSymbol} tokens. ${result.level === 1 ? 'Your raft will be BURNED!' : 'Your boat will be DOWNGRADED!'}`,
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-gradient-to-br ${
            formatResult(currentResult).color === 'green' ? 'from-green-500 to-green-700' :
            formatResult(currentResult).color === 'red' ? 'from-red-500 to-red-700' :
            formatResult(currentResult).color === 'yellow' ? 'from-yellow-500 to-yellow-700' :
            formatResult(currentResult).color === 'blue' ? 'from-blue-500 to-blue-700' :
            'from-gray-500 to-gray-700'
          } rounded-xl p-6 max-w-md mx-auto border border-white border-opacity-20 text-white`}>
            <div className="text-center">
              <div className="text-6xl mb-4">{formatResult(currentResult).emoji}</div>
              <h3 className="text-2xl font-bold mb-4">{formatResult(currentResult).title}</h3>
              <p className="text-lg mb-6 opacity-90">{formatResult(currentResult).message}</p>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent results list */}
      {results.length > 0 && (
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20 mb-4">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center">
            📊 Recent Activity
            <span className="ml-2 text-sm opacity-80">({results.length}/10)</span>
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {results.map((result) => {
              const formatted = formatResult(result)
              return (
                <div key={result.id} className="flex items-center space-x-3 p-2 bg-white bg-opacity-10 rounded-lg">
                  <div className="text-xl">{formatted.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {formatted.title}
                    </div>
                    <div className="text-xs text-white opacity-80">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
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
