/** Атомарные микро-навыки для диагностики и генерации задач. */

export type MicroSkillId =
  | 'fractions_common_denom'
  | 'fractions_multiply'
  | 'fractions_divide'
  | 'percent_of'
  | 'negative_signs_brackets'
  | 'linear_isolate_x'
  | 'linear_both_sides'
  | 'proportion_cross'
  | 'integer_ops'
  | 'decimals_ops'
  | 'powers_basic'
  | 'roots_domain';

export type SkillMeta = {
  id: MicroSkillId;
  title: string;
  /** Вероятная причина ошибки — для радара. */
  failureHint: string;
  /** Краткий промпт для Сократа. */
  socraticSeed: string;
  grades: Array<5 | 6 | 7 | 8 | 9>;
};

export type SkillStat = {
  correct: number;
  attempts: number;
  lastAt?: string;
};

export type SkillsState = {
  version: 1;
  skills: Partial<Record<MicroSkillId, SkillStat>>;
};

export type ConfidenceBand = 'green' | 'yellow' | 'red' | 'unknown';

const STORAGE_KEY = 'naglyadno-skills-v1';

export const SKILL_CATALOG: SkillMeta[] = [
  {
    id: 'fractions_common_denom',
    title: 'Общий знаменатель',
    failureHint: 'Путаница при приведении к общему знаменателю или сложении числителей.',
    socraticSeed: 'Ученик спотыкается на сложении дробей с разными знаменателями. Веди через один наводящий вопрос: что нужно сделать, прежде чем складывать числители?',
    grades: [5, 6],
  },
  {
    id: 'fractions_multiply',
    title: 'Умножение дробей',
    failureHint: 'Часто умножают «крест-накрест» или забывают сократить.',
    socraticSeed: 'Тема: умножение дробей. Не давай ответ. Спроси, что происходит с числителями и знаменателями отдельно.',
    grades: [5, 6],
  },
  {
    id: 'fractions_divide',
    title: 'Деление дробей',
    failureHint: 'Забывают перевернуть вторую дробь (умножить на обратную).',
    socraticSeed: 'Тема: деление дробей. Спроси, на что заменяют деление и что происходит со второй дробью.',
    grades: [5, 6],
  },
  {
    id: 'percent_of',
    title: 'Процент от числа',
    failureHint: 'Путают «n% от A» с «A% от n» или делят не на 100.',
    socraticSeed: 'Тема: найти процент от числа. Спроси, какую долю представляет один процент.',
    grades: [5, 6, 7],
  },
  {
    id: 'negative_signs_brackets',
    title: 'Знаки и скобки',
    failureHint: 'Ошибка при раскрытии скобок перед минусом: знаки внутри не меняются.',
    socraticSeed: 'Тема: минус перед скобкой. Спроси, что происходит с каждым знаком внутри, если убрать скобки.',
    grades: [6, 7],
  },
  {
    id: 'linear_isolate_x',
    title: 'Изоляция x',
    failureHint: 'Неверное обратное действие при переносе слагаемого или коэффициента.',
    socraticSeed: 'Тема: решить линейное уравнение. Спроси, какое обратное действие убирает число рядом с x.',
    grades: [6, 7, 8],
  },
  {
    id: 'linear_both_sides',
    title: 'x в обеих частях',
    failureHint: 'Собирают переменные не в одну сторону или ошибаются в знаках.',
    socraticSeed: 'Уравнение с x слева и справа. Спроси, куда удобнее собрать все слагаемые с x.',
    grades: [7, 8],
  },
  {
    id: 'proportion_cross',
    title: 'Пропорции',
    failureHint: 'Путают крайние и средние члены или делят не те пары.',
    socraticSeed: 'Тема: пропорция a/b = c/d. Спроси, какие произведения равны в верной пропорции.',
    grades: [6, 7],
  },
  {
    id: 'integer_ops',
    title: 'Целые числа',
    failureHint: 'Ошибки со знаками при сложении/вычитании отрицательных.',
    socraticSeed: 'Тема: действия с отрицательными. Спроси, как представить вычитание через сложение противоположного.',
    grades: [6, 7],
  },
  {
    id: 'decimals_ops',
    title: 'Десятичные',
    failureHint: 'Смещение запятой при умножении/делении на 10, 100.',
    socraticSeed: 'Тема: десятичные. Спроси, куда уезжает запятая при умножении на 10.',
    grades: [5, 6],
  },
  {
    id: 'powers_basic',
    title: 'Степени',
    failureHint: 'Путают a²·a³ с a⁶ или складывают основания.',
    socraticSeed: 'Тема: умножение степеней с одним основанием. Спроси, что происходит с показателями.',
    grades: [7, 8],
  },
  {
    id: 'roots_domain',
    title: 'Область корня',
    failureHint: 'Не замечают, что под корнём не может быть отрицательное в ℝ.',
    socraticSeed: 'Тема: квадратный корень. Спроси, для каких чисел корень определён на числовой прямой.',
    grades: [8, 9],
  },
];

