// Optional remote error monitoring via Sentry's browser CDN bundle — no npm
// dependency, so it costs nothing in the main bundle and never makes a
// network request at all unless VITE_SENTRY_DSN is actually set. Sign up for
// a free Sentry project, then set VITE_SENTRY_DSN in your deployment env to
// activate this; until then, initErrorMonitoring()/captureError() are no-ops
// and ErrorBoundary keeps working exactly as before (console.error only).
const SENTRY_CDN_URL = 'https://browser.sentry-cdn.com/8.42.0/bundle.min.js';

let loadPromise = null;

function loadSentryScript() {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') { reject(new Error('no window')); return; }
    if (window.Sentry) { resolve(window.Sentry); return; }
    const script = document.createElement('script');
    script.src = SENTRY_CDN_URL;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve(window.Sentry);
    script.onerror = () => reject(new Error('Failed to load Sentry script'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export async function initErrorMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;
  try {
    const Sentry = await loadSentryScript();
    Sentry.init({ dsn, environment: import.meta.env.MODE, tracesSampleRate: 0 });

    // ErrorBoundary only ever sees render-phase errors — an unhandled promise
    // rejection or an error thrown inside an event handler (both common with
    // this app's fire-and-forget Supabase calls) would otherwise vanish
    // silently in production.
    window.addEventListener('error', (e) => captureError(e.error || e.message));
    window.addEventListener('unhandledrejection', (e) => captureError(e.reason));
  } catch {
    // Monitoring itself must never be why the app breaks.
  }
}

export function captureError(error, extra) {
  try {
    window.Sentry?.captureException(error, extra ? { extra } : undefined);
  } catch {
    /* ignore */
  }
}
