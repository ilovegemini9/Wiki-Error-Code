alter table public.global_settings
  add column if not exists openrouter_api_key_encrypted text;
