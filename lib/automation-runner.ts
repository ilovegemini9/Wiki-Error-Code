import { db } from './db';
import { getLanguageByCode } from './languages';
import { executeWithCascadeFallback } from './ai-service';

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
  { code: 'DNS_PROBE_FINISHED_NXDOMAIN', brand: 'Google Chrome', device: 'DNS Resolution', cat: 'software' }
];

let isRunningStep = false;

export async function checkAndRunAutomationServer(): Promise<boolean> {
  const settings = db.getSettings();

  if (!settings.automationActive) {
    return false;
  }

  if (isRunningStep) {
    return false;
  }

  const now = Date.now();
  const lastRunTime = settings.lastAutomationRunTime ? new Date(settings.lastAutomationRunTime).getTime() : 0;
  const intervalMinutes = settings.automationIntervalMinutes || 1;
  const intervalMs = intervalMinutes * 60 * 1000;

  if (lastRunTime > 0 && (now - lastRunTime < intervalMs)) {
    return false;
  }

  isRunningStep = true;

  try {
    const existing = db.getArticles({ status: 'all' }).articles;

    // Pick uncreated preset
    const uncreated = MASTER_PRESETS.filter(p => {
      const cleanP = p.code.toLowerCase().replace(/[^a-z0-9]/g, '');
      return !existing.some(a => a.errorCode.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanP);
    });

    const candidateList = uncreated.length > 0 ? uncreated : MASTER_PRESETS;
    const preset = candidateList[Math.floor(Math.random() * candidateList.length)];

    const languages = settings.automationLanguages && settings.automationLanguages.length > 0
      ? settings.automationLanguages
      : ['en', 'fr', 'es'];
    const targetLangCode = languages[Math.floor(Math.random() * languages.length)] || 'en';
    const langObj = getLanguageByCode(targetLangCode);

    const modelToUse = settings.automationModel || settings.defaultAiModel || 'google/gemma-4-31b-it';

    const prompt = `You are a world-class senior IT engineer, diagnostic systems architect, and technical SEO content strategist.
Generate an exhaustive, highly detailed, professional Wikipedia-grade diagnostic manual for the error code: "${preset.code}".

STRICT MULTILINGUAL REQUIREMENT:
- Target Output Language: ${langObj.englishName} (${langObj.name}) [Language Code: "${langObj.code}"]
- You MUST write 100% of the content (titles, meanings, causes, step-by-step guides, technical explanations, FAQs, keywords, and tags) NATIVELY AND ENTIRELY IN ${langObj.englishName} (${langObj.name}).
- DO NOT mix languages or leave English placeholders!

CONTEXT:
- Brand / Manufacturer: ${preset.brand}
- Target Device / Subsystem: ${preset.device}
- Taxonomy Category: ${preset.cat}
- Target Language: ${langObj.englishName} (${langObj.name})

DEPTH & COMPREHENSIVE LENGTH REQUIREMENT:
- The generated article must be exhaustive and comprehensive (~1200+ words equivalent depth).
- Provide at least 3 distinct, highly actionable step-by-step solution methods with clear sub-steps and terminal/command-line snippets where applicable.
- Provide a deep low-level technical breakdown explaining memory addresses, registers, hardware calls, or HTTP/OS protocols.
- Provide at least 4 detailed FAQs with comprehensive answers.
- Generate high-value localized SEO keywords (e.g., "fix ${preset.code}", "access denied ${preset.brand}", "update error solution", etc., translated into ${langObj.name}).

JSON OUTPUT SCHEMA (MUST BE STRICTLY VALID JSON):
{
  "errorCode": "${preset.code}",
  "title": "Exhaustive, professional guide title in ${langObj.name}",
  "slug": "${preset.brand.toLowerCase().replace(/[^a-z0-9]/g, '')}-${preset.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}${langObj.code === 'en' ? '' : '-' + langObj.code}",
  "metaTitle": "SEO Meta Title in ${langObj.name} (50-60 chars)",
  "metaDescription": "SEO Meta Description in ${langObj.name} (140-160 chars)",
  "shortDefinition": "Thorough 2-3 sentence definition explaining the error in ${langObj.name}.",
  "meaning": "Detailed multi-paragraph breakdown explaining what happened to the subsystem in ${langObj.name}.",
  "causes": [
    "Primary cause 1 in ${langObj.name}",
    "Secondary cause 2 in ${langObj.name}",
    "Hardware/network cause 3 in ${langObj.name}",
    "Software conflict cause 4 in ${langObj.name}"
  ],
  "solutions": [
    {
      "title": "Method 1: Primary Automated Fix in ${langObj.name}",
      "description": "Comprehensive explanation of Method 1 in ${langObj.name}.",
      "steps": [
        "Step 1: Detailed instruction in ${langObj.name}",
        "Step 2: Detailed instruction in ${langObj.name}",
        "Step 3: Detailed instruction in ${langObj.name}"
      ],
      "codeSnippet": "cli / terminal command if applicable"
    },
    {
      "title": "Method 2: Command-Line / Terminal Configuration in ${langObj.name}",
      "description": "Comprehensive explanation of Method 2 in ${langObj.name}.",
      "steps": [
        "Step 1: Open shell/cmd and run repair in ${langObj.name}",
        "Step 2: Rebuild corrupted system cache in ${langObj.name}",
        "Step 3: Restart services in ${langObj.name}"
      ],
      "codeSnippet": "sfc /scannow || systemctl restart service"
    },
    {
      "title": "Method 3: Advanced Hardware / Registry / Network Reset in ${langObj.name}",
      "description": "Comprehensive explanation of Method 3 in ${langObj.name}.",
      "steps": [
        "Step 1: Clear configuration flags in ${langObj.name}",
        "Step 2: Re-verify system permissions in ${langObj.name}"
      ]
    }
  ],
  "technicalExplanation": "Exhaustive multi-paragraph low-level engineering explanation of kernel / protocol / memory / hardware state during this error in ${langObj.name}.",
  "faq": [
    {
      "question": "Why does error ${preset.code} occur in ${langObj.name}?",
      "answer": "Detailed answer in ${langObj.name}."
    },
    {
      "question": "Is error ${preset.code} dangerous for my ${preset.device}?",
      "answer": "Detailed answer in ${langObj.name}."
    },
    {
      "question": "Can I fix ${preset.code} without technical skills?",
      "answer": "Detailed answer in ${langObj.name}."
    },
    {
      "question": "What if error ${preset.code} persists after trying all steps?",
      "answer": "Detailed answer in ${langObj.name}."
    }
  ],
  "keywords": ["${preset.code}", "fix ${preset.code}", "solution ${preset.code} ${preset.brand}", "access denied ${preset.code}"],
  "tags": ["${preset.cat}", "${preset.brand}", "${preset.code}", "${langObj.name}"],
  "readingTime": "8 min read"
}`;

    const result = await executeWithCascadeFallback({
      prompt,
      temperature: 0.7,
      selectedModel: modelToUse || 'nvidia/nemotron-3-ultra:free',
      openRouterApiKey: settings.openRouterApiKey,
      siteUrl: settings.siteUrl || 'https://errorcodewiki.org',
      siteName: settings.siteName || 'ErrorCodeWiki',
      systemPrompt: 'You are a technical diagnostic database generator. Output strictly valid JSON without markdown wrapping.'
    });

    let cleanedJson = result.text.trim();
    if (cleanedJson.startsWith('```json')) {
      cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedArticle = JSON.parse(cleanedJson);
    parsedArticle.language = langObj.code;
    parsedArticle.categoryId = preset.cat;
    parsedArticle.brandId = preset.brand;
    parsedArticle.deviceType = preset.device;
    parsedArticle.status = settings.automationPublishStatus || 'published';

    const saved = db.saveArticle(parsedArticle);

    const timeStr = new Date().toLocaleTimeString();
    const newLog = {
      id: String(Date.now()),
      time: timeStr,
      text: `✅ [SERVER AUTO-PUBLISHED] "${saved.title}" (${langObj.flag} ${langObj.code.toUpperCase()}) created & published!`,
      type: 'success' as const
    };

    const currentLogs = settings.automationLogs || [];
    const updatedLogs = [newLog, ...currentLogs.slice(0, 49)];

    db.saveSettings({
      lastAutomationRunTime: new Date().toISOString(),
      automationCount: (settings.automationCount || 0) + 1,
      automationLogs: updatedLogs
    });

    return true;
  } catch (err: unknown) {
    const timeStr = new Date().toLocaleTimeString();
    const errMsg = err instanceof Error ? err.message : 'Server automation error';
    const errorLog = {
      id: String(Date.now()),
      time: timeStr,
      text: `❌ [SERVER AUTOMATION ERROR] ${errMsg}`,
      type: 'error' as const
    };

    const currentLogs = settings.automationLogs || [];
    db.saveSettings({
      lastAutomationRunTime: new Date().toISOString(),
      automationLogs: [errorLog, ...currentLogs.slice(0, 49)]
    });

    return false;
  } finally {
    isRunningStep = false;
  }
}

let globalIntervalStarted = false;

export function initAutomationBackgroundServer() {
  if (globalIntervalStarted) return;
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  globalIntervalStarted = true;

  // Run every 15 seconds to check if automation needs execution
  const timer = setInterval(() => {
    checkAndRunAutomationServer().catch(() => {});
  }, 15000);

  if (timer && typeof timer.unref === 'function') {
    timer.unref();
  }
}
