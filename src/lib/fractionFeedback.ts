import type { Level } from '../types.ts';

export type CheckResult = {
  correct: boolean;
  message: string;
};

/** «2 равные части», «5 равных частей» — для чисел 2…10. */
function equalParts(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 < 10 || mod100 > 20) {
    if (mod10 === 1) return `${count} равную часть`;
    if (mod10 >= 2 && mod10 <= 4) return `${count} равные части`;
  }
  return `${count} равных частей`;
}

/**
 * Верный ответ — то же число частей и тот же знаменатель, что в задании.
 * Равная по величине дробь (6/8 при цели 3/4) не засчитывается:
 * в 5 классе на этом шаге тренируем именно запись «числитель / знаменатель»,
 * но про равенство говорим отдельно, чтобы оно не выглядело как ошибка «в никуда».
 */
export function checkAnswer(level: Level, numerator: number, denominator: number): CheckResult {
  if (numerator === level.numerator && denominator === level.denominator) {
    return {
      correct: true,
      message: `Верно! На пироге ${level.numerator}/${level.denominator}.`,
    };
  }

  if (numerator === 0) {
    return {
      correct: false,
      message: 'Пока ничего не выделено. Нажми на части пирога.',
    };
  }

  const sameValue = numerator * level.denominator === level.numerator * denominator;
  if (denominator !== level.denominator && sameValue) {
    return {
      correct: false,
      message: `${numerator}/${denominator} — это столько же, сколько ${level.numerator}/${level.denominator}. В этом задании разрежь пирог на ${equalParts(level.denominator)} и выдели ${level.numerator}.`,
    };
  }

  if (denominator !== level.denominator) {
    return {
      correct: false,
      message: `Пирог разрезан на ${equalParts(denominator)}. В задании знаменатель ${level.denominator}: нужно ${equalParts(level.denominator)}.`,
    };
  }

  return {
    correct: false,
    message: `Выделено ${numerator} из ${denominator}. Нужно выделить ${level.numerator}.`,
  };
}
