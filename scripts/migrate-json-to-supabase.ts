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
};

async function validateJsonStructure(obj: any) {
  const errors: string[] = [];
  if (!obj || typeof obj !== 'object') {
    errors.push('Top-level JSON must be an object');
    return errors;
  }

  const rootKeys = ['articles', 'categories', 'brands', 'settings', 'aiLogs', 'adminUsers'];
  rootKeys.forEach(k => {
    if (!Object.prototype.hasOwnProperty.call(obj, k)) {
      // allow missing arrays but report
      // errors.push(`Missing root key: ${k}`);
    }
  });

  if (obj.articles && !Array.isArray(obj.articles)) errors.push('articles must be an array');
  if (obj.categories && !Array.isArray(obj.categories)) errors.push('categories must be an array');
  if (obj.brands && !Array.isArray(obj.brands)) errors.push('brands must be an array');
  if (obj.aiLogs && !Array.isArray(obj.aiLogs)) errors.push('aiLogs must be an array');
  if (obj.adminUsers && !Array.isArray(obj.adminUsers)) errors.push('adminUsers must be an array');

  // Minimal article validation sample for reporting
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

async function runDryRun(parsed: any): Promise<DryRunResult> {
  const res: DryRunResult = {
    categories: { total: Array.isArray(parsed.categories) ? parsed.categories.length : 0 },
    brands: { total: Array.isArray(parsed.brands) ? parsed.brands.length : 0 },
    adminUsers: { total: Array.isArray(parsed.adminUsers) ? parsed.adminUsers.length : 0 },
    articles: { total: Array.isArray(parsed.articles) ? parsed.articles.length : 0 },
    aiLogs: { total: Array.isArray(parsed.aiLogs) ? parsed.aiLogs.length : 0 },
    settings: { present: !!parsed.settings }
  };

  // Additional checks: list first article id/title for quick review
  if (Array.isArray(parsed.articles) && parsed.articles.length > 0) {
    const a = parsed.articles[0];
    console.log(`First article sample: id=${a.id}, slug=${a.slug}, title=${a.title}`);
  }

  return res;
}

async function applyMigration(parsed: any) {
  if (!supabaseAdmin) throw new Error('Supabase admin client not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');

  // Upsert categories
  if (Array.isArray(parsed.categories)) {
    for (const c of parsed.categories) {
      const row = {
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon || null,
        description: c.description || null,
        language: c.language || null,
        created_at: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
        updated_at: c.updatedAt ? new Date(c.updatedAt).toISOString() : undefined
      };
      await supabaseAdmin!.from('categories').upsert(row, { onConflict: ['id'] });
    }
  }

  // Upsert brands
  if (Array.isArray(parsed.brands)) {
    for (const b of parsed.brands) {
      const row = {
        id: b.id,
        name: b.name,
        slug: b.slug,
        logo_url: b.logoUrl || null,
        category_id: b.categoryId || null,
        device_types: b.deviceTypes || null,
        description: b.description || null,
        language: b.language || null,
        created_at: b.createdAt ? new Date(b.createdAt).toISOString() : undefined,
        updated_at: b.updatedAt ? new Date(b.updatedAt).toISOString() : undefined
      };
      await supabaseAdmin!.from('brands').upsert(row, { onConflict: ['id'] });
    }
  }

  // Upsert admin users
  if (Array.isArray(parsed.adminUsers)) {
    for (const u of parsed.adminUsers) {
      const row = {
        id: u.id,
        username: u.username,
        password_hash: u.passwordHash,
        updated_at: u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString()
      };
      await supabaseAdmin!.from('admin_users').upsert(row, { onConflict: ['id'] });
    }
  }

  // Upsert articles
  if (Array.isArray(parsed.articles)) {
    for (const a of parsed.articles) {
      const row = {
        id: a.id,
        error_code: a.errorCode,
        title: a.title,
        slug: a.slug,
        meta_title: a.metaTitle || null,
        meta_description: a.metaDescription || null,
        short_definition: a.shortDefinition || null,
        meaning: a.meaning || null,
        causes: a.causes || [],
        solutions: a.solutions || [],
        technical_explanation: a.technicalExplanation || null,
        faq: a.faq || [],
        schema_jsonld: a.schemaJsonLd || null,
        canonical_url: a.canonicalUrl || null,
        category_id: a.categoryId || null,
        brand_id: a.brandId || null,
        device_type: a.deviceType || null,
        language: a.language || 'en',
        keywords: a.keywords || [],
        tags: a.tags || [],
        featured_image: a.featuredImage || null,
        status: a.status || 'published',
        reading_time: a.readingTime || null,
        internal_links: a.internalLinks || [],
        created_at: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
        updated_at: a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
        scheduled_for: a.scheduledFor || null,
        views_count: a.viewsCount || 0,
        seo_score: a.seoScore || null,
        ai_generated: !!a.aiGenerated || false,
        raw: a
      };
      await supabaseAdmin!.from('articles').upsert(row, { onConflict: ['id'] });
    }
  }

  // Upsert AI logs
  if (Array.isArray(parsed.aiLogs)) {
    for (const l of parsed.aiLogs) {
      const row = {
        id: l.id,
        error_code: l.errorCode || null,
        brand: l.brand || null,
        device: l.device || null,
        model: l.model || null,
        created_at: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
        status: l.status || null
      };
      await supabaseAdmin!.from('ai_generation_logs').upsert(row, { onConflict: ['id'] });
    }
  }

  // Upsert settings as single row id='global'
  if (parsed.settings) {
    const s = parsed.settings;
    const row = {
      id: 'global',
      site_name: s.siteName || null,
      site_url: s.siteUrl || null,
      openrouter_api_key: s.openRouterApiKey || null,
      default_ai_model: s.defaultAiModel || null,
      language: s.language || null,
      logo_url: s.logoUrl || null,
      favicon_url: s.faviconUrl || null,
      google_analytics_id: s.googleAnalyticsId || null,
      google_search_console_tag: s.googleSearchConsoleTag || null,
      google_search_console_meta: s.googleSearchConsoleMeta || null,
      ads_txt_content: s.adsTxtContent || null,
      robots_txt_content: s.robotsTxtContent || null,
      default_language: s.defaultLanguage || null,
      sitemap_settings: s.sitemapSettings || null,
      automation_active: typeof s.automationActive === 'boolean' ? s.automationActive : null,
      automation_interval_minutes: s.automationIntervalMinutes || null,
      automation_languages: s.automationLanguages || null,
      automation_publish_status: s.automationPublishStatus || null,
      automation_model: s.automationModel || null,
      last_automation_run_time: s.lastAutomationRunTime || null,
      automation_count: s.automationCount || null,
      automation_logs: s.automationLogs || null,
      raw_settings: s
    };
    await supabaseAdmin!.from('global_settings').upsert(row, { onConflict: ['id'] });
  }
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('dry-run', { type: 'boolean', default: false, description: 'Perform a dry run without writing to DB' })
    .option('apply', { type: 'boolean', default: false, description: 'Apply changes to Supabase (requires env)' })
    .help()
    .parseSync();

  const DB_PATH = path.join(process.cwd(), 'data', 'error_code_wiki.db.json');
  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database JSON file not found at ${DB_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse JSON file:', e instanceof Error ? e.message : e);
    process.exit(1);
  }

  const validationErrors = await validateJsonStructure(parsed);
  if (validationErrors.length > 0) {
    console.error('Validation errors in JSON structure:');
    for (const err of validationErrors) console.error('- ' + err);
    process.exit(1);
  }

  if (argv['dry-run']) {
    console.log('Running dry-run migration (no DB writes)...');
    const report = await runDryRun(parsed);
    console.log('Dry-run report:');
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  if (!argv['apply']) {
    console.log("No action taken. Use --dry-run to preview or --apply to perform the migration.");
    process.exit(0);
  }

  // Apply path: ensure supabase envs
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment to apply the migration.');
    process.exit(1);
  }

  try {
    console.log('Applying migration to Supabase...');
    await applyMigration(parsed);
    console.log('Migration applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
