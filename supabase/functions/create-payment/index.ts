// Создаёт платёж ЮKassa на Плюс (690 ₽ / 30 дней).
// Secrets: YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY
// Авто: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLUS_AMOUNT = '690.00';
const PLUS_DAYS = 30;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const shopId = Deno.env.get('YOOKASSA_SHOP_ID');
    const secret = Deno.env.get('YOOKASSA_SECRET_KEY');
    if (!shopId || !secret) {
      return json({ error: 'ЮKassa ещё не настроена (YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY)' }, 503);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !anon || !serviceKey) {
      return json({ error: 'Supabase env не задан' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Нужен вход' }, 401);

    const userClient = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'Нужен вход' }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const returnUrl =
      typeof body.returnUrl === 'string' && /^https?:\/\//i.test(body.returnUrl)
        ? body.returnUrl
        : Deno.env.get('SITE_URL')
          ? `${Deno.env.get('SITE_URL')}/?paid=1`
          : null;
    if (!returnUrl) return json({ error: 'Не указан returnUrl' }, 400);

    const idempotenceKey = crypto.randomUUID();
    const ykRes = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        Authorization: `Basic ${btoa(`${shopId}:${secret}`)}`,
      },
      body: JSON.stringify({
        amount: { value: PLUS_AMOUNT, currency: 'RUB' },
        capture: true,
        confirmation: { type: 'redirect', return_url: returnUrl },
        description: `Наглядно · Плюс на ${PLUS_DAYS} дней`,
        metadata: {
          user_id: user.id,
          plan: 'plus',
          days: String(PLUS_DAYS),
        },
      }),
    });

    const yk = await ykRes.json();
    if (!ykRes.ok) {
      return json(
        { error: String(yk?.description ?? yk?.message ?? 'Ошибка ЮKassa').slice(0, 240) },
        502,
      );
    }

    const confirmationUrl = yk?.confirmation?.confirmation_url as string | undefined;
    if (!confirmationUrl || !yk.id) {
      return json({ error: 'ЮKassa не вернула ссылку на оплату' }, 502);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    await admin.from('payments').upsert({
      id: yk.id,
      user_id: user.id,
      plan: 'plus',
      amount_rub: Number(PLUS_AMOUNT),
      currency: 'RUB',
      status: yk.status ?? 'pending',
      raw: yk,
      updated_at: new Date().toISOString(),
    });

    return json({ confirmationUrl, paymentId: yk.id });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
