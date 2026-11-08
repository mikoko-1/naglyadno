import {
  BookOpen,
  CalendarCheck2,
  CalendarRange,
  Flame,
  LayoutGrid,
  Moon,
  Radar,
  Sun,
  UserRound,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { GRADE_IDS, type AppMode, type GradeId } from '../../curriculum/index.ts';
import type { AccountState } from '../../lib/account/storage.ts';
import { accessBadge, socratesLeft } from '../../lib/account/limits.ts';

type AppHeaderProps = {
  subtitle: string;
  streak: number;
  soundOn: boolean;
  dark: boolean;
  mode: AppMode;
  account: AccountState;
  activeGrade?: GradeId;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onSelectGrade: (grade: GradeId) => void;
  onHome: () => void;
  onModeChange: (mode: AppMode) => void;
};

const MODES: Array<{ id: AppMode; label: string; short: string; icon: typeof BookOpen }> = [
  { id: 'year', label: 'Учебный год', short: 'Год', icon: CalendarRange },
  { id: 'plan', label: 'План', short: 'План', icon: CalendarCheck2 },
  { id: 'lessons', label: 'Уроки', short: 'Уроки', icon: LayoutGrid },
  { id: 'exam', label: 'Контрольная', short: 'Срез', icon: Zap },
  { id: 'radar', label: 'Радар', short: 'Радар', icon: Radar },
  { id: 'parent', label: 'Родителю', short: 'Мама', icon: Users },
  { id: 'account', label: 'Аккаунт', short: 'Каб.', icon: UserRound },
];

export function AppHeader({
  subtitle,
  streak,
  soundOn,
  dark,
  mode,
  account,
  activeGrade,
  onToggleSound,
  onToggleTheme,
  onSelectGrade,
  onHome,
  onModeChange,
}: AppHeaderProps) {
  const badge = accessBadge(account);
  const left = socratesLeft(account);
  const visibleModes = MODES;

  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur-md ${
        dark ? 'border-white/10 bg-slate-950/85 text-slate-100' : 'border-slate-200/80 bg-white/90 text-slate-900'
      }`}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onHome} className="flex min-w-0 items-center gap-2.5 text-left">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.28)]">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base leading-none font-semibold tracking-tight">Наглядно</span>
              <span className={`mt-1 block truncate text-xs font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {subtitle}
              </span>
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline ${
                badge.startsWith('Плюс')
                  ? 'bg-indigo-500/15 text-indigo-500'
                  : badge.startsWith('Пробный')
                    ? 'bg-emerald-500/15 text-emerald-600'
                    : dark
                      ? 'bg-white/5 text-slate-400'
                      : 'bg-slate-100 text-slate-600'
              }`}
            >
              {badge}
              {left !== null ? ` · Сократ ${left}` : ''}
            </span>
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${
                streak > 0
                  ? 'bg-amber-500/10 text-amber-600 ring-amber-500/20'
                  : dark
                    ? 'bg-white/5 text-slate-400 ring-white/10'
                    : 'bg-slate-50 text-slate-500 ring-slate-200'
              }`}
              aria-label={`Серия побед: ${streak}`}
            >
              <Flame className={`size-4 ${streak > 0 ? 'text-orange-500' : ''}`} aria-hidden="true" />
              <span className="tabular-nums">{streak}</span>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
              className={`grid size-10 place-items-center rounded-full ring-1 ${
                dark ? 'text-slate-300 ring-white/10 hover:bg-white/5' : 'text-slate-500 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button
              type="button"
              onClick={onToggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? 'Выключить звук' : 'Включить звук'}
              className={`grid size-10 place-items-center rounded-full ring-1 ${
                dark ? 'text-slate-300 ring-white/10 hover:bg-white/5' : 'text-slate-500 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            </button>
          </div>
        </div>

        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
          {visibleModes.map((item) => {
            const active = mode === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onModeChange(item.id)}
                aria-pressed={active}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : dark
                      ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">{item.short}</span>
              </button>
            );
          })}
        </div>

        {mode === 'lessons' && (
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {GRADE_IDS.map((grade) => {
              const active = grade === activeGrade;
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => onSelectGrade(grade)}
                  aria-pressed={active}
                  className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : dark
                        ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                        : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {grade} класс
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
