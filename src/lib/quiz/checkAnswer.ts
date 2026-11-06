import type { Question } from '../../curriculum/types.ts';

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/');
}

/** «3/4», «1+1/2», «-2.5», «4». */
export function parseNumeric(raw: string): number | null {
  const value = normalizeText(raw);
  if (!value) return null;

  const mixedNumber = value.match(/^(-)?(\d+)\+(\d+)\/(\d+)$/);
  if (mixedNumber) {
    const sign = mixedNumber[1] ? -1 : 1;
    const whole = Number(mixedNumber[2]);
    const num = Number(mixedNumber[3]);
    const den = Number(mixedNumber[4]);
    if (!den) return null;
    return sign * (whole + num / den);
  }

  const fraction = value.match(/^(-)?(\d+)\/(\d+)$/);
  if (fraction) {
    const sign = fraction[1] ? -1 : 1;
    const num = Number(fraction[2]);
    const den = Number(fraction[3]);
    if (!den) return null;
    return (sign * num) / den;
  }

  const asNumber = Number(value);
  return Number.isFinite(asNumber) ? asNumber : null;
}

function sameNumber(a: string, b: string, tolerance = 1e-9): boolean {
  const left = parseNumeric(a);
  const right = parseNumeric(b);
  if (left !== null && right !== null) return Math.abs(left - right) <= tolerance;
  return normalizeText(a) === normalizeText(b);
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const left = [...a].map(normalizeText).sort();
  const right = [...b].map(normalizeText).sort();
  return left.every((item, index) => item === right[index]);
}

function sameOrder(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => normalizeText(item) === normalizeText(b[index]));
}

export function checkQuestionAnswer(question: Question, raw: string | string[]): boolean {
  if (question.type === 'single' || question.type === 'input') {
    const expected = Array.isArray(question.answer) ? question.answer[0] : question.answer;
    const given = Array.isArray(raw) ? raw[0] : raw;
    return sameNumber(String(given ?? ''), String(expected));
  }

  const expected = Array.isArray(question.answer) ? question.answer : [question.answer];
  const given = Array.isArray(raw) ? raw : [raw];

  if (question.type === 'multi') return sameSet(given, expected);
  if (question.type === 'order') return sameOrder(given, expected);
  return false;
}

export function formatAnswer(question: Question): string {
  if (Array.isArray(question.answer)) return question.answer.join(', ');
  return question.answer;
}
