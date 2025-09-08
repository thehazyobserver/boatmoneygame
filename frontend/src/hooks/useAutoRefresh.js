import { useEffect } from 'react'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { contracts } from '../config/contracts'

/**
 * Hook to automatically refresh data when blockchain events occur
 * This eliminates the need to refresh the page to see new NFTs or approval changes
 */
export function useAutoRefresh() {
  const { address } = useAccount()
  const queryClient = useQueryClient()

  // Helper function to invalidate ALL relevant queries aggressively
  const invalidateQueries = (eventType = 'general') => {
    console.log(`🔄 Auto-refresh triggered by: ${eventType}`)
    
    // Balance and allowance queries
    queryClient.invalidateQueries({ queryKey: ['balance'] })
    queryClient.invalidateQueries({ queryKey: ['allowance'] })
    queryClient.invalidateQueries({ queryKey: ['balanceOf'] })
    queryClient.invalidateQueries({ queryKey: ['readContract'] })
    
    // NFT related queries
    queryClient.invalidateQueries({ queryKey: ['boatCount'] })
    queryClient.invalidateQueries({ queryKey: ['tokenOfOwnerByIndex'] })
    queryClient.invalidateQueries({ queryKey: ['levelOf'] })
    queryClient.invalidateQueries({ queryKey: ['ownerOf'] })
    
    // Game state queries
    queryClient.invalidateQueries({ queryKey: ['lastRunAt'] })
    queryClient.invalidateQueries({ queryKey: ['cooldown'] })
    queryClient.invalidateQueries({ queryKey: ['stats'] })
    queryClient.invalidateQueries({ queryKey: ['poolBalance'] })
    
    // Force refetch all queries immediately
    queryClient.refetchQueries({ stale: true })
    
    // Additional aggressive refresh after delay
    setTimeout(() => {
      queryClient.invalidateQueries()
      queryClient.refetchQueries()
      console.log('🔄 Secondary refresh completed')
    }, 2000)
  }

  // Watch for new raft purchases (BOAT game)
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'RaftBought',
    onLogs(logs) {
      logs.forEach((log) => {
        const { user } = log.args || {}
        // Refresh data if this user bought a raft
        if (user?.toLowerCase() === address?.toLowerCase()) {
          console.log('🚤 New raft bought! Refreshing all data...')
          invalidateQueries('raft-purchase')
        }
      })
    }
  })

  // Watch for bonus raft spawns from yacht runs (BOAT game)
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'RaftSpawned',
    onLogs(logs) {
      logs.forEach((log) => {
        const { to } = log.args || {}
        // Refresh data if this user got a bonus raft
        if (to?.toLowerCase() === address?.toLowerCase()) {
          console.log('🎁 Bonus raft spawned! Refreshing all data...')
          invalidateQueries('bonus-raft')
        }
      })
    }
  })

  // Watch for boat upgrades (BOAT game)
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'Upgraded',
    onLogs(logs) {
      logs.forEach((log) => {
        const { user } = log.args || {}
        // Refresh data if this user upgraded a boat
        if (user?.toLowerCase() === address?.toLowerCase()) {
          console.log('⬆️ Boat upgraded! Refreshing boat gallery...')
          invalidateQueries()
        }
      })
    }
  })

  // Watch for boat burns (BOAT game)
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'BoatBurned',
    onLogs(logs) {
      logs.forEach((log) => {
        // Always refresh on boat burns as we need to check ownership
        console.log('🔥 Boat burned! Refreshing boat gallery...')
        invalidateQueries()
      })
    }
  })

  // Watch for boat downgrades (BOAT game)
  useWatchContractEvent({
    ...contracts.boatGame,
    eventName: 'BoatDowngraded',
    onLogs(logs) {
      logs.forEach((log) => {
        // Always refresh on boat downgrades as levels changed
        console.log('⬇️ Boat downgraded! Refreshing boat gallery...')
        invalidateQueries()
      })
    }
  })

  // Watch for JOINT game boat burns
  useWatchContractEvent({
    ...contracts.jointBoatGame,
    eventName: 'BoatBurned',
    onLogs(logs) {
      logs.forEach((log) => {
        console.log('🔥 Boat burned in JOINT game! Refreshing boat gallery...')
        invalidateQueries()
      })
    }
  })

  // Watch for JOINT game boat downgrades
  useWatchContractEvent({
    ...contracts.jointBoatGame,
    eventName: 'BoatDowngraded',
    onLogs(logs) {
      logs.forEach((log) => {
        console.log('⬇️ Boat downgraded in JOINT game! Refreshing boat gallery...')
        invalidateQueries()
      })
    }
  })

  // Watch for token approvals (BOAT token)
  useWatchContractEvent({
    address: contracts.boatToken.address,
    abi: contracts.boatToken.abi,
    eventName: 'Approval',
    onLogs(logs) {
      logs.forEach((log) => {
        const { owner, spender } = log.args || {}
        // Refresh allowance data if this user approved tokens
        if (owner?.toLowerCase() === address?.toLowerCase() && 
            (spender?.toLowerCase() === contracts.boatGame.address?.toLowerCase() ||
             spender?.toLowerCase() === contracts.jointBoatGame.address?.toLowerCase())) {
          console.log('✅ BOAT token approval updated! Refreshing allowance...')
          queryClient.invalidateQueries({ queryKey: ['allowance'] })
        }
      })
    }
  })

  // Watch for token approvals (JOINT token) - if it exists
  useWatchContractEvent({
    address: contracts.jointToken?.address,
    abi: contracts.jointToken?.abi,
    eventName: 'Approval',
    onLogs(logs) {
      logs.forEach((log) => {
        const { owner, spender } = log.args || {}
        // Refresh allowance data if this user approved JOINT tokens
        if (owner?.toLowerCase() === address?.toLowerCase() && 
            spender?.toLowerCase() === contracts.jointBoatGame.address?.toLowerCase()) {
          console.log('✅ JOINT token approval updated! Refreshing allowance...')
          queryClient.invalidateQueries({ queryKey: ['allowance'] })
        }
      })
    },
    query: { enabled: !!contracts.jointToken?.address }
  })

  // Watch for token transfers to detect balance changes (BOAT token)
  useWatchContractEvent({
    address: contracts.boatToken.address,
    abi: contracts.boatToken.abi,
    eventName: 'Transfer',
    onLogs(logs) {
      logs.forEach((log) => {
        const { from, to } = log.args || {}
        // Refresh balance if this user sent or received BOAT tokens
        if (from?.toLowerCase() === address?.toLowerCase() || 
            to?.toLowerCase() === address?.toLowerCase()) {
          console.log('💰 BOAT balance changed! Refreshing balance...')
          queryClient.invalidateQueries({ queryKey: ['balance'] })
          queryClient.invalidateQueries({ queryKey: ['balanceOf'] })
        }
      })
    }
  })

  // Watch for token transfers to detect balance changes (JOINT token) - if it exists
  useWatchContractEvent({
    address: contracts.jointToken?.address,
    abi: contracts.jointToken?.abi,
    eventName: 'Transfer',
    onLogs(logs) {
      logs.forEach((log) => {
        const { from, to } = log.args || {}
        // Refresh balance if this user sent or received JOINT tokens
        if (from?.toLowerCase() === address?.toLowerCase() || 
            to?.toLowerCase() === address?.toLowerCase()) {
          console.log('💰 JOINT balance changed! Refreshing balance...')
          queryClient.invalidateQueries({ queryKey: ['balance'] })
          queryClient.invalidateQueries({ queryKey: ['balanceOf'] })
        }
      })
    },
    query: { enabled: !!contracts.jointToken?.address }
  })

  // Also add a periodic refresh as backup (every 30 seconds)
  useEffect(() => {
    if (!address) return

    const interval = setInterval(() => {
      console.log('🔄 Periodic data refresh...')
      invalidateQueries()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [address, queryClient])

  return null // This hook doesn't render anything
}
