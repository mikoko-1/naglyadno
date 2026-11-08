import type { Question } from '../../curriculum/types.ts';
import type { MicroSkillId } from '../skills/microSkills.ts';

export type GeneratedQuestion = Question & {
  skillId: MicroSkillId;
  seed: number;
};

function randInt(seed: number, min: number, max: number): number {
  // LCG from seed → [min, max]
  const next = (seed * 1664525 + 1013904223) >>> 0;
  return min + (next % (max - min + 1));
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function simplify(n: number, d: number): [number, number] {
  const g = gcd(n, d);
  return [n / g, d / g];
}

function pickSeed(): number {
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
}

function base(
  skillId: MicroSkillId,
  seed: number,
  prompt: string,
  answer: string,
  explanation: string,
  hint?: string,
): GeneratedQuestion {
  return {
    id: `${skillId}-${seed}`,
    type: 'input',
    prompt,
    answer,
    explanation,
    difficulty: 'средне',
    hint,
    skillId,
    seed,
  };
}

function genCommonDenom(seed: number): GeneratedQuestion {
  let a = randInt(seed, 1, 8);
  let b = randInt(seed + 3, 2, 9);
  let c = randInt(seed + 7, 1, 8);
  let d = randInt(seed + 11, 2, 9);
  if (b === d) d = d === 9 ? 8 : d + 1;
  const [na, da] = simplify(a, b);
  const [nc, dc] = simplify(c, d);
  a = na;
  b = da;
  c = nc;
  d = dc;
  const den = (b * d) / gcd(b, d);
  const num = a * (den / b) + c * (den / d);
  const [rn, rd] = simplify(num, den);
  return base(
    'fractions_common_denom',
    seed,
    `Вычисли: ${a}/${b} + ${c}/${d}. Ответ — несократимая дробь (например 5/6).`,
    `${rn}/${rd}`,
    `Общий знаменатель ${den}: ${a * (den / b)}/${den} + ${c * (den / d)}/${den} = ${num}/${den} → ${rn}/${rd}.`,
    'Сначала приведи к общему знаменателю.',
  );
}

function genFracMul(seed: number): GeneratedQuestion {
  const a = randInt(seed, 1, 7);
  const b = randInt(seed + 2, 2, 9);
  const c = randInt(seed + 5, 1, 7);
  const d = randInt(seed + 9, 2, 9);
  const [rn, rd] = simplify(a * c, b * d);
  return base(
    'fractions_multiply',
    seed,
    `Вычисли: ${a}/${b} · ${c}/${d}. Ответ — несократимая дробь.`,
    `${rn}/${rd}`,
    `Числители: ${a}·${c}=${a * c}, знаменатели: ${b}·${d}=${b * d} → ${rn}/${rd}.`,
  );
}

function genFracDiv(seed: number): GeneratedQuestion {
  const a = randInt(seed, 1, 7);
  const b = randInt(seed + 4, 2, 8);
  const c = randInt(seed + 6, 1, 7);
  const d = randInt(seed + 10, 2, 8);
  const [rn, rd] = simplify(a * d, b * c);
  return base(
    'fractions_divide',
    seed,
    `Вычисли: ${a}/${b} ÷ ${c}/${d}. Ответ — несократимая дробь.`,
    `${rn}/${rd}`,
    `Деление = умножение на обратную: ${a}/${b} · ${d}/${c} = ${rn}/${rd}.`,
  );
}

function genPercent(seed: number): GeneratedQuestion {
  const pct = randInt(seed, 1, 9) * 5;
  const n = randInt(seed + 8, 2, 20) * 10;
  const ans = (pct / 100) * n;
  return base(
    'percent_of',
    seed,
    `Найди ${pct}% от ${n}.`,
    String(ans),
    `${pct}% = ${pct}/100. ${n} · ${pct}/100 = ${ans}.`,
  );
}

function genNegBrackets(seed: number): GeneratedQuestion {
  const a = randInt(seed, 2, 9);
  const b = randInt(seed + 3, 1, 8);
  const c = randInt(seed + 5, 1, 8);
  const ans = -a + b - c;
  return base(
    'negative_signs_brackets',
    seed,
    `Вычисли: −(${a} − ${b} + ${c}).`,
    String(ans),
    `Минус перед скобкой меняет знаки: −${a} + ${b} − ${c} = ${ans}.`,
    'Раскрой скобки, меняя каждый знак.',
  );
}

function genLinearIsolate(seed: number): GeneratedQuestion {
  const coef = randInt(seed, 2, 9);
  const add = randInt(seed + 2, 1, 12);
  const x = randInt(seed + 4, -8, 12);
  const right = coef * x + add;
  return base(
    'linear_isolate_x',
    seed,
    `Реши уравнение: ${coef}x + ${add} = ${right}. Ответ — значение x.`,
    String(x),
    `Перенеси ${add}: ${coef}x = ${right - add}. Раздели на ${coef}: x = ${x}.`,
    'Сначала убери слагаемое без x обратным действием.',
  );
}

function genLinearBoth(seed: number): GeneratedQuestion {
  const a = randInt(seed, 2, 7);
  const b = randInt(seed + 1, 1, 9);
  const c = randInt(seed + 3, 1, 6);
  if (a === c) return genLinearBoth(seed + 17);
  const x = randInt(seed + 5, -5, 10);
  const rightConst = a * x + b - c * x;
  // a x + b = c x + rightConst
  return base(
    'linear_both_sides',
    seed,
    `Реши: ${a}x + ${b} = ${c}x + ${rightConst}. Ответ — x.`,
    String(x),
    `Собери x: ${a}x − ${c}x = ${rightConst} − ${b} → ${(a - c) * x} = ${rightConst - b} → x = ${x}.`,
  );
}

function genProportion(seed: number): GeneratedQuestion {
  const a = randInt(seed, 2, 9);
  const b = randInt(seed + 2, 2, 9);
  const k = randInt(seed + 4, 2, 6);
  const c = a * k;
  const d = b * k;
  // ask for missing — regenerate variant: find x in a/b = x/d
  const x = (a * d) / b;
  return base(
    'proportion_cross',
    seed,
    `Найди x: ${a}/${b} = x/${d}.`,
    String(x),
    `Крайние/средние: ${a}·${d} = ${b}·x → x = ${x}. (Проверка: ${c}/${d} = ${a}/${b}.)`,
  );
}

function genIntegerOps(seed: number): GeneratedQuestion {
  const a = randInt(seed, -12, 12);
  const b = randInt(seed + 3, -12, 12);
  if (b === 0) return genIntegerOps(seed + 9);
  const ans = a - b;
  return base(
    'integer_ops',
    seed,
    `Вычисли: ${a} − (${b}).`,
    String(ans),
    `${a} − (${b}) = ${a} + (${-b}) = ${ans}.`,
  );
}

function genDecimals(seed: number): GeneratedQuestion {
  const a = randInt(seed, 11, 99) / 10;
  const mult = [10, 100, 1000][randInt(seed + 2, 0, 2)];
  const ans = Number((a * mult).toFixed(6));
  return base(
    'decimals_ops',
    seed,
    `Вычисли: ${a} · ${mult}.`,
    String(ans),
    `Умножение на ${mult} сдвигает запятую на ${String(mult).length - 1} знак(а) вправо.`,
  );
}

function genPowers(seed: number): GeneratedQuestion {
  const baseN = randInt(seed, 2, 5);
  const p = randInt(seed + 2, 2, 4);
  const q = randInt(seed + 4, 2, 4);
  const ans = baseN ** (p + q);
  return base(
    'powers_basic',
    seed,
    `Вычисли: ${baseN}^${p} · ${baseN}^${q}.`,
    String(ans),
    `При одном основании показатели складываются: ${baseN}^${p + q} = ${ans}.`,
  );
}

function genRoots(seed: number): GeneratedQuestion {
  const n = randInt(seed, 2, 12);
  const perfect = n * n;
  return base(
    'roots_domain',
    seed,
    `Вычисли √${perfect} (арифметический корень).`,
    String(n),
    `√${perfect} = ${n}, потому что ${n}² = ${perfect}. В ℝ под корнем ≥ 0.`,
  );
}

const GENERATORS: Record<MicroSkillId, (seed: number) => GeneratedQuestion> = {
  fractions_common_denom: genCommonDenom,
  fractions_multiply: genFracMul,
  fractions_divide: genFracDiv,
  percent_of: genPercent,
  negative_signs_brackets: genNegBrackets,
  linear_isolate_x: genLinearIsolate,
  linear_both_sides: genLinearBoth,
  proportion_cross: genProportion,
  integer_ops: genIntegerOps,
  decimals_ops: genDecimals,
  powers_basic: genPowers,
  roots_domain: genRoots,
};

export function generateQuestion(skillId: MicroSkillId, seed = pickSeed()): GeneratedQuestion {
  return GENERATORS[skillId](seed);
}

export function generateExam(
  skillIds: MicroSkillId[],
  count: number,
): GeneratedQuestion[] {
  const pool = skillIds.length ? skillIds : (Object.keys(GENERATORS) as MicroSkillId[]);
  const out: GeneratedQuestion[] = [];
  const used = new Set<string>();
  let guard = 0;
  while (out.length < count && guard < count * 20) {
    guard += 1;
    const skill = pool[out.length % pool.length];
    const q = generateQuestion(skill, pickSeed() + guard * 9973);
    if (used.has(q.prompt)) continue;
    used.add(q.prompt);
    out.push(q);
  }
  return out;
}
