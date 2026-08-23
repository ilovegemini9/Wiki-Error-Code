-- Harden an already-created database without destroying application data.
-- Secrets must live in Vercel/server environment variables, never in global_settings.

ALTER TABLE public.global_settings
  DROP COLUMN IF EXISTS openrouter_api_key;

CREATE INDEX IF NOT EXISTS idx_articles_tsv ON public.articles USING GIN (tsv);
CREATE INDEX IF NOT EXISTS idx_articles_category_status_updated_at ON public.articles (category_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_brand_status_updated_at ON public.articles (brand_id, status, updated_at DESC);

ALTER TABLE public.articles
  ALTER COLUMN views_count SET DEFAULT 0;

UPDATE public.articles
SET views_count = 0
WHERE views_count IS NULL OR views_count < 0;

ALTER TABLE public.articles
  ALTER COLUMN views_count SET NOT NULL;

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

-- Ensure the application tables remain inaccessible to anon/authenticated clients.
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
