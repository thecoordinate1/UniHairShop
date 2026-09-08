// Starts a real PawaPay mobile money collection against an EXISTING booking
// or order. The amount is never trusted from the client — it's re-derived
// from the real row server-side, so a tampered request can only ever charge
// exactly what's actually owed (a K25 deposit, or the real total).
//
// Deploy: supabase functions deploy initiate-payment
// Required secrets (supabase secrets set NAME=value):
//   PAWAPAY_API_TOKEN, PAWAPAY_BASE_URL (https://api.sandbox.pawapay.io while testing,
//   https://api.pawapay.io once live)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are already provided automatically.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const PAWAPAY_API_TOKEN = Deno.env.get("PAWAPAY_API_TOKEN") ?? "";
const PAWAPAY_BASE_URL = Deno.env.get("PAWAPAY_BASE_URL") || "https://api.sandbox.pawapay.io";

const DEPOSIT_AMOUNT = 25;
const VALID_PROVIDERS = new Set(["AIRTEL_OAPI_ZMB", "MTN_MOMO_ZMB", "ZAMTEL_ZMB"]);

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
  if (!PAWAPAY_API_TOKEN) {
    return new Response(JSON.stringify({ error: "Payments are not configured yet" }), { status: 500 });
  }

  const callerId = await getCallerId(req.headers.get("Authorization"));
  if (!callerId) {
    return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const { type, id, phone, provider } = payload || {};
  if (!["booking", "order"].includes(type) || !id || !phone || !VALID_PROVIDERS.has(provider)) {
    return new Response(JSON.stringify({ error: "type, id, phone and a valid provider are required" }), { status: 400 });
  }

  // Look up the real record and confirm the caller actually owns it.
  const table = type === "booking" ? "bookings" : "orders";
  const idColumn = type === "booking" ? "id" : "id";
  const recordRes = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${idColumn}=eq.${encodeURIComponent(id)}&select=id,customer_id,total_price,total_amount,payment_status,deposit_amount`,
    { headers: serviceHeaders() }
  );
  const records = await recordRes.json();
  const record = Array.isArray(records) ? records[0] : null;

  if (!record) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }
  if (record.customer_id !== callerId) {
    return new Response(JSON.stringify({ error: "This isn't your booking or order" }), { status: 403 });
  }
  if (record.payment_status === "Paid") {
    return new Response(JSON.stringify({ error: "Already paid" }), { status: 409 });
  }

  // The amount is derived server-side, never trusted from the client — the
  // only two valid amounts for a booking are the K25 deposit or the exact
  // total; for an order it's exactly the order total.
  const total = Number(type === "booking" ? record.total_price : record.total_amount);
  const requestedAmount = Number(payload.amount);
  const validAmounts = type === "booking" ? [DEPOSIT_AMOUNT, total] : [total];
  const amount = validAmounts.find((v) => Math.abs(v - requestedAmount) < 0.01);
  if (!amount) {
    return new Response(JSON.stringify({ error: "Invalid payment amount for this booking/order" }), { status: 400 });
  }

  const depositId = crypto.randomUUID();
  const pawapayRes = await fetch(`${PAWAPAY_BASE_URL}/v2/deposits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAWAPAY_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      depositId,
      payer: { type: "MMO", accountDetails: { phoneNumber: String(phone).replace(/\D/g, ""), provider } },
      amount: String(amount),
      currency: "ZMW",
      clientReferenceId: id,
      customerMessage: "UniHairShop",
      metadata: [{ type, id }]
    })
  });

  const pawapayResult = await pawapayRes.json().catch(() => ({}));
  if (!pawapayRes.ok || pawapayResult.status === "REJECTED") {
    return new Response(
      JSON.stringify({ error: pawapayResult?.failureReason?.failureMessage || "Payment could not be started" }),
      { status: 502 }
    );
  }

  await fetch(`${SUPABASE_URL}/rest/v1/payment_transactions`, {
    method: "POST",
    headers: { ...serviceHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({
      [type === "booking" ? "booking_id" : "order_id"]: id,
      provider: "pawapay",
      provider_reference: depositId,
      amount,
      currency: "ZMW",
      status: "pending"
    })
  });

  return new Response(JSON.stringify({ depositId, status: pawapayResult.status }), { status: 200 });
});
