import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register Service Worker for Android PWA and offline support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('Catharsis Matrix SW registered successfully:', reg.scope);
      })
      .catch((err) => {
        console.log('SW registration note:', err);
      });
  });
}

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