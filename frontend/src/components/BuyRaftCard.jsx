import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { parseEther, formatEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI } from '../config/contracts'
import { useTokenApproval } from '../hooks/useTokenApproval'
import { formatTokenAmount, formatInteger } from '../utils/formatters'

function BuyRaftCard() {
  const { address, isConnected } = useAccount()
  const [isBuying, setIsBuying] = useState(false)
  const [lastTxHash, setLastTxHash] = useState(null)
  const queryClient = useQueryClient()

  // Token approval hook - explicitly for BOAT tokens only
  const { hasAllowance, approveMax, isApproving } = useTokenApproval('BOAT')

  // Contract write hook
  const { writeContract, isPending } = useWriteContract()
  
  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  })

  // Read the BOAT token address from the game contract
  const { data: boatTokenAddress } = useReadContract({
    ...contracts.boatGame,
    functionName: 'BOAT'
  })

  // Read the raft price
  const { data: raftPrice } = useReadContract({
    ...contracts.boatGame,
    functionName: 'buyRaftCost'
  })

  // Read user's BOAT balance from the actual BOAT token contract
  const { data: boatBalance } = useReadContract({
    address: boatTokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: isConnected && !!boatTokenAddress }
  })

  const handleBuyRaft = async () => {
    if (!isConnected) return
    
    // Check if we need approval first
    if (!hasAllowance(raftPrice)) {
      try {
        await approveMax()
        return
      } catch (error) {
        console.error('Approval failed:', error)
        return
      }
    }

    try {
      setIsBuying(true)
      const tx = await writeContract({
        ...contracts.boatGame,
        functionName: 'buyRaft'
      })
      setLastTxHash(tx)
      
      // Immediately refresh data for better UX
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['balanceOf'] })
        queryClient.invalidateQueries({ queryKey: ['tokenOfOwnerByIndex'] })
        queryClient.invalidateQueries({ queryKey: ['balance'] })
      }, 1000) // Small delay to allow blockchain to update
      
    } catch (error) {
      console.error('Buy raft failed:', error)
    } finally {
      setIsBuying(false)
    }
  }

  // Clear buying state when transaction is confirmed
  if (isConfirmed && isBuying) {
    setIsBuying(false)
    setLastTxHash(null)
  }

  const raftPriceFormatted = raftPrice ? formatInteger(formatEther(raftPrice)) : '...'
  const hasEnoughBoat = boatBalance && raftPrice && boatBalance >= raftPrice
  const needsApproval = raftPrice && !hasAllowance(raftPrice)

  // Button state logic
  const getButtonText = () => {
    if (isConfirming) return 'Processing...'
    if (isBuying || isPending) return 'Buying...'
    if (isApproving) return 'Approving...'
    if (needsApproval) return 'Approve BOAT'
    if (!hasEnoughBoat) return 'Need More BOAT'
    return 'Buy Raft'
  }

  const isButtonDisabled = !isConnected || isPending || isBuying || isApproving || isConfirming || (!hasEnoughBoat && !needsApproval)

  if (!isConnected) {
    return null
  }

  return (
    <div className="terminal-bg rounded-xl p-6 border-2 border-cyan-400 relative overflow-hidden">
      {/* 80s scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none"></div>
      
      <div className="flex flex-col items-center space-y-6 relative z-10">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="text-7xl neon-glow" style={{ filter: 'drop-shadow(0 0 10px currentColor)' }}>⛵</div>
          <div>
            <h3 className="text-2xl font-bold text-cyan-400 neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
              BUY YOUR FIRST RAFT
            </h3>
            <p className="text-pink-400 font-semibold" style={{ fontFamily: 'Rajdhani, monospace' }}>
              [ START YOUR CRIMINAL EMPIRE ]
            </p>
            <p className="text-yellow-400 text-lg font-bold mt-2" style={{ fontFamily: 'Orbitron, monospace' }}>
              COST: {raftPriceFormatted} $BOAT
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="terminal-bg border border-yellow-400 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, monospace' }}>55% SUCCESS</div>
            <div className="text-pink-400 text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>Starting odds</div>
          </div>
          <div className="terminal-bg border border-yellow-400 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">💰</div>
            <div className="font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, monospace' }}>LOW RISK</div>
            <div className="text-pink-400 text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>Learn the game</div>
          </div>
          <div className="terminal-bg border border-yellow-400 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">⬆️</div>
            <div className="font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, monospace' }}>UPGRADEABLE</div>
            <div className="text-pink-400 text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>Improve later</div>
          </div>
        </div>

        {/* Balance and Buy Section */}
        <div className="w-full text-center space-y-4">
          <div className="text-cyan-400 text-lg font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
            YOUR $BOAT: {boatBalance ? formatTokenAmount(boatBalance) : '0.00'}
          </div>
          
          <button
            onClick={handleBuyRaft}
            disabled={isButtonDisabled}
            className="w-full px-6 py-4 vice-button disabled:bg-gray-700 disabled:opacity-50 disabled:border-gray-600 text-white font-bold text-lg transition-all duration-300"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            {getButtonText()}
          </button>
          
          {needsApproval && hasEnoughBoat && (
            <div className="text-yellow-400 text-sm font-semibold" style={{ fontFamily: 'Rajdhani, monospace' }}>
              FIRST APPROVE $BOAT SPENDING, THEN BUY RAFT
            </div>
          )}
          
          {!hasEnoughBoat && !needsApproval && (
            <div className="text-pink-400 text-sm font-semibold" style={{ fontFamily: 'Rajdhani, monospace' }}>
              NEED {raftPriceFormatted} $BOAT TOKENS TO BUY RAFT
            </div>
          )}
        </div>

        {/* Bottom Info */}
        <div className="w-full pt-4 border-t border-cyan-400 text-center text-yellow-400 text-sm font-semibold" style={{ fontFamily: 'Rajdhani, monospace' }}>
          💡 <span className="text-cyan-400 font-bold">NEW TO THE GAME?</span> You'll get $BOAT from successful runs. 
          <br/>SUCCESS = win 1.5x your play amount. FAILURE = lose your play and raft gets BURNED!
        </div>
      </div>
    </div>
  )
}

export default BuyRaftCard
