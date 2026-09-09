-- ==============================================================================
-- UniHairShop — Complete PostgreSQL Schema for Supabase
-- This file is the full, CURRENT authoritative schema (base tables + every
-- applied migration in supabase/migrations/, merged and made idempotent).
-- It is safe to re-run at any time: every statement uses IF NOT EXISTS,
-- CREATE OR REPLACE, or an explicit DROP-then-CREATE, so re-running it never
-- reintroduces the old public-read/public-write policies or duplicates
-- triggers/publications. See scripts/migrate.js for how this gets applied.
-- ==============================================================================

-- pg_net lets Postgres triggers fire an async HTTP call (used below to invoke
-- the send-push Edge Function) — pre-installed on Supabase, safe to no-op here.
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. PROFILES (Students & Stylists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  campus TEXT DEFAULT 'UNILUS Silverest Campus',
  hostel TEXT,
  role TEXT DEFAULT 'customer', -- 'customer', 'vendor', 'admin'
  loyalty_points INT DEFAULT 50,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  referral_count INT DEFAULT 0,
  points_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Migration helpers if table already exists in Supabase
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_count INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorites JSONB DEFAULT '[]'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code) WHERE referral_code IS NOT NULL;

-- 2. VENDOR PROFILES (Campus Stylists & Barbers)
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  campus TEXT NOT NULL,
  dorm_location TEXT,
  avatar TEXT,
  is_verified BOOLEAN DEFAULT false,
  badge TEXT DEFAULT 'Campus Stylist (Pending Verification)',
  travels_to_dorm BOOLEAN DEFAULT true,
  travel_fee NUMERIC DEFAULT 20,
  has_studio BOOLEAN DEFAULT true,
  phone TEXT,
  bio TEXT,
  rating NUMERIC DEFAULT 0,
  reviews_count INT DEFAULT 0,
  portfolio JSONB DEFAULT '[]'::jsonb,
  payout_provider TEXT DEFAULT 'Airtel Money',
  payout_number TEXT,
  id_document_url TEXT,
  specialties JSONB DEFAULT '[]'::jsonb,
  payout_accounts JSONB DEFAULT '[]'::jsonb,
  social_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Existing tables created before this fix still have the old fake defaults —
-- correct them so newly-inserted rows never get a fabricated rating or
-- instant unreviewed verification.
ALTER TABLE public.vendor_profiles ALTER COLUMN rating SET DEFAULT 0;
ALTER TABLE public.vendor_profiles ALTER COLUMN is_verified SET DEFAULT false;
ALTER TABLE public.vendor_profiles ALTER COLUMN badge SET DEFAULT 'Campus Stylist (Pending Verification)';
ALTER TABLE public.vendor_profiles ADD COLUMN IF NOT EXISTS id_document_url TEXT;
-- Multiple specialty skills, multiple saved mobile money payout accounts,
-- and a social media link — all optional, additive vendor profile fields.
ALTER TABLE public.vendor_profiles ADD COLUMN IF NOT EXISTS specialties JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.vendor_profiles ADD COLUMN IF NOT EXISTS payout_accounts JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.vendor_profiles ADD COLUMN IF NOT EXISTS social_link TEXT;
ALTER TABLE public.vendor_profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.vendor_profiles ADD COLUMN IF NOT EXISTS gender TEXT;

-- 3. SERVICES (Hairstyles & Grooming)
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration INT NOT NULL,
  description TEXT,
  image TEXT,
  popular BOOLEAN DEFAULT false,
  can_travel BOOLEAN DEFAULT true,
  in_studio BOOLEAN DEFAULT true,
  staff_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SERVICE ADD-ONS
CREATE TABLE IF NOT EXISTS public.service_add_ons (
  id TEXT PRIMARY KEY,
  service_id TEXT REFERENCES public.services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration INT DEFAULT 10
);

-- 5. PRODUCTS (Campus Hair Care Essentials & Cosmetics + Vendor Shop Items)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock INT DEFAULT 10,
  image TEXT,
  rating NUMERIC DEFAULT 0,
  reviews_count INT DEFAULT 0,
  description TEXT,
  vendor_id TEXT REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Existing tables created before this fix still have the old fake default —
-- correct it so newly-inserted rows never get a fabricated rating.
ALTER TABLE public.products ALTER COLUMN rating SET DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vendor_id TEXT REFERENCES public.vendor_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- 6. BOOKINGS (Appointment Queue)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  service_id TEXT,
  service_name TEXT NOT NULL,
  category TEXT,
  staff_id TEXT,
  staff_name TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  campus TEXT NOT NULL,
  hostel TEXT,
  service_type TEXT DEFAULT 'Travel to Dorm',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  selected_add_ons JSONB DEFAULT '[]'::jsonb,
  price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'Cash / Mobile Money on Arrival',
  payment_status TEXT DEFAULT 'Pending',
  status TEXT DEFAULT 'Confirmed',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id);
-- How much of total_price was actually paid up front through the platform
-- (0 for Pay-on-Arrival, 25 for a deposit, total_price for pay-in-full) — the
-- vendor UI reads this instead of assuming every booking was paid in full.
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;
ALTER TABLE public.bookings DROP COLUMN IF EXISTS balance_due;
ALTER TABLE public.bookings ADD COLUMN balance_due NUMERIC GENERATED ALWAYS AS (total_price - deposit_amount) STORED;
-- Optional Google Maps link the customer can share instead of (or alongside)
-- typing their hostel/room, so the stylist has a precise pin to navigate to.
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS location_link TEXT;

-- 7. ORDERS (Retail Shop Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  items JSONB NOT NULL,
  campus TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  hostel_details TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'Pending',
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id);

