import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI, GAME_CONFIGS } from '../config/contracts'

export function useTokenApproval(selectedToken = 'BOAT') {
  const { address } = useAccount()
  const [isApproving, setIsApproving] = useState(false)
  
  const { writeContract: writeApproval, isPending: isApprovePending } = useWriteContract()

  // Get game config
  const gameConfig = GAME_CONFIGS[selectedToken]
  
  // Get contract configuration based on selected token
  const getGameContract = () => {
    return selectedToken === 'JOINT' ? contracts.jointBoatGame : contracts.boatGame
  }

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: gameConfig.tokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'allowance',
    args: [address, getGameContract().address],
    query: { enabled: !!address }
  })

  // Check if we have enough allowance for a specific amount
  const hasAllowance = (requiredAmount) => {
    if (!allowance || !requiredAmount) return false
    return allowance >= requiredAmount
  }

  // Approve tokens
  const approveTokens = async (amount) => {
    setIsApproving(true)
    try {
      const result = await writeApproval({
        address: gameConfig.tokenAddress,
        abi: BOAT_TOKEN_ABI,
        functionName: 'approve',
        args: [getGameContract().address, amount]
      })
      
      // Wait a bit and refetch allowance
      setTimeout(() => {
        refetchAllowance()
      }, 2000)
      
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
    tokenAddress: gameConfig.tokenAddress
  }
}
