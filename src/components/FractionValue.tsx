import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { AnswerTone } from '../types.ts';

type FractionValueProps = {
  numerator: number;
  denominator: number;
  size?: 'md' | 'lg';
  tone?: AnswerTone;
  /** Числитель анимируется, когда ученик берёт или убирает сектор. */
  live?: boolean;
};

const toneClass: Record<AnswerTone, string> = {
  idle: 'text-slate-900',
  ready: 'text-indigo-700',
  success: 'text-emerald-700',
  error: 'text-rose-700',
};

const barClass: Record<AnswerTone, string> = {
  idle: 'bg-slate-900',
  ready: 'bg-indigo-500',
  success: 'bg-emerald-600',
  error: 'bg-rose-500',
};

export function FractionValue({
  numerator,
  denominator,
  size = 'lg',
  tone = 'idle',
  live = false,
}: FractionValueProps) {
  const reduceMotion = useReducedMotion();
  const numberClass = size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-3xl';
  const barWidth = size === 'lg' ? 'w-14 sm:w-16' : 'w-10';

  return (
    <div
      className={`inline-flex flex-col items-center font-extrabold leading-none tabular-nums ${toneClass[tone]}`}
      aria-label={`${numerator} / ${denominator}`}
    >
      <span className={`relative inline-grid place-items-center ${numberClass}`}>
        {live ? (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={numerator}
              initial={reduceMotion ? false : { y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? undefined : { y: -14, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="col-start-1 row-start-1"
            >
              {numerator}
            </motion.span>
          </AnimatePresence>
        ) : (
          <span>{numerator}</span>
        )}
      </span>
      <span className={`my-2 h-1 rounded-full ${barWidth} ${barClass[tone]}`} />
      <span className={numberClass}>{denominator}</span>
    </div>
  );
}
