// lib/timeUtils.js

/**
 * Format date and time based on elapsed time
 * Shows time if less than 24 hours, shows date if 24 hours or more
 * @param {string|Date} dateString - The date to format
 * @param {string} timezone - Timezone to use (default: 'Asia/Kolkata')
 * @returns {string} Formatted time or date
 */
export const getTimeElapsed = (dateString, timezone = 'Asia/Kolkata') => {
  const created = new Date(dateString);
  const now = new Date();
  
  // Calculate time difference in the same timezone context
  const diffMs = now - created;
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // If more than 24 hours, show the date
  if (diffDays >= 1) {
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
 * Format time only with proper timezone handling
 * @param {string|Date} dateString - The date to format
 * @param {string} timezone - Timezone to use (default: 'Asia/Kolkata')
 * @returns {string} Formatted time
 */
export const formatTimeOnly = (dateString, timezone = 'Asia/Kolkata') => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date and time in a consistent way
 * @param {string|Date} dateString - The date to format
 * @param {string} timezone - Timezone to use (default: 'Asia/Kolkata')
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (dateString, timezone = 'Asia/Kolkata') => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// ... rest of your functions remain the same