import { grade5 } from './grades/5.ts';
import { grade6 } from './grades/6.ts';
import { grade7 } from './grades/7.ts';
import { grade8 } from './grades/8.ts';
import { grade9 } from './grades/9.ts';
import type { GradeCurriculum, GradeId, Section, Topic } from './types.ts';

export const CURRICULUM: readonly GradeCurriculum[] = [grade5, grade6, grade7, grade8, grade9];

export const GRADE_IDS: readonly GradeId[] = [5, 6, 7, 8, 9];

export function getGrade(id: GradeId): GradeCurriculum {
  const grade = CURRICULUM.find((item) => item.id === id);
  if (!grade) throw new Error(`Класс ${id} не найден`);
  return grade;
}

export function getSection(gradeId: GradeId, sectionId: string): Section | undefined {
  return getGrade(gradeId).sections.find((section) => section.id === sectionId);
}

export function getTopic(gradeId: GradeId, topicId: string): { section: Section; topic: Topic } | undefined {
  for (const section of getGrade(gradeId).sections) {
    const topic = section.topics.find((item) => item.id === topicId);
    if (topic) return { section, topic };
  }
  return undefined;
}

export function allTopics(gradeId: GradeId): Topic[] {
  return getGrade(gradeId).sections.flatMap((section) => section.topics);
}

export function findTopicGrade(topicId: string): GradeId | undefined {
  for (const grade of CURRICULUM) {
    if (allTopics(grade.id).some((topic) => topic.id === topicId)) return grade.id;
  }
  return undefined;
}

export * from './types.ts';
