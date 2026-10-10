-- Security hardening for the server-side Supabase access model.
-- Application code uses the server-side service-role client; public clients should not
-- have direct table privileges. RLS remains enabled as defense in depth.

REVOKE ALL PRIVILEGES ON TABLE
  public.admin_users,
  public.ai_generation_logs,
  public.analytics_events,
  public.articles,
  public.brands,
  public.categories,
  public.global_settings
FROM anon, authenticated;

GRANT ALL PRIVILEGES ON TABLE
  public.admin_users,
  public.ai_generation_logs,
  public.analytics_events,
  public.articles,
  public.brands,
  public.categories,
  public.global_settings
TO service_role;

-- This privileged counter function is not a public API endpoint.
REVOKE ALL ON FUNCTION public.increment_article_views(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_article_views(TEXT) TO service_role;

-- Trigger functions should not be callable directly through the Data API.
REVOKE ALL ON FUNCTION public.articles_tsv_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Pin function search paths to reduce object-shadowing risk.
ALTER FUNCTION public.articles_tsv_trigger() SET search_path = pg_catalog, public;
ALTER FUNCTION public.set_updated_at() SET search_path = pg_catalog, public;

-- Cover existing foreign keys for join/delete/update performance.
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_article_id ON public.ai_generation_logs (article_id);
CREATE INDEX IF NOT EXISTS idx_brands_category_id ON public.brands (category_id);
