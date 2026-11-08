import { CURRICULUM, allTopics } from '../../curriculum/index.ts';
import type { Lesson, LessonStep, Question, Topic } from '../../curriculum/types.ts';
import { QUESTION_BANKS } from '../questions/index.ts';
import { input, single } from '../q.ts';

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
    input({
      id: `${topic.id}-lesson-try-2`,
      prompt: `Тема «${topic.title}»: какой первый шаг? Напиши одно слово: правило / проверка / угадайка`,
      answer: 'правило',
      explanation: 'Сначала правило, потом счёт, потом проверка.',
      difficulty: 'легко',
      hint: 'Нужен порядок: понять правило.',
    });
  return [
    { ...first, id: `${topic.id}-lesson-try-q1` },
    { ...second, id: `${topic.id}-lesson-try-q2` },
  ];
}

function keywordTips(topic: Topic): { mistake: string; example: string; remember: string } {
  const id = topic.id;
  if (id.includes('frac') || id.includes('fractions')) {
    return {
      example: 'Пример: 1/4 + 2/4 = 3/4 — знаменатель общий, складываем только числители.',
      mistake: 'Частая ошибка: складывать знаменатели вместе с числителями (1/4+2/4 ≠ 3/8).',
      remember: 'Дробь — часть целого. Сначала одинаковые знаменатели, потом действие.',
    };
  }
  if (id.includes('percent')) {
    return {
      example: 'Пример: 20% от 50 = 50 · 0,2 = 10.',
      mistake: 'Частая ошибка: путать «n% от A» и «A% от n».',
      remember: '1% = 1/100. Процент от числа = число · процент / 100.',
    };
  }
  if (id.includes('eq') || id.includes('linear')) {
    return {
      example: 'Пример: 2x + 6 = 14 → 2x = 8 → x = 4. Проверка: 2·4+6=14.',
      mistake: 'Частая ошибка: перенести слагаемое и забыть сменить знак.',
      remember: 'Обратное действие: + ↔ −, · ↔ ÷. Всегда подставляй ответ обратно.',
    };
  }
  if (id.includes('power') || id.includes('powers')) {
    return {
      example: 'Пример: a² · a³ = a⁵ — при одном основании показатели складываются.',
      mistake: 'Частая ошибка: a² · a³ = a⁶ (перемножили показатели).',
      remember: 'Одинаковое основание → показатели складываются при умножении.',
    };
  }
  if (id.includes('root')) {
    return {
      example: 'Пример: √36 = 6, потому что 6·6 = 36. √(−4) в действительных нет.',
      mistake: 'Частая ошибка: «достать корень» из отрицательного как из обычного числа.',
      remember: 'Под корнем на числовой прямой — только ≥ 0.',
    };
  }
  if (id.includes('quad')) {
    return {
      example: 'Пример: x² − 5x + 6 = 0 → (x−2)(x−3)=0 → x=2 или x=3.',
      mistake: 'Частая ошибка: перепутать знак в формуле дискриминанта.',
      remember: 'D = b² − 4ac. Если D<0 — действительных корней нет.',
    };
  }
  if (id.includes('geo') || id.includes('triangle') || id.includes('pythagoras')) {
    return {
      example: 'Пример: сумма углов треугольника 180°. Если два по 50°, третий 80°.',
      mistake: 'Частая ошибка: применять Пифагора к тупоугольному треугольнику «вслепую».',
      remember: 'Сначала тип фигуры и условие, потом формула.',
    };
  }
  if (id.includes('prog')) {
    return {
      example: 'Арифметика: 2, 5, 8… разность d=3. Геометрия: 2, 6, 18… знаменатель q=3.',
      mistake: 'Частая ошибка: перепутать формулы арифметической и геометрической прогрессии.',
      remember: 'Сначала определи тип прогрессии, потом бери формулу.',
    };
  }
  return {
    example: `Разберём простой случай по теме «${topic.title}». Если ответ «не лезет» в смысл — вернись к правилу.`,
    mistake: `В теме «${topic.title}» чаще всего ошибаются, когда торопятся и не проверяют ответ.`,
    remember: `Цель: ${topic.goal} Сначала правило → шаг → проверка.`,
  };
}

function templateLesson(topic: Topic): Lesson {
  const [try1, try2] = pickTries(topic);
  const tips = keywordTips(topic);

  const interact: LessonStep = {
    id: `${topic.id}-i1`,
    kind: 'interact',
    title: 'Найди ошибку',
    body: 'Выбери шаг, где логика ломается.',
    interact: {
      type: 'spot-error',
      prompt: `Тема «${topic.title}»: где ошибка в рассуждении?`,
      lines: [
        `Цель: ${topic.goal}`,
        'Сделали первый шаг без правила — «на глаз».',
        'Получили ответ и не проверили подстановкой.',
        'Верный путь: правило → действие → проверка смысла.',
      ],
      wrongIndex: 1,
      explanation: 'Без правила ответ случайный. Сначала идея темы, потом счёт.',
    },
  };

  return {
    topicId: topic.id,
    steps: [
      {
        id: `${topic.id}-c1`,
        kind: 'concept',
        title: `Идея: ${topic.title}`,
        body: `${topic.goal} Ниже — коротко и по делу: что делать и где обычно ломается.`,
      },
      {
        id: `${topic.id}-c2`,
        kind: 'concept',
        title: 'Как думать',
        body: '1) Что дано и что найти. 2) Какое правило темы подходит. 3) Один шаг. 4) Проверка: мог ли такой ответ быть.',
      },
      {
        id: `${topic.id}-e1`,
        kind: 'example',
        title: 'Пример',
        body: tips.example,
        visual: topic.id.includes('frac') ? 'pie' : topic.id.includes('line') || topic.id.includes('ineq') ? 'number-line' : 'none',
      },
      interact,
      {
        id: `${topic.id}-t1`,
        kind: 'try',
        title: 'Попробуй 1',
        body: 'Не тест — проверка, что идея легла.',
        question: try1,
      },
      {
        id: `${topic.id}-e2`,
        kind: 'example',
        title: 'Частая ошибка',
        body: tips.mistake,
      },
      {
        id: `${topic.id}-t2`,
        kind: 'try',
        title: 'Попробуй 2',
        question: try2,
      },
      {
        id: `${topic.id}-s`,
        kind: 'summary',
        title: 'Запомни',
        body: `${tips.remember} Дальше — практика и тест по теме.`,
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
