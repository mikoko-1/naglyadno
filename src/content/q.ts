import type { Question, QuestionDifficulty, QuestionType } from '../curriculum/types.ts';

type Base = {
  id: string;
  prompt: string;
  explanation: string;
  difficulty?: QuestionDifficulty;
  hint?: string;
};

export function single(
  base: Base & { options: string[]; answer: string },
): Question {
  return {
    type: 'single',
    difficulty: base.difficulty ?? 'средне',
    ...base,
  };
}

export function multi(
  base: Base & { options: string[]; answer: string[] },
): Question {
  return {
    type: 'multi',
    difficulty: base.difficulty ?? 'средне',
    ...base,
  };
}

export function input(base: Base & { answer: string }): Question {
  return {
    type: 'input',
    difficulty: base.difficulty ?? 'средне',
    ...base,
  };
}

export function order(
  base: Base & { options: string[]; answer: string[] },
): Question {
  return {
    type: 'order',
    difficulty: base.difficulty ?? 'средне',
    ...base,
  };
}

export function bank(...questions: Question[]): Question[] {
  return questions;
}

export type { Question, QuestionType };
