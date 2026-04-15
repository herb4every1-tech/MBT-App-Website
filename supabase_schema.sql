-- =========================================================
-- MBT MASTER SUPABASE SCHEMA (Last Generated: April 15, 2026)
-- Use this script to restore or replicate the MBT Database.
-- =========================================================

-- =========================================================
-- Extensions (detected)
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =========================================================
-- public.profiles
-- =========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text,
  plan text DEFAULT 'free'::text CHECK (plan = ANY (ARRAY['free'::text, 'pro'::text])),
  language_preference text DEFAULT 'English'::text,
  mistral_api_key text,
  month_count integer DEFAULT 0,
  agreed_to_terms boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text]))
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO public USING (role = 'admin') WITH CHECK (role = 'admin');
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO public USING (role = 'admin');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO public USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO public USING (auth.uid() = id);

-- =========================================================
-- public.analyses
-- =========================================================
CREATE TABLE IF NOT EXISTS public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  test_parameter text,
  value text,
  status text,
  result jsonb,
  summary text,
  language text,
  created_at timestamptz DEFAULT now(),
  chat_history jsonb DEFAULT '[]'::jsonb,
  chat_message_count integer DEFAULT 0
);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ADD CONSTRAINT analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id);

-- Policies
CREATE POLICY "Users can insert own analyses" ON public.analyses FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own analyses" ON public.analyses FOR SELECT TO public USING (auth.uid() = user_id);

-- =========================================================
-- public.app_settings
-- =========================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE,
  value jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow admins to insert settings" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'::text)));
CREATE POLICY "Allow admins to read settings" ON public.app_settings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'::text)));
CREATE POLICY "Allow admins to update settings" ON public.app_settings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'::text)));

-- =========================================================
-- public.ai_system_settings
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  free_limit integer DEFAULT 3,
  free_model text DEFAULT 'mistral-small-3.2-24b'::text,
  pro_model text DEFAULT 'pixtral-large-latest'::text,
  system_message text,
  api_key text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_system_settings ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- public.subscriptions
-- =========================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text,
  start_date timestamptz,
  renewal_date timestamptz,
  plan_type text DEFAULT 'pro'::text,
  stripe_customer_id text,
  stripe_price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id);

-- Policies
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'::text)));
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT TO public USING (auth.uid() = user_id);

-- =========================================================
-- public.usage_logs
-- =========================================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  model_used text,
  api_cost numeric,
  created_at timestamptz DEFAULT now()
);

-- =========================================================
-- public.notifications
-- =========================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text,
  body text,
  target_audience text,
  sent_at timestamptz DEFAULT now()
);

-- =========================================================
-- public.documents
-- =========================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  content text,
  metadata jsonb,
  embedding vector
);

-- =========================================================
-- public.stripe_settings
-- =========================================================
CREATE TABLE IF NOT EXISTS public.stripe_settings (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  stripe_secret_key text,
  stripe_payment_link text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.stripe_settings ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- public.contact_messages
-- =========================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert contact messages" ON public.contact_messages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow admins to read messages" ON public.contact_messages FOR SELECT TO public USING (EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'::text)));
CREATE POLICY "Allow admins to delete messages" ON public.contact_messages FOR DELETE TO public USING (EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'::text)));
CREATE POLICY "Allow admins to update messages" ON public.contact_messages FOR UPDATE TO public USING (EXISTS (SELECT 1 FROM public.profiles WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'::text)));
