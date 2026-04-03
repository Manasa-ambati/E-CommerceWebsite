/**
 * Cache Busting Utility
 * Helps prevent caching issues during development
 */

// Add version/timestamp to all API requests
const CACHE_BUSTER = new Date().getTime();

// Function to get cache-busted URL
export function getCacheBustedUrl(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${CACHE_BUSTER}`;
}

// Function to clear all caches
export function clearAllCaches() {
  // Clear service worker cache
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        console.log('Clearing cache:', name);
        caches.delete(name);
      }
    });
  }
  
  // Force reload with no-cache
  window.location.reload(true);
}

// Register a message handler from service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'CACHED_RESOURCE') {
      console.log('Resource was served from cache:', event.data.url);
    }
  });
}

// Auto-clear cache on page load (development only)
// Uncomment this line during development if you want to auto-clear cache
// window.addEventListener('load', clearAllCaches);

console.log('🔄 Cache buster initialized:', CACHE_BUSTER);
