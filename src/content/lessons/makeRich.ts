import type { Lesson, LessonInteract, LessonVisual, Question } from '../../curriculum/types.ts';

type RichInput = {
  topicId: string;
  idea: string;
  how: string;
  example: string;
  mistake: string;
  remember: string;
  try1: Question;
  try2: Question;
  interact?: LessonInteract;
  visual?: LessonVisual;
  trainerCta?: boolean;
  extraExample?: string;
};

/** Компактный, но «живой» урок: идея → пример → интерактив → 2 проверки → ошибка → итог. */
export function richLesson(input: RichInput): Lesson {
  const interact: LessonInteract =
    input.interact ??
    ({
      type: 'spot-error',
      prompt: 'Где ломается рассуждение?',
      lines: [
        input.idea.slice(0, 80),
        'Сделали шаг «на глаз», без правила.',
        'Получили ответ и не проверили.',
        'Верный путь: правило → шаг → проверка.',
      ],
      wrongIndex: 1,
      explanation: 'Без правила ответ случайный.',
    } satisfies LessonInteract);

  return {
    topicId: input.topicId,
    steps: [
      {
        id: `${input.topicId}-c1`,
        kind: 'concept',
        title: 'Идея',
        body: input.idea,
        visual: input.visual,
        trainerCta: input.trainerCta,
      },
      {
        id: `${input.topicId}-c2`,
        kind: 'concept',
        title: 'Как думать',
        body: input.how,
      },
      {
        id: `${input.topicId}-e1`,
        kind: 'example',
        title: 'Разбор',
        body: input.example,
      },
      ...(input.extraExample
        ? ([
            {
              id: `${input.topicId}-e1b`,
              kind: 'example' as const,
              title: 'Ещё пример',
              body: input.extraExample,
            },
          ] as const)
        : []),
      {
        id: `${input.topicId}-i1`,
        kind: 'interact',
        title: 'Интерактив',
        interact,
      },
      {
        id: `${input.topicId}-t1`,
        kind: 'try',
        title: 'Попробуй',
        question: input.try1,
      },
      {
        id: `${input.topicId}-e2`,
        kind: 'example',
        title: 'Частая ошибка',
        body: input.mistake,
      },
      {
        id: `${input.topicId}-t2`,
        kind: 'try',
        title: 'Ещё раз',
        question: input.try2,
      },
      {
        id: `${input.topicId}-s`,
        kind: 'summary',
        title: 'Запомни',
        body: input.remember,
      },
    ],
  };
}
