import type { GradeCurriculum } from '../types.ts';

export const grade9: GradeCurriculum = {
  id: 9,
  title: '9 класс',
  sections: [
    {
      id: 'g9-quadratic',
      title: 'Квадратичная функция',
      controlMinutes: 35,
      topics: [
        {
          id: 'g9-quad-func',
          title: 'Парабола',
          goal: 'Строить график y = ax² + bx + c и читать вершину.',
        },
      ],
    },
    {
      id: 'g9-ineq',
      title: 'Неравенства второй степени',
      controlMinutes: 35,
      topics: [
        {
          id: 'g9-ineq-quad',
          title: 'Квадратные неравенства',
          goal: 'Решать квадратные неравенства методом интервалов.',
        },
      ],
    },
    {
      id: 'g9-progressions',
      title: 'Прогрессии',
      controlMinutes: 35,
      topics: [
        {
          id: 'g9-prog-arith',
          title: 'Арифметическая прогрессия',
          goal: 'Находить n-й член и сумму арифметической прогрессии.',
        },
        {
          id: 'g9-prog-geom',
          title: 'Геометрическая прогрессия',
          goal: 'Находить n-й член и сумму геометрической прогрессии.',
        },
      ],
    },
    {
      id: 'g9-trig',
      title: 'Тригонометрия',
      controlMinutes: 30,
      topics: [
        {
          id: 'g9-trig-intro',
          title: 'Синус, косинус, тангенс',
          goal: 'Вычислять значения тригонометрических функций острых углов.',
        },
      ],
    },
    {
      id: 'g9-coord',
      title: 'Координатный метод',
      controlMinutes: 30,
      topics: [
        {
          id: 'g9-coord-method',
          title: 'Расстояние и середина',
          goal: 'Находить расстояние между точками и координаты середины отрезка.',
        },
      ],
    },
    {
      id: 'g9-vectors',
      title: 'Векторы и стереометрия',
      controlMinutes: 35,
      topics: [
        {
          id: 'g9-vectors-basics',
          title: 'Векторы',
          goal: 'Складывать векторы и находить координаты.',
        },
        {
          id: 'g9-stereo-intro',
          title: 'Начала стереометрии',
          goal: 'Распознавать простые пространственные фигуры и их элементы.',
        },
      ],
    },
    {
      id: 'g9-review',
      title: 'Повторение',
      controlMinutes: 40,
      topics: [
        {
          id: 'g9-review-algebra',
          title: 'Алгебра: итог',
          goal: 'Повторить ключевые темы алгебры 7–9 классов.',
        },
        {
          id: 'g9-review-geometry',
          title: 'Геометрия: итог',
          goal: 'Повторить ключевые факты планиметрии.',
        },
      ],
    },
  ],
};
