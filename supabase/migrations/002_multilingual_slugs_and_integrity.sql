-- Make category/brand slugs reusable across languages while keeping each localized row unique.
-- Existing application rows use language-aware IDs (or legacy IDs such as slug).

ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_slug_key;
ALTER TABLE public.brands DROP CONSTRAINT IF EXISTS brands_slug_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_slug_language
  ON public.categories (slug, COALESCE(language, 'en'));

CREATE UNIQUE INDEX IF NOT EXISTS uq_brands_slug_language
  ON public.brands (slug, COALESCE(language, 'en'));

-- Helpful integrity indexes for localized lookups and foreign-key traversal.
CREATE INDEX IF NOT EXISTS idx_categories_slug_language
  ON public.categories (slug, language);

CREATE INDEX IF NOT EXISTS idx_brands_slug_language
  ON public.brands (slug, language);

CREATE INDEX IF NOT EXISTS idx_articles_category_id ON public.articles (category_id);
CREATE INDEX IF NOT EXISTS idx_articles_brand_id ON public.articles (brand_id);

-- Keep updated_at current on mutable rows.
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

-- Reject orphan article relations when inserting/updating articles is intentionally not enforced here;
-- ON DELETE SET NULL keeps existing content safe when an admin removes a category/brand.
