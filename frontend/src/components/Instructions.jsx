import { useState } from 'react'
import { useAccount } from 'wagmi'

export default function Instructions() {
  const { isConnected } = useAccount()
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('basics')

  const tabs = [
    { id: 'basics', label: '🎮 Basics', icon: '🎯' },
    { id: 'gameplay', label: '⚓ Gameplay', icon: '🚤' },
    { id: 'strategy', label: '🧠 Strategy', icon: '💡' },
    { id: 'economics', label: '💰 Economics', icon: '📊' }
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
                    A high-risk, high-reward Web3 game where you run smuggling operations with boats to earn BOAT tokens!
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
                          <div className="text-sm opacity-80">55% success rate, 1.5x rewards, gets BURNED on failure</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-10 rounded-lg">
                        <div className="text-2xl">🛶</div>
                        <div>
                          <div className="font-semibold">Dinghy (Level 2)</div>
                          <div className="text-sm opacity-80">65% success rate, 2.0x rewards, downgrades on failure</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-10 rounded-lg">
                        <div className="text-2xl">🚤</div>
                        <div>
                          <div className="font-semibold">Speedboat (Level 3)</div>
                          <div className="text-sm opacity-80">75% success rate, 2.4x rewards, downgrades on failure</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-10 rounded-lg">
                        <div className="text-2xl">🛥️</div>
                        <div>
                          <div className="font-semibold">Yacht (Level 4)</div>
                          <div className="text-sm opacity-80">85% success rate, 3.0x rewards, 15% bonus raft spawn chance</div>
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
                          <div className="text-sm opacity-80">You need BOAT tokens to buy rafts and stake on runs</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="text-xl mt-1">2️⃣</div>
                        <div>
                          <div className="font-semibold">Buy Your First Raft</div>
                          <div className="text-sm opacity-80">Costs 1,000 BOAT tokens to start your fleet</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="text-xl mt-1">3️⃣</div>
                        <div>
                          <div className="font-semibold">Start Smuggling</div>
                          <div className="text-sm opacity-80">Stake 10,000-80,000 BOAT per run</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="text-xl mt-1">4️⃣</div>
                        <div>
                          <div className="font-semibold">Upgrade & Expand</div>
                          <div className="text-sm opacity-80">Use earnings to upgrade boats and buy more</div>
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
                          <li>• Earn 1.5x-3.0x your stake back</li>
                          <li>• Boat keeps its level</li>
                          <li>• Yachts have 15% chance to spawn bonus raft</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-red-500 bg-opacity-20 rounded-lg border border-red-500 border-opacity-50">
                        <div className="font-bold text-red-200 mb-2">❌ FAILURE</div>
                        <ul className="text-sm space-y-1 text-red-100">
                          <li>• Lose your entire stake</li>
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
                        <div className="font-semibold mb-1">Stake Range</div>
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
                <h3 className="text-xl font-bold mb-4">🧠 Winning Strategies</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">🎯 Beginner Strategy</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg">
                        <div className="font-semibold mb-2">Start Conservative</div>
                        <ul className="text-sm space-y-1 opacity-90">
                          <li>• Buy 2-3 rafts initially</li>
                          <li>• Stake smaller amounts (10k-20k BOAT)</li>
                          <li>• Accept that some rafts will burn</li>
                          <li>• Reinvest profits into more rafts</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg">
                        <div className="font-semibold mb-2">Scale Gradually</div>
                        <ul className="text-sm space-y-1 opacity-90">
                          <li>• Upgrade successful rafts to dinghies</li>
                          <li>• Higher success rates = safer investments</li>
                          <li>• Keep some rafts for high-risk plays</li>
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
                          <li>• 85% success rate is very safe</li>
                          <li>• 3.0x multiplier on wins</li>
                          <li>• 15% chance for bonus rafts</li>
                          <li>• Best for large stakes</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-orange-500 bg-opacity-20 rounded-lg">
                        <div className="font-semibold mb-2">Risk Management</div>
                        <ul className="text-sm space-y-1 opacity-90">
                          <li>• Never stake more than you can afford to lose</li>
                          <li>• Diversify across multiple boats</li>
                          <li>• Consider downgrade costs vs upgrade costs</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500 bg-opacity-20 rounded-lg p-4 border border-blue-500 border-opacity-50">
                  <div className="font-bold text-blue-200 mb-3">💡 Pro Tips</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-100">
                    <div>
                      <div className="font-semibold mb-1">🎰 Probability Math</div>
                      <div>With 55% success and 1.5x rewards, rafts have positive expected value over time</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">⚡ Yacht Bonus</div>
                      <div>Free rafts from yachts add significant value - each has 1000 BOAT worth</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">📊 Bankroll Management</div>
                      <div>Keep enough BOAT to replace burned rafts and handle variance</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">🕒 Timing Strategy</div>
                      <div>Run all boats simultaneously to maximize hourly earnings</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'economics' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">💰 Game Economics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">💸 Costs</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-white bg-opacity-10 rounded">
                        <span>🪜 Buy Raft</span>
                        <span className="font-semibold">1,000 BOAT</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white bg-opacity-10 rounded">
                        <span>🪜→🛶 Upgrade to Dinghy</span>
                        <span className="font-semibold">5,000 BOAT</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white bg-opacity-10 rounded">
                        <span>🛶→🚤 Upgrade to Speedboat</span>
                        <span className="font-semibold">25,000 BOAT</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white bg-opacity-10 rounded">
                        <span>🚤→🛥️ Upgrade to Yacht</span>
                        <span className="font-semibold">125,000 BOAT</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">📈 Expected Returns</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-white bg-opacity-10 rounded">
                        <div className="font-semibold">🪜 Raft Strategy</div>
                        <div className="text-sm opacity-80">High risk, high volatility, positive EV</div>
                        <div className="text-xs mt-1">55% × 1.5x = 82.5% return rate</div>
                      </div>
                      <div className="p-3 bg-white bg-opacity-10 rounded">
                        <div className="font-semibold">🛥️ Yacht Strategy</div>
                        <div className="text-sm opacity-80">Lower risk, steady returns, bonus rafts</div>
                        <div className="text-xs mt-1">85% × 3.0x = 255% return rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-lg">🏆 Prize Pool System</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-500 bg-opacity-20 rounded-lg text-center">
                      <div className="text-2xl mb-2">💰</div>
                      <div className="font-semibold">Player Stakes</div>
                      <div className="text-sm opacity-80">Lost stakes fund the prize pool</div>
                    </div>
                    <div className="p-4 bg-blue-500 bg-opacity-20 rounded-lg text-center">
                      <div className="text-2xl mb-2">🎁</div>
                      <div className="font-semibold">Rewards Paid</div>
                      <div className="text-sm opacity-80">Successful runs get multiplied stakes</div>
                    </div>
                    <div className="p-4 bg-purple-500 bg-opacity-20 rounded-lg text-center">
                      <div className="text-2xl mb-2">⚖️</div>
                      <div className="font-semibold">House Edge</div>
                      <div className="text-sm opacity-80">Small edge funds development</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500 bg-opacity-20 rounded-lg p-4 border border-green-500 border-opacity-50">
                  <div className="font-bold text-green-200 mb-2">🎯 Value Proposition</div>
                  <p className="text-sm text-green-100">
                    BOAT MONEY combines DeFi yields with gaming excitement. Unlike pure gambling, 
                    the game has positive expected value for skilled players who manage risk properly. 
                    The upgrade system creates long-term progression and yacht ownership provides 
                    sustainable income through bonus raft generation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
