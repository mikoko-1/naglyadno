import { getSupabase } from '../supabase/client.ts';

export type CreatePaymentResult =
  | { ok: true; confirmationUrl: string; paymentId: string }
  | { ok: false; error: string; needLogin?: boolean };

/** Создаёт платёж Плюс через Edge Function → ЮKassa. */
export async function createPlusPayment(): Promise<CreatePaymentResult> {
  const sb = getSupabase();
  if (!sb) {
    return { ok: false, error: 'Облако не настроено. Нужен Supabase на проде.' };
  }

  const { data: sessionData } = await sb.auth.getSession();
  if (!sessionData.session) {
    return { ok: false, error: 'Сначала войди в аккаунт', needLogin: true };
  }

  const returnUrl = `${window.location.origin}${window.location.pathname}?paid=1`;

  const { data, error } = await sb.functions.invoke('create-payment', {
    body: { returnUrl },
  });

  if (error) {
    return { ok: false, error: error.message || 'Не удалось создать платёж' };
  }

  const payload = data as { confirmationUrl?: string; paymentId?: string; error?: string } | null;
  if (payload?.error) {
    return { ok: false, error: String(payload.error) };
  }
  if (!payload?.confirmationUrl) {
    return { ok: false, error: 'Нет ссылки на оплату' };
  }

  return {
    ok: true,
    confirmationUrl: payload.confirmationUrl,
    paymentId: payload.paymentId ?? '',
  };
}
