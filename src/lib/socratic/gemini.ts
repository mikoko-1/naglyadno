import {
  createApiSocraticProvider,
  SYSTEM_RULES,
  type ChatMessage,
  type SocraticProvider,
} from './provider.ts';

/** Актуальные id моделей (старые 3.x часто дают 404 и рвали связь). */
const MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
] as const;

function toGeminiContents(history: ChatMessage[], userMessage: string, contextNote?: string) {
  const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

  for (const m of history) {
    if (m.role === 'system') continue;
    const role = m.role === 'assistant' ? 'model' : 'user';
    contents.push({ role, parts: [{ text: m.content }] });
  }

  const extra = contextNote ? `\n\nКонтекст урока: ${contextNote}` : '';
  contents.push({ role: 'user', parts: [{ text: `${userMessage}${extra}` }] });
  return contents;
}

function friendlyGeminiError(status: number, body: string): string {
  if (status === 401 || status === 403) {
    return 'Ключ Gemini не принят. Создай новый на aistudio.google.com/apikey и вставь в .env (VITE_GEMINI_API_KEY), потом перезапусти npm run dev.';
  }
  if (status === 429) {
    return 'Слишком много запросов к Gemini. Подожди минуту и попробуй ещё раз.';
  }
  if (status === 503) {
    return 'Gemini сейчас перегружен. Попробуй через минуту.';
  }
  const snippet = body.replace(/\s+/g, ' ').slice(0, 140);
  return `Gemini ${status}: ${snippet || 'ошибка сети'}`;
}

async function callGemini(
  apiKey: string,
  system: string,
  history: ChatMessage[],
  userMessage: string,
  contextNote?: string,
) {
  const payload = {
    systemInstruction: { parts: [{ text: system }] },
    contents: toGeminiContents(history, userMessage, contextNote),
    generationConfig: {
      temperature: 0.55,
      maxOutputTokens: 550,
    },
  };

  let lastError = 'Gemini недоступен';
  for (const model of MODELS) {
    // Native Gemini: query key + header (нужно для новых ключей AQ.)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      lastError = 'Нет сети до Gemini. Проверь интернет.';
      continue;
    }

    if (!res.ok) {
      const body = await res.text();
      lastError = friendlyGeminiError(res.status, body);
      // Пробуем следующую модель почти всегда (кроме явного отказа ключа)
      if (res.status === 401 || res.status === 403) throw new Error(lastError);
      continue;
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
      promptFeedback?: { blockReason?: string };
    };

    if (data.promptFeedback?.blockReason) {
      lastError = 'Gemini отклонил запрос (фильтр безопасности). Переформулируй вопрос.';
      continue;
    }

    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('')?.trim();
    if (!text) {
      lastError = `Пустой ответ (${model})`;
      continue;
    }
    return text;
  }

  throw new Error(lastError);
}

/** Прямой вызов Gemini (ключ в VITE_ — только для разработки). */
export function createGeminiSocraticProvider(apiKey: string): SocraticProvider {
  return createApiSocraticProvider(async ({ system, history, userMessage, contextNote }) => {
    return callGemini(apiKey, system, history, userMessage, contextNote);
  });
}

export { SYSTEM_RULES, callGemini, MODELS as GEMINI_MODELS };
