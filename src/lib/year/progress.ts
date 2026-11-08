import type { GradeId } from '../../curriculum/types.ts';
import { buildYearPlan, type WeekActivity } from '../../curriculum/year/weeks.ts';

export type WeekProgress = {
  done: Partial<Record<WeekActivity, boolean>>;
  completedAt?: string;
};

export type YearProgressState = {
  version: 1;
  byGrade: Partial<
    Record<
      GradeId,
      {
        weeks: Record<number, WeekProgress>;
        /** Разрешить обгон рекомендованной недели */
        unlockAll: boolean;
      }
    >
  >;
};

const KEY = 'naglyadno-year-v1';

function empty(): YearProgressState {
  return { version: 1, byGrade: {} };
}

export function loadYearProgress(): YearProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as YearProgressState;
    if (parsed.version !== 1) return empty();
    return { version: 1, byGrade: parsed.byGrade ?? {} };
  } catch {
    return empty();
  }
}

export function saveYearProgress(state: YearProgressState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function getGradeYear(state: YearProgressState, grade: GradeId) {
  return state.byGrade[grade] ?? { weeks: {}, unlockAll: false };
}

export function markActivity(
  state: YearProgressState,
  grade: GradeId,
  week: number,
  activity: WeekActivity,
): YearProgressState {
  const gradeState = getGradeYear(state, grade);
  const prev = gradeState.weeks[week] ?? { done: {} };
  const done = { ...prev.done, [activity]: true };
  const plan = buildYearPlan(grade);
  const weekPlan = plan.find((w) => w.week === week);
  const allDone = weekPlan
    ? weekPlan.activities.every((a) => done[a])
    : Object.values(done).every(Boolean);

  const nextWeek: WeekProgress = {
    done,
    completedAt: allDone ? prev.completedAt ?? new Date().toISOString() : prev.completedAt,
  };

  return {
    ...state,
    byGrade: {
      ...state.byGrade,
      [grade]: {
        ...gradeState,
        weeks: { ...gradeState.weeks, [week]: nextWeek },
      },
    },
  };
}

export function weekCompletionRatio(
  state: YearProgressState,
  grade: GradeId,
  week: number,
): number {
  const plan = buildYearPlan(grade).find((w) => w.week === week);
  if (!plan || plan.activities.length === 0) return 0;
  const done = getGradeYear(state, grade).weeks[week]?.done ?? {};
  const n = plan.activities.filter((a) => done[a]).length;
  return n / plan.activities.length;
}

export function completedWeeksCount(state: YearProgressState, grade: GradeId): number {
  const plan = buildYearPlan(grade);
  return plan.filter((w) => weekCompletionRatio(state, grade, w.week) >= 1).length;
}

export function isWeekUnlocked(
  state: YearProgressState,
  grade: GradeId,
  week: number,
  recommendedWeek: number,
): boolean {
  const gradeState = getGradeYear(state, grade);
  if (gradeState.unlockAll) return true;
  // Можно текущую и прошлые; следующую — если предыдущая ≥50%
  if (week <= recommendedWeek) return true;
  if (week === recommendedWeek + 1) {
    return weekCompletionRatio(state, grade, recommendedWeek) >= 0.5;
  }
  // Дальше — только если цепочка почти закрыта
  for (let w = 1; w < week; w += 1) {
    if (weekCompletionRatio(state, grade, w) < 0.5) return false;
  }
  return true;
}