-- 8. IN-APP CHAT CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  stylist_id TEXT NOT NULL,
  stylist_name TEXT NOT NULL,
  last_message TEXT,
  last_timestamp TEXT,
  unread_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id);
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- The conversation id used to be conv-<stylist_id> alone, which meant every
-- customer messaging the same stylist collided into one shared thread --
-- messages from different, unrelated customers were mixed together and
-- visible to each other. It's now conv-<customer_id>-<stylist_id> (unique
-- per pair) everywhere new conversations are created; this only prevents
-- new collisions going forward and does not retroactively split any
-- already-merged historical thread.

CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'user', 'stylist'
  text TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. VENDOR WALLETS & PAYOUTS
CREATE TABLE IF NOT EXISTS public.vendor_wallets (
  id TEXT PRIMARY KEY,
  vendor_id TEXT UNIQUE NOT NULL,
  available_balance NUMERIC DEFAULT 0,
  pending_balance NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  completed_jobs_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendor_payouts (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  date TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  provider TEXT NOT NULL,
  number TEXT NOT NULL,
  status TEXT DEFAULT 'Completed',
  reference TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. LOYALTY LEDGER, PAYMENT TRANSACTIONS & AUDIT LOG
-- (from supabase/migrations/20260906_production_security_and_ledger.sql)
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL CHECK (points <> 0),
  value_zmw NUMERIC(12,2) GENERATED ALWAYS AS (points * 0.10) STORED,
  reason TEXT NOT NULL,
  booking_id TEXT REFERENCES public.bookings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.points_ledger ADD COLUMN IF NOT EXISTS order_id TEXT REFERENCES public.orders(id);

-- Loyalty points are now worth K0.10 each (was K0.15) — a generated column's
-- expression can't be altered in place pre-PG18, so drop and recreate it.
-- Safe to re-run: this only recomputes from the points already stored.
ALTER TABLE public.points_ledger DROP COLUMN IF EXISTS value_zmw;
ALTER TABLE public.points_ledger ADD COLUMN value_zmw NUMERIC(12,2) GENERATED ALWAYS AS (points * 0.10) STORED;

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT REFERENCES public.bookings(id),
  order_id TEXT REFERENCES public.orders(id),
  provider TEXT NOT NULL,
  provider_reference TEXT UNIQUE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'ZMW',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (booking_id IS NOT NULL OR order_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10b. REPORTS — a user flagging another user's chat message, stylist
-- profile, or booking for admin review (harassment, impersonation, unsafe
-- behavior). The only in-app safety escalation path besides messaging
-- support directly on WhatsApp.
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reported_user_id UUID NOT NULL REFERENCES auth.users(id),
  context_type TEXT NOT NULL CHECK (context_type IN ('chat', 'stylist_profile', 'booking')),
  context_id TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed', 'actioned')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. REVIEWS — one real review per completed booking, written only via
-- submit_review() below so the vendor's rating/reviews_count can never be
-- client-forged. This is what makes vendor_profiles.rating a real number.
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  customer_name TEXT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. ANALYTICS EVENTS — lightweight self-hosted funnel tracking (signup,
-- booking created/completed, order placed, referral used). Write-open so
-- pre-signup/guest events can be logged too; read is admin-only.
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_name TEXT NOT NULL CHECK (char_length(event_name) <= 100),
  user_id UUID REFERENCES auth.users(id),
  campus TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. PRODUCT SALES — one row per product line item per order, written only
-- by place_order() below, so a vendor has a real, tamper-proof sales history
-- for the products they list in My Shop.
CREATE TABLE IF NOT EXISTS public.product_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  customer_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. PUSH SUBSCRIPTIONS — one row per browser/device a user has enabled push
-- notifications on (new messages, booking updates). Holds only the public Web
-- Push endpoint/keys for that device, so a user managing their own rows here
-- carries no security risk — the worst a forged row does is fail silently.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. PLATFORM FEES — one row per commission deduction, written only by
-- transition_booking() and confirm_paid_order() below, so there's a real,
-- auditable record of every cut the platform actually took (never client-forgeable).
CREATE TABLE IF NOT EXISTS public.platform_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('booking', 'product_sale')),
  source_id TEXT NOT NULL,
  vendor_id TEXT NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  gross_amount NUMERIC NOT NULL,
  fee_amount NUMERIC NOT NULL,
  net_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- Row Level Security (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- Server-side functions (SECURITY DEFINER) — trusted business logic clients
-- cannot bypass: role changes, loyalty points, booking state transitions.
-- (from supabase/migrations/20260906_production_security_and_ledger.sql)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- Shared by RLS policies and booking/order/review RPCs so a suspended
-- customer or vendor can't act anywhere in the app through any single
-- code path — the flag itself can only ever be set by suspend_user()/
-- unsuspend_user() below, both admin-gated.
CREATE OR REPLACE FUNCTION public.is_user_suspended(p_user_id UUID)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_suspended FROM public.profiles WHERE id = p_user_id), false);
$$;

-- Ambassador cash-bounty availability: a referral only becomes "available"
-- (withdrawable) once the person it brought in has actually completed a
-- booking -- not merely signed up. Runs as the caller (auth.uid()) only, so
-- one student can never query another's referral earnings; SECURITY DEFINER
-- is needed because the caller has no direct RLS access to referred
-- strangers' bookings, only this narrow aggregate count of them.
CREATE OR REPLACE FUNCTION public.get_ambassador_earnings()
RETURNS TABLE(completed_referrals INT, pending_referrals INT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COUNT(DISTINCT p.id) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.bookings b WHERE b.customer_id = p.id AND b.status = 'Completed'
    ))::INT AS completed_referrals,
    COUNT(DISTINCT p.id) FILTER (WHERE NOT EXISTS (
      SELECT 1 FROM public.bookings b WHERE b.customer_id = p.id AND b.status = 'Completed'
    ))::INT AS pending_referrals
  FROM public.profiles p
  WHERE p.referred_by = (SELECT referral_code FROM public.profiles WHERE id = auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.get_ambassador_earnings() TO authenticated;

-- Fires the send-push Edge Function for one user's registered devices. Reads
-- its target URL/auth from Postgres settings rather than a hardcoded value so
-- nothing here needs editing once push notifications are actually deployed —
-- see the setup notes near the end of this file. No-ops quietly (never raises)
-- if those settings haven't been configured yet, so it's always safe to call.
CREATE OR REPLACE FUNCTION public.notify_push(p_user_id UUID, p_title TEXT, p_body TEXT, p_url TEXT DEFAULT '/')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_function_url TEXT; v_service_key TEXT;
BEGIN
  IF p_user_id IS NULL THEN RETURN; END IF;
  v_function_url := current_setting('app.settings.push_function_url', true);
  v_service_key := current_setting('app.settings.service_role_key', true);
  IF v_function_url IS NULL OR v_function_url = '' OR v_service_key IS NULL OR v_service_key = '' THEN
    RETURN;
  END IF;
  PERFORM net.http_post(
    url := v_function_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_service_key),
    body := jsonb_build_object('user_id', p_user_id, 'title', p_title, 'body', p_body, 'url', p_url)
  );
