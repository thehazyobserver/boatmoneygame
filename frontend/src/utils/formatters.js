import { formatEther } from 'viem'

/**
 * Format a number with commas for better readability
 * @param {number|string} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number with commas
 */
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined || num === '') return '0'
  
  try {
    const number = typeof num === 'string' ? parseFloat(num) : Number(num)
    if (isNaN(number) || !isFinite(number)) return '0'
    
    return number.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  } catch (error) {
    console.warn('formatNumber: Error processing value', num, error)
    return '0'
  }
}

/**
 * Format a Wei value (BigInt) to readable token amount with commas
 * @param {BigInt} weiValue - The Wei value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted token amount with commas
 */
export function formatTokenAmount(weiValue, decimals = 2) {
  if (!weiValue || weiValue === 0n) return '0.00'
  
  try {
    const etherValue = parseFloat(formatEther(weiValue))
    if (isNaN(etherValue) || !isFinite(etherValue)) return '0.00'
    return formatNumber(etherValue, decimals)
  } catch (error) {
    console.warn('formatTokenAmount: Error processing value', weiValue, error)
    return '0.00'
  }
}

/**
 * Format a number with K/M abbreviations and commas
 * @param {number|string|BigInt} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted number with K/M and commas
 */
export function formatCompactNumber(value, decimals = 1) {
  if (value === null || value === undefined || value === '') return '0'
  
  let num
  try {
    if (typeof value === 'bigint') {
      num = parseFloat(formatEther(value))
    } else if (typeof value === 'string') {
      if (value === '') return '0'
      num = parseFloat(value)
    } else if (typeof value === 'object' && value !== null) {
      // Handle case where value might be an object with toString method
      const strValue = value.toString()
      if (strValue === '') return '0'
      num = parseFloat(strValue)
    } else {
      num = Number(value)
    }
  } catch (error) {
    console.warn('formatCompactNumber: Error processing value', value, error)
    return '0'
  }
  
  if (isNaN(num) || !isFinite(num)) return '0'
  
  if (num >= 1000000) {
    return `${formatNumber(num / 1000000, decimals)}M`
  }
  if (num >= 1000) {
    return `${formatNumber(num / 1000, decimals)}K`
  }
  
  return formatNumber(num, decimals)
}

/**
 * Format percentage with one decimal place
 * @param {number} value - The percentage value
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value) {
  if (value === null || value === undefined || isNaN(value)) return '0.0%'
  return `${formatNumber(value, 1)}%`
}

/**
 * Format integer with commas (no decimal places)
 * @param {number|string} num - The number to format
 * @returns {string} Formatted integer with commas
 */
export function formatInteger(num) {
  return formatNumber(num, 0)
}
