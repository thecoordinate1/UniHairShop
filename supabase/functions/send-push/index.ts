// Sends a Web Push notification to every device a user has subscribed on.
// Invoked by Postgres triggers (see notify_push() in supabase_schema.sql) on
// new chat messages and booking status changes — never called directly by
// the client, which is why this trusts the caller and doesn't re-check auth
// beyond requiring a valid Supabase JWT (enforced by the functions gateway).
//
// Deploy: supabase functions deploy send-push
// Required secrets (supabase secrets set NAME=value):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (e.g. mailto:you@unihair.shop)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are already provided automatically.

import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:support@unihair.shop";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return new Response(JSON.stringify({ error: "VAPID keys not configured" }), { status: 500 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const { user_id, title, body, url } = payload || {};
  if (!user_id || !title) {
    return new Response(JSON.stringify({ error: "user_id and title are required" }), { status: 400 });
  }

  const subsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${encodeURIComponent(user_id)}&select=endpoint,p256dh,auth_key`,
    {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`
      }
    }
  );

  if (!subsRes.ok) {
    return new Response(JSON.stringify({ error: "Could not load subscriptions" }), { status: 502 });
  }

  const subscriptions = await subsRes.json();
  const notificationPayload = JSON.stringify({ title, body: body || "", url: url || "/" });

  const results = await Promise.allSettled(
    (subscriptions || []).map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        notificationPayload
      ).catch(async (err) => {
        // 404/410 means the browser dropped this subscription — clean it up.
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await fetch(
            `${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(sub.endpoint)}`,
            {
              method: "DELETE",
              headers: {
                apikey: SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SERVICE_ROLE_KEY}`
              }
            }
          );
        }
        throw err;
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return new Response(JSON.stringify({ success: true, sent, total: results.length }), { status: 200 });
});
