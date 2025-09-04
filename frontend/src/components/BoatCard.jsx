import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI, GAME_CONFIGS } from '../config/contracts'
import { useTokenApproval } from '../hooks/useTokenApproval'
import { useCooldownTimer } from '../hooks/useCooldownTimer'

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

export default function BoatCard({ tokenId, level, selectedToken, onRefresh }) {
  const { address } = useAccount()
  const [isRunning, setIsRunning] = useState(false)
  
  const gameConfig = GAME_CONFIGS[selectedToken]
  const [stakeAmount, setStakeAmount] = useState(gameConfig.minStake)
  const [lastTxHash, setLastTxHash] = useState(null)

  const getGameContract = () => {
    return selectedToken === 'JOINT' ? contracts.jointBoatGame : contracts.boatGame
  }

  const { hasAllowance, approveMax, isApproving } = useTokenApproval(selectedToken)
  const { timeLeft, isOnCooldown, formattedTime, cooldownDuration } = useCooldownTimer(selectedToken, BigInt(tokenId))

  const { writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  })

  const { data: boatLevel } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'levelOf',
    args: [BigInt(tokenId)]
  })

  const { data: upgradeCost } = useReadContract({
    ...getGameContract(),
    functionName: 'upgradeCost',
    args: [boatLevel || level || 1],
    query: { enabled: (boatLevel || level || 1) < 4 }
  })

  const { data: tokenBalance } = useReadContract({
    address: gameConfig.tokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address }
  })

  const currentLevel = boatLevel || level || 1
  const isMaxLevel = currentLevel >= 4
  
  const stakeAmountWei = parseEther(stakeAmount || '0')
  const needsRunApproval = stakeAmountWei > 0 && !hasAllowance(stakeAmountWei)
  const needsUpgradeApproval = upgradeCost && !hasAllowance(upgradeCost)
  
  const getRunButtonText = () => {
    if (isOnCooldown) return 'Cooldown: ' + formattedTime
    if (isConfirming) return 'Processing...'
    if (isRunning || isPending) return 'Running...'
    if (isApproving) return 'Approving...'
    if (needsRunApproval) return 'Approve ' + gameConfig.symbol
    return 'Start Smuggling Run'
  }
  
  const getUpgradeButtonText = () => {
    if (isConfirming) return 'Processing...'
    if (isPending) return 'Upgrading...'
    if (isApproving) return 'Approving...'
    if (needsUpgradeApproval) return 'Approve ' + gameConfig.symbol
    return 'Upgrade (' + (upgradeCost ? formatEther(upgradeCost) : '0') + ' ' + gameConfig.symbol + ')'
  }

  const handleRun = async () => {
    if (parseFloat(stakeAmount) <= 0) return
    
    const stakeAmountWei = parseEther(stakeAmount)
    
    if (!hasAllowance(stakeAmountWei)) {
      try {
        await approveMax()
        return
      } catch (err) {
        console.error('Approval failed:', err)
        return
      }
    }
    
    setIsRunning(true)
    try {
      const hash = await writeContract({
        ...getGameContract(),
        functionName: 'run',
        args: [BigInt(tokenId), stakeAmountWei]
      })
      setLastTxHash(hash)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Run failed:', err)
      setIsRunning(false)
    }
  }

  const handleUpgrade = async () => {
    if (isMaxLevel || !upgradeCost || !tokenBalance || tokenBalance < upgradeCost) return
    
    if (!hasAllowance(upgradeCost)) {
      try {
        await approveMax()
        return
      } catch (err) {
        console.error('Approval failed:', err)
        return
      }
    }
    
    try {
      await writeContract({
        ...getGameContract(),
        functionName: 'upgradeBoat',
        args: [BigInt(tokenId)]
      })
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Upgrade failed:', err)
    }
  }

  if (isConfirmed && isRunning) {
    setIsRunning(false)
    setLastTxHash(null)
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-6xl">{BOAT_EMOJIS[currentLevel]}</div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">
            {BOAT_NAMES[currentLevel]} #{tokenId}
          </h3>
          <p className="text-white opacity-80">Level {currentLevel}</p>
        </div>

        {isOnCooldown && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-white opacity-80 mb-1">
              <span>Cooldown</span>
              <span>{formattedTime}</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-orange-400 h-2 rounded-full transition-all duration-1000"
                style={{ 
                  width: Math.max(0, 100 - (timeLeft / cooldownDuration) * 100) + '%'
                }}
              ></div>
            </div>
          </div>
        )}

        {!isMaxLevel && (
          <div className="w-full text-center space-y-2">
            <div className="text-white opacity-80 text-sm">
              Upgrade Cost: {upgradeCost ? formatEther(upgradeCost) : '...'} {gameConfig.symbol}
            </div>
            <button
              onClick={handleUpgrade}
              disabled={isPending || isApproving || isConfirming || isMaxLevel || (tokenBalance && upgradeCost && tokenBalance < upgradeCost && !needsUpgradeApproval)}
              className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
            >
              {getUpgradeButtonText()}
            </button>
          </div>
        )}

        <div className="w-full space-y-3">
          <div className="text-center">
            <label className="text-white text-sm opacity-80 block mb-2">
              Stake Amount ({gameConfig.symbol})
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              step="1000"
              min={gameConfig.minStake}
              max={gameConfig.maxStake}
              className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={gameConfig.minStake}
            />
          </div>
          
          <button
            onClick={handleRun}
            disabled={isPending || isRunning || isApproving || isConfirming || parseFloat(stakeAmount) <= 0 || isOnCooldown}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
          >
            {getRunButtonText()}
          </button>
          
          <div className="text-center text-white opacity-60 text-xs mt-1">
            {isOnCooldown ? (
              <span className="text-orange-300">Cooldown: {formattedTime} remaining</span>
            ) : (
              <span>10-minute cooldown | Stake: {parseInt(gameConfig.minStake).toLocaleString()}-{parseInt(gameConfig.maxStake).toLocaleString()} {gameConfig.symbol}</span>
            )}
          </div>
        </div>

        <div className="text-center text-white opacity-80 text-sm">
          Success Rate: {currentLevel === 1 ? '55%' : currentLevel === 2 ? '65%' : currentLevel === 3 ? '75%' : '85%'}
        </div>
      </div>
    </div>
  )
}