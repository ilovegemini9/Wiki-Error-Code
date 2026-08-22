-- supabase/migrations/001_initial_schema.sql

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  device_types TEXT[],
  description TEXT,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  error_code TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  short_definition TEXT,
  meaning TEXT,
  causes JSONB DEFAULT '[]'::jsonb,
  solutions JSONB DEFAULT '[]'::jsonb,
  technical_explanation TEXT,
  faq JSONB DEFAULT '[]'::jsonb,
  schema_jsonld TEXT,
  canonical_url TEXT,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id TEXT REFERENCES public.brands(id) ON DELETE SET NULL,
  device_type TEXT,
  language TEXT,
  keywords TEXT[],
  tags TEXT[],
  featured_image TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft','published')),
  reading_time TEXT,
  internal_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  scheduled_for TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  seo_score INTEGER,
  ai_generated BOOLEAN DEFAULT false,
  raw JSONB,
  -- For full text search convenience
  tsv tsvector
);

-- Create AI generation logs table
CREATE TABLE IF NOT EXISTS public.ai_generation_logs (
  id TEXT PRIMARY KEY,
  error_code TEXT,
  brand TEXT,
  device TEXT,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT CHECK (status IN ('completed','failed')),
  article_id TEXT REFERENCES public.articles(id) ON DELETE SET NULL,
  prompt_text TEXT,
  response_summary TEXT,
  usage JSONB
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- Create global settings table (singleton row with id='global')
CREATE TABLE IF NOT EXISTS public.global_settings (
  id TEXT PRIMARY KEY,
  site_name TEXT,
  site_url TEXT,
  openrouter_api_key TEXT,
  default_ai_model TEXT,
  language TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  google_analytics_id TEXT,
  google_search_console_tag TEXT,
  google_search_console_meta TEXT,
  ads_txt_content TEXT,
  robots_txt_content TEXT,
  default_language TEXT,
  sitemap_settings JSONB,
  automation_active BOOLEAN,
  automation_interval_minutes INTEGER,
  automation_languages TEXT[],
  automation_publish_status TEXT,
  automation_model TEXT,
  last_automation_run_time TIMESTAMPTZ,
  automation_count INTEGER,
  automation_logs JSONB,
  raw_settings JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_articles_error_code ON public.articles (lower(error_code));
CREATE INDEX IF NOT EXISTS idx_articles_language ON public.articles (language);
CREATE INDEX IF NOT EXISTS idx_articles_status_updated_at ON public.articles (status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON public.ai_generation_logs (created_at DESC);

-- Trigger to keep tsvector up to date for articles (for potential full text search)
CREATE FUNCTION public.articles_tsv_trigger() RETURNS trigger AS $$
begin
  new.tsv :=
    setweight(to_tsvector(coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector(coalesce(new.meta_title,'')), 'B') ||
    setweight(to_tsvector(coalesce(new.meta_description,'')), 'B') ||
    setweight(to_tsvector(coalesce(new.short_definition,'')), 'C') ||
    setweight(to_tsvector(coalesce(new.meaning,'')), 'C');
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON public.articles;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.articles_tsv_trigger();
