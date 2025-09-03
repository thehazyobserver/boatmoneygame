import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI } from '../config/contracts'

export default function PoolStats() {
  // Read the BOAT token address from the game contract
  const { data: boatTokenAddress } = useReadContract({
    ...contracts.boatGame,
    functionName: 'BOAT'
  })

  // Read total supply of BOAT tokens from the actual BOAT token contract
  const { data: totalSupply } = useReadContract({
    address: boatTokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'totalSupply',
    query: { enabled: !!boatTokenAddress }
  })

  // Read prize pool balance from game contract
  const { data: prizePool } = useReadContract({
    ...contracts.boatGame,
    functionName: 'poolBalance'
  })

  // Read total boats minted
  const { data: totalBoats } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'totalSupply'
  })

  // Read buy raft cost
  const { data: buyRaftCost } = useReadContract({
    ...contracts.boatGame,
    functionName: 'buyRaftCost'
  })

  const stats = [
    {
      label: 'Total BOAT Supply',
      value: totalSupply ? parseInt(formatEther(totalSupply)).toLocaleString() : '0',
      suffix: 'BOAT',
      icon: '🪙'
    },
    {
      label: 'Prize Pool',
      value: prizePool ? parseInt(formatEther(prizePool)).toLocaleString() : '0',
      suffix: 'BOAT', 
      icon: '💰'
    },
    {
      label: 'Total Boats',
      value: totalBoats ? totalBoats.toString() : '0',
      suffix: 'boats',
      icon: '🚤'
    },
    {
      label: 'Raft Cost',
      value: buyRaftCost ? parseInt(formatEther(buyRaftCost)).toLocaleString() : '100,000',
      suffix: 'BOAT',
      icon: '🪜'
    }
  ]

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        🌊 Pool Statistics
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
          💡 The prize pool grows with every failed smuggling run!
        </div>
      </div>
    </div>
  )
}
