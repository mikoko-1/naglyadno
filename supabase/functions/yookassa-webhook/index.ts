// Вебхук ЮKassa → активирует Плюс на 30 дней.
// Secrets: YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY
// URL в кабинете ЮKassa:
//   https://<project>.supabase.co/functions/v1/yookassa-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLUS_DAYS = 30;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const shopId = Deno.env.get('YOOKASSA_SHOP_ID');
    const secret = Deno.env.get('YOOKASSA_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!shopId || !secret || !supabaseUrl || !serviceKey) {
      return json({ error: 'env' }, 500);
    }

    const event = await req.json();
    const paymentId = event?.object?.id as string | undefined;
    if (!paymentId) return json({ error: 'no payment id' }, 400);

    // Проверяем платёж у ЮKassa (не доверяем телу вебхука вслепую)
    const ykRes = await fetch(`https://api.yookassa.ru/v3/payments/${encodeURIComponent(paymentId)}`, {
      headers: {
        Authorization: `Basic ${btoa(`${shopId}:${secret}`)}`,
      },
    });
    const payment = await ykRes.json();
    if (!ykRes.ok) {
      return json({ error: 'yookassa fetch failed' }, 502);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const userId = payment?.metadata?.user_id as string | undefined;
    const status = String(payment?.status ?? 'unknown');

    if (!userId) {
      return json({ error: 'no user_id in metadata' }, 400);
    }

    await admin.from('payments').upsert({
      id: payment.id,
      user_id: userId,
      plan: 'plus',
      amount_rub: Number(payment?.amount?.value ?? 0),
      currency: String(payment?.amount?.currency ?? 'RUB'),
      status,
      raw: payment,
      updated_at: new Date().toISOString(),
    });

    if (status === 'succeeded') {
      const { data: profile } = await admin
        .from('profiles')
        .select('plan_expires_at')
        .eq('id', userId)
        .maybeSingle();

      const now = Date.now();
      const currentExp = profile?.plan_expires_at
        ? new Date(profile.plan_expires_at as string).getTime()
        : 0;
      const base = Math.max(now, currentExp);
      const expires = new Date(base + PLUS_DAYS * 24 * 60 * 60 * 1000);

      await admin
        .from('profiles')
        .update({
          plan: 'plus',
          plan_expires_at: expires.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    return json({ ok: true });
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
