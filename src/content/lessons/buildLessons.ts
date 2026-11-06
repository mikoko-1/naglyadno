import { CURRICULUM, allTopics } from '../../curriculum/index.ts';
import type { Lesson, Question, Topic } from '../../curriculum/types.ts';
import { QUESTION_BANKS } from '../questions/index.ts';
import { single } from '../q.ts';

function pickTries(topic: Topic): [Question, Question] {
  const bank = QUESTION_BANKS[topic.id];
  const pool = (bank?.practice ?? []).filter((q) => q.type === 'single' || q.type === 'input');
  const fallback = single({
    id: `${topic.id}-lesson-try`,
    prompt: `Что главное в теме «${topic.title}»?`,
    options: [topic.goal, 'Угадывать без правила', 'Пропускать условие', 'Делить на ноль'],
    answer: topic.goal,
    explanation: 'Цель темы — понять правило и уметь его применить.',
    difficulty: 'легко',
  });
  const first = pool[0] ?? fallback;
  const second =
    pool[1] ??
    single({
      id: `${topic.id}-lesson-try-2`,
      prompt: `Какой шаг важен в теме «${topic.title}»?`,
      options: [
        'Прочитать условие и проверить ответ',
        'Игнорировать единицы',
        'Гадать без правила',
        'Пропустить разбор ошибки',
      ],
      answer: 'Прочитать условие и проверить ответ',
      explanation: 'Понимание + проверка важнее скорости вслепую.',
      difficulty: 'легко',
    });
  return [
    { ...first, id: `${topic.id}-lesson-try-q1` },
    { ...second, id: `${topic.id}-lesson-try-q2` },
  ];
}

function templateLesson(topic: Topic): Lesson {
  const [try1, try2] = pickTries(topic);

  return {
    topicId: topic.id,
    steps: [
      {
        id: `${topic.id}-c1`,
        kind: 'concept',
        title: `О чём тема «${topic.title}»`,
        body: `${topic.goal} Сначала разберём идею простыми словами, потом закрепим примерами и двумя короткими проверками.`,
      },
      {
        id: `${topic.id}-c2`,
        kind: 'concept',
        title: 'Как думать',
        body: `1) Прочитай условие и отметь, что дано и что найти. 2) Вспомни правило темы «${topic.title}». 3) Сделай шаг. 4) Проверь, имеет ли ответ смысл.`,
      },
      {
        id: `${topic.id}-e1`,
        kind: 'example',
        title: 'Разбор на пальцах',
        body: `Представь простой случай по теме «${topic.title}». Если ответ «слишком странный» (отрицательная длина, процент больше 100% без причины) — вернись к правилу.`,
      },
      {
        id: `${topic.id}-t1`,
        kind: 'try',
        title: 'Проверка 1',
        body: 'Это ещё не тест — просто проверка, что идея легла.',
        question: try1,
      },
      {
        id: `${topic.id}-e2`,
        kind: 'example',
        title: 'Частая ошибка',
        body: `В теме «${topic.title}» чаще всего ошибаются, когда торопятся и пропускают проверку. После вычисления спроси: «Могло ли так быть по смыслу?»`,
      },
      {
        id: `${topic.id}-t2`,
        kind: 'try',
        title: 'Проверка 2',
        question: try2,
      },
      {
        id: `${topic.id}-s`,
        kind: 'summary',
        title: 'Запомни',
        body: `Цель: ${topic.goal} Дальше — практика для навыка и тест, когда уверен.`,
      },
    ],
  };
}

export function buildAllLessons(authored: Record<string, Lesson>): Record<string, Lesson> {
  const result: Record<string, Lesson> = { ...authored };
  for (const grade of CURRICULUM) {
    for (const topic of allTopics(grade.id)) {
      if (!result[topic.id]) result[topic.id] = templateLesson(topic);
    }
  }
  return result;
}
