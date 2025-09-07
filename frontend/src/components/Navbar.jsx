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
    <nav className="p-4 terminal-bg border-b-2 border-cyan-400 sticky top-0 z-50">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 flex items-center neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
            <span className="wave mr-3 text-4xl md:text-5xl">🚤</span>
            <span className="hidden sm:inline">BOAT RUNNER</span>
            <span className="sm:hidden">BOAT</span>
          </h1>
          <div className="text-xs md:text-sm text-pink-400 font-semibold" style={{ fontFamily: 'Orbitron, monospace' }}>
            [ MIAMI '85 ]
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mobile-stack">
          {isConnected && (
            <div className="text-cyan-400 text-xs md:text-sm font-semibold">
              <div className="neon-border px-2 md:px-3 py-1 rounded bg-black bg-opacity-50" style={{ fontFamily: 'Orbitron, monospace' }}>
                {getChainName(chainId)}
              </div>
            </div>
          )}
          
          {isConnected ? (
            <div className="flex items-center space-x-3 mobile-stack">
              <div className="text-cyan-400 text-xs font-bold px-2 py-1 terminal-bg border border-cyan-400 rounded-md" 
                   style={{ fontFamily: 'Orbitron, monospace' }}>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <button
                onClick={() => disconnect()}
                disabled={false}
                className="vice-button px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                DISCONNECT
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              disabled={isPending}
              className="vice-button px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400 border-t-transparent"></div>
                  <span>CONNECTING...</span>
                </>
              ) : (
                'CONNECT WALLET'
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
