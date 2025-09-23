import { useState, useEffect } from 'react'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { contracts } from '../config/contracts'
import { formatTokenAmount } from '../utils/formatters'

export default function RecentActivity() {
  const { address } = useAccount()
  const [activities, setActivities] = useState([])

  // Storage key for activities
  const getStorageKey = () => `recentActivity_${address?.toLowerCase()}`

  // Load activities from localStorage on mount
  useEffect(() => {
    if (!address) {
      // Clear activities when wallet disconnected
      setActivities([])
      return
    }
    
    try {
      const stored = localStorage.getItem(getStorageKey())
      if (stored) {
        const parsedActivities = JSON.parse(stored).map(activity => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }))
        setActivities(parsedActivities)
      }
    } catch (error) {
      console.warn('Failed to load recent activity from localStorage:', error)
    }
  }, [address])

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (!address || activities.length === 0) return
    
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(activities))
    } catch (error) {
      console.warn('Failed to save recent activity to localStorage:', error)
    }
  }, [activities, address])

  // Get boat emoji and name
  const getBoatEmoji = (level) => {
    const emojis = { 1: '🛶', 2: '⛵', 3: '🚤', 4: '🛥️' }
    return emojis[level] || '🚤'
  }

  const getBoatName = (level) => {
    const names = { 1: 'Raft', 2: 'Dinghy', 3: 'Speedboat', 4: 'Yacht' }
    return names[level] || 'Boat'
  }

  // Helper to add activity and save to localStorage
  const addActivity = (type, data) => {
    const activity = {
      id: Date.now() + Math.random(),
      type,
      timestamp: new Date(),
      ...data
    }
    
    setActivities(prev => {
      const newActivities = [activity, ...prev.slice(0, 19)] // Keep last 20
      
      // Save to localStorage immediately
      if (address) {
        try {
          localStorage.setItem(getStorageKey(), JSON.stringify(newActivities))
        } catch (error) {
          console.warn('Failed to save activity to localStorage:', error)
        }
      }
      
      return newActivities
    })
  }

  // Watch for BOAT game RunResult events
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'RunResult',
    onLogs(logs) {
      logs.forEach((log) => {
    const { user, tokenId, level, stake, success, rewardPaid } = log.args || {}
        
        if (user?.toLowerCase() === address?.toLowerCase()) {
          addActivity('run', {
      tokenId: tokenId?.toString?.() || '0',
      level: level ? parseInt(level) : 0,
      stake: stake || 0n,
      success: Boolean(success),
      rewardPaid: rewardPaid || 0n,
            gameToken: 'BOAT'
          })
        }
      })
    }
  })

    // Watch for LIZARD game LIZARDRun events
    useWatchContractEvent({
      ...contracts.lizardGame,
      eventName: 'LIZARDRun',
      onLogs(logs) {
        logs.forEach((log) => {
          const { user, tokenId, level, stake, success, rewardPaid } = log.args || {}
          if (user?.toLowerCase() === address?.toLowerCase()) {
            addActivity('run', {
              tokenId: tokenId?.toString?.() || '0',
              level: level ? parseInt(level) : 0,
              stake: stake || 0n,
              success: Boolean(success),
              rewardPaid: rewardPaid || 0n,
              gameToken: 'LIZARD'
            })
          }
        })
      }
    })

  // Watch for LSD game LSDRun events
  useWatchContractEvent({
    ...contracts.lsdGame,
    eventName: 'LSDRun',
    onLogs(logs) {
      logs.forEach((log) => {
        const { user, tokenId, level, stake, success, rewardPaid } = log.args || {}
        if (user?.toLowerCase() === address?.toLowerCase()) {
          addActivity('run', {
            tokenId: tokenId?.toString?.() || '0',
            level: level ? parseInt(level) : 0,
            stake: stake || 0n,
            success: Boolean(success),
            rewardPaid: rewardPaid || 0n,
            gameToken: 'LSD'
          })
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
    const { user, tokenId, level, stake, success, rewardPaid } = log.args || {}
        
        if (user?.toLowerCase() === address?.toLowerCase()) {
          addActivity('run', {
      tokenId: tokenId?.toString?.() || '0',
      level: level ? parseInt(level) : 0,
      stake: stake || 0n,
      success: Boolean(success),
      rewardPaid: rewardPaid || 0n,
            gameToken: 'JOINT'
          })
        }
      })
    }
  })

  // Watch for boat burns (BOAT game)
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'BoatBurned',
    onLogs(logs) {
      logs.forEach((log) => {
        const { tokenId, level } = log.args || {}
        
        addActivity('burned', {
          tokenId: tokenId?.toString?.() || '0',
          level: level ? parseInt(level) : 0,
          gameToken: 'BOAT'
        })
      })
    }
  })

    // Watch for boat burns (LIZARD game)
    useWatchContractEvent({
      ...contracts.lizardGame,
      eventName: 'BoatBurned',
      onLogs(logs) {
        logs.forEach((log) => {
          const { tokenId, level } = log.args || {}
          addActivity('burned', {
            tokenId: tokenId?.toString?.() || '0',
            level: level ? parseInt(level) : 0,
            gameToken: 'LIZARD'
          })
        })
      }
    })

  // Watch for boat burns (LSD game)
  useWatchContractEvent({
    ...contracts.lsdGame,
    eventName: 'BoatBurned',
    onLogs(logs) {
      logs.forEach((log) => {
        const { tokenId, level } = log.args || {}
        addActivity('burned', {
          tokenId: tokenId?.toString?.() || '0',
          level: level ? parseInt(level) : 0,
          gameToken: 'LSD'
        })
      })
    }
  })

  // Watch for boat burns (JOINT game)
  useWatchContractEvent({
    ...contracts.jointBoatGame,
    eventName: 'BoatBurned',
    onLogs(logs) {
      logs.forEach((log) => {
        const { tokenId, level } = log.args || {}
        
        addActivity('burned', {
          tokenId: tokenId?.toString?.() || '0',
          level: level ? parseInt(level) : 0,
          gameToken: 'JOINT'
        })
      })
    }
  })

  // Watch for boat downgrades (BOAT game)
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'BoatDowngraded',
    onLogs(logs) {
      logs.forEach((log) => {
        const { tokenId, fromLevel, toLevel } = log.args || {}
        
        addActivity('downgraded', {
          tokenId: tokenId?.toString?.() || '0',
          fromLevel: fromLevel ? parseInt(fromLevel) : 0,
          toLevel: toLevel ? parseInt(toLevel) : 0,
          gameToken: 'BOAT'
        })
      })
    }
  })

    // Watch for boat downgrades (LIZARD game)
    useWatchContractEvent({
      ...contracts.lizardGame,
      eventName: 'BoatDowngraded',
      onLogs(logs) {
        logs.forEach((log) => {
          const { tokenId, fromLevel, toLevel } = log.args || {}
          addActivity('downgraded', {
            tokenId: tokenId?.toString?.() || '0',
            fromLevel: fromLevel ? parseInt(fromLevel) : 0,
            toLevel: toLevel ? parseInt(toLevel) : 0,
            gameToken: 'LIZARD'
          })
        })
      }
    })

  // Watch for boat downgrades (JOINT game)
  useWatchContractEvent({
    ...contracts.jointBoatGame,
    eventName: 'BoatDowngraded',
    onLogs(logs) {
      logs.forEach((log) => {
        const { tokenId, fromLevel, toLevel } = log.args || {}
        
        addActivity('downgraded', {
          tokenId: tokenId?.toString?.() || '0',
          fromLevel: fromLevel ? parseInt(fromLevel) : 0,
          toLevel: toLevel ? parseInt(toLevel) : 0,
          gameToken: 'JOINT'
        })
      })
    }
  })

  // Watch for boat downgrades (LSD game)
  useWatchContractEvent({
    ...contracts.lsdGame,
    eventName: 'BoatDowngraded',
    onLogs(logs) {
      logs.forEach((log) => {
        const { tokenId, fromLevel, toLevel } = log.args || {}
        addActivity('downgraded', {
          tokenId: tokenId?.toString?.() || '0',
          fromLevel: fromLevel ? parseInt(fromLevel) : 0,
          toLevel: toLevel ? parseInt(toLevel) : 0,
          gameToken: 'LSD'
        })
      })
    }
  })

  // Watch for bonus raft spawns (BOAT game only)
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'RaftSpawned',
    onLogs(logs) {
      logs.forEach((log) => {
    const { to, tokenId } = log.args || {}
        
        if (to?.toLowerCase() === address?.toLowerCase()) {
          addActivity('spawned', {
      tokenId: tokenId?.toString?.() || '0',
            level: 1, // Spawned rafts are always level 1
            gameToken: 'BOAT'
          })
        }
      })
    }
  })

  // Watch for raft purchases (BOAT game only)
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'RaftBought',
    onLogs(logs) {
      logs.forEach((log) => {
    const { user, tokenId, cost } = log.args || {}
        
        if (user?.toLowerCase() === address?.toLowerCase()) {
          addActivity('purchased', {
      tokenId: tokenId?.toString?.() || '0',
            level: 1, // Purchased rafts are always level 1
      cost: cost || 0n,
            gameToken: 'BOAT'
          })
        }
      })
    }
  })

  // Watch for boat upgrades (BOAT game only)
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'Upgraded',
    onLogs(logs) {
      logs.forEach((log) => {
    const { user, tokenId, fromLevel, toLevel, cost } = log.args || {}
        
        if (user?.toLowerCase() === address?.toLowerCase()) {
          addActivity('upgraded', {
      tokenId: tokenId?.toString?.() || '0',
      fromLevel: fromLevel ? parseInt(fromLevel) : 0,
      toLevel: toLevel ? parseInt(toLevel) : 0,
      cost: cost || 0n,
            gameToken: 'BOAT'
          })
        }
      })
    }
  })

  // Format activity message
  const formatActivity = (activity) => {
  let tokenSymbol = 'BOAT'
  if (activity.gameToken === 'JOINT') tokenSymbol = 'JOINT'
  if (activity.gameToken === 'LSD') tokenSymbol = 'LSD'
  if (activity.gameToken === 'LIZARD') tokenSymbol = 'LIZARD'
    const timeStr = activity.timestamp.toLocaleTimeString()
    
    switch (activity.type) {
      case 'run':
        if (activity.success) {
          return {
            icon: '🎉',
            color: 'text-green-400',
            bgColor: 'bg-green-400/10',
            title: `Successful Run`,
            description: `${getBoatEmoji(activity.level)} ${getBoatName(activity.level)} #${activity.tokenId} won ${formatTokenAmount(activity.rewardPaid, 0)} $${tokenSymbol}`,
            time: timeStr
          }
        } else {
          return {
            icon: '💥',
            color: 'text-red-400',
            bgColor: 'bg-red-400/10',
            title: `Run Failed`,
            description: `${getBoatEmoji(activity.level)} ${getBoatName(activity.level)} #${activity.tokenId} lost ${formatTokenAmount(activity.stake, 0)} $${tokenSymbol}`,
            time: timeStr
          }
        }
      
      case 'burned':
        return {
          icon: '🔥',
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          title: `Boat Burned`,
          description: `${getBoatEmoji(activity.level)} ${getBoatName(activity.level)} #${activity.tokenId} was destroyed (after failed run)`,
          time: timeStr
        }
      
      case 'downgraded':
        return {
          icon: '⬇️',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          title: `Boat Downgraded`,
          description: `${getBoatEmoji(activity.fromLevel)} ${getBoatName(activity.fromLevel)} #${activity.tokenId} → ${getBoatEmoji(activity.toLevel)} ${getBoatName(activity.toLevel)} (after failed run)`,
          time: timeStr
        }
      
      case 'spawned':
        return {
          icon: '🎁',
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/10',
          title: `Bonus Raft Spawned`,
          description: `🛶 Raft #${activity.tokenId} spawned from yacht bonus`,
          time: timeStr
        }
      
      case 'purchased':
        return {
          icon: '🛒',
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          title: `Raft Purchased`,
          description: `🛶 Raft #${activity.tokenId} bought for ${formatTokenAmount(activity.cost, 0)} $BOAT`,
          time: timeStr
        }
      
      case 'upgraded':
        return {
          icon: '⬆️',
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-400/10',
          title: `Boat Upgraded`,
          description: `${getBoatEmoji(activity.fromLevel)} ${getBoatName(activity.fromLevel)} #${activity.tokenId} → ${getBoatEmoji(activity.toLevel)} ${getBoatName(activity.toLevel)}`,
          time: timeStr
        }
      
      default:
        return {
          icon: '❓',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          title: 'Unknown Activity',
          description: `Something happened with boat #${activity.tokenId}`,
          time: timeStr
        }
    }
  }

  return (
    <div className="terminal-bg rounded-xl border-2 border-purple-400 mb-6 neon-glow">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">📋</div>
          <div>
            <h2 className="text-xl font-bold text-purple-400 neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
              RECENT ACTIVITY
            </h2>
            <p className="text-pink-400 text-sm font-semibold" style={{ fontFamily: 'Rajdhani, monospace' }}>
              {activities.length > 0 ? `${activities.length} events logged` : 'No activity yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="border-t-2 border-purple-400 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-400" style={{ fontFamily: 'Rajdhani, monospace' }}>
                No recent activity. Start playing to see your game results here!
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {activities.map((activity) => {
                const formatted = formatActivity(activity)
                return (
                  <div
                    key={activity.id}
                    className={`p-3 rounded-lg border border-opacity-30 ${formatted.bgColor} border-current`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{formatted.icon}</div>
                        <div className="flex-1">
                          <div className={`font-bold ${formatted.color}`} style={{ fontFamily: 'Orbitron, monospace' }}>
                            {formatted.title}
                          </div>
                          <div className="text-white text-sm mt-1" style={{ fontFamily: 'Rajdhani, monospace' }}>
                            {formatted.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400" style={{ fontFamily: 'Rajdhani, monospace' }}>
                        {formatted.time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
    </div>
  )
}
