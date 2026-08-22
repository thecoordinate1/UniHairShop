import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { registerSW } from './registerSW.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

// Dismiss splash screen after app has mounted
const splash = document.getElementById('app-splash');
if (splash) {
  // Small delay so the user actually sees the splash (min 600ms total)
  const minShowTime = 600;
  const start = performance.timing?.navigationStart || performance.timeOrigin;
  const elapsed = Date.now() - start;
  const remaining = Math.max(0, minShowTime - elapsed);

  setTimeout(() => {
    splash.classList.add('splash-hide');
    splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    // Fallback removal if transitionend doesn't fire
    setTimeout(() => { if (splash.parentNode) splash.remove(); }, 600);
  }, remaining);
}

registerSW();

