import { useState } from 'react'
import { useAccount } from 'wagmi'

export default function Instructions() {
  const { isConnected } = useAccount()
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('basics')

  const tabs = [
    { id: 'basics', label: 'BASICS', icon: '🎯' },
    { id: 'gameplay', label: 'GAMEPLAY', icon: '🚤' }
  ]

  return (
    <div className="terminal-bg rounded-xl border-2 border-cyan-400 mb-6 neon-glow">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-cyan-400 hover:bg-opacity-10 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="text-3xl">📊</div>
          <div>
            <h2 className="text-xl font-bold text-cyan-400 neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
              OPERATION MANUAL
            </h2>
            <p className="text-pink-400 text-sm font-semibold" style={{ fontFamily: 'Rajdhani, monospace' }}>
              {isExpanded ? '[ COLLAPSE INTEL ]' : '[ EXPAND INTEL ]'}
            </p>
          </div>
        </div>
        <div className="text-cyan-400 text-2xl neon-text">
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t-2 border-cyan-400">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 p-4 mobile-stack border-b border-cyan-400 border-opacity-50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 mobile-text-sm ${
                  activeTab === tab.id
                    ? 'vice-button'
                    : 'terminal-bg border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:bg-opacity-20'
                }`}
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          

          {/* Tab Content */}
          <div className="p-6 mobile-p-4">
            {activeTab === 'basics' && (
              <div className="space-y-6">
                <div className="terminal-bg p-4 rounded-lg border border-cyan-400 border-opacity-50">
                  <h3 className="text-lg font-bold text-cyan-400 mb-3 neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
                    🚤 THE OPERATION
                  </h3>
                  <div className="space-y-3 text-white" style={{ fontFamily: 'Rajdhani, monospace' }}>
                    <p className="text-pink-400">
                      <strong>BOAT RUNNER</strong> is a high-risk blockchain game where you operate smuggling boats in the neon-soaked waters of Miami '85.
                    </p>
                    <p>
                      • <strong className="text-yellow-400">BUY RAFTS:</strong> Start with basic rafts using 50K $BOAT tokens
                    </p>
                    <p>
                      • <strong className="text-yellow-400">RUN OPERATIONS:</strong> Execute operations with $BOAT (5K-100K) or $JOINT (7.8K-78K) tokens
                    </p>
                    <p>
                      • <strong className="text-yellow-400">UPGRADE FLEET:</strong> Use $BOAT to upgrade boats (80K→150K→250K) for better success rates
                    </p>
                    <p>
                      • <strong className="text-yellow-400">BUILD AN EMPIRE:</strong> BECOME THE OCEAN'S MOST NOTORIOUS MEME SMUGGLER!
                    </p>
                  </div>
                </div>

                <div className="responsive-grid">
                  <div className="terminal-bg p-4 rounded-lg border border-yellow-400 border-opacity-50">
                    <h4 className="text-md font-bold text-yellow-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
                      💰 $BOAT OPERATIONS
                    </h4>
                    <ul className="text-white space-y-1 text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
                      <li>• Buy new rafts (50K $BOAT)</li>
                      <li>• Upgrade boat levels (80K-250K $BOAT)</li>
                      <li>• Run operations (5K-100K stakes)</li>
                      <li>• Lower risk, steady progression</li>
                    </ul>
                  </div>
                  
                  <div className="terminal-bg p-4 rounded-lg border border-pink-400 border-opacity-50">
                    <h4 className="text-md font-bold text-pink-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
                      🔥 $JOINT OPERATIONS
                    </h4>
                    <ul className="text-white space-y-1 text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
                      <li>• High-stakes operations (7.8K-78K stakes)</li>
                      <li>• Same boat mechanics, different token</li>
                      <li>• Upgrades still paid in $BOAT</li>
                      <li>• Multipliers based on boat level</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gameplay' && (
              <div className="space-y-6">
                <div className="terminal-bg p-4 rounded-lg border border-cyan-400 border-opacity-50">
                  <h3 className="text-lg font-bold text-cyan-400 mb-3 neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
                    ⚓ RUNNING OPERATIONS
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">1️⃣</span>
                      <div>
                        <h4 className="font-bold text-yellow-400">SELECT YOUR VESSEL</h4>
                        <p className="text-white text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
                          Each boat has different success rates and risk levels. Higher level boats = better odds.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">2️⃣</span>
                      <div>
                        <h4 className="font-bold text-yellow-400">CHOOSE OPERATION MODE</h4>
                        <p className="text-white text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
                          Pick $BOAT (5K-100K stakes) or $JOINT (7.8K-78K stakes) from the dropdown on each boat card. Note: All upgrades are always paid in $BOAT tokens.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">3️⃣</span>
                      <div>
                        <h4 className="font-bold text-yellow-400">SET YOUR PLAY AMOUNT</h4>
                        <p className="text-white text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
                          Enter how much you want to try to smuggle. Succeed and be rewarded, fail and face the consequences.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">4️⃣</span>
                      <div>
                        <h4 className="font-bold text-yellow-400">INITIATE RUN</h4>
                        <p className="text-white text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
                          Hit the button and watch the blockchain determine your fate. Will you successfully smuggle the memes or get busted?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="responsive-grid">
                  <div className="terminal-bg p-4 rounded-lg border border-green-400 border-opacity-50">
                    <h4 className="text-md font-bold text-green-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
                      ✅ SUCCESS OUTCOMES
                    </h4>
                    <ul className="text-white space-y-1 text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
                      <li>• Win your stake multiplied by boat level</li>
                      <li>• Yacht runs have 15% chance to spawn bonus rafts</li>
                      <li>• Keep your boat for more runs</li>
                      <li>• 120 second cooldown between runs</li>
                    </ul>
                  </div>
                  
                  <div className="terminal-bg p-4 rounded-lg border border-red-400 border-opacity-50">
                    <h4 className="text-md font-bold text-red-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
                      ❌ FAILURE OUTCOMES
                    </h4>
                    <ul className="text-white space-y-1 text-sm" style={{ fontFamily: 'Rajdhani, monospace' }}>
                      <li>• Lose your staked tokens</li>
                      <li>• Rafts get BURNED on failure</li>
                      <li>• Higher boats get DOWNGRADED one level</li>
                      <li>• 120 second cooldown still applies</li>
                    </ul>
                  </div>
                </div>

                {/* Game Mechanics Section */}
                <div className="terminal-bg p-4 rounded-lg border border-purple-400 border-opacity-50">
                  <h3 className="text-lg font-bold text-purple-400 mb-3 neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
                    📊 BOAT MECHANICS
                  </h3>
                  <div className="responsive-grid">
                    <div className="space-y-2">
                      <h4 className="font-bold text-yellow-400">🚢 SUCCESS RATES</h4>
                      <ul className="text-white text-sm space-y-1" style={{ fontFamily: 'Rajdhani, monospace' }}>
                        <li>• Raft: 60% success</li>
                        <li>• Dinghy: 68% success</li>
                        <li>• Speedboat: 78% success</li>
                        <li>• Yacht: 87% success</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-yellow-400">💰 UPGRADE COSTS</h4>
                      <ul className="text-white text-sm space-y-1" style={{ fontFamily: 'Rajdhani, monospace' }}>
                        <li>• Raft → Dinghy: 80K $BOAT</li>
                        <li>• Dinghy → Speedboat: 150K $BOAT</li>
                        <li>• Speedboat → Yacht: 250K $BOAT</li>
                        <li>• New Raft: 50K $BOAT</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Strategy tab removed per request */}
          </div>
        </div>
      )}
    </div>
  )
}
