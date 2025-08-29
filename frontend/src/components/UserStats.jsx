import { useAccount, useContractRead } from 'wagmi'
import { formatEther } from 'viem'
import { contracts } from '../config/contracts'

export default function UserStats() {
  const { address, isConnected } = useAccount()

  // Read user's BOAT token balance
  const { data: boatBalance } = useContractRead({
    ...contracts.boatGame,
    functionName: 'balanceOf',
    args: [address],
    enabled: isConnected,
    watch: true
  })

  // Read user's boat count
  const { data: boatCount } = useContractRead({
    ...contracts.boatNFT,
    functionName: 'balanceOf',
    args: [address],
    enabled: isConnected,
    watch: true
  })

  // Read user's ETH balance (we'll use this to show available funds)
  // Note: This would typically use useBalance from wagmi, but we'll simulate for now
  const { data: ethBalance } = useContractRead({
    address: address,
    abi: [{
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }]
    }],
    functionName: 'balanceOf',
    args: [address],
    enabled: false // Disabled for now, would need proper ETH balance query
  })

  if (!isConnected) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          👤 Your Stats
        </h2>
        <div className="text-center text-white opacity-80">
          Connect your wallet to view your statistics
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'BOAT Tokens',
      value: boatBalance ? parseFloat(formatEther(boatBalance)).toFixed(2) : '0.00',
      suffix: 'BOAT',
      icon: '🪙'
    },
    {
      label: 'Your Boats',
      value: boatCount ? boatCount.toString() : '0',
      suffix: 'boats',
      icon: '🚤'
    },
    {
      label: 'Total Runs',
      value: '0', // This would need to be tracked in the contract
      suffix: 'runs',
      icon: '🏃'
    },
    {
      label: 'Success Rate',
      value: '0', // This would need to be calculated from run history
      suffix: '%',
      icon: '📈'
    }
  ]

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        👤 Your Stats
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-lg font-bold text-white">
              {stat.value} <span className="text-sm font-normal">{stat.suffix}</span>
            </div>
            <div className="text-sm text-white opacity-80">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white border-opacity-20">
        <div className="text-center text-white opacity-80 text-sm">
          🎯 Buy your first boat to start earning BOAT tokens!
        </div>
      </div>
    </div>
  )
}
