import type { Level } from '../types.ts';

/** Слайдер знаменателя: от половины до десяти долей. */
export const DENOMINATOR_MIN = 2;
export const DENOMINATOR_MAX = 10;

export const LEVELS: readonly Level[] = [
  {
    id: 'half',
    title: 'Половина',
    numerator: 1,
    denominator: 2,
    goal: 'Выдели дробь 1/2 на пироге.',
    hint: 'Знаменатель 2 — пирог разрезан на две равные части. Одна из них и есть половина.',
    difficulty: 'легко',
  },
  {
    id: 'quarter',
    title: 'Четверть',
    numerator: 1,
    denominator: 4,
    goal: 'Выдели дробь 1/4 на пироге.',
    hint: 'Четыре равные части. Возьми одну — это одна четвёртая.',
    difficulty: 'легко',
  },
  {
    id: 'three-quarters',
    title: 'Три четверти',
    numerator: 3,
    denominator: 4,
    goal: 'Выдели дробь 3/4 на пироге.',
    hint: 'Нужны три куска из четырёх. Это больше, чем половина пирога.',
    difficulty: 'средне',
  },
  {
    id: 'two-thirds',
    title: 'Две трети',
    numerator: 2,
    denominator: 3,
    goal: 'Выдели дробь 2/3 на пироге.',
    hint: 'Знаменатель 3 — это три равные части, а не четыре. Выдели две из них.',
    difficulty: 'средне',
  },
  {
    id: 'five-eighths',
    title: 'Пять восьмых',
    numerator: 5,
    denominator: 8,
    goal: 'Выдели дробь 5/8 на пироге.',
    hint: 'Разрежь пирог на восемь равных частей и возьми пять. Для дроби неважно, какие именно куски выбраны — важно, сколько.',
    difficulty: 'сложнее',
  },
];
