import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { sonic } from 'wagmi/chains'

export default function NetworkSwitcher() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending, error } = useSwitchChain()

  // Debug logging
  console.log('NetworkSwitcher - isConnected:', isConnected, 'chainId:', chainId, 'sonic.id:', sonic.id)

  // Don't show if wallet not connected
  if (!isConnected) return null

  // Don't show if already on Sonic network
  if (chainId === sonic.id) return null

  const getNetworkName = (id) => {
    switch (id) {
      case 1: return 'Ethereum Mainnet'
      case 11155111: return 'Sepolia Testnet'
      case 137: return 'Polygon'
      case 42161: return 'Arbitrum'
      case 10: return 'Optimism'
      case 8453: return 'Base'
      case 56: return 'BSC'
      case 43114: return 'Avalanche'
      default: return `Chain ${id}`
    }
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: sonic.id })
    } catch (err) {
      console.error('Failed to switch network:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-900 via-blue-900 to-black border-2 border-cyan-400 rounded-lg p-6 max-w-md w-full neon-border">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-3xl">🌐</span>
          <h2 className="text-xl font-bold text-cyan-400 neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
            WRONG NETWORK
          </h2>
        </div>

        {/* Current network info */}
        <div className="mb-4 p-3 bg-red-900 bg-opacity-50 rounded border border-red-500">
          <p className="text-red-300 text-sm mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
            Currently connected to:
          </p>
          <p className="text-red-400 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
            {getNetworkName(chainId)}
          </p>
        </div>

        {/* Required network info */}
        <div className="mb-6 p-3 bg-green-900 bg-opacity-50 rounded border border-green-500">
          <p className="text-green-300 text-sm mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
            MEME RUNNER requires:
          </p>
          <p className="text-green-400 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
            Sonic Mainnet (Chain 146)
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-70 rounded border border-red-500">
            <p className="text-red-300 text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>
              Switch failed: {error.message}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-center">
          <button
            onClick={handleSwitchNetwork}
            disabled={isPending}
            className="w-full vice-button px-6 py-4 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400 border-t-transparent"></div>
                <span>SWITCHING...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>SWITCH TO SONIC NETWORK</span>
              </>
            )}
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-50 rounded border border-red-500">
            <p className="text-red-300 text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>
              Switch failed: {error.message || 'Please try again or switch manually in your wallet'}
            </p>
          </div>
        )}

        {/* Help text */}
        <div className="mt-4 text-xs text-gray-400 text-center" style={{ fontFamily: 'Orbitron, monospace' }}>
          <p className="text-yellow-400 font-bold mb-2">⚠️ REQUIRED FOR GAMEPLAY</p>
          <p>This game only works on Sonic Network.</p>
          <p>Please switch your wallet network to continue.</p>
        </div>
      </div>
    </div>
  )
}
