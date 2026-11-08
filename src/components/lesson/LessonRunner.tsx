import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CircleCheck,
  CircleExclamationPoint,
  Gamepad2,
  ScanSearch,
  FlaskConical,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { getTopic, type GradeId } from '../../curriculum/index.ts';
import type { Lesson, LessonStep, Question } from '../../curriculum/types.ts';
import { getLesson } from '../../content/lessons/index.ts';
import { checkQuestionAnswer, formatAnswer } from '../../lib/quiz/checkAnswer.ts';
import { FormulaXRay } from '../interactives/FormulaXRay.tsx';
import { StressTestSandbox } from '../interactives/StressTestSandbox.tsx';
import { LessonInteractPanel } from './LessonInteractPanel.tsx';
import { LessonVisuals } from './LessonVisuals.tsx';

type LessonRunnerProps = {
  grade?: GradeId;
  topicId: string;
  lessonOverride?: Lesson;
  titleOverride?: string;
  onExit: () => void;
  onComplete: () => void;
  onOpenTrainer?: () => void;
  dark?: boolean;
  hideExtraTabs?: boolean;
};

type LessonTab = 'steps' | 'xray' | 'sandbox';

function stepKindLabel(kind: LessonStep['kind']): string {
  if (kind === 'concept') return 'Идея';
  if (kind === 'example') return 'Пример';
  if (kind === 'try') return 'Попробуй';
  if (kind === 'interact') return 'Интерактив';
  return 'Итог';
}

