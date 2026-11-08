import { Copy, Lock, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { canUse } from '../../lib/account/limits.ts';
import { type AccountState } from '../../lib/account/storage.ts';
import { buildWeeklyReport } from '../../lib/report/weeklyReport.ts';
import type { SkillsState } from '../../lib/skills/microSkills.ts';

type ParentReportViewProps = {
  account: AccountState;
  skills: SkillsState;
  dark?: boolean;
  onUnlock: (reason: string) => void;
};

export function ParentReportView({ account, skills, dark, onUnlock }: ParentReportViewProps) {
  const gate = canUse(account, 'parentReport');
  const report = useMemo(() => buildWeeklyReport(account, skills), [account, skills]);
  const [copied, setCopied] = useState(false);

  const card = dark
    ? 'border-white/10 bg-slate-900/80 text-slate-100'
    : 'border-slate-200/80 bg-white text-slate-900';

  async function copy() {
    try {
      await navigator.clipboard.writeText(report.textBlob);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  if (!gate.ok) {
    return (
      <section className={`rounded-3xl border p-6 ${card}`}>
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 size-5 text-indigo-500" />
          <div>
            <h1 className="text-xl font-semibold">Кабинет родителя</h1>
            <p className={`mt-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              Недельный отчёт: время, точность, рост и зоны для разбора. {gate.reason}
            </p>
            <button
              type="button"
              onClick={() => onUnlock(gate.reason ?? 'Нужен тариф Плюс')}
              className="mt-4 inline-flex h-11 items-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"
            >
              Открыть отчёт · Плюс
            </button>
            <p className={`mt-3 text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
              Превью: за 7 дней пока {account.activity.length ? 'есть активность' : 'мало данных'} — полный текст после оплаты.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{report.title}</h1>
        <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{report.rangeLabel}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Минуты', String(report.minutes)],
          ['Занятия', String(report.sessions)],
          ['Точность', report.accuracy === null ? '—' : `${Math.round(report.accuracy * 100)}%`],
        ].map(([k, v]) => (
          <div key={k} className={`rounded-2xl border p-4 ${card}`}>
            <p className={`text-xs font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{k}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <section className={`rounded-3xl border p-5 ${card}`}>
        <h2 className="text-sm font-semibold">Рост</h2>
        <ul className={`mt-2 space-y-1 text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
          {(report.improved.length ? report.improved : ['Пока рано — нужно больше попыток']).map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      </section>

      <section className={`rounded-3xl border p-5 ${card}`}>
        <h2 className="text-sm font-semibold">Зоны роста</h2>
        <ul className={`mt-2 space-y-2 text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
          {(report.weak.length ? report.weak : ['Нет выраженных слабых мест']).map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
        <p className={`mt-3 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{report.advice}</p>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"
        >
          <Copy className="size-4" />
          {copied ? 'Скопировано' : 'Скопировать отчёт'}
        </button>
        <button
          type="button"
          onClick={() => void copy()}
          className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold ring-1 ${
            dark ? 'ring-white/15' : 'ring-slate-200'
          }`}
        >
          <Share2 className="size-4" />
          В мессенджер
        </button>
      </div>
    </div>
  );
}
