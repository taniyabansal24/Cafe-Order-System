// lib/dateUtils.js
/**
 * Ensures correct timestamp generation for MongoDB
 * Fixes the issue with dates showing in 2025
 */
export const getCurrentTimestamp = () => {
  return new Date();
};

/**
 * Creates a timestamp for TTL expiration (current time + minutes)
 */
export const getTTLTimestamp = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Validates if a timestamp is reasonable (not in distant future/past)
 */
export const isValidTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  
  return date > oneYearAgo && date < oneYearFromNow;
};

/**
 * Fixes incorrect timestamps in documents
 */
export const fixTimestamp = (timestamp) => {
  if (!isValidTimestamp(timestamp)) {
    console.warn('Invalid timestamp detected, fixing to current time');
    return new Date();
  }
  return new Date(timestamp);
};