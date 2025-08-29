import { useContractRead } from 'wagmi'
import { formatEther } from 'viem'
import { contracts } from '../config/contracts'

export default function PoolStats() {
  // Read total supply of BOAT tokens
  const { data: totalSupply } = useContractRead({
    ...contracts.boatGame,
    functionName: 'totalSupply',
    watch: true
  })

  // Read contract ETH balance
  const { data: contractBalance } = useContractRead({
    ...contracts.boatGame,
    functionName: 'getContractBalance',
    watch: true
  })

  // Read total boats minted
  const { data: totalBoats } = useContractRead({
    ...contracts.boatNFT,
    functionName: 'totalSupply',
    watch: true
  })

  // Read next token ID (for boats minted counter)
  const { data: nextTokenId } = useContractRead({
    ...contracts.boatNFT,
    functionName: 'nextTokenId',
    watch: true
  })

  const stats = [
    {
      label: 'Total BOAT Supply',
      value: totalSupply ? formatEther(totalSupply) : '0',
      suffix: 'BOAT',
      icon: '🪙'
    },
    {
      label: 'Prize Pool',
      value: contractBalance ? formatEther(contractBalance) : '0',
      suffix: 'ETH', 
      icon: '💰'
    },
    {
      label: 'Total Boats',
      value: totalBoats ? totalBoats.toString() : '0',
      suffix: 'boats',
      icon: '🚤'
    },
    {
      label: 'Next Boat ID',
      value: nextTokenId ? nextTokenId.toString() : '1',
      suffix: '',
      icon: '#️⃣'
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
