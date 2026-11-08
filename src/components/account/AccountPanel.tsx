import { useEffect, useState } from 'react';
import { Cloud, CreditCard, Loader2, LogIn, LogOut, Shield } from 'lucide-react';
import { canUse } from '../../lib/account/limits.ts';
import {
  activatePlan,
  effectivePlan,
  PLAN_META,
  saveAccount,
  type AccountState,
} from '../../lib/account/storage.ts';
import type { ProgressState } from '../../lib/progress/storage.ts';
import { isSupabaseConfigured } from '../../lib/supabase/client.ts';
import {
  getSessionUserId,
  onAuthChange,
  pullCloudState,
  pushCloudState,
  signIn,
  signOut,
  signUp,
} from '../../lib/supabase/sync.ts';
import type { YearProgressState } from '../../lib/year/progress.ts';

type AccountPanelProps = {
  account: AccountState;
  progress: ProgressState;
  yearProgress: YearProgressState;
  dark?: boolean;
  onAccountChange: (next: AccountState) => void;
  onCloudPulled: (bundle: {
    account: AccountState;
    progress: ProgressState;
    year: YearProgressState;
  }) => void;
  onOpenPaywall: (reason: string) => void;
  onResetOnboarding: () => void;
};

export function AccountPanel({
  account,
  progress,
  yearProgress,
  dark,
  onAccountChange,
  onCloudPulled,
  onOpenPaywall,
  onResetOnboarding,
}: AccountPanelProps) {
  const plan = effectivePlan(account);
  const meta = PLAN_META[plan];
  const cloud = canUse(account, 'cloud');
  const configured = isSupabaseConfigured();
  const card = dark
    ? 'border-white/10 bg-slate-900/80 text-slate-100'
    : 'border-slate-200/80 bg-white text-slate-900';
  const muted = dark ? 'text-slate-400' : 'text-slate-600';

  const [userId, setUserId] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(account.email || '');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(account.displayName || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getSessionUserId().then(setUserId);
    return onAuthChange(setUserId);
  }, []);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === 'register') {
        const res = await signUp(email, password, displayName);
        if (res.error) {
          setError(res.error);
          return;
        }
        if (!res.session) {
          setMessage('Проверь почту и подтверди регистрацию (если включено в Supabase), затем войди.');
          setMode('login');
          return;
        }
      } else {
        const res = await signIn(email, password);
        if (res.error) {
          setError(res.error);
          return;
        }
      }

      const localFirst = {
        ...account,
        email: email.trim(),
        displayName: displayName.trim() || account.displayName,
      };
      saveAccount(localFirst);
      onAccountChange(localFirst);

      await pushCloudState({ account: localFirst, progress, year: yearProgress });
      const pulled = await pullCloudState();
      if (pulled) onCloudPulled(pulled);
      setMessage('Готово: прогресс в облаке.');
      setPassword('');
    } finally {
      setBusy(false);
    }
  }

  async function handleSync() {
    if (!configured) {
      setError('Добавь ключи Supabase в .env (см. README).');
      return;
    }
    if (!userId) {
      setError('Сначала войди — тогда прогресс сохранится в бесплатной БД.');
      return;
    }
    if (!cloud.ok) {
      onOpenPaywall(cloud.reason ?? 'Нужен Плюс для облака');
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const push = await pushCloudState({ account, progress, year: yearProgress });
      if (!push.ok) {
        setError(push.error ?? 'Не удалось сохранить');
        return;
      }
      const pulled = await pullCloudState();
      if (pulled) {
        onCloudPulled(pulled);
        setMessage(`Синхронизировано: ${new Date().toLocaleString('ru-RU')}`);
      } else {
        setMessage('Сохранено в облако.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    try {
      await signOut();
      setUserId(null);
      setMessage('Вышли из облака. Данные на устройстве остались.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Аккаунт</h1>
        <p className={`mt-1 text-sm ${muted}`}>
          Локально всё работает сразу. Облако — бесплатный Supabase после входа.
        </p>
      </div>

      <section className={`rounded-3xl border p-5 ${card}`}>
        <p className="text-sm font-semibold">{account.displayName || 'Без имени'}</p>
        <p className={`mt-1 text-sm ${muted}`}>
          {account.email || 'email не указан'} · {account.role === 'parent' ? 'родитель' : 'ученик'} ·{' '}
          {account.grade} класс
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-500">
            {meta.title} · {meta.price}
          </span>
          {account.planExpiresAt && plan !== 'free' && (
            <span className="text-xs text-slate-500">
              до {new Date(account.planExpiresAt).toLocaleDateString('ru-RU')}
            </span>
          )}
          {userId && (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600">
              облако подключено
            </span>
          )}
        </div>
      </section>

      <section className={`rounded-3xl border p-5 ${card}`}>
        <div className="flex items-center gap-2">
          <LogIn className="size-4 text-indigo-500" />
          <h2 className="text-sm font-semibold">Вход в облако</h2>
        </div>

        {!configured && (
          <p className={`mt-2 text-sm ${muted}`}>
            Скопируй <code className="text-xs">.env.example</code> → <code className="text-xs">.env</code>,
            вставь URL и anon key из Supabase, перезапусти{' '}
            <code className="text-xs">npm run dev</code>. SQL — в{' '}
            <code className="text-xs">supabase/migrations/001_init.sql</code>.
          </p>
        )}

        {configured && userId && (
          <div className="mt-3 space-y-3">
            <p className={`text-sm ${muted}`}>Сессия активна. Можно синхронизировать прогресс.</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSignOut()}
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold ring-1 ${
                dark ? 'ring-white/15' : 'ring-slate-200'
              }`}
            >
              <LogOut className="size-3.5" />
              Выйти
            </button>
          </div>
        )}

        {configured && !userId && (
          <form className="mt-3 space-y-3" onSubmit={(e) => void handleAuth(e)}>
            <div className="flex gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={mode === 'login' ? 'text-indigo-500' : muted}
              >
                Войти
              </button>
              <span className={muted}>/</span>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={mode === 'register' ? 'text-indigo-500' : muted}
              >
                Регистрация
              </button>
            </div>
            {mode === 'register' && (
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Имя"
                className={`h-10 w-full rounded-xl px-3 text-sm outline-none ring-1 ${
                  dark ? 'bg-slate-950 ring-white/10' : 'bg-white ring-slate-200'
                }`}
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={`h-10 w-full rounded-xl px-3 text-sm outline-none ring-1 ${
                dark ? 'bg-slate-950 ring-white/10' : 'bg-white ring-slate-200'
              }`}
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль (от 6 символов)"
              className={`h-10 w-full rounded-xl px-3 text-sm outline-none ring-1 ${
                dark ? 'bg-slate-950 ring-white/10' : 'bg-white ring-slate-200'
              }`}
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <LogIn className="size-3.5" />}
              {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>
        )}

        {(error || message) && (
          <p className={`mt-3 text-sm ${error ? 'text-rose-500' : 'text-emerald-600'}`}>
            {error ?? message}
          </p>
        )}
      </section>

      <section className={`rounded-3xl border p-5 ${card}`}>
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-indigo-500" />
          <h2 className="text-sm font-semibold">Подписка</h2>
        </div>
        <p className={`mt-2 text-sm ${muted}`}>{meta.blurb}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onOpenPaywall('Оформи Плюс — безлимит Сократа и полный год')}
            className="inline-flex h-10 items-center rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white"
          >
            {plan === 'free' ? 'Оформить Плюс' : 'Продлить Плюс'}
          </button>
          {plan !== 'free' && (
            <button
              type="button"
              onClick={() => {
                const next = activatePlan(account, 'free');
                saveAccount(next);
                onAccountChange(next);
              }}
              className={`inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold ring-1 ${
                dark ? 'ring-white/15' : 'ring-slate-200'
              }`}
            >
              Сбросить на Старт
            </button>
          )}
        </div>
      </section>

      <section className={`rounded-3xl border p-5 ${card}`}>
        <div className="flex items-center gap-2">
          <Cloud className="size-4 text-indigo-500" />
          <h2 className="text-sm font-semibold">Облачный прогресс</h2>
        </div>
        <p className={`mt-2 text-sm ${muted}`}>
          {account.lastSyncAt
            ? `Последняя синхронизация: ${new Date(account.lastSyncAt).toLocaleString('ru-RU')}`
            : 'Ещё не синхронизировали'}
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleSync()}
          className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-900"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Shield className="size-3.5" />}
          Синхронизировать
        </button>
      </section>

      <button
        type="button"
        onClick={onResetOnboarding}
        className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold ${
          dark ? 'text-slate-400' : 'text-slate-500'
        }`}
      >
        <LogOut className="size-3.5" />
        Пройти онбординг заново
      </button>
    </div>
  );
}
