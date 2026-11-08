import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  CircleExclamationPoint,
  Clock3,
  Lightbulb,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getSection, getTopic, type GradeId } from '../../curriculum/index.ts';
import type { Question } from '../../curriculum/types.ts';
import { getControlQuestions } from '../../content/controls/index.ts';
import { getTopicQuestions } from '../../content/questions/index.ts';
import { checkQuestionAnswer, formatAnswer } from '../../lib/quiz/checkAnswer.ts';
import { PASS_THRESHOLD } from '../../lib/progress/storage.ts';

export type QuizMode = 'practice' | 'test' | 'control';

type QuizRunnerProps = {
  grade?: GradeId;
  mode: QuizMode;
  topicId?: string;
  sectionId?: string;
  questionsOverride?: Question[];
  titleOverride?: string;
  onFinished: (score: number, total: number) => void;
  onExit: () => void;
};

type Draft = string | string[];

function emptyDraft(question: Question): Draft {
  if (question.type === 'multi' || question.type === 'order') return [];
  return '';
}

export function QuizRunner({
  grade,
  mode,
  topicId,
  sectionId,
  questionsOverride,
  titleOverride,
  onFinished,
  onExit,
}: QuizRunnerProps) {
  const questions = useMemo(() => {
    if (questionsOverride) return questionsOverride;
    if (mode === 'control' && sectionId && grade) return getControlQuestions(grade, sectionId);
    if (topicId) return getTopicQuestions(topicId, mode === 'practice' ? 'practice' : 'test');
    return [];
  }, [grade, mode, sectionId, topicId, questionsOverride]);

  const title = useMemo(() => {
    if (titleOverride) return titleOverride;
    if (mode === 'control' && sectionId && grade) {
      const section = getSection(grade, sectionId);
      return section ? `Контрольная: ${section.title}` : 'Контрольная';
    }
    if (topicId && grade) {
      const found = getTopic(grade, topicId);
      const label = mode === 'practice' ? 'Практика' : 'Тест';
      return found ? `${label}: ${found.topic.title}` : label;
    }
    if (topicId) return mode === 'practice' ? 'Практика' : 'Тест';
    return 'Задание';
  }, [grade, mode, sectionId, topicId, titleOverride]);

  const minutes =
    mode === 'control' && sectionId && grade
      ? (getSection(grade, sectionId)?.controlMinutes ?? 30)
      : null;

  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Draft[]>(() => questions.map(emptyDraft));
  const [checked, setChecked] = useState<(boolean | null)[]>(() => questions.map(() => null));
  const [finished, setFinished] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(minutes ? minutes * 60 : null);
  const reportedRef = useRef(false);
  const draftsRef = useRef(drafts);
  draftsRef.current = drafts;

  useEffect(() => {
    setIndex(0);
    setDrafts(questions.map(emptyDraft));
    setChecked(questions.map(() => null));
    setFinished(false);
    setHintOpen(false);
    setSecondsLeft(minutes ? minutes * 60 : null);
    reportedRef.current = false;
  }, [questions, minutes]);

  function finishQuiz() {
    if (finished || reportedRef.current) return;
    reportedRef.current = true;
    const currentDrafts = draftsRef.current;
    const results = questions.map((q, i) => checkQuestionAnswer(q, currentDrafts[i] ?? emptyDraft(q)));
    setChecked(results);
    setFinished(true);
    onFinished(results.filter(Boolean).length, questions.length);
  }

  useEffect(() => {
    if (secondsLeft === null || finished) return undefined;
    if (secondsLeft <= 0) {
      finishQuiz();
      return undefined;
    }
    const timer = window.setTimeout(() => setSecondsLeft((value) => (value === null ? null : value - 1)), 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, finished]);

  if (questions.length === 0) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-900">
        Вопросы для этого задания ещё не загружены.
        <button type="button" onClick={onExit} className="mt-3 block text-indigo-700">
          Назад
        </button>
      </div>
    );
  }

  const question = questions[index];
  const draft = drafts[index] ?? emptyDraft(question);
  const revealImmediate = mode === 'practice';
  const showReview = finished || (revealImmediate && checked[index] !== null);

  function setDraft(next: Draft) {
    setDrafts((current) => current.map((item, i) => (i === index ? next : item)));
    if (revealImmediate) {
      setChecked((current) => current.map((item, i) => (i === index ? null : item)));
    }
  }

  function toggleMulti(option: string) {
    const current = Array.isArray(draft) ? draft : [];
    const next = current.includes(option) ? current.filter((item) => item !== option) : [...current, option];
    setDraft(next);
  }

  function moveOrder(option: string) {
    const current = Array.isArray(draft) ? [...draft] : [];
    if (current.includes(option)) {
      setDraft(current.filter((item) => item !== option));
      return;
    }
    setDraft([...current, option]);
  }

  function checkCurrent() {
    const ok = checkQuestionAnswer(question, draft);
    setChecked((current) => current.map((item, i) => (i === index ? ok : item)));
    return ok;
  }

  function goNext() {
    if (revealImmediate && checked[index] === null) checkCurrent();
    if (index >= questions.length - 1) {
      finishQuiz();
      return;
    }
    setIndex((value) => value + 1);
    setHintOpen(false);
  }

  const score = checked.filter((item) => item === true).length;
  const percent = questions.length ? score / questions.length : 0;
  const threshold = mode === 'control' ? PASS_THRESHOLD.control : mode === 'test' ? PASS_THRESHOLD.test : 0;
  const passed = mode === 'practice' ? true : percent >= threshold;

  if (finished) {
    return (
      <div className="space-y-4">
        <section
          className={`rounded-3xl border p-5 shadow-sm sm:p-6 ${
            passed ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
          }`}
        >
          <h2 className="text-2xl font-extrabold text-slate-900">
            {mode === 'practice' ? 'Практика завершена' : passed ? 'Сдано' : 'Пока не сдано'}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            Результат: {score} из {questions.length} ({Math.round(percent * 100)}%)
            {mode !== 'practice' && ` · порог ${Math.round(threshold * 100)}%`}
          </p>
          <button
            type="button"
            onClick={onExit}
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-extrabold text-white"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Вернуться
          </button>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-lg font-extrabold text-slate-900">Разбор</h3>
          <ul className="mt-3 space-y-3">
            {questions.map((q, i) => {
              const ok = checked[i] === true;
              return (
                <li
                  key={q.id}
                  className={`rounded-2xl px-3 py-3 text-sm ${ok ? 'bg-emerald-50' : 'bg-rose-50'}`}
                >
                  <p className="font-extrabold text-slate-900">
                    {i + 1}. {q.prompt}
                  </p>
                  <p className="mt-1 font-semibold text-slate-700">
                    {ok ? 'Верно' : 'Ошибка'}. Правильный ответ: {formatAnswer(q)}
                  </p>
                  <p className="mt-1 text-slate-600">{q.explanation}</p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    );
  }

  const timerLabel =
    secondsLeft === null
      ? null
      : `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 hover:text-indigo-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Выйти
        </button>
        {timerLabel && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-sm font-extrabold text-violet-700 ring-1 ring-violet-100">
            <Clock3 className="size-4" aria-hidden="true" />
            {timerLabel}
          </span>
        )}
      </div>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-wide text-slate-400 uppercase">{title}</p>
            <p className="mt-1 text-sm font-bold text-slate-500">
              Вопрос {index + 1} из {questions.length}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600">
            {question.difficulty}
          </span>
        </div>

        <h2 className="mt-3 text-lg font-extrabold text-slate-900 sm:text-xl">{question.prompt}</h2>

        <div className="mt-5 space-y-2">
          {question.type === 'input' && (
            <input
              value={typeof draft === 'string' ? draft : ''}
              onChange={(event) => setDraft(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-base font-bold text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Введи ответ"
              inputMode="decimal"
              autoComplete="off"
            />
          )}

          {question.type === 'single' &&
            question.options?.map((option) => {
              const selected = draft === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDraft(option)}
                  className={`flex w-full rounded-2xl px-4 py-3 text-left text-sm font-bold ring-1 transition ${
                    selected
                      ? 'bg-indigo-50 text-indigo-900 ring-indigo-300'
                      : 'bg-slate-50 text-slate-800 ring-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {option}
                </button>
              );
            })}

          {question.type === 'multi' &&
            question.options?.map((option) => {
              const selected = Array.isArray(draft) && draft.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleMulti(option)}
                  className={`flex w-full rounded-2xl px-4 py-3 text-left text-sm font-bold ring-1 transition ${
                    selected
                      ? 'bg-indigo-50 text-indigo-900 ring-indigo-300'
                      : 'bg-slate-50 text-slate-800 ring-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {option}
                </button>
              );
            })}

          {question.type === 'order' && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500">Нажимай варианты в нужном порядке.</p>
              {question.options?.map((option) => {
                const orderIndex = Array.isArray(draft) ? draft.indexOf(option) : -1;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => moveOrder(option)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold ring-1 ${
                      orderIndex >= 0
                        ? 'bg-indigo-50 text-indigo-900 ring-indigo-300'
                        : 'bg-slate-50 text-slate-800 ring-slate-200'
                    }`}
                  >
                    <span className="grid size-6 place-items-center rounded-full bg-white text-xs ring-1 ring-slate-200">
                      {orderIndex >= 0 ? orderIndex + 1 : '·'}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {mode === 'practice' && question.hint && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setHintOpen((open) => !open)}
              className="inline-flex items-center gap-2 text-sm font-extrabold text-indigo-700"
            >
              <Lightbulb className="size-4" aria-hidden="true" />
              Подсказка
            </button>
            {hintOpen && <p className="mt-2 text-sm font-semibold text-slate-600">{question.hint}</p>}
          </div>
        )}

        {showReview && checked[index] !== null && (
          <p
            className={`mt-4 flex items-start gap-2 rounded-2xl px-3 py-3 text-sm font-bold ${
              checked[index] ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
            }`}
          >
            {checked[index] ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <CircleExclamationPoint className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            <span>
              {checked[index] ? 'Верно. ' : `Неверно. Правильный ответ: ${formatAnswer(question)}. `}
              {question.explanation}
            </span>
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {revealImmediate && (
            <button
              type="button"
              onClick={checkCurrent}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-extrabold text-slate-900 ring-1 ring-slate-200"
            >
              <Check className="size-4" aria-hidden="true" />
              Проверить
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-sm font-extrabold text-white hover:bg-indigo-500"
          >
            {index >= questions.length - 1 ? 'Завершить' : 'Далее'}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}
