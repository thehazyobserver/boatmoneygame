import { useState } from 'react'
import { GAME_CONFIGS } from '../config/contracts'

const TokenSelector = ({ selectedToken, onTokenChange }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Choose Your Game Token</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(GAME_CONFIGS).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onTokenChange(key)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedToken === key
                ? 'border-blue-400 bg-blue-900/30 text-blue-100'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="text-left">
              <div className="font-bold text-lg">{config.symbol}</div>
              <div className="text-sm opacity-75">{config.name}</div>
              <div className="text-xs mt-2 opacity-60">
                Stake: {parseInt(config.minStake).toLocaleString()} - {parseInt(config.maxStake).toLocaleString()}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-900/20 rounded border border-blue-500/30">
        <p className="text-blue-200 text-sm">
          <strong>Note:</strong> Both games use the same BoatNFTs and have identical odds/multipliers. 
          Only the staking token and ranges differ.
        </p>
      </div>
    </div>
  )
}

export default TokenSelector
