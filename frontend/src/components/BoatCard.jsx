import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { contracts } from '../config/contracts'

const BOAT_EMOJIS = {
  0: '🪜', // Raft
  1: '🛶', // Dinghy  
  2: '🚤', // Speedboat
  3: '🛥️'  // Yacht
}

const BOAT_NAMES = {
  0: 'Raft',
  1: 'Dinghy',
  2: 'Speedboat', 
  3: 'Yacht'
}

export default function BoatCard({ tokenId, level, onRefresh }) {
  const { address } = useAccount()
  const [isRunning, setIsRunning] = useState(false)
  const [stakeAmount, setStakeAmount] = useState('10000')

  // Contract write hook
  const { writeContract, isPending, error } = useWriteContract()

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
    args: [boatLevel || level || 0],
    query: { enabled: (boatLevel || level || 0) < 4 }
  })

  // Read user's BOAT balance from the actual BOAT token contract
  const { data: boatBalance } = useReadContract({
    address: boatTokenAddress,
    abi: ['function balanceOf(address) view returns (uint256)'],
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!boatTokenAddress }
  })

  const currentLevel = boatLevel || level || 0
  const isMaxLevel = currentLevel >= 3

  const handleRun = async () => {
    if (parseFloat(stakeAmount) <= 0) return
    setIsRunning(true)
    
    try {
      await writeContract({
        ...contracts.boatGame,
        functionName: 'run',
        args: [tokenId, parseEther(stakeAmount)]
      })
      onRefresh?.()
    } catch (err) {
      console.error('Run failed:', err)
    } finally {
      setIsRunning(false)
    }
  }

  const handleUpgrade = async () => {
    if (isMaxLevel || !upgradeCost || !boatBalance || boatBalance < upgradeCost) return
    
    try {
      await writeContract({
        ...contracts.boatGame,
        functionName: 'upgrade',
        args: [tokenId]
      })
      onRefresh?.()
    } catch (err) {
      console.error('Upgrade failed:', err)
    }
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
          <p className="text-white opacity-80">Level {currentLevel + 1}</p>
        </div>

        {/* Upgrade Section */}
        {!isMaxLevel && (
          <div className="w-full text-center space-y-2">
            <div className="text-white opacity-80 text-sm">
              Upgrade Cost: {upgradeCost ? formatEther(upgradeCost) : '...'} BOAT
            </div>
            <button
              onClick={handleUpgrade}
              disabled={isPending || isMaxLevel || (boatBalance && upgradeCost && boatBalance < upgradeCost)}
              className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
            >
              {isPending ? 'Upgrading...' : `Upgrade to ${BOAT_NAMES[currentLevel + 1]}`}
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
            disabled={isPending || isRunning || parseFloat(stakeAmount) <= 0}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
          >
            {isRunning || isPending ? 'Running...' : 'Start Smuggling Run'}
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
