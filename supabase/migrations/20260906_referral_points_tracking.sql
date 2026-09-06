-- ==============================================================================
-- Migration: 20260906_referral_points_tracking.sql
-- Description: Adds referral code tracking, friend counts, and points history
-- ==============================================================================

-- 1. Add referred_by to track who referred the user
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- 2. Add referral_count to track how many friends joined with user's code
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_count INT DEFAULT 0;

-- 3. Add points_history to store JSON log of all point transactions
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points_history JSONB DEFAULT '[]'::jsonb;

-- 4. Ensure referral_code is unique index if not already
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code) WHERE referral_code IS NOT NULL;
