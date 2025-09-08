import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { parseEther, formatEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI } from '../config/contracts'
import { formatTokenAmount } from '../utils/formatters'

export default function TokenApproval() {
  const { address } = useAccount()
  const [approvalAmount, setApprovalAmount] = useState('1000000') // 1M BOAT default
  const queryClient = useQueryClient()
  
  const { writeContract, isPending, error } = useWriteContract()

  // Get BOAT token address
  const { data: boatTokenAddress } = useReadContract({
    ...contracts.boatGame,
    functionName: 'BOAT'
  })

  // Check current allowance
  const { data: allowance } = useReadContract({
    address: boatTokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'allowance',
    args: [address, contracts.boatGame.address],
    query: { enabled: !!address && !!boatTokenAddress }
  })

  // Check BOAT balance
  const { data: boatBalance } = useReadContract({
    address: boatTokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address && !!boatTokenAddress }
  })

  const handleApprove = async () => {
    if (!boatTokenAddress) return
    
    try {
      await writeContract({
        address: boatTokenAddress,
        abi: BOAT_TOKEN_ABI,
        functionName: 'approve',
        args: [contracts.boatGame.address, parseEther(approvalAmount)]
      })
      
      // Immediately refresh allowance data for better UX
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['allowance'] })
      }, 1000) // Small delay to allow blockchain to update
      
    } catch (err) {
      console.error('Approval failed:', err)
    }
  }

  if (!address) {
    return (
      <div className="bg-red-500 bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-red-500 border-opacity-50 mb-4">
        <h3 className="text-red-200 font-bold mb-2">🔑 Token Approval Required</h3>
        <p className="text-red-200">Connect your wallet first</p>
      </div>
    )
  }

  const needsApproval = !allowance || allowance < parseEther('100000') // Less than 100k BOAT approved

  return (
    <div className={`backdrop-blur-sm rounded-xl p-4 border border-opacity-50 mb-4 ${
      needsApproval ? 'bg-yellow-500 bg-opacity-20 border-yellow-500' : 'bg-green-500 bg-opacity-20 border-green-500'
    }`}>
      <h3 className={`font-bold mb-4 ${needsApproval ? 'text-yellow-200' : 'text-green-200'}`}>
        🔑 BOAT Token Approval
      </h3>
      
      <div className={`space-y-2 text-sm mb-4 ${needsApproval ? 'text-yellow-200' : 'text-green-200'}`}>
        <div><strong>Your BOAT Balance:</strong> {boatBalance ? formatTokenAmount(boatBalance) : '0'}</div>
        <div><strong>Current Allowance:</strong> {allowance ? formatTokenAmount(allowance) : '0'}</div>
        <div><strong>Game Contract:</strong> {contracts.boatGame.address}</div>
      </div>

      {needsApproval ? (
        <div className="space-y-3">
          <p className="text-yellow-200 text-sm">
            ⚠️ You need to approve the game contract to spend your BOAT tokens before you can buy rafts, upgrade boats, or run missions.
          </p>
          
          <div className="flex gap-2">
            <input
              type="number"
              value={approvalAmount}
              onChange={(e) => setApprovalAmount(e.target.value)}
              placeholder="Amount to approve"
              className="flex-1 px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60"
            />
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-500 text-white rounded-lg font-semibold"
            >
              {isPending ? 'Approving...' : 'Approve BOAT'}
            </button>
          </div>
          
          {error && (
            <div className="text-red-300 text-sm mt-2">
              Error: {error.message}
            </div>
          )}
        </div>
      ) : (
        <div className="text-green-200">
          ✅ Game contract is approved to spend your BOAT tokens! You can now play the game.
        </div>
      )}
    </div>
  )
}
