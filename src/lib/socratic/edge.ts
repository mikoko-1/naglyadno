import { getSupabase } from '../supabase/client.ts';
import { createApiSocraticProvider, type SocraticProvider } from './provider.ts';

/**
 * Сократ через Supabase Edge Function `socrates`
 * (ключ Gemini лежит в секретах проекта, не во фронте).
 */
export function createEdgeSocraticProvider(): SocraticProvider {
  return createApiSocraticProvider(async ({ system, history, userMessage, contextNote }) => {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase не настроен');

    const { data, error } = await sb.functions.invoke('socrates', {
      body: { system, history, userMessage, contextNote },
    });

    if (error) {
      const msg = error.message || String(error);
      if (/Failed to send|fetch|network|CORS/i.test(msg)) {
        throw new Error(
          'Не достучался до сервера Сократа. Проверь интернет и что Edge Function socrates задеплоена.',
        );
      }
      throw new Error(msg);
    }
    const payload = data as { text?: string; error?: string } | null;
    if (payload?.error) throw new Error(String(payload.error).slice(0, 240));
    const text = payload?.text?.trim();
    if (!text) throw new Error('Пустой ответ функции socrates');
    return text;
  });
}
