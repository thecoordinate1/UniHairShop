// Self-service account deletion. Real bookings, orders, reviews, and payment
// records reference this user's id via foreign keys and are kept for
// accounting/dispute history — so instead of a hard delete (which would
// either fail on those FKs or cascade-erase business records other people
// depend on, like a vendor's review history), this anonymizes every piece of
// personally-identifying data and then permanently bans the login itself via
// Supabase Auth's admin API, so the account can never be signed into again.
//
// Deploy: supabase functions deploy delete-account
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are already provided automatically.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

function serviceHeaders() {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json"
  };
}

async function getCallerId(authHeader: string | null) {
  if (!authHeader) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: authHeader }
  });
  if (!res.ok) return null;
  const user = await res.json();
  return user?.id || null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  const callerId = await getCallerId(req.headers.get("Authorization"));
  if (!callerId) {
    return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  }

  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${callerId}`, {
    method: "PATCH",
    headers: { ...serviceHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({
      name: "Deleted User",
      phone: null,
      hostel: null,
      email: null,
      is_suspended: true,
      suspended_reason: "Account deleted by user"
    })
  });

  // No-ops harmlessly if this user never had a vendor_profiles row.
  await fetch(`${SUPABASE_URL}/rest/v1/vendor_profiles?id=eq.${callerId}`, {
    method: "PATCH",
    headers: { ...serviceHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({
      name: "Deleted Stylist",
      phone: null,
      bio: null,
      id_document_url: null,
      avatar: null,
      social_link: null,
      payout_accounts: [],
      is_verified: false,
      badge: "Account Deleted"
    })
  });

  await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${callerId}`, {
    method: "DELETE",
    headers: serviceHeaders()
  });

  // Ban ~100 years — Supabase Auth has no literal "forever" value, this is
  // the documented convention for a permanent ban. The credential is never
  // deleted outright since auth.users is referenced by real booking/order/
  // review/audit rows that must survive for business records.
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${callerId}`, {
    method: "PUT",
    headers: serviceHeaders(),
    body: JSON.stringify({ ban_duration: "876000h" })
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});
