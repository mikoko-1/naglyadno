/**
 * Провайдер Сократа.
 * Локальная эмуляция: помогает решать по шагам простым языком.
 * Для API: createApiSocraticProvider(...) + setSocraticProvider(...).
 */

import { toPlainMath } from './plainMath.ts';

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  at: string;
};

export type SocraticRequest = {
  history: ChatMessage[];
  userMessage: string;
  contextNote?: string;
};

export type SocraticProvider = {
  ask: (req: SocraticRequest) => Promise<string>;
};

const SYSTEM_RULES = `
Ты — Сократ, спокойный помощник по математике для школьников 5–9 класса.

ЯЗЫК (самое важное):
- Говори ОЧЕНЬ просто, как живому человеку в чате, а не как учебник.
- Короткие фразы. Обычные слова. Без пафоса и «умных» оборотов.
- Нельзя: «следовательно», «таким образом», «рассмотрим», «данное выражение», «осуществим преобразование», «необходимо отметить».
- Можно: «смотри», «сначала», «потом», «получается», «давай так».
- Если термин сложный — сразу поясни своими словами в скобках.

КАК ОБЪЯСНЯТЬ:
- Один шаг за раз. Потом спроси или предложи следующий.
- Показывай конкретные числа и действия, не абстрактную теорию.
- Можно довести до ответа, но сначала путь: что делаем и зачем одной фразой.
- Если ошибка — мягко: «тут чуть съехало» + как поправить. Без стыда.
- В конце можно одна проверка подстановкой, коротко.

ФОРМАТ:
- 2–6 коротких предложений или маленькие шаги 1) 2) 3).
- Не пиши длинные абзацы. Не читай лекцию.
- НИКОГДА не пиши LaTeX и Markdown-формулы: нельзя $...$, \\frac, \\times, \\( \\).
- Дроби только так: 1/2, 3/4. Умножение: · или ×. Корень: √9 или корень из 9.
`.trim();

function uid(): string {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createMessage(role: ChatRole, content: string): ChatMessage {
  return { id: uid(), role, content, at: new Date().toISOString() };
}

function lastUserTask(history: ChatMessage[], current: string): string {
  const fromHistory = [...history]
    .reverse()
    .find((m) => m.role === 'user' && /[=x]|дроби|√|%|скоб/i.test(m.content));
  return fromHistory?.content ?? current;
}

function parseLinear(text: string): { a: number; b: number; c: number } | null {
  // ax + b = c  или  ax - b = c
  const m = text.replace(/\s/g, '').match(/^(-?\d*)x([+-]\d+)=(-?\d+)$/i);
  if (!m) return null;
  const a = m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
  const b = Number(m[2]);
  const c = Number(m[3]);
  if (![a, b, c].every(Number.isFinite) || a === 0) return null;
  return { a, b, c };
}

function parseAxEquals(text: string): { a: number; c: number } | null {
  const m = text.replace(/\s/g, '').match(/^(-?\d*)x=(-?\d+)$/i);
  if (!m) return null;
  const a = m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
  const c = Number(m[2]);
  if (![a, c].every(Number.isFinite) || a === 0) return null;
  return { a, c };
}

function helpLinear(a: number, b: number, c: number, stage: 'start' | 'deeper'): string {
  const right = c - b;
  const x = right / a;
  const move =
    b > 0
      ? `Сначала убираем +${b}: вычитаем ${b} с обеих сторон.`
      : `Сначала убираем ${b}: прибавляем ${-b} с обеих сторон.`;

  if (stage === 'start') {
    return `${move} Получится ${a}x = ${right}. Теперь раздели обе части на ${a} — и найдёшь x. Попробуй посчитать: сколько будет ${right} ÷ ${a}?`;
  }

  const nice = Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/\.?0+$/, '');
  return `Ок, доводим до конца. ${a}x = ${right}, делим на ${a}: x = ${nice}. Проверка: ${a}·(${nice}) + (${b}) = ${a * x + b}. Сошлось с ${c} — значит всё верно.`;
}

function helpAx(a: number, c: number): string {
  const x = c / a;
  const nice = Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/\.?0+$/, '');
  return `Тут уже почти готово: ${a}x = ${c}. Делим обе части на ${a}. Получается x = ${nice}. Можешь подставить обратно и глянуть, что слева и справа одинаково.`;
}

