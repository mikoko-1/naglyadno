import type { Lesson } from '../../curriculum/types.ts';
import { buildAllLessons } from './buildLessons.ts';
import { grade5Lessons } from './grade5.ts';
import { grade5MoreLessons } from './grade5-more.ts';
import { grade6Lessons } from './grade6.ts';
import { grade6MoreLessons } from './grade6-more.ts';
import { grade7Lessons } from './grade7.ts';
import { grade8Lessons } from './grade8.ts';
import { grade9Lessons } from './grade9.ts';

export const LESSONS: Record<string, Lesson> = buildAllLessons({
  ...grade5Lessons,
  ...grade5MoreLessons,
  ...grade6Lessons,
  ...grade6MoreLessons,
  ...grade7Lessons,
  ...grade8Lessons,
  ...grade9Lessons,
});

export function getLesson(topicId: string): Lesson | undefined {
  return LESSONS[topicId];
}