EXCEPTION WHEN OTHERS THEN
  -- A push failure should never break the booking/message it rode in on.
  NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('app.unihair_trusted', true) = 'on' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.role := 'customer';
    NEW.loyalty_points := 0;
    NEW.referral_count := 0;
    NEW.points_history := '[]'::jsonb;
    NEW.is_suspended := false;
    NEW.suspended_reason := NULL;
    NEW.suspended_at := NULL;
    RETURN NEW;
  END IF;
  IF auth.uid() = OLD.id AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.loyalty_points := OLD.loyalty_points;
    NEW.referral_code := OLD.referral_code;
    NEW.referral_count := OLD.referral_count;
    NEW.points_history := OLD.points_history;
    -- Only suspend_user()/unsuspend_user() (both admin-gated) may change these —
    -- otherwise a suspended user could simply PATCH their own row to lift it.
    NEW.is_suspended := OLD.is_suspended;
    NEW.suspended_reason := OLD.suspended_reason;
    NEW.suspended_at := OLD.suspended_at;
  END IF;
  RETURN NEW;
END;
$$;

-- Logs every suspend/unsuspend as an audit trail entry, separate from the
-- self-edit protection above so it fires regardless of who made the change.
CREATE OR REPLACE FUNCTION public.log_profile_suspension_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_suspended IS DISTINCT FROM OLD.is_suspended THEN
    INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(),
      CASE WHEN NEW.is_suspended THEN 'user_suspended' ELSE 'user_unsuspended' END,
      'profile',
      NEW.id::text,
      jsonb_build_object('reason', NEW.suspended_reason)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.apply_points(UUID, INTEGER, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.apply_points(p_profile_id UUID, p_points INTEGER, p_reason TEXT, p_booking_id TEXT DEFAULT NULL, p_order_id TEXT DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_history JSONB;
BEGIN
  IF p_points = 0 THEN RAISE EXCEPTION 'Points adjustment cannot be zero'; END IF;
  PERFORM set_config('app.unihair_trusted', 'on', true);
  INSERT INTO public.points_ledger (profile_id, points, reason, booking_id, order_id) VALUES (p_profile_id, p_points, p_reason, p_booking_id, p_order_id);
  SELECT COALESCE(points_history, '[]'::jsonb) INTO v_history FROM public.profiles WHERE id = p_profile_id FOR UPDATE;
  UPDATE public.profiles
  SET loyalty_points = GREATEST(0, loyalty_points + p_points),
      points_history = jsonb_build_object('id', gen_random_uuid()::text, 'type', 'ledger', 'points', p_points, 'title', p_reason, 'date', now()) || v_history
  WHERE id = p_profile_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role TEXT := CASE WHEN NEW.raw_user_meta_data->>'role' = 'vendor' THEN 'vendor' ELSE 'customer' END;
  v_referrer UUID;
  v_referral_code TEXT;
  v_referred_by TEXT := upper(COALESCE(NEW.raw_user_meta_data->>'referred_by', ''));
BEGIN
  LOOP
    v_referral_code := lpad((floor(random() * 9000000) + 1000000)::text, 7, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = v_referral_code);
  END LOOP;
  PERFORM set_config('app.unihair_trusted', 'on', true);
  INSERT INTO public.profiles (id, email, name, phone, campus, hostel, role, loyalty_points, referral_code, referred_by, referral_count, points_history)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.raw_user_meta_data->>'phone', COALESCE(NEW.raw_user_meta_data->>'campus', 'UNILUS Silverest Campus'), NEW.raw_user_meta_data->>'hostel', v_role, 0, v_referral_code, NULLIF(v_referred_by, ''), 0, '[]'::jsonb);
  PERFORM public.apply_points(NEW.id, 50, 'Welcome reward');
  SELECT id INTO v_referrer FROM public.profiles WHERE referral_code = v_referred_by;
  IF v_referrer IS NOT NULL THEN
    PERFORM public.apply_points(NEW.id, 25, 'Referral signup bonus');
    PERFORM public.apply_points(v_referrer, 25, 'Referral reward');
    UPDATE public.profiles SET referral_count = referral_count + 1 WHERE id = v_referrer;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.request_booking(
  p_service_id TEXT, p_service_name TEXT, p_category TEXT, p_staff_id TEXT, p_date TEXT, p_time TEXT,
  p_hostel TEXT, p_service_type TEXT, p_price NUMERIC, p_total_price NUMERIC, p_add_ons JSONB DEFAULT '[]'::jsonb,
  p_deposit_amount NUMERIC DEFAULT 0,
  p_location_link TEXT DEFAULT NULL
) RETURNS public.bookings LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_profile public.profiles; v_booking public.bookings; v_vendor public.vendor_profiles;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF public.is_user_suspended(auth.uid()) THEN RAISE EXCEPTION 'Your account has been suspended. Contact support for help.'; END IF;
  IF public.is_user_suspended(p_staff_id::uuid) THEN RAISE EXCEPTION 'This stylist is currently unavailable'; END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
  SELECT * INTO v_vendor FROM public.vendor_profiles WHERE id = p_staff_id AND is_verified = true;
  IF v_profile.id IS NULL OR v_vendor.id IS NULL THEN RAISE EXCEPTION 'Choose a verified stylist'; END IF;
  IF p_total_price < 0 OR p_price < 0 THEN RAISE EXCEPTION 'Invalid price'; END IF;
  IF p_deposit_amount < 0 OR p_deposit_amount > p_total_price THEN RAISE EXCEPTION 'Invalid deposit amount'; END IF;
  IF EXISTS (SELECT 1 FROM public.bookings WHERE staff_id = p_staff_id AND date = p_date AND time = p_time AND status IN ('Requested','Confirmed','In Progress')) THEN RAISE EXCEPTION 'That time is no longer available'; END IF;
  INSERT INTO public.bookings (id, customer_id, service_id, service_name, category, staff_id, staff_name, date, time, campus, hostel, service_type, customer_name, customer_phone, selected_add_ons, price, total_price, deposit_amount, location_link, payment_method, payment_status, status)
  VALUES ('UHS-' || replace(gen_random_uuid()::text, '-', ''), auth.uid(), p_service_id, p_service_name, p_category, p_staff_id, v_vendor.name, p_date, p_time, v_profile.campus, p_hostel, p_service_type, v_profile.name, v_profile.phone, p_add_ons, p_price, p_total_price, p_deposit_amount, p_location_link, 'Payment pending', 'Pending', 'Requested')
  RETURNING * INTO v_booking;
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id) VALUES (auth.uid(), 'booking_requested', 'booking', v_booking.id);
  PERFORM public.notify_push(v_vendor.id::uuid, 'New Booking Request', v_profile.name || ' requested ' || p_service_name, '/?tab=vendor');
  RETURN v_booking;
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_booking(p_booking_id TEXT, p_status TEXT, p_date TEXT DEFAULT NULL, p_time TEXT DEFAULT NULL)
RETURNS public.bookings LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_booking public.bookings; v_points INTEGER; v_collected NUMERIC; v_fee NUMERIC; v_net NUMERIC;
BEGIN
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id FOR UPDATE;
  IF v_booking.id IS NULL THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF auth.uid() IS NULL OR NOT (v_booking.customer_id = auth.uid() OR v_booking.staff_id = auth.uid()::text OR public.is_admin()) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF p_status = 'Confirmed' AND NOT (v_booking.staff_id = auth.uid()::text OR public.is_admin()) THEN RAISE EXCEPTION 'Only the stylist can accept'; END IF;
  IF p_status = 'Completed' AND NOT (v_booking.staff_id = auth.uid()::text OR public.is_admin()) THEN RAISE EXCEPTION 'Only the stylist can complete'; END IF;
  IF p_status NOT IN ('Cancelled','Confirmed','Completed','Requested') THEN RAISE EXCEPTION 'Unsupported booking status'; END IF;
  UPDATE public.bookings SET status = p_status, date = COALESCE(p_date, date), time = COALESCE(p_time, time) WHERE id = p_booking_id RETURNING * INTO v_booking;
  IF p_status = 'Completed' AND NOT EXISTS (SELECT 1 FROM public.points_ledger WHERE booking_id = p_booking_id AND reason = 'Completed booking reward') THEN
    v_points := GREATEST(5, floor(v_booking.total_price / 10));
    PERFORM public.apply_points(v_booking.customer_id, v_points, 'Completed booking reward', p_booking_id);
    -- The job count always increments on completion, but the wallet is only
    -- ever credited with money that was actually collected through the
    -- platform (payment_transactions) — a Pay-on-Arrival booking is 100%
    -- cash the vendor already has in hand, and crediting the wallet on top
    -- of that would be double-counting money the platform never touched.
    IF v_booking.staff_id IS NOT NULL THEN
      SELECT COALESCE(SUM(amount), 0) INTO v_collected FROM public.payment_transactions WHERE booking_id = p_booking_id AND status = 'paid';
      IF v_collected > 0 THEN
        v_fee := round(v_collected * 0.10 + 5, 2);
        v_net := v_collected - v_fee;
        INSERT INTO public.vendor_wallets (id, vendor_id, available_balance, total_earned, completed_jobs_count, updated_at)
        VALUES (v_booking.staff_id, v_booking.staff_id, v_net, v_net, 1, now())
        ON CONFLICT (vendor_id) DO UPDATE SET
          available_balance = public.vendor_wallets.available_balance + v_net,
          total_earned = public.vendor_wallets.total_earned + v_net,
          completed_jobs_count = public.vendor_wallets.completed_jobs_count + 1,
          updated_at = now();
        INSERT INTO public.platform_fees (source_type, source_id, vendor_id, gross_amount, fee_amount, net_amount)
        VALUES ('booking', p_booking_id, v_booking.staff_id, v_collected, v_fee, v_net);
      ELSE
        INSERT INTO public.vendor_wallets (id, vendor_id, completed_jobs_count, updated_at)
        VALUES (v_booking.staff_id, v_booking.staff_id, 1, now())
        ON CONFLICT (vendor_id) DO UPDATE SET
          completed_jobs_count = public.vendor_wallets.completed_jobs_count + 1,
          updated_at = now();
      END IF;
    END IF;
  END IF;
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata) VALUES (auth.uid(), lower(replace(p_status, ' ', '_')), 'booking', p_booking_id, jsonb_build_object('status', p_status));
  IF p_status = 'Confirmed' THEN
    PERFORM public.notify_push(v_booking.customer_id, 'Appointment Confirmed', v_booking.service_name || ' on ' || v_booking.date || ' at ' || v_booking.time, '/?tab=account');
  ELSIF p_status = 'Completed' THEN
    PERFORM public.notify_push(v_booking.customer_id, 'Appointment Completed', 'Rate your stylist for ' || v_booking.service_name, '/?tab=account');
  ELSIF p_status = 'Cancelled' THEN
    PERFORM public.notify_push(v_booking.customer_id, 'Appointment Cancelled', v_booking.service_name || ' was cancelled', '/?tab=account');
  END IF;
  RETURN v_booking;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_vendor_self_verification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.is_verified := false;
      NEW.badge := 'Campus Stylist (Pending Verification)';
    ELSE
      NEW.is_verified := OLD.is_verified;
      NEW.badge := CASE WHEN OLD.is_verified THEN OLD.badge ELSE 'Campus Stylist (Pending Verification)' END;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_conv public.conversations; v_recipient UUID; v_sender_name TEXT;
