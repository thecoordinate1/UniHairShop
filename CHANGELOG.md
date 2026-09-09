# Changelog

All notable changes to UniHairShop are recorded here, newest first. Versions follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`. While the version stays below `1.0.0`, the app is pre-launch (see `PRODUCTION_READINESS.md`) — `1.0.0` is reserved for the first real production launch (live payments deployed, schema migrated, legal reviewed).

Each release is tagged in git as `vX.Y.Z` — refer to that tag instead of a commit hash when talking about "which version."

## [0.10.2] — 2026-09-10

### Fixed
- **Root cause of gender/halo (and every other recently-added column) silently not saving**: schema changes applied via the Management API's raw SQL endpoint don't trigger Supabase's usual "reload schema" notification, so PostgREST kept serving its stale cached schema and rejected writes touching any newly-added column — with no visible error, since the write path swallowed it. Manually reloaded the schema cache in production and made `db:migrate` always do this automatically from now on. Also stopped `updateVendorProfile` from swallowing write errors, so a genuine save failure surfaces a real error instead of a false "success" toast.
- The gender halo now also shows on the customer-facing stylist discovery cards (Home) and booking details, not just the stylist's own profile view.

### Changed
- Moved "Take a Tour" out of Account's crowded action-button row into its own prominent banner card, right under the profile header.

## [0.10.1] — 2026-09-10

### Added
- Guided in-app tour ("Take a Tour" in Account) — a step-by-step walkthrough with Next/Back that actually switches tabs as it goes, explaining Explore, Services & booking, Shop, Messages & safety codes, Favorites, loyalty points & the Ambassador program, and Vendor Studio (for vendors/admins).

## [0.10.0] — 2026-09-10

### Added
- Vendor Studio shows an "Account Completion Status" pill (e.g. "Profile 60% Complete"). Clicking it lists exactly which fields are missing — photo, bio, gender, location, specialties, payout account, ID document, at least one service — and clicking any missing item jumps straight to where it gets fixed.

## [0.9.9] — 2026-09-10

### Added
- Stylist onboarding (both the quick-onboard wall and the 60-second Fast Onboarding modal) and Vendor Studio's Edit Profile now ask for gender (Male/Female). A stylist's profile photo shows a glowing halo ring — blue for male, pink for female — on their own Vendor Studio banner and on their public profile view.

## [0.9.8] — 2026-09-10

### Fixed
- Favorites were entirely client-side (never synced to the database) — hardcoded to an empty array on every login/token refresh, meaning they didn't survive a new device, cleared browser storage, or (intermittently) even a token refresh mid-session. Added `profiles.favorites`, read on login and written on every toggle.

## [0.9.7] — 2026-09-10

### Fixed
- **Critical**: vendors could not actually add a service — `services` had no RLS policy letting a non-admin write to it at all, only `products` did. The insert was silently rejected and swallowed by an empty error handler, so it only ever appeared in that vendor's own optimistic local state, never in the real table any customer fetches. Added `services_vendor_write` (and the matching `service_add_ons` policy), and `addService` now surfaces a real error toast instead of swallowing failures and persists add-ons too.

## [0.9.6] — 2026-09-10

### Added
- Admin "Add Product" now supports uploading multiple photos (with a "Main" indicator and per-photo remove), stored in a new `products.images` column; the product quick-view now shows a tapable thumbnail strip when a product has more than one photo.
- Admin's "Services & Inventory" tab now has a Services/Products sub-tab switcher instead of stacking both full lists on one page — avoids excessive scrolling as either catalog grows.

## [0.9.5] — 2026-09-09

### Fixed
- **Critical**: chat conversation ids were generated from the stylist's id alone (`conv-<stylistId>`), so every different customer messaging the same stylist collided into one shared thread — their messages were mixed together and visible to each other and to the stylist as one continuous conversation. Conversations are now keyed by the (customer, stylist) pair, unique per relationship. This only prevents new collisions going forward; it does not retroactively un-mix any already-merged historical thread.
- A hardcoded, randomly-picked "stylist reply" was injected into every real customer conversation ~1.8s after they sent a message — and written directly into the production `messages` table — regardless of whether the real stylist had actually replied. Left over from before real backend messaging existed; now only fires in the offline/no-backend demo mode, never against a live conversation.
- The unread-message badge in the chat sidebar was permanently stuck at 0 — nothing ever incremented it. Now increments when a message arrives from the other party in a conversation that isn't currently open, and clears when that conversation is opened.
- A vendor's own client conversations all shared one identity (their own stylist name/avatar, since customers weren't tracked at all), making every client look identical in the sidebar and header. Conversations now also store the customer's name and phone, shown correctly on the vendor side.

## [0.9.4] — 2026-09-09

### Fixed
- Shop checkout awarded loyalty points immediately at order placement, before the PawaPay mobile money payment was ever confirmed — an abandoned or failed payment still kept the points. Points are now credited by `confirm_paid_order()` only once the webhook confirms payment actually succeeded (with an idempotency guard so a retried webhook can't double-credit), or by a new `confirm_arrival_order()` for the cash-on-pickup path (no webhook fires for that one, so it's confirmed by the customer's own commitment instead — mirroring how a Pay-on-Arrival booking already only earns points on completion).

## [0.9.3] — 2026-09-09

### Added
- Edit Profile now lets a stylist change their Campus and Hostel/Studio Location, not just view them.
- An "Update available" banner (with a Refresh button) appears when a new deployment lands while the app is open, and a manual "Refresh App" button in Account settings — the installed PWA has no browser reload button of its own.
- Campus Ambassador Hub now tracks real referral earnings: a referral only becomes available for withdrawal once the friend it brought in completes an appointment, shown via a new "pending vs. available" split and an explanatory rule. Added a "Request Payout" action (WhatsApp, matching how vendor payouts are already settled manually). The personal ambassador link now points at `https://unihair.shop` instead of whatever origin the page happened to load from.
- Redesigned the default profile-photo placeholder to match the app's dark/gold aesthetic instead of a generic gray silhouette.

