import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi'
import { injected } from 'wagmi/connectors'

export default function Navbar() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()

  const getChainName = (id) => {
    switch (id) {
      case 146: return 'Sonic Mainnet'
      case 64165: return 'Sonic Testnet'
      case 1: return 'Ethereum'
      case 11155111: return 'Sepolia'
      default: return `Chain ${id}`
    }
  }

  return (
    <nav className="p-4 bg-black bg-opacity-20 backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <span className="wave mr-2">⛵</span>
            BOAT MONEY
          </h1>
          <div className="text-sm text-white opacity-80">
            Smuggler's Game
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {isConnected && (
            <div className="text-white text-sm">
              <div className="bg-white bg-opacity-20 px-2 py-1 rounded">
                {getChainName(chainId)}
              </div>
            </div>
          )}
          
          {isConnected ? (
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 px-3 py-2 rounded-lg text-white font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <button 
                onClick={() => disconnect()}
                className="danger-gradient px-4 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={() => connect({ connector: injected() })}
              className="success-gradient px-6 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
