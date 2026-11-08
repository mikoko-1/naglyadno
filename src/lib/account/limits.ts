import {
  hasFullAccess,
  isTrialActive,
  trialDaysLeft,
  type AccountState,
  type PlanId,
} from './storage.ts';

export type LimitKind = 'socrates' | 'exam' | 'surgical' | 'parentReport' | 'cloud' | 'app';

const LOCKED =
  'Пробный период закончился. Оформи Плюс, чтобы продолжить учиться.';

export function canUse(
  account: AccountState,
  kind: LimitKind,
): { ok: boolean; reason?: string; planNeeded?: PlanId } {
  if (kind === 'cloud') {
    // Вход и синк доступны всегда — чтобы после оплаты подтянуть профиль.
    return { ok: true };
  }

  if (hasFullAccess(account)) return { ok: true };

  if (kind === 'app') {
    return { ok: false, reason: LOCKED, planNeeded: 'plus' };
  }

  if (kind === 'socrates') {
    return {
      ok: false,
      reason: LOCKED,
      planNeeded: 'plus',
    };
  }

  if (kind === 'exam' || kind === 'surgical') {
    return { ok: false, reason: LOCKED, planNeeded: 'plus' };
  }

  if (kind === 'parentReport') {
    return {
      ok: false,
      reason: 'Отчёт родителю доступен в пробный период и на Плюс.',
      planNeeded: 'plus',
    };
  }

  return { ok: false, reason: LOCKED, planNeeded: 'plus' };
}

/** Сколько сообщений Сократа осталось (null = без лимита). */
export function socratesLeft(account: AccountState): number | null {
  if (!hasFullAccess(account)) return 0;
  if (isTrialActive(account)) {
    const d = trialDaysLeft(account);
    // во время триала без дневного лимита; показываем дни триала в UI отдельно
    void d;
    return null;
  }
  return null;
}

export function accessBadge(account: AccountState): string {
  if (hasFullAccess(account) && !isTrialActive(account) && account.plan === 'plus') {
    return 'Плюс';
  }
  if (isTrialActive(account)) {
    const d = trialDaysLeft(account);
    return d === 1 ? 'Пробный · 1 день' : `Пробный · ${d} дн.`;
  }
  return 'Нужен Плюс';
}
