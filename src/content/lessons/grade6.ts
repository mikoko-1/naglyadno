import type { Lesson } from '../../curriculum/types.ts';
import { input, single } from '../q.ts';

function lesson(topicId: string, steps: Lesson['steps']): Lesson {
  return { topicId, steps };
}

export const grade6Lessons: Record<string, Lesson> = {
  'g6-div-prime': lesson('g6-div-prime', [
    {
      id: 'g6dp-story',
      kind: 'interact',
      title: 'Детектив чисел',
      interact: {
        type: 'story',
        scene: 'Число 1 иногда называют «почти простым», потому что делится только на себя.',
        prompt: 'Это правда?',
        options: [
          {
            id: 'a',
            label: 'Нет: у простого ровно два делителя, у 1 — один',
            correct: true,
            feedback: 'Верно. 1 не простое и не составное.',
          },
          {
            id: 'b',
            label: 'Да, 1 — самое маленькое простое',
            correct: false,
            feedback: 'Самое маленькое простое — 2.',
          },
        ],
      },
    },
    {
      id: 'g6dp-c1',
      kind: 'concept',
      title: 'Простые и составные',
      body: 'Простое: ровно два делителя (1 и само). Составное: есть ещё делители. Разложение на простые — «паспорт» числа.',
    },
    {
      id: 'g6dp-sort',
      kind: 'interact',
      title: 'Разложи 60',
      interact: {
        type: 'sort-steps',
        prompt: 'Собери разложение 60',
        items: ['60 = 2 × 30', '30 = 2 × 15', '15 = 3 × 5', 'Итого 2×2×3×5'],
        correctOrder: ['60 = 2 × 30', '30 = 2 × 15', '15 = 3 × 5', 'Итого 2×2×3×5'],
        explanation: 'Делим на простые, пока не останутся только простые множители.',
      },
    },
    {
      id: 'g6dp-spot',
      kind: 'interact',
      title: 'Ловушка',
      interact: {
        type: 'spot-error',
        prompt: 'Где ошибка в списке простых?',
        lines: ['2 — простое', '9 — простое', '11 — простое', '9 = 3×3, составное'],
        wrongIndex: 1,
        explanation: '9 составное.',
      },
    },
    {
      id: 'g6dp-try',
      kind: 'try',
      title: 'Проверка',
      question: single({
        id: 'g6dp-try1',
        prompt: 'Какое число простое?',
        options: ['21', '27', '29', '33'],
        answer: '29',
        explanation: '29 не делится ни на что, кроме 1 и 29.',
        difficulty: 'средне',
      }),
    },
    {
      id: 'g6dp-s',
      kind: 'summary',
      title: 'Запомни',
      body: 'Простое = два делителя. 1 — особое. 2 — единственное чётное простое.',
    },
  ]),

  'g6-div-gcd-lcm': lesson('g6-div-gcd-lcm', [
    {
      id: 'g6gl-c1',
      kind: 'concept',
      title: 'НОД и НОК',
      body: 'НОД — наибольшая общая мера. НОК — самый ранний общий кратный. Часто НОД×НОК = произведение чисел (для двух чисел).',
    },
    {
      id: 'g6gl-bar',
      kind: 'interact',
      title: 'НОД(12, 18)',
      interact: {
        type: 'bar-set',
        prompt: 'Выставь НОД(12, 18)',
        max: 18,
        step: 1,
        target: 6,
        success: 'Общие делители 1, 2, 3, 6 → НОД = 6.',
      },
    },
    {
      id: 'g6gl-story',
      kind: 'interact',
      title: 'Плитка',
      interact: {
        type: 'story',
        scene: 'Нужно нарезать квадраты максимального размера из прямоугольника 12×18 без остатка.',
        prompt: 'Какой смысл у стороны квадрата?',
        options: [
          {
            id: 'a',
            label: 'НОД(12, 18) = 6',
            correct: true,
            feedback: 'Да: общая наибольшая мера сторон.',
          },
          {
            id: 'b',
            label: 'НОК(12, 18) = 36',
            correct: false,
            feedback: 'НОК — про общий срок/кратное, не про нарезку квадратов.',
          },
        ],
      },
    },
    {
      id: 'g6gl-spot',
      kind: 'interact',
      title: 'Перепутали',
      interact: {
        type: 'spot-error',
        prompt: 'НОК(4, 6). Где сбой?',
        lines: ['Кратные 4: 4, 8, 12, 16…', 'Кратные 6: 6, 12, 18…', 'НОК = 4', 'Верный НОК = 12'],
        wrongIndex: 2,
        explanation: '4 не кратно 6. Общее наименьшее — 12.',
      },
    },
    {
      id: 'g6gl-try',
      kind: 'try',
      title: 'Счёт',
      question: input({
        id: 'g6gl-try1',
        prompt: 'НОК(3, 5)',
        answer: '15',
        explanation: '3 и 5 взаимно простые → НОК = 15.',
        difficulty: 'легко',
      }),
    },
    {
      id: 'g6gl-s',
      kind: 'summary',
      title: 'Запомни',
      body: 'Задача на «общую меру» → НОД. На «общий срок» → НОК.',
    },
  ]),

  'g6-frac-ops': lesson('g6-frac-ops', [
    {
      id: 'g6fo-c1',
      kind: 'concept',
      title: 'Умножение дробей',
      body: 'Числитель × числитель, знаменатель × знаменатель. Перед этим удобно сокращать крест-накрест.',
      visual: 'pie',
    },
    {
      id: 'g6fo-pie',
      kind: 'interact',
      title: 'Половина от 2/3',
      body: '1/2 × 2/3 = 2/6 = 1/3. Покажи результат.',
      interact: {
        type: 'pie-tap',
        prompt: 'Зажги 1 дольку из 3',
        denominator: 3,
        targetNumerator: 1,
        success: 'Да: половина от двух третей — одна треть.',
      },
    },
    {
      id: 'g6fo-sort',
      kind: 'interact',
      title: 'Деление',
      interact: {
        type: 'sort-steps',
        prompt: 'Как разделить 2/5 ÷ 3/4',
        items: ['Перевернуть вторую: 4/3', 'Умножить: 2/5 × 4/3', 'Получить 8/15', 'Проверить смысл'],
        correctOrder: ['Перевернуть вторую: 4/3', 'Умножить: 2/5 × 4/3', 'Получить 8/15', 'Проверить смысл'],
        explanation: 'Деление на дробь = умножение на обратную.',
      },
    },
    {
      id: 'g6fo-spot',
      kind: 'interact',
      title: 'Ошибка сокращения',
      interact: {
        type: 'spot-error',
        prompt: 'Считают 2/3 × 3/4. Где ошибка?',
        lines: ['Сократили тройки', 'Осталось 2/1 × 1/4', 'Ответ 2/4 = 1/2', 'Кто-то написал 2/3 × 3/4 = 6/7'],
        wrongIndex: 3,
        explanation: 'Нельзя складывать «крест» как попало. Верно 1/2.',
      },
    },
    {
      id: 'g6fo-try',
      kind: 'try',
      title: 'Счёт',
      question: input({
        id: 'g6fo-try1',
        prompt: '1/2 × 3/5 (ответ a/b)',
        answer: '3/10',
        explanation: '1×3 / 2×5 = 3/10.',
        difficulty: 'легко',
      }),
    },
    {
      id: 'g6fo-s',
      kind: 'summary',
      title: 'Запомни',
      body: '× — прямо. ÷ — перевернуть вторую и умножить. Сокращай заранее.',
    },
  ]),

  'g6-frac-mixed': lesson('g6-frac-mixed', [
    {
      id: 'g6fm-c1',
      kind: 'concept',
      title: 'Смешанное число',
      body: '2 1/3 = 2 + 1/3. В неправильную: 2×3+1 = 7 → 7/3. Обратно: 7÷3 = 2 остаток 1 → 2 1/3.',
    },
    {
      id: 'g6fm-bar',
      kind: 'interact',
      title: 'Числитель для 2 1/4',
      interact: {
        type: 'bar-set',
        prompt: 'Какой числитель у неправильной дроби для 2 1/4?',
        max: 12,
        step: 1,
        target: 9,
        success: '2×4+1=9 → 9/4.',
      },
    },
    {
      id: 'g6fm-sort',
      kind: 'interact',
      title: 'Туда и обратно',
      interact: {
        type: 'sort-steps',
        prompt: 'Переведи 11/5 в смешанное',
        items: ['11 ÷ 5 = 2', 'Остаток 1', 'Знаменатель 5', 'Ответ 2 1/5'],
        correctOrder: ['11 ÷ 5 = 2', 'Остаток 1', 'Знаменатель 5', 'Ответ 2 1/5'],
        explanation: 'Целая часть — частное, дробная — остаток / знаменатель.',
      },
    },
    {
      id: 'g6fm-spot',
      kind: 'interact',
      title: 'Ошибка перевода',
      interact: {
        type: 'spot-error',
        prompt: '3 2/5 → ?',
        lines: ['3 × 5 = 15', '15 + 2 = 17', 'Знаменатель 5 → 17/5', 'Кто-то написал 3×2+5=11'],
        wrongIndex: 3,
        explanation: 'Формула: целое×знаменатель + числитель.',
      },
    },
    {
      id: 'g6fm-try',
      kind: 'try',
      title: 'Проверка',
      question: input({
        id: 'g6fm-try1',
        prompt: '1 1/2 как неправильная (a/b)',
        answer: '3/2',
        explanation: '1×2+1=3 → 3/2.',
        difficulty: 'легко',
      }),
    },
    {
      id: 'g6fm-s',
      kind: 'summary',
      title: 'Запомни',
      body: 'Туда: целое×низ + верх. Обратно: деление с остатком.',
    },
  ]),

  'g6-dec-ops': lesson('g6-dec-ops', [
    {
      id: 'g6do-c1',
      kind: 'concept',
      title: 'Все действия с десятичными',
      body: '+/− — столбик по запятой. × — сумма знаков. ÷ — сделай делитель целым одинаковым сдвигом.',
    },
    {
      id: 'g6do-story',
      kind: 'interact',
      title: 'Касса',
      interact: {
        type: 'story',
        scene: 'Товар 7 ₽, с карты списали 0,07 ₽ комиссии… шутка. Реально: 7 − 0,07.',
        prompt: 'Чему равно 7 − 0,07?',
        options: [
          {
            id: 'a',
            label: '6,93',
            correct: true,
            feedback: '7,00 − 0,07 = 6,93.',
          },
          {
            id: 'b',
            label: '7,07',
            correct: false,
            feedback: 'Это было бы сложение.',
          },
          {
            id: 'c',
            label: '6,07',
            correct: false,
            feedback: 'Слишком сильно «срезали» целую часть.',
          },
        ],
      },
    },
    {
      id: 'g6do-spot',
      kind: 'interact',
      title: 'Деление',
      interact: {
        type: 'spot-error',
        prompt: '4,8 ÷ 0,2. Где ошибка?',
        lines: [
          'Сдвиг на 1 знак: 48 ÷ 2',
          '48 ÷ 2 = 24',
          'Ответ 0,24',
          'Запятую у обоих сдвигаем одинаково — ответ 24',
        ],
        wrongIndex: 2,
        explanation: 'После сдвига делим целые: 48÷2=24.',
      },
    },
    {
      id: 'g6do-line',
      kind: 'interact',
      title: 'Прикидка произведения',
      interact: {
        type: 'line-pick',
        prompt: 'Примерно где 0.5 × 3?',
        min: 0,
        max: 3,
        step: 0.5,
        target: 1.5,
        success: 'Половина от трёх — 1,5.',
      },
    },
    {
      id: 'g6do-try',
      kind: 'try',
      title: 'Счёт',
      question: input({
        id: 'g6do-try1',
        prompt: '0.6 × 0.5',
        answer: '0.3',
        explanation: '6×5=30, два знака → 0,30=0,3.',
        difficulty: 'средне',
      }),
    },
    {
      id: 'g6do-s',
      kind: 'summary',
      title: 'Запомни',
      body: 'Запятые в один столбик. × — считай знаки. ÷ — сдвинь одинаково.',
    },
  ]),

  'g6-ratio-prop': lesson('g6-ratio-prop', [
    {
      id: 'g6rp-c1',
      kind: 'concept',
      title: 'Пропорция',
      body: 'a/b = c/d. Главное правило: произведение крайних равно произведению средних: a×d = b×c.',
    },
    {
      id: 'g6rp-sort',
      kind: 'interact',
      title: 'Найди x',
      interact: {
        type: 'sort-steps',
        prompt: 'Реши 2/3 = x/12',
        items: ['Крайние: 2 и 12', 'Средние: 3 и x', '2×12 = 3×x', 'x = 24/3 = 8'],
        correctOrder: ['Крайние: 2 и 12', 'Средние: 3 и x', '2×12 = 3×x', 'x = 24/3 = 8'],
        explanation: 'Крест-накрест и деление.',
      },
    },
    {
      id: 'g6rp-story',
      kind: 'interact',
      title: 'Рецепт',
      interact: {
        type: 'story',
        scene: 'На 2 порции нужно 3 яйца. На 6 порций — сколько?',
        prompt: 'Как через пропорцию?',
        options: [
          {
            id: 'a',
            label: '2/3 = 6/x → x = 9',
            correct: true,
            feedback: 'Да: порции/яйца сохраняют отношение. 9 яиц.',
          },
          {
            id: 'b',
            label: 'Просто 6 − 2 = 4 яйца',
            correct: false,
            feedback: 'Вычитание не сохраняет пропорцию.',
          },
        ],
      },
    },
    {
      id: 'g6rp-spot',
      kind: 'interact',
      title: 'Сломанное равенство',
      interact: {
        type: 'spot-error',
        prompt: 'Проверяют 3/5 = 6/10. Где ошибка в «доказательстве»?',
        lines: ['3×10 = 30', '5×6 = 30', 'Равны → пропорция верна', 'Кто-то сказал 3×5 = 6×10'],
        wrongIndex: 3,
        explanation: 'Сравнивают крайние с средними, не «левую пару с правой как попало».',
      },
    },
    {
      id: 'g6rp-try',
      kind: 'try',
      title: 'Счёт',
      question: input({
        id: 'g6rp-try1',
        prompt: '4/x = 2/5. x = ?',
        answer: '10',
        explanation: '4×5 = 2×x → x=10.',
        difficulty: 'средне',
      }),
    },
    {
      id: 'g6rp-s',
      kind: 'summary',
      title: 'Запомни',
      body: 'a/b = c/d ⇔ a×d = b×c. Составляй отношение «одинаковых смыслов».',
    },
  ]),

  'g6-ratio-scale': lesson('g6-ratio-scale', [
    {
      id: 'g6rs-c1',
      kind: 'concept',
      title: 'Масштаб',
      body: 'Масштаб 1:100 значит 1 см на карте = 100 см в жизни (или в тех же единицах). Отношение «карта : местность».',
    },
    {
      id: 'g6rs-story',
      kind: 'interact',
      title: 'Карта похода',
      interact: {
        type: 'story',
        scene: 'Масштаб 1:1000. На карте отрезок 3 см.',
        prompt: 'Какова длина на местности в см?',
        options: [
          {
            id: 'a',
            label: '3000 см',
            correct: true,
            feedback: '3 × 1000 = 3000 см (30 м).',
          },
          {
            id: 'b',
            label: '3 см',
            correct: false,
            feedback: 'Это длина на карте, не на местности.',
          },
          {
            id: 'c',
            label: '1000 см',
            correct: false,
            feedback: 'Забыли умножить на 3.',
          },
        ],
      },
    },
    {
      id: 'g6rs-bar',
      kind: 'interact',
      title: 'Отношение 2:5',
      interact: {
        type: 'bar-set',
        prompt: 'В отношении 2:5 на «первую часть» из 14 яблок сколько?',
        max: 14,
        step: 1,
        target: 4,
        success: '2+5=7 частей, 14/7=2 в части, 2×2=4.',
      },
    },
    {
      id: 'g6rs-sort',
      kind: 'interact',
      title: 'Делёж',
      interact: {
        type: 'sort-steps',
        prompt: 'Раздели 20 в отношении 1:3',
        items: ['Частей: 1+3=4', 'Одна часть: 20/4=5', 'Первому: 5', 'Второму: 15'],
        correctOrder: ['Частей: 1+3=4', 'Одна часть: 20/4=5', 'Первому: 5', 'Второму: 15'],
        explanation: 'Сложи части → найди цену части → умножь.',
      },
    },
    {
      id: 'g6rs-try',
      kind: 'try',
      title: 'Проверка',
      question: input({
        id: 'g6rs-try1',
        prompt: 'Масштаб 1:200. На карте 2 см. На местности (см)?',
        answer: '400',
        explanation: '2×200=400 см.',
        difficulty: 'средне',
      }),
    },
    {
      id: 'g6rs-s',
      kind: 'summary',
      title: 'Запомни',
      body: 'Масштаб — множитель. Отношение a:b — дели на (a+b) частей.',
    },
  ]),

  'g6-percents-tasks': lesson('g6-percents-tasks', [
    {
      id: 'g6pt-c1',
      kind: 'concept',
      title: 'Три типа задач',
      body: '1) p% от числа. 2) Число по проценту. 3) Сколько процентов составляет A от B.',
    },
    {
      id: 'g6pt-bar',
      kind: 'interact',
      title: 'Наполни 40%',
      interact: {
        type: 'bar-set',
        prompt: 'Выставь 40%',
        max: 100,
        step: 5,
        target: 40,
        unit: '%',
        success: '40% = 0,4 = 2/5.',
      },
    },
    {
      id: 'g6pt-story',
      kind: 'interact',
      title: 'Число по проценту',
      interact: {
        type: 'story',
        scene: '15% числа равны 30.',
        prompt: 'Чему равно всё число?',
        options: [
          {
            id: 'a',
            label: '200',
            correct: true,
            feedback: '1% = 30/15=2, всё = 200.',
          },
          {
            id: 'b',
            label: '45',
            correct: false,
            feedback: '30+15 — не тот путь.',
          },
          {
            id: 'c',
            label: '150',
            correct: false,
            feedback: 'Это было бы 20% от 150, не наш случай.',
          },
        ],
      },
    },
    {
      id: 'g6pt-spot',
      kind: 'interact',
      title: 'Процентное отношение',
      interact: {
        type: 'spot-error',
        prompt: 'Сколько % составляет 8 от 40? Где ошибка?',
        lines: ['8/40 = 0,2', '0,2 × 100% = 20%', 'Ответ 20%', 'Кто-то написал 40/8 = 500%'],
        wrongIndex: 3,
        explanation: '«A от B» — это A/B, не B/A.',
      },
    },
    {
      id: 'g6pt-try',
      kind: 'try',
      title: 'Счёт',
      question: input({
        id: 'g6pt-try1',
        prompt: '25% от 80',
        answer: '20',
        explanation: '0,25×80=20.',
        difficulty: 'легко',
      }),
    },
    {
      id: 'g6pt-s',
      kind: 'summary',
      title: 'Запомни',
      body: 'От числа — ×. По проценту — через 1%. «Сколько %» — дробь ×100%.',
    },
  ]),

  'g6-rational-neg': lesson('g6-rational-neg', [
    {
      id: 'g6rn-c1',
      kind: 'concept',
      title: 'Отрицательные числа',
      body: 'Левее нуля — отрицательные. −3 < −1 < 0 < 2. Модуль — расстояние до нуля: |−5|=5.',
      visual: 'number-line',
    },
    {
      id: 'g6rn-line',
      kind: 'interact',
      title: 'Найди −2',
      interact: {
        type: 'line-pick',
        prompt: 'Отметь −2',
        min: -3,
        max: 3,
        step: 1,
        target: -2,
        success: 'На два шага влево от нуля.',
      },
    },
    {
      id: 'g6rn-story',
      kind: 'interact',
      title: 'Лифт',
      interact: {
        type: 'story',
        scene: 'Ты на этаже 0. Спустился на 4, потом поднялся на 1.',
        prompt: 'Где ты?',
        options: [
          {
            id: 'a',
            label: 'На −3',
            correct: true,
            feedback: '0 − 4 + 1 = −3.',
          },
          {
            id: 'b',
            label: 'На 3',
            correct: false,
            feedback: 'Знак направления важен.',
          },
        ],
      },
    },
    {
      id: 'g6rn-spot',
      kind: 'interact',
      title: 'Сравнение',
      interact: {
        type: 'spot-error',
        prompt: 'Сравнивают −7 и −2. Где ошибка?',
        lines: ['−7 левее на прямой', 'Значит −7 меньше', 'Кто-то написал −7 > −2', 'Модуль больше — не значит число больше'],
        wrongIndex: 2,
        explanation: '−7 < −2, хотя |−7| больше.',
      },
    },
    {
      id: 'g6rn-try',
      kind: 'try',
      title: 'Сумма',
      question: input({
        id: 'g6rn-try1',
        prompt: '−3 + 5',
        answer: '2',
        explanation: 'От −3 вправо на 5 → 2.',
        difficulty: 'легко',
      }),
    },
    {
      id: 'g6rn-s',
      kind: 'summary',
      title: 'Запомни',
      body: 'Левее — меньше. Сложение — шаги по прямой. Не путай модуль и само число.',
    },
  ]),

  'g6-rational-ops': lesson('g6-rational-ops', [
    {
      id: 'g6ro-c1',
      kind: 'concept',
      title: 'Знаки при × и ÷',
      body: 'Одинаковые знаки → плюс. Разные → минус. Модули умножай/дели как обычно.',
    },
    {
      id: 'g6ro-story',
      kind: 'interact',
      title: 'Правило знаков',
      interact: {
        type: 'story',
        scene: 'Считаем (−2)×(−3) и (−2)×3.',
        prompt: 'Какие знаки у ответов?',
        options: [
          {
            id: 'a',
            label: 'Плюс и минус: 6 и −6',
            correct: true,
            feedback: 'Минус на минус даёт плюс; минус на плюс — минус.',
          },
          {
            id: 'b',
            label: 'Оба минус',
            correct: false,
            feedback: 'Два минуса в умножении «гасятся».',
          },
        ],
      },
    },
    {
      id: 'g6ro-sort',
      kind: 'interact',
      title: 'Алгоритм',
      interact: {
        type: 'sort-steps',
        prompt: 'Вычисли (−12)÷3',
        items: ['Знаки разные → ответ отрицательный', 'Модули: 12÷3=4', 'Ответ −4', 'Проверка: (−4)×3=−12'],
        correctOrder: [
          'Знаки разные → ответ отрицательный',
          'Модули: 12÷3=4',
          'Ответ −4',
          'Проверка: (−4)×3=−12',
        ],
        explanation: 'Сначала знак, потом модуль, потом проверка.',
      },
    },
    {
      id: 'g6ro-spot',
      kind: 'interact',
      title: 'Ловушка',
      interact: {
        type: 'spot-error',
        prompt: '(−5)×(−2)×(−1). Где ошибка?',
        lines: [
          'Первые два минуса → плюс: 10',
          '10 × (−1) → −10',
          'Ответ −10',
          'Кто-то сказал «три минуса → плюс»',
        ],
        wrongIndex: 3,
        explanation: 'Нечётное число минусов → минус.',
      },
    },
    {
      id: 'g6ro-try',
      kind: 'try',
      title: 'Счёт',
      question: input({
        id: 'g6ro-try1',
        prompt: '(−4)×3',
        answer: '-12',
        explanation: 'Разные знаки → −12.',
        difficulty: 'легко',
      }),
    },
    {
      id: 'g6ro-s',
      kind: 'summary',
      title: 'Запомни',
      body: 'Знак отдельно, модуль отдельно. Чётное число минусов → плюс.',
    },
  ]),

  'g6-plane-points': lesson('g6-plane-points', [
    {
      id: 'g6pp-c1',
      kind: 'concept',
      title: 'Две оси',
      body: 'Точка (x; y): x — вправо/влево, y — вверх/вниз. (0;0) — начало координат.',
    },
    {
      id: 'g6pp-story',
      kind: 'interact',
      title: 'Куда идти',
      interact: {
        type: 'story',
        scene: 'Точка (2; −1).',
        prompt: 'Где она относительно начала?',
        options: [
          {
            id: 'a',
            label: 'На 2 вправо и на 1 вниз',
            correct: true,
            feedback: 'x>0 — вправо, y<0 — вниз.',
          },
          {
            id: 'b',
            label: 'На 2 вверх и на 1 влево',
            correct: false,
            feedback: 'Перепутаны оси и знаки.',
          },
        ],
      },
    },
    {
      id: 'g6pp-sort',
      kind: 'interact',
      title: 'Построй точку',
      interact: {
        type: 'sort-steps',
        prompt: 'Как отметить (3; 2)',
        items: ['Найти 3 на оси x', 'Провести вертикаль', 'Найти 2 на оси y', 'Пересечение — точка'],
        correctOrder: [
          'Найти 3 на оси x',
          'Провести вертикаль',
          'Найти 2 на оси y',
          'Пересечение — точка',
        ],
        explanation: 'Сначала x, потом y, точка на пересечении.',
      },
    },
    {
      id: 'g6pp-spot',
      kind: 'interact',
      title: 'Перепутали координаты',
      interact: {
        type: 'spot-error',
        prompt: 'Читают точку справа на 1, вверх на 4. Где ошибка?',
        lines: ['x = 1', 'y = 4', 'Запись (4; 1)', 'Правильно (1; 4)'],
        wrongIndex: 2,
        explanation: 'Сначала x, потом y: (1; 4).',
      },
    },
    {
      id: 'g6pp-try',
      kind: 'try',
      title: 'Проверка',
      question: single({
        id: 'g6pp-try1',
        prompt: 'Точка (−2; 0) лежит…',
        options: ['на оси x', 'на оси y', 'в I четверти', 'в начале координат'],
        answer: 'на оси x',
        explanation: 'y=0 → на оси абсцисс.',
        difficulty: 'легко',
      }),
    },
    {
      id: 'g6pp-s',
      kind: 'summary',
      title: 'Запомни',
      body: '(x; y): сначала вдоль «пола», потом «этаж». Знаки определяют четверть.',
    },
  ]),

  'g6-circle-basics': lesson('g6-circle-basics', [
    {
      id: 'g6cb-c1',
      kind: 'concept',
      title: 'Радиус и диаметр',
      body: 'Радиус R — от центра до окружности. Диаметр D = 2R. Длина окружности C ≈ 2πR (π≈3,14).',
    },
    {
      id: 'g6cb-bar',
      kind: 'interact',
      title: 'Диаметр',
      interact: {
        type: 'bar-set',
        prompt: 'Радиус 7. Какой диаметр?',
        max: 20,
        step: 1,
        target: 14,
        success: 'D = 2×7 = 14.',
      },
    },
    {
      id: 'g6cb-story',
      kind: 'interact',
      title: 'Обруч',
      interact: {
        type: 'story',
        scene: 'Радиус обруча 5, π берут 3.',
        prompt: 'Примерная длина окружности?',
        options: [
          {
            id: 'a',
            label: '2×3×5 = 30',
            correct: true,
            feedback: 'C = 2πR ≈ 30 при π=3.',
          },
          {
            id: 'b',
            label: '3×5 = 15',
            correct: false,
            feedback: 'Забыли множитель 2.',
          },
        ],
      },
    },
    {
      id: 'g6cb-spot',
      kind: 'interact',
      title: 'Путаница R и D',
      interact: {
        type: 'spot-error',
        prompt: 'D=10. Где ошибка?',
        lines: ['R = D/2 = 5', 'C = 2πR', 'Кто-то взял C = 2πD', 'Так длина станет вдвое больше нужной'],
        wrongIndex: 2,
        explanation: 'В формуле длины — радиус, не диаметр (либо C=πD).',
      },
    },
    {
      id: 'g6cb-try',
      kind: 'try',
      title: 'Проверка',
      question: input({
        id: 'g6cb-try1',
        prompt: 'Диаметр при R=9',
        answer: '18',
        explanation: '2×9=18.',
        difficulty: 'легко',
      }),
    },
    {
      id: 'g6cb-s',
      kind: 'summary',
      title: 'Запомни',
      body: 'D=2R. C=2πR=πD. Не подставляй диаметр вместо радиуса в 2πR.',
    },
  ]),

  'g6-eq-linear': lesson('g6-eq-linear', [
    {
      id: 'g6el-c1',
      kind: 'concept',
      title: 'Уравнение — весы',
      body: 'Что сделал с одной чашей — сделай с другой. Цель: оставить x одного.',
    },
    {
      id: 'g6el-story',
      kind: 'interact',
      title: 'На весах',
      interact: {
        type: 'story',
        scene: '2x + 3 = 11. На левой чаше два «ящика x» и гирька 3, справа 11.',
        prompt: 'Первый ход?',
        options: [
          {
            id: 'a',
            label: 'Убрать по 3 с обеих сторон: 2x = 8',
            correct: true,
            feedback: 'Да. Потом разделить на 2: x=4.',
          },
          {
            id: 'b',
            label: 'Сразу разделить всё на 2: x + 3 = 5,5',
            correct: false,
            feedback: 'Делить можно, но тогда и 3 тоже делится — чаще удобнее сначала убрать слагаемое.',
          },
        ],
      },
    },
    {
      id: 'g6el-sort',
      kind: 'interact',
      title: 'Собери решение',
      interact: {
        type: 'sort-steps',
        prompt: '5x = 35',
        items: ['Делим обе части на 5', 'x = 7', 'Проверка: 5×7=35', 'Весы в балансе'],
        correctOrder: ['Делим обе части на 5', 'x = 7', 'Проверка: 5×7=35', 'Весы в балансе'],
        explanation: 'Разделил → проверил подстановкой.',
      },
    },
    {
      id: 'g6el-spot',
      kind: 'interact',
      title: 'Потерянный знак',
      interact: {
        type: 'spot-error',
        prompt: 'x + 8 = 3. Где ошибка?',
        lines: ['Вычитаем 8: x = 3 − 8', 'x = −5', 'Кто-то написал x = 3 + 8 = 11', 'Проверка: −5+8=3'],
        wrongIndex: 2,
        explanation: 'Слагаемое переносят с сменой знака.',
      },
    },
    {
      id: 'g6el-try',
      kind: 'try',
      title: 'Реши',
      question: input({
        id: 'g6el-try1',
        prompt: '2x + 3 = 11. x = ?',
        answer: '4',
        explanation: '2x=8, x=4.',
        difficulty: 'средне',
      }),
    },
    {
      id: 'g6el-s',
      kind: 'summary',
      title: 'Запомни',
      body: 'Убери лишнее от x → раздели на коэффициент → проверь. Обе чаши весов одинаково.',
    },
  ]),
};
