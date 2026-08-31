/**
 * Application Configuration
 * 
 * Centralized configuration constants for external integrations and services.
 */

// Budget Tracker Application URL
// Configured via environment variable VITE_BUDGET_TRACKER_URL with fallback to the live deployment.
export const BUDGET_TRACKER_URL: string = 
  import.meta.env.VITE_BUDGET_TRACKER_URL || 'https://cjaytracker.vercel.app';

// Mini Mart Application URL
// Configured via environment variable VITE_MINI_MART_URL.
export const MINI_MART_URL: string =
  import.meta.env.VITE_MINI_MART_URL || '';

