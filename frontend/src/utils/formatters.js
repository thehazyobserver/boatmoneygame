import { formatEther } from 'viem'

/**
 * Format a number with commas for better readability
 * @param {number|string} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number with commas
 */
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined || num === '') return '0'
  
  const number = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(number)) return '0'
  
  return number.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Format a Wei value (BigInt) to readable token amount with commas
 * @param {BigInt} weiValue - The Wei value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted token amount with commas
 */
export function formatTokenAmount(weiValue, decimals = 2) {
  if (!weiValue) return '0.00'
  
  const etherValue = parseFloat(formatEther(weiValue))
  return formatNumber(etherValue, decimals)
}

/**
 * Format a number with K/M abbreviations and commas
 * @param {number|string|BigInt} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted number with K/M and commas
 */
export function formatCompactNumber(value, decimals = 1) {
  if (value === null || value === undefined) return '0'
  
  let num
  if (typeof value === 'bigint') {
    num = parseFloat(formatEther(value))
  } else if (typeof value === 'string') {
    num = parseFloat(value)
  } else {
    num = value
  }
  
  if (isNaN(num)) return '0'
  
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
