import { ArrowRight, Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GRADE_IDS, type GradeId } from '../../curriculum/index.ts';
import { generateExam, type GeneratedQuestion } from '../../lib/exam/generators.ts';
import { checkQuestionAnswer } from '../../lib/quiz/checkAnswer.ts';
import {
  logActivity,
  saveAccount,
  startTrial,
  TRIAL_DAYS,
  type AccountState,
} from '../../lib/account/storage.ts';
import {
  recordSkillAttempt,
  saveSkills,
  skillConfidence,
  SKILL_CATALOG,
  type MicroSkillId,
  type SkillsState,
} from '../../lib/skills/microSkills.ts';

type OnboardingFlowProps = {
  account: AccountState;
  skills: SkillsState;
  dark?: boolean;
  onDone: (account: AccountState, skills: SkillsState) => void;
};

function skillsForGrade(grade: GradeId): MicroSkillId[] {
  return SKILL_CATALOG.filter((s) => s.grades.includes(grade)).map((s) => s.id);
}

export function OnboardingFlow({ account, skills, dark, onDone }: OnboardingFlowProps) {
  const [step, setStep] = useState<'hello' | 'diag' | 'done'>('hello');
  const [grade, setGrade] = useState<GradeId>(account.grade || 6);
  const [name, setName] = useState(account.displayName);
  const [email, setEmail] = useState(account.email);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const [localSkills, setLocalSkills] = useState(skills);
  const [answered, setAnswered] = useState(0);

  const current = questions[index];
  const card = dark
    ? 'border-white/10 bg-slate-900/80 text-slate-100'
    : 'border-slate-200 bg-white text-slate-900';

  const progressPct = useMemo(
    () => (questions.length ? Math.round((index / questions.length) * 100) : 0),
    [index, questions.length],
  );

  function startDiag() {
    const list = generateExam(skillsForGrade(grade), 5);
    setQuestions(list);
    setIndex(0);
    setDraft('');
    setAnswered(0);
    setStep('diag');
  }

  function submitAnswer() {
    if (!current) return;
    const ok = checkQuestionAnswer(current, draft);
    let nextSkills = recordSkillAttempt(localSkills, current.skillId, ok);
    saveSkills(nextSkills);
    setLocalSkills(nextSkills);
    setAnswered((v) => v + 1);

    if (index >= questions.length - 1) {
      finish(nextSkills, answered + 1, ok);
      return;
    }
    setIndex((v) => v + 1);
    setDraft('');
  }

  function finish(nextSkills: SkillsState, attempts: number, lastOk: boolean) {
    const baseline: AccountState['baseline'] = {};
    for (const meta of SKILL_CATALOG) {
      const c = skillConfidence(nextSkills.skills[meta.id]);
      if (c !== null) baseline[meta.id] = c;
    }

    let nextAccount: AccountState = startTrial({
      ...account,
      onboardingDone: true,
      grade,
      displayName: name.trim() || 'Ученик',
      email: email.trim(),
      role: 'student',
      baseline,
    });
    nextAccount = logActivity(nextAccount, {
      minutes: 8,
      attempts,
      correct: (attempts - 1) + (lastOk ? 1 : 0),
    });
    saveAccount(nextAccount);
    setStep('done');
    onDone(nextAccount, nextSkills);
  }

  if (step === 'done') {
    return (
      <section className={`mx-auto max-w-lg rounded-3xl border p-6 ${card}`}>
        <h1 className="text-2xl font-semibold tracking-tight">Готово</h1>
        <p className={`mt-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          Собрали стартовый снимок. У тебя {TRIAL_DAYS} дня полного доступа — потом нужен тариф
          Плюс.
        </p>
      </section>
    );
  }

  if (step === 'diag' && current) {
    return (
      <section className={`mx-auto max-w-lg space-y-4 rounded-3xl border p-5 sm:p-6 ${card}`}>
        <div>
          <p className="text-xs font-semibold tracking-wide text-indigo-500 uppercase">
            Диагностика · {index + 1}/5
          </p>
          <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <h2 className="text-lg font-semibold">{current.prompt}</h2>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={`h-12 w-full rounded-xl px-4 text-base outline-none ring-1 ${
            dark ? 'bg-white/5 ring-white/10' : 'bg-slate-50 ring-slate-200'
          }`}
          placeholder="Ответ"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={submitAnswer}
          disabled={!draft.trim()}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white disabled:opacity-40"
        >
          {index >= questions.length - 1 ? 'Завершить' : 'Далее'}
          <ArrowRight className="size-4" />
        </button>
      </section>
    );
  }

  return (
    <section className={`mx-auto max-w-lg space-y-5 rounded-3xl border p-5 sm:p-6 ${card}`}>
      <div>
        <p className="text-xs font-semibold tracking-wide text-indigo-500 uppercase">60 секунд · старт</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Сначала поймём, где пробелы</h1>
        <p className={`mt-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          5 коротких задач → персональный план. Прогресс сохранится на этом устройстве; один раз
          войди в аккаунт — повторно каждый день вводить пароль не нужно.
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Имя</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`h-11 w-full rounded-xl px-3 text-sm outline-none ring-1 ${
            dark ? 'bg-white/5 ring-white/10' : 'bg-slate-50 ring-slate-200'
          }`}
          placeholder="Миша"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Email (необязательно сейчас)</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className={`h-11 w-full rounded-xl px-3 text-sm outline-none ring-1 ${
            dark ? 'bg-white/5 ring-white/10' : 'bg-slate-50 ring-slate-200'
          }`}
          placeholder="you@mail.ru"
        />
      </label>

      <div>
        <p className="text-xs font-semibold">Класс</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {GRADE_IDS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrade(g)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                grade === g
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : dark
                    ? 'bg-white/5 text-slate-300'
                    : 'bg-slate-100 text-slate-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <ul className={`space-y-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
        {['5 задач под класс', 'Снимок слабых мест', 'План на ~15 минут'].map((t) => (
          <li key={t} className="flex items-center gap-2">
            <Check className="size-4 text-emerald-500" />
            {t}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={startDiag}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white"
      >
        Начать диагностику
        <ArrowRight className="size-4" />
      </button>
    </section>
  );
}
