import type { GradeCurriculum } from '../types.ts';

export const grade5: GradeCurriculum = {
  id: 5,
  title: '5 класс',
  sections: [
    {
      id: 'g5-natural',
      title: 'Натуральные числа',
      controlMinutes: 25,
      topics: [
        {
          id: 'g5-natural-place',
          title: 'Разряды и сравнение',
          goal: 'Читать, записывать и сравнивать многозначные числа.',
        },
        {
          id: 'g5-natural-ops',
          title: 'Арифметические действия',
          goal: 'Выполнять сложение, вычитание, умножение и деление натуральных чисел.',
        },
        {
          id: 'g5-natural-order',
          title: 'Порядок действий',
          goal: 'Правильно расставлять порядок действий в выражениях.',
        },
      ],
    },
    {
      id: 'g5-divisibility',
      title: 'Делимость',
      controlMinutes: 25,
      topics: [
        {
          id: 'g5-div-rules',
          title: 'Признаки делимости',
          goal: 'Применять признаки делимости на 2, 3, 5, 9 и 10.',
        },
        {
          id: 'g5-div-factors',
          title: 'Делители и кратные',
          goal: 'Находить делители и кратные, НОД и НОК в простых случаях.',
        },
      ],
    },
    {
      id: 'g5-fractions',
      title: 'Обыкновенные дроби',
      controlMinutes: 30,
      topics: [
        {
          id: 'g5-fractions-common',
          title: 'Понятие дроби',
          goal: 'Понимать дробь как часть целого и выделять её на модели.',
          hasTrainer: true,
        },
        {
          id: 'g5-fractions-compare',
          title: 'Сравнение дробей',
          goal: 'Сравнивать дроби с одинаковыми знаменателями и числителями.',
        },
        {
          id: 'g5-fractions-ops',
          title: 'Сложение и вычитание',
          goal: 'Складывать и вычитать обыкновенные дроби с одинаковыми знаменателями.',
        },
      ],
    },
    {
      id: 'g5-decimals',
      title: 'Десятичные дроби',
      controlMinutes: 30,
      topics: [
        {
          id: 'g5-decimals-place',
          title: 'Запись и разряды',
          goal: 'Читать десятичные дроби и понимать значение разрядов.',
        },
        {
          id: 'g5-decimals-ops',
          title: 'Действия с десятичными',
          goal: 'Складывать, вычитать и умножать десятичные дроби.',
        },
      ],
    },
    {
      id: 'g5-percents',
      title: 'Проценты',
      controlMinutes: 25,
      topics: [
        {
          id: 'g5-percents-intro',
          title: 'Что такое процент',
          goal: 'Связывать проценты с дробями и находить процент от числа.',
        },
      ],
    },
    {
      id: 'g5-geometry',
      title: 'Геометрия',
      controlMinutes: 30,
      topics: [
        {
          id: 'g5-geo-angles',
          title: 'Углы и отрезки',
          goal: 'Распознавать виды углов и измерять отрезки.',
        },
        {
          id: 'g5-geo-area',
          title: 'Площадь и объём',
          goal: 'Находить площадь прямоугольника и объём прямоугольного параллелепипеда.',
        },
      ],
    },
    {
      id: 'g5-line',
      title: 'Координатная прямая',
      controlMinutes: 20,
      topics: [
        {
          id: 'g5-line-coords',
          title: 'Точки на прямой',
          goal: 'Отмечать натуральные числа и дроби на координатной прямой.',
        },
      ],
    },
  ],
};
