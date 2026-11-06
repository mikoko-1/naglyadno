import { BookOpen, Flame, Volume2, VolumeX } from 'lucide-react';
import { GRADE_IDS, type GradeId } from '../../curriculum/index.ts';

type AppHeaderProps = {
  subtitle: string;
  streak: number;
  soundOn: boolean;
  activeGrade?: GradeId;
  onToggleSound: () => void;
  onSelectGrade: (grade: GradeId) => void;
  onHome: () => void;
};

export function AppHeader({
  subtitle,
  streak,
  soundOn,
  activeGrade,
  onToggleSound,
  onSelectGrade,
  onHome,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onHome} className="flex min-w-0 items-center gap-2.5 text-left">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.28)]">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base leading-none font-extrabold tracking-tight text-slate-900">
                Наглядно
              </span>
              <span className="mt-1 block truncate text-xs font-bold text-slate-500">{subtitle}</span>
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold ring-1 ${
                streak > 0
                  ? 'bg-amber-50 text-amber-700 ring-amber-200'
                  : 'bg-slate-50 text-slate-500 ring-slate-200'
              }`}
              aria-label={`Серия побед: ${streak}`}
            >
              <Flame className={`size-4 ${streak > 0 ? 'text-orange-500' : 'text-slate-400'}`} aria-hidden="true" />
              <span className="tabular-nums">{streak}</span>
              <span className="hidden text-xs font-bold sm:inline">серия</span>
            </div>
            <button
              type="button"
              onClick={onToggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? 'Выключить звук' : 'Включить звук'}
              className="grid size-10 place-items-center rounded-full text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            </button>
          </div>
        </div>

        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {GRADE_IDS.map((grade) => {
            const active = grade === activeGrade;
            return (
              <button
                key={grade}
                type="button"
                onClick={() => onSelectGrade(grade)}
                aria-pressed={active}
                className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-extrabold transition-colors ${
                  active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {grade} класс
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
