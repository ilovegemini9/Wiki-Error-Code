#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { supabaseAdmin } from '../lib/supabase';

type DryRunResult = {
  categories: { total: number };
  brands: { total: number };
  adminUsers: { total: number };
  articles: { total: number };
  aiLogs: { total: number };
  settings: { present: boolean };
  duplicateIds: string[];
  duplicateArticleSlugs: string[];
};

function validateJsonStructure(obj: any): string[] {
  const errors: string[] = [];
  if (!obj || typeof obj !== 'object') {
    errors.push('Top-level JSON must be an object');
    return errors;
  }
  if (obj.articles && !Array.isArray(obj.articles)) errors.push('articles must be an array');
  if (obj.categories && !Array.isArray(obj.categories)) errors.push('categories must be an array');
  if (obj.brands && !Array.isArray(obj.brands)) errors.push('brands must be an array');
  if (obj.aiLogs && !Array.isArray(obj.aiLogs)) errors.push('aiLogs must be an array');
  if (obj.adminUsers && !Array.isArray(obj.adminUsers)) errors.push('adminUsers must be an array');

  if (Array.isArray(obj.articles)) {
    obj.articles.forEach((a: any, idx: number) => {
      if (!a.id) errors.push(`Article at index ${idx} missing id`);
      if (!a.errorCode) errors.push(`Article at index ${idx} missing errorCode`);
      if (!a.title) errors.push(`Article at index ${idx} missing title`);
      if (!a.slug) errors.push(`Article at index ${idx} missing slug`);
      if (!a.createdAt) errors.push(`Article at index ${idx} missing createdAt`);
      if (!a.updatedAt) errors.push(`Article at index ${idx} missing updatedAt`);
    });
  }
  return errors;
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function buildDryRunReport(parsed: any): DryRunResult {
  const articles = Array.isArray(parsed.articles) ? parsed.articles : [];
  const ids = articles.map((a: any) => String(a.id || '')).filter(Boolean);
  const slugs = articles.map((a: any) => String(a.slug || '')).filter(Boolean);
  return {
    categories: { total: Array.isArray(parsed.categories) ? parsed.categories.length : 0 },
    brands: { total: Array.isArray(parsed.brands) ? parsed.brands.length : 0 },
    adminUsers: { total: Array.isArray(parsed.adminUsers) ? parsed.adminUsers.length : 0 },
    articles: { total: articles.length },
    aiLogs: { total: Array.isArray(parsed.aiLogs) ? parsed.aiLogs.length : 0 },
    settings: { present: !!parsed.settings },
    duplicateIds: findDuplicates(ids),
    duplicateArticleSlugs: findDuplicates(slugs),
  };
}

async function upsertOrThrow(table: string, row: Record<string, unknown>) {
  const { error } = await supabaseAdmin!.from(table).upsert(row, { onConflict: 'id' });
  if (error) throw new Error(`Supabase upsert failed for ${table} (id=${String(row.id)}): ${error.message}`);
}

function sanitizeSettings(settings: any): Record<string, unknown> {
  const {
    openRouterApiKey: _openRouterApiKey,
    geminiApiKey: _geminiApiKey,
    googleApiKey: _googleApiKey,
    serviceRoleKey: _serviceRoleKey,
    ...safeSettings
  } = settings || {};
  return safeSettings;
}

async function verifyCounts(parsed: any) {
  if (!supabaseAdmin) throw new Error('Supabase admin client not configured.');
  const checks = [
    ['categories', Array.isArray(parsed.categories) ? parsed.categories.length : 0],
    ['brands', Array.isArray(parsed.brands) ? parsed.brands.length : 0],
    ['articles', Array.isArray(parsed.articles) ? parsed.articles.length : 0],
    ['ai_generation_logs', Array.isArray(parsed.aiLogs) ? parsed.aiLogs.length : 0],
    ['admin_users', Array.isArray(parsed.adminUsers) ? parsed.adminUsers.length : 0],
  ] as const;
  for (const [table, expected] of checks) {
    const { count, error } = await supabaseAdmin.from(table).select('id', { count: 'exact', head: true });
    if (error) throw new Error(`Verification failed for ${table}: ${error.message}`);
    if ((count || 0) < expected) throw new Error(`Verification failed for ${table}: expected at least ${expected}, found ${count || 0}`);
    console.log(`Verified ${table}: source=${expected}, database=${count || 0}`);
  }
}

async function applyMigration(parsed: any) {
  if (!supabaseAdmin) throw new Error('Supabase admin client not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');

  if (Array.isArray(parsed.categories)) {
    for (const c of parsed.categories) {
      await upsertOrThrow('categories', {
        id: c.id, name: c.name, slug: c.slug, icon: c.icon || null, description: c.description || null,
        language: c.language || null, created_at: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
        updated_at: c.updatedAt ? new Date(c.updatedAt).toISOString() : undefined,
      });
    }
  }

  if (Array.isArray(parsed.brands)) {
    for (const b of parsed.brands) {
      await upsertOrThrow('brands', {
        id: b.id, name: b.name, slug: b.slug, logo_url: b.logoUrl || null, category_id: b.categoryId || null,
        device_types: b.deviceTypes || null, description: b.description || null, language: b.language || null,
        created_at: b.createdAt ? new Date(b.createdAt).toISOString() : undefined,
        updated_at: b.updatedAt ? new Date(b.updatedAt).toISOString() : undefined,
      });
    }
  }

  if (Array.isArray(parsed.adminUsers)) {
    for (const u of parsed.adminUsers) {
      await upsertOrThrow('admin_users', {
        id: u.id, username: u.username, password_hash: u.passwordHash,
        updated_at: u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString(),
      });
    }
  }

  if (Array.isArray(parsed.articles)) {
    for (const a of parsed.articles) {
      await upsertOrThrow('articles', {
        id: a.id, error_code: a.errorCode, title: a.title, slug: a.slug,
        meta_title: a.metaTitle || null, meta_description: a.metaDescription || null,
        short_definition: a.shortDefinition || null, meaning: a.meaning || null,
        causes: a.causes || [], solutions: a.solutions || [], technical_explanation: a.technicalExplanation || null,
        faq: a.faq || [], schema_jsonld: a.schemaJsonLd || null, canonical_url: a.canonicalUrl || null,
        category_id: a.categoryId || null, brand_id: a.brandId || null, device_type: a.deviceType || null,
        language: a.language || 'en', keywords: a.keywords || [], tags: a.tags || [],
        featured_image: a.featuredImage || null, status: a.status || 'published', reading_time: a.readingTime || null,
        internal_links: a.internalLinks || [], created_at: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
        updated_at: a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
        scheduled_for: a.scheduledFor || null, views_count: a.viewsCount || 0, seo_score: a.seoScore ?? null,
        ai_generated: !!a.aiGenerated,
        raw: a,
      });
    }
  }

  if (Array.isArray(parsed.aiLogs)) {
    for (const l of parsed.aiLogs) {
      await upsertOrThrow('ai_generation_logs', {
        id: l.id, error_code: l.errorCode || null, brand: l.brand || null, device: l.device || null,
        model: l.model || null, created_at: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
        status: l.status || null, article_id: l.articleId || null, prompt_text: l.promptText || null,
        response_summary: l.responseSummary || null, usage: l.usage || null,
      });
    }
  }

  if (parsed.settings) {
    const safeSettings = sanitizeSettings(parsed.settings) as any;
    await upsertOrThrow('global_settings', {
      id: 'global', site_name: safeSettings.siteName || null, site_url: safeSettings.siteUrl || null,
      default_ai_model: safeSettings.defaultAiModel || null, language: safeSettings.language || null,
      logo_url: safeSettings.logoUrl || null, favicon_url: safeSettings.faviconUrl || null,
      google_analytics_id: safeSettings.googleAnalyticsId || null, google_search_console_tag: safeSettings.googleSearchConsoleTag || null,
      google_search_console_meta: safeSettings.googleSearchConsoleMeta || null, ads_txt_content: safeSettings.adsTxtContent || null,
      robots_txt_content: safeSettings.robotsTxtContent || null, default_language: safeSettings.defaultLanguage || null,
      sitemap_settings: safeSettings.sitemapSettings || null,
      automation_active: typeof safeSettings.automationActive === 'boolean' ? safeSettings.automationActive : null,
      automation_interval_minutes: safeSettings.automationIntervalMinutes || null, automation_languages: safeSettings.automationLanguages || null,
      automation_publish_status: safeSettings.automationPublishStatus || null, automation_model: safeSettings.automationModel || null,
      last_automation_run_time: safeSettings.lastAutomationRunTime || null, automation_count: safeSettings.automationCount || null,
      automation_logs: safeSettings.automationLogs || null,
      raw_settings: safeSettings,
    });
  }

  await verifyCounts(parsed);
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('dry-run', { type: 'boolean', default: false, description: 'Perform a dry run without writing to DB' })
    .option('apply', { type: 'boolean', default: false, description: 'Apply changes to Supabase (requires env)' })
    .help().parseSync();

  const DB_PATH = path.join(process.cwd(), 'data', 'error_code_wiki.db.json');
  if (!fs.existsSync(DB_PATH)) { console.error(`Database JSON file not found at ${DB_PATH}`); process.exit(1); }

  let parsed: any;
  try { parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
  catch (e) { console.error('Failed to parse JSON file:', e instanceof Error ? e.message : e); process.exit(1); }

  const validationErrors = validateJsonStructure(parsed);
  if (validationErrors.length > 0) {
    console.error('Validation errors in JSON structure:');
    for (const err of validationErrors) console.error('- ' + err);
    process.exit(1);
  }

  const report = buildDryRunReport(parsed);
  if (argv['dry-run']) {
    if (report.duplicateIds.length || report.duplicateArticleSlugs.length) {
      console.error('Duplicate IDs/slugs detected. Migration must be corrected before apply.');
      console.error(JSON.stringify(report, null, 2));
      process.exit(1);
    }
    console.log('Running dry-run migration (no DB writes)...');
    if (report.articles.total > 0) {
      const a = parsed.articles[0];
      console.log(`First article sample: id=${a.id}, slug=${a.slug}, title=${a.title}`);
    }
    console.log('Dry-run report:');
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (!argv['apply']) { console.log('No action taken. Use --dry-run to preview or --apply to perform the migration.'); process.exit(0); }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment to apply the migration.');
    process.exit(1);
  }
  if (report.duplicateIds.length || report.duplicateArticleSlugs.length) {
    console.error('Migration aborted: duplicate IDs/slugs detected. Run --dry-run for details.');
    process.exit(1);
  }

  try {
    console.log('Applying migration to Supabase...');
    await applyMigration(parsed);
    console.log('Migration applied and verified successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main().catch(err => { console.error('Unexpected error:', err); process.exit(1); });
