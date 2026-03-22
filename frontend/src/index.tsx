import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';


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
  }
 // originalLog(...args);
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
