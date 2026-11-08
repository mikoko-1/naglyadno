import { isSupabaseConfigured } from '../supabase/client.ts';
import { createEdgeSocraticProvider } from './edge.ts';
import { createGeminiSocraticProvider } from './gemini.ts';
import {
  createMockSocraticProvider,
  setSocraticProvider,
} from './provider.ts';

/**
 * Порядок (важно для РФ: прямой Gemini из браузера часто не работает без VPN):
 * 1) Supabase настроен → Edge Function (сервер в EU/US ходит в Google)
 * 2) VITE_SOCRATES_MODE=gemini + VITE_GEMINI_API_KEY → прямой Gemini (только с VPN / вне РФ)
 * 3) иначе локальный mock
 */
export function bootstrapSocraticProvider() {
  const mode = (import.meta.env.VITE_SOCRATES_MODE as string | undefined)?.toLowerCase();
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const key = geminiKey?.trim().replace(/^["']|["']$/g, '');
  const wantDirectGemini = mode === 'gemini' || mode === 'direct';

  // По умолчанию и при mode=edge — через Supabase (без VPN у пользователя)
  if (!wantDirectGemini && isSupabaseConfigured()) {
    setSocraticProvider(createEdgeSocraticProvider());
    return 'edge';
  }

  if (key && key.length > 10) {
    setSocraticProvider(createGeminiSocraticProvider(key));
    return 'gemini';
  }

  setSocraticProvider(createMockSocraticProvider());
  return 'mock';
}
