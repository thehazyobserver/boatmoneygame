import { useState, useMemo } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { contracts, BOAT_TOKEN_ABI, GAME_CONFIGS } from '../config/contracts'
import { useTokenApproval } from '../hooks/useTokenApproval'
import { useCooldownTimer } from '../hooks/useCooldownTimer'
import { formatTokenAmount, formatInteger } from '../utils/formatters'

const BOAT_EMOJIS = {
  1: '🛶',
  2: '⛵', 
  3: '🚤',
  4: '🛥️'
}

const BOAT_NAMES = {
  1: 'Raft',
  2: 'Dinghy',
  3: 'Speedboat', 
  4: 'Yacht'
}

export default function BoatCard({ tokenId, level, onRefresh }) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [isRunning, setIsRunning] = useState(false)
  const [cardSelectedToken, setCardSelectedToken] = useState('BOAT') // Default to BOAT token
  const [errorMsg, setErrorMsg] = useState('')
  
  const gameConfig = GAME_CONFIGS[cardSelectedToken]
  const [playAmount, setPlayAmount] = useState(gameConfig.minStake)
  const [lastTxHash, setLastTxHash] = useState(null)

  const getGameContract = () => {
    return cardSelectedToken === 'JOINT' ? contracts.jointBoatGame : contracts.boatGame
  }

  const { hasAllowance, approveMax, isApproving } = useTokenApproval(cardSelectedToken)
  // Separate approval hook for upgrades (always BOAT tokens)
  const { hasAllowance: hasUpgradeAllowance, approveMax: approveUpgrade, isApproving: isApprovingUpgrade } = useTokenApproval('BOAT')

  const { timeLeft, isOnCooldown, formattedTime, cooldownDuration } = useCooldownTimer(cardSelectedToken, BigInt(tokenId))

  const { writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  })

  const { data: boatLevel } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'levelOf',
    args: [BigInt(tokenId)]
  })

  const { data: upgradeCost } = useReadContract({
    ...contracts.boatGame, // Always use BOAT game contract for upgrades
    functionName: 'upgradeCost',
    args: [boatLevel || level || 1],
    query: { enabled: (boatLevel || level || 1) < 4 }
  })

  // Get BOAT token balance for upgrades
  const { data: boatTokenBalance } = useReadContract({
    address: GAME_CONFIGS.BOAT.tokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address }
  })

  const { data: tokenBalance } = useReadContract({
    address: gameConfig.tokenAddress,
    abi: BOAT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address }
  })

  // Pool/cap reads for EV & cap awareness
  const gameContract = useMemo(() => (cardSelectedToken === 'JOINT' ? contracts.jointBoatGame : contracts.boatGame), [cardSelectedToken])
  const { data: poolBalance } = useReadContract({
    ...gameContract,
    functionName: 'poolBalance'
  })
  const { data: capBps } = useReadContract({
    ...gameContract,
    functionName: 'capBps'
  })
  // Max absolute payout differs per game
  const { data: jointMaxAbs } = useReadContract({
    ...contracts.jointBoatGame,
    functionName: 'maxPayoutAbs',
    args: [boatLevel || level || 1],
    query: { enabled: cardSelectedToken === 'JOINT' }
  })
  const { data: jointMaxAbsNext } = useReadContract({
    ...contracts.jointBoatGame,
    functionName: 'maxPayoutAbs',
    args: [(boatLevel || level || 1) + 1],
    query: { enabled: cardSelectedToken === 'JOINT' && (boatLevel || level || 1) < 4 }
  })
  const { data: boatStakeCfg } = useReadContract({
    ...contracts.boatGame,
    functionName: 'stakeCfg',
    args: [boatLevel || level || 1],
    query: { enabled: cardSelectedToken === 'BOAT' }
  })
  const { data: boatStakeCfgNext } = useReadContract({
    ...contracts.boatGame,
    functionName: 'stakeCfg',
    args: [(boatLevel || level || 1) + 1],
    query: { enabled: cardSelectedToken === 'BOAT' && (boatLevel || level || 1) < 4 }
  })

  // Check BoatNFT authorization (which game is allowed to modify NFTs)
  const expectedGameAddress = (cardSelectedToken === 'JOINT' ? contracts.jointBoatGame.address : contracts.boatGame.address) || ''
  const { data: isAuthorizedGame } = useReadContract({
    ...contracts.boatNFT,
    functionName: 'isGame',
    args: [expectedGameAddress]
  })

  const currentLevel = boatLevel || level || 1
  const isMaxLevel = currentLevel >= 4
  // isGame(address) returns a boolean; if undefined (loading), default to true to avoid blocking UI
  const isAuthorized = typeof isAuthorizedGame === 'boolean' ? isAuthorizedGame : true
  
  const playAmountWei = parseEther(playAmount || '0')
  const needsRunApproval = playAmountWei > 0 && !hasAllowance(playAmountWei)
  const needsUpgradeApproval = upgradeCost && !hasUpgradeAllowance(upgradeCost)
  
  // Input validation
  const playAmountNum = parseFloat(playAmount || '0')
  const isValidAmount = playAmountNum >= parseInt(gameConfig.minStake) && playAmountNum <= parseInt(gameConfig.maxStake)
  const hasValidAmount = playAmount && !isNaN(playAmountNum) && isValidAmount

  // EV and cap awareness
  const levelCfg = gameConfig.levels[currentLevel] || { successRate: 50, multiplier: 1.5 }
  const multBps = Math.round((levelCfg.multiplier || 1.5) * 10000)
  const rawRewardWei = (playAmountWei * BigInt(multBps)) / 10000n
  const capByPoolWei = (poolBalance && capBps)
    ? (poolBalance * BigInt(capBps)) / 10000n
    : 0n
  const maxAbsWei = cardSelectedToken === 'JOINT'
    ? (jointMaxAbs || 0n)
    : (boatStakeCfg && boatStakeCfg[3]) /* maxPayoutAbs */ || 0n
  let effectiveRewardWei = rawRewardWei
  if (capByPoolWei > 0n && effectiveRewardWei > capByPoolWei) effectiveRewardWei = capByPoolWei
  if (maxAbsWei > 0n && effectiveRewardWei > maxAbsWei) effectiveRewardWei = maxAbsWei
  const effectiveMultiplier = playAmountWei > 0n
    ? (Number(formatEther(effectiveRewardWei)) / Math.max(1e-9, Number(playAmount)))
    : 0
  const p = (levelCfg.successRate || 50) / 100
  const evPct = playAmountWei > 0n ? (p * effectiveMultiplier - 1) * 100 : 0
  const capApplied = effectiveRewardWei < rawRewardWei

  // Next-level EV (for upgrade preview)
  const nextLevel = Math.min(currentLevel + 1, 4)
  const nextCfg = gameConfig.levels[nextLevel] || { successRate: levelCfg.successRate, multiplier: levelCfg.multiplier }
  const nextMultBps = Math.round((nextCfg.multiplier || levelCfg.multiplier || 1.5) * 10000)
  const nextRawWei = (playAmountWei * BigInt(nextMultBps)) / 10000n
  const nextMaxAbsWei = cardSelectedToken === 'JOINT'
    ? (jointMaxAbsNext || 0n)
    : (boatStakeCfgNext && boatStakeCfgNext[3]) || 0n
  let nextEffWei = nextRawWei
  if (capByPoolWei > 0n && nextEffWei > capByPoolWei) nextEffWei = capByPoolWei
  if (nextMaxAbsWei > 0n && nextEffWei > nextMaxAbsWei) nextEffWei = nextMaxAbsWei
  const nextEffMult = playAmountWei > 0n
    ? (Number(formatEther(nextEffWei)) / Math.max(1e-9, Number(playAmount)))
    : 0
  const nextP = (nextCfg.successRate || levelCfg.successRate || 50) / 100
  const nextEvPct = playAmountWei > 0n ? (nextP * nextEffMult - 1) * 100 : 0
  
  const getRunButtonText = () => {
  // Keep cooldown display only in the banner, not on the button
  if (isPending || isConfirming) return 'RUNNING...'
    if (!hasValidAmount) return 'ENTER VALID AMOUNT'
    if (needsRunApproval) return `APPROVE ${gameConfig.symbol} FIRST`
    if (isApproving) return 'APPROVING...'
    return 'START RUN'
  }

  const getUpgradeButtonText = () => {
    if (isPending || isConfirming) return 'UPGRADING...'
    if (needsUpgradeApproval) return 'APPROVE BOAT FIRST'
    if (isApprovingUpgrade) return 'APPROVING...'
    return `UPGRADE TO ${BOAT_NAMES[currentLevel + 1]?.toUpperCase()}`
  }

  // Build tx options with gas estimate + fee bump; fallback to safe caps if estimation fails
  const buildTxOptions = async (contract, functionName, args) => {
    let gas
    let feeOpts = {}
    try {
      if (publicClient && address) {
        const est = await publicClient.estimateContractGas({
          address: contract.address,
          abi: contract.abi,
          functionName,
          args,
          account: address,
        })
        // Add 20% buffer
        gas = (est * 120n) / 100n
      }
    } catch (e) {
      console.warn('Gas estimation failed, will use fallback:', e?.message || e)
    }
    try {
      if (publicClient) {
        const fees = await publicClient.estimateFeesPerGas().catch(() => null)
        if (fees?.maxFeePerGas && fees?.maxPriorityFeePerGas) {
          feeOpts = {
            maxFeePerGas: (fees.maxFeePerGas * 110n) / 100n,
            maxPriorityFeePerGas: fees.maxPriorityFeePerGas + 1_000_000_000n, // +1 gwei
          }
        }
      }
    } catch (_) {
      // ignore fee errors; wallet will fill
    }
    return { gas, ...feeOpts }
  }

  const handleRun = async () => {
    if (isOnCooldown || isPending || isConfirming || isApproving || !hasValidAmount) return
    
    // Handle approval first if needed
    if (needsRunApproval) {
      await approveMax()
      return
    }

    try {
      setIsRunning(true)
      const contract = getGameContract()
      const args = [BigInt(tokenId), playAmountWei]
      const opts = await buildTxOptions(contract, 'run', args)
      let tx
      try {
        tx = await writeContract({
          ...contract,
          functionName: 'run',
          args,
          ...(opts.gas ? { gas: opts.gas } : {}),
          ...(opts.maxFeePerGas ? { maxFeePerGas: opts.maxFeePerGas } : {}),
          ...(opts.maxPriorityFeePerGas ? { maxPriorityFeePerGas: opts.maxPriorityFeePerGas } : {}),
        })
      } catch (err) {
        console.warn('Run tx failed on first attempt, retrying with fallback gas...', err?.message || err)
        const fallbackGas = opts.gas && opts.gas > 0n ? opts.gas + 50_000n : 400_000n
        tx = await writeContract({
          ...contract,
          functionName: 'run',
          args,
          gas: fallbackGas,
          ...(opts.maxFeePerGas ? { maxFeePerGas: opts.maxFeePerGas } : {}),
          ...(opts.maxPriorityFeePerGas ? { maxPriorityFeePerGas: opts.maxPriorityFeePerGas } : {}),
        })
      }
      setLastTxHash(tx)
      if (onRefresh) onRefresh()
    } catch (err) {
  console.error('Run failed:', err)
  const m = (err?.shortMessage || err?.message || '').toString()
  let friendly = ''
  if (/Cooldown/i.test(m)) friendly = 'Boat is cooling down.'
  else if (/Stake out of bounds/i.test(m)) friendly = 'Amount outside allowed range.'
  else if (/Insufficient pool/i.test(m)) friendly = 'Pool is low for that stake. Try a smaller amount.'
  else if (/Not owner/i.test(m)) friendly = 'You must own this boat.'
  else friendly = 'Transaction failed. Please try again.'
  setErrorMsg(friendly)
  setTimeout(() => setErrorMsg(''), 5000)
    }
  }

  const handleUpgrade = async () => {
    if (isPending || isApprovingUpgrade || isConfirming || isMaxLevel) return

    // Handle approval first if needed
    if (needsUpgradeApproval) {
      await approveUpgrade()
      return
    }

    try {
      setIsRunning(true)
      const args = [BigInt(tokenId)]
      const opts = await buildTxOptions(contracts.boatGame, 'upgrade', args)
      let tx
      try {
        tx = await writeContract({
          ...contracts.boatGame,
          functionName: 'upgrade',
          args,
          ...(opts.gas ? { gas: opts.gas } : {}),
          ...(opts.maxFeePerGas ? { maxFeePerGas: opts.maxFeePerGas } : {}),
          ...(opts.maxPriorityFeePerGas ? { maxPriorityFeePerGas: opts.maxPriorityFeePerGas } : {}),
        })
      } catch (err) {
        console.warn('Upgrade tx failed on first attempt, retrying with fallback gas...', err?.message || err)
        const fallbackGas = opts.gas && opts.gas > 0n ? opts.gas + 50_000n : 350_000n
        tx = await writeContract({
          ...contracts.boatGame,
          functionName: 'upgrade',
          args,
          gas: fallbackGas,
          ...(opts.maxFeePerGas ? { maxFeePerGas: opts.maxFeePerGas } : {}),
          ...(opts.maxPriorityFeePerGas ? { maxPriorityFeePerGas: opts.maxPriorityFeePerGas } : {}),
        })
      }
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Upgrade failed:', err)
  const m = (err?.shortMessage || err?.message || '').toString()
  let friendly = ''
  if (/insufficient allowance/i.test(m)) friendly = 'Approve BOAT first.'
  else if (/Not owner/i.test(m)) friendly = 'You must own this boat.'
  else friendly = 'Upgrade failed. Please try again.'
  setErrorMsg(friendly)
  setTimeout(() => setErrorMsg(''), 5000)
    }
  }

  if (isConfirmed && isRunning) {
    setIsRunning(false)
    setLastTxHash(null)
  }

  return (
    <div className="terminal-bg rounded-xl p-6 border-2 border-cyan-400 relative overflow-hidden">
      {/* 80s scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none"></div>
      
      <div className="flex flex-col items-center space-y-4 relative z-10">
        <div className="text-7xl neon-glow" style={{ filter: 'drop-shadow(0 0 10px currentColor)' }}>
          {BOAT_EMOJIS[currentLevel]}
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-cyan-400 neon-text" style={{ fontFamily: 'Orbitron, monospace' }}>
            {BOAT_NAMES[currentLevel].toUpperCase()} #{tokenId}
          </h3>
          <p className="text-pink-400 font-semibold" style={{ fontFamily: 'Rajdhani, monospace' }}>
            LVL {currentLevel} • {currentLevel === 4 ? 'MAX SPEED' : 'UPGRADE READY'}
          </p>
        </div>

        {/* Token Selector Dropdown */}
        <div className="w-full">
          <label className="block text-cyan-400 text-sm font-bold mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
            PAYLOAD TYPE
          </label>
          <select
            value={cardSelectedToken}
            onChange={(e) => {
              setCardSelectedToken(e.target.value)
              setPlayAmount(GAME_CONFIGS[e.target.value].minStake)
            }}
            className="w-full px-4 py-3 terminal-bg border-2 border-pink-500 rounded-lg text-cyan-400 font-bold focus:outline-none focus:border-cyan-400 neon-glow"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            <option value="BOAT" className="bg-gray-900">🚤 $BOAT (5K-50K)</option>
            <option value="JOINT" className="bg-gray-900">🌿 $JOINT (7.8K-78K)</option>
          </select>
        </div>

        {isOnCooldown && (
          <div className="w-full border border-yellow-400 rounded-lg p-3 bg-yellow-900/20">
            <div className="flex justify-between text-xs text-yellow-400 font-bold mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
              <span>HEAT COOLDOWN</span>
              <span>{formattedTime}</span>
            </div>
            <div className="w-full bg-black border border-yellow-400 rounded-full h-3">
              <div 
                className="warning-gradient h-3 rounded-full transition-all duration-1000 neon-glow"
                style={{ 
                  width: Math.max(0, 100 - (timeLeft / cooldownDuration) * 100) + '%'
                }}
              ></div>
            </div>
          </div>
        )}

        {!isMaxLevel && (
          <div className="w-full text-center space-y-3 border border-yellow-400 rounded-lg p-4 bg-yellow-900/20">
            <div className="text-yellow-400 text-sm font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
              UPGRADE COST: {upgradeCost ? formatTokenAmount(upgradeCost, 0) : '...'} $BOAT
            </div>
            {/* Upgrade benefits preview */}
            <div className="text-left text-xs bg-black/30 border border-yellow-400/40 rounded p-2">
              <div className="text-cyan-300 font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
                Next level gains
              </div>
              <div className="mt-1 text-cyan-200">
                Success: {levelCfg.successRate}% → {nextCfg.successRate}%  •  Multiplier: {levelCfg.multiplier}x → {nextCfg.multiplier}x
              </div>
              {hasValidAmount && (
                <div className="mt-1">
                  <span className={`font-bold ${nextEvPct - evPct >= 0 ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'Orbitron, monospace' }}>
                    Change: {(nextEvPct - evPct) >= 0 ? '+' : ''}{(nextEvPct - evPct).toFixed(1)}%
                  </span>
                  <span className="text-cyan-300 ml-2">your chance at success</span>
                </div>
              )}
              {nextLevel === 4 && (
                <div className="mt-1 text-yellow-300">Bonus: 15% chance to spawn a free raft</div>
              )}
            </div>
            <button
              onClick={handleUpgrade}
              disabled={isPending || isApprovingUpgrade || isConfirming || isMaxLevel || (boatTokenBalance && upgradeCost && boatTokenBalance < upgradeCost && !needsUpgradeApproval)}
              className="w-full px-6 py-3 warning-gradient disabled:bg-gray-700 disabled:opacity-50 text-black font-bold rounded-lg transition-all duration-300 hover:neon-glow"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              {getUpgradeButtonText()}
            </button>
          </div>
        )}

        <div className="w-full space-y-4">
          <div className="text-center">
            <label className="text-cyan-400 text-sm font-bold block mb-3" style={{ fontFamily: 'Orbitron, monospace' }}>
              PLAY AMOUNT ({gameConfig.symbol})
            </label>
            <input
              type="number"
              value={playAmount}
              onChange={(e) => setPlayAmount(e.target.value)}
              min={gameConfig.minStake}
              max={gameConfig.maxStake}
              step="1000"
              className="w-full px-4 py-3 terminal-bg border-2 border-pink-500 rounded-lg text-center text-cyan-400 font-bold text-xl focus:outline-none focus:border-cyan-400 neon-glow"
              style={{ fontFamily: 'Orbitron, monospace' }}
            />
            {/* Preset buttons */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {['MIN','25%','50%','MAX'].map((lbl) => (
                <button
                  key={lbl}
                  onClick={() => {
                    const min = Number(gameConfig.minStake)
                    const max = Number(gameConfig.maxStake)
                    const snap = (v) => Math.max(min, Math.min(max, Math.round(v / 1000) * 1000))
                    let amount = min
                    if (lbl === 'MIN') amount = min
                    if (lbl === '25%') amount = min + 0.25 * (max - min)
                    if (lbl === '50%') amount = min + 0.5 * (max - min)
                    if (lbl === 'MAX') amount = max
                    setPlayAmount(String(snap(amount)))
                  }}
                  className="text-xs px-2 py-1 border border-cyan-500 rounded hover:bg-cyan-900/20"
                >{lbl}</button>
              ))}
            </div>
            <div className="text-xs text-pink-400 mt-1 font-semibold" style={{ fontFamily: 'Rajdhani, monospace' }}>
              Range: {formatInteger(gameConfig.minStake)} - {formatInteger(gameConfig.maxStake)} {gameConfig.symbol}
            </div>
            <div className="text-cyan-400 text-sm font-bold mt-2" style={{ fontFamily: 'Orbitron, monospace' }}>
              YOUR {gameConfig.symbol}: {tokenBalance ? formatTokenAmount(tokenBalance) : '0.00'}
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={isOnCooldown || isPending || isConfirming || isApproving || !hasValidAmount}
            className="w-full px-6 py-4 vice-button disabled:bg-gray-700 disabled:opacity-50 text-white font-bold text-lg transition-all duration-300"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            {getRunButtonText()}
          </button>

          {errorMsg && (
            <div className="mt-2 text-red-300 text-xs font-semibold border border-red-500/50 bg-red-900/20 rounded p-2">
              {errorMsg}
            </div>
          )}

          {/* Removed allowlist warning banner per request */}
          
          {!isOnCooldown && (
            <div className="text-center text-white opacity-60 text-xs mt-1">
              <span>10-minute cooldown | Play: {formatInteger(gameConfig.minStake)}-{formatInteger(gameConfig.maxStake)} {gameConfig.symbol}</span>
            </div>
          )}
        </div>

        <div className="text-center text-white opacity-80 text-sm">
          <div className="grid grid-cols-2 gap-4 text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>
            <div className="bg-green-900/30 rounded p-2 border border-green-500/50">
              <div className="text-green-400 font-bold">🎯 SUCCESS</div>
              <div className="text-green-300">
                {gameConfig.levels[currentLevel]?.successRate || 50}% chance
              </div>
              <div className="text-green-200 text-xs">
                Win {gameConfig.levels[currentLevel]?.multiplier || 1.5}x stake
              </div>
              {currentLevel === 4 && (
                <div className="text-yellow-300 text-xs mt-1 border-t border-green-500/30 pt-1">
                  🎁 15% chance to spawn bonus raft
                </div>
              )}
            </div>
            <div className="bg-red-900/30 rounded p-2 border border-red-500/50">
              <div className="text-red-400 font-bold">💥 FAILURE</div>
              <div className="text-red-300">
                {100 - (gameConfig.levels[currentLevel]?.successRate || 50)}% chance
              </div>
              <div className="text-red-200 text-xs">
                {currentLevel === 1 ? 'Boat destroyed' : 'Downgrade to Lvl ' + (currentLevel - 1)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
