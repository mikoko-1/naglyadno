import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, CircleCheck, CircleExclamationPoint, Lightbulb, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { LEVELS } from '../data/levels.ts';
import { celebrate, playError, playSuccess } from '../lib/feedbackFx.ts';
import { checkAnswer } from '../lib/fractionFeedback.ts';
import type { AnswerTone } from '../types.ts';
import type { TrainerProps } from '../trainers/types.ts';
import { DenominatorSlider } from './DenominatorSlider.tsx';
import { FractionPie } from './FractionPie.tsx';
import { FractionValue } from './FractionValue.tsx';

const difficultyClass = {
  легко: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  средне: 'bg-amber-50 text-amber-800 ring-amber-200',
  сложнее: 'bg-violet-50 text-violet-700 ring-violet-200',
} as const;

function emptySlices(count: number): boolean[] {
  return Array.from({ length: count }, () => false);
}

function readSoundPreference(): boolean {
  try {
    return localStorage.getItem('naglyadno-sound') !== 'off';
  } catch {
    return true;
  }
}

export function FractionsTrainer({ onStreakDelta, soundOn: soundOnProp }: TrainerProps) {
  const reduceMotion = useReducedMotion() === true;
  const cardControls = useAnimationControls();
  const panelControls = useAnimationControls();

  const [levelIndex, setLevelIndex] = useState(0);
  const [denominator, setDenominator] = useState(LEVELS[0].denominator);
  const [selectedSlices, setSelectedSlices] = useState<boolean[]>(() => emptySlices(LEVELS[0].denominator));
  const [solved, setSolved] = useState<boolean[]>(() => LEVELS.map(() => false));
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const soundOn = soundOnProp ?? readSoundPreference();

  const level = LEVELS[levelIndex];
  const numerator = selectedSlices.filter(Boolean).length;
  const exact = numerator === level.numerator && denominator === level.denominator;
  const tone: AnswerTone =
    status === 'success' ? 'success' : status === 'error' ? 'error' : exact ? 'ready' : 'idle';
  const allSolved = solved.every(Boolean);

  function resetAttempt() {
    setStatus('idle');
    setMessage(null);
  }

  function goToLevel(index: number) {
    const next = LEVELS[index];
    setLevelIndex(index);
    setDenominator(next.denominator);
    setSelectedSlices(emptySlices(next.denominator));
    setHintOpen(false);
    resetAttempt();
  }

  function handleDenominator(next: number) {
    if (next === denominator) return;
    setDenominator(next);
    setSelectedSlices(emptySlices(next));
    resetAttempt();
  }

  function toggleSlice(index: number) {
    setSelectedSlices((current) => {
      if (index < 0 || index >= current.length) return current;
      return current.map((selected, sliceIndex) => (sliceIndex === index ? !selected : selected));
    });
    resetAttempt();
  }

  function shake() {
    if (reduceMotion) return;
    const sequence = { x: [0, -10, 9, -7, 5, -2, 0], transition: { duration: 0.42 } };
    void cardControls.start(sequence);
    void panelControls.start(sequence);
  }

  function handleCheck() {
    const result = checkAnswer(level, numerator, denominator);
    if (result.correct) {
      if (status === 'success') return;
      const firstSolve = !solved[levelIndex];
      const finale = firstSolve && solved.filter(Boolean).length === LEVELS.length - 1;
      setStatus('success');
      setMessage(result.message);
      if (firstSolve) {
        setSolved((current) => current.map((value, index) => (index === levelIndex ? true : value)));
        onStreakDelta?.(1);
      }
      if (soundOn) playSuccess(finale ? 'finale' : 'normal');
      if (!reduceMotion) celebrate(finale ? 'finale' : 'normal');
      return;
    }

    setStatus('error');
    setMessage(result.message);
    onStreakDelta?.(-Infinity);
    if (soundOn) playError();
    shake();
  }

  function handleNext() {
    goToLevel((levelIndex + 1) % LEVELS.length);
  }

  function restart() {
    setSolved(LEVELS.map(() => false));
    goToLevel(0);
  }

  return (
    <div className="text-slate-900">
      <motion.section
        initial={{ x: 0 }}
        animate={cardControls}
        className={`rounded-3xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_rgba(15,23,42,0.05)] sm:p-6 ${
          status === 'success' ? 'border-emerald-200' : status === 'error' ? 'border-rose-200' : 'border-slate-200/80'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-bold text-slate-500">
            Задание {levelIndex + 1} из {LEVELS.length}
          </p>
          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${difficultyClass[level.difficulty]}`}>
            {level.difficulty}
          </span>
        </div>
        <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl">{level.title}</h2>
        <p className="mt-1 text-base font-semibold text-slate-600">{level.goal}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 px-2 py-4 text-center">
            <p className="text-xs font-extrabold text-slate-400">Нужно</p>
            <div className="mt-2 flex justify-center">
              <FractionValue numerator={level.numerator} denominator={level.denominator} size="md" />
            </div>
          </div>
          <div
            className={`rounded-2xl px-2 py-4 text-center ${
              tone === 'success' ? 'bg-emerald-50' : tone === 'error' ? 'bg-rose-50' : tone === 'ready' ? 'bg-indigo-50' : 'bg-slate-50'
            }`}
          >
            <p className="text-xs font-extrabold text-slate-400">Сейчас</p>
            <div className="mt-2 flex justify-center">
              <FractionValue numerator={numerator} denominator={denominator} tone={tone} live />
            </div>
          </div>
        </div>

        <ol className="mt-5 flex gap-1.5">
          {LEVELS.map((item, index) => {
            const current = index === levelIndex;
            const done = solved[index];
            return (
              <li key={item.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => goToLevel(index)}
                  aria-current={current ? 'step' : undefined}
                  aria-label={`Задание ${index + 1}: ${item.title}${done ? ', решено' : ''}`}
                  className="group flex h-8 w-full items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <span
                    className={`h-1.5 w-full rounded-full transition-colors ${
                      current ? 'bg-indigo-600' : done ? 'bg-emerald-400' : 'bg-slate-200 group-hover:bg-slate-300'
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ol>

        {allSolved && (
          <div className="mt-2 flex flex-col gap-3 rounded-2xl bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-emerald-800">Все пять заданий решены.</p>
            <button
              type="button"
              onClick={restart}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-extrabold text-emerald-800 ring-1 ring-emerald-200"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Пройти ещё раз
            </button>
          </div>
        )}
      </motion.section>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
          <FractionPie denominator={denominator} selectedSlices={selectedSlices} onToggle={toggleSlice} />
          <p className="mt-2 text-center text-sm font-semibold text-slate-500">
            Нажми на кусок, чтобы взять его или убрать.
          </p>
        </section>

        <motion.section
          initial={{ x: 0 }}
          animate={panelControls}
          className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6"
        >
          <DenominatorSlider value={denominator} onChange={handleDenominator} />

          <button
            type="button"
            onClick={() => setHintOpen((open) => !open)}
            aria-expanded={hintOpen}
            className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-indigo-700"
          >
            <Lightbulb className="size-4" aria-hidden="true" />
            Подсказка
          </button>
          {hintOpen && <p className="mt-2 text-sm leading-relaxed font-semibold text-slate-600">{level.hint}</p>}

          <div className="mt-5 flex flex-col gap-2.5">
            {message && (
              <p
                role="status"
                className={`flex items-start gap-2 rounded-2xl px-3 py-3 text-sm font-bold ${
                  status === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}
              >
                {status === 'success' ? (
                  <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <CircleExclamationPoint className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                )}
                <span>{message}</span>
              </p>
            )}

            <button
              type="button"
              onClick={handleCheck}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-sm font-extrabold text-white hover:bg-indigo-500"
            >
              <Check className="size-4" aria-hidden="true" />
              {status === 'success' ? 'Решение верное' : 'Проверить решение'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Следующее задание
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
