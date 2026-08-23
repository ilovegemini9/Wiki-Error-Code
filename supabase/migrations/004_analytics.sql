CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL DEFAULT 'page_view',
  path TEXT,
  landing_path TEXT,
  referrer TEXT,
  referrer_host TEXT,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  search_engine TEXT,
  search_keyword TEXT,
  country_code TEXT,
  region TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  user_agent TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  language TEXT,
  page_title TEXT,
  article_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_source ON public.analytics_events(source, medium, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_country ON public.analytics_events(country_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_path ON public.analytics_events(path, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_keyword ON public.analytics_events(search_keyword, created_at DESC);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
