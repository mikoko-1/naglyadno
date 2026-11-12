import { getSupabase } from '../supabase/client.ts';

export type CreatePaymentResult =
  | { ok: true; confirmationUrl: string; paymentId: string }
  | { ok: false; error: string; needLogin?: boolean };

/** Создаёт платёж Плюс через Edge Function → Робокасса. */
export async function createPlusPayment(): Promise<CreatePaymentResult> {
  const sb = getSupabase();
  if (!sb) {
    return { ok: false, error: 'Облако не настроено. Нужен Supabase на проде.' };
  }

  const { data: sessionData } = await sb.auth.getSession();
  if (!sessionData.session) {
    return { ok: false, error: 'Сначала войди в аккаунт', needLogin: true };
  }

  const { data, error } = await sb.functions.invoke('create-payment', {
    body: {},
  });

  const payload = data as { confirmationUrl?: string; paymentId?: string; error?: string } | null;

  if (payload?.error) {
    return { ok: false, error: String(payload.error) };
  }

  if (error) {
    const msg = error.message || 'Не удалось создать платёж';
    // Часто при 4xx/5xx тело лежит в data
    if (payload && typeof payload === 'object') {
      return {
        ok: false,
        error: `${msg}. Ответ: ${JSON.stringify(payload).slice(0, 200)}`,
      };
    }
    return { ok: false, error: msg };
  }

  if (!payload?.confirmationUrl) {
    return {
      ok: false,
      error: `Нет ссылки на оплату. Ответ сервера: ${JSON.stringify(payload).slice(0, 200)}`,
    };
  }

  return {
    ok: true,
    confirmationUrl: payload.confirmationUrl,
    paymentId: payload.paymentId ?? '',
  };
}
