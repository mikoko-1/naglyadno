import type { Lesson } from '../../curriculum/types.ts';
import { buildAllLessons } from './buildLessons.ts';
import { grade5Lessons } from './grade5.ts';
import { grade6Lessons } from './grade6.ts';

export const LESSONS: Record<string, Lesson> = buildAllLessons({
  ...grade5Lessons,
  ...grade6Lessons,
});

export function getLesson(topicId: string): Lesson | undefined {
  return LESSONS[topicId];
}
