import { X } from 'lucide-react';
import { useState } from 'react';
import { generateQuestion } from '../../lib/exam/generators.ts';
import { checkQuestionAnswer } from '../../lib/quiz/checkAnswer.ts';
import {
  getSkillMeta,
  recordSkillAttempt,
  saveSkills,
  type MicroSkillId,
  type SkillsState,
} from '../../lib/skills/microSkills.ts';

type MiniDrillModalProps = {
  skillId: MicroSkillId;
  skills: SkillsState;
  dark?: boolean;
  onClose: () => void;
  onSkillsChange: (s: SkillsState) => void;
  onAttempt: (correct: boolean) => void;
};

export function MiniDrillModal({
  skillId,
  skills,
  dark,
  onClose,
  onSkillsChange,
  onAttempt,
}: MiniDrillModalProps) {
  const meta = getSkillMeta(skillId);
  const [q, setQ] = useState(() => generateQuestion(skillId));
  const [draft, setDraft] = useState('');
  const [checked, setChecked] = useState<boolean | null>(null);
  const [done, setDone] = useState(0);

  function check() {
    const ok = checkQuestionAnswer(q, draft);
    setChecked(ok);
    const next = recordSkillAttempt(skills, skillId, ok);
    saveSkills(next);
    onSkillsChange(next);
    onAttempt(ok);
    setDone((v) => v + 1);
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className={`w-full max-w-md rounded-3xl border p-5 ${
          dark ? 'border-white/10 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-indigo-500">2 минуты · {meta.title}</p>
            <h2 className="mt-1 text-lg font-semibold">{q.prompt}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full" aria-label="Закрыть">
            <X className="size-4" />
          </button>
        </div>
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setChecked(null);
          }}
          className={`mt-4 h-11 w-full rounded-xl px-3 text-sm outline-none ring-1 ${
            dark ? 'bg-white/5 ring-white/10' : 'bg-slate-50 ring-slate-200'
          }`}
          placeholder="Ответ"
        />
        {checked === null ? (
          <button
            type="button"
            onClick={check}
            className="mt-3 h-11 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white"
          >
            Проверить
          </button>
        ) : (
          <div className="mt-3 space-y-2">
            <p className={`text-sm ${checked ? 'text-emerald-500' : 'text-rose-500'}`}>
              {checked ? 'Верно.' : `Ответ: ${q.answer}. ${q.explanation}`}
            </p>
            <button
              type="button"
              onClick={() => {
                setQ(generateQuestion(skillId));
                setDraft('');
                setChecked(null);
              }}
              className="h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              Ещё ({done}/5)
            </button>
            {done >= 5 && (
              <button type="button" onClick={onClose} className="h-10 w-full text-sm font-semibold text-indigo-500">
                Достаточно на сегодня
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
