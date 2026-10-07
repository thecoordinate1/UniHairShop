import React, { useCallback, useEffect, useState } from 'react';
import { Link2, Copy, Check } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';

// Links this UniHair account to the person's PAMP account (PAMP: events in
// Zambia), so their UniHair points count towards PAMP passes. UniHair shows a
// code; the person types it into PAMP, which checks it with UniHair's
// pamp-bridge function. Points only move when they are used on PAMP.
//
// Self-contained on purpose: it reads and writes through two database functions
// (create_pamp_link_code, unlink_pamp) and the person's own profile row, and
// does not touch AppContext. Hidden until the schema's PAMP section is applied.

const formatCode = (code) => `${code.slice(0, 4)}-${code.slice(4)}`;

// Off unless VITE_PAMP_LINK_ENABLED=true at build time, so the schema can be
// applied before PAMP's side, the shared secret and pamp-bridge are all live.
// Switching on: set it in Vercel and redeploy.
const ENABLED = import.meta.env.VITE_PAMP_LINK_ENABLED === 'true';

export default function LinkPamp() {
  return ENABLED ? <LinkPampCard /> : null;
}

function LinkPampCard() {
  const { user } = useApp();
  const [status, setStatus] = useState({ ready: false, linked: false });
  const [issued, setIssued] = useState(null); // { code, expiresAt }
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user?.id) return;
    const { data, error: readError } = await supabase
      .from('profiles')
      .select('pamp_user_id')
      .eq('id', user.id)
      .maybeSingle();
    // An error here most likely means the column does not exist yet: stay hidden.
    if (readError) return;
    const linked = Boolean(data?.pamp_user_id);
    setStatus({ ready: true, linked });
    if (linked) setIssued(null);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // While a code is showing: tick the countdown, and check every few seconds
  // whether PAMP has used it, so the card turns to "Linked" by itself.
  useEffect(() => {
    if (!issued) return undefined;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(refresh, 5000);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [issued, refresh]);

  if (!status.ready) return null;

  const secondsLeft = issued ? Math.max(0, Math.round((issued.expiresAt - now) / 1000)) : 0;
  const expired = issued && secondsLeft === 0;

  const getCode = async () => {
    setBusy(true);
    setError('');
    const { data, error: rpcError } = await supabase.rpc('create_pamp_link_code');
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message || 'Could not get a code. Try again.');
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    setIssued({ code: row.code, expiresAt: Date.parse(row.expires_at) });
    setNow(Date.now());
    setCopied(false);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(formatCode(issued.code));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const unlink = async () => {
    setBusy(true);
    setError('');
    const { error: rpcError } = await supabase.rpc('unlink_pamp');
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message || 'Could not unlink. Try again.');
      return;
    }
    setConfirmUnlink(false);
    refresh();
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-2">
        <Link2 size={18} className="text-amber-500" />
        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0">
          {status.linked ? 'Linked to PAMP' : 'Use your points on PAMP'}
        </h4>
      </div>

      {status.linked ? (
        <>
          <p className="text-xs text-slate-600 dark:text-slate-300 m-0">
            Your UniHair points count towards PAMP event passes. Points move to PAMP only when you use them there,
            and stay in PAMP after that.
          </p>
          {confirmUnlink ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Unlink? Points already used on PAMP stay there.
              </span>
              <button type="button" onClick={unlink} disabled={busy} className="apple-btn-secondary text-xs py-2 px-3">
                {busy ? 'Unlinking…' : 'Yes, unlink'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmUnlink(false)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Keep it
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmUnlink(true)}
              className="mt-3 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Unlink PAMP
            </button>
          )}
        </>
      ) : issued && !expired ? (
        <>
          <p className="text-xs text-slate-600 dark:text-slate-300 m-0">
            In PAMP, open your profile and enter this code under <strong>UniHair points</strong>.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-extrabold font-mono tracking-widest text-amber-500 select-all">
              {formatCode(issued.code)}
            </span>
            <button type="button" onClick={copyCode} className="apple-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 m-0 mt-2" aria-live="polite">
            Works once, for {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')} more.
            This page updates when PAMP uses it.
          </p>
        </>
      ) : (
        <>
          <p className="text-xs text-slate-600 dark:text-slate-300 m-0">
            Got a PAMP account for events? Link it and your UniHair points take money off PAMP passes.
            {expired && ' Your last code ran out. Get a new one.'}
          </p>
          <button
            type="button"
            onClick={getCode}
            disabled={busy}
            className="apple-btn-primary mt-3 text-xs py-2.5 px-4"
          >
            {busy ? 'Getting a code…' : 'Get a link code'}
          </button>
        </>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-500 m-0 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
