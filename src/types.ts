export type Difficulty = 'легко' | 'средне' | 'сложнее';

export type Level = {
  id: string;
  title: string;
  /** Сколько частей нужно выделить. */
  numerator: number;
  /** На сколько равных частей должно быть разрезано целое. */
  denominator: number;
  goal: string;
  hint: string;
  difficulty: Difficulty;
};

export type AnswerTone = 'idle' | 'ready' | 'success' | 'error';
