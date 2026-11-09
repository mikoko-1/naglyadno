// Создаёт платёжную ссылку Робокассы на Плюс (690 ₽ / 30 дней).
// Secrets: ROBOKASSA_LOGIN, ROBOKASSA_PASSWORD1, опционально ROBOKASSA_IS_TEST=1

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import md5 from 'https://esm.sh/js-md5@0.8.3';

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
    const login = Deno.env.get('ROBOKASSA_LOGIN');
    const pass1 = Deno.env.get('ROBOKASSA_PASSWORD1');
    if (!login || !pass1) {
      return json(
        { error: 'Робокасса ещё не настроена (ROBOKASSA_LOGIN / ROBOKASSA_PASSWORD1)' },
        503,
      );
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

    const invId = Math.floor(Date.now() / 1000) % 2_000_000_000;
    const shpUser = user.id.replace(/-/g, '');
    const signature = md5(`${login}:${PLUS_AMOUNT}:${invId}:${pass1}:Shp_user=${shpUser}`);

    const isTest = Deno.env.get('ROBOKASSA_IS_TEST') === '1';
    const params = new URLSearchParams({
      MerchantLogin: login,
      OutSum: PLUS_AMOUNT,
      InvId: String(invId),
      Description: `Наглядно · Плюс на ${PLUS_DAYS} дней`,
      SignatureValue: signature,
      Shp_user: shpUser,
      Culture: 'ru',
      Encoding: 'utf-8',
    });
    if (isTest) params.set('IsTest', '1');

    const confirmationUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`;

    const admin = createClient(supabaseUrl, serviceKey);
    await admin.from('payments').upsert({
      id: `robokassa-${invId}`,
      user_id: user.id,
      plan: 'plus',
      amount_rub: Number(PLUS_AMOUNT),
      currency: 'RUB',
      status: 'pending',
      raw: { invId, shpUser, provider: 'robokassa' },
      updated_at: new Date().toISOString(),
    });

    return json({ confirmationUrl, paymentId: String(invId) });
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
