-- Standalone/idempotent bootstrap for a fresh Supabase project.
-- Safe to run after 001/002 or on an empty database.

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  device_types TEXT[],
  description TEXT,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  error_code TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
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
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published')),
  reading_time TEXT,
  internal_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scheduled_for TIMESTAMPTZ,
  views_count INTEGER NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  seo_score INTEGER,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  raw JSONB,
  tsv tsvector
);

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

CREATE TABLE IF NOT EXISTS public.admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.global_settings (
  id TEXT PRIMARY KEY,
  site_name TEXT,
  site_url TEXT,
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

-- Localized slugs: the same slug may exist once per language.
DROP INDEX IF EXISTS uq_categories_slug_language;
CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_slug_language
  ON public.categories (slug, COALESCE(language, 'en'));
DROP INDEX IF EXISTS uq_brands_slug_language;
CREATE UNIQUE INDEX IF NOT EXISTS uq_brands_slug_language
  ON public.brands (slug, COALESCE(language, 'en'));
DROP INDEX IF EXISTS uq_articles_slug_language;
CREATE UNIQUE INDEX IF NOT EXISTS uq_articles_slug_language
  ON public.articles (slug, COALESCE(language, 'en'));

CREATE INDEX IF NOT EXISTS idx_categories_slug_language ON public.categories (slug, language);
CREATE INDEX IF NOT EXISTS idx_brands_slug_language ON public.brands (slug, language);
CREATE INDEX IF NOT EXISTS idx_articles_error_code ON public.articles (lower(error_code));
CREATE INDEX IF NOT EXISTS idx_articles_language ON public.articles (language);
CREATE INDEX IF NOT EXISTS idx_articles_status_updated_at ON public.articles (status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category_status_updated_at ON public.articles (category_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_brand_status_updated_at ON public.articles (brand_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON public.articles (category_id);
CREATE INDEX IF NOT EXISTS idx_articles_brand_id ON public.articles (brand_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON public.ai_generation_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tsv ON public.articles USING GIN (tsv);

CREATE OR REPLACE FUNCTION public.articles_tsv_trigger() RETURNS trigger AS $$
begin
  new.tsv :=
    setweight(to_tsvector('simple', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.meta_title,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.meta_description,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.short_definition,'')), 'C') ||
    setweight(to_tsvector('simple', coalesce(new.meaning,'')), 'C');
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON public.articles;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.articles_tsv_trigger();

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
begin
  new.updated_at = now();
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS categories_set_updated_at ON public.categories;
CREATE TRIGGER categories_set_updated_at BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS brands_set_updated_at ON public.brands;
CREATE TRIGGER brands_set_updated_at BEFORE UPDATE ON public.brands
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS global_settings_set_updated_at ON public.global_settings;
CREATE TRIGGER global_settings_set_updated_at BEFORE UPDATE ON public.global_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.increment_article_views(article_id TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.articles
  SET views_count = views_count + 1
  WHERE id = article_id;
$$;

REVOKE ALL ON FUNCTION public.increment_article_views(TEXT) FROM PUBLIC;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.global_settings (id, site_name, site_url, default_language, language, updated_at)
VALUES ('global', 'ErrorCodeWiki', 'https://errorcodewiki.org', 'en', 'en', now())
ON CONFLICT (id) DO NOTHING;

-- Secrets such as service-role/API keys must remain in Vercel/server environment variables.
