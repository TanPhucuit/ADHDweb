/**
 * Utility functions for Vietnam timezone (GMT+7)
 */

/**
 * Get current time in Vietnam timezone as ISO string
 */
export function getVietnamTime(): string {
  const now = new Date()
  
  // Convert to Vietnam time (GMT+7)
  // Get UTC time in milliseconds and add 7 hours
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
  
  return vietnamTime.toISOString()
}

/**
 * Get current date in Vietnam timezone as YYYY-MM-DD
 */
export function getVietnamDate(): string {
  return getVietnamTime().split('T')[0]
}

/**
 * Get current time in Vietnam timezone as formatted string
 */
export function getVietnamTimeFormatted(): string {
  const vietnamTime = new Date(getVietnamTime())
  return vietnamTime.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

/**
 * Convert any date to Vietnam timezone ISO string
 */
export function toVietnamTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const vietnamTime = new Date(d.getTime() + (7 * 60 * 60 * 1000))
  return vietnamTime.toISOString()
}
