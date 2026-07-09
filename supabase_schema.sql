-- supabase_schema.sql
-- Database Migrations for Dogesh Signal Backend Architecture
-- Targets PostgreSQL / Supabase Database Schema

-- 1. PROFILES TABLE
-- Extends the metadata of authenticated users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'sniff' CHECK (plan IN ('sniff', 'guard', 'shield')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. ANALYSIS HISTORY TABLE
-- Logs individual message scans
CREATE TABLE IF NOT EXISTS public.analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    analysis JSONB NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Analysis History
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
    ON public.analysis_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
    ON public.analysis_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
    ON public.analysis_history FOR DELETE
    USING (auth.uid() = user_id);

-- Performance Index for History Queries
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON public.analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at ON public.analysis_history(created_at DESC);

-- 3. USAGE LIMITS TABLE
-- Tracks daily active scans per account
CREATE TABLE IF NOT EXISTS public.usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    analyses_today INTEGER NOT NULL DEFAULT 0 CHECK (analyses_today >= 0),
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Usage
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage"
    ON public.usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System/Users can update own usage count"
    ON public.usage FOR UPDATE
    USING (auth.uid() = user_id);

-- Index for User lookup in usage
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON public.usage(user_id);

-- 4. CREDIT PACKS TABLE
-- Manages purchased prepaid scan credits
CREATE TABLE IF NOT EXISTS public.credit_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    remaining_credits INTEGER NOT NULL DEFAULT 0 CHECK (remaining_credits >= 0),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for Credit Packs
ALTER TABLE public.credit_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own credit packs"
    ON public.credit_packs FOR SELECT
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_credit_packs_user_id ON public.credit_packs(user_id);

-- 5. PROFILE TRIGGER ON SIGNUP
-- Automatically populate profiles on Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, plan)
    VALUES (new.id, new.email, 'sniff');
    
    INSERT INTO public.usage (user_id, analyses_today, last_reset)
    VALUES (new.id, 0, now());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. PLAN STATUS COLUMN ON PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_status TEXT NOT NULL DEFAULT 'ACTIVE' 
    CHECK (plan_status IN ('ACTIVE', 'PENDING', 'FAILED', 'CANCELLED', 'PAST_DUE', 'EXPIRED'));

-- 7. PAYMENTS AUDIT & ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id TEXT NOT NULL,
    payment_id TEXT UNIQUE, -- Nullable initially (when pending), becomes unique once verified
    order_id TEXT,
    amount INTEGER NOT NULL, -- In cents
    currency TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'FAILED', 'CANCELLED', 'PAST_DUE', 'EXPIRED')),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for payment checks
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

-- 8. AUDIT & LOGGING TABLE
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_created ON public.analysis_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_sub_status_created ON public.payments(subscription_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_user_reset ON public.usage(user_id, last_reset);


