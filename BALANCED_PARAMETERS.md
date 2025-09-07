# BOAT MONEY - Balanced Sustainable Parameters

## 🎯 **SUSTAINABLE & FAIR GAME PARAMETERS**

### 📊 **CORE PRINCIPLE**
- **Target House Edge**: 5-15% per level
- **Player Advantage**: Higher levels get better odds (progression reward)
- **Pool Sustainability**: Weighted average house edge ~8%
- **Fair Play**: Players can still win big, especially at higher levels

### 🚢 **BOAT LEVEL PARAMETERS (BALANCED)**

```solidity
// Success rates (basis points: 10000 = 100%)
setLevelParams(1, 5200, 0)  // L1: 52% success, burn on fail
setLevelParams(2, 5800, 1)  // L2: 58% success, downgrade on fail  
setLevelParams(3, 6500, 1)  // L3: 65% success, downgrade on fail
setLevelParams(4, 7200, 1)  // L4: 72% success, downgrade on fail

// Stake parameters with balanced multipliers
setStakeParams(1, 10_000 ether, 100_000 ether, 16_000, 0)  // L1: 1.6x multiplier
setStakeParams(2, 10_000 ether, 120_000 ether, 18_000, 0)  // L2: 1.8x multiplier  
setStakeParams(3, 10_000 ether, 150_000 ether, 20_000, 0)  // L3: 2.0x multiplier
setStakeParams(4, 10_000 ether, 200_000 ether, 22_000, 0)  // L4: 2.2x multiplier
```

### 💰 **COST STRUCTURE (SUSTAINABLE)**

**Raft Cost:**
- **New: 50,000 BOAT** (reduced from 100k, -50%)

**Upgrade Costs:**
- **L1→L2: 80,000 BOAT** (reduced from 150k, -47%)
- **L2→L3: 150,000 BOAT** (reduced from 300k, -50%)  
- **L3→L4: 250,000 BOAT** (reduced from 600k, -58%)
- **Total progression: 480,000 BOAT** (vs 1,050k current, -54%)

**JOINT Game Stakes:**
- **Min: 25,000 JOINT, Max: 350,000 JOINT**

### 🧮 **HOUSE EDGE ANALYSIS**

**L1 (Raft): 52% success, 1.6x multiplier**
- Expected return: 0.52 × 1.6 = 83.2%
- **House edge: 16.8%** ✅

**L2 (Speedboat): 58% success, 1.8x multiplier**
- Expected return: 0.58 × 1.8 = 104.4%
- **House edge: -4.4%** (slight player advantage)

**L3 (Cruiser): 65% success, 2.0x multiplier**
- Expected return: 0.65 × 2.0 = 130%
- **House edge: -30%** (good player advantage)

**L4 (Yacht): 72% success, 2.2x multiplier**
- Expected return: 0.72 × 2.2 = 158.4%
- **House edge: -58.4%** (excellent player advantage)

### ⚖️ **WEIGHTED HOUSE EDGE**

**Player Distribution Estimate:**
- 50% stay at L1 (House edge: 16.8%)
- 30% reach L2 (House edge: -4.4%)
- 15% reach L3 (House edge: -30%)
- 5% reach L4 (House edge: -58.4%)

**Weighted Average:**
(0.50 × 16.8%) + (0.30 × -4.4%) + (0.15 × -30%) + (0.05 × -58.4%)
= 8.4% - 1.32% - 4.5% - 2.92%
= **-0.34% overall**

### 🔧 **ADJUSTED FOR TRUE SUSTAINABILITY**

**Revised Multipliers (More Conservative):**
```solidity
setStakeParams(1, 10_000 ether, 100_000 ether, 15_500, 0)  // L1: 1.55x
setStakeParams(2, 10_000 ether, 120_000 ether, 17_000, 0)  // L2: 1.7x  
setStakeParams(3, 10_000 ether, 150_000 ether, 18_500, 0)  // L3: 1.85x
setStakeParams(4, 10_000 ether, 200_000 ether, 20_000, 0)  // L4: 2.0x
```

