import { getLanguageByCode } from './languages';
import { executeWithCascadeFallback } from './ai-service';
import {
  getSupabaseArticles,
  getSupabaseSettings,
  saveSupabaseArticle,
  saveSupabaseSettings,
} from './supabase-db';

const MASTER_PRESETS = [
  { code: '0x80070005', brand: 'Microsoft', device: 'Windows 11 PC', cat: 'windows' },
  { code: 'P0420', brand: 'Toyota', device: 'OBD-II Scanner', cat: 'automotive' },
  { code: 'E-01', brand: 'Epson', device: 'EcoTank Printer', cat: 'printers' },
  { code: 'CE-34878-0', brand: 'Sony PlayStation', device: 'PS5 Console', cat: 'gaming' },
  { code: 'E24', brand: 'Bosch', device: 'Dishwasher', cat: 'appliances' },
  { code: 'ERR_CONNECTION_REFUSED', brand: 'Google Chrome', device: 'Chrome Browser', cat: 'software' },
  { code: '0x80070422', brand: 'Microsoft', device: 'Windows Update Service', cat: 'windows' },
  { code: 'P0300', brand: 'Honda / Ford', device: 'Engine Ignition', cat: 'automotive' },
  { code: '5100', brand: 'Canon', device: 'PIXMA Printer', cat: 'printers' },
  { code: '0x800f081f', brand: 'Microsoft', device: 'Windows 11 OS', cat: 'windows' },
  { code: 'P0171', brand: 'Chevrolet', device: 'Fuel Injection', cat: 'automotive' },
  { code: 'CRITICAL_PROCESS_DIED', brand: 'Microsoft', device: 'Windows BSOD', cat: 'windows' },
  { code: '79', brand: 'HP', device: 'LaserJet Printer', cat: 'printers' },
  { code: '0x8027025a', brand: 'Microsoft Xbox', device: 'Xbox Series X', cat: 'gaming' },
  { code: 'F06', brand: 'Whirlpool', device: 'Front-Load Washer', cat: 'appliances' },
  { code: '502_BAD_GATEWAY', brand: 'Nginx / Cloudflare', device: 'Web Server', cat: 'software' },
  { code: 'P0455', brand: 'Nissan / Ford', device: 'EVAP System', cat: 'automotive' },
  { code: 'E15', brand: 'Bosch', device: 'Dishwasher', cat: 'appliances' },
  { code: '2168-0002', brand: 'Nintendo Switch', device: 'Switch Console', cat: 'gaming' },
  { code: '4E', brand: 'Samsung', device: 'Washing Machine', cat: 'appliances' },
  { code: 'B200', brand: 'Canon', device: 'PIXMA Inkjet', cat: 'printers' },
  { code: '0x80070057', brand: 'Microsoft', device: 'Windows Storage', cat: 'windows' },
  { code: 'P0128', brand: 'Subaru / Toyota', device: 'Cooling System', cat: 'automotive' },
  { code: 'DNS_PROBE_FINISHED_NXDOMAIN', brand: 'Google Chrome', device: 'DNS Resolution', cat: 'software' },
];

let isRunningStep = false;

