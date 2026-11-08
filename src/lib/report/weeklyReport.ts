import type { GradeId } from '../../curriculum/types.ts';
import type { AccountState } from '../account/storage.ts';
import {
  getSkillMeta,
  skillConfidence,
  SKILL_CATALOG,
  topWeakSkills,
  type SkillsState,
} from '../skills/microSkills.ts';

export type WeeklyReport = {
  title: string;
  grade: GradeId;
  rangeLabel: string;
  minutes: number;
  accuracy: number | null;
  sessions: number;
  improved: string[];
  weak: string[];
  advice: string;
  textBlob: string;
};

function lastDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function buildWeeklyReport(
  account: AccountState,
  skills: SkillsState,
): WeeklyReport {
  const days = lastDays(7);
  const rows = account.activity.filter((a) => days.includes(a.day));
  const minutes = rows.reduce((s, r) => s + r.minutes, 0);
  const correct = rows.reduce((s, r) => s + r.correct, 0);
  const attempts = rows.reduce((s, r) => s + r.attempts, 0);
  const accuracy = attempts > 0 ? correct / attempts : null;
  const sessions = rows.filter((r) => r.attempts > 0 || r.minutes > 0).length;

  const weak = topWeakSkills(skills, 3).map((w) => {
    const pct = Math.round(w.confidence * 100);
    return `${w.meta.title} (${pct}%) — ${w.meta.failureHint}`;
  });

  const improved: string[] = [];
  for (const meta of SKILL_CATALOG) {
    const now = skillConfidence(skills.skills[meta.id]);
    const base = account.baseline?.[meta.id];
    if (now === null || base === undefined) continue;
    if (now - base >= 0.15) {
      improved.push(`${meta.title}: ${Math.round(base * 100)}% → ${Math.round(now * 100)}%`);
    }
  }

  const advice =
    weak.length > 0
      ? `На этой неделе фокус: ${getSkillMeta(topWeakSkills(skills, 1)[0]?.meta.id ?? 'linear_isolate_x').title}. 12–15 минут в день по плану достаточно.`
      : 'Пока пробелов мало — держите ритм: 3 коротких занятия в неделю.';

  const rangeLabel = `${days[0]} — ${days[days.length - 1]}`;
  const title = `Отчёт за неделю · ${account.displayName || 'ученик'} · ${account.grade} класс`;

  const textBlob = [
    title,
    rangeLabel,
    '',
    `Время: ${minutes} мин`,
    `Занятий с активностью: ${sessions}`,
    `Точность: ${accuracy === null ? 'нет данных' : `${Math.round(accuracy * 100)}%`}`,
    '',
    'Рост:',
    ...(improved.length ? improved.map((x) => `• ${x}`) : ['• Пока рано — нужно больше попыток']),
    '',
    'Зоны роста:',
    ...(weak.length ? weak.map((x) => `• ${x}`) : ['• Нет выраженных слабых мест']),
    '',
    `Рекомендация: ${advice}`,
    '',
    '— Наглядно',
  ].join('\n');

  return {
    title,
    grade: account.grade,
    rangeLabel,
    minutes,
    accuracy,
    sessions,
    improved,
    weak,
    advice,
    textBlob,
  };
}