export function LessonRunner({
  grade,
  topicId,
  lessonOverride,
  titleOverride,
  onExit,
  onComplete,
  onOpenTrainer,
  dark = false,
  hideExtraTabs = false,
}: LessonRunnerProps) {
  const lesson = lessonOverride ?? getLesson(topicId);
  const mathTopic = grade ? getTopic(grade, topicId)?.topic : undefined;
  const topic = mathTopic ?? {
    id: topicId,
    title: titleOverride ?? topicId,
    goal: titleOverride ?? '',
    hasTrainer: false,
  };
  const [tab, setTab] = useState<LessonTab>('steps');
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<string | string[]>('');
  const [checked, setChecked] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  const steps = lesson?.steps ?? [];
  const step: LessonStep | undefined = steps[stepIndex];
  const progressLabel = useMemo(
    () => (steps.length ? `Шаг ${stepIndex + 1} из ${steps.length}` : ''),
    [stepIndex, steps.length],
  );

  if (!lesson || !step) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-900">
        Урок для этой темы пока не собран.
        <button type="button" onClick={onExit} className="mt-3 block text-indigo-700">
          Назад
        </button>
      </div>
    );
  }

  function resetTryState() {
    setDraft('');
    setChecked(null);
  }

  function goNext() {
    if (stepIndex >= steps.length - 1) {
      setDone(true);
      onComplete();
      return;
    }
    setStepIndex((value) => value + 1);
    resetTryState();
  }

  function answerTry(question: Question) {
    setChecked(checkQuestionAnswer(question, draft));
  }

  if (done) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <BookOpenCheck className="mt-0.5 size-6 text-emerald-700" aria-hidden="true" />
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Урок пройден</h2>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Тема «{topic.title}» отмечена как изученная. Дальше закрепи на практике
              {topic.hasTrainer ? ' или в тренажёре' : ''}.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              {topic.hasTrainer && onOpenTrainer && (
                <button
                  type="button"
                  onClick={onOpenTrainer}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 text-sm font-extrabold text-white"
                >
                  <Gamepad2 className="size-4" aria-hidden="true" />
                  Открыть тренажёр
                </button>
              )}
              <button
                type="button"
                onClick={onExit}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-extrabold text-white"
              >
                К теме
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const needsCheck = step.kind === 'try' || step.kind === 'interact';

  const tabs: Array<{ id: LessonTab; label: string; icon: typeof ScanSearch }> = hideExtraTabs
    ? [{ id: 'steps', label: 'Шаги', icon: BookOpenCheck }]
    : [
        { id: 'steps', label: 'Шаги', icon: BookOpenCheck },
        { id: 'xray', label: 'Рентген', icon: ScanSearch },
        { id: 'sandbox', label: 'Песочница', icon: FlaskConical },
      ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onExit}
          className={`inline-flex items-center gap-2 text-sm font-semibold ${
            dark ? 'text-slate-400 hover:text-indigo-300' : 'text-slate-600 hover:text-indigo-700'
          }`}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          К теме
        </button>
        {tab === 'steps' && (
          <p className={`text-xs font-semibold tracking-wide uppercase ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            {progressLabel}
          </p>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                active
                  ? 'bg-indigo-600 text-white'
                  : dark
                    ? 'bg-white/5 text-slate-300 ring-1 ring-white/10'
                    : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === 'xray' && (
        <section
          className={`rounded-3xl border p-5 shadow-sm sm:p-6 ${
            dark ? 'border-white/10 bg-slate-900/80' : 'border-slate-200/80 bg-white'
          }`}
        >
          <FormulaXRay dark={dark} />
        </section>
      )}

      {tab === 'sandbox' && (
        <section
          className={`rounded-3xl border p-5 shadow-sm sm:p-6 ${
            dark ? 'border-white/10 bg-slate-900/80' : 'border-slate-200/80 bg-white'
          }`}
        >
          <StressTestSandbox dark={dark} />
        </section>
      )}

      {tab === 'steps' && (
        <>
      <div className="flex gap-1.5">
        {steps.map((item, index) => (
          <span
            key={item.id}
            className={`h-1.5 flex-1 rounded-full ${index <= stepIndex ? 'bg-indigo-600' : dark ? 'bg-white/10' : 'bg-slate-200'}`}
          />
        ))}
      </div>

      <section
        className={`rounded-3xl border p-5 shadow-sm sm:p-6 ${
          dark ? 'border-white/10 bg-slate-900/80 text-slate-100' : 'border-slate-200/80 bg-white'
        }`}
      >
        <p className="text-xs font-extrabold tracking-wide text-indigo-600 uppercase">{stepKindLabel(step.kind)}</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{step.title}</h2>

        {(step.kind === 'concept' || step.kind === 'example' || step.kind === 'summary') && (
          <>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed font-semibold text-slate-700 sm:text-base">
              {step.body}
            </p>
            <LessonVisuals visual={step.visual} />
            {step.trainerCta && onOpenTrainer && (
              <button
                type="button"
                onClick={onOpenTrainer}
                className="mt-4 inline-flex h-11 items-center gap-2 rounded-2xl bg-teal-50 px-4 text-sm font-extrabold text-teal-800 ring-1 ring-teal-200"
              >
                <Gamepad2 className="size-4" aria-hidden="true" />
                Покрутить пирог в тренажёре
              </button>
            )}
          </>
        )}

        {step.kind === 'interact' && (
          <div className="mt-4 space-y-3">
            {step.body && <p className="text-sm font-semibold text-slate-600">{step.body}</p>}
            <LessonInteractPanel
              key={step.id}
              interact={step.interact}
              resolved={checked}
              onResolved={setChecked}
              onClear={() => setChecked(null)}
            />
          </div>
        )}

        {step.kind === 'try' && (
          <div className="mt-4 space-y-3">
            {step.body && <p className="text-sm font-semibold text-slate-600">{step.body}</p>}
            <p className="text-base font-extrabold text-slate-900">{step.question.prompt}</p>

            {step.question.type === 'input' && (
              <input
                value={typeof draft === 'string' ? draft : ''}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setChecked(null);
                }}
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-base font-bold outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Твой ответ"
                autoComplete="off"
              />
            )}

            {(step.question.type === 'single' || step.question.type === 'multi') &&
              step.question.options?.map((option) => {
                const selected =
                  step.question.type === 'multi'
                    ? Array.isArray(draft) && draft.includes(option)
                    : draft === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      if (step.question.type === 'multi') {
                        const current = Array.isArray(draft) ? draft : [];
                        setDraft(
                          current.includes(option)
                            ? current.filter((item) => item !== option)
                            : [...current, option],
                        );
                      } else {
                        setDraft(option);
                      }
                      setChecked(null);
                    }}
                    className={`flex w-full rounded-2xl px-4 py-3 text-left text-sm font-bold ring-1 ${
                      selected
                        ? 'bg-indigo-50 text-indigo-900 ring-indigo-300'
                        : 'bg-slate-50 text-slate-800 ring-slate-200'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}

            {checked === null ? (
              <button
                type="button"
                onClick={() => answerTry(step.question)}
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-extrabold text-white"
              >
                <Check className="size-4" aria-hidden="true" />
                Проверить
              </button>
            ) : (
              <p
                className={`flex items-start gap-2 rounded-2xl px-3 py-3 text-sm font-bold ${
                  checked ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}
              >
                {checked ? (
                  <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <CircleExclamationPoint className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                )}
                <span>
                  {checked ? 'Верно. ' : `Пока мимо. Верный ответ: ${formatAnswer(step.question)}. `}
                  {step.question.explanation}
                </span>
              </p>
            )}
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            disabled={needsCheck && checked === null}
            onClick={goNext}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-sm font-extrabold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
          >
            {stepIndex >= steps.length - 1 ? 'Завершить урок' : 'Далее'}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          {needsCheck && checked === false && (
            <p className={`mt-2 text-xs font-bold ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
              Можно идти дальше — важно понять разбор, а не «угадать с первого раза».
            </p>
          )}
        </div>
      </section>
        </>
      )}
    </div>
  );
}