BEGIN
  SELECT * INTO v_conv FROM public.conversations WHERE id = NEW.conversation_id;
  IF v_conv.id IS NULL THEN RETURN NEW; END IF;
  IF NEW.sender = 'user' THEN
    v_recipient := v_conv.stylist_id::uuid;
    SELECT name INTO v_sender_name FROM public.profiles WHERE id = v_conv.customer_id;
  ELSE
    v_recipient := v_conv.customer_id;
    SELECT name INTO v_sender_name FROM public.vendor_profiles WHERE id = v_conv.stylist_id;
  END IF;
  PERFORM public.notify_push(v_recipient, COALESCE(v_sender_name, 'New message'), NEW.text, '/?tab=messages');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_review(p_booking_id TEXT, p_rating INT, p_comment TEXT DEFAULT NULL)
RETURNS public.reviews LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_booking public.bookings; v_review public.reviews; v_avg NUMERIC; v_count INT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF public.is_user_suspended(auth.uid()) THEN RAISE EXCEPTION 'Your account has been suspended. Contact support for help.'; END IF;
  IF p_rating < 1 OR p_rating > 5 THEN RAISE EXCEPTION 'Rating must be between 1 and 5'; END IF;
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
  IF v_booking.id IS NULL THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF v_booking.customer_id IS NULL OR v_booking.customer_id != auth.uid() THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF v_booking.status != 'Completed' THEN RAISE EXCEPTION 'Booking must be completed before you can review it'; END IF;
  IF EXISTS (SELECT 1 FROM public.reviews WHERE booking_id = p_booking_id) THEN RAISE EXCEPTION 'This booking has already been reviewed'; END IF;
  INSERT INTO public.reviews (booking_id, vendor_id, customer_id, customer_name, rating, comment)
  VALUES (p_booking_id, v_booking.staff_id, auth.uid(), v_booking.customer_name, p_rating, p_comment)
  RETURNING * INTO v_review;
  SELECT avg(rating), count(*) INTO v_avg, v_count FROM public.reviews WHERE vendor_id = v_booking.staff_id;
  UPDATE public.vendor_profiles SET rating = round(v_avg, 2), reviews_count = v_count WHERE id = v_booking.staff_id;
  RETURN v_review;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_review(TEXT, INT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_review(TEXT, INT, TEXT) TO authenticated;

-- A vendor's payout can only ever debit their own wallet, by their own
-- request, for no more than what transition_booking has actually credited
-- them — never a client-supplied balance.
CREATE OR REPLACE FUNCTION public.request_vendor_payout(p_amount NUMERIC, p_provider TEXT, p_number TEXT)
RETURNS public.vendor_payouts LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_wallet public.vendor_wallets; v_payout public.vendor_payouts; v_vendor_id TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'Invalid payout amount'; END IF;
  v_vendor_id := auth.uid()::text;
  SELECT * INTO v_wallet FROM public.vendor_wallets WHERE vendor_id = v_vendor_id FOR UPDATE;
  IF v_wallet.vendor_id IS NULL OR p_amount > v_wallet.available_balance THEN RAISE EXCEPTION 'Amount exceeds your available balance'; END IF;
  UPDATE public.vendor_wallets SET available_balance = available_balance - p_amount, updated_at = now() WHERE vendor_id = v_vendor_id;
  INSERT INTO public.vendor_payouts (id, vendor_id, date, amount, provider, number, status, reference)
  VALUES (
    'PAY-' || replace(gen_random_uuid()::text, '-', ''),
    v_vendor_id,
    to_char(now(), 'YYYY-MM-DD'),
    p_amount,
    COALESCE(p_provider, 'Airtel Money'),
    p_number,
    'Completed',
    upper(left(COALESCE(p_provider, 'PAY'), 3)) || '-TX-' || floor(random() * 9000 + 1000)::text
  )
  RETURNING * INTO v_payout;
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata) VALUES (auth.uid(), 'vendor_payout_requested', 'vendor_payout', v_payout.id, jsonb_build_object('amount', p_amount));
  RETURN v_payout;
