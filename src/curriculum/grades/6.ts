import type { GradeCurriculum } from '../types.ts';

export const grade6: GradeCurriculum = {
  id: 6,
  title: '6 класс',
  sections: [
    {
      id: 'g6-divisibility',
      title: 'Делимость чисел',
      controlMinutes: 30,
      topics: [
        {
          id: 'g6-div-prime',
          title: 'Простые и составные',
          goal: 'Различать простые и составные числа, раскладывать на множители.',
        },
        {
          id: 'g6-div-gcd-lcm',
          title: 'НОД и НОК',
          goal: 'Находить НОД и НОК и применять их к задачам.',
        },
      ],
    },
    {
      id: 'g6-fractions',
      title: 'Дроби',
      controlMinutes: 35,
      topics: [
        {
          id: 'g6-frac-ops',
          title: 'Действия с обыкновенными',
          goal: 'Умножать и делить обыкновенные дроби, сокращать.',
        },
        {
          id: 'g6-frac-mixed',
          title: 'Смешанные числа',
          goal: 'Переводить смешанные числа в неправильные дроби и обратно.',
        },
        {
          id: 'g6-dec-ops',
          title: 'Десятичные дроби',
          goal: 'Выполнять все действия с десятичными дробями.',
        },
      ],
    },
    {
      id: 'g6-ratio',
      title: 'Отношения и пропорции',
      controlMinutes: 30,
      topics: [
        {
          id: 'g6-ratio-prop',
          title: 'Пропорции',
          goal: 'Составлять и решать пропорции.',
        },
        {
          id: 'g6-ratio-scale',
          title: 'Масштаб и отношение',
          goal: 'Применять отношение и масштаб в задачах.',
        },
      ],
    },
    {
      id: 'g6-percents',
      title: 'Проценты',
      controlMinutes: 30,
      topics: [
        {
          id: 'g6-percents-tasks',
          title: 'Задачи на проценты',
          goal: 'Находить процент от числа, число по проценту и процентное отношение.',
        },
      ],
    },
    {
      id: 'g6-rational',
      title: 'Рациональные числа',
      controlMinutes: 35,
      topics: [
        {
          id: 'g6-rational-neg',
          title: 'Отрицательные числа',
          goal: 'Сравнивать и складывать рациональные числа.',
        },
        {
          id: 'g6-rational-ops',
          title: 'Действия с рациональными',
          goal: 'Умножать и делить рациональные числа.',
        },
      ],
    },
    {
      id: 'g6-plane',
      title: 'Координатная плоскость',
      controlMinutes: 25,
      topics: [
        {
          id: 'g6-plane-points',
          title: 'Точки на плоскости',
          goal: 'Находить координаты точек и строить точки по координатам.',
        },
      ],
    },
    {
      id: 'g6-circle',
      title: 'Окружность',
      controlMinutes: 25,
      topics: [
        {
          id: 'g6-circle-basics',
          title: 'Радиус, диаметр, длина',
          goal: 'Связывать радиус, диаметр и длину окружности.',
        },
      ],
    },
    {
      id: 'g6-equations',
      title: 'Уравнения',
      controlMinutes: 30,
      topics: [
        {
          id: 'g6-eq-linear',
          title: 'Простейшие уравнения',
          goal: 'Решать линейные уравнения вида ax + b = c.',
        },
      ],
    },
  ],
};
