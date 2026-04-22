
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Seed 20 jobs
WITH inserted AS (
  INSERT INTO public.jobs (source, source_job_id, canonical_url, title, description_clean, budget_min, budget_max, currency, is_hourly, niche, country, remote_type, posted_at, freshness_hours, status)
  VALUES
  ('upwork','UW-1001','https://example.com/j/1001','Shopify developer for headless storefront migration','We are migrating from a legacy Shopify theme to a Next.js headless storefront. Need an experienced dev to build product, collection, and checkout flows.', 4000, 8000, 'USD', false, 'web-development', 'US', 'remote', now() - interval '2 hours', 2, 'active'),
  ('upwork','UW-1002','https://example.com/j/1002','Senior React + TypeScript engineer (long-term)','Looking for a senior React engineer to join our small SaaS team part-time. Strong TypeScript and testing required.', 60, 90, 'USD', true, 'web-development', 'CA', 'remote', now() - interval '5 hours', 5, 'active'),
  ('freelancer','FL-2003','https://example.com/j/2003','Brand identity and logo for fintech startup','Series A fintech needs a polished brand identity: logo, color palette, typography, and a 12-page brand guide.', 2500, 5000, 'USD', false, 'design', 'UK', 'remote', now() - interval '1 hours', 1, 'active'),
  ('upwork','UW-1004','https://example.com/j/1004','Webflow site redesign for B2B SaaS','Replace existing marketing site (8 pages) with a modern Webflow build. Designs provided in Figma.', 3000, 6000, 'USD', false, 'design', 'US', 'remote', now() - interval '8 hours', 8, 'active'),
  ('upwork','UW-1005','https://example.com/j/1005','SEO content writer (B2B SaaS, 4 articles/mo)','Recurring engagement: 4 long-form articles per month, 1500-2000 words each, with keyword research.', 250, 400, 'USD', false, 'writing', 'US', 'remote', now() - interval '12 hours', 12, 'active'),
  ('peopleperhour','PPH-3006','https://example.com/j/3006','Quick logo edit (2 hours)','Need minor tweaks to an existing logo file. AI source provided.', 50, 100, 'USD', false, 'design', 'AU', 'remote', now() - interval '20 hours', 20, 'active'),
  ('upwork','UW-1007','https://example.com/j/1007','Full-stack engineer for AI document tool','Build a document Q&A tool using Next.js, Supabase, and OpenAI. MVP in 6 weeks.', 8000, 15000, 'USD', false, 'web-development', 'DE', 'remote', now() - interval '3 hours', 3, 'active'),
  ('freelancer','FL-2008','https://example.com/j/2008','WordPress speed optimization','Site is loading in 6s. Need it under 2s. Caching, image optimization, JS deferral.', 300, 600, 'USD', false, 'web-development', 'IN', 'remote', now() - interval '30 hours', 30, 'active'),
  ('upwork','UW-1009','https://example.com/j/1009','Mobile UX designer for fitness app','Redesign onboarding and workout flows for an iOS fitness app. 3-week project.', 4500, 7000, 'USD', false, 'design', 'US', 'remote', now() - interval '6 hours', 6, 'active'),
  ('upwork','UW-1010','https://example.com/j/1010','Email copywriter — 5-part welcome sequence','Write a 5-email welcome sequence for a productivity SaaS. Strong portfolio required.', 800, 1500, 'USD', false, 'writing', 'US', 'remote', now() - interval '4 hours', 4, 'active'),
  ('upwork','UW-1011','https://example.com/j/1011','Vue 3 component library work','Extend an internal Vue 3 + Tailwind component library. ~20 components.', 50, 75, 'USD', true, 'web-development', 'NL', 'remote', now() - interval '15 hours', 15, 'active'),
  ('freelancer','FL-2012','https://example.com/j/2012','Build me a website cheap fast urgent!!!','need website for my business asap, budget very low but i pay good if you fast', 50, 100, 'USD', false, 'web-development', 'XX', 'remote', now() - interval '40 hours', 40, 'active'),
  ('upwork','UW-1013','https://example.com/j/1013','Data viz dashboard in D3.js','Build 4 interactive charts for an analytics dashboard. Designs and data provided.', 2000, 3500, 'USD', false, 'web-development', 'US', 'remote', now() - interval '7 hours', 7, 'active'),
  ('upwork','UW-1014','https://example.com/j/1014','Illustrator for SaaS marketing site','Need 8 custom spot illustrations in a friendly, modern style for our new homepage.', 1500, 3000, 'USD', false, 'design', 'FR', 'remote', now() - interval '10 hours', 10, 'active'),
  ('peopleperhour','PPH-3015','https://example.com/j/3015','Technical writer — API docs','Write developer-facing API documentation for a payments API. OpenAPI spec provided.', 70, 110, 'USD', true, 'writing', 'UK', 'remote', now() - interval '9 hours', 9, 'active'),
  ('upwork','UW-1016','https://example.com/j/1016','Framer designer for landing page','Design and build a beautiful landing page in Framer. Strong motion design a plus.', 1800, 3500, 'USD', false, 'design', 'US', 'remote', now() - interval '18 hours', 18, 'active'),
  ('upwork','UW-1017','https://example.com/j/1017','Backend engineer — Node + Postgres','Build a multi-tenant API with auth, billing, and webhooks. Long-term.', 70, 100, 'USD', true, 'web-development', 'US', 'remote', now() - interval '11 hours', 11, 'active'),
  ('upwork','UW-1018','https://example.com/j/1018','Notion template designer','Design 3 Notion templates for solopreneurs (CRM, content calendar, finances).', 500, 1200, 'USD', false, 'design', 'CA', 'remote', now() - interval '22 hours', 22, 'active'),
  ('freelancer','FL-2019','https://example.com/j/2019','Ghostwriter for tech CEO LinkedIn','Ongoing ghostwriting — 3 LinkedIn posts/week, voice-matched.', 1500, 2500, 'USD', false, 'writing', 'US', 'remote', now() - interval '14 hours', 14, 'active'),
  ('upwork','UW-1020','https://example.com/j/1020','Astro + Tailwind blog migration','Migrate a 200-post WordPress blog to Astro + Tailwind. SEO must be preserved.', 2500, 5000, 'USD', false, 'web-development', 'AU', 'remote', now() - interval '16 hours', 16, 'active')
  RETURNING id, source_job_id
)
INSERT INTO public.job_scores (job_id, quality_score, budget_score, clarity_score, spam_risk, beginner_friendly, opportunity_score, reason_short)
SELECT id,
  CASE source_job_id
    WHEN 'FL-2012' THEN 22 WHEN 'PPH-3006' THEN 55 WHEN 'FL-2008' THEN 60
    ELSE 70 + (random()*25)::int END,
  CASE source_job_id WHEN 'FL-2012' THEN 18 WHEN 'PPH-3006' THEN 40 ELSE 65 + (random()*30)::int END,
  CASE source_job_id WHEN 'FL-2012' THEN 25 ELSE 70 + (random()*25)::int END,
  CASE source_job_id WHEN 'FL-2012' THEN 88 WHEN 'PPH-3006' THEN 30 ELSE (random()*15)::int END,
  source_job_id IN ('PPH-3006','FL-2008','UW-1018'),
  CASE source_job_id
    WHEN 'FL-2012' THEN 12 WHEN 'PPH-3006' THEN 48 WHEN 'FL-2008' THEN 58
    ELSE 72 + (random()*25)::int END,
  CASE source_job_id
    WHEN 'FL-2012' THEN 'Vague scope, suspiciously low budget'
    WHEN 'PPH-3006' THEN 'Tiny budget, low upside'
    WHEN 'FL-2008' THEN 'Clear scope but limited budget'
    ELSE 'Clear scope, healthy budget, reputable source' END
FROM inserted;