END;
$$;

REVOKE ALL ON FUNCTION public.request_vendor_payout(NUMERIC, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_vendor_payout(NUMERIC, TEXT, TEXT) TO authenticated;

-- Places an order and, for every line item that matches a real inventory row,
-- decrements stock and records the sale server-side — the client can never
-- claim stock it doesn't have or forge a sale for a product it doesn't own.
-- A line item with no matching product row (a curated bundle SKU, not real
-- inventory) falls back to whatever the client sent for that line, same as
-- before this function existed. The order is created here in Pending state
-- BEFORE any real payment happens — wallet crediting now happens separately,
-- in confirm_paid_order() below, only once PawaPay actually confirms payment,
-- so a Pay-on-Delivery order (cash the vendor collects directly) never
-- credits the wallet at all.
CREATE OR REPLACE FUNCTION public.place_order(
  p_items JSONB, p_campus TEXT, p_delivery_type TEXT, p_hostel_details TEXT, p_payment_method TEXT
) RETURNS public.orders LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_profile public.profiles;
  v_order public.orders;
  v_item JSONB;
  v_product public.products;
  v_total NUMERIC := 0;
  v_order_id TEXT;
  v_qty INT;
  v_line_total NUMERIC;
  v_final_items JSONB := '[]'::jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF public.is_user_suspended(auth.uid()) THEN RAISE EXCEPTION 'Your account has been suspended. Contact support for help.'; END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
  IF v_profile.id IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN RAISE EXCEPTION 'Cart is empty'; END IF;

  v_order_id := 'UHS-ORD-' || replace(gen_random_uuid()::text, '-', '');

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));
    SELECT * INTO v_product FROM public.products WHERE id = (v_item->>'id') FOR UPDATE;

    IF v_product.id IS NOT NULL THEN
      IF v_product.stock < v_qty THEN RAISE EXCEPTION 'Not enough stock for %', v_product.name; END IF;
      v_line_total := v_product.price * v_qty;
      v_total := v_total + v_line_total;
      UPDATE public.products SET stock = stock - v_qty WHERE id = v_product.id;
      v_final_items := v_final_items || jsonb_build_object('id', v_product.id, 'name', v_product.name, 'price', v_product.price, 'quantity', v_qty, 'image', v_product.image);

      IF v_product.vendor_id IS NOT NULL THEN
        INSERT INTO public.product_sales (order_id, product_id, vendor_id, product_name, quantity, unit_price, total_amount, customer_name)
        VALUES (v_order_id, v_product.id, v_product.vendor_id, v_product.name, v_qty, v_product.price, v_line_total, v_profile.name);
      END IF;
    ELSE
      v_line_total := COALESCE((v_item->>'price')::numeric, 0) * v_qty;
      v_total := v_total + v_line_total;
      v_final_items := v_final_items || jsonb_build_object('id', v_item->>'id', 'name', v_item->>'name', 'price', v_item->>'price', 'quantity', v_qty, 'image', v_item->>'image');
    END IF;
  END LOOP;

  INSERT INTO public.orders (id, items, campus, total_amount, customer_name, customer_phone, delivery_type, hostel_details, payment_method, payment_status, status, customer_id)
  VALUES (
    v_order_id, v_final_items, COALESCE(p_campus, v_profile.campus), v_total, v_profile.name, v_profile.phone,
    p_delivery_type, p_hostel_details, p_payment_method,
    'Pending', 'Pending', auth.uid()
  ) RETURNING * INTO v_order;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata) VALUES (auth.uid(), 'order_placed', 'order', v_order_id, jsonb_build_object('total_amount', v_total));

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(JSONB, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(JSONB, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Called only by the payment-webhook Edge Function once PawaPay confirms an
-- order's payment actually succeeded — credits each line item's vendor net
-- of the platform commission, using the product_sales rows place_order()
-- already recorded. Never called for Pay-on-Delivery orders (no webhook
-- fires for those), so COD orders never touch the wallet at all.
CREATE OR REPLACE FUNCTION public.confirm_paid_order(p_order_id TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_sale RECORD; v_fee NUMERIC; v_net NUMERIC; v_order public.orders; v_points INTEGER;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  -- Idempotency: PawaPay (or any webhook) can retry the same delivery, and this
  -- must never double-credit a vendor's wallet or a customer's loyalty points.
  IF v_order.id IS NULL OR v_order.payment_status = 'Paid' THEN RETURN; END IF;

  FOR v_sale IN SELECT * FROM public.product_sales WHERE order_id = p_order_id LOOP
    v_fee := round(v_sale.total_amount * 0.10 + 5, 2);
    v_net := v_sale.total_amount - v_fee;
    INSERT INTO public.vendor_wallets (id, vendor_id, available_balance, total_earned, completed_jobs_count, updated_at)
    VALUES (v_sale.vendor_id, v_sale.vendor_id, v_net, v_net, 0, now())
    ON CONFLICT (vendor_id) DO UPDATE SET
      available_balance = public.vendor_wallets.available_balance + v_net,
      total_earned = public.vendor_wallets.total_earned + v_net,
      updated_at = now();
    INSERT INTO public.platform_fees (source_type, source_id, vendor_id, gross_amount, fee_amount, net_amount)
    VALUES ('product_sale', v_sale.id::text, v_sale.vendor_id, v_sale.total_amount, v_fee, v_net);
  END LOOP;

  UPDATE public.orders SET payment_status = 'Paid' WHERE id = p_order_id;

  -- Loyalty points are only ever earned once the payment is actually
  -- confirmed here -- never at checkout/place_order() time, so an abandoned
  -- or failed mobile money payment can't be farmed for free points.
  IF v_order.customer_id IS NOT NULL THEN
    v_points := GREATEST(5, floor(v_order.total_amount / 10));
    PERFORM public.apply_points(v_order.customer_id, v_points, 'Order payment reward', NULL, p_order_id);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_paid_order(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_paid_order(TEXT) TO service_role;

-- Cash-on-pickup orders never trigger a PawaPay webhook (no online payment
-- was ever attempted), so this is confirm_paid_order()'s equivalent for that
-- path: called by the customer themselves once they commit to "Pay on
-- Arrival" in the checkout wizard. Safe to let the customer call directly
-- (unlike confirm_paid_order) because there's no payment amount to trust or
-- forge here -- it only ever touches the caller's own order.
CREATE OR REPLACE FUNCTION public.confirm_arrival_order(p_order_id TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_order public.orders; v_points INTEGER;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id AND customer_id = auth.uid() FOR UPDATE;
  IF v_order.id IS NULL THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF v_order.payment_status IN ('Paid', 'Pending (Pay on Arrival)') THEN RETURN; END IF;

  UPDATE public.orders SET payment_status = 'Pending (Pay on Arrival)', payment_method = 'Pay on Arrival / Pickup' WHERE id = p_order_id;

  v_points := GREATEST(5, floor(v_order.total_amount / 10));
  PERFORM public.apply_points(v_order.customer_id, v_points, 'Order payment reward', NULL, p_order_id);
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_arrival_order(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_arrival_order(TEXT) TO authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS profiles_protect_sensitive_fields ON public.profiles;
CREATE TRIGGER profiles_protect_sensitive_fields BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

DROP TRIGGER IF EXISTS profiles_log_suspension_change ON public.profiles;
CREATE TRIGGER profiles_log_suspension_change AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_profile_suspension_change();

DROP TRIGGER IF EXISTS vendor_profiles_protect_verification ON public.vendor_profiles;
CREATE TRIGGER vendor_profiles_protect_verification BEFORE INSERT OR UPDATE ON public.vendor_profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_vendor_self_verification();

DROP TRIGGER IF EXISTS messages_notify_push ON public.messages;
CREATE TRIGGER messages_notify_push AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();

-- ==============================================================================
-- RLS Policies — drop everything first (including any legacy "Allow public
-- read/write" policies from an older version of this file) so re-running this
-- schema can never stack an old permissive policy on top of a restrictive one.
-- ==============================================================================
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY vendors_public_read ON public.vendor_profiles FOR SELECT TO anon, authenticated USING ((is_verified AND NOT public.is_user_suspended(id::uuid)) OR id = auth.uid()::text OR public.is_admin());
CREATE POLICY vendors_self_insert ON public.vendor_profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid()::text);
CREATE POLICY vendors_self_update ON public.vendor_profiles FOR UPDATE TO authenticated USING (id = auth.uid()::text OR public.is_admin()) WITH CHECK (id = auth.uid()::text OR public.is_admin());

CREATE POLICY services_public_read ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY services_admin_write ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
-- A vendor could add a service from their own Vendor Studio, but had no RLS
-- policy letting them write to public.services at all (only admins did) --
-- the insert silently failed, so it only ever showed up in that vendor's own
-- optimistic local state, never for any customer fetching the real table.
CREATE POLICY services_vendor_write ON public.services FOR ALL TO authenticated USING (auth.uid()::text = ANY(staff_ids)) WITH CHECK (auth.uid()::text = ANY(staff_ids));
CREATE POLICY addons_public_read ON public.service_add_ons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY addons_admin_write ON public.service_add_ons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY addons_vendor_write ON public.service_add_ons FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_add_ons.service_id AND auth.uid()::text = ANY(s.staff_ids))) WITH CHECK (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_add_ons.service_id AND auth.uid()::text = ANY(s.staff_ids)));
CREATE POLICY products_public_read ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY products_admin_write ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY products_vendor_write ON public.products FOR ALL TO authenticated USING (vendor_id = auth.uid()::text) WITH CHECK (vendor_id = auth.uid()::text);

CREATE POLICY bookings_participant_read ON public.bookings FOR SELECT TO authenticated USING (customer_id = auth.uid() OR staff_id = auth.uid()::text OR public.is_admin());
CREATE POLICY orders_customer_read ON public.orders FOR SELECT TO authenticated USING (customer_id = auth.uid() OR public.is_admin());
CREATE POLICY conversations_participant_read ON public.conversations FOR SELECT TO authenticated USING (customer_id = auth.uid() OR stylist_id = auth.uid()::text OR public.is_admin());
-- Chat previously had no write policy at all — every message send was being
-- silently dropped by RLS and only ever lived in local browser state.
CREATE POLICY conversations_participant_insert ON public.conversations FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid() OR stylist_id = auth.uid()::text);
CREATE POLICY conversations_participant_update ON public.conversations FOR UPDATE TO authenticated USING (customer_id = auth.uid() OR stylist_id = auth.uid()::text OR public.is_admin()) WITH CHECK (customer_id = auth.uid() OR stylist_id = auth.uid()::text OR public.is_admin());
CREATE POLICY messages_participant_read ON public.messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND (c.customer_id = auth.uid() OR c.stylist_id = auth.uid()::text OR public.is_admin())));
CREATE POLICY messages_participant_insert ON public.messages FOR INSERT TO authenticated WITH CHECK (NOT public.is_user_suspended(auth.uid()) AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND (c.customer_id = auth.uid() OR c.stylist_id = auth.uid()::text)));
CREATE POLICY wallets_owner_read ON public.vendor_wallets FOR SELECT TO authenticated USING (vendor_id = auth.uid()::text OR public.is_admin());
CREATE POLICY payouts_owner_read ON public.vendor_payouts FOR SELECT TO authenticated USING (vendor_id = auth.uid()::text OR public.is_admin());
CREATE POLICY ledger_owner_read ON public.points_ledger FOR SELECT TO authenticated USING (profile_id = auth.uid() OR public.is_admin());
CREATE POLICY payments_participant_read ON public.payment_transactions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = payment_transactions.booking_id AND (b.customer_id = auth.uid() OR b.staff_id = auth.uid()::text OR public.is_admin())));

