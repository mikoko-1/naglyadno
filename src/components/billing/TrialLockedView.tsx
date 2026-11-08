import { Lock } from 'lucide-react';
import { TRIAL_DAYS } from '../../lib/account/storage.ts';

type TrialLockedViewProps = {
  dark?: boolean;
  onPay: () => void;
  onAccount: () => void;
};

export function TrialLockedView({ dark, onPay, onAccount }: TrialLockedViewProps) {
  const card = dark
    ? 'border-white/10 bg-slate-900/80 text-slate-100'
    : 'border-slate-200/80 bg-white text-slate-900';
  const muted = dark ? 'text-slate-400' : 'text-slate-600';

  return (
    <section className={`mx-auto max-w-lg rounded-3xl border p-6 shadow-sm sm:p-8 ${card}`}>
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-500">
          <Lock className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Пробный период закончился</h1>
          <p className={`mt-2 text-sm leading-relaxed ${muted}`}>
            {TRIAL_DAYS} дня полного доступа уже использованы. Чтобы снова открыть уроки, Сократа,
            год и отчёт родителю — оформи тариф Плюс (690 ₽ / 30 дней).
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPay}
              className="inline-flex h-11 items-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"
            >
              Оформить Плюс · 690 ₽
            </button>
            <button
              type="button"
              onClick={onAccount}
              className={`inline-flex h-11 items-center rounded-xl px-4 text-sm font-semibold ring-1 ${
                dark ? 'ring-white/15' : 'ring-slate-200'
              }`}
            >
              Войти в аккаунт
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
