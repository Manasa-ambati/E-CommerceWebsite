import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// CACHE FIX: Unregister Service Worker to prevent stale content on Railway
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Unregister any existing service workers
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('✅ Service Worker unregistered:', registration.scope);
      });
    });
  });
}

// CACHE FIX: Version-based auto-refresh for new deployments
const APP_VERSION = 'v2.0.1'; // Increment this on each deployment

window.addEventListener('load', () => {
  const oldVersion = localStorage.getItem('app_version');
  
  if (oldVersion && oldVersion !== APP_VERSION) {
    console.log(`🔄 New version detected: ${oldVersion} → ${APP_VERSION}`);
    console.log('🗑️ Clearing cache and reloading...');
    
    // Clear all caches
    localStorage.removeItem('app_version');
    localStorage.removeItem('guest_cart');
    localStorage.removeItem('recently_removed_items');
    
    // Force hard reload
    window.location.reload();
  } else {
    localStorage.setItem('app_version', APP_VERSION);
    console.log(`✅ App version: ${APP_VERSION}`);
  }
});

// PERFORMANCE: Resource Timing API to monitor load times
window.addEventListener('load', () => {
  setTimeout(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const cssResources = resources.filter(r => r.name.includes('.css'));
    const jsResources = resources.filter(r => r.name.includes('.js'));
    
    console.group('⚡ Performance Report');
    console.log('📊 Total Resources Loaded:', resources.length);
    console.log('💅 CSS Files:', cssResources.length, '- Avg:', 
      (cssResources.reduce((sum, r) => sum + r.duration, 0) / (cssResources.length || 1)).toFixed(2), 'ms');
    console.log('🔧 JS Files:', jsResources.length, '- Avg:', 
      (jsResources.reduce((sum, r) => sum + r.duration, 0) / (jsResources.length || 1)).toFixed(2), 'ms');
    console.log('⏱️ Page Load Time:', performance.timing.loadEventEnd - performance.timing.navigationStart, 'ms');
    console.groupEnd();
  }, 100);
});


// Suppress WebSocket connection errors in development
if (process.env.NODE_ENV === 'development') {
 const originalError = console.error;
 const errorCache = new Set();

console.error = (...args) => {
 const message = args.join(' ');
  // Filter out WebSocket errors
 if (message.includes('WebSocket') || 
     message.includes('Invalid frame header') ||
     message.includes('WS') ||
     message.includes('[WDS]')) {
 const hash = message.substring(0, 100);
  if (errorCache.has(hash)) return;
   errorCache.add(hash);
  setTimeout(() => errorCache.delete(hash), 10000);
return; // Don't log WebSocket errors at all
  }
  originalError(...args);
 };

const originalLog = console.log;
 const logCache = new Set();

console.log = (...args) => {
 const message = args.join(' ');
  // Skip duplicate WDS (Webpack Dev Server) logs
 if (message.includes('[WDS]') || message.includes('WebSocket')) {
 const hash = message.substring(0, 50);
  if (logCache.has(hash)) return;
logCache.add(hash);
  setTimeout(() => logCache.delete(hash), 5000);
  originalLog(...args); // Actually call the original logger
 }
};

 // Prevent ESC key from causing page refresh/blinking
 document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
 e.preventDefault();
 e.stopPropagation();
  }
 }, true);
}

// Temporarily disable StrictMode to fix auth check timing issue
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
