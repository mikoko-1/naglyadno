import {
  effectivePlan,
  type AccountState,
  type PlanId,
} from './storage.ts';

export type LimitKind = 'socrates' | 'exam' | 'surgical' | 'parentReport' | 'cloud';

const FREE_SOCRATES_PER_DAY = 5;
const FREE_EXAMS_PER_DAY = 1;

export function canUse(
  account: AccountState,
  kind: LimitKind,
): { ok: boolean; reason?: string; planNeeded?: PlanId } {
  const plan = effectivePlan(account);

  if (kind === 'surgical') {
    if (plan === 'free') {
      return {
        ok: false,
        reason: 'Хирургический тест по слабым местам — в тарифе Плюс.',
        planNeeded: 'plus',
      };
    }
    return { ok: true };
  }

  if (kind === 'parentReport') {
    if (plan === 'free') {
      return {
        ok: false,
        reason: 'Полный отчёт родителю и план на неделю — в тарифе Плюс.',
        planNeeded: 'plus',
      };
    }
    return { ok: true };
  }

  if (kind === 'cloud') {
    // Облако через Supabase доступно после входа на любом тарифе.
    return { ok: true };
  }

  if (kind === 'socrates') {
    if (plan !== 'free') return { ok: true };
    if (account.usage.socratesMessages >= FREE_SOCRATES_PER_DAY) {
      return {
        ok: false,
        reason: `На Стартe — ${FREE_SOCRATES_PER_DAY} сообщений Сократу в день. Завтра снова или открой Плюс.`,
        planNeeded: 'plus',
      };
    }
    return { ok: true };
  }

  if (kind === 'exam') {
    if (plan !== 'free') return { ok: true };
    if (account.usage.examStarts >= FREE_EXAMS_PER_DAY) {
      return {
        ok: false,
        reason: `На Старте — ${FREE_EXAMS_PER_DAY} контрольная в день. Плюс снимает лимит.`,
        planNeeded: 'plus',
      };
    }
    return { ok: true };
  }

  return { ok: true };
}

export function socratesLeft(account: AccountState): number | null {
  if (effectivePlan(account) !== 'free') return null;
  return Math.max(0, FREE_SOCRATES_PER_DAY - account.usage.socratesMessages);
}
