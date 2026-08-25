-- ==============================================================================
-- UniHairShop — Complete PostgreSQL Schema for Supabase
-- Tables: profiles, vendor_profiles, services, service_add_ons, products,
--         bookings, orders, conversations, messages, vendor_wallets, vendor_payouts
-- ==============================================================================

-- 1. PROFILES (Students & Stylists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  campus TEXT DEFAULT 'UNILUS Silverest Campus',
  hostel TEXT,
  role TEXT DEFAULT 'student', -- 'student', 'vendor', 'admin'
  loyalty_points INT DEFAULT 0,
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. VENDOR PROFILES (Campus Stylists & Barbers)
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  campus TEXT NOT NULL,
  dorm_location TEXT,
  avatar TEXT,
  is_verified BOOLEAN DEFAULT true,
  badge TEXT DEFAULT 'Verified Campus Stylist',
  travels_to_dorm BOOLEAN DEFAULT true,
  travel_fee NUMERIC DEFAULT 20,
  has_studio BOOLEAN DEFAULT true,
  phone TEXT,
  bio TEXT,
  rating NUMERIC DEFAULT 4.9,
  reviews_count INT DEFAULT 0,
  portfolio JSONB DEFAULT '[]'::jsonb,
  payout_provider TEXT DEFAULT 'Airtel Money',
  payout_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

-- 5. PRODUCTS (Campus Hair Care Essentials & Cosmetics)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock INT DEFAULT 10,
  image TEXT,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- Enables public read/write for live client interaction
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

CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public write on profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Allow public read on vendor_profiles" ON public.vendor_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public write on vendor_profiles" ON public.vendor_profiles FOR ALL USING (true);

CREATE POLICY "Allow public read on services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow public write on services" ON public.services FOR ALL USING (true);

CREATE POLICY "Allow public read on service_add_ons" ON public.service_add_ons FOR SELECT USING (true);
CREATE POLICY "Allow public write on service_add_ons" ON public.service_add_ons FOR ALL USING (true);

CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public write on products" ON public.products FOR ALL USING (true);

CREATE POLICY "Allow public read on bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public write on bookings" ON public.bookings FOR ALL USING (true);

CREATE POLICY "Allow public read on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public write on orders" ON public.orders FOR ALL USING (true);

CREATE POLICY "Allow public read on conversations" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Allow public write on conversations" ON public.conversations FOR ALL USING (true);

CREATE POLICY "Allow public read on messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow public write on messages" ON public.messages FOR ALL USING (true);

CREATE POLICY "Allow public read on vendor_wallets" ON public.vendor_wallets FOR SELECT USING (true);
CREATE POLICY "Allow public write on vendor_wallets" ON public.vendor_wallets FOR ALL USING (true);

CREATE POLICY "Allow public read on vendor_payouts" ON public.vendor_payouts FOR SELECT USING (true);
CREATE POLICY "Allow public write on vendor_payouts" ON public.vendor_payouts FOR ALL USING (true);

-- Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ==============================================================================
-- Initial Seed Data
-- ==============================================================================
INSERT INTO public.vendor_profiles (id, name, role, campus, dorm_location, avatar, is_verified, badge, travels_to_dorm, travel_fee, has_studio, phone, bio, rating, reviews_count, payout_provider, payout_number)
VALUES
('stf-1', 'Junior "The Fade King"', 'Master Barber & Stylist', 'UNILUS Silverest Campus', 'Silverest Hostel, Block C, Room 14', '/images/barber_service.jpg', true, 'Verified Campus Stylist', true, 20, true, '0971234567', 'Campus favorite barber at UNILUS Silverest. 4+ years precision fades and beard sculpting. I travel to student rooms or host in Block C!', 4.9, 128, 'Airtel Money', '0971234567'),
('stf-2', 'Thandiwe Banda', 'Lead Natural Hair & Braids Specialist', 'UNILUS Silverest Campus', 'Silverest Girls Hostel, Block A, Room 08', '/images/hair_braids.jpg', true, 'Verified Campus Stylist', true, 25, true, '0977654321', 'Specialist in painless knotless braids, stitch lines, wig styling and natural hair maintenance for university students.', 5.0, 94, 'MTN Mobile Money', '0977654321'),
('stf-3', 'Lupita Mwale', 'Nail Artist & Lash Technician', 'UNZA Great East Campus', 'October Hostel, Room 22', '/images/nail_care.jpg', true, 'Verified Campus Stylist', false, 0, true, '0966543210', 'Acrylic sets, gel overlays, polygel, and lash extensions. Quick turnaround between lectures!', 4.8, 67, 'Airtel Money', '0966543210')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.services (id, name, category, price, duration, description, image, popular, can_travel, in_studio, staff_ids)
VALUES
('srv-1', 'Student Signature Fade & Lineup', 'Barbering', 90, 40, 'Crisp skin fade, taper or low cut with clean razor edge lineup, hot towel treatment and aftershave spritz.', '/images/barber_service.jpg', true, true, true, ARRAY['stf-1']),
('srv-2', 'Medium Knotless Boho Braids', 'Braids & Natural Hair', 240, 180, 'Painless, feather-light knotless box braids with curly human-blend tendrils. Gentle on campus edges.', '/images/hair_braids.jpg', true, true, true, ARRAY['stf-2']),
('srv-3', 'Wig Revamp & Glueless Install', 'Wigs & Weaves', 180, 75, 'Wig wash, deep condition, lace customization, plucking and flat glueless band installation.', '/images/wig_care.jpg', true, true, true, ARRAY['stf-2']),
('srv-4', 'Loc Retwist & Scalp Detox', 'Locs', 150, 90, 'Organic apple cider vinegar wash, deep conditioning scalp steam, palm roll retwist, and styling.', '/images/locs_care.jpg', false, true, true, ARRAY['stf-1']),
('srv-5', 'Gel Overlay & French Tip Nails', 'Nails & Lashes', 120, 60, 'Long-lasting Russian prep manicure with builder gel overlay and hand-painted French tips.', '/images/nail_care.jpg', true, false, true, ARRAY['stf-3'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category, price, stock, image, rating, reviews_count, description)
VALUES
('prd-1', 'Miracle Scalp Growth Oil (100ml)', 'Hair Care Products', 120, 24, '/images/hair_product.jpg', 4.9, 38, 'Infused with rosemary, peppermint, and biotin. Fast hair growth, combats itchy scalp in student dorms.'),
('prd-2', 'Silk Satin Night Bonnet (Reversible)', 'Hair Care Products', 75, 40, '/images/hair_product.jpg', 4.8, 52, 'Premium double-layer mulberry satin bonnet. Protects braids, wigs, and curls while sleeping.'),
('prd-3', '24H Max Edge Taming Gel (150g)', 'Hair Care Products', 60, 35, '/images/hair_product.jpg', 4.7, 41, 'Non-flaking, non-greasy extreme hold edge control formulated for all-day Lusaka campus weather.'),
('prd-4', 'Professional Cordless T-Blade Trimmer', 'Hair Care Products', 350, 8, '/images/hair_product.jpg', 5.0, 19, 'Zero-gap stainless steel blades, rechargeable USB-C battery. Perfect for personal dorm grooming.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.vendor_wallets (id, vendor_id, available_balance, pending_balance, total_earned, completed_jobs_count)
VALUES
('w-stf-1', 'stf-1', 640, 125, 3450, 42)
ON CONFLICT (vendor_id) DO NOTHING;
