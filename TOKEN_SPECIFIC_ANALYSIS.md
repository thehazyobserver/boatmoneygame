# TOKEN-SPECIFIC PARAMETERS ANALYSIS

## 🔄 **CONVERSION RATIO (FROM YOUR DATA)**
**5468.78 $BOAT = 8529.109 $JOINT**
**1 $BOAT ≈ 1.56 $JOINT**

## 🎮 **SHARED vs TOKEN-SPECIFIC PARAMETERS**

### **SHARED PARAMETERS (Same for Both Tokens)**
These apply to BOTH $BOAT and $JOINT games:
- **Success rates**: 50%/55%/60%/65%
- **Multipliers**: 1.5x/1.65x/1.8x/1.9x  
- **House edge calculations**: Same percentages
- **Game mechanics**: Burn/downgrade on failure
- **Cooldown periods**: Same timing

### **TOKEN-SPECIFIC PARAMETERS**

#### **$BOAT GAME CONTRACT**
**Full rebalancing needed:**
```solidity
// Costs (BOAT-specific)
setBuyRaftCost(50_000_000_000_000_000_000_000)  // 50k BOAT
setUpgradeCost(1, 80_000_000_000_000_000_000_000)   // 80k BOAT
setUpgradeCost(2, 150_000_000_000_000_000_000_000)  // 150k BOAT
setUpgradeCost(3, 250_000_000_000_000_000_000_000)  // 250k BOAT

// Stakes (BOAT-specific)
setStakeParams(1, 10_000_000_000_000_000_000_000, 100_000_000_000_000_000_000_000, 15_000, 0)  // 10k-100k
setStakeParams(2, 10_000_000_000_000_000_000_000, 120_000_000_000_000_000_000_000, 16_500, 0)  // 10k-120k
setStakeParams(3, 10_000_000_000_000_000_000_000, 150_000_000_000_000_000_000_000, 18_000, 0)  // 10k-150k
setStakeParams(4, 10_000_000_000_000_000_000_000, 200_000_000_000_000_000_000_000, 19_000, 0)  // 10k-200k

// Game mechanics (affects both but set in BOAT contract)
setLevelParams(1, 5000, 0)  // 50% success
setLevelParams(2, 5500, 1)  // 55% success
setLevelParams(3, 6000, 1)  // 60% success
setLevelParams(4, 6500, 1)  // 65% success
```

#### **$JOINT GAME CONTRACT**
**Only stake adjustments needed:**
```solidity
// Stakes adjusted for 1.56x conversion ratio
setMinMaxStake(25_000_000_000_000_000_000_000, 350_000_000_000_000_000_000_000)  // 25k-350k JOINT

// NOTE: Uses same success rates/multipliers as BOAT game
// NOTE: Upgrade costs are in BOAT tokens (shared system)
```

## 🔄 **WHY DIFFERENT TREATMENT**

### **$BOAT Game (Full Rebalancing)**
- **Primary game contract** with all cost structures
- **Raft and upgrade costs** set here (in BOAT tokens)
- **Complete parameter control** needed
- **House edge calculations** based on BOAT stakes

### **$JOINT Game (Stake Adjustment Only)**
- **References BOAT game** for upgrade costs and mechanics
- **Different token** but same underlying game logic
- **Only needs stake range** adjustment for balanced economics
- **Shares success rates/multipliers** with BOAT game

## 📊 **STAKE RANGE COMPARISON**

### **Current Ranges**
- **$BOAT**: 10k-80k BOAT
- **$JOINT**: 20k-120k JOINT

**Conversion check:**
- 80k BOAT × 1.56 = 124.8k JOINT equivalent
- Current max stakes roughly equivalent ✅

### **Proposed Ranges**
- **$BOAT**: 10k-200k BOAT
- **$JOINT**: 25k-350k JOINT

**Conversion check:**
- 200k BOAT × 1.56 = 312k JOINT equivalent
- Proposed 350k JOINT max is slightly higher (good for JOINT players) ✅

## 🎯 **ECONOMICS IMPACT**

### **Cross-Token Balance**
**With 1 BOAT ≈ 1.56 JOINT conversion:**

**Raft Cost Equivalent:**
- BOAT: 50k BOAT
- JOINT equivalent: 78k JOINT value

**Max Win Comparison (L1):**
- BOAT: 100k × 1.5 = 150k BOAT potential
- JOINT: 156k × 1.5 = 234k JOINT potential
- JOINT equivalent: 150k BOAT value

**Both tokens achieve similar economics when converted** ✅

### **Player Choice Factors**
**$BOAT Game:**
- Direct costs in native token
- Full parameter control
- Primary game experience

**$JOINT Game:**
- Higher nominal stakes (350k vs 200k)
- Same upgrade costs (but in BOAT tokens)
- Alternative token access

## 📋 **IMPLEMENTATION SUMMARY**

### **For $BOAT Contract:**
- ✅ Reduce all costs (raft, upgrades)
- ✅ Adjust success rates (50-65%)
- ✅ Balance multipliers (1.5-1.9x)
- ✅ Increase stake ranges (up to 200k)

### **For $JOINT Contract:**
- ✅ Adjust stake range only (25k-350k)
- ✅ Inherits success rates from BOAT game
- ✅ Uses BOAT upgrade costs (cross-token system)

## 🔧 **DIFFERENT PARAMETERS POSSIBLE**

**Yes, they CAN have different parameters if desired:**

**Potential Differences:**
- Different success rates per token
- Different multipliers
- Different stake ranges
- Different cooldowns

**Current Setup:**
- **Shared mechanics** (success rates, multipliers)
- **Token-specific costs** (BOAT has upgrade costs)
- **Token-specific stakes** (different ranges)

**This maintains consistency while allowing token-specific economic balance!** 🚢💰

## ✅ **FINAL ANSWER**

1. **Conversion ratio**: 1 BOAT ≈ 1.56 JOINT (from your data)
2. **Scope**: Full rebalancing for BOAT, stake adjustment for JOINT
3. **Can be different**: Yes, but currently sharing mechanics for consistency
4. **Both are sustainable**: 12.9% weighted house edge applies to both when properly balanced

**The parameters ensure fair economics across both tokens while respecting the 1.56x conversion ratio!**
