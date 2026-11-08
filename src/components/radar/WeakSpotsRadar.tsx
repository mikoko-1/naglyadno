import { Bot, Crosshair, Gauge, Rocket } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GRADE_IDS, type GradeId } from '../../curriculum/index.ts';
import { generateQuestion } from '../../lib/exam/generators.ts';
import { checkQuestionAnswer } from '../../lib/quiz/checkAnswer.ts';
import {
  confidenceBand,
  gradeHeat,
  recordSkillAttempt,
  saveSkills,
  skillConfidence,
  SKILL_CATALOG,
  topWeakSkills,
  type MicroSkillId,
  type SkillsState,
} from '../../lib/skills/microSkills.ts';

type WeakSpotsRadarProps = {
  skills: SkillsState;
  onSkillsChange: (state: SkillsState) => void;
  onOpenSocrates: (payload: { contextNote: string; seedUserMessage: string }) => void;
  dark?: boolean;
};

const bandColor = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  red: 'bg-rose-500',
  unknown: 'bg-slate-300',
} as const;

export function WeakSpotsRadar({
  skills,
  onSkillsChange,
  onOpenSocrates,
  dark,
}: WeakSpotsRadarProps) {
  const weak = useMemo(() => topWeakSkills(skills, 3), [skills]);
  const [drillSkill, setDrillSkill] = useState<MicroSkillId | null>(null);
  const [draft, setDraft] = useState('');
  const [checked, setChecked] = useState<boolean | null>(null);
  const [question, setQuestion] = useState(() => generateQuestion('linear_isolate_x'));

  const card = dark
    ? 'border-white/10 bg-slate-900/80 text-slate-100'
    : 'border-slate-200/80 bg-white text-slate-900';

  function openDrill(skillId: MicroSkillId) {
    setDrillSkill(skillId);
    setQuestion(generateQuestion(skillId));
    setDraft('');
    setChecked(null);
  }

  function checkDrill() {
    if (checked !== null || !drillSkill) return;
    const ok = checkQuestionAnswer(question, draft);
    setChecked(ok);
    const next = recordSkillAttempt(skills, drillSkill, ok);
    saveSkills(next);
    onSkillsChange(next);
  }

  function nextDrill() {
    if (!drillSkill) return;
    setQuestion(generateQuestion(drillSkill));
    setDraft('');
    setChecked(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Диагностический радар</h1>
        <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          Микро-навыки из контрольных и точечных тренировок. Зелёный — уверенность, красный — зона роста.
        </p>
      </div>

      <section className={`rounded-3xl border p-5 ${card}`}>
        <div className="mb-4 flex items-center gap-2">
          <Gauge className="size-4 text-indigo-500" />
          <h2 className="text-sm font-semibold">Тепловая шкала по классам</h2>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {GRADE_IDS.map((grade: GradeId) => {
            const heat = gradeHeat(skills, grade);
            return (
              <div key={grade} className={`rounded-2xl p-3 text-center ${dark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <p className={`text-xs font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{grade}</p>
                <span
                  className={`mx-auto mt-2 block size-3 rounded-full ${bandColor[heat.band]}`}
                  title={heat.avg === null ? 'нет данных' : `${Math.round(heat.avg * 100)}%`}
                />
                <p className="mt-2 text-[11px] font-medium tabular-nums">
                  {heat.avg === null ? '—' : `${Math.round(heat.avg * 100)}%`}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className={`rounded-3xl border p-5 ${card}`}>
        <div className="mb-3 flex items-center gap-2">
          <Crosshair className="size-4 text-rose-500" />
          <h2 className="text-sm font-semibold">Топ-3 зоны роста</h2>
        </div>

        {weak.length === 0 ? (
          <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            Пока мало данных. Пройди экспресс-срез в бесконечной контрольной — радар заполнится.
          </p>
        ) : (
          <div className="space-y-3">
            {weak.map(({ meta, stat, confidence }) => {
              const band = confidenceBand(stat);
              return (
                <article
                  key={meta.id}
                  className={`rounded-2xl p-4 ${dark ? 'bg-white/5 ring-1 ring-white/10' : 'bg-slate-50 ring-1 ring-slate-100'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{meta.title}</p>
                      <p className={`mt-1 text-xs leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {meta.failureHint}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                        band === 'red'
                          ? 'bg-rose-500/15 text-rose-500'
                          : band === 'yellow'
                            ? 'bg-amber-500/15 text-amber-600'
                            : 'bg-emerald-500/15 text-emerald-600'
                      }`}
                    >
                      {Math.round(confidence * 100)}% · {stat.attempts} попыток
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openDrill(meta.id)}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white"
                    >
                      <Rocket className="size-3.5" />
                      Закрыть пробел за 2 мин
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenSocrates({
                          contextNote: meta.socraticSeed,
                          seedUserMessage: `У меня пробел: ${meta.title}. ${meta.failureHint}`,
                        })
                      }
                      className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold ring-1 ${
                        dark ? 'ring-white/15' : 'ring-slate-200'
                      }`}
                    >
                      <Bot className="size-3.5" />
                      Разобрать с Сократом
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={`rounded-3xl border p-5 ${card}`}>
        <h2 className="text-sm font-semibold">Все микро-навыки</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {SKILL_CATALOG.map((meta) => {
            const stat = skills.skills[meta.id];
            const conf = skillConfidence(stat);
            const band = confidenceBand(stat);
            return (
              <li
                key={meta.id}
                className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm ${
                  dark ? 'bg-white/5' : 'bg-slate-50'
                }`}
              >
                <span className="truncate font-medium">{meta.title}</span>
                <span className="inline-flex items-center gap-2 tabular-nums">
                  <span className={`size-2 rounded-full ${bandColor[band]}`} />
                  {conf === null ? '—' : `${Math.round(conf * 100)}%`}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {drillSkill && (
        <section className={`rounded-3xl border p-5 ${card}`}>
          <p className="text-xs font-semibold tracking-wide text-indigo-500 uppercase">Точечный тренажёр · 2 мин</p>
          <h3 className="mt-1 text-lg font-semibold">{question.prompt}</h3>
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setChecked(null);
            }}
            className={`mt-3 h-11 w-full rounded-xl px-3 text-sm outline-none ring-1 ${
              dark ? 'bg-white/5 ring-white/10' : 'bg-white ring-slate-200'
            }`}
            placeholder="Ответ"
          />
          {checked === null ? (
            <button
              type="button"
              onClick={checkDrill}
              className="mt-3 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"
            >
              Проверить
            </button>
          ) : (
            <div className="mt-3 space-y-2">
              <p className={`text-sm ${checked ? 'text-emerald-500' : 'text-rose-500'}`}>
                {checked ? 'Верно.' : `Ответ: ${question.answer}. ${question.explanation}`}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={nextDrill}
                  className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
                >
                  Ещё задача
                </button>
                <button
                  type="button"
                  onClick={() => setDrillSkill(null)}
                  className={`h-10 rounded-xl px-4 text-sm font-semibold ring-1 ${dark ? 'ring-white/15' : 'ring-slate-200'}`}
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
