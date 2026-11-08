import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Bot,
  Check,
  CircleCheck,
  CircleExclamationPoint,
  RefreshCw,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { GRADE_IDS, type GradeId } from '../../curriculum/index.ts';
import { generateExam, type GeneratedQuestion } from '../../lib/exam/generators.ts';
import { checkQuestionAnswer } from '../../lib/quiz/checkAnswer.ts';
import {
  loadSkills,
  recordSkillAttempt,
  saveSkills,
  SKILL_CATALOG,
  weakSkillIds,
  type MicroSkillId,
  type SkillsState,
} from '../../lib/skills/microSkills.ts';

type ExamMode = 'express' | 'full' | 'surgical';

type InfiniteExamGeneratorProps = {
  preferredGrade?: GradeId;
  onOpenSocrates: (payload: { contextNote: string; seedUserMessage: string }) => void;
  onSkillsChange?: (state: SkillsState) => void;
  dark?: boolean;
  /** false = не стартуем (лимит / paywall) */
  onBeforeStart?: (mode: ExamMode) => boolean;
  onAnswer?: (payload: { correct: boolean; skillId: MicroSkillId }) => void;
};

function skillsForGrade(grade: GradeId): MicroSkillId[] {
  return SKILL_CATALOG.filter((s) => s.grades.includes(grade)).map((s) => s.id);
}

function countFor(mode: ExamMode): number {
  if (mode === 'express') return 5;
  if (mode === 'surgical') return 6;
  return 11;
}

