import { Bot, Crosshair, Rocket, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { todayKey, type AccountState } from '../../lib/account/storage.ts';
import { buildDailyPlan } from '../../lib/plan/dailyPlan.ts';
import type { SkillsState } from '../../lib/skills/microSkills.ts';
import { getSkillMeta } from '../../lib/skills/microSkills.ts';

type DailyPlanViewProps = {
  account: AccountState;
  skills: SkillsState;
  dark?: boolean;
  onStartDrill: (skillId: string) => void;
  onOpenSocrates: (payload: { contextNote: string; seedUserMessage: string }) => void;
  onOpenExam: () => void;
  onOpenRadar: () => void;
};

export function DailyPlanView({
  account,
  skills,
  dark,
  onStartDrill,
  onOpenSocrates,
  onOpenExam,
  onOpenRadar,
}: DailyPlanViewProps) {
  const plan = useMemo(
    () => buildDailyPlan(account.grade, skills, todayKey()),
    [account.grade, skills],
  );

  const card = dark
    ? 'border-white/10 bg-slate-900/80 text-slate-100'
    : 'border-slate-200/80 bg-white text-slate-900';

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-wide text-indigo-500 uppercase">План на сегодня</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{plan.headline}</h1>
        <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          {account.displayName || 'Ученик'} · {account.grade} класс · без RPG — только рост
        </p>
      </div>

      <div className="space-y-3">
        {plan.steps.map((step, i) => (
          <article key={step.id} className={`rounded-3xl border p-4 sm:p-5 ${card}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-xs font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Шаг {i + 1} · {step.minutes} мин
                </p>
                <h2 className="mt-1 text-base font-semibold">{step.title}</h2>
                <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{step.detail}</p>
              </div>
              <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-500">
                {step.kind === 'drill' ? 'пробел' : step.kind === 'socrates' ? 'ментор' : 'срез'}
              </span>
            </div>
            <div className="mt-4">
              {step.kind === 'drill' && step.skillId && (
                <button
                  type="button"
                  onClick={() => onStartDrill(step.skillId!)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white"
                >
                  <Rocket className="size-3.5" />
                  Закрыть за 2 мин
                </button>
              )}
              {step.kind === 'socrates' && step.skillId && (
                <button
                  type="button"
                  onClick={() => {
                    const meta = getSkillMeta(step.skillId!);
                    onOpenSocrates({
                      contextNote: meta.socraticSeed,
                      seedUserMessage: `Помоги разобрать тему: ${meta.title}. ${meta.failureHint}`,
                    });
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white"
                >
                  <Bot className="size-3.5" />
                  Открыть Сократа
                </button>
              )}
              {step.kind === 'exam' && (
                <button
                  type="button"
                  onClick={onOpenExam}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white"
                >
                  <Zap className="size-3.5" />
                  Запустить срез
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenRadar}
        className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold ring-1 ${
          dark ? 'ring-white/15' : 'ring-slate-200'
        }`}
      >
        <Crosshair className="size-4" />
        Смотреть радар слабых мест
      </button>
    </div>
  );
}