## [0.9.2] — 2026-09-09

### Fixed
- Vendor Studio's four modals (Edit Profile, Add Service, Add Product, Upload Portfolio) were rendered inline inside the view instead of portaled to `document.body`, and never locked body scroll. This let the page behind them keep scrolling while the modal looked frozen, and — because `.main-content` carries its own `z-10` stacking context — pinned every modal's Save/Cancel buttons visually underneath the floating bottom-nav pill, making them unclickable once scrolled to the bottom. All four now portal to `document.body` (matching every other modal in the app) and lock body scroll while open.
- Hardened `onboardAsStylist` so it can never downgrade an admin account to `role: 'vendor'` — it now refuses and points the admin at the existing role switcher instead. This is what actually caused "admin privileges revoked when switching to Vendor Studio": the pre-`v0.9.1` `AuthGuard` bug showed admins the stylist self-onboarding wall instead of their real Vendor Studio, and submitting that form silently demoted them in the database.

### Added
- Vendor Studio's "Social Media Link" field now supports adding multiple links (Instagram, TikTok, etc.), stored in a new `vendor_profiles.social_links` column; the public stylist profile shows all of them. The old single `social_link` column and field are still read for backward compatibility.

## [0.9.1] — 2026-09-09

### Fixed
- `AuthGuard` blocked admin accounts from opening Vendor Studio even when they had a real, pre-existing `vendor_profiles` row — the "requires vendor" gate checked `role === 'vendor'` strictly, so promoting an existing vendor to admin silently locked them out of their own vendor account. Admins now implicitly satisfy the vendor gate too, matching the `availableViewModes` rule already used for mode-switching.

## [0.9.0] — 2026-09-09

Production-readiness gap-fill pass (everything except the payment pipe, tracked separately in `PRODUCTION_READINESS.md`).

### Added
- Account suspension: admins can suspend/reactivate any customer or vendor from new "Customers" and "Reports" admin tabs, with a reason shown to the affected user. Enforced server-side (`is_user_suspended()`) in every booking/order/review/chat write path and in vendor visibility — not just a UI gate.
- In-app safety reporting: a "Report" action on a stylist's profile and in the chat header, reviewed by admins in a new Reports tab.
- Self-service "Download My Data" and "Delete My Account" in Account settings. Deletion anonymizes PII and permanently bans the login (real bookings/orders/reviews referencing the account are kept for accounting/dispute history) — see `supabase/functions/delete-account`.
- Remote error monitoring via Sentry, loaded from their CDN bundle (no npm dependency, inert until `VITE_SENTRY_DSN` is set).
- Signup/login/password-reset CAPTCHA via Cloudflare Turnstile, wired into both auth entry points (inert until `VITE_TURNSTILE_SITE_KEY` is set and the matching secret is enabled in Supabase).
- Baseline security response headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS) in `vercel.json`; `robots.txt` and `sitemap.xml`.
- A proper "verify your email" step on the main signup wall, a dedicated "Email Verified — Sign In Now" screen, a real "Set a New Password" recovery landing page, and referral-code prefill from shared `?ref=` links.
- Real PawaPay mobile money payments (collections), replacing the simulated checkout — 10% + K5 platform commission, deposit/balance tracking, location sharing for dorm visits.
- Admin overview KPIs (total registered users, pending vendor approvals), service/product detail pages, multi-provider mobile money payout accounts, lower loyalty ratio (K0.10/point), lightweight "premium" UI polish (shimmer skeletons, spring easing, entrance animation).

### Fixed
- Several dual-read (camelCase/snake_case) display bugs that made real bookings always show "Paid in Full" regardless of actual payment status.
- Two "component torn down before payment could complete" regressions in the cart/checkout flow.

## Before this changelog

62 commits of initial buildout predate this file — see `git log` for that history.
