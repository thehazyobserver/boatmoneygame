import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI } from '../config/contracts'

export function useTokenApproval() {
  const { address } = useAccount()
  const [isApproving, setIsApproving] = useState(false)
  
  const { writeContract: writeApproval, isPending: isApprovePending } = useWriteContract()

  // Get BOAT token address
  const { data: boatTokenAddress } = useReadContract({
    ...contracts.boatGame,
    functionName: 'BOAT'
  })

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: boatTokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'allowance',
    args: [address, contracts.boatGame.address],
    query: { enabled: !!address && !!boatTokenAddress }
  })

  // Check if we have enough allowance for a specific amount
  const hasAllowance = (requiredAmount) => {
    if (!allowance || !requiredAmount) return false
    return allowance >= requiredAmount
  }

  // Approve tokens
  const approveTokens = async (amount) => {
    if (!boatTokenAddress) return false
    
    setIsApproving(true)
    try {
      const result = await writeApproval({
        address: boatTokenAddress,
        abi: BOAT_TOKEN_ABI,
        functionName: 'approve',
        args: [contracts.boatGame.address, amount]
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

  // Approve a large amount for convenience (1M BOAT)
  const approveMax = () => approveTokens(parseEther('1000000'))

  return {
    allowance,
    hasAllowance,
    approveTokens,
    approveMax,
    isApproving: isApproving || isApprovePending,
    boatTokenAddress
  }
}
