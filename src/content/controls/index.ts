import { CURRICULUM, getSection } from '../../curriculum/index.ts';
import type { ControlSpec, GradeId, Question } from '../../curriculum/types.ts';
import { QUESTION_BANKS } from '../questions/index.ts';

/** Детерминированная «перемешка» — один и тот же вариант контрольной при перезагрузке раздела. */
function shuffle<T>(items: T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const j = h % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildControlSpec(grade: GradeId, sectionId: string): ControlSpec | undefined {
  const section = getSection(grade, sectionId);
  if (!section) return undefined;

  const pool: string[] = [];
  for (const topic of section.topics) {
    const bank = QUESTION_BANKS[topic.id];
    if (!bank) continue;
    pool.push(...bank.test.map((q) => q.id), ...bank.practice.map((q) => q.id));
  }

  const unique = [...new Set(pool)];
  const picked = shuffle(unique, sectionId).slice(0, Math.min(20, Math.max(15, unique.length)));

  return {
    id: `control-${sectionId}`,
    sectionId,
    grade,
    title: `Контрольная: ${section.title}`,
    minutes: section.controlMinutes,
    questionIds: picked.length >= 10 ? picked : unique,
  };
}

export function getControlQuestions(grade: GradeId, sectionId: string): Question[] {
  const spec = buildControlSpec(grade, sectionId);
  if (!spec) return [];

  const byId = new Map<string, Question>();
  for (const bank of Object.values(QUESTION_BANKS)) {
    for (const q of [...bank.practice, ...bank.test]) byId.set(q.id, q);
  }

  return spec.questionIds
    .map((id) => byId.get(id))
    .filter((q): q is Question => Boolean(q));
}

export function allControlMeta(): ControlSpec[] {
  return CURRICULUM.flatMap((grade) =>
    grade.sections
      .map((section) => buildControlSpec(grade.id, section.id))
      .filter((spec): spec is ControlSpec => Boolean(spec)),
  );
}
