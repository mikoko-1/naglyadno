import type { GradeCurriculum } from '../types.ts';

export const grade7: GradeCurriculum = {
  id: 7,
  title: '7 класс',
  sections: [
    {
      id: 'g7-expr',
      title: 'Выражения и тождества',
      controlMinutes: 30,
      topics: [
        {
          id: 'g7-expr-simplify',
          title: 'Упрощение выражений',
          goal: 'Раскрывать скобки и приводить подобные слагаемые.',
        },
        {
          id: 'g7-expr-identity',
          title: 'Тождества',
          goal: 'Проверять тождества и применять простые формулы.',
        },
      ],
    },
    {
      id: 'g7-equations',
      title: 'Линейные уравнения',
      controlMinutes: 30,
      topics: [
        {
          id: 'g7-eq-linear',
          title: 'Линейные уравнения',
          goal: 'Решать уравнения с одной переменной.',
        },
        {
          id: 'g7-eq-word',
          title: 'Задачи на уравнения',
          goal: 'Составлять уравнение по условию задачи.',
        },
      ],
    },
    {
      id: 'g7-powers',
      title: 'Степени',
      controlMinutes: 30,
      topics: [
        {
          id: 'g7-powers-rules',
          title: 'Свойства степени',
          goal: 'Применять свойства степени с натуральным показателем.',
        },
      ],
    },
    {
      id: 'g7-poly',
      title: 'Многочлены',
      controlMinutes: 35,
      topics: [
        {
          id: 'g7-poly-ops',
          title: 'Действия с многочленами',
          goal: 'Складывать и умножать многочлены.',
        },
        {
          id: 'g7-poly-factor',
          title: 'Формулы сокращённого умножения',
          goal: 'Применять (a±b)² и a²−b².',
        },
      ],
    },
    {
      id: 'g7-systems',
      title: 'Системы уравнений',
      controlMinutes: 30,
      topics: [
        {
          id: 'g7-sys-linear',
          title: 'Системы двух уравнений',
          goal: 'Решать системы линейных уравнений подстановкой и сложением.',
        },
      ],
    },
    {
      id: 'g7-functions',
      title: 'Функции',
      controlMinutes: 30,
      topics: [
        {
          id: 'g7-func-linear',
          title: 'Линейная функция',
          goal: 'Строить график y = kx + b и читать коэффициент k.',
        },
      ],
    },
    {
      id: 'g7-geometry',
      title: 'Геометрия',
      controlMinutes: 35,
      topics: [
        {
          id: 'g7-geo-triangles',
          title: 'Треугольники',
          goal: 'Применять признаки равенства треугольников и сумму углов.',
        },
        {
          id: 'g7-geo-parallel',
          title: 'Параллельные прямые',
          goal: 'Находить углы при параллельных прямых и секущей.',
        },
      ],
    },
  ],
};
