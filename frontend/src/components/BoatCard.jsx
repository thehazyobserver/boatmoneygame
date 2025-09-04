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
  const [cardSelectedToken, setCardSelectedToken] = useState(selectedToken) // Local token selection for this card
  
  const gameConfig = GAME_CONFIGS[cardSelectedToken]
  const [stakeAmount, setStakeAmount] = useState(gameConfig.minStake)
  const [lastTxHash, setLastTxHash] = useState(null)

  const getGameContract = () => {
    return cardSelectedToken === 'JOINT' ? contracts.jointBoatGame : contracts.boatGame
  }

  const { hasAllowance, approveMax, isApproving } = useTokenApproval(cardSelectedToken)
  // Separate approval hook for upgrades (always BOAT tokens)
  const { hasAllowance: hasUpgradeAllowance, approveMax: approveUpgrade, isApproving: isApprovingUpgrade } = useTokenApproval('BOAT')
  const { timeLeft, isOnCooldown, formattedTime, cooldownDuration } = useCooldownTimer(cardSelectedToken, BigInt(tokenId))

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
    ...contracts.boatGame, // Always use BOAT game contract for upgrades
    functionName: 'upgradeCost',
    args: [boatLevel || level || 1],
    query: { enabled: (boatLevel || level || 1) < 4 }
  })

  // Get BOAT token balance for upgrades
  const { data: boatTokenBalance } = useReadContract({
    address: GAME_CONFIGS.BOAT.tokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address }
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
  const needsUpgradeApproval = upgradeCost && !hasUpgradeAllowance(upgradeCost)
  
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
    if (isApprovingUpgrade) return 'Approving...'
    if (needsUpgradeApproval) return 'Approve $BOAT'
    return 'Upgrade (' + (upgradeCost ? formatEther(upgradeCost) : '0') + ' $BOAT)'
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
    if (isMaxLevel || !upgradeCost || !boatTokenBalance || boatTokenBalance < upgradeCost) return
    
    if (!hasUpgradeAllowance(upgradeCost)) {
      try {
        await approveUpgrade()
        return
      } catch (err) {
        console.error('Upgrade approval failed:', err)
        return
      }
    }
    
    try {
      await writeContract({
        ...contracts.boatGame, // Always use BOAT game contract for upgrades
        functionName: 'upgrade', // Note: might be 'upgrade' instead of 'upgradeBoat'
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

        {/* Token Selector Dropdown */}
        <div className="w-full">
          <label className="block text-white text-sm font-medium mb-2">Play Token</label>
          <select
            value={cardSelectedToken}
            onChange={(e) => {
              setCardSelectedToken(e.target.value)
              setStakeAmount(GAME_CONFIGS[e.target.value].minStake)
            }}
            className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="BOAT" className="bg-gray-800">🚤 $BOAT (10K-80K)</option>
            <option value="JOINT" className="bg-gray-800">🌿 $JOINT (20K-420K)</option>
          </select>
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
              Upgrade Cost: {upgradeCost ? formatEther(upgradeCost) : '...'} $BOAT
            </div>
            <button
              onClick={handleUpgrade}
              disabled={isPending || isApprovingUpgrade || isConfirming || isMaxLevel || (boatTokenBalance && upgradeCost && boatTokenBalance < upgradeCost && !needsUpgradeApproval)}
              className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
            >
              {getUpgradeButtonText()}
            </button>
          </div>
        )}

        <div className="w-full space-y-3">
          <div className="text-center">
            <label className="text-white text-sm opacity-80 block mb-2">
              Play Amount ({gameConfig.symbol})
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
              <span>10-minute cooldown | Play: {parseInt(gameConfig.minStake).toLocaleString()}-{parseInt(gameConfig.maxStake).toLocaleString()} {gameConfig.symbol}</span>
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