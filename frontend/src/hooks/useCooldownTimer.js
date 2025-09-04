import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { contracts } from '../config/contracts'

export function useCooldownTimer(selectedToken, tokenId) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isOnCooldown, setIsOnCooldown] = useState(false)

  // Get contract configuration based on selected token
  const getGameContract = () => {
    return selectedToken === 'JOINT' ? contracts.jointBoatGame : contracts.boatGame
  }

  // Read the cooldown duration from contract
  const { data: cooldownDuration } = useReadContract({
    ...getGameContract(),
    functionName: 'runCooldown'
  })

  // Read when this boat last ran
  const { data: lastRunAt } = useReadContract({
    ...getGameContract(),
    functionName: 'lastRunAt',
    args: [tokenId],
    query: { enabled: !!tokenId }
  })

  useEffect(() => {
    if (!lastRunAt || !cooldownDuration) return

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000) // Current time in seconds
      const lastRun = Number(lastRunAt)
      const cooldown = Number(cooldownDuration)
      
      if (lastRun === 0) {
        // Never ran before
        setTimeLeft(0)
        setIsOnCooldown(false)
        return
      }

      const timeSinceRun = now - lastRun
      const remaining = cooldown - timeSinceRun

      if (remaining <= 0) {
        setTimeLeft(0)
        setIsOnCooldown(false)
      } else {
        setTimeLeft(remaining)
        setIsOnCooldown(true)
      }
    }

    // Update immediately
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [lastRunAt, cooldownDuration])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return {
    timeLeft,
    isOnCooldown,
    formattedTime: formatTime(timeLeft),
    cooldownDuration: Number(cooldownDuration || 0)
  }
}
