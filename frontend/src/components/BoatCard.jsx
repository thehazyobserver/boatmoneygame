import { useState } from 'react'
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
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
  const [stakeAmount, setStakeAmount] = useState('0.01')

  // Read boat data
  const { data: boatLevel } = useContractRead({
    ...contracts.boatNFT,
    functionName: 'levelOf',
    args: [tokenId],
    watch: true
  })

  // Read upgrade cost
  const { data: upgradeCost } = useContractRead({
    ...contracts.boatGame,
    functionName: 'getUpgradeCost',
    args: [tokenId],
    enabled: boatLevel < 3
  })

  // Read user's BOAT balance
  const { data: boatBalance } = useContractRead({
    ...contracts.boatGame,
    functionName: 'balanceOf',
    args: [address],
    watch: true
  })

  // Prepare upgrade transaction
  const { config: upgradeConfig } = usePrepareContractWrite({
    ...contracts.boatGame,
    functionName: 'upgrade',
    args: [tokenId],
    enabled: boatLevel < 3 && upgradeCost && boatBalance >= upgradeCost
  })

  const { write: upgrade, isLoading: isUpgrading } = useContractWrite({
    ...upgradeConfig,
    onSuccess: () => {
      onRefresh?.()
    }
  })

  // Prepare run transaction
  const { config: runConfig } = usePrepareContractWrite({
    ...contracts.boatGame,
    functionName: 'run',
    args: [tokenId],
    value: parseEther(stakeAmount),
    enabled: parseFloat(stakeAmount) > 0
  })

  const { write: runSmugglingRun, isLoading: isRunningTransaction } = useContractWrite({
    ...runConfig,
    onSuccess: () => {
      setIsRunning(false)
      onRefresh?.()
    },
    onError: () => {
      setIsRunning(false)
    }
  })

  const currentLevel = boatLevel || level || 0
  const isMaxLevel = currentLevel >= 3

  const handleRun = () => {
    if (parseFloat(stakeAmount) <= 0) return
    setIsRunning(true)
    runSmugglingRun?.()
  }

  const handleUpgrade = () => {
    if (isMaxLevel || !upgrade) return
    upgrade()
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
              disabled={!upgrade || isUpgrading || (boatBalance && upgradeCost && boatBalance < upgradeCost)}
              className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
            >
              {isUpgrading ? 'Upgrading...' : `Upgrade to ${BOAT_NAMES[currentLevel + 1]}`}
            </button>
          </div>
        )}

        {/* Run Section */}
        <div className="w-full space-y-3">
          <div className="text-center">
            <label className="text-white text-sm opacity-80 block mb-2">
              Stake Amount (ETH)
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="0.01"
            />
          </div>
          
          <button
            onClick={handleRun}
            disabled={!runSmugglingRun || isRunning || isRunningTransaction || parseFloat(stakeAmount) <= 0}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
          >
            {isRunning || isRunningTransaction ? 'Running...' : 'Start Smuggling Run'}
          </button>
        </div>

        {/* Success Rate Display */}
        <div className="text-center text-white opacity-80 text-sm">
          Success Rate: {currentLevel === 0 ? '50%' : currentLevel === 1 ? '65%' : currentLevel === 2 ? '80%' : '90%'}
        </div>
      </div>
    </div>
  )
}
