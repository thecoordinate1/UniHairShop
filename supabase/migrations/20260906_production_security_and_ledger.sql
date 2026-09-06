-- Production hardening. Apply only together with the secure RPC/Edge Function
-- rollout: it intentionally removes anonymous public access to student data.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id);
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id);

CREATE TABLE IF NOT EXISTS public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL CHECK (points <> 0),
  value_zmw NUMERIC(12,2) GENERATED ALWAYS AS (points * 0.15) STORED,
  reason TEXT NOT NULL,
  booking_id TEXT REFERENCES public.bookings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
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
    RETURN NEW;
  END IF;
  IF auth.uid() = OLD.id AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.loyalty_points := OLD.loyalty_points;
    NEW.referral_code := OLD.referral_code;
    NEW.referral_count := OLD.referral_count;
    NEW.points_history := OLD.points_history;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_points(p_profile_id UUID, p_points INTEGER, p_reason TEXT, p_booking_id TEXT DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_history JSONB;
BEGIN
  IF p_points = 0 THEN RAISE EXCEPTION 'Points adjustment cannot be zero'; END IF;
  PERFORM set_config('app.unihair_trusted', 'on', true);
  INSERT INTO public.points_ledger (profile_id, points, reason, booking_id) VALUES (p_profile_id, p_points, p_reason, p_booking_id);
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.request_booking(
  p_service_id TEXT, p_service_name TEXT, p_category TEXT, p_staff_id TEXT, p_date TEXT, p_time TEXT,
  p_hostel TEXT, p_service_type TEXT, p_price NUMERIC, p_total_price NUMERIC, p_add_ons JSONB DEFAULT '[]'::jsonb
) RETURNS public.bookings LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_profile public.profiles; v_booking public.bookings; v_vendor public.vendor_profiles;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
  SELECT * INTO v_vendor FROM public.vendor_profiles WHERE id = p_staff_id AND is_verified = true;
  IF v_profile.id IS NULL OR v_vendor.id IS NULL THEN RAISE EXCEPTION 'Choose a verified stylist'; END IF;
  IF p_total_price < 0 OR p_price < 0 THEN RAISE EXCEPTION 'Invalid price'; END IF;
  IF EXISTS (SELECT 1 FROM public.bookings WHERE staff_id = p_staff_id AND date = p_date AND time = p_time AND status IN ('Requested','Confirmed','In Progress')) THEN RAISE EXCEPTION 'That time is no longer available'; END IF;
  INSERT INTO public.bookings (id, customer_id, service_id, service_name, category, staff_id, staff_name, date, time, campus, hostel, service_type, customer_name, customer_phone, selected_add_ons, price, total_price, payment_method, payment_status, status)
  VALUES ('UHS-' || replace(gen_random_uuid()::text, '-', ''), auth.uid(), p_service_id, p_service_name, p_category, p_staff_id, v_vendor.name, p_date, p_time, v_profile.campus, p_hostel, p_service_type, v_profile.name, v_profile.phone, p_add_ons, p_price, p_total_price, 'Payment pending', 'Pending payment setup', 'Requested')
  RETURNING * INTO v_booking;
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id) VALUES (auth.uid(), 'booking_requested', 'booking', v_booking.id);
  RETURN v_booking;
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_booking(p_booking_id TEXT, p_status TEXT, p_date TEXT DEFAULT NULL, p_time TEXT DEFAULT NULL)
RETURNS public.bookings LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_booking public.bookings; v_points INTEGER;
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
  END IF;
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata) VALUES (auth.uid(), lower(replace(p_status, ' ', '_')), 'booking', p_booking_id, jsonb_build_object('status', p_status));
  RETURN v_booking;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_sensitive_fields ON public.profiles;
CREATE TRIGGER profiles_protect_sensitive_fields BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

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

DROP TRIGGER IF EXISTS vendor_profiles_protect_verification ON public.vendor_profiles;
CREATE TRIGGER vendor_profiles_protect_verification BEFORE INSERT OR UPDATE ON public.vendor_profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_vendor_self_verification();

-- Replace the insecure development policies. Never expose hostels, phones,
-- messages, wallets, payouts, or orders through public policies.
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

CREATE POLICY vendors_public_read ON public.vendor_profiles FOR SELECT TO anon, authenticated USING (is_verified OR id = auth.uid()::text OR public.is_admin());
CREATE POLICY vendors_self_insert ON public.vendor_profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid()::text);
CREATE POLICY vendors_self_update ON public.vendor_profiles FOR UPDATE TO authenticated USING (id = auth.uid()::text OR public.is_admin()) WITH CHECK (id = auth.uid()::text OR public.is_admin());

CREATE POLICY services_public_read ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY services_admin_write ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY addons_public_read ON public.service_add_ons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY addons_admin_write ON public.service_add_ons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY products_public_read ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY products_admin_write ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY bookings_participant_read ON public.bookings FOR SELECT TO authenticated USING (customer_id = auth.uid() OR staff_id = auth.uid()::text OR public.is_admin());
CREATE POLICY orders_customer_read ON public.orders FOR SELECT TO authenticated USING (customer_id = auth.uid() OR public.is_admin());
CREATE POLICY conversations_participant_read ON public.conversations FOR SELECT TO authenticated USING (customer_id = auth.uid() OR stylist_id = auth.uid()::text OR public.is_admin());
CREATE POLICY messages_participant_read ON public.messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND (c.customer_id = auth.uid() OR c.stylist_id = auth.uid()::text OR public.is_admin())));
CREATE POLICY wallets_owner_read ON public.vendor_wallets FOR SELECT TO authenticated USING (vendor_id = auth.uid()::text OR public.is_admin());
CREATE POLICY payouts_owner_read ON public.vendor_payouts FOR SELECT TO authenticated USING (vendor_id = auth.uid()::text OR public.is_admin());
CREATE POLICY ledger_owner_read ON public.points_ledger FOR SELECT TO authenticated USING (profile_id = auth.uid() OR public.is_admin());
CREATE POLICY payments_participant_read ON public.payment_transactions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = payment_transactions.booking_id AND (b.customer_id = auth.uid() OR b.staff_id = auth.uid()::text OR public.is_admin())));

-- Service-role functions/Edge Functions write financial and booking state. Clients
-- have read-only access to those records, preventing balance/refund manipulation.
REVOKE ALL ON public.points_ledger, public.payment_transactions, public.audit_log FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_points(UUID, INTEGER, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.request_booking(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.transition_booking(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_booking(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transition_booking(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Provision administrators by SQL only; never by email or password logic in the client:
-- UPDATE public.profiles SET role = 'admin' WHERE id = '<auth-user-uuid>';
