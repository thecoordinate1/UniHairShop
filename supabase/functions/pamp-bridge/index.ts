// PAMP's server calls this to link a PAMP account to a UniHair account and to
// move points to PAMP. See handler.ts and the "PAMP points link" section of
// supabase_schema.sql.
//
// Deploy with the gateway's JWT check OFF: PAMP's server is not a UniHair user,
// and every request is checked against its signature instead.
//   supabase functions deploy pamp-bridge --no-verify-jwt --project-ref mswbdibtcnilsvxxtrdy
// Secret (Dashboard > Edge Functions > Secrets, the same value as PAMP's):
//   POINTS_BRIDGE_SECRET  at least 32 characters. Until it is set, every request
//                         is answered "not_configured".
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are already provided automatically.
import { handleBridge } from './handler.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SECRET = Deno.env.get('POINTS_BRIDGE_SECRET') ?? '';

async function rpc(fn: string, args: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${fn} answered ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

Deno.serve(async (req) => {
  try {
    return await handleBridge(req, { secret: SECRET, rpc });
  } catch (err) {
    // A 5xx tells PAMP the outcome is unknown, so it checks again later
    // rather than assuming anything.
    console.error('pamp-bridge failed', err);
    return new Response(JSON.stringify({ ok: false, error: 'error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});
