// Utility functions for managing localStorage

/**
 * Clear all application data from localStorage
 * This will clear all stores except language preferences
 * Known storage keys:
 * - raw-material-storage
 * - processed-raw-material-storage
 * - language-storage (kept)
 * - Any other keys will also be cleared
 */
export function clearAllStorage() {
  const keysToKeep = ['language-storage']; // Keep language preference
  
  // Known storage keys to clear
  const knownKeys = [
    'raw-material-storage',
    'processed-raw-material-storage',
    'product-storage',
    'customer-storage',
  ];
  
  // Clear known keys
  knownKeys.forEach((key) => {
    localStorage.removeItem(key);
  });
  
  // Get all remaining localStorage keys and clear them (except keys to keep)
  const allKeys = Object.keys(localStorage);
  allKeys.forEach((key) => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  
  // Reload the page to reset all stores
  window.location.reload();
}

/**
 * Clear all storage including auth and language
 */
export function clearAllStorageIncludingAuth() {
  localStorage.clear();
  window.location.reload();
}

