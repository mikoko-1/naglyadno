export type GradeId = 5 | 6 | 7 | 8 | 9;

export type ActivityKind = 'lesson' | 'trainer' | 'practice' | 'test' | 'control';

export type QuestionDifficulty = 'легко' | 'средне' | 'сложнее';

export type QuestionType = 'single' | 'multi' | 'input' | 'order';

export type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  /** Варианты для single / multi / order. */
  options?: string[];
  /**
   * single / input → строка;
   * multi / order → массив строк (для order — правильный порядок option-значений).
   */
  answer: string | string[];
  explanation: string;
  difficulty: QuestionDifficulty;
  hint?: string;
};

export type LessonVisual = 'pie' | 'number-line' | 'none';

/** Интерактив внутри шага урока. */
export type LessonInteract =
  | {
      type: 'pie-tap';
      prompt: string;
      denominator: number;
      targetNumerator: number;
      success: string;
    }
  | {
      type: 'line-pick';
      prompt: string;
      min: number;
      max: number;
      step: number;
      target: number;
      success: string;
    }
  | {
      type: 'bar-set';
      prompt: string;
      max: number;
      step: number;
      target: number;
      unit?: string;
      success: string;
    }
  | {
      type: 'spot-error';
      prompt: string;
      lines: string[];
      wrongIndex: number;
      explanation: string;
    }
  | {
      type: 'sort-steps';
      prompt: string;
      items: string[];
      correctOrder: string[];
      explanation: string;
    }
  | {
      type: 'story';
      scene: string;
      prompt: string;
      options: Array<{ id: string; label: string; correct: boolean; feedback: string }>;
    };

export type LessonStep =
  | {
      id: string;
      kind: 'concept' | 'example' | 'summary';
      title: string;
      body: string;
      visual?: LessonVisual;
      /** После шага показать кнопку в тренажёр (для дробей). */
      trainerCta?: boolean;
    }
  | {
      id: string;
      kind: 'try';
      title: string;
      body?: string;
      question: Question;
    }
  | {
      id: string;
      kind: 'interact';
      title: string;
      body?: string;
      interact: LessonInteract;
    };

export type Lesson = {
  topicId: string;
  steps: LessonStep[];
};

export type Topic = {
  id: string;
  title: string;
  goal: string;
  /** Есть визуальный тренажёр в registry. */
  hasTrainer?: boolean;
};

export type Section = {
  id: string;
  title: string;
  topics: Topic[];
  /** Длительность контрольной в минутах. */
  controlMinutes: number;
};

export type GradeCurriculum = {
  id: GradeId;
  title: string;
  sections: Section[];
};

export type ControlSpec = {
  id: string;
  sectionId: string;
  grade: GradeId;
  title: string;
  minutes: number;
  questionIds: string[];
};

export type AppMode =
  | 'year'
  | 'plan'
  | 'lessons'
  | 'exam'
  | 'radar'
  | 'parent'
  | 'account';

export type ProductId = 'math';

export type RouteState =
  | { view: 'home' }
  | { view: 'catalog'; grade: GradeId }
  | { view: 'topic'; grade: GradeId; topicId: string }
  | { view: 'lesson'; grade: GradeId; topicId: string; yearWeek?: number }
  | { view: 'trainer'; grade: GradeId; topicId: string }
  | { view: 'exam'; grade?: GradeId; yearWeek?: number }
  | { view: 'radar'; yearWeek?: number }
  | { view: 'plan' }
  | { view: 'year'; grade: GradeId }
  | { view: 'parent' }
  | { view: 'account' }
  | { view: 'legal'; doc: 'offer' | 'privacy' | 'contacts' }
  | {
      view: 'quiz';
      grade: GradeId;
      mode: 'practice' | 'test' | 'control';
      topicId?: string;
      sectionId?: string;
      yearWeek?: number;
    };
