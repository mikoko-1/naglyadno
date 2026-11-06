import type { Question } from '../../curriculum/types.ts';
import { buildAllQuestionBanks } from './buildBanks.ts';
import { grade5Questions } from './grade5.ts';
import { grade5MoreQuestions } from './grade5-more.ts';

const authored = {
  ...grade5Questions,
  ...grade5MoreQuestions,
};

export const QUESTION_BANKS = buildAllQuestionBanks(authored);

export function getTopicQuestions(
  topicId: string,
  mode: 'practice' | 'test',
): Question[] {
  const bank = QUESTION_BANKS[topicId];
  if (!bank) return [];
  return mode === 'practice' ? bank.practice : bank.test;
}

export function getQuestionById(id: string): Question | undefined {
  for (const bank of Object.values(QUESTION_BANKS)) {
    const found = [...bank.practice, ...bank.test].find((q) => q.id === id);
    if (found) return found;
  }
  return undefined;
}
