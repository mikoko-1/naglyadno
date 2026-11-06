import type { GradeCurriculum } from '../types.ts';

export const grade8: GradeCurriculum = {
  id: 8,
  title: '8 класс',
  sections: [
    {
      id: 'g8-roots',
      title: 'Квадратные корни',
      controlMinutes: 30,
      topics: [
        {
          id: 'g8-roots-basics',
          title: 'Арифметический корень',
          goal: 'Вычислять и упрощать выражения с квадратными корнями.',
        },
      ],
    },
    {
      id: 'g8-quad',
      title: 'Квадратные уравнения',
      controlMinutes: 35,
      topics: [
        {
          id: 'g8-quad-eq',
          title: 'Квадратные уравнения',
          goal: 'Решать уравнения через дискриминант и теорему Виета.',
        },
        {
          id: 'g8-quad-tasks',
          title: 'Задачи на квадратные уравнения',
          goal: 'Составлять и решать квадратные уравнения по условию.',
        },
      ],
    },
    {
      id: 'g8-ineq',
      title: 'Неравенства',
      controlMinutes: 30,
      topics: [
        {
          id: 'g8-ineq-linear',
          title: 'Линейные неравенства',
          goal: 'Решать линейные неравенства и отмечать решения на прямой.',
        },
      ],
    },
    {
      id: 'g8-rational',
      title: 'Дробно-рациональные выражения',
      controlMinutes: 35,
      topics: [
        {
          id: 'g8-rat-simplify',
          title: 'Сокращение дробей',
          goal: 'Сокращать алгебраические дроби и находить ОДЗ.',
        },
        {
          id: 'g8-rat-ops',
          title: 'Действия с дробями',
          goal: 'Складывать и умножать алгебраические дроби.',
        },
      ],
    },
    {
      id: 'g8-powers',
      title: 'Степень с целым показателем',
      controlMinutes: 30,
      topics: [
        {
          id: 'g8-powers-int',
          title: 'Целый показатель',
          goal: 'Применять свойства степени с целым показателем.',
        },
      ],
    },
    {
      id: 'g8-geometry',
      title: 'Геометрия',
      controlMinutes: 40,
      topics: [
        {
          id: 'g8-geo-quads',
          title: 'Четырёхугольники',
          goal: 'Использовать свойства параллелограмма, ромба, прямоугольника.',
        },
        {
          id: 'g8-geo-pythagoras',
          title: 'Теорема Пифагора',
          goal: 'Находить сторону прямоугольного треугольника.',
        },
        {
          id: 'g8-geo-similar',
          title: 'Подобие',
          goal: 'Применять признаки подобия треугольников.',
        },
      ],
    },
  ],
};
