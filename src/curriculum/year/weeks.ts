import { allTopics, type GradeId } from '../index.ts';

export type WeekKind = 'topic' | 'review' | 'control' | 'exam';

export type WeekActivity = 'lesson' | 'practice' | 'test' | 'control' | 'socrates' | 'radar';

export type YearWeek = {
  week: number;
  kind: WeekKind;
  title: string;
  goal: string;
  minutes: number;
  topicId?: string;
  reviewTopicIds?: string[];
  activities: WeekActivity[];
};

const YEAR_WEEKS = 36;

/**
 * Учебный год ≈ 9 месяцев / 36 недель.
 * Все темы класса входят обязательно; остальное — повторы и контроли.
 */
export function buildYearPlan(grade: GradeId): YearWeek[] {
  const topics = allTopics(grade);
  const raw: Omit<YearWeek, 'week'>[] = [];

  topics.forEach((topic, index) => {
    raw.push({
      kind: 'topic',
      title: topic.title,
      goal: topic.goal,
      minutes: 35,
      topicId: topic.id,
      activities: ['lesson', 'practice', 'test'],
    });

    if ((index + 1) % 3 === 0) {
      const block = topics.slice(index - 2, index + 1).map((t) => t.id);
      raw.push({
        kind: 'control',
        title: `Контрольная · блок «${topics[index - 2]?.title ?? 'темы'}»`,
        goal: 'Проверить 3 последние темы и не дать забыться.',
        minutes: 30,
        reviewTopicIds: block,
        activities: ['control', 'socrates', 'radar'],
      });
    }

    if ((index + 1) % 6 === 0) {
      const recent = topics.slice(Math.max(0, index - 5), index + 1).map((t) => t.id);
      raw.push({
        kind: 'review',
        title: 'Повторение слабых мест',
        goal: 'Вернуться к ошибкам радара и закрепить блок.',
        minutes: 25,
        reviewTopicIds: recent,
        activities: ['practice', 'socrates', 'radar'],
      });
    }
  });

  // Ужимаем до 36, не трогая недели с темами
  while (raw.length > YEAR_WEEKS) {
    const reviewIdx = [...raw].map((w, i) => ({ w, i })).reverse().find((x) => x.w.kind === 'review');
    if (reviewIdx) {
      raw.splice(reviewIdx.i, 1);
      continue;
    }
    const controlIdx = [...raw].map((w, i) => ({ w, i })).reverse().find((x) => x.w.kind === 'control');
    if (controlIdx) {
      raw.splice(controlIdx.i, 1);
      continue;
    }
    break;
  }

  while (raw.length < YEAR_WEEKS) {
    const left = YEAR_WEEKS - raw.length;
    const mix = topics.slice(-6).map((t) => t.id);
    if (left <= 2) {
      raw.push({
        kind: 'exam',
        title: left === 2 ? 'Предфинальный срез года' : 'Итоговый срез года',
        goal: 'Финальная проверка за 9 месяцев — причина держать подписку до мая.',
        minutes: 45,
        reviewTopicIds: mix,
        activities: ['control', 'test', 'socrates'],
      });
    } else {
      raw.push({
        kind: 'review',
        title: 'Годовое повторение',
        goal: 'Смешанные задачи по ключевым темам года.',
        minutes: 30,
        reviewTopicIds: mix,
        activities: ['practice', 'test', 'radar'],
      });
    }
  }

  return raw.slice(0, YEAR_WEEKS).map((item, index) => ({
    ...item,
    week: index + 1,
  }));
}

export function currentSchoolWeek(now = new Date()): number {
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const start = new Date(year, 8, 1);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
  if (diffDays < 0) return 1;
  return Math.min(36, Math.max(1, Math.floor(diffDays / 7) + 1));
}

export function yearStats(weeks: YearWeek[]) {
  const topicWeeks = weeks.filter((w) => w.kind === 'topic').length;
  const reviewWeeks = weeks.filter((w) => w.kind === 'review').length;
  const controlWeeks = weeks.filter((w) => w.kind === 'control' || w.kind === 'exam').length;
  const minutes = weeks.reduce((s, w) => s + w.minutes, 0);
  return { topicWeeks, reviewWeeks, controlWeeks, minutes, weeks: weeks.length };
}
