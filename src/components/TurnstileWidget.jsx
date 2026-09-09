import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const TURNSTILE_SCRIPT_URL = 'https://challenge.cloudflare.com/turnstile/v0/api.js';
let scriptLoadPromise = null;

function loadTurnstileScript() {
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise((resolve, reject) => {
    if (window.turnstile) { resolve(window.turnstile); return; }
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error('Failed to load Turnstile'));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

// Renders nothing at all when VITE_TURNSTILE_SITE_KEY isn't set — signup/
// signin/password-reset work exactly as before until this is configured.
// Once a site key IS set, exposes reset() via ref so a form can request a
// fresh token after a failed attempt (Turnstile tokens are single-use).
const TurnstileWidget = forwardRef(function TurnstileWidget({ onVerify }, ref) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
      }
    }
  }));

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;
    loadTurnstileScript().then((turnstile) => {
      if (cancelled || !containerRef.current || widgetIdRef.current) return;
      widgetIdRef.current = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onVerify(token),
        'expired-callback': () => onVerify(''),
        'error-callback': () => onVerify('')
      });
    }).catch(() => {});

    return () => {
      cancelled = true;
      if (window.turnstile && widgetIdRef.current) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={containerRef} className="my-1" />;
});

export default TurnstileWidget;
