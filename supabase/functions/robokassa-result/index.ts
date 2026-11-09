// Result URL Робокассы → активирует Плюс на 30 дней.
// Secrets: ROBOKASSA_PASSWORD2
// В кабинете Робокассы Result URL:
//   https://ongbagumbavgqrpogauz.supabase.co/functions/v1/robokassa-result
// Ответ должен быть: OK{InvId}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import md5 from 'https://esm.sh/js-md5@0.8.3';

const PLUS_DAYS = 30;

Deno.serve(async (req) => {
  try {
    const pass2 = Deno.env.get('ROBOKASSA_PASSWORD2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!pass2 || !supabaseUrl || !serviceKey) {
      return new Response('env', { status: 500 });
    }

    const url = new URL(req.url);
    let outSum = url.searchParams.get('OutSum') ?? '';
    let invId = url.searchParams.get('InvId') ?? '';
    let signature = url.searchParams.get('SignatureValue') ?? '';
    let shpUser = url.searchParams.get('Shp_user') ?? '';

    if (req.method === 'POST') {
      const ct = req.headers.get('content-type') ?? '';
      if (ct.includes('application/x-www-form-urlencoded')) {
        const form = await req.formData();
        outSum = String(form.get('OutSum') ?? outSum);
        invId = String(form.get('InvId') ?? invId);
        signature = String(form.get('SignatureValue') ?? signature);
        shpUser = String(form.get('Shp_user') ?? shpUser);
      }
    }

    if (!outSum || !invId || !signature || !shpUser) {
      return new Response('bad request', { status: 400 });
    }

    const expected = md5(`${outSum}:${invId}:${pass2}:Shp_user=${shpUser}`);
    if (expected.toLowerCase() !== signature.toLowerCase()) {
      return new Response('bad sign', { status: 400 });
    }

    // uuid без дефисов → с дефисами
    const hex = shpUser.toLowerCase();
    if (hex.length !== 32) return new Response('bad user', { status: 400 });
    const userId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;

    const admin = createClient(supabaseUrl, serviceKey);

    await admin.from('payments').upsert({
      id: `robokassa-${invId}`,
      user_id: userId,
      plan: 'plus',
      amount_rub: Number(outSum),
      currency: 'RUB',
      status: 'succeeded',
      raw: { outSum, invId, shpUser, provider: 'robokassa' },
      updated_at: new Date().toISOString(),
    });

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

    return new Response(`OK${invId}`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});
