import { useAccount, useReadContract } from 'wagmi'
import { contracts } from '../config/contracts'
import BoatCard from './BoatCard'

export default function BoatGallery() {
  const { address, isConnected } = useAccount()

  // Read user's boat count
  const { data: boatCount } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: isConnected }
  })

  // For ERC721Enumerable, we need to get each token ID individually
  // We'll get up to 10 boats to handle larger fleets
  const { data: firstTokenId } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, 0],
    query: { enabled: isConnected && boatCount > 0 }
  })

  const { data: secondTokenId } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'tokenOfOwnerByIndex', 
    args: [address, 1],
    query: { enabled: isConnected && boatCount > 1 }
  })

  const { data: thirdTokenId } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, 2], 
    query: { enabled: isConnected && boatCount > 2 }
  })

  const { data: fourthTokenId } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, 3], 
    query: { enabled: isConnected && boatCount > 3 }
  })

  const { data: fifthTokenId } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, 4], 
    query: { enabled: isConnected && boatCount > 4 }
  })

  const { data: sixthTokenId } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, 5], 
    query: { enabled: isConnected && boatCount > 5 }
  })

  const { data: seventhTokenId } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, 6], 
    query: { enabled: isConnected && boatCount > 6 }
  })

  const { data: eighthTokenId } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, 7], 
    query: { enabled: isConnected && boatCount > 7 }
  })

  const { data: ninthTokenId } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, 8], 
    query: { enabled: isConnected && boatCount > 8 }
  })

  const { data: tenthTokenId } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, 9], 
    query: { enabled: isConnected && boatCount > 9 }
  })

  // Create array of token IDs
  const tokenIds = [
    firstTokenId, secondTokenId, thirdTokenId, fourthTokenId, fifthTokenId,
    sixthTokenId, seventhTokenId, eighthTokenId, ninthTokenId, tenthTokenId
  ].filter(id => id !== undefined).map(id => id.toString())

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
            <div className="text-2xl mb-2">�</div>
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
            key={tokenId}
            tokenId={tokenId}
            level={1} // Will be read from contract in BoatCard component
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
              Play BOAT and run missions. Success = win BOAT tokens (1.5x-3.0x your play). 
              Failure = lose your play. Level 1 boats get BURNED, higher levels get DOWNGRADED.
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">⬆️</div>
            <div className="font-bold">Upgrade Your Fleet</div>
            <div className="opacity-80">
              Use BOAT tokens to upgrade boats for better success rates and higher multipliers.
              Yachts have a 15% bonus chance to spawn a free raft after each run!
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">💰</div>
            <div className="font-bold">Play & Progress</div>
            <div className="opacity-80">
              Successful runs win BOAT tokens. Use BOAT to buy more boats and upgrade existing ones.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
