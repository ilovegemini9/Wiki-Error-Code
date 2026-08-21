import { GoogleGenAI } from '@google/genai';

export interface TopModelDefinition {
  id: string;
  name: string;
  provider: string;
  badge: string;
  context: string;
  tokens: string;
  rank: number;
  description: string;
  isFree: boolean;
}

export const TOP_3_FREE_MODELS: TopModelDefinition[] = [
  {
    id: 'nvidia/nemotron-3-ultra:free',
    name: 'NVIDIA: Nemotron 3 Ultra (free)',
    provider: 'NVIDIA',
    badge: '★ #1 Principal (550B MoE)',
    context: '1M context',
    tokens: '4T tokens throughput',
    rank: 1,
    description: 'Modèle frontière ultra-puissant (550B / 55B actifs), fenêtre 1M tokens, idéal pour le raisonnement technique et la génération exhaustive.',
    isFree: true
  },
  {
    id: 'poolside/laguna-s-2.1:free',
    name: 'Poolside: Laguna S 2.1 (free)',
    provider: 'Poolside',
    badge: '★ #2 Diagnostic & Code (118B)',
    context: '262K context',
    tokens: '1.77T tokens',
    rank: 2,
    description: 'Spécialiste du code et des diagnostics techniques (70.2% Terminal-Bench, 40.4% DeepSWE), précision chirurgicale sur les erreurs.',
    isFree: true
  },
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'NVIDIA: Nemotron 3.5 Lightning (free)',
    provider: 'NVIDIA',
    badge: '★ #3 Haute Disponibilité (Ultra-Rapide)',
    context: '1M context',
    tokens: '901B tokens',
    rank: 3,
    description: 'Modèle MoE ultra-rapide (30B / 3B actifs), haute disponibilité et latence minimale avec 1M de contexte pour un relais immédiat.',
    isFree: true
  }
];

export const CASCADE_MODEL_IDS = [
  'nvidia/nemotron-3-ultra:free',
  'poolside/laguna-s-2.1:free',
  'nvidia/nemotron-3.5-lightning:free'
];

export interface AiGenerationOptions {
  prompt: string;
  temperature?: number;
  selectedModel?: string;
  openRouterApiKey?: string;
  siteUrl?: string;
  siteName?: string;
  systemPrompt?: string;
}

export interface AiGenerationResult {
  text: string;
  usedModel: string;
  cascadeLogs: string[];
  success: boolean;
}

/**
 * Execute AI text generation with automatic 3-tier cascade fallback:
 * 1. NVIDIA Nemotron 3 Ultra (free)
 * 2. Poolside Laguna S 2.1 (free) [if #1 is suspended / fails]
 * 3. NVIDIA Nemotron 3.5 Lightning (free) [if #2 is suspended / fails]
 * 4. Google Gemini 3.6 Flash Server SDK [as unbreakable ultimate safety net]
 */
export async function executeWithCascadeFallback(options: AiGenerationOptions): Promise<AiGenerationResult> {
  const {
    prompt,
    temperature = 0.7,
    selectedModel,
    openRouterApiKey,
    siteUrl = 'https://errorcodewiki.org',
    siteName = 'ErrorCodeWiki',
    systemPrompt = 'You are an expert technical diagnostic manual writer and SEO engineer. Output strictly valid JSON without markdown wrapping.'
  } = options;

  const cascadeLogs: string[] = [];
  
  // Build models queue: if user picked a specific model, prioritize it, then append the cascade
  let modelQueue: string[] = [];
  if (selectedModel && selectedModel !== 'auto_cascade' && selectedModel !== 'gemini-3.6-flash') {
    modelQueue = [selectedModel, ...CASCADE_MODEL_IDS.filter(m => m !== selectedModel)];
  } else {
    modelQueue = [...CASCADE_MODEL_IDS];
  }

  // 1. Try OpenRouter free models sequentially if API Key is configured
  if (openRouterApiKey && openRouterApiKey.trim().length > 5) {
    for (let i = 0; i < modelQueue.length; i++) {
      const currentModel = modelQueue[i];
      try {
        cascadeLogs.push(`Attempting Model #${i + 1} (${currentModel})...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey.trim()}`,
            'HTTP-Referer': siteUrl,
            'X-Title': siteName,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: typeof temperature === 'number' ? temperature : 0.7
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content && content.length > 20) {
            cascadeLogs.push(`✓ Model #${i + 1} (${currentModel}) succeeded!`);
            return {
              text: content,
              usedModel: currentModel,
              cascadeLogs,
              success: true
            };
          } else {
            cascadeLogs.push(`⚠️ Model ${currentModel} returned empty or invalid response. Cascading to next model...`);
          }
        } else {
          const errText = await res.text();
          cascadeLogs.push(`⚠️ Model ${currentModel} suspended or error (${res.status}): ${errText.slice(0, 120)}... Relais vers le modèle suivant...`);
        }
      } catch (err: any) {
        cascadeLogs.push(`⚠️ Connection/Timeout on ${currentModel}: ${err?.message || 'Error'}. Relais vers le modèle suivant...`);
      }
    }
  } else {
    cascadeLogs.push(`ℹ️ No OpenRouter API Key configured in Settings. Proceeding directly to Server Gemini Flash.`);
  }

  // 2. Ultimate Safety Net Fallback: Google Gemini API
  try {
    cascadeLogs.push(`Activating ultimate safety fallback: Google Gemini 3.6 Flash Server SDK...`);
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: typeof temperature === 'number' ? temperature : 0.7
      }
    });

    const text = response.text?.trim() || '';
    if (text) {
      cascadeLogs.push(`✓ Gemini 3.6 Flash fallback completed successfully!`);
      return {
        text,
        usedModel: 'gemini-3.6-flash',
        cascadeLogs,
        success: true
      };
    }
  } catch (geminiErr: any) {
    cascadeLogs.push(`❌ Gemini fallback error: ${geminiErr?.message || 'Error'}`);
  }

  throw new Error(`All AI models in the cascade failed or were suspended.\nLogs: ${cascadeLogs.join(' -> ')}`);
}
