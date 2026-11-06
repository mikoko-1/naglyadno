# Наглядно — математика 5–9

Интерактивная платформа: каталог тем, практика, тесты, контрольные и визуальные тренажёры.

```bash
npm install
npm run dev
```

## Структура

- `src/curriculum/` — карта тем 5–9 классов
- `src/content/lessons/` — пошаговые уроки (идея → пример → попробуй)
- `src/content/questions/` — банки practice/test
- `src/content/controls/` — контрольные по разделам
- `src/components/lesson/LessonRunner.tsx` — прохождение урока
- `src/components/quiz/QuizRunner.tsx` — движок заданий
- `src/components/shell/` — навигация и каталог
- `src/components/FractionsTrainer.tsx` — тренажёр обыкновенных дробей

Путь темы: **Урок → Тренажёр → Практика → Тест**. Прогресс в `localStorage` (`naglyadno-progress-v1`).
