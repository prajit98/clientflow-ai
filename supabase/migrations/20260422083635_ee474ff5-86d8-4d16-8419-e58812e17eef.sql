
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  niche TEXT,
  experience_level TEXT DEFAULT 'intermediate',
  plan TEXT NOT NULL DEFAULT 'free',
  daily_job_limit INT NOT NULL DEFAULT 25,
  proposal_credit_limit INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  source_job_id TEXT,
  canonical_url TEXT,
  title TEXT NOT NULL,
  description_clean TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  is_hourly BOOLEAN DEFAULT false,
  niche TEXT,
  country TEXT,
  remote_type TEXT DEFAULT 'remote',
  posted_at TIMESTAMPTZ,
  freshness_hours INT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed view active jobs" ON public.jobs
  FOR SELECT TO authenticated USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage jobs" ON public.jobs
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Job scores
CREATE TABLE public.job_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  quality_score NUMERIC,
  budget_score NUMERIC,
  clarity_score NUMERIC,
  spam_risk NUMERIC,
  beginner_friendly BOOLEAN DEFAULT false,
  opportunity_score NUMERIC,
  reason_short TEXT,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed view scores" ON public.job_scores
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage scores" ON public.job_scores
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Job interactions
CREATE TABLE public.job_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own interactions" ON public.job_interactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own interactions" ON public.job_interactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all interactions" ON public.job_interactions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Credit transactions
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own credits" ON public.credit_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own credits" ON public.credit_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_posted_at ON public.jobs(posted_at DESC);
CREATE INDEX idx_job_scores_job_id ON public.job_scores(job_id);
CREATE INDEX idx_interactions_user ON public.job_interactions(user_id, created_at DESC);
