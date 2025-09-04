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
    <nav className="p-4 terminal-bg border-b-2 border-cyan-400">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-4xl font-bold text-cyan-400 flex items-center neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
            <span className="wave mr-3 text-5xl">🚤</span>
            BOAT RUNNER
          </h1>
          <div className="text-sm text-pink-400 font-semibold" style={{ fontFamily: 'Orbitron, monospace' }}>
            [ MIAMI '85 ]
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {isConnected && (
            <div className="text-cyan-400 text-sm font-semibold">
              <div className="neon-border px-3 py-1 rounded bg-black bg-opacity-50" style={{ fontFamily: 'Orbitron, monospace' }}>
                {getChainName(chainId)}
              </div>
            </div>
          )}
          
          {isConnected ? (
            <div className="flex items-center space-x-4">
              <div className="neon-border px-4 py-2 rounded bg-black bg-opacity-70 text-cyan-400 font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <button 
                onClick={() => disconnect()}
                className="vice-button px-6 py-2 rounded-lg text-white font-semibold"
              >
                JACK OUT
              </button>
            </div>
          ) : (
            <button 
              onClick={() => connect({ connector: injected() })}
              className="vice-button px-8 py-3 rounded-lg text-white font-semibold neon-glow"
            >
              JACK IN
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