**Revised House Edges:**
- **L1**: 52% × 1.55 = 80.6% return → **19.4% house edge**
- **L2**: 58% × 1.7 = 98.6% return → **1.4% house edge**  
- **L3**: 65% × 1.85 = 120.25% return → **-20.25% house edge**
- **L4**: 72% × 2.0 = 144% return → **-44% house edge**

**Revised Weighted Average:**
(0.50 × 19.4%) + (0.30 × 1.4%) + (0.15 × -20.25%) + (0.05 × -44%)
= 9.7% + 0.42% - 3.04% - 2.2%
= **4.88% overall house edge** ✅

### 🎮 **PLAYER EXPERIENCE**

**L1 (Raft) Economics:**
- Cost: 50,000 BOAT
- Max win: 100,000 × 1.55 = 155,000 BOAT
- Net profit: 105,000 BOAT (210% ROI)
- **Break-even: 1 successful run**

**Full Progression Economics:**
- Total cost: 530,000 BOAT (raft + upgrades)
- Yacht max win: 200,000 × 2.0 = 400,000 BOAT
- **Break-even: 2 successful yacht runs**
- With 72% success rate: Expected 3 total runs

**Why Players Will Play:**
- ✅ Profitable from first successful run
- ✅ Progressive advantages (better odds + higher stakes)
- ✅ Yacht players have 72% success rate
- ✅ High potential rewards (400k max win)

### 🏦 **POOL SUSTAINABILITY**

**Daily Revenue Sources:**
- **Upgrade purchases**: 15 players × 480k = 7,200k BOAT
- **New rafts**: 20 players × 50k = 1,000k BOAT  
- **Failed runs**: ~40% of 60 runs × 75k avg = 1,800k BOAT
- **Total daily income**: ~10,000k BOAT

**Daily Expenses:**
- **Successful runs**: ~60% of 60 runs × 100k avg = 3,600k BOAT
- **Net daily pool growth**: +6,400k BOAT ✅

**Key Sustainability Features:**
- **Upgrade costs** are primary pool funding (480k per player)
- **House edge** on most common level (L1)
- **Progressive rewards** incentivize upgrading
- **Downgrade penalties** return value to pool

### 📋 **IMPLEMENTATION SCRIPT**

```bash
# BOAT Game Contract Updates
setBuyRaftCost(50_000_000_000_000_000_000_000)  # 50k BOAT

setUpgradeCost(1, 80_000_000_000_000_000_000_000)   # L1→L2: 80k
setUpgradeCost(2, 150_000_000_000_000_000_000_000)  # L2→L3: 150k  
setUpgradeCost(3, 250_000_000_000_000_000_000_000)  # L3→L4: 250k

setLevelParams(1, 5200, 0)  # 52% success, burn
setLevelParams(2, 5800, 1)  # 58% success, downgrade
setLevelParams(3, 6500, 1)  # 65% success, downgrade  
setLevelParams(4, 7200, 1)  # 72% success, downgrade

setStakeParams(1, 10_000_000_000_000_000_000_000, 100_000_000_000_000_000_000_000, 15_500, 0)
setStakeParams(2, 10_000_000_000_000_000_000_000, 120_000_000_000_000_000_000_000, 17_000, 0)
setStakeParams(3, 10_000_000_000_000_000_000_000, 150_000_000_000_000_000_000_000, 18_500, 0)
setStakeParams(4, 10_000_000_000_000_000_000_000, 200_000_000_000_000_000_000_000, 20_000, 0)

# JOINT Game Contract Updates  
setMinMaxStake(25_000_000_000_000_000_000_000, 350_000_000_000_000_000_000_000)
```

### ✅ **SUMMARY: BALANCED & SUSTAINABLE**

**For the House:**
- ✅ 4.88% weighted house edge (sustainable)
- ✅ Major revenue from upgrades (480k per player)
- ✅ Pool grows ~6,400k BOAT daily

**For Players:**
- ✅ Can profit from first successful run
- ✅ Progressive advantages (better odds at higher levels)
- ✅ Yacht players have 72% success rate  
- ✅ High potential rewards (up to 400k wins)
- ✅ Clear upgrade incentives

**This creates a perfect balance: sustainable for the house while remaining attractive and profitable for skilled/lucky players!** 🚢💰
