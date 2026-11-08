import type { GradeId } from '../../curriculum/types.ts';
import type { MicroSkillId } from '../skills/microSkills.ts';

export type PlanId = 'free' | 'plus';

/** Старые значения (tutor) поднимаем до plus. */
export function normalizePlanId(v: unknown): PlanId {
  if (v === 'plus' || v === 'tutor') return 'plus';
  return 'free';
}

export type AccountRole = 'student' | 'parent';

export type DayUsage = {
  day: string;
  socratesMessages: number;
  examStarts: number;
  questionsAnswered: number;
};

export type ActivityDay = {
  day: string;
  minutes: number;
  correct: number;
  attempts: number;
  skills: MicroSkillId[];
};

export type AccountState = {
  version: 1;
  onboardingDone: boolean;
  grade: GradeId;
  displayName: string;
  email: string;
  role: AccountRole;
  plan: PlanId;
  /** ISO date — конец оплаченного периода */
  planExpiresAt?: string;
  /** Снимок уверенности после онбординга, % */
  baseline?: Partial<Record<MicroSkillId, number>>;
  usage: DayUsage;
  activity: ActivityDay[];
  lastSyncAt?: string;
};

const KEY = 'naglyadno-account-v1';

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function emptyUsage(day = todayKey()): DayUsage {
  return { day, socratesMessages: 0, examStarts: 0, questionsAnswered: 0 };
}

export function defaultAccount(): AccountState {
  return {
    version: 1,
    onboardingDone: false,
    grade: 6,
    displayName: '',
    email: '',
    role: 'student',
    plan: 'free',
    usage: emptyUsage(),
    activity: [],
  };
}

export function loadAccount(): AccountState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultAccount();
    const parsed = JSON.parse(raw) as AccountState;
    if (parsed.version !== 1) return defaultAccount();
    return refreshUsageDay({
      ...defaultAccount(),
      ...parsed,
      plan: normalizePlanId(parsed.plan),
      usage: parsed.usage ?? emptyUsage(),
      activity: parsed.activity ?? [],
    });
  } catch {
    return defaultAccount();
  }
}

export function saveAccount(state: AccountState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/** Сброс дневных лимитов при смене даты. */
export function refreshUsageDay(state: AccountState): AccountState {
  const day = todayKey();
  if (state.usage.day === day) return state;
  return { ...state, usage: emptyUsage(day) };
}

export function isPlanActive(state: AccountState): boolean {
  if (state.plan === 'free') return false;
  if (!state.planExpiresAt) return true;
  return new Date(state.planExpiresAt).getTime() > Date.now();
}

export function effectivePlan(state: AccountState): PlanId {
  if (!isPlanActive(state)) return 'free';
  return state.plan;
}

export const PLAN_META: Record<
  PlanId,
  { title: string; price: string; blurb: string; perks: string[] }
> = {
  free: {
    title: 'Старт',
    price: '0 ₽',
    blurb: 'Понять продукт',
    perks: ['Уроки 5–9', '5 сообщений Сократу / день', '1 экспресс-срез / день', 'Базовый радар'],
  },
  plus: {
    title: 'Плюс',
    price: '690 ₽/мес',
    blurb: '9 месяцев: 36 недель темпа + отчёты',
    perks: [
      'Трек на весь учебный год (36 недель)',
      'Безлимит Сократа и срезов',
      'План на день + отчёт родителю',
      'Повторения и четвертные контроли',
      'Облачное сохранение (Supabase) + отчёты',
    ],
  },
};

export function activatePlan(state: AccountState, plan: PlanId, days = 30): AccountState {
  if (plan === 'free') {
    return { ...state, plan: 'free', planExpiresAt: undefined };
  }
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return {
    ...state,
    plan,
    planExpiresAt: expires.toISOString(),
    lastSyncAt: new Date().toISOString(),
  };
}

export function bumpSocrates(state: AccountState): AccountState {
  const s = refreshUsageDay(state);
  return {
    ...s,
    usage: { ...s.usage, socratesMessages: s.usage.socratesMessages + 1 },
  };
}

export function bumpExamStart(state: AccountState): AccountState {
  const s = refreshUsageDay(state);
  return {
    ...s,
    usage: { ...s.usage, examStarts: s.usage.examStarts + 1 },
  };
}

export function logActivity(
  state: AccountState,
  patch: { minutes?: number; correct?: number; attempts?: number; skill?: MicroSkillId },
): AccountState {
  const day = todayKey();
  const activity = [...state.activity];
  const idx = activity.findIndex((a) => a.day === day);
  const base: ActivityDay =
    idx >= 0
      ? activity[idx]
      : { day, minutes: 0, correct: 0, attempts: 0, skills: [] };
  const next: ActivityDay = {
    ...base,
    minutes: base.minutes + (patch.minutes ?? 0),
    correct: base.correct + (patch.correct ?? 0),
    attempts: base.attempts + (patch.attempts ?? 0),
    skills:
      patch.skill && !base.skills.includes(patch.skill)
        ? [...base.skills, patch.skill]
        : base.skills,
  };
  if (idx >= 0) activity[idx] = next;
  else activity.push(next);
  // keep last 60 days
  activity.sort((a, b) => a.day.localeCompare(b.day));
  return { ...state, activity: activity.slice(-60) };
}
