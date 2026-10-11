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
 * Prefer general-purpose free models suitable for technical articles.
 * JSON is enforced by prompting and parsing so models that do not support
 * OpenRouter's response_format option can still participate in the cascade.
 */
export const TOP_FREE_MODELS: TopModelDefinition[] = [
  {
    id: 'openrouter/free',
    name: 'OpenRouter: Free Models Router',
    provider: 'OpenRouter',
    badge: '★ Primary · automatic free routing',
    context: 'Varies by model',
    tokens: 'Free',
    rank: 1,
    description: 'Automatically routes to an available free model; the selected provider can still be rate-limited.',
    isFree: true
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    name: 'NVIDIA: Nemotron 3 Ultra (free)',
    provider: 'NVIDIA',
    badge: 'General-purpose',
    context: '1M context',
    tokens: 'Free',
    rank: 2,
    description: 'Large general-purpose free model for technical explanations and structured content.',
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
    description: 'Free model suited to technical and coding-oriented tasks.',
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
    description: 'High-throughput free model option for generating technical content.',
    isFree: true
  },
  {
    id: 'cohere/north-mini-code:free',
    name: 'Cohere: North Mini Code (free)',
    provider: 'Cohere',
    badge: 'Code specialist',
    context: '256K context',
    tokens: 'Free',
    rank: 5,
    description: 'Code-focused fallback for debugging steps and technical troubleshooting.',
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
    description: 'Multilingual model for clear technical explanations; may be rate-limited upstream.',
    isFree: true
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Google: Gemma 4 26B A4B (free)',
    provider: 'Google',
    badge: 'Balanced fallback',
    context: '262K context',
    tokens: 'Free',
    rank: 7,
    description: 'Efficient instruction-following fallback for structured technical content.',
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
 * Resilient OpenRouter cascade with multiple free-model fallbacks.
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
  let freeQuotaExhausted = false;
  const modelQueue = selectedModel && CASCADE_MODEL_IDS.includes(selectedModel)
    ? [selectedModel, ...CASCADE_MODEL_IDS.filter((model) => model !== selectedModel)]
    : [...CASCADE_MODEL_IDS];

  if (openRouterApiKey && openRouterApiKey.trim().length > 5) {
    for (let i = 0; i < modelQueue.length; i++) {
      const currentModel = modelQueue[i];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

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
            max_tokens: 8192,
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
          const providerDetail = errText.toLowerCase();
          if (providerDetail.includes('free-models-per-day') || providerDetail.includes('free model requests per day')) {
            freeQuotaExhausted = true;
            cascadeLogs.push('⛔ OpenRouter free-model daily quota exhausted. Skipping remaining free models and stopping the cascade because all configured models use the free tier.');
            cascadeLogs.push(`Provider detail: ${errText.slice(0, 180)}`);
            break;
          }
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


  // OpenRouter is the only configured provider. If its free quota is exhausted,
  // fail clearly so automation can pause until the quota resets or billing changes.
  if (freeQuotaExhausted) {
    cascadeLogs.push('ℹ️ OpenRouter free quota is exhausted; no other provider is configured.');
  }

  throw new Error(`All AI models in the cascade failed or were suspended.\nLogs: ${cascadeLogs.join(' -> ')}`);
}
