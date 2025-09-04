import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI } from '../config/contracts'
import { useTokenApproval } from '../hooks/useTokenApproval'

export default function BuyRaftCard() {
  const { address, isConnected } = useAccount()
  const [isBuying, setIsBuying] = useState(false)
  const [lastTxHash, setLastTxHash] = useState(null)

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
        return // Let user click again after approval
      } catch (err) {
        console.error('Approval failed:', err)
        return
      }
    }
    
    // Proceed with buying raft
    setIsBuying(true)
    try {
      const hash = await writeContract({
        ...contracts.boatGame,
        functionName: 'buyRaft'
      })
      setLastTxHash(hash)
    } catch (err) {
      console.error('Buy raft failed:', err)
      setIsBuying(false)
    }
  }

  // Reset buying state when transaction is confirmed
  if (isConfirmed && isBuying) {
    setIsBuying(false)
    setLastTxHash(null)
  }

  const hasEnoughBoat = boatBalance && raftPrice && boatBalance >= raftPrice
  const raftPriceFormatted = raftPrice ? formatEther(raftPrice) : '1000'
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
    <div className="terminal-bg rounded-xl p-6 border-2 border-cyan-400 neon-glow">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* Left Side - Boat Display */}
        <div className="flex items-center space-x-4">
          <div className="text-6xl float neon-glow" style={{ filter: 'drop-shadow(0 0 20px currentColor)' }}>🪜</div>
          <div>
            <h3 className="text-2xl font-bold text-cyan-400 neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
              BUY YOUR FIRST RAFT
            </h3>
            <p className="text-pink-400 font-semibold" style={{ fontFamily: 'Rajdhani, monospace' }}>
              [ START YOUR CRIMINAL EMPIRE ]
            </p>
            <p className="text-yellow-400 text-sm font-bold" style={{ fontFamily: 'Rajdhani, monospace' }}>
              COST: {raftPriceFormatted} $BOAT
            </p>
          </div>
        </div>

        {/* Middle - Features */}
        <div className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="terminal-bg border border-yellow-400 rounded-lg p-3">
              <div className="text-lg mb-1">🎯</div>
              <div className="font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, monospace' }}>55% SUCCESS</div>
              <div className="text-pink-400 text-xs" style={{ fontFamily: 'Rajdhani, monospace' }}>Starting odds</div>
            </div>
            <div className="terminal-bg border border-yellow-400 rounded-lg p-3">
              <div className="text-lg mb-1">💰</div>
              <div className="font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, monospace' }}>LOW RISK</div>
              <div className="text-pink-400 text-xs" style={{ fontFamily: 'Rajdhani, monospace' }}>Learn the game</div>
            </div>
            <div className="terminal-bg border border-yellow-400 rounded-lg p-3">
              <div className="text-lg mb-1">⬆️</div>
              <div className="font-bold text-cyan-400" style={{ fontFamily: 'Orbitron, monospace' }}>UPGRADEABLE</div>
              <div className="text-pink-400 text-xs" style={{ fontFamily: 'Rajdhani, monospace' }}>Improve later</div>
            </div>
          </div>
        </div>

        {/* Right Side - Buy Button */}
        <div className="text-center space-y-3">
          <div className="text-cyan-400 text-sm font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
            YOUR $BOAT: {boatBalance ? parseFloat(formatEther(boatBalance)).toFixed(2) : '0.00'}
          </div>
          <button
            onClick={handleBuyRaft}
            disabled={isButtonDisabled}
            className="px-8 py-4 vice-button disabled:bg-gray-700 disabled:opacity-50 disabled:border-gray-600 text-white font-bold text-lg transition-all duration-300"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            {getButtonText()}
          </button>
          
          {needsApproval && hasEnoughBoat && (
            <div className="text-yellow-400 text-xs font-semibold" style={{ fontFamily: 'Rajdhani, monospace' }}>
              FIRST APPROVE $BOAT SPENDING, THEN BUY RAFT
            </div>
          )}
          
          {!hasEnoughBoat && !needsApproval && (
            <div className="text-pink-400 text-xs font-semibold" style={{ fontFamily: 'Rajdhani, monospace' }}>
              NEED {raftPriceFormatted} $BOAT TOKENS TO BUY RAFT
            </div>
          )}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-6 pt-4 border-t border-cyan-400 text-center text-yellow-400 text-sm font-semibold" style={{ fontFamily: 'Rajdhani, monospace' }}>
        💡 <span className="text-cyan-400 font-bold">NEW TO THE GAME?</span> You'll get $BOAT from successful runs. 
        <br/>SUCCESS = win 1.5x your play amount. FAILURE = lose your play and raft gets BURNED!
      </div>
    </div>
  )
}
