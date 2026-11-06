import { allTopics, CURRICULUM } from '../../curriculum/index.ts';
import type { GradeId, Question } from '../../curriculum/types.ts';
import { bank, input, multi, single } from '../q.ts';

function hashTopic(topicId: string): number {
  let h = 0;
  for (let i = 0; i < topicId.length; i += 1) h = (h * 31 + topicId.charCodeAt(i)) >>> 0;
  return h;
}

/** Банк из вычислимых заданий: числа зависят от topicId, чтобы темы не копировали друг друга. */
function topicBank(topicId: string, title: string): { practice: Question[]; test: Question[] } {
  const tag = topicId;
  const h = hashTopic(topicId);
  const a = 3 + (h % 9);
  const b = 2 + ((h >> 3) % 8);
  const c = 4 + ((h >> 6) % 7);
  const d = 5 + ((h >> 9) % 6);

  const practice = bank(
    input({
      id: `${tag}-p1`,
      prompt: `«${title}»: вычисли ${a} + ${b}`,
      answer: String(a + b),
      explanation: `${a} + ${b} = ${a + b}.`,
      difficulty: 'легко',
    }),
    input({
      id: `${tag}-p2`,
      prompt: `Вычисли ${a} × ${b}`,
      answer: String(a * b),
      explanation: `${a} × ${b} = ${a * b}.`,
      difficulty: 'легко',
    }),
    input({
      id: `${tag}-p3`,
      prompt: `Вычисли ${a * b + c} − ${c}`,
      answer: String(a * b),
      explanation: `Сначала сумма в уме, затем вычитание: ответ ${a * b}.`,
      difficulty: 'средне',
    }),
    input({
      id: `${tag}-p4`,
      prompt: `Найди ${b}% от ${a * 20}`,
      answer: String((b * a * 20) / 100),
      explanation: `${b}% от ${a * 20} = ${(b * a * 20) / 100}.`,
      difficulty: 'средне',
    }),
    input({
      id: `${tag}-p5`,
      prompt: `Реши: x + ${a} = ${a + d}. Чему равен x?`,
      answer: String(d),
      explanation: `x = ${d}.`,
      difficulty: 'легко',
    }),
    input({
      id: `${tag}-p6`,
      prompt: `Реши: ${b}x = ${b * c}. x = ?`,
      answer: String(c),
      explanation: `x = ${c}.`,
      difficulty: 'легко',
    }),
    input({
      id: `${tag}-p7`,
      prompt: `Площадь прямоугольника ${a}×${d}`,
      answer: String(a * d),
      explanation: `S = ${a * d}.`,
      difficulty: 'легко',
    }),
    input({
      id: `${tag}-p8`,
      prompt: `Упрости дробь: ${b}/${b * 2} (как десятичную 0.?)`,
      answer: '0.5',
      explanation: `${b}/${b * 2} = 1/2 = 0,5.`,
      difficulty: 'средне',
    }),
    multi({
      id: `${tag}-p9`,
      prompt: 'Отметь верные равенства.',
      options: [`${a}+${a}=${2 * a}`, `${b}×0=0`, `${c}−${c}=1`, `${d}÷${d}=1`],
      answer: [`${a}+${a}=${2 * a}`, `${b}×0=0`, `${d}÷${d}=1`],
      explanation: `${c}−${c}=0, а не 1.`,
      difficulty: 'средне',
    }),
    input({
      id: `${tag}-p10`,
      prompt: `НОД(${a * 2}, ${a * 3})`,
      answer: String(a),
      explanation: `НОД(${a * 2}, ${a * 3}) = ${a}.`,
      difficulty: 'сложнее',
    }),
  );

  const test = bank(
    input({ id: `${tag}-t1`, prompt: `Тест «${title}»: ${a + 5} + ${b + 3}`, answer: String(a + b + 8), explanation: `${a + 5}+${b + 3}=${a + b + 8}.`, difficulty: 'легко' }),
    input({ id: `${tag}-t2`, prompt: `Вычисли ${c} × ${d}`, answer: String(c * d), explanation: `${c * d}.`, difficulty: 'легко' }),
    input({ id: `${tag}-t3`, prompt: `Вычисли ${(c * d) * b} ÷ ${b}`, answer: String(c * d), explanation: `${c * d}.`, difficulty: 'средне' }),
    input({ id: `${tag}-t4`, prompt: `10% от ${a * 50}`, answer: String(a * 5), explanation: `${a * 5}.`, difficulty: 'легко' }),
    input({ id: `${tag}-t5`, prompt: `Реши: ${a}x − ${a} = ${a * (b - 1)}. x = ?`, answer: String(b), explanation: `${a}(x−1)=${a * (b - 1)} → x−1=${b - 1} → x=${b}.`, difficulty: 'сложнее' }),
    input({ id: `${tag}-t6`, prompt: `Периметр квадрата со стороной ${c}`, answer: String(4 * c), explanation: `4×${c}=${4 * c}.`, difficulty: 'легко' }),
    input({ id: `${tag}-t7`, prompt: `Вычисли ${a}.5 + 0.5`, answer: String(a + 1), explanation: `${a}.5 + 0.5 = ${a + 1}.`, difficulty: 'легко' }),
    single({
      id: `${tag}-t8`,
      prompt: `В теме «${title}» верный подход — это…`,
      options: ['Опираться на определение и проверку', 'Угадывать без условия', 'Игнорировать знаки', 'Делить всегда на ноль'],
      answer: 'Опираться на определение и проверку',
      explanation: 'Смысл темы важнее заучивания одного примера.',
      difficulty: 'легко',
    }),
    input({ id: `${tag}-t9`, prompt: `Сумма углов ${30 + a}° и ${60 - (a % 5)}°`, answer: String(30 + a + 60 - (a % 5)), explanation: 'Складываем градусы.', difficulty: 'средне' }),
    input({ id: `${tag}-t10`, prompt: `Модуль числа −${a + d}`, answer: String(a + d), explanation: `|−${a + d}| = ${a + d}.`, difficulty: 'легко' }),
    input({ id: `${tag}-t11`, prompt: `Среднее арифметическое ${a} и ${a + 2 * b}`, answer: String(a + b), explanation: `(${a}+${a + 2 * b})/2 = ${a + b}.`, difficulty: 'средне' }),
    input({ id: `${tag}-t12`, prompt: `Сколько градусов в развёрнутом угле?`, answer: '180', explanation: '180°.', difficulty: 'легко' }),
  );

  return { practice, test };
}