export function getSkillMeta(id: MicroSkillId): SkillMeta {
  return SKILL_CATALOG.find((item) => item.id === id)!;
}

function emptyState(): SkillsState {
  return { version: 1, skills: {} };
}

export function loadSkills(): SkillsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as SkillsState;
    if (parsed.version !== 1) return emptyState();
    return { version: 1, skills: parsed.skills ?? {} };
  } catch {
    return emptyState();
  }
}

export function saveSkills(state: SkillsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function recordSkillAttempt(
  state: SkillsState,
  skillId: MicroSkillId,
  correct: boolean,
): SkillsState {
  const prev = state.skills[skillId] ?? { correct: 0, attempts: 0 };
  return {
    ...state,
    skills: {
      ...state.skills,
      [skillId]: {
        correct: prev.correct + (correct ? 1 : 0),
        attempts: prev.attempts + 1,
        lastAt: new Date().toISOString(),
      },
    },
  };
}

export function skillConfidence(stat?: SkillStat): number | null {
  if (!stat || stat.attempts === 0) return null;
  return stat.correct / stat.attempts;
}

export function confidenceBand(stat?: SkillStat): ConfidenceBand {
  const value = skillConfidence(stat);
  if (value === null) return 'unknown';
  if (stat && stat.attempts < 2) return 'unknown';
  if (value >= 0.8) return 'green';
  if (value >= 0.5) return 'yellow';
  return 'red';
}

export function topWeakSkills(state: SkillsState, limit = 3): Array<{
  meta: SkillMeta;
  stat: SkillStat;
  confidence: number;
}> {
  const ranked = SKILL_CATALOG.map((meta) => {
    const stat = state.skills[meta.id] ?? { correct: 0, attempts: 0 };
    const confidence = skillConfidence(stat);
    return { meta, stat, confidence: confidence ?? 0.5, attempts: stat.attempts };
  })
    .filter((item) => item.attempts > 0)
    .sort((a, b) => a.confidence - b.confidence || b.attempts - a.attempts);

  return ranked.slice(0, limit).map(({ meta, stat, confidence }) => ({ meta, stat, confidence }));
}

export function weakSkillIds(state: SkillsState, max = 4): MicroSkillId[] {
  const weak = topWeakSkills(state, max)
    .filter((item) => item.confidence < 0.8)
    .map((item) => item.meta.id);
  if (weak.length > 0) return weak;
  return ['linear_isolate_x', 'fractions_common_denom', 'negative_signs_brackets'];
}

export function gradeHeat(
  state: SkillsState,
  grade: 5 | 6 | 7 | 8 | 9,
): { avg: number | null; band: ConfidenceBand; sample: number } {
  const relevant = SKILL_CATALOG.filter((item) => item.grades.includes(grade));
  let correct = 0;
  let attempts = 0;
  for (const skill of relevant) {
    const stat = state.skills[skill.id];
    if (!stat) continue;
    correct += stat.correct;
    attempts += stat.attempts;
  }
  if (attempts === 0) return { avg: null, band: 'unknown', sample: 0 };
  const avg = correct / attempts;
  const band: ConfidenceBand = avg >= 0.8 ? 'green' : avg >= 0.5 ? 'yellow' : 'red';
  return { avg, band, sample: attempts };
}
