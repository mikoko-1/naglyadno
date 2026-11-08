import {
  BookOpen,
  Check,
  ClipboardList,
  Lock,
  Radar,
  Bot,
  Zap,
} from 'lucide-react';
import { useMemo } from 'react';
import type { GradeId } from '../../curriculum/index.ts';
import {
  buildYearPlan,
  currentSchoolWeek,
  yearStats,
  type WeekActivity,
  type YearWeek,
} from '../../curriculum/year/weeks.ts';
import {
  completedWeeksCount,
  isWeekUnlocked,
  weekCompletionRatio,
  type YearProgressState,
} from '../../lib/year/progress.ts';

type YearTrackViewProps = {
  grade: GradeId;
  yearProgress: YearProgressState;
  dark?: boolean;
  onOpenLesson: (topicId: string, week: number) => void;
  onOpenPractice: (topicId: string, week: number) => void;
  onOpenTest: (topicId: string, week: number) => void;
  onOpenExam: (week: number) => void;
  onOpenSocrates: (week: number, note: string) => void;
  onOpenRadar: (week: number) => void;
  onToggleUnlockAll: () => void;
  onMark: (week: number, activity: WeekActivity) => void;
};

const activityMeta: Record<
  WeekActivity,
  { label: string; icon: typeof BookOpen }
> = {
  lesson: { label: 'Урок', icon: BookOpen },
  practice: { label: 'Практика', icon: ClipboardList },
  test: { label: 'Тест', icon: Zap },
  control: { label: 'Контрольная', icon: ClipboardList },
  socrates: { label: 'Сократ', icon: Bot },
  radar: { label: 'Радар', icon: Radar },
};

export function YearTrackView({
  grade,
  yearProgress,
  dark,
  onOpenLesson,
  onOpenPractice,
  onOpenTest,
  onOpenExam,
  onOpenSocrates,
  onOpenRadar,
  onToggleUnlockAll,
  onMark,
}: YearTrackViewProps) {
  const plan = useMemo(() => buildYearPlan(grade), [grade]);
  const stats = useMemo(() => yearStats(plan), [plan]);
  const recommended = currentSchoolWeek();
  const doneWeeks = completedWeeksCount(yearProgress, grade);
  const unlockAll = yearProgress.byGrade[grade]?.unlockAll ?? false;

  const card = dark
    ? 'border-white/10 bg-slate-900/80 text-slate-100'
    : 'border-slate-200/80 bg-white text-slate-900';

  function runActivity(week: YearWeek, activity: WeekActivity) {
    onMark(week.week, activity);
    if (activity === 'lesson' && week.topicId) {
      onOpenLesson(week.topicId, week.week);
      return;
    }
    if (activity === 'practice' && week.topicId) {
      onOpenPractice(week.topicId, week.week);
      return;
    }
    if (activity === 'test' && week.topicId) {
      onOpenTest(week.topicId, week.week);
      return;
    }
    if (activity === 'practice' && week.reviewTopicIds?.[0]) {
      onOpenPractice(week.reviewTopicIds[0], week.week);
      return;
    }
    if (activity === 'test' && week.reviewTopicIds?.[0]) {
      onOpenTest(week.reviewTopicIds[0], week.week);
      return;
    }
    if (activity === 'control') {
      onOpenExam(week.week);
      return;
    }
    if (activity === 'socrates') {
      onOpenSocrates(
        week.week,
        `Неделя ${week.week}: ${week.title}. ${week.goal}`,
      );
      return;
    }
    if (activity === 'radar') {
      onOpenRadar(week.week);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-wide text-indigo-500 uppercase">
          Учебный год · 9 месяцев
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {grade} класс · 36 недель
        </h1>
        <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          {stats.topicWeeks} тем · {stats.reviewWeeks} повторений · {stats.controlWeeks} контрольных · ~
          {stats.minutes} мин чистой работы. Сейчас рекомендуем неделю {recommended}.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Пройдено недель', `${doneWeeks}/36`],
          ['Рекомендуемая', String(recommended)],
          ['Режим', unlockAll ? 'все открыто' : 'по темпу года'],
        ].map(([k, v]) => (
          <div key={k} className={`rounded-2xl border p-4 ${card}`}>
            <p className={`text-xs font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{k}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onToggleUnlockAll}
        className={`text-sm font-semibold ${dark ? 'text-indigo-300' : 'text-indigo-700'}`}
      >
        {unlockAll ? 'Включить темп года (недели по порядку)' : 'Открыть все недели сразу (догон)'}
      </button>

      <div className="space-y-3">
        {plan.map((week) => {
          const unlocked = isWeekUnlocked(yearProgress, grade, week.week, recommended);
          const ratio = weekCompletionRatio(yearProgress, grade, week.week);
          const current = week.week === recommended;
          const doneMap = yearProgress.byGrade[grade]?.weeks[week.week]?.done ?? {};

          return (
            <article
              key={week.week}
              className={`rounded-3xl border p-4 sm:p-5 ${card} ${
                current ? 'ring-2 ring-indigo-500/60' : ''
              } ${!unlocked ? 'opacity-70' : ''}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className={`text-xs font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Неделя {week.week}
                    {current ? ' · сейчас' : ''} · {week.minutes} мин · {week.kind}
                  </p>
                  <h2 className="mt-1 text-base font-semibold">{week.title}</h2>
                  <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{week.goal}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!unlocked && <Lock className="size-4 text-slate-400" />}
                  <span className="rounded-full bg-indigo-500/15 px-2.5 py-1 text-xs font-semibold text-indigo-500 tabular-nums">
                    {Math.round(ratio * 100)}%
                  </span>
                </div>
              </div>

              <div className={`mt-3 h-1.5 overflow-hidden rounded-full ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
                <div className="h-full bg-indigo-500 transition-all" style={{ width: `${ratio * 100}%` }} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {week.activities.map((activity) => {
                  const meta = activityMeta[activity];
                  const Icon = meta.icon;
                  const finished = Boolean(doneMap[activity]);
                  return (
                    <button
                      key={activity}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => runActivity(week, activity)}
                      className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold ${
                        finished
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : unlocked
                            ? 'bg-indigo-600 text-white'
                            : dark
                              ? 'bg-white/5 text-slate-500'
                              : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {finished ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
