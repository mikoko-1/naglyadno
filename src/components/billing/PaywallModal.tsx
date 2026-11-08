import { Check, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { createPlusPayment } from '../../lib/billing/createPayment.ts';
import { PLAN_META, type AccountState, type PlanId } from '../../lib/account/storage.ts';

type PaywallModalProps = {
  open: boolean;
  dark?: boolean;
  account: AccountState;
  highlight?: PlanId;
  reason?: string;
  onClose: () => void;
  /** Если не вошёл — открыть экран аккаунта */
  onNeedLogin: () => void;
};

export function PaywallModal({
  open,
  dark,
  account,
  highlight = 'plus',
  reason,
  onClose,
  onNeedLogin,
}: PaywallModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const meta = PLAN_META.plus;
  const alreadyPlus = account.plan === 'plus';

  async function buy() {
    setBusy(true);
    setError(null);
    const res = await createPlusPayment();
    setBusy(false);
    if (!res.ok) {
      if (res.needLogin) {
        onClose();
        onNeedLogin();
        return;
      }
      setError(res.error);
      return;
    }
    window.location.assign(res.confirmationUrl);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className={`max-h-[90svh] w-full max-w-lg overflow-y-auto rounded-3xl border p-5 shadow-2xl sm:p-6 ${
          dark ? 'border-white/10 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
        }`}
        role="dialog"
        aria-label="Тариф Плюс"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Наглядно · Плюс</h2>
            <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              {reason ??
                'После 3 дней пробного периода нужен Плюс: уроки, Сократ, год и отчёт родителю.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`grid size-9 place-items-center rounded-full ${dark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
            aria-label="Закрыть"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          className={`mt-5 rounded-2xl border p-4 ${
            highlight === 'plus'
              ? 'border-indigo-500 bg-indigo-500/10'
              : dark
                ? 'border-white/10'
                : 'border-slate-200'
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-semibold">{meta.title}</p>
            <p className="text-sm font-semibold text-indigo-500">{meta.price}</p>
          </div>
          <p className={`mt-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{meta.blurb}</p>
          <ul className="mt-3 space-y-1.5">
            {meta.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={busy}
            onClick={() => void buy()}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {alreadyPlus ? 'Продлить на 30 дней · 690 ₽' : 'Оплатить · 690 ₽'}
          </button>
          {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
        </div>

        <p className={`mt-4 text-xs leading-relaxed ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
          Оплата через ЮKassa. Нужен вход в аккаунт. Плюс активируется после успешного платежа
          (обычно сразу; если не обновилось — нажми «Синхронизировать» в аккаунте). Оплачивая, вы
          принимаете условия оферты — ссылка внизу сайта: «Оферта» и «Конфиденциальность».
        </p>
      </div>
    </div>
  );
}
