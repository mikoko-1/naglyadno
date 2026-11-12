import { getSupabase } from '../supabase/client.ts';

/** После возврата с Success URL подтверждаем оплату на сервере (обход 401 на Result URL). */
export async function confirmRobokassaFromUrl(
  params: URLSearchParams,
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Нет Supabase' };

  const { data: sessionData } = await sb.auth.getSession();
  if (!sessionData.session) return { ok: false, error: 'Нужен вход' };

  const body = {
    OutSum: params.get('OutSum') ?? params.get('out_summ') ?? '',
    InvId: params.get('InvId') ?? params.get('inv_id') ?? '',
    SignatureValue: params.get('SignatureValue') ?? params.get('crc') ?? '',
    Shp_user: params.get('Shp_user') ?? '',
  };

  if (!body.OutSum || !body.InvId || !body.SignatureValue) {
    return { ok: false, error: 'Нет параметров Робокассы' };
  }

  const { data, error } = await sb.functions.invoke('confirm-robokassa', { body });
  const payload = data as { ok?: boolean; error?: string } | null;

  if (payload?.error) return { ok: false, error: payload.error };
  if (error) return { ok: false, error: error.message };
  if (!payload?.ok) return { ok: false, error: 'Не подтвердилось' };
  return { ok: true };
}
