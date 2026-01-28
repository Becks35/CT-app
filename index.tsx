
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for PWA Functionality with origin-mismatch protection
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // In framed environments (like AI Studio), we use a strictly relative path.
    // We also wrap it in a check to handle origin-related security exceptions gracefully.
    const swPath = 'sw.js'; 
    
    navigator.serviceWorker.register(swPath)
      .then(registration => {
        console.log('CT Portal SW registered with scope:', registration.scope);
      })
      .catch(error => {
        // If it's an origin mismatch error, we log it silently as it's a common environment restriction
        if (error.message && error.message.includes('origin')) {
          console.warn('Service Worker registration skipped: Origin restriction detected in this environment.');
        } else {
          console.error('CT Portal SW registration failed:', error);
        }
      });
  });
}