function wantsFullAnswer(lower: string): boolean {
  return /не знаю|подскаж|помоги|реш[иь]|ответ|сколько|дай|не понима|дальше|и что|ну и|скажи/i.test(
    lower,
  );
}

function countAssistantHints(history: ChatMessage[]): number {
  return history.filter((m) => m.role === 'assistant').length;
}

/** Простые ответы локального Сократа. */
function mockReply(userMessage: string, history: ChatMessage[], contextNote?: string): string {
  const text = userMessage.trim();
  const lower = text.toLowerCase();
  const task = lastUserTask(history, text);
  const deep = wantsFullAnswer(lower) || countAssistantHints(history) >= 2;

  if (contextNote && /ошиб|контрол|пробел|слабые/i.test(contextNote + text)) {
    return `Ок, разберём спокойно. ${contextNote.split('.')[0]}. Напиши одну задачу из списка — я покажу первый шаг простыми словами, а потом вместе дойдём до ответа.`;
  }

  const linear = parseLinear(task.replace(/\s/g, '')) ?? parseLinear(text.replace(/\s/g, ''));
  if (linear) {
    return helpLinear(linear.a, linear.b, linear.c, deep ? 'deeper' : 'start');
  }

  // Более свободный ввод: "2x + 6 = 14"
  const loose = text.match(/(-?\d*)\s*x\s*([+-]\s*\d+)\s*=\s*(-?\d+)/i);
  if (loose) {
    const a = loose[1] === '' || loose[1] === '+' ? 1 : loose[1] === '-' ? -1 : Number(loose[1]);
    const b = Number(loose[2].replace(/\s/g, ''));
    const c = Number(loose[3]);
    if (Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(c) && a !== 0) {
      return helpLinear(a, b, c, deep ? 'deeper' : 'start');
    }
  }

  const ax = parseAxEquals(task.replace(/\s/g, '')) ?? parseAxEquals(text.replace(/\s/g, ''));
  if (ax) return helpAx(ax.a, ax.c);

  const axLoose = text.match(/(-?\d*)\s*x\s*=\s*(-?\d+)/i);
  if (axLoose && !/[+-]/.test(text.replace(/\s/g, '').replace(/x.*/, ''))) {
    const a = axLoose[1] === '' || axLoose[1] === '+' ? 1 : axLoose[1] === '-' ? -1 : Number(axLoose[1]);
    const c = Number(axLoose[2]);
    if (Number.isFinite(a) && Number.isFinite(c) && a !== 0) return helpAx(a, c);
  }

  // Дроби a/b + c/d
  const fracAdd = text.match(/(\d+)\s*\/\s*(\d+)\s*[+]\s*(\d+)\s*\/\s*(\d+)/);
  if (fracAdd) {
    const a = Number(fracAdd[1]);
    const b = Number(fracAdd[2]);
    const c = Number(fracAdd[3]);
    const d = Number(fracAdd[4]);
    const den = b * d;
    const num = a * d + c * b;
    if (deep) {
      return `Складываем ${a}/${b} и ${c}/${d}. Общий знаменатель ${den}: получается ${a * d}/${den} + ${c * b}/${den} = ${num}/${den}. Если надо — сократи дробь.`;
    }
    return `Чтобы сложить ${a}/${b} и ${c}/${d}, сначала сделай одинаковые знаменатели. Удобный общий — ${den}. Тогда первая дробь станет ${a * d}/${den}, вторая — ${c * b}/${den}. Сложи числители — и готово.`;
  }

  if (/дроби|\/|÷/i.test(text) && /[+]/.test(text)) {
    return 'Тут про дроби. Сначала уравняй знаменатели (найди общее число, на которое делятся оба). Потом сложи только числители. Напиши сами дроби — посчитаю с тобой.';
  }

  if (/дроби|÷|деление/i.test(lower) || /÷/.test(text)) {
    return 'Деление дробей — это умножение на перевёрнутую вторую дробь. Пример мысли: a/b ÷ c/d = a/b · d/c. Напиши свои числа — пройдём вместе.';
  }

  const pct = text.match(/(\d+)\s*%\s*(от)?\s*(\d+)/i) || text.match(/(\d+)\s*%\s+от\s+(\d+)/i);
  if (pct || /%|процент/i.test(lower)) {
    if (pct) {
      const p = Number(pct[1]);
      const n = Number(pct[3] ?? pct[2]);
      if (Number.isFinite(p) && Number.isFinite(n)) {
        const ans = (p / 100) * n;
        return `${p}% — это ${p} сотых. Берём ${n} · ${p}/100 = ${ans}. Коротко: раздели ${n} на 100 и умножь на ${p}.`;
      }
    }
    return 'Процент — это «из сотни». Чтобы найти n% от числа, умножь число на n и раздели на 100. Напиши «30% от 80» — разберём.';
  }

  if (/скобк|−\s*\(|-\(/i.test(text) || text.includes('-(')) {
    const sample = text.match(/−?\(([^)]+)\)/);
    if (sample) {
      return `Минус перед скобкой меняет все знаки внутри. Было: −(${sample[1]}). Представь, что у каждого слагаемого знак «переворачивается». Напиши, что получилось после раскрытия — проверю.`;
    }
    return 'Минус перед скобкой = все знаки внутри меняются на противоположные. Напиши выражение целиком — раскроем вместе.';
  }

  if (/корень|√|sqrt/i.test(lower)) {
    const root = text.match(/√\s*(-?\d+(?:\.\d+)?)|sqrt\s*\(\s*(-?\d+(?:\.\d+)?)\s*\)/i);
    const n = root ? Number(root[1] ?? root[2]) : NaN;
    if (Number.isFinite(n)) {
      if (n < 0) {
        return `√(${n}) на обычной числовой прямой нет: под корнем отрицательное. В комплексных это ${Math.sqrt(-n)}i. Если нужно школьное решение — пишем «не определено в действительных».`;
      }
      const r = Math.sqrt(n);
      const nice = Number.isInteger(r) ? String(r) : r.toFixed(3).replace(/\.?0+$/, '');
      return `√${n} = ${nice}, потому что ${nice}·${nice} = ${n}. Если сомневаешься — всегда проверяй умножением.`;
    }
    return 'Корень — «какое число в квадрате даст это». Если под корнем минус — в обычных числах ответа нет. Напиши выражение — разберём.';
  }

  if (/ошиб|неверно|не получи|не сходит|не то/i.test(lower)) {
    return 'Бывает. Давай проверим: подставь свой ответ обратно в условие. Если слева и справа разные числа — шагнем на шаг назад и найдём, где съехало. Напиши уравнение и что у тебя вышло.';
  }

  if (/привет|здравств|хай|hello/i.test(lower)) {
    return 'Привет! Кидай задачу — разберём по шагам, без занудства.';
  }

  if (text.length < 3) {
    return 'Напиши задачу целиком, например: 2x + 6 = 14. Я подскажу шаги простыми словами.';
  }

  if (contextNote) {
    return `Ок, понял тему. ${contextNote.split('.')[0]}. Скинь конкретный пример числами — сразу покажу, что делать первым.`;
  }

  return `Давай разберём. Напиши задачу как есть (например «2x+6=14» или «1/2+1/3»). Я объясню шаг за шагом простым языком и помогу дойти до ответа.`;
}

export function createMockSocraticProvider(): SocraticProvider {
  return {
    async ask({ userMessage, history, contextNote }) {
      await new Promise((r) => setTimeout(r, 280 + Math.random() * 320));
      void SYSTEM_RULES;
      return toPlainMath(mockReply(userMessage, history, contextNote));
    },
  };
}

export function createApiSocraticProvider(
  apiAsk: (payload: {
    system: string;
    history: ChatMessage[];
    userMessage: string;
    contextNote?: string;
  }) => Promise<string>,
): SocraticProvider {
  return {
    async ask(req) {
      const raw = await apiAsk({
        system: SYSTEM_RULES,
        history: req.history,
        userMessage: req.userMessage,
        contextNote: req.contextNote,
      });
      return toPlainMath(raw);
    },
  };
}

let activeProvider: SocraticProvider = createMockSocraticProvider();

export function getSocraticProvider(): SocraticProvider {
  return activeProvider;
}

export function setSocraticProvider(provider: SocraticProvider) {
  activeProvider = provider;
}

export { SYSTEM_RULES };
