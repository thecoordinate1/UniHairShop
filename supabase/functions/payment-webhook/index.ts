// PawaPay's account-wide callback URL — register this function's deployed
// URL in the PawaPay dashboard. Never trusts the callback body's claimed
// status; it always re-fetches the authoritative status directly from
// PawaPay before crediting anything, which avoids needing to implement
// their optional request-signing scheme just to be safe against a spoofed
// callback.
//
// Deploy: supabase functions deploy payment-webhook
// Required secrets: PAWAPAY_API_TOKEN, PAWAPAY_BASE_URL
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are already provided automatically.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PAWAPAY_API_TOKEN = Deno.env.get("PAWAPAY_API_TOKEN") ?? "";
const PAWAPAY_BASE_URL = Deno.env.get("PAWAPAY_BASE_URL") || "https://api.sandbox.pawapay.io";

function serviceHeaders() {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal"
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const depositId = body?.depositId || body?.data?.depositId;
  if (!depositId) {
    // Nothing we can act on — acknowledge so PawaPay doesn't keep retrying.
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // Re-fetch the authoritative status directly rather than trusting the
  // callback body — this IS the security boundary for this whole function.
  const statusRes = await fetch(`${PAWAPAY_BASE_URL}/v2/deposits/${depositId}`, {
    headers: { Authorization: `Bearer ${PAWAPAY_API_TOKEN}` }
  });
  const statusResult = await statusRes.json().catch(() => ({}));
  const deposit = statusResult?.data;
  if (!deposit) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  if (deposit.status !== "COMPLETED" && deposit.status !== "FAILED") {
    // Still in progress — nothing final to record yet.
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const finalStatus = deposit.status === "COMPLETED" ? "paid" : "failed";

  const txRes = await fetch(
    `${SUPABASE_URL}/rest/v1/payment_transactions?provider_reference=eq.${depositId}&select=booking_id,order_id`,
    { headers: serviceHeaders() }
  );
  const transactions = await txRes.json().catch(() => []);
  const transaction = Array.isArray(transactions) ? transactions[0] : null;

  await fetch(`${SUPABASE_URL}/rest/v1/payment_transactions?provider_reference=eq.${depositId}`, {
    method: "PATCH",
    headers: serviceHeaders(),
    body: JSON.stringify({ status: finalStatus, verified_at: new Date().toISOString() })
  });

  if (transaction && finalStatus === "paid") {
    if (transaction.booking_id) {
      await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${transaction.booking_id}`, {
        method: "PATCH",
        headers: serviceHeaders(),
        body: JSON.stringify({ payment_status: "Paid" })
      });
    } else if (transaction.order_id) {
      // confirm_paid_order() credits each line item's vendor (net of the
      // platform commission) and marks the order Paid in one transaction.
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/confirm_paid_order`, {
        method: "POST",
        headers: serviceHeaders(),
        body: JSON.stringify({ p_order_id: transaction.order_id })
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