/** Тематические оверрайды — более точные задания поверх общего шаблона. */
const SPECIAL: Record<string, { practice: Question[]; test: Question[] }> = {
  'g6-div-prime': {
    practice: bank(
      single({ id: 'g6dp-p1', prompt: 'Какое число простое?', options: ['21', '27', '29', '33'], answer: '29', explanation: '29 делится только на 1 и 29.', difficulty: 'средне' }),
      single({ id: 'g6dp-p2', prompt: 'Какое число составное?', options: ['2', '3', '5', '9'], answer: '9', explanation: '9 = 3×3.', difficulty: 'легко' }),
      input({ id: 'g6dp-p3', prompt: 'Разложи 12 на простые множители как произведение (например 2*2*3).', answer: '2*2*3', explanation: '12 = 2×2×3.', difficulty: 'средне' }),
      multi({ id: 'g6dp-p4', prompt: 'Выбери простые числа.', options: ['11', '15', '17', '21'], answer: ['11', '17'], explanation: '15 и 21 составные.', difficulty: 'средне' }),
      input({ id: 'g6dp-p5', prompt: 'Наименьшее простое число.', answer: '2', explanation: '2 — наименьшее и единственное чётное простое.', difficulty: 'легко' }),
      single({ id: 'g6dp-p6', prompt: '1 — это…', options: ['простое', 'составное', 'ни простое, ни составное', 'чётное простое'], answer: 'ни простое, ни составное', explanation: '1 не считают простым.', difficulty: 'средне' }),
      input({ id: 'g6dp-p7', prompt: 'Сколько простых чисел между 1 и 10?', answer: '4', explanation: '2,3,5,7 — четыре.', difficulty: 'средне' }),
      input({ id: 'g6dp-p8', prompt: 'Разложи 30: 2*3*?', answer: '5', explanation: '30=2×3×5.', difficulty: 'легко' }),
    ),
    test: bank(
      single({ id: 'g6dp-t1', prompt: 'Простое число:', options: ['25', '27', '31', '35'], answer: '31', explanation: '31 простое.', difficulty: 'средне' }),
      input({ id: 'g6dp-t2', prompt: 'Разложи 18 как 2*3*3', answer: '2*3*3', explanation: '18=2×3×3.', difficulty: 'средне' }),
      multi({ id: 'g6dp-t3', prompt: 'Составные числа:', options: ['4', '7', '8', '13'], answer: ['4', '8'], explanation: '7 и 13 простые.', difficulty: 'легко' }),
      input({ id: 'g6dp-t4', prompt: 'Следующее простое после 13.', answer: '17', explanation: '14,15,16 составные.', difficulty: 'средне' }),
      single({ id: 'g6dp-t5', prompt: 'Чётное простое число — только…', options: ['0', '1', '2', '4'], answer: '2', explanation: 'Единственное чётное простое — 2.', difficulty: 'легко' }),
      input({ id: 'g6dp-t6', prompt: 'Произведение простых множителей числа 20: 2*2*?', answer: '5', explanation: '20=2×2×5.', difficulty: 'средне' }),
      input({ id: 'g6dp-t7', prompt: 'Сколько делителей у простого числа?', answer: '2', explanation: '1 и само число.', difficulty: 'легко' }),
      single({ id: 'g6dp-t8', prompt: '15 — простое?', options: ['Да', 'Нет'], answer: 'Нет', explanation: '15=3×5.', difficulty: 'легко' }),
      input({ id: 'g6dp-t9', prompt: 'Наименьшее составное число.', answer: '4', explanation: '4=2×2.', difficulty: 'средне' }),
      input({ id: 'g6dp-t10', prompt: 'Разложи 42: 2*3*?', answer: '7', explanation: '42=2×3×7.', difficulty: 'средне' }),
    ),
  },
  'g6-rational-neg': {
    practice: bank(
      single({ id: 'g6rn-p1', prompt: 'Что больше: −3 или −1?', options: ['−3', '−1', 'Равны'], answer: '−1', explanation: '−1 правее на прямой.', difficulty: 'легко' }),
      input({ id: 'g6rn-p2', prompt: 'Вычисли: −5 + 8', answer: '3', explanation: '8 − 5 = 3.', difficulty: 'легко' }),
      input({ id: 'g6rn-p3', prompt: 'Вычисли: −4 + (−6)', answer: '-10', explanation: 'Сумма отрицательных.', difficulty: 'средне' }),
      input({ id: 'g6rn-p4', prompt: 'Модуль числа −7', answer: '7', explanation: '|−7|=7.', difficulty: 'легко' }),
      single({ id: 'g6rn-p5', prompt: '−2 … 0', options: ['>', '<', '='], answer: '<', explanation: 'Отрицательное меньше нуля.', difficulty: 'легко' }),
      input({ id: 'g6rn-p6', prompt: 'Вычисли: 3 − 10', answer: '-7', explanation: '3 − 10 = −7.', difficulty: 'легко' }),
      input({ id: 'g6rn-p7', prompt: 'Противоположное к 9', answer: '-9', explanation: '−9.', difficulty: 'легко' }),
      input({ id: 'g6rn-p8', prompt: '−12 + 12', answer: '0', explanation: 'Взаимно уничтожаются.', difficulty: 'легко' }),
    ),
    test: bank(
      input({ id: 'g6rn-t1', prompt: '−15 + 20', answer: '5', explanation: '5.', difficulty: 'легко' }),
      input({ id: 'g6rn-t2', prompt: '−8 − 5', answer: '-13', explanation: '−13.', difficulty: 'средне' }),
      single({ id: 'g6rn-t3', prompt: 'Наименьшее число:', options: ['−2', '−10', '0', '3'], answer: '−10', explanation: 'Дальше влево.', difficulty: 'легко' }),
      input({ id: 'g6rn-t4', prompt: '|−25|', answer: '25', explanation: '25.', difficulty: 'легко' }),
      input({ id: 'g6rn-t5', prompt: '−3 + (−7) + 4', answer: '-6', explanation: '−10 + 4 = −6.', difficulty: 'средне' }),
      single({ id: 'g6rn-t6', prompt: 'Верно ли: −0 = 0?', options: ['Да', 'Нет'], answer: 'Да', explanation: 'Ноль без знака.', difficulty: 'легко' }),
      input({ id: 'g6rn-t7', prompt: 'Расстояние между −4 и 6', answer: '10', explanation: '6−(−4)=10.', difficulty: 'средне' }),
      input({ id: 'g6rn-t8', prompt: '−1 × 1 (пока сложение): −1 + 1', answer: '0', explanation: '0.', difficulty: 'легко' }),
      input({ id: 'g6rn-t9', prompt: 'Противоположное к −11', answer: '11', explanation: '11.', difficulty: 'легко' }),
      input({ id: 'g6rn-t10', prompt: '5 + (−9)', answer: '-4', explanation: '−4.', difficulty: 'легко' }),
    ),
  },
  'g7-eq-linear': {
    practice: bank(
      input({ id: 'g7el-p1', prompt: 'Реши: x + 7 = 15', answer: '8', explanation: 'x = 8.', difficulty: 'легко' }),
      input({ id: 'g7el-p2', prompt: 'Реши: x − 4 = 11', answer: '15', explanation: 'x = 15.', difficulty: 'легко' }),
      input({ id: 'g7el-p3', prompt: 'Реши: 5x = 35', answer: '7', explanation: 'x = 7.', difficulty: 'легко' }),
      input({ id: 'g7el-p4', prompt: 'Реши: 2x + 3 = 11', answer: '4', explanation: '2x = 8, x = 4.', difficulty: 'средне' }),
      input({ id: 'g7el-p5', prompt: 'Реши: 3x − 6 = 9', answer: '5', explanation: '3x = 15, x = 5.', difficulty: 'средне' }),
      input({ id: 'g7el-p6', prompt: 'Реши: 10 − x = 3', answer: '7', explanation: 'x = 7.', difficulty: 'средне' }),
      input({ id: 'g7el-p7', prompt: 'Реши: x/2 = 6', answer: '12', explanation: 'x = 12.', difficulty: 'легко' }),
      input({ id: 'g7el-p8', prompt: 'Реши: 4x = 0', answer: '0', explanation: 'x = 0.', difficulty: 'легко' }),
    ),
    test: bank(
      input({ id: 'g7el-t1', prompt: 'x + 19 = 30', answer: '11', explanation: '11.', difficulty: 'легко' }),
      input({ id: 'g7el-t2', prompt: '7x = 56', answer: '8', explanation: '8.', difficulty: 'легко' }),
      input({ id: 'g7el-t3', prompt: '2x − 5 = 9', answer: '7', explanation: '2x=14, x=7.', difficulty: 'средне' }),
      input({ id: 'g7el-t4', prompt: '5x + 1 = 26', answer: '5', explanation: '5x=25.', difficulty: 'средне' }),
      input({ id: 'g7el-t5', prompt: '12 − 2x = 4', answer: '4', explanation: '2x=8, x=4.', difficulty: 'средне' }),
      input({ id: 'g7el-t6', prompt: 'x/5 = 3', answer: '15', explanation: '15.', difficulty: 'легко' }),
      input({ id: 'g7el-t7', prompt: '3(x + 2) = 18. Сначала x+2=6, x=?', answer: '4', explanation: 'x=4.', difficulty: 'сложнее' }),
      input({ id: 'g7el-t8', prompt: '6x − 6 = 0', answer: '1', explanation: 'x=1.', difficulty: 'легко' }),
      input({ id: 'g7el-t9', prompt: '9 + x = 9', answer: '0', explanation: 'x=0.', difficulty: 'легко' }),
      input({ id: 'g7el-t10', prompt: '4x + 8 = 24', answer: '4', explanation: '4x=16, x=4.', difficulty: 'средне' }),
    ),
  },
  'g8-quad-eq': {
    practice: bank(
      input({ id: 'g8qe-p1', prompt: 'Дискриминант x² − 5x + 6 = 0 (b²−4ac)', answer: '1', explanation: '25 − 24 = 1.', difficulty: 'средне' }),
      multi({ id: 'g8qe-p2', prompt: 'Корни x² − 5x + 6 = 0', options: ['2', '3', '5', '6'], answer: ['2', '3'], explanation: '(x−2)(x−3)=0.', difficulty: 'средне' }),
      input({ id: 'g8qe-p3', prompt: 'Сумма корней x² − 5x + 6 = 0 (Виета)', answer: '5', explanation: 'Сумма = −b/a = 5.', difficulty: 'средне' }),
      input({ id: 'g8qe-p4', prompt: 'Произведение корней x² − 5x + 6 = 0', answer: '6', explanation: 'Произведение = c/a.', difficulty: 'средне' }),
      single({ id: 'g8qe-p5', prompt: 'Если D < 0, то…', options: ['2 корня', '1 корень', 'нет действительных корней', 'бесконечно много'], answer: 'нет действительных корней', explanation: 'Отрицательный дискриминант.', difficulty: 'легко' }),
      input({ id: 'g8qe-p6', prompt: 'Корень x² = 49 (положительный)', answer: '7', explanation: 'x=7 или x=−7; здесь положительный.', difficulty: 'легко' }),
      input({ id: 'g8qe-p7', prompt: 'D для x² + 2x + 1 = 0', answer: '0', explanation: '4−4=0.', difficulty: 'легко' }),
      input({ id: 'g8qe-p8', prompt: 'Единственный корень (x+1)²=0', answer: '-1', explanation: 'x=−1.', difficulty: 'средне' }),
    ),
    test: bank(
      input({ id: 'g8qe-t1', prompt: 'D для x² − 4x + 3 = 0', answer: '4', explanation: '16−12=4.', difficulty: 'средне' }),
      multi({ id: 'g8qe-t2', prompt: 'Корни x² − 4x + 3 = 0', options: ['1', '2', '3', '4'], answer: ['1', '3'], explanation: '(x−1)(x−3).', difficulty: 'средне' }),
      input({ id: 'g8qe-t3', prompt: 'Сумма корней x² − 4x + 3', answer: '4', explanation: 'Виета.', difficulty: 'средне' }),
      input({ id: 'g8qe-t4', prompt: 'Произведение корней x² − 4x + 3', answer: '3', explanation: 'Виета.', difficulty: 'средне' }),
      input({ id: 'g8qe-t5', prompt: 'Положительный корень x² − 9 = 0', answer: '3', explanation: 'x=±3.', difficulty: 'легко' }),
      single({ id: 'g8qe-t6', prompt: 'D=0 означает…', options: ['нет корней', 'один корень', 'два разных', 'три корня'], answer: 'один корень', explanation: 'Кратный корень.', difficulty: 'легко' }),
      input({ id: 'g8qe-t7', prompt: 'D для x² + x + 1 = 0', answer: '-3', explanation: '1−4=−3.', difficulty: 'средне' }),
      input({ id: 'g8qe-t8', prompt: 'Больший корень x² − 5x + 6 = 0', answer: '3', explanation: 'Корни 2 и 3.', difficulty: 'легко' }),
      input({ id: 'g8qe-t9', prompt: 'x² = 0. Корень?', answer: '0', explanation: 'x=0.', difficulty: 'легко' }),
      input({ id: 'g8qe-t10', prompt: 'Свободный член в x² − 3x + 2', answer: '2', explanation: 'c = 2.', difficulty: 'легко' }),
    ),
  },
  'g9-prog-arith': {
    practice: bank(
      input({ id: 'g9pa-p1', prompt: 'Разность арифметической прогрессии 2,5,8,…', answer: '3', explanation: '5−2=3.', difficulty: 'легко' }),
      input({ id: 'g9pa-p2', prompt: 'a₁=3, d=2. Найди a₄', answer: '9', explanation: 'aₙ=a₁+(n−1)d → 3+6=9.', difficulty: 'средне' }),
      input({ id: 'g9pa-p3', prompt: 'Сумма первых 3 членов: 1+3+5', answer: '9', explanation: '9.', difficulty: 'легко' }),
      input({ id: 'g9pa-p4', prompt: 'a₁=10, d=−2, a₃=?', answer: '6', explanation: '10−2−2=6.', difficulty: 'средне' }),
      single({ id: 'g9pa-p5', prompt: 'В арифметической прогрессии каждый член…', options: ['умножается на одно число', 'получается прибавлением одного и того же', 'всегда равен 0', 'простой'], answer: 'получается прибавлением одного и того же', explanation: 'Общая разность d.', difficulty: 'легко' }),
      input({ id: 'g9pa-p6', prompt: 'Сколько членов в 2,4,6,8,10?', answer: '5', explanation: 'Пять членов.', difficulty: 'легко' }),
      input({ id: 'g9pa-p7', prompt: 'a₁=1, a₂=1? Нет: 1,4,7 — d?', answer: '3', explanation: 'd=3.', difficulty: 'легко' }),
      input({ id: 'g9pa-p8', prompt: 'a₅ при a₁=5, d=5', answer: '25', explanation: '5+4×5=25.', difficulty: 'средне' }),
    ),
    test: bank(
      input({ id: 'g9pa-t1', prompt: 'd для 7,10,13', answer: '3', explanation: '3.', difficulty: 'легко' }),
      input({ id: 'g9pa-t2', prompt: 'a₁=2, d=4, a₅', answer: '18', explanation: '2+16=18.', difficulty: 'средне' }),
      input({ id: 'g9pa-t3', prompt: 'Сумма 1+2+3+4+5', answer: '15', explanation: '15.', difficulty: 'легко' }),
      input({ id: 'g9pa-t4', prompt: 'aₙ=a₁+(n−1)d. a₁=4,d=3,n=3 → a₃', answer: '10', explanation: '4+6=10.', difficulty: 'средне' }),
      input({ id: 'g9pa-t5', prompt: 'Средний член между 4 и 10 в арифм. прогрессии из 3 членов', answer: '7', explanation: '(4+10)/2=7.', difficulty: 'средне' }),
      input({ id: 'g9pa-t6', prompt: 'd для 20,15,10', answer: '-5', explanation: 'Убывающая.', difficulty: 'легко' }),
      input({ id: 'g9pa-t7', prompt: 'a₁₀ при a₁=1, d=1', answer: '10', explanation: 'Натуральный ряд.', difficulty: 'легко' }),
      input({ id: 'g9pa-t8', prompt: 'Сумма первых n: n(a₁+aₙ)/2. Для 1..10 сумма?', answer: '55', explanation: '10×11/2=55.', difficulty: 'сложнее' }),
      input({ id: 'g9pa-t9', prompt: 'Третий член 5,8,?', answer: '11', explanation: 'd=3.', difficulty: 'легко' }),
      input({ id: 'g9pa-t10', prompt: 'a₁=0, d=7, a₄', answer: '21', explanation: '0+21=21.', difficulty: 'средне' }),
    ),
  },
  'g9-quad-func': {
    practice: bank(
      single({ id: 'g9qf-p1', prompt: 'График y=x² — это…', options: ['прямая', 'парабола', 'окружность', 'гипербола'], answer: 'парабола', explanation: 'Квадратичная функция.', difficulty: 'легко' }),
      single({ id: 'g9qf-p2', prompt: 'При a>0 ветви параболы…', options: ['вверх', 'вниз', 'влево', 'вправо'], answer: 'вверх', explanation: 'Знак a задаёт направление.', difficulty: 'легко' }),
      input({ id: 'g9qf-p3', prompt: 'Вершина y=x²+4 по оси y (x=0). y=?', answer: '4', explanation: 'В (0;4).', difficulty: 'средне' }),
      input({ id: 'g9qf-p4', prompt: 'y=x² при x=3', answer: '9', explanation: '9.', difficulty: 'легко' }),
      input({ id: 'g9qf-p5', prompt: 'y=(x−2)² сдвиг вершины по x на…', answer: '2', explanation: 'Вершина в x=2.', difficulty: 'средне' }),
      single({ id: 'g9qf-p6', prompt: 'Ось симметрии y=x²', options: ['y=0', 'x=0', 'y=x', 'x=1'], answer: 'x=0', explanation: 'Ось ординат.', difficulty: 'легко' }),
      input({ id: 'g9qf-p7', prompt: 'y=−x² при x=2', answer: '-4', explanation: '−4.', difficulty: 'легко' }),
      input({ id: 'g9qf-p8', prompt: 'Свободный член в y=x²−3x+5', answer: '5', explanation: 'c=5 — пересечение с Oy.', difficulty: 'средне' }),
    ),
    test: bank(
      single({ id: 'g9qf-t1', prompt: 'При a<0 ветви…', options: ['вверх', 'вниз', 'горизонтально', 'исчезают'], answer: 'вниз', explanation: 'Вниз.', difficulty: 'легко' }),
      input({ id: 'g9qf-t2', prompt: 'y=x²−1 при x=0', answer: '-1', explanation: '−1.', difficulty: 'легко' }),
      input({ id: 'g9qf-t3', prompt: 'y=2x² при x=−1', answer: '2', explanation: '2.', difficulty: 'легко' }),
      input({ id: 'g9qf-t4', prompt: 'Координата x вершины y=x²−6x+5: x=−b/(2a)', answer: '3', explanation: '6/2=3.', difficulty: 'сложнее' }),
      single({ id: 'g9qf-t5', prompt: 'Точка (0;c) — это…', options: ['вершина всегда', 'пересечение с Oy', 'пересечение с Ox', 'фокус'], answer: 'пересечение с Oy', explanation: 'При x=0, y=c.', difficulty: 'средне' }),
      input({ id: 'g9qf-t6', prompt: 'y=(x+1)² при x=−1', answer: '0', explanation: 'Вершина.', difficulty: 'средне' }),
      input({ id: 'g9qf-t7', prompt: 'y=x²+x при x=1', answer: '2', explanation: '1+1=2.', difficulty: 'легко' }),
      input({ id: 'g9qf-t8', prompt: 'Сколько пересечений y=x²+1 с осью Ox?', answer: '0', explanation: 'Всегда ≥1.', difficulty: 'средне' }),
      input({ id: 'g9qf-t9', prompt: 'y=x² при x=−5', answer: '25', explanation: '25.', difficulty: 'легко' }),
      single({ id: 'g9qf-t10', prompt: 'Коэффициент a влияет на…', options: ['только цвет графика', 'растяжение и направление ветвей', 'только целую часть', 'ничего'], answer: 'растяжение и направление ветвей', explanation: 'Форма параболы.', difficulty: 'средне' }),
    ),
  },
};

export function buildAllQuestionBanks(
  authored: Record<string, { practice: Question[]; test: Question[] }>,
): Record<string, { practice: Question[]; test: Question[] }> {
  const result: Record<string, { practice: Question[]; test: Question[] }> = { ...authored };

  for (const grade of CURRICULUM) {
    for (const topic of allTopics(grade.id)) {
      if (result[topic.id]) continue;
      if (SPECIAL[topic.id]) {
        result[topic.id] = SPECIAL[topic.id];
        continue;
      }
      result[topic.id] = topicBank(topic.id, topic.title);
    }
  }

  return result;
}

export function listTopicsWithoutAuthored(
  authored: Record<string, { practice: Question[]; test: Question[] }>,
  grade?: GradeId,
): string[] {
  const grades = grade ? CURRICULUM.filter((g) => g.id === grade) : CURRICULUM;
  return grades.flatMap((g) => allTopics(g.id).filter((t) => !authored[t.id]).map((t) => t.id));
}