export function InfiniteExamGenerator({
  preferredGrade = 6,
  onOpenSocrates,
  onSkillsChange,
  dark,
  onBeforeStart,
  onAnswer,
}: InfiniteExamGeneratorProps) {
  const [grade, setGrade] = useState<GradeId>(preferredGrade);
  const [phase, setPhase] = useState<'setup' | 'run' | 'result'>('setup');
  const [mode, setMode] = useState<ExamMode>('express');
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<GeneratedQuestion[]>([]);
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);

  const current = questions[index];
  const card = dark
    ? 'border-white/10 bg-slate-900/80 text-slate-100'
    : 'border-slate-200/80 bg-white text-slate-900';

  function start(nextMode: ExamMode) {
    if (onBeforeStart && !onBeforeStart(nextMode)) return;
    const skillsState = loadSkills();
    let skills: MicroSkillId[];
    if (nextMode === 'surgical') {
      skills = weakSkillIds(skillsState, 4);
    } else {
      skills = skillsForGrade(grade);
    }
    const list = generateExam(skills, countFor(nextMode));
    setMode(nextMode);
    setQuestions(list);
    setIndex(0);
    setDraft('');
    setChecked(null);
    setScore(0);
    setMissed([]);
    setPhase('run');
  }

  function submit() {
    if (!current || checked !== null) return;
    const ok = checkQuestionAnswer(current, draft);
    setChecked(ok);
    setFlash(ok ? 'ok' : 'bad');
    window.setTimeout(() => setFlash(null), 500);

    let skills = loadSkills();
    skills = recordSkillAttempt(skills, current.skillId, ok);
    saveSkills(skills);
    onSkillsChange?.(skills);

    onAnswer?.({ correct: ok, skillId: current.skillId });
    if (ok) setScore((value) => value + 1);
    else setMissed((prev) => [...prev, current]);
  }

  function next() {
    if (index >= questions.length - 1) {
      setPhase('result');
      return;
    }
    setIndex((value) => value + 1);
    setDraft('');
    setChecked(null);
  }

  const modes = useMemo(
    () =>
      [
        {
          id: 'express' as const,
          title: 'Экспресс-срез',
          desc: '5 задач · быстрый пульс',
          icon: Zap,
        },
        {
          id: 'full' as const,
          title: 'Полный срез',
          desc: '11 задач по выбранному классу',
          icon: Target,
        },
        {
          id: 'surgical' as const,
          title: 'Хирургический тест',
          desc: 'Только слабые микро-навыки',
          icon: Sparkles,
        },
      ] as const,
    [],
  );

  if (phase === 'setup') {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Бесконечная контрольная</h1>
          <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            Алгоритмическая генерация — задачи не повторяются. Каждый ответ кормит диагностический радар.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {GRADE_IDS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrade(g)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                grade === g
                  ? 'bg-indigo-600 text-white'
                  : dark
                    ? 'bg-white/5 text-slate-300 ring-1 ring-white/10'
                    : 'bg-slate-100 text-slate-600'
              }`}
            >
              {g} класс
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => start(item.id)}
              className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${card}`}
            >
              <item.icon className="size-5 text-indigo-500" />
              <p className="mt-3 text-sm font-semibold">{item.title}</p>
              <p className={`mt-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <section className={`rounded-3xl border p-5 sm:p-6 ${card}`}>
        <h2 className="text-xl font-semibold">Срез завершён</h2>
        <p className={`mt-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          Режим: {mode === 'express' ? 'экспресс' : mode === 'full' ? 'полный' : 'хирургический'}. Результат{' '}
          <span className="font-semibold text-indigo-500">
            {score}/{questions.length}
          </span>
          .
        </p>

        {missed.length > 0 ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold">Ошибки для разбора</p>
            {missed.map((q) => (
              <p
                key={q.id}
                className={`rounded-xl px-3 py-2 text-sm ${dark ? 'bg-white/5' : 'bg-slate-50'}`}
              >
                {q.prompt}
              </p>
            ))}
            <button
              type="button"
              onClick={() =>
                onOpenSocrates({
                  contextNote: `Разбор ${missed.length} ошибок с контрольной. Не давай готовых ответов.`,
                  seedUserMessage: missed
                    .map((q, i) => `${i + 1}) ${q.prompt}`)
                    .join('\n'),
                })
              }
              className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"
            >
              <Bot className="size-4" />
              Передать ошибки Сократу
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-emerald-500">Чисто. Радар обновил уверенность.</p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => start(mode)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
          >
            <RefreshCw className="size-4" />
            Ещё один срез
          </button>
          <button
            type="button"
            onClick={() => setPhase('setup')}
            className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold ring-1 ${
              dark ? 'ring-white/15' : 'ring-slate-200'
            }`}
          >
            <ArrowLeft className="size-4" />
            К настройкам
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setPhase('setup')}
          className={`inline-flex items-center gap-2 text-sm font-semibold ${dark ? 'text-slate-400' : 'text-slate-600'}`}
        >
          <ArrowLeft className="size-4" />
          Настройки
        </button>
        <p className={`text-xs font-semibold tracking-wide uppercase ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          {index + 1} / {questions.length}
        </p>
      </div>

      <div className="flex gap-1">
        {questions.map((q, i) => (
          <span
            key={q.id}
            className={`h-1 flex-1 rounded-full ${
              i < index ? 'bg-indigo-500' : i === index ? 'bg-indigo-400' : dark ? 'bg-white/10' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={current?.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 ${card} ${
            flash === 'ok' ? 'ring-2 ring-emerald-400' : flash === 'bad' ? 'ring-2 ring-rose-400' : ''
          }`}
        >
          <p className="text-xs font-semibold tracking-wide text-indigo-500 uppercase">
            {SKILL_CATALOG.find((s) => s.id === current.skillId)?.title}
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">{current.prompt}</h2>

          <input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setChecked(null);
            }}
            className={`mt-4 h-12 w-full rounded-xl px-4 text-base outline-none ring-1 ${
              dark
                ? 'bg-white/5 ring-white/10 focus:ring-indigo-400/50'
                : 'bg-slate-50 ring-slate-200 focus:ring-indigo-400'
            }`}
            placeholder="Ответ"
            autoComplete="off"
            disabled={checked !== null}
          />

          {checked === null ? (
            <button
              type="button"
              onClick={submit}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"
            >
              <Check className="size-4" />
              Проверить
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <p
                className={`flex items-start gap-2 rounded-xl px-3 py-3 text-sm font-medium ${
                  checked
                    ? dark
                      ? 'bg-emerald-500/15 text-emerald-200'
                      : 'bg-emerald-50 text-emerald-800'
                    : dark
                      ? 'bg-rose-500/15 text-rose-200'
                      : 'bg-rose-50 text-rose-800'
                }`}
              >
                {checked ? (
                  <CircleCheck className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <CircleExclamationPoint className="mt-0.5 size-4 shrink-0" />
                )}
                <span>
                  {checked ? 'Верно. ' : `Пока мимо. Верный ответ: ${current.answer}. `}
                  {current.explanation}
                </span>
              </p>
              <button
                type="button"
                onClick={next}
                className="inline-flex h-11 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
              >
                {index >= questions.length - 1 ? 'Итоги' : 'Далее'}
              </button>
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
