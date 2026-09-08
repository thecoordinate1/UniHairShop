# Production activation checklist

The interface is a prototype until this checklist is completed. Do not enable live payments or accept real customer bookings before it is.

1. Apply `supabase/migrations/20260906_production_security_and_ledger.sql` in a staging project, test every customer/vendor/admin journey, then apply it in production.
2. Provision the initial administrator directly in Supabase SQL using the user UUID. Admin access is no longer granted by an email address or browser-side password.
3. The migration includes protected database functions for booking requests, booking transitions, profile creation, referrals, and loyalty. Apply it before releasing the matching app build. Vendor payouts remain a manually-settled request until automated disbursement is built.
4. Real mobile money collection is wired up via PawaPay (initiate-payment/payment-webhook Edge Functions). Deploy both functions, set `PAWAPAY_API_TOKEN`/`PAWAPAY_BASE_URL` secrets, and register the deployed webhook URL in PawaPay's dashboard before enabling live payments. The webhook always re-verifies status directly against PawaPay rather than trusting the callback body. Never collect card numbers or MoMo PINs directly in UniHairShop — PawaPay's own STK push handles PIN entry on the customer's device.
5. Add a provider for transactional WhatsApp/SMS: booking requested, accepted, reminder, cancellation, arrival, and refund/support escalation.
6. Publish a privacy policy, terms, cancellation/refund policy, and support contact. Show hostel/phone information only to the matched, accepted stylist.
7. Run a single-campus pilot with real verified stylists. Review completion rate, repeat booking rate, cancellation/no-show rate, and per-booking contribution margin weekly.

## Required operational rules

- A booking starts as `Requested`; only the assigned verified stylist can accept it.
- Payment status changes only after a verified provider webhook.
- Refunds and payouts are requests until a server-side provider result confirms them.
- One loyalty point equals exactly K0.10. Ledger entries—not a client-side balance—are the source of truth.
