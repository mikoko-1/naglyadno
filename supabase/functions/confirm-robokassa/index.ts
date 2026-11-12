// Подтверждение оплаты с Success URL (когда Result URL даёт 401 без JWT).
// Вызывает залогиненный клиент с параметрами от Робокассы.
// Secrets: ROBOKASSA_PASSWORD1

import { createHash } from 'node:crypto';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const PLUS_DAYS = 30;
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const pass1 = Deno.env.get('ROBOKASSA_PASSWORD1')?.trim();
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!pass1 || !supabaseUrl || !anon || !serviceKey) {
      return json({ error: 'env' }, 500);
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
    const outSum = String(body.OutSum ?? body.out_summ ?? '');
    const invId = String(body.InvId ?? body.inv_id ?? '');
    const signature = String(body.SignatureValue ?? body.crc ?? '').toLowerCase();
    const shpUser = String(body.Shp_user ?? '').replace(/-/g, '').toLowerCase();

    if (!outSum || !invId || !signature) {
      return json({ error: 'Нет параметров оплаты' }, 400);
    }

    // Подпись Success URL: OutSum:InvId:Password1[:Shp_user=...]
    const withShp = createHash('md5')
      .update(`${outSum}:${invId}:${pass1}:Shp_user=${shpUser || user.id.replace(/-/g, '')}`)
      .digest('hex')
      .toLowerCase();
    const noShp = createHash('md5')
      .update(`${outSum}:${invId}:${pass1}`)
      .digest('hex')
      .toLowerCase();

    if (signature !== withShp && signature !== noShp) {
      return json({ error: 'Неверная подпись оплаты' }, 400);
    }

    // Shp_user должен совпадать с текущим пользователем (если передан)
    const myHex = user.id.replace(/-/g, '').toLowerCase();
    if (shpUser && shpUser !== myHex) {
      return json({ error: 'Оплата принадлежит другому аккаунту' }, 403);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const paymentId = `robokassa-${invId}`;

    await admin.from('payments').upsert({
      id: paymentId,
      user_id: user.id,
      plan: 'plus',
      amount_rub: Number(outSum),
      currency: 'RUB',
      status: 'succeeded',
      raw: { ...body, provider: 'robokassa', via: 'confirm-robokassa' },
      updated_at: new Date().toISOString(),
    });

    const { data: profile } = await admin
      .from('profiles')
      .select('plan_expires_at')
      .eq('id', user.id)
      .maybeSingle();

    const now = Date.now();
    const currentExp = profile?.plan_expires_at
      ? new Date(profile.plan_expires_at as string).getTime()
      : 0;
    const base = Math.max(now, currentExp);
    const expires = new Date(base + PLUS_DAYS * 24 * 60 * 60 * 1000);

    const { error: updErr } = await admin
      .from('profiles')
      .update({
        plan: 'plus',
        plan_expires_at: expires.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updErr) return json({ error: updErr.message }, 500);

    return json({ ok: true, plan: 'plus', planExpiresAt: expires.toISOString() });
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
