import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI } from '../config/contracts'
import { useTokenApproval } from '../hooks/useTokenApproval'

const BOAT_EMOJIS = {
  1: '🪜', // Raft (level 1)
  2: '🛶', // Dinghy (level 2)
  3: '🚤', // Speedboat (level 3)
  4: '🛥️'  // Yacht (level 4)
}

const BOAT_NAMES = {
  1: 'Raft',
  2: 'Dinghy',
  3: 'Speedboat', 
  4: 'Yacht'
}

export default function BoatCard({ tokenId, level, onRefresh }) {
  const { address } = useAccount()
  const [isRunning, setIsRunning] = useState(false)
  const [stakeAmount, setStakeAmount] = useState('10000')
  const [lastTxHash, setLastTxHash] = useState(null)

  // Token approval hook
  const { hasAllowance, approveMax, isApproving } = useTokenApproval()

  // Contract write hook
  const { writeContract, isPending, error } = useWriteContract()
  
  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  })

  // Read the BOAT token address from the game contract
  const { data: boatTokenAddress } = useReadContract({
    ...contracts.boatGame,
    functionName: 'BOAT'
  })

  // Read boat data
  const { data: boatLevel } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'levelOf',
    args: [tokenId]
  })

  // Read upgrade cost (costs are stored by fromLevel, so level 1 -> level 2 uses upgradeCost[1])
  const { data: upgradeCost } = useReadContract({
    ...contracts.boatGame,
    functionName: 'upgradeCost',
    args: [boatLevel || level || 1],
    query: { enabled: (boatLevel || level || 1) < 4 }
  })

  // Read user's BOAT balance from the actual BOAT token contract
  const { data: boatBalance } = useReadContract({
    address: boatTokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!boatTokenAddress }
  })

  const currentLevel = boatLevel || level || 1  // Default to level 1 (Raft)
  const isMaxLevel = currentLevel >= 4
  
  // Calculate button states
  const stakeAmountWei = parseEther(stakeAmount || '0')
  const needsRunApproval = stakeAmountWei > 0 && !hasAllowance(stakeAmountWei)
  const needsUpgradeApproval = upgradeCost && !hasAllowance(upgradeCost)
  
  // Button text functions
  const getRunButtonText = () => {
    if (isConfirming) return 'Processing...'
    if (isRunning || isPending) return 'Running...'
    if (isApproving) return 'Approving...'
    if (needsRunApproval) return 'Approve BOAT'
    return 'Start Smuggling Run'
  }
  
  const getUpgradeButtonText = () => {
    if (isConfirming) return 'Processing...'
    if (isPending) return 'Upgrading...'
    if (isApproving) return 'Approving...'
    if (needsUpgradeApproval) return 'Approve BOAT'
    return `Upgrade to ${BOAT_NAMES[currentLevel + 1]}`
  }

  const handleRun = async () => {
    if (parseFloat(stakeAmount) <= 0) return
    
    const stakeAmountWei = parseEther(stakeAmount)
    
    // Check if we need approval first
    if (!hasAllowance(stakeAmountWei)) {
      try {
        await approveMax()
        return // Let user click again after approval
      } catch (err) {
        console.error('Approval failed:', err)
        return
      }
    }
    
    setIsRunning(true)
    try {
      const hash = await writeContract({
        ...contracts.boatGame,
        functionName: 'run',
        args: [tokenId, stakeAmountWei]
      })
      setLastTxHash(hash)
      onRefresh?.()
    } catch (err) {
      console.error('Run failed:', err)
      setIsRunning(false)
    }
  }

  const handleUpgrade = async () => {
    if (isMaxLevel || !upgradeCost || !boatBalance || boatBalance < upgradeCost) return
    
    // Check if we need approval first
    if (!hasAllowance(upgradeCost)) {
      try {
        await approveMax()
        return // Let user click again after approval
      } catch (err) {
        console.error('Approval failed:', err)
        return
      }
    }
    
    try {
      const hash = await writeContract({
        ...contracts.boatGame,
        functionName: 'upgrade',
        args: [tokenId]
      })
      setLastTxHash(hash)
      onRefresh?.()
    } catch (err) {
      console.error('Upgrade failed:', err)
    }
  }

  // Reset running state when transaction is confirmed
  if (isConfirmed && isRunning) {
    setIsRunning(false)
    setLastTxHash(null)
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
      <div className="flex flex-col items-center space-y-4">
        {/* Boat Display */}
        <div className="text-6xl">{BOAT_EMOJIS[currentLevel]}</div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">
            {BOAT_NAMES[currentLevel]} #{tokenId}
          </h3>
          <p className="text-white opacity-80">Level {currentLevel}</p>
        </div>

        {/* Upgrade Section */}
        {!isMaxLevel && (
          <div className="w-full text-center space-y-2">
            <div className="text-white opacity-80 text-sm">
              Upgrade Cost: {upgradeCost ? formatEther(upgradeCost) : '...'} BOAT
            </div>
            <button
              onClick={handleUpgrade}
              disabled={isPending || isApproving || isConfirming || isMaxLevel || (boatBalance && upgradeCost && boatBalance < upgradeCost && !needsUpgradeApproval)}
              className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
            >
              {getUpgradeButtonText()}
            </button>
          </div>
        )}

        {/* Run Section */}
        <div className="w-full space-y-3">
          <div className="text-center">
            <label className="text-white text-sm opacity-80 block mb-2">
              Stake Amount (BOAT)
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              step="1000"
              min="10000"
              max="80000"
              className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="10000"
            />
          </div>
          
          <button
            onClick={handleRun}
            disabled={isPending || isRunning || isApproving || isConfirming || parseFloat(stakeAmount) <= 0}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
          >
            {getRunButtonText()}
          </button>
          <div className="text-center text-white opacity-60 text-xs mt-1">
            ⏱️ 10-minute cooldown | 📊 Stake: 10,000-80,000 BOAT
          </div>
        </div>

        {/* Success Rate Display */}
        <div className="text-center text-white opacity-80 text-sm">
          Success Rate: {currentLevel === 0 ? '55%' : currentLevel === 1 ? '65%' : currentLevel === 2 ? '75%' : '85%'}
        </div>
      </div>
    </div>
  )
}
