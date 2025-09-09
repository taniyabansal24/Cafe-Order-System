// lib/timeUtils.js

/**
 * Format date and time based on elapsed time
 * Shows time if less than 24 hours, shows date if 24 hours or more
 * @param {string|Date} dateString - The date to format
 * @param {string} timezone - Timezone to use (default: UTC)
 * @returns {string} Formatted time or date
 */
export const getTimeElapsed = (dateString, timezone = 'UTC') => {
  const created = new Date(dateString);
  const now = new Date();
  
  // Use specified timezone for calculations
  const createdTime = created.toLocaleString('en-US', { timeZone: timezone });
  const nowTime = now.toLocaleString('en-US', { timeZone: timezone });
  
  const createdDate = new Date(createdTime);
  const nowDate = new Date(nowTime);
  
  const diffMs = nowDate - createdDate;
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  
  // If more than 24 hours, show the date
  if (diffHours >= 24) {
    return created.toLocaleDateString('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric'
    });
  }
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  
  return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
};

/**
 * Format date and time in a consistent way
 * @param {string|Date} dateString - The date to format
 * @param {string} timezone - Timezone to use (default: UTC)
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (dateString, timezone = 'UTC') => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format date only (for charts, reports, etc.)
 * @param {string|Date} dateString - The date to format
 * @param {string} timezone - Timezone to use (default: UTC)
 * @returns {string} Formatted date
 */
export const formatDateOnly = (dateString, timezone = 'UTC') => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format time only
 * @param {string|Date} dateString - The date to format
 * @param {string} timezone - Timezone to use (default: UTC)
 * @returns {string} Formatted time
 */
export const formatTimeOnly = (dateString, timezone = 'UTC') => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Check if two dates are on the same day (for grouping)
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @param {string} timezone - Timezone to use (default: UTC)
 * @returns {boolean} True if same day
 */
export const isSameDay = (date1, date2, timezone = 'UTC') => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  const d1Formatted = d1.toLocaleDateString('en-US', { timeZone: timezone });
  const d2Formatted = d2.toLocaleDateString('en-US', { timeZone: timezone });
  
  return d1Formatted === d2Formatted;
};

// Default export with all functions
export default {
  getTimeElapsed,
  formatDateTime,
  formatDateOnly,
  formatTimeOnly,
  isSameDay
};