import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// What kind of auth email link opened this page ('recovery', 'signup', ...), read
// before createClient below: supabase-js consumes and clears the URL hash during
// its own async startup, so anything reading it later (a React effect) can lose
// the race and treat a password-reset link as a plain sign-in.
export const initialAuthLinkType = (() => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  return params.get('access_token') ? params.get('type') : null;
})();

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

// A raw fetch-layer failure (Safari: "Load failed", Chrome: "Failed to fetch") means the
// request never reached Supabase at all -- almost always a transient mobile-network drop,
// not anything wrong with the account -- so it's worth one silent retry before surfacing an
// error, and the error shown should be plain-English rather than the browser's internal string.
function isNetworkError(err) {
  const msg = (err?.message || '').toLowerCase();
  return msg.includes('load failed') || msg.includes('failed to fetch') || msg.includes('network');
}

export async function resetPasswordForEmailWithRetry(email, options) {
  if (!supabase) return { error: null };
  let { error } = await supabase.auth.resetPasswordForEmail(email, options);
  if (error && isNetworkError(error)) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    ({ error } = await supabase.auth.resetPasswordForEmail(email, options));
  }
  if (error && isNetworkError(error)) {
    return { error: new Error('Could not reach the server. Check your connection and try again.') };
  }
  return { error };
}
