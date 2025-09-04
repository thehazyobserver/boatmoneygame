import { useState } from 'react'
import { GAME_CONFIGS } from '../config/contracts'

const TokenSelector = ({ selectedToken, onTokenChange }) => {
  return (
    <div className="terminal-bg rounded-lg p-6 mb-6 border-2 border-cyan-400">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6 neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
        SELECT OPERATION MODE
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(GAME_CONFIGS).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onTokenChange(key)}
            className={`p-6 rounded-lg border-2 transition-all duration-300 relative overflow-hidden ${
              selectedToken === key
                ? 'neon-border bg-cyan-900/30 text-cyan-100 neon-glow'
                : 'border-pink-500/50 bg-gray-900/50 text-pink-300 hover:border-pink-400 hover:bg-pink-900/20'
            }`}
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            <div className="text-left relative z-10">
              <div className="font-bold text-2xl mb-2">
                {key === 'BOAT' ? '🚤' : '🌿'} {config.symbol}
              </div>
              <div className="text-sm opacity-75 mb-3">{config.name}</div>
              <div className="text-xs opacity-90 bg-black/30 px-2 py-1 rounded">
                STAKES: {parseInt(config.minStake).toLocaleString()} - {parseInt(config.maxStake).toLocaleString()}
              </div>
            </div>
            {selectedToken === key && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 animate-pulse"></div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-black/50 rounded border border-yellow-400/50">
        <p className="text-yellow-300 text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
          <strong className="text-yellow-400">⚠️ INTEL:</strong> Same boats, same odds, different currency. 
          Choose your poison, runner.
        </p>
      </div>
    </div>
  )
}

export default TokenSelector
