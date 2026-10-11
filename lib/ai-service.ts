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

/**
 * Keep this list limited to general-purpose text models that can handle the
 * JSON article-generation contract. The OpenRouter free router is included
 * first so the cascade is not tied to a stale provider/model combination.
 */
export const TOP_FREE_MODELS: TopModelDefinition[] = [
  {
    id: 'openrouter/free',
    name: 'OpenRouter: Free Router',
    provider: 'OpenRouter',
    badge: '★ Primary fallback · Auto-routes free models',
    context: '200K context',
    tokens: 'Free',
    rank: 1,
    description: 'Automatically routes to an available free model with support for the request capabilities.',
    isFree: true
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    name: 'NVIDIA: Nemotron 3 Ultra (free)',
    provider: 'NVIDIA',
    badge: 'Reasoning & technical writing',
    context: '1M context',
    tokens: 'Free',
    rank: 2,
    description: 'Strong reasoning and long-context technical generation.',
    isFree: true
  },
  {
    id: 'poolside/laguna-s-2.1:free',
    name: 'Poolside: Laguna S 2.1 (free)',
    provider: 'Poolside',
    badge: 'Technical fallback',
    context: '262K context',
    tokens: 'Free',
    rank: 3,
    description: 'Technical writing and coding-oriented free fallback.',
    isFree: true
  },
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'NVIDIA: Nemotron 3.5 Lightning (free)',
    provider: 'NVIDIA',
    badge: 'Fast fallback',
    context: '1M context',
    tokens: 'Free',
    rank: 4,
    description: 'Fast general-purpose free model for high-throughput generation.',
    isFree: true
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Google: Gemma 4 26B A4B (free)',
    provider: 'Google',
    badge: 'Multilingual fallback',
    context: '256K context',
    tokens: 'Free',
    rank: 5,
    description: 'Multilingual instruction following and structured-output support.',
    isFree: true
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Google: Gemma 4 31B (free)',
    provider: 'Google',
    badge: 'Multilingual fallback',
    context: '262K context',
    tokens: 'Free',
    rank: 6,
    description: 'Multilingual technical writing and structured JSON generation.',
    isFree: true
  },
  {
    id: 'openai/gpt-oss-120b:free',
    name: 'OpenAI: gpt-oss-120b (free)',
    provider: 'OpenAI',
    badge: 'Reasoning fallback',
    context: '131K context',
    tokens: 'Free',
    rank: 7,
    description: 'General-purpose reasoning model with structured-output support.',
    isFree: true
  }
];

export const CASCADE_MODEL_IDS = TOP_FREE_MODELS.map((model) => model.id);

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
 * Resilient OpenRouter cascade with a Gemini server fallback.
 * Provider/model failures are isolated so the next model can be attempted.
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
      const timeoutId = setTimeout(() => controller.abort(), 30000);

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
            max_tokens: 4096,
            response_format: { type: 'json_object' }
          }),
          signal: controller.signal
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content && content.length > 20) {
            const normalizedContent = content
              .replace(/^```json\s*/i, '')
              .replace(/^```\s*/, '')
              .replace(/\s*```$/, '');
            try {
              JSON.parse(normalizedContent);
              cascadeLogs.push(`✓ Model #${i + 1} (${currentModel}) returned valid JSON!`);
              return { text: content, usedModel: currentModel, cascadeLogs, success: true };
            } catch {
              cascadeLogs.push(`⚠️ Model ${currentModel} returned malformed/truncated JSON. Cascading to next model...`);
              continue;
            }
          }
          cascadeLogs.push(`⚠️ Model ${currentModel} returned empty or invalid response. Cascading to next model...`);
          continue;
        }

        const errText = await res.text();
        if (res.status === 401) {
          cascadeLogs.push('❌ OpenRouter authentication failed (401). Check OPENROUTER_API_KEY in the server environment; skipping remaining OpenRouter models.');
          cascadeLogs.push(`Provider detail: ${errText.slice(0, 180)}`);
          break;
        }
        if (res.status === 403) {
          // OpenRouter can return 403 when a specific model is restricted (for example,
          // agentic-harness-only models). Treat this as a model failure, not a global key
          // failure, so healthy models later in the cascade still get a chance.
          cascadeLogs.push(`⚠️ Model ${currentModel} is forbidden/unavailable (403). Skipping this model and continuing the cascade.`);
          cascadeLogs.push(`Provider detail: ${errText.slice(0, 180)}`);
          continue;
        }
        if (res.status === 429) {
          const retryAfter = Number(res.headers.get('retry-after') || 0);
          const waitMs = Math.min(Math.max(retryAfter * 1000, 1500), 5000);
          cascadeLogs.push(`⚠️ Model ${currentModel} rate-limited (429). Waiting ${Math.round(waitMs / 1000)}s, then cascading...`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        } else if (res.status === 402) {
          cascadeLogs.push(`⚠️ Model ${currentModel} requires credits (402). Cascading to next model...`);
        } else if (res.status === 400) {
          cascadeLogs.push(`⚠️ Model ${currentModel} rejected the request (400). Cascading to next model...`);
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
