import { useAccount } from 'wagmi'
import PoolStats from './PoolStats'
import UserStats from './UserStats'
import BoatGallery from './BoatGallery'
import BuyRaftCard from './BuyRaftCard'
import Instructions from './Instructions'

export default function GameDashboard() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        {/* Instructions for non-connected users */}
        <Instructions />
        
        <div className="flex flex-col items-center justify-center min-h-64 text-center">
          <div className="text-8xl mb-4 float">🚤</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome to BOAT MONEY
          </h2>
          <p className="text-xl text-white opacity-80 mb-8 max-w-2xl">
            Buy boats, upgrade them, run smuggling missions, and earn $BOAT tokens! 
            Connect your wallet to start your maritime adventure.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-white text-center">
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <div className="text-2xl mb-2">🪜</div>
              <div className="font-bold">Raft</div>
              <div className="text-sm opacity-80">Start here</div>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <div className="text-2xl mb-2">🛶</div>
              <div className="font-bold">Dinghy</div>
              <div className="text-sm opacity-80">Better odds</div>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <div className="text-2xl mb-2">🚤</div>
              <div className="font-bold">Speedboat</div>
              <div className="text-sm opacity-80">Higher rewards</div>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <div className="text-2xl mb-2">🛥️</div>
              <div className="font-bold">Yacht</div>
              <div className="text-sm opacity-80">Maximum profit</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Instructions */}
      <Instructions />
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PoolStats />
        <UserStats />
      </div>
      
      {/* Buy Raft Card */}
      <BuyRaftCard />
      
      {/* User's Boats */}
      <BoatGallery />
    </div>
  )
}
