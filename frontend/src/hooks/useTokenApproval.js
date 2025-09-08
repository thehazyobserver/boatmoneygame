import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { parseEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI, BOAT_GAME_ABI, JOINT_BOAT_GAME_ABI, GAME_CONFIGS } from '../config/contracts'

export function useTokenApproval(selectedToken = 'BOAT') {
  const { address } = useAccount()
  const [isApproving, setIsApproving] = useState(false)
  const queryClient = useQueryClient()
  
  const { writeContract: writeApproval, isPending: isApprovePending } = useWriteContract()

  // Get game config
  const gameConfig = GAME_CONFIGS[selectedToken]
  
  // Get contract configuration based on selected token
  const getGameContract = () => {
    return selectedToken === 'JOINT' ? contracts.jointBoatGame : contracts.boatGame
  }

  // Get the actual token address from the game contract
  const { data: actualTokenAddress } = useReadContract({
    address: getGameContract().address,
    abi: selectedToken === 'JOINT' ? JOINT_BOAT_GAME_ABI : BOAT_GAME_ABI,
    functionName: selectedToken === 'JOINT' ? 'JOINT' : 'BOAT',
    query: { enabled: true }
  })

  // Use the actual token address if available, fallback to config
  const tokenAddress = actualTokenAddress || gameConfig.tokenAddress

  // Check current allowance with more frequent refetch
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'allowance',
    args: [address, getGameContract().address],
    query: { 
      enabled: !!address && !!tokenAddress,
      refetchInterval: 3000, // Refetch every 3 seconds to catch changes
      staleTime: 1000 // Consider data stale after 1 second
    }
  })

  // Check if we have enough allowance for a specific amount
  const hasAllowance = (requiredAmount) => {
    if (!allowance || !requiredAmount) return false
    return allowance >= requiredAmount
  }

  // Approve tokens
  const approveTokens = async (amount) => {
    if (!tokenAddress) {
      throw new Error(`${selectedToken} token address not found`)
    }
    
    setIsApproving(true)
    try {
      const result = await writeApproval({
        address: tokenAddress,
        abi: BOAT_TOKEN_ABI,
        functionName: 'approve',
        args: [getGameContract().address, amount]
      })
      
      // Force immediate refresh of all relevant queries
      setTimeout(() => {
        // Invalidate allowance queries
        queryClient.invalidateQueries({ queryKey: ['allowance'] })
        queryClient.invalidateQueries({ queryKey: ['readContract'] })
        // Refetch this specific allowance
        refetchAllowance()
        console.log(`✅ ${selectedToken} approval completed! Refreshing UI...`)
      }, 1000) // Shorter delay for better UX
      
      return result
    } catch (err) {
      console.error('Approval failed:', err)
      throw err
    } finally {
      setIsApproving(false)
    }
  }

  // Approve a large amount for convenience (1M tokens)
  const approveMax = () => approveTokens(parseEther('1000000'))

  return {
    allowance,
    hasAllowance,
    approveTokens,
    approveMax,
    isApproving: isApproving || isApprovePending,
    tokenAddress: tokenAddress
  }
}