export async function checkAndRunAutomationServer(): Promise<boolean> {
  if (isRunningStep) return false;
  isRunningStep = true;

  try {
    const settings = await getSupabaseSettings();
    if (!settings.automationActive) return false;

    const now = Date.now();
    const lastRunTime = settings.lastAutomationRunTime
      ? new Date(settings.lastAutomationRunTime).getTime()
      : 0;
    const intervalMinutes = settings.automationIntervalMinutes || 1;
    if (lastRunTime > 0 && now - lastRunTime < intervalMinutes * 60 * 1000) return false;

    const { articles: existing } = await getSupabaseArticles({ status: 'all' });
    const uncreated = MASTER_PRESETS.filter((p) => {
      const cleanP = p.code.toLowerCase().replace(/[^a-z0-9]/g, '');
      return !existing.some((a) => a.errorCode.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanP);
    });
    const candidateList = uncreated.length > 0 ? uncreated : MASTER_PRESETS;
    const preset = candidateList[Math.floor(Math.random() * candidateList.length)];

    const languages = settings.automationLanguages?.length ? settings.automationLanguages : ['en', 'fr', 'es'];
    const targetLangCode = languages[Math.floor(Math.random() * languages.length)] || 'en';
    const langObj = getLanguageByCode(targetLangCode);
    const modelToUse = settings.automationModel || settings.defaultAiModel || 'google/gemma-4-31b-it';

    const prompt = `You are a world-class senior IT engineer, diagnostic systems architect, and technical SEO content strategist.
Generate an exhaustive diagnostic manual for error code "${preset.code}".
Target output language: ${langObj.englishName} (${langObj.name}), code "${langObj.code}". Write all content natively in that language.
Brand: ${preset.brand}. Device/subsystem: ${preset.device}. Category: ${preset.cat}.
Generate ~1200+ words of useful technical content, at least 3 actionable solution methods, and 4 FAQs.
Return STRICT VALID JSON matching the application's Article shape. Do not wrap JSON in markdown.
Required fields: errorCode, title, slug, metaTitle, metaDescription, shortDefinition, meaning, causes, solutions, technicalExplanation, faq, keywords, tags, readingTime.`;

    const result = await executeWithCascadeFallback({
      prompt,
      temperature: 0.7,
      selectedModel: modelToUse,
      openRouterApiKey: settings.openRouterApiKey,
      siteUrl: settings.siteUrl || 'https://errorcodewiki.org',
      siteName: settings.siteName || 'ErrorCodeWiki',
      systemPrompt: 'You are a technical diagnostic database generator. Output strictly valid JSON without markdown wrapping.',
    });

    let cleanedJson = result.text.trim();
    cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    const parsedArticle = JSON.parse(cleanedJson);

    parsedArticle.language = langObj.code;
    parsedArticle.categoryId = preset.cat;
    parsedArticle.brandId = preset.brand;
    parsedArticle.deviceType = preset.device;
    parsedArticle.status = settings.automationPublishStatus || 'published';
    parsedArticle.aiGenerated = true;

    const saved = await saveSupabaseArticle(parsedArticle);
    const timeStr = new Date().toLocaleTimeString();
    const newLog = {
      id: String(Date.now()),
      time: timeStr,
      text: `✅ [SERVER AUTO-PUBLISHED] "${saved.title}" (${langObj.flag} ${langObj.code.toUpperCase()}) created & published!`,
      type: 'success' as const,
    };

    const currentLogs = settings.automationLogs || [];
    await saveSupabaseSettings({
      lastAutomationRunTime: new Date().toISOString(),
      automationCount: (settings.automationCount || 0) + 1,
      automationLogs: [newLog, ...currentLogs.slice(0, 49)],
    });

    return true;
  } catch (err: unknown) {
    try {
      const settings = await getSupabaseSettings();
      const errMsg = err instanceof Error ? err.message : 'Server automation error';
      const errorLog = {
        id: String(Date.now()),
        time: new Date().toLocaleTimeString(),
        text: `❌ [SERVER AUTOMATION ERROR] ${errMsg}`,
        type: 'error' as const,
      };
      await saveSupabaseSettings({
        lastAutomationRunTime: new Date().toISOString(),
        automationLogs: [errorLog, ...(settings.automationLogs || []).slice(0, 49)],
      });
    } catch {
      // Preserve the original automation failure if logging itself fails.
    }
    return false;
  } finally {
    isRunningStep = false;
  }
}

let globalIntervalStarted = false;

export function initAutomationBackgroundServer() {
  if (globalIntervalStarted || process.env.NEXT_PHASE === 'phase-production-build') return;
  globalIntervalStarted = true;
  const timer = setInterval(() => {
    checkAndRunAutomationServer().catch(() => {});
  }, 15000);
  if (timer && typeof timer.unref === 'function') timer.unref();
}
