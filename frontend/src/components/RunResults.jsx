import { useState, useEffect, useRef } from 'react'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { formatEther } from 'viem'
import { contracts, GAME_CONFIGS } from '../config/contracts'
import { formatTokenAmount, formatInteger } from '../utils/formatters'

export default function RunResults() {
  const { address } = useAccount()
  const [results, setResults] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [currentResult, setCurrentResult] = useState(null)
  const hideTimerRef = useRef(null)
  const seenLogIdsRef = useRef(new Set())
  const activeAddressRef = useRef(address?.toLowerCase() || null)

  // Keep ref in sync with current address to avoid stale closures
  useEffect(() => {
    activeAddressRef.current = address?.toLowerCase() || null
  // Reset seen log cache when user changes to avoid suppressing their events
  seenLogIdsRef.current = new Set()
  }, [address])

  // Clear any pending hide timers on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [])

  // Fallback: listen for local 'runResult' events dispatched after tx receipt parsing
  useEffect(() => {
    const onLocalRunResult = (e) => {
      const r = e?.detail
      if (!r) return
      const key = r._dedupeKey || `${r.txHash || ''}:${r.logIndex ?? ''}`
      if (key && seenLogIdsRef.current.has(key)) return
      if (key) seenLogIdsRef.current.add(key)

      setCurrentResult(r)
      setResults(prev => [r, ...prev.slice(0, 9)])
      setShowModal(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => setShowModal(false), 8000)
    }
    window.addEventListener('runResult', onLocalRunResult)
    return () => window.removeEventListener('runResult', onLocalRunResult)
  }, [])

  // Helper function to safely process event logs
  const processEventLog = (log, processorFn, eventType) => {
    try {
      processorFn(log)
    } catch (error) {
      console.error(`Error processing ${eventType} event:`, error, log)
    }
  }

  // Watch events from both BOAT and JOINT contracts

  // Watch for BOAT game RunResult events
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'RunResult',
    onLogs(logs) {
      logs.forEach((log) => {
        processEventLog(log, (log) => {
          const { user, tokenId, level, stake, success, rewardPaid } = log.args || {}
          const key = `${log.transactionHash}:${log.logIndex}`
          if (seenLogIdsRef.current.has(key)) return
          // Only show results for the current user
          if (user?.toLowerCase() === activeAddressRef.current) {
            seenLogIdsRef.current.add(key)
            const result = {
              id: Date.now() + Math.random(),
              tokenId: tokenId?.toString() || '0',
              level: level ? parseInt(level) : 0,
              stakeWei: stake || 0n, // Store original BigInt for accurate formatting
              stake: stake ? formatTokenAmount(stake) : '0', // For backward compatibility
              success: Boolean(success),
              rewardPaidWei: rewardPaid || 0n, // Store original BigInt
              rewardPaid: rewardPaid ? formatTokenAmount(rewardPaid) : '0',
              timestamp: new Date(),
              type: 'run',
              gameToken: 'BOAT' // Track which game this result is from
            }
            setCurrentResult(result)
            setResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
            console.debug('[RunResults] Showing modal for RunResult', { game: 'BOAT', tokenId: result.tokenId, success: result.success })
            setShowModal(true)
            // Auto-hide modal after 8 seconds
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
            hideTimerRef.current = setTimeout(() => setShowModal(false), 8000)
          }
        }, 'RunResult')
      })
    }
  })

  // Watch for JOINT game JointRun events
  useWatchContractEvent({
    ...contracts.jointBoatGame,
    eventName: 'JointRun',
    onLogs(logs) {
      logs.forEach((log) => {
        processEventLog(log, (log) => {
          const { user, tokenId, level, stake, success, rewardPaid } = log.args || {}
          const key = `${log.transactionHash}:${log.logIndex}`
          if (seenLogIdsRef.current.has(key)) return
          // Only show results for the current user
          if (user?.toLowerCase() === activeAddressRef.current) {
            seenLogIdsRef.current.add(key)
            const result = {
              id: Date.now() + Math.random(),
              tokenId: tokenId?.toString() || '0',
              level: level ? parseInt(level) : 0,
              stakeWei: stake || 0n,
              stake: stake ? formatTokenAmount(stake) : '0',
              success: Boolean(success),
              rewardPaidWei: rewardPaid || 0n,
              rewardPaid: rewardPaid ? formatTokenAmount(rewardPaid) : '0',
              timestamp: new Date(),
              type: 'run',
              gameToken: 'JOINT'
            }
            setCurrentResult(result)
            setResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
            console.debug('[RunResults] Showing modal for JointRun', { game: 'JOINT', tokenId: result.tokenId, success: result.success })
            setShowModal(true)
            // Auto-hide modal after 8 seconds
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
            hideTimerRef.current = setTimeout(() => setShowModal(false), 8000)
          }
        }, 'JointRun')
      })
    }
  })

  // Watch for LSD game LSDRun events
  useWatchContractEvent({
    ...contracts.lsdGame,
    eventName: 'LSDRun',
    onLogs(logs) {
      logs.forEach((log) => {
        processEventLog(log, (log) => {
          const { user, tokenId, level, stake, success, rewardPaid } = log.args || {}
          const key = `${log.transactionHash}:${log.logIndex}`
          if (seenLogIdsRef.current.has(key)) return
          // Only show results for the current user
          if (user?.toLowerCase() === activeAddressRef.current) {
            seenLogIdsRef.current.add(key)
            const result = {
              id: Date.now() + Math.random(),
              tokenId: tokenId?.toString() || '0',
              level: level ? parseInt(level) : 0,
              stakeWei: stake || 0n,
              stake: stake ? formatTokenAmount(stake) : '0',
              success: Boolean(success),
              rewardPaidWei: rewardPaid || 0n,
              rewardPaid: rewardPaid ? formatTokenAmount(rewardPaid) : '0',
              timestamp: new Date(),
              type: 'run',
              gameToken: 'LSD'
            }
            setCurrentResult(result)
            setResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
            console.debug('[RunResults] Showing modal for LSDRun', { game: 'LSD', tokenId: result.tokenId, success: result.success })
            setShowModal(true)
            // Auto-hide modal after 8 seconds
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
            hideTimerRef.current = setTimeout(() => setShowModal(false), 8000)
          }
        }, 'LSDRun')
      })
    }
  })

  // Watch for LIZARD game LIZARDRun events
  useWatchContractEvent({
    ...contracts.lizardGame,
    eventName: 'LIZARDRun',
    onLogs(logs) {
      logs.forEach((log) => {
        processEventLog(log, (log) => {
          const { user, tokenId, level, stake, success, rewardPaid } = log.args || {}
          const key = `${log.transactionHash}:${log.logIndex}`
          if (seenLogIdsRef.current.has(key)) return
          // Only show results for the current user
          if (user?.toLowerCase() === activeAddressRef.current) {
            seenLogIdsRef.current.add(key)
            const result = {
              id: Date.now() + Math.random(),
              tokenId: tokenId?.toString() || '0',
              level: level ? parseInt(level) : 0,
              stakeWei: stake || 0n,
              stake: stake ? formatTokenAmount(stake) : '0',
              success: Boolean(success),
              rewardPaidWei: rewardPaid || 0n,
              rewardPaid: rewardPaid ? formatTokenAmount(rewardPaid) : '0',
              timestamp: new Date(),
              type: 'run',
              gameToken: 'LIZARD'
            }
            setCurrentResult(result)
            setResults(prev => [result, ...prev.slice(0, 9)])
            console.debug('[RunResults] Showing modal for LIZARDRun', { game: 'LIZARD', tokenId: result.tokenId, success: result.success })
            setShowModal(true)
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
            hideTimerRef.current = setTimeout(() => setShowModal(false), 8000)
          }
        }, 'LIZARDRun')
      })
    }
  })

  // Watch for BOAT game BoatBurned events
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'BoatBurned',
  onLogs(logs) {
      logs.forEach((log) => {
        processEventLog(log, (log) => {
          const { tokenId, level } = log.args || {}
      const key = `${log.transactionHash}:${log.logIndex}`
      if (seenLogIdsRef.current.has(key)) return
      seenLogIdsRef.current.add(key)
          
          const result = {
            id: Date.now() + Math.random(),
            tokenId: tokenId?.toString() || '0',
            level: level ? parseInt(level) : 0,
            timestamp: new Date(),
            type: 'burned',
            gameToken: 'BOAT'
          }
          
          setResults(prev => [result, ...prev.slice(0, 9)])
        }, 'BoatBurned')
      })
    }
  })

  // Watch for JOINT game BoatBurned events
  useWatchContractEvent({
    ...contracts.jointBoatGame,
    eventName: 'BoatBurned',
  onLogs(logs) {
      logs.forEach((log) => {
    const { tokenId, level } = log.args || {}
    const key = `${log.transactionHash}:${log.logIndex}`
    if (seenLogIdsRef.current.has(key)) return
    seenLogIdsRef.current.add(key)
        
        const result = {
          id: Date.now() + Math.random(),
          tokenId: tokenId?.toString() || '0',
          level: level ? parseInt(level) : 0,
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
    const { tokenId, fromLevel, toLevel } = log.args || {}
    const key = `${log.transactionHash}:${log.logIndex}`
    if (seenLogIdsRef.current.has(key)) return
    seenLogIdsRef.current.add(key)
        
        const result = {
          id: Date.now() + Math.random(),
          tokenId: tokenId?.toString() || '0',
          fromLevel: fromLevel ? parseInt(fromLevel) : 0,
          toLevel: toLevel ? parseInt(toLevel) : 0,
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
    const { tokenId, fromLevel, toLevel } = log.args || {}
    const key = `${log.transactionHash}:${log.logIndex}`
    if (seenLogIdsRef.current.has(key)) return
    seenLogIdsRef.current.add(key)
        
        const result = {
          id: Date.now() + Math.random(),
          tokenId: tokenId?.toString() || '0',
          fromLevel: fromLevel ? parseInt(fromLevel) : 0,
          toLevel: toLevel ? parseInt(toLevel) : 0,
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
        const { to, tokenId } = log.args || {}
        const key = `${log.transactionHash}:${log.logIndex}`
        if (seenLogIdsRef.current.has(key)) return
        
        // Only show for current user
        if (to?.toLowerCase() === activeAddressRef.current) {
          seenLogIdsRef.current.add(key)
          const result = {
            id: Date.now() + Math.random(),
            tokenId: tokenId?.toString() || '0',
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
    const emojis = { 1: '🛶', 2: '⛵', 3: '🚤', 4: '🛥️' }
    return emojis[level] || '🚤'
  }

  const getBoatName = (level) => {
    const names = { 1: 'Raft', 2: 'Dinghy', 3: 'Speedboat', 4: 'Yacht' }
    return names[level] || 'Boat'
  }

  const formatResult = (result) => {
  let tokenSymbol = 'BOAT'
  if (result.gameToken === 'JOINT') tokenSymbol = 'JOINT'
  if (result.gameToken === 'LSD') tokenSymbol = 'LSD'
  if (result.gameToken === 'LIZARD') tokenSymbol = 'LIZARD'
    
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
    </>
  )
}
