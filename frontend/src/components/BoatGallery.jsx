import { useAccount, useContractRead } from 'wagmi'
import { contracts } from '../config/contracts'
import BoatCard from './BoatCard'

export default function BoatGallery() {
  const { address, isConnected } = useAccount()

  // Read user's boat count
  const { data: boatCount } = useContractRead({
    ...contracts.boatNFT,
    functionName: 'balanceOf',
    args: [address],
    enabled: isConnected,
    watch: true
  })

  // Read user's boat token IDs
  const { data: tokenIds } = useContractRead({
    ...contracts.boatNFT,
    functionName: 'walletOfOwner',
    args: [address],
    enabled: isConnected && boatCount > 0,
    watch: true
  })

  // Read individual boat levels
  const boatLevels = useContractRead({
    ...contracts.boatNFT,
    functionName: 'levelOf',
    args: tokenIds?.[0],
    enabled: tokenIds && tokenIds.length > 0,
    watch: true
  })

  if (!isConnected) {
    return null
  }

  if (!boatCount || boatCount === 0) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20 text-center">
        <div className="text-6xl mb-4">🌊</div>
        <h2 className="text-2xl font-bold text-white mb-4">No Boats Yet</h2>
        <p className="text-white opacity-80 mb-6">
          You don't own any boats yet. Buy your first raft to start your smuggling operation!
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
          <div className="p-4 bg-white bg-opacity-10 rounded-lg">
            <div className="text-2xl mb-2">🪜</div>
            <div className="font-bold">Raft</div>
            <div className="text-sm opacity-80">1000 BOAT</div>
          </div>
          <div className="p-4 bg-white bg-opacity-10 rounded-lg">
            <div className="text-2xl mb-2">🛶</div>
            <div className="font-bold">Dinghy</div>
            <div className="text-sm opacity-80">Upgrade from Raft</div>
          </div>
          <div className="p-4 bg-white bg-opacity-10 rounded-lg">
            <div className="text-2xl mb-2">🚤</div>
            <div className="font-bold">Speedboat</div>
            <div className="text-sm opacity-80">Upgrade from Dinghy</div>
          </div>
          <div className="p-4 bg-white bg-opacity-10 rounded-lg">
            <div className="text-2xl mb-2">🛥️</div>
            <div className="font-bold">Yacht</div>
            <div className="text-sm opacity-80">Maximum Level</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          ⚓ Your Fleet
        </h2>
        <p className="text-white opacity-80">
          You own {boatCount.toString()} boat{boatCount > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tokenIds?.map((tokenId, index) => (
          <BoatCard
            key={tokenId.toString()}
            tokenId={tokenId}
            level={0} // Will be read from contract in BoatCard component
            onRefresh={() => {
              // Trigger refresh of boat data
              // This would typically refetch the queries
            }}
          />
        ))}
      </div>

      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 text-center">
        <h3 className="text-xl font-bold text-white mb-4">🎮 How to Play</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white text-sm">
          <div className="space-y-2">
            <div className="text-2xl">🎯</div>
            <div className="font-bold">Run Smuggling Operations</div>
            <div className="opacity-80">
              Stake ETH and run missions. Success = 2x your stake + BOAT tokens. 
              Failure = lose your stake.
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">⬆️</div>
            <div className="font-bold">Upgrade Your Fleet</div>
            <div className="opacity-80">
              Use BOAT tokens to upgrade boats for better success rates and higher rewards.
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">💰</div>
            <div className="font-bold">Earn & Compound</div>
            <div className="opacity-80">
              Successful runs earn ETH and BOAT. Use BOAT to buy more boats and upgrade existing ones.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
