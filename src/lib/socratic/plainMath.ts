/**
 * Gemini иногда отвечает LaTeX ($\\frac{1}{2}$).
 * В чате это не рендерится — превращаем в обычную запись 1/2.
 */
export function toPlainMath(raw: string): string {
  let s = raw;

  // \( ... \) и \[ ... \]
  s = s.replace(/\\\(([\s\S]*?)\\\)/g, '$1');
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, '$1');

  // $...$ и $$...$$
  s = s.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
  s = s.replace(/\$([^$\n]+)\$/g, '$1');

  // \frac{a}{b} → (a)/(b) или a/b если простое
  s = s.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, (_, a: string, b: string) => {
    const left = a.trim();
    const right = b.trim();
    const simple = /^[-+]?\d+(\.\d+)?$/.test(left) && /^[-+]?\d+(\.\d+)?$/.test(right);
    return simple ? `${left}/${right}` : `(${left})/(${right})`;
  });

  // Частые команды
  const cmds: Array<[RegExp, string]> = [
    [/\\times/g, '×'],
    [/\\cdot/g, '·'],
    [/\\div/g, '÷'],
    [/\\pm/g, '±'],
    [/\\leq/g, '≤'],
    [/\\geq/g, '≥'],
    [/\\neq/g, '≠'],
    [/\\approx/g, '≈'],
    [/\\sqrt\s*\{([^{}]+)\}/g, '√($1)'],
    [/\\sqrt/g, '√'],
    [/\\left/g, ''],
    [/\\right/g, ''],
    [/\\,/g, ' '],
    [/\\;/g, ' '],
    [/\\quad/g, ' '],
    [/\\qquad/g, ' '],
    [/~/g, ' '],
  ];
  for (const [re, to] of cmds) s = s.replace(re, to);

  // \text{...} → ...
  s = s.replace(/\\text\s*\{([^{}]*)\}/g, '$1');
  // оставшиеся \{ \}
  s = s.replace(/\\([{}])/g, '$1');
  // одиночные backslash-команды без аргумента: \alpha и т.п. — убрать слеш
  s = s.replace(/\\([a-zA-Z]+)/g, '$1');

  return s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
