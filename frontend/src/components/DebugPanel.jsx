import { useAccount, useReadContract } from 'wagmi'
import { contracts } from '../config/contracts'

export default function DebugPanel() {
  const { address, isConnected } = useAccount()

  // Test reading the BOAT token address
  const { data: boatTokenAddress, error: boatTokenError, isLoading: boatTokenLoading } = useReadContract({
    ...contracts.boatGame,
    functionName: 'BOAT'
  })

  // Test reading boat count
  const { data: boatCount, error: boatCountError, isLoading: boatCountLoading } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: isConnected }
  })

  // Test reading BOAT balance
  const { data: boatBalance, error: boatBalanceError, isLoading: boatBalanceLoading } = useReadContract({
    address: boatTokenAddress,
    abi: ['function balanceOf(address) view returns (uint256)'],
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: isConnected && !!boatTokenAddress }
  })

  if (!isConnected) {
    return (
      <div className="bg-red-500 bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-red-500 border-opacity-50 mb-4">
        <h3 className="text-red-200 font-bold mb-2">🔍 Debug Panel</h3>
        <p className="text-red-200">Wallet not connected</p>
      </div>
    )
  }

  return (
    <div className="bg-yellow-500 bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500 border-opacity-50 mb-4">
      <h3 className="text-yellow-200 font-bold mb-4">🔍 Debug Panel</h3>
      
      <div className="space-y-2 text-sm text-yellow-200">
        <div>
          <strong>Connected Address:</strong> {address}
        </div>
        
        <div>
          <strong>BOAT Token Address:</strong> 
          {boatTokenLoading && <span className="text-yellow-300"> Loading...</span>}
          {boatTokenError && <span className="text-red-300"> Error: {boatTokenError.message}</span>}
          {boatTokenAddress && <span className="text-green-300"> {boatTokenAddress}</span>}
        </div>

        <div>
          <strong>Boat Count:</strong>
          {boatCountLoading && <span className="text-yellow-300"> Loading...</span>}
          {boatCountError && <span className="text-red-300"> Error: {boatCountError.message}</span>}
          {boatCount !== undefined && <span className="text-green-300"> {boatCount.toString()}</span>}
        </div>

        <div>
          <strong>BOAT Balance:</strong>
          {boatBalanceLoading && <span className="text-yellow-300"> Loading...</span>}
          {boatBalanceError && <span className="text-red-300"> Error: {boatBalanceError.message}</span>}
          {boatBalance !== undefined && <span className="text-green-300"> {boatBalance.toString()}</span>}
        </div>

        <div>
          <strong>Game Contract:</strong> {contracts.boatGame.address}
        </div>
        
        <div>
          <strong>NFT Contract:</strong> {contracts.boatNFT.address}
        </div>
      </div>
    </div>
  )
}
