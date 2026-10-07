// What PAMP's server may ask UniHair, and nothing else: link an account with a
// code, read a linked account's balance, debit points it is moving to PAMP,
// check whether an earlier debit happened, or unlink. Every request must carry
// a signature made with POINTS_BRIDGE_SECRET, which only the two apps' servers
// hold. The real rules (codes, throttles, overdrafts, refs) live in the
// pamp_bridge_* database functions in supabase_schema.sql.
//
// Nothing here adds points to UniHair, so even a leaked secret cannot create
// UniHair points; it could only move a linked account's points to PAMP.

export const SIGNATURE_HEADER = 'x-bridge-signature';
export const MAX_SKEW_SECONDS = 300;
const MAX_BODY_BYTES = 8 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// --- Signatures (the same scheme as PAMP's supabase/functions/_shared/bridge.ts)

const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
}

// HMAC-SHA256 over "<unix seconds>.<body>", sent as "t=<seconds>,v1=<hex>".
export async function verifyBridgeRequest(
  body: string,
  header: string | null,
  secret: string,
  nowSeconds: number
): Promise<boolean> {
  if (!header || !secret || secret.length < 32) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    })
  );
  const t = Number(parts.t);
  if (!Number.isInteger(t) || Math.abs(nowSeconds - t) > MAX_SKEW_SECONDS) return false;
  if (typeof parts.v1 !== 'string') return false;
  return safeEqual(parts.v1.toLowerCase(), await hmac(secret, `${t}.${body}`));
}

// --- Handler ------------------------------------------------------------------

// Calls a database function as the service role and returns its rows.
export type Rpc = (fn: string, args: Record<string, unknown>) => Promise<any>;

const reply = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

// A database "no" becomes a 409 that PAMP shows the person; a malformed request
// a 400. Both are definite answers, unlike a 5xx, which PAMP retries later.
const refuse = (outcome: string) => reply(outcome === 'bad_request' ? 400 : 409, { ok: false, error: outcome });

const firstRow = (rows: unknown) => (Array.isArray(rows) ? rows[0] : rows) ?? {};

export async function handleBridge(
  req: Request,
  { secret, rpc, now = () => Math.floor(Date.now() / 1000) }: { secret: string; rpc: Rpc; now?: () => number }
): Promise<Response> {
  if (req.method !== 'POST') return reply(405, { ok: false, error: 'method_not_allowed' });
  if (secret.length < 32) return reply(503, { ok: false, error: 'not_configured' });

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return reply(413, { ok: false, error: 'too_large' });
  // Checked before anything is parsed or looked up.
  if (!(await verifyBridgeRequest(raw, req.headers.get(SIGNATURE_HEADER), secret, now()))) {
    return reply(401, { ok: false, error: 'bad_signature' });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return refuse('bad_request');
  }
  const uuid = (v: unknown) => typeof v === 'string' && UUID.test(v);

  switch (body.action) {
    case 'claim': {
      if (typeof body.code !== 'string' || !uuid(body.pamp_user)) return refuse('bad_request');
      const row = firstRow(await rpc('pamp_bridge_claim', { p_code: body.code, p_pamp_user: body.pamp_user }));
      if (row.outcome !== 'ok') return refuse(row.outcome ?? 'bad_request');
      return reply(200, { ok: true, profile_id: row.profile_id, name: row.name ?? '' });
    }

    case 'balance': {
      if (!uuid(body.profile_id) || !uuid(body.pamp_user)) return refuse('bad_request');
      const row = firstRow(
        await rpc('pamp_bridge_balance', { p_profile: body.profile_id, p_pamp_user: body.pamp_user })
      );
      if (row.outcome !== 'ok') return refuse(row.outcome ?? 'bad_request');
      // transferable: how many may move to PAMP (earned points only, see
      // pamp_transferable). balance: everything the account holds in UniHair.
      return reply(200, {
        ok: true,
        balance: row.balance,
        transferable: row.transferable,
        point_value_ngwee: row.point_value_ngwee,
      });
    }

    case 'take': {
      const { profile_id, pamp_user, points, ref, issued_at } = body;
      if (!uuid(profile_id) || !uuid(pamp_user) || !uuid(ref)) return refuse('bad_request');
      if (typeof points !== 'number' || !Number.isInteger(points)) return refuse('bad_request');
      if (typeof issued_at !== 'string' || Number.isNaN(Date.parse(issued_at))) return refuse('bad_request');
      const row = firstRow(
        await rpc('pamp_bridge_take', {
          p_profile: profile_id,
          p_pamp_user: pamp_user,
          p_points: points,
          p_ref: ref,
          p_issued_at: issued_at,
        })
      );
      if (row.outcome !== 'ok') return refuse(row.outcome ?? 'bad_request');
      // How many may still move to PAMP after this debit.
      return reply(200, { ok: true, balance: row.balance });
    }

    case 'check': {
      if (!uuid(body.ref)) return refuse('bad_request');
      const row = firstRow(await rpc('pamp_bridge_check', { p_ref: body.ref }));
      return reply(200, { ok: true, taken: row.taken === true, points: row.points ?? null });
    }

    case 'unlink': {
      if (!uuid(body.profile_id) || !uuid(body.pamp_user)) return refuse('bad_request');
      await rpc('pamp_bridge_unlink', { p_profile: body.profile_id, p_pamp_user: body.pamp_user });
      return reply(200, { ok: true });
    }

    default:
      return refuse('bad_request');
  }
}
