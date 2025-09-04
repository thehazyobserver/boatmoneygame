import { useState } from 'react'
import { useAccount } from 'wagmi'

export default function Instructions() {
  const { isConnected } = useAccount()
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('basics')

  const tabs = [
    { id: 'basics', label: '🎮 Basics', icon: '🎯' },
    { id: 'gameplay', label: '⚓ Gameplay', icon: '🚤' },
    { id: 'strategy', label: '🧠 Strategy', icon: '💡' }
  ]

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20 mb-6">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="text-2xl">📚</div>
          <div>
            <h2 className="text-xl font-bold text-white">Game Instructions</h2>
            <p className="text-white opacity-80 text-sm">
              {isExpanded ? 'Click to minimize' : 'Click to learn how to play BOAT MONEY'}
            </p>
          </div>
        </div>
        <div className="text-white text-2xl">
          {isExpanded ? '🔼' : '🔽'}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white border-opacity-20">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 p-4 border-b border-white border-opacity-20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 text-white">
            {activeTab === 'basics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    🎯 Welcome to BOAT MONEY
                  </h3>
                  <p className="text-lg mb-4 opacity-90">
                    Money can’t buy happiness, but it can buy me some hoes and a $BOAT
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">🚤 Your Fleet</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-10 rounded-lg">
                        <div className="text-2xl">🪜</div>
                        <div>
                          <div className="font-semibold">Raft (Level 1)</div>
                          <div className="text-sm opacity-80">55% success rate, 1.5x tokens, gets BURNED on failure</div>
                          <div className="text-xs opacity-60 mt-1">💰 Buy: 100,000 BOAT | Upgrade to Dinghy: 150,000 BOAT</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-10 rounded-lg">
                        <div className="text-2xl">🛶</div>
                        <div>
                          <div className="font-semibold">Dinghy (Level 2)</div>
                          <div className="text-sm opacity-80">65% success rate, 2.0x tokens, downgrades on failure</div>
                          <div className="text-xs opacity-60 mt-1">💰 Upgrade to Speedboat: 300,000 BOAT</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-10 rounded-lg">
                        <div className="text-2xl">🚤</div>
                        <div>
                          <div className="font-semibold">Speedboat (Level 3)</div>
                          <div className="text-sm opacity-80">75% success rate, 2.4x tokens, downgrades on failure</div>
                          <div className="text-xs opacity-60 mt-1">💰 Upgrade to Yacht: 600,000 BOAT</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-10 rounded-lg">
                        <div className="text-2xl">🛥️</div>
                        <div>
                          <div className="font-semibold">Yacht (Level 4)</div>
                          <div className="text-sm opacity-80">85% success rate, 3.0x tokens, 15% bonus raft spawn chance</div>
                          <div className="text-xs opacity-60 mt-1">💰 Maximum level - no further upgrades available</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">💰 Getting Started</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="text-xl mt-1">1️⃣</div>
                        <div>
                          <div className="font-semibold">Get BOAT Tokens</div>
                          <div className="text-sm opacity-80">You need BOAT tokens to buy rafts and play on runs</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="text-xl mt-1">2️⃣</div>
                        <div>
                          <div className="font-semibold">Buy Your First Raft</div>
                          <div className="text-sm opacity-80">Costs 100,000 BOAT tokens to start your fleet</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="text-xl mt-1">3️⃣</div>
                        <div>
                          <div className="font-semibold">Start Smuggling</div>
                          <div className="text-sm opacity-80">Play 10,000-80,000 BOAT per run</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="text-xl mt-1">4️⃣</div>
                        <div>
                          <div className="font-semibold">Upgrade & Expand</div>
                          <div className="text-sm opacity-80">Use tokens to upgrade boats and buy more</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gameplay' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">⚓ How Smuggling Runs Work</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">🎲 Run Mechanics</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-green-500 bg-opacity-20 rounded-lg border border-green-500 border-opacity-50">
                        <div className="font-bold text-green-200 mb-2">✅ SUCCESS</div>
                        <ul className="text-sm space-y-1 text-green-100">
                          <li>• Win 1.5x-3.0x your play back</li>
                          <li>• Boat keeps its level</li>
                          <li>• Yachts have 15% chance to spawn bonus raft</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-red-500 bg-opacity-20 rounded-lg border border-red-500 border-opacity-50">
                        <div className="font-bold text-red-200 mb-2">❌ FAILURE</div>
                        <ul className="text-sm space-y-1 text-red-100">
                          <li>• Lose your entire play</li>
                          <li>• Rafts get BURNED (destroyed)</li>
                          <li>• Higher level boats get DOWNGRADED</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">⏱️ Cooldowns & Limits</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white bg-opacity-10 rounded-lg">
                        <div className="font-semibold mb-1">Run Cooldown</div>
                        <div className="text-sm opacity-80">10 minutes between runs per boat</div>
                      </div>
                      <div className="p-3 bg-white bg-opacity-10 rounded-lg">
                        <div className="font-semibold mb-1">Play Range</div>
                        <div className="text-sm opacity-80">Minimum: 10,000 BOAT<br/>Maximum: 80,000 BOAT</div>
                      </div>
                      <div className="p-3 bg-white bg-opacity-10 rounded-lg">
                        <div className="font-semibold mb-1">Token Approval</div>
                        <div className="text-sm opacity-80">First-time users need to approve BOAT spending</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500 bg-opacity-20 rounded-lg p-4 border border-yellow-500 border-opacity-50">
                  <div className="font-bold text-yellow-200 mb-2">⚠️ Important Notes</div>
                  <ul className="text-sm space-y-1 text-yellow-100">
                    <li>• Rafts are high-risk: they get permanently burned on failure</li>
                    <li>• Higher level boats are safer but cost more to upgrade</li>
                    <li>• You can run multiple boats simultaneously if you own several</li>
                    <li>• Results are determined by blockchain randomness - no manipulation possible</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'strategy' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">🧠 Game Strategies</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">🎯 Beginner Strategy</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg">
                        <div className="font-semibold mb-2">Start Conservative</div>
                        <ul className="text-sm space-y-1 opacity-90">
                          <li>• Buy 2-3 rafts initially</li>
                          <li>• Play smaller amounts (10k-20k BOAT)</li>
                          <li>• Accept that some rafts will burn</li>
                          <li>• Use winnings to get more rafts</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg">
                        <div className="font-semibold mb-2">Scale Gradually</div>
                        <ul className="text-sm space-y-1 opacity-90">
                          <li>• Upgrade successful rafts to dinghies</li>
                          <li>• Higher success rates = better odds</li>
                          <li>• Keep some rafts for risky plays</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">🚀 Advanced Strategy</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-500 bg-opacity-20 rounded-lg">
                        <div className="font-semibold mb-2">Yacht Focus</div>
                        <ul className="text-sm space-y-1 opacity-90">
                          <li>• 85% success rate is very high</li>
                          <li>• 3.0x multiplier on wins</li>
                          <li>• 15% chance for bonus rafts</li>
                          <li>• Good for large plays</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-yellow-500 bg-opacity-20 rounded-lg">
                        <div className="font-semibold mb-2">💰 Upgrade Costs</div>
                        <ul className="text-sm space-y-1 opacity-90">
                          <li>• Raft → Dinghy: 150,000 BOAT</li>
                          <li>• Dinghy → Speedboat: 300,000 BOAT</li>
                          <li>• Speedboat → Yacht: 600,000 BOAT</li>
                          <li>• Total to max level: 1,050,000 BOAT</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-orange-500 bg-opacity-20 rounded-lg">
                        <div className="font-semibold mb-2">Smart Play</div>
                        <ul className="text-sm space-y-1 opacity-90">
                          <li>• Only play with tokens you can afford to lose</li>
                          <li>• Spread plays across multiple boats</li>
                          <li>• Consider upgrade costs when planning</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500 bg-opacity-20 rounded-lg p-4 border border-blue-500 border-opacity-50">
                  <div className="font-bold text-blue-200 mb-3">💡 Game Tips</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-100">
                    <div>
                      <div className="font-semibold mb-1">🎰 Know the Odds</div>
                      <div>Higher level boats have better success rates but cost more to upgrade</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">⚡ Yacht Bonus</div>
                      <div>Yachts can spawn free rafts - each raft costs 100,000 BOAT normally</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">📊 Token Management</div>
                      <div>Keep enough BOAT to replace burned rafts and try again</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">🕒 Timing</div>
                      <div>Run all boats at once since there's a 10-minute cooldown</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