-- Reviews are always public (that's the point — real social proof), but only
-- ever written through submit_review() above, never a direct client insert.
CREATE POLICY reviews_public_read ON public.reviews FOR SELECT TO anon, authenticated USING (true);

-- Analytics: open write (including anonymous/pre-signup funnel events) so the
-- product can finally measure activation and retention; read is admin-only.
CREATE POLICY analytics_insert ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY analytics_admin_read ON public.analytics_events FOR SELECT TO authenticated USING (public.is_admin());

-- Product sales are only ever written by place_order() below — a vendor can
-- read their own sales history but never write to it directly.
CREATE POLICY product_sales_vendor_read ON public.product_sales FOR SELECT TO authenticated USING (vendor_id = auth.uid()::text OR public.is_admin());

-- Each user manages only their own device push subscriptions.
CREATE POLICY push_subscriptions_owner_all ON public.push_subscriptions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Platform fee deductions are only ever written by transition_booking()/
-- confirm_paid_order() below — a vendor can see their own fee history, never write to it.
CREATE POLICY platform_fees_vendor_read ON public.platform_fees FOR SELECT TO authenticated USING (vendor_id = auth.uid()::text OR public.is_admin());

-- A reporter can file a report and see their own past reports; only admins
-- see (and act on) the full queue.
CREATE POLICY reports_insert ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid() AND reported_user_id != auth.uid());
CREATE POLICY reports_read ON public.reports FOR SELECT TO authenticated USING (reporter_id = auth.uid() OR public.is_admin());
CREATE POLICY reports_admin_update ON public.reports FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Service-role functions/Edge Functions write financial and booking state. Clients
-- have read-only access to those records, preventing balance/refund manipulation.
REVOKE ALL ON public.points_ledger, public.payment_transactions, public.audit_log FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_points(UUID, INTEGER, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.request_booking(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.transition_booking(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_booking(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transition_booking(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Provision administrators by SQL only; never by email or password logic in the client:
-- UPDATE public.profiles SET role = 'admin' WHERE id = '<auth-user-uuid>';

-- ==============================================================================
-- Storage: real photo uploads (vendor avatars, portfolio, product images)
-- replacing the old base64-data-URL-in-a-text-column approach. Each user
-- writes only inside a folder named after their own auth uid; anyone can read.
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS media_public_read ON storage.objects;
CREATE POLICY media_public_read ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');

DROP POLICY IF EXISTS media_owner_write ON storage.objects;
CREATE POLICY media_owner_write ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS media_owner_update ON storage.objects;
CREATE POLICY media_owner_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS media_owner_delete ON storage.objects;
CREATE POLICY media_owner_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ==============================================================================
-- Enable Realtime for live updates (guarded — ALTER PUBLICATION ... ADD TABLE
-- errors if the table is already a member, so check pg_publication_tables first)
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bookings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

-- ==============================================================================
-- Initial Seed Data (safe to re-run — ON CONFLICT DO NOTHING)
-- No stylists/vendor wallets are seeded — real stylists sign up and get
-- verified through the normal onboarding flow. The service/product catalog
-- below is real starter inventory, not tied to any fake stylist or reviews.
-- ==============================================================================
INSERT INTO public.services (id, name, category, price, duration, description, image, popular, can_travel, in_studio, staff_ids)
VALUES
('srv-1', 'Student Signature Fade & Lineup', 'Barbering', 90, 40, 'Crisp skin fade, taper or low cut with clean razor edge lineup, hot towel treatment and aftershave spritz.', '/images/barber_service.jpg', true, true, true, ARRAY[]::TEXT[]),
('srv-2', 'Medium Knotless Boho Braids', 'Braids & Natural Hair', 240, 180, 'Painless, feather-light knotless box braids with curly human-blend tendrils. Gentle on campus edges.', '/images/hair_braids.jpg', true, true, true, ARRAY[]::TEXT[]),
('srv-3', 'Wig Revamp & Glueless Install', 'Wigs & Weaves', 180, 75, 'Wig wash, deep condition, lace customization, plucking and flat glueless band installation.', '/images/wig_care.jpg', true, true, true, ARRAY[]::TEXT[]),
('srv-4', 'Loc Retwist & Scalp Detox', 'Locs', 150, 90, 'Organic apple cider vinegar wash, deep conditioning scalp steam, palm roll retwist, and styling.', '/images/locs_care.jpg', false, true, true, ARRAY[]::TEXT[]),
('srv-5', 'Gel Overlay & French Tip Nails', 'Nails & Lashes', 120, 60, 'Long-lasting Russian prep manicure with builder gel overlay and hand-painted French tips.', '/images/nail_care.jpg', true, false, true, ARRAY[]::TEXT[])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category, price, stock, image, rating, reviews_count, description)
VALUES
('prd-1', 'Miracle Scalp Growth Oil (100ml)', 'Hair Care Products', 120, 24, '/images/hair_product.jpg', 0, 0, 'Infused with rosemary, peppermint, and biotin. Fast hair growth, combats itchy scalp in student dorms.'),
('prd-2', 'Silk Satin Night Bonnet (Reversible)', 'Hair Care Products', 75, 40, '/images/hair_product.jpg', 0, 0, 'Premium double-layer mulberry satin bonnet. Protects braids, wigs, and curls while sleeping.'),
('prd-3', '24H Max Edge Taming Gel (150g)', 'Hair Care Products', 60, 35, '/images/hair_product.jpg', 0, 0, 'Non-flaking, non-greasy extreme hold edge control formulated for all-day Lusaka campus weather.'),
('prd-4', 'Professional Cordless T-Blade Trimmer', 'Hair Care Products', 350, 8, '/images/hair_product.jpg', 0, 0, 'Zero-gap stainless steel blades, rechargeable USB-C battery. Perfect for personal dorm grooming.')
ON CONFLICT (id) DO NOTHING;
