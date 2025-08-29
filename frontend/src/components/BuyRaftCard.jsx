import { useState } from 'react'
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { contracts } from '../config/contracts'

export default function BuyRaftCard() {
  const { address, isConnected } = useAccount()
  const [isBuying, setIsBuying] = useState(false)

  // Read the raft price
  const { data: raftPrice } = useContractRead({
    ...contracts.boatGame,
    functionName: 'RAFT_PRICE',
  })

  // Read user's BOAT balance  
  const { data: boatBalance } = useContractRead({
    ...contracts.boatGame,
    functionName: 'balanceOf',
    args: [address],
    enabled: isConnected,
    watch: true
  })

  // Prepare buy raft transaction
  const { config: buyRaftConfig } = usePrepareContractWrite({
    ...contracts.boatGame,
    functionName: 'buyRaft',
    enabled: isConnected && raftPrice && boatBalance >= raftPrice
  })

  const { write: buyRaft, isLoading: isBuyingRaft } = useContractWrite({
    ...buyRaftConfig,
    onSuccess: () => {
      setIsBuying(false)
    },
    onError: () => {
      setIsBuying(false)
    }
  })

  const handleBuyRaft = () => {
    if (!buyRaft) return
    setIsBuying(true)
    buyRaft()
  }

  const hasEnoughBoat = boatBalance && raftPrice && boatBalance >= raftPrice
  const raftPriceFormatted = raftPrice ? formatEther(raftPrice) : '1000'

  if (!isConnected) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 bg-opacity-90 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* Left Side - Boat Display */}
        <div className="flex items-center space-x-4">
          <div className="text-6xl">🪜</div>
          <div>
            <h3 className="text-2xl font-bold text-white">Buy Your First Raft</h3>
            <p className="text-white opacity-90">
              Start your smuggling empire with a basic raft
            </p>
            <p className="text-white opacity-80 text-sm">
              Price: {raftPriceFormatted} BOAT tokens
            </p>
          </div>
        </div>

        {/* Middle - Features */}
        <div className="text-center text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-lg">🎯</div>
              <div className="font-semibold">50% Success</div>
              <div className="opacity-80">Starting odds</div>
            </div>
            <div>
              <div className="text-lg">💰</div>
              <div className="font-semibold">Low Risk</div>
              <div className="opacity-80">Learn the game</div>
            </div>
            <div>
              <div className="text-lg">⬆️</div>
              <div className="font-semibold">Upgradeable</div>
              <div className="opacity-80">Improve later</div>
            </div>
          </div>
        </div>

        {/* Right Side - Buy Button */}
        <div className="text-center space-y-2">
          <div className="text-white text-sm">
            Your BOAT: {boatBalance ? parseFloat(formatEther(boatBalance)).toFixed(2) : '0.00'}
          </div>
          <button
            onClick={handleBuyRaft}
            disabled={!buyRaft || isBuying || isBuyingRaft || !hasEnoughBoat}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-bold text-lg transition-colors shadow-lg"
          >
            {isBuying || isBuyingRaft ? 'Buying...' : hasEnoughBoat ? 'Buy Raft' : 'Need More BOAT'}
          </button>
          
          {!hasEnoughBoat && (
            <div className="text-white text-xs opacity-80">
              You need {raftPriceFormatted} BOAT tokens to buy a raft
            </div>
          )}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-4 pt-4 border-t border-white border-opacity-20 text-center text-white text-sm opacity-90">
        💡 <strong>New to the game?</strong> You'll earn BOAT tokens from successful smuggling runs. 
        Each run has a chance to succeed (earn 2x your stake + BOAT) or fail (lose your stake).
      </div>
    </div>
  )
}
