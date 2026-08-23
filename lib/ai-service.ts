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

export const TOP_4_FREE_MODELS: TopModelDefinition[] = [
  {
    id: 'z-ai/glm-5.2:free',
    name: 'Z.ai: GLM 5.2 (free)',
    provider: 'Z.ai',
    badge: '★ #1 Reasoning & Automation',
    context: '1M context',
    tokens: 'Free',
    rank: 1,
    description: 'Strong reasoning, coding, tool use and long-horizon agent workflows.',
    isFree: true
  },
  {
    id: 'nvidia/nemotron-3-nano-30b-a3b:free',
    name: 'NVIDIA: Nemotron 3 Nano 30B A3B (free)',
    provider: 'NVIDIA',
    badge: '★ #2 Efficient Agentic',
    context: '256K context',
    tokens: 'Free',
    rank: 2,
    description: 'Efficient open MoE model for specialized agentic AI and technical generation.',
    isFree: true
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Google: Gemma 4 26B A4B (free)',
    provider: 'Google',
    badge: '★ #3 Multilingual & Structured',
    context: '256K context',
    tokens: 'Free',
    rank: 3,
    description: 'Multimodal instruction model with strong multilingual and structured-output support.',
    isFree: true
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Google: Gemma 4 31B Instruct (free)',
    provider: 'Google',
    badge: '★ #4 General Purpose',
    context: '256K context',
    tokens: 'Free',
    rank: 4,
    description: 'Strong general-purpose instruction model for technical and multilingual generation.',
    isFree: true
  }
];

export const CASCADE_MODEL_IDS = TOP_4_FREE_MODELS.map((model) => model.id);

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
 * Four-model OpenRouter cascade for AI article generation.
 * Provider/model failures are isolated so the next model can be attempted.
 * The final Gemini fallback is used only when GEMINI_API_KEY is configured.
 */
export async function executeWithCascadeFallback(options: AiGenerationOptions): Promise<AiGenerationResult> {
  const {
    prompt,
    temperature = 0.7,
    selectedModel,
    openRouterApiKey,
    siteUrl = 'https://errorcodewiki.vercel.app',
    siteName = 'ErrorCodeWiki',
    systemPrompt = 'You are an expert technical diagnostic manual writer and SEO engineer. Output strictly valid JSON without markdown wrapping.'
  } = options;

  const cascadeLogs: string[] = [];
  const modelQueue = selectedModel && selectedModel !== 'auto_cascade' && selectedModel !== 'gemini-3.6-flash'
    ? [selectedModel, ...CASCADE_MODEL_IDS.filter((model) => model !== selectedModel)]
    : [...CASCADE_MODEL_IDS];

  if (openRouterApiKey && openRouterApiKey.trim().length > 5) {
    for (let i = 0; i < modelQueue.length; i++) {
      const currentModel = modelQueue[i];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      try {
        cascadeLogs.push(`Attempting Model #${i + 1} (${currentModel})...`);
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openRouterApiKey.trim()}`,
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
            temperature: typeof temperature === 'number' ? temperature : 0.7,
            max_tokens: 4096
          }),
          signal: controller.signal
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content && content.length > 20) {
            cascadeLogs.push(`✓ Model #${i + 1} (${currentModel}) succeeded!`);
            return { text: content, usedModel: currentModel, cascadeLogs, success: true };
          }
          cascadeLogs.push(`⚠️ Model ${currentModel} returned empty or invalid response. Cascading to next model...`);
          continue;
        }

        const errText = await res.text();
        if (res.status === 429) {
          cascadeLogs.push(`⚠️ Model ${currentModel} rate-limited (429). Skipping immediately...`);
        } else if (res.status === 402) {
          cascadeLogs.push(`⚠️ Model ${currentModel} requires credits (402). Skipping immediately...`);
        } else if (res.status === 400) {
          cascadeLogs.push(`⚠️ Model ${currentModel} rejected the request (400). Skipping immediately...`);
        } else {
          cascadeLogs.push(`⚠️ Model ${currentModel} failed (${res.status}). Cascading to next model...`);
        }
        cascadeLogs.push(`Provider detail: ${errText.slice(0, 180)}`);
      } catch (err: any) {
        cascadeLogs.push(`⚠️ Connection/Timeout on ${currentModel}: ${err?.message || 'Error'}. Cascading to next model...`);
      } finally {
        clearTimeout(timeoutId);
      }
    }
  } else {
    cascadeLogs.push('ℹ️ No OpenRouter API Key configured in Settings. Skipping OpenRouter cascade.');
  }

  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiApiKey) {
    try {
      cascadeLogs.push('Activating Gemini server fallback...');
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
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
        cascadeLogs.push('✓ Gemini fallback completed successfully!');
        return { text, usedModel: 'gemini-3.6-flash', cascadeLogs, success: true };
      }
    } catch (geminiErr: any) {
      cascadeLogs.push(`❌ Gemini fallback error: ${geminiErr?.message || 'Error'}`);
    }
  } else {
    cascadeLogs.push('ℹ️ Gemini fallback unavailable: GEMINI_API_KEY is not configured.');
  }

  throw new Error(`All AI models in the cascade failed or were suspended.\nLogs: ${cascadeLogs.join(' -> ')}`);
}
