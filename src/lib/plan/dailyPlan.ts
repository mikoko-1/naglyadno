import type { GradeId } from '../../curriculum/types.ts';
import {
  getSkillMeta,
  SKILL_CATALOG,
  topWeakSkills,
  type MicroSkillId,
  type SkillsState,
} from '../skills/microSkills.ts';

export type PlanStep = {
  id: string;
  kind: 'drill' | 'socrates' | 'exam' | 'lesson';
  title: string;
  detail: string;
  minutes: number;
  skillId?: MicroSkillId;
};

export type DailyPlan = {
  day: string;
  grade: GradeId;
  headline: string;
  totalMinutes: number;
  steps: PlanStep[];
  focusSkills: MicroSkillId[];
};

export function buildDailyPlan(grade: GradeId, skills: SkillsState, day: string): DailyPlan {
  const weak = topWeakSkills(skills, 3);
  const focus: MicroSkillId[] =
    weak.length > 0
      ? weak.map((w) => w.meta.id)
      : SKILL_CATALOG.filter((s) => s.grades.includes(grade))
          .slice(0, 2)
          .map((s) => s.id);

  const primary = focus[0];
  const secondary = focus[1] ?? focus[0];
  const meta = getSkillMeta(primary);

  const steps: PlanStep[] = [
    {
      id: 'drill',
      kind: 'drill',
      title: `Закрыть пробел: ${meta.title}`,
      detail: meta.failureHint,
      minutes: 6,
      skillId: primary,
    },
    {
      id: 'socrates',
      kind: 'socrates',
      title: 'Разбор с Сократом',
      detail: `Обсудить «${meta.title}» простыми словами — 1 задача до ответа.`,
      minutes: 4,
      skillId: primary,
    },
    {
      id: 'exam',
      kind: 'exam',
      title: 'Короткий срез',
      detail:
        weak.length > 0
          ? '5 задач по слабым местам (хирургия на Плюс / экспресс на Старте).'
          : `5 задач по ${grade} классу.`,
      minutes: 5,
      skillId: secondary,
    },
  ];

  const totalMinutes = steps.reduce((sum, s) => sum + s.minutes, 0);
  const headline =
    weak.length > 0
      ? `Сегодня чиним «${meta.title}» · ~${totalMinutes} мин`
      : `Сегодня укрепляем базу ${grade} класса · ~${totalMinutes} мин`;

  return { day, grade, headline, totalMinutes, steps, focusSkills: focus };
}
