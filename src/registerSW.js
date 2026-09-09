export function registerSW(onUpdateCallback) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] ServiceWorker registered with scope:', registration.scope);

          // Check for service worker updates
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New content is available; please refresh.');
                  if (typeof onUpdateCallback === 'function') {
                    onUpdateCallback();
                  }
                  window.dispatchEvent(new CustomEvent('unihair:update-available'));
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('[PWA] ServiceWorker registration failed:', error);
        });
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('[PWA] Device back online.');
      window.dispatchEvent(new CustomEvent('app-connection-change', { detail: { online: true } }));
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] Device currently offline. Using cached assets.');
      window.dispatchEvent(new CustomEvent('app-connection-change', { detail: { online: false } }));
    });
  }
}
