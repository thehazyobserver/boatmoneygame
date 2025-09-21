import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { parseEther, formatEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI } from '../config/contracts'
import { GAME_CONFIGS } from '../config/contracts'
import { formatTokenAmount } from '../utils/formatters'

export default function TokenApproval() {

  const { address } = useAccount()
  const [selectedToken, setSelectedToken] = useState('BOAT')
  const [approvalAmount, setApprovalAmount] = useState('1000000') // 1M default
  const queryClient = useQueryClient()
  const { writeContract, isPending, error } = useWriteContract()

  // Token config
  const tokenConfig = GAME_CONFIGS[selectedToken]
  const gameContract = contracts[selectedToken.toLowerCase() + 'Game']
  const tokenContract = contracts[selectedToken.toLowerCase() + 'Token']

  // Get token address from contract (if available)
  const { data: actualTokenAddress } = useReadContract({
    ...gameContract,
    functionName: selectedToken,
    query: { enabled: true }
  })
  const tokenAddress = actualTokenAddress || tokenConfig.tokenAddress

  // Check current allowance
  const { data: allowance } = useReadContract({
    address: tokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'allowance',
    args: [address, gameContract.address],
    query: { enabled: !!address && !!tokenAddress }
  })

  // Check token balance
  const { data: tokenBalance } = useReadContract({
    address: tokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address && !!tokenAddress }
  })

  const handleApprove = async () => {
    if (!tokenAddress) return
    try {
      await writeContract({
        address: tokenAddress,
        abi: BOAT_TOKEN_ABI,
        functionName: 'approve',
        args: [gameContract.address, parseEther(approvalAmount)],
        gas: 100000n
      })
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['allowance'] })
      }, 1000)
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

  const needsApproval = !allowance || allowance < parseEther(tokenConfig.minStake)

  return (
    <div className={`backdrop-blur-sm rounded-xl p-4 border border-opacity-50 mb-4 ${
      needsApproval ? 'bg-yellow-500 bg-opacity-20 border-yellow-500' : 'bg-green-500 bg-opacity-20 border-green-500'
    }`}>
      <h3 className={`font-bold mb-4 ${needsApproval ? 'text-yellow-200' : 'text-green-200'}`}>
        🔑 {tokenConfig.symbol} Token Approval
      </h3>
      <div className="mb-2">
        <label className="block text-cyan-400 text-xs font-bold mb-1">Select Token</label>
        <select
          value={selectedToken}
          onChange={e => {
            setSelectedToken(e.target.value)
            setApprovalAmount('1000000')
          }}
          className="w-full px-2 py-1 border border-cyan-400 rounded bg-black text-cyan-400 font-bold"
        >
          <option value="BOAT">🚤 $BOAT</option>
          <option value="JOINT">🌿 $JOINT</option>
          <option value="LSD">😊 $LSD</option>
          <option value="LIZARD">🦎 $LIZARD</option>
        </select>
      </div>
      <div className={`space-y-2 text-sm mb-4 ${needsApproval ? 'text-yellow-200' : 'text-green-200'}`}>
        <div><strong>Your {tokenConfig.symbol} Balance:</strong> {tokenBalance ? formatTokenAmount(tokenBalance) : '0'}</div>
        <div><strong>Current Allowance:</strong> {allowance ? formatTokenAmount(allowance) : '0'}</div>
        <div><strong>Game Contract:</strong> {gameContract.address}</div>
      </div>
      {needsApproval ? (
        <div className="space-y-3">
          <p className="text-yellow-200 text-sm">
            ⚠️ You need to approve the game contract to spend your {tokenConfig.symbol} tokens before you can play.
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
              {isPending ? 'Approving...' : `Approve ${tokenConfig.symbol}`}
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
          ✅ Game contract is approved to spend your {tokenConfig.symbol} tokens! You can now play the game.
        </div>
      )}
    </div>
  )
}
