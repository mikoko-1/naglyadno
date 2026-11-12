// Result URL Робокассы → активирует Плюс на 30 дней.
// Secrets: ROBOKASSA_PASSWORD2
// URL: https://ongbagumbavgqrpogauz.supabase.co/functions/v1/robokassa-result
// Ответ: OK{InvId}

import { createHash } from 'node:crypto';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const PLUS_DAYS = 30;

Deno.serve(async (req) => {
  try {
    const pass2 = Deno.env.get('ROBOKASSA_PASSWORD2')?.trim();
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!pass2 || !supabaseUrl || !serviceKey) {
      return new Response('env', { status: 500 });
    }

    const fields = await readFields(req);
    const outSum = fields.OutSum ?? '';
    const invId = fields.InvId ?? '';
    const signature = (fields.SignatureValue ?? '').toLowerCase();
    const shpUser = fields.Shp_user ?? fields.shp_user ?? '';

    if (!outSum || !invId || !signature) {
      return new Response('bad request', { status: 400 });
    }

    const signOk =
      checkSign(outSum, invId, pass2, signature, shpUser) ||
      checkSign(outSum, invId, pass2, signature, '');
    if (!signOk) {
      return new Response('bad sign', { status: 400 });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const paymentId = `robokassa-${invId}`;

    // Сначала ищем user_id из записи, созданной при create-payment
    let userId: string | null = null;
    const { data: existing } = await admin
      .from('payments')
      .select('user_id')
      .eq('id', paymentId)
      .maybeSingle();
    if (existing?.user_id) userId = String(existing.user_id);

    if (!userId && shpUser) {
      const hex = shpUser.toLowerCase().replace(/-/g, '');
      if (hex.length === 32) {
        userId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      }
    }

    if (!userId) {
      return new Response('no user', { status: 400 });
    }

    await admin.from('payments').upsert({
      id: paymentId,
      user_id: userId,
      plan: 'plus',
      amount_rub: Number(outSum),
      currency: 'RUB',
      status: 'succeeded',
      raw: { ...fields, provider: 'robokassa' },
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

    const { error: updErr } = await admin
      .from('profiles')
      .update({
        plan: 'plus',
        plan_expires_at: expires.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updErr) {
      return new Response(`profile ${updErr.message}`, { status: 500 });
    }

    return new Response(`OK${invId}`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});

function checkSign(
  outSum: string,
  invId: string,
  pass2: string,
  signature: string,
  shpUser: string,
): boolean {
  const base = shpUser
    ? `${outSum}:${invId}:${pass2}:Shp_user=${shpUser}`
    : `${outSum}:${invId}:${pass2}`;
  const expected = createHash('md5').update(base).digest('hex').toLowerCase();
  return expected === signature;
}

async function readFields(req: Request): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const url = new URL(req.url);
  for (const [k, v] of url.searchParams.entries()) out[k] = v;

  if (req.method === 'POST') {
    const ct = req.headers.get('content-type') ?? '';
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const form = await req.formData();
      for (const [k, v] of form.entries()) {
        if (typeof v === 'string') out[k] = v;
      }
    } else if (ct.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      if (body && typeof body === 'object') {
        for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
          if (v != null) out[k] = String(v);
        }
      }
    }
  }
  return out;
}
