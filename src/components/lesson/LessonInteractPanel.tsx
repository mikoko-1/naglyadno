import { Check, CircleCheck, CircleExclamationPoint, Minus, Plus, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { LessonInteract } from '../../curriculum/types.ts';
import { FractionPie } from '../FractionPie.tsx';

type Props = {
  interact: LessonInteract;
  onResolved: (ok: boolean) => void;
  onClear: () => void;
  resolved: boolean | null;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function LessonInteractPanel({ interact, onResolved, onClear, resolved }: Props) {
  if (interact.type === 'pie-tap') {
    return <PieTap interact={interact} onResolved={onResolved} onClear={onClear} resolved={resolved} />;
  }
  if (interact.type === 'line-pick') {
    return <LinePick interact={interact} onResolved={onResolved} resolved={resolved} />;
  }
  if (interact.type === 'bar-set') {
    return <BarSet interact={interact} onResolved={onResolved} resolved={resolved} />;
  }
  if (interact.type === 'spot-error') {
    return <SpotError interact={interact} onResolved={onResolved} resolved={resolved} />;
  }
  if (interact.type === 'sort-steps') {
    return <SortSteps interact={interact} onResolved={onResolved} resolved={resolved} />;
  }
  return <StoryChoice interact={interact} onResolved={onResolved} resolved={resolved} />;
}

function Feedback({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p
      className={`flex items-start gap-2 rounded-2xl px-3 py-3 text-sm font-bold ${
        ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
      }`}
    >
      {ok ? (
        <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      ) : (
        <CircleExclamationPoint className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      )}
      <span>{text}</span>
    </p>
  );
}

function PieTap({
  interact,
  onResolved,
  onClear,
  resolved,
}: {
  interact: Extract<LessonInteract, { type: 'pie-tap' }>;
  onResolved: (ok: boolean) => void;
  onClear: () => void;
  resolved: boolean | null;
}) {
  const [slices, setSlices] = useState(() => Array.from({ length: interact.denominator }, () => false));
  const numerator = slices.filter(Boolean).length;

  return (
    <div className="space-y-3">
      <p className="text-base font-extrabold text-slate-900">{interact.prompt}</p>
      <p className="text-center text-sm font-bold text-slate-500">
        Сейчас: {numerator}/{interact.denominator}
      </p>
      <FractionPie
        denominator={interact.denominator}
        selectedSlices={slices}
        onToggle={(index) => {
          if (resolved === true) return;
          setSlices((current) => current.map((v, i) => (i === index ? !v : v)));
          if (resolved === false) onClear();
        }}
      />
      {resolved === null ? (
        <button
          type="button"
          onClick={() => onResolved(numerator === interact.targetNumerator)}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-extrabold text-white"
        >
          <Check className="size-4" aria-hidden="true" />
          Проверить
        </button>
      ) : (
        <Feedback
          ok={resolved}
          text={
            resolved
              ? interact.success
              : `Нужно было ${interact.targetNumerator}/${interact.denominator}. Можно поправить дольки и проверить снова.`
          }
        />
      )}
      {resolved === false && (
        <button
          type="button"
          onClick={() => {
            setSlices(Array.from({ length: interact.denominator }, () => false));
            onClear();
          }}
          className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-500"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Сбросить
        </button>
      )}
    </div>
  );
}

function LinePick({
  interact,
  onResolved,
  resolved,
}: {
  interact: Extract<LessonInteract, { type: 'line-pick' }>;
  onResolved: (ok: boolean) => void;
  resolved: boolean | null;
}) {
  const points = useMemo(() => {
    const list: number[] = [];
    for (let v = interact.min; v <= interact.max + 1e-9; v += interact.step) {
      list.push(Number(v.toFixed(4)));
    }
    return list;
  }, [interact.min, interact.max, interact.step]);
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-base font-extrabold text-slate-900">{interact.prompt}</p>
      <div className="rounded-2xl bg-slate-50 px-3 py-5 ring-1 ring-slate-200">
        <div className="relative mx-auto h-14 max-w-md">
          <div className="absolute top-7 right-2 left-2 h-1 rounded-full bg-slate-300" />
          {points.map((value) => {
            const t = (value - interact.min) / (interact.max - interact.min || 1);
            const active = picked === value;
            return (
              <button
                key={value}
                type="button"
                disabled={resolved === true}
                onClick={() => setPicked(value)}
                className="absolute top-0 flex w-10 -translate-x-1/2 flex-col items-center"
                style={{ left: `${t * 100}%` }}
              >
                <span
                  className={`size-5 rounded-full ring-2 ${
                    active ? 'bg-indigo-600 ring-indigo-300' : 'bg-white ring-slate-300'
                  }`}
                />
                <span className="mt-2 text-[11px] font-extrabold text-slate-600">{value}</span>
              </button>
            );
          })}
        </div>
      </div>
      {resolved === null ? (
        <button
          type="button"
          disabled={picked === null}
          onClick={() => onResolved(picked === interact.target)}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-extrabold text-white disabled:opacity-50"
        >
          <Check className="size-4" aria-hidden="true" />
          Проверить
        </button>
      ) : (
        <Feedback
          ok={resolved}
          text={resolved ? interact.success : `Верная точка: ${interact.target}.`}
        />
      )}
    </div>
  );
}

function BarSet({
  interact,
  onResolved,
  resolved,
}: {
  interact: Extract<LessonInteract, { type: 'bar-set' }>;
  onResolved: (ok: boolean) => void;
  resolved: boolean | null;
}) {
  const [value, setValue] = useState(0);
  const unit = interact.unit ?? '';

  return (
    <div className="space-y-3">
      <p className="text-base font-extrabold text-slate-900">{interact.prompt}</p>
      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="mb-2 flex items-center justify-between text-sm font-extrabold text-slate-700">
          <span>
            {value}
            {unit}
          </span>
          <span className="text-slate-400">
            из {interact.max}
            {unit}
          </span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-400 transition-all"
            style={{ width: `${(value / interact.max) * 100}%` }}
          />
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <button
            type="button"
            disabled={resolved === true || value <= 0}
            onClick={() => setValue((v) => Math.max(0, v - interact.step))}
            className="inline-flex size-11 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 disabled:opacity-40"
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={resolved === true || value >= interact.max}
            onClick={() => setValue((v) => Math.min(interact.max, v + interact.step))}
            className="inline-flex size-11 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 disabled:opacity-40"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {resolved === null ? (
        <button
          type="button"
          onClick={() => onResolved(value === interact.target)}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-extrabold text-white"
        >
          <Check className="size-4" aria-hidden="true" />
          Проверить
        </button>
      ) : (
        <Feedback
          ok={resolved}
          text={
            resolved
              ? interact.success
              : `Нужно было ${interact.target}${unit}.`
          }
        />
      )}
    </div>
  );
}

function SpotError({
  interact,
  onResolved,
  resolved,
}: {
  interact: Extract<LessonInteract, { type: 'spot-error' }>;
  onResolved: (ok: boolean) => void;
  resolved: boolean | null;
}) {
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-base font-extrabold text-slate-900">{interact.prompt}</p>
      <div className="space-y-2">
        {interact.lines.map((line, index) => {
          const selected = picked === index;
          const reveal = resolved !== null;
          const isWrong = index === interact.wrongIndex;
          return (
            <button
              key={`${index}-${line}`}
              type="button"
              disabled={resolved !== null}
              onClick={() => setPicked(index)}
              className={`flex w-full rounded-2xl px-4 py-3 text-left text-sm font-bold ring-1 ${
                reveal && isWrong
                  ? 'bg-rose-50 text-rose-900 ring-rose-300'
                  : selected
                    ? 'bg-indigo-50 text-indigo-900 ring-indigo-300'
                    : 'bg-slate-50 text-slate-800 ring-slate-200'
              }`}
            >
              <span className="mr-2 text-slate-400">{index + 1}.</span>
              {line}
            </button>
          );
        })}
      </div>
      {resolved === null ? (
        <button
          type="button"
          disabled={picked === null}
          onClick={() => onResolved(picked === interact.wrongIndex)}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-extrabold text-white disabled:opacity-50"
        >
          <Check className="size-4" aria-hidden="true" />
          Это ошибка
        </button>
      ) : (
        <Feedback
          ok={resolved}
          text={
            resolved
              ? `Да, ошибка в шаге ${interact.wrongIndex + 1}. ${interact.explanation}`
              : `Ошибка была в шаге ${interact.wrongIndex + 1}. ${interact.explanation}`
          }
        />
      )}
    </div>
  );
}

function SortSteps({
  interact,
  onResolved,
  resolved,
}: {
  interact: Extract<LessonInteract, { type: 'sort-steps' }>;
  onResolved: (ok: boolean) => void;
  resolved: boolean | null;
}) {
  const poolInit = useMemo(() => shuffle(interact.items), [interact.items]);
  const [pool, setPool] = useState(poolInit);
  const [built, setBuilt] = useState<string[]>([]);

  function pick(item: string) {
    if (resolved) return;
    setPool((current) => current.filter((x) => x !== item));
    setBuilt((current) => [...current, item]);
  }

  function undo() {
    if (resolved || built.length === 0) return;
    const last = built[built.length - 1];
    setBuilt((current) => current.slice(0, -1));
    setPool((current) => [...current, last]);
  }

  return (
    <div className="space-y-3">
      <p className="text-base font-extrabold text-slate-900">{interact.prompt}</p>
      <div className="min-h-16 space-y-2 rounded-2xl bg-indigo-50/60 p-3 ring-1 ring-indigo-100">
        <p className="text-xs font-extrabold tracking-wide text-indigo-600 uppercase">Твой порядок</p>
        {built.length === 0 ? (
          <p className="text-sm font-semibold text-slate-500">Жми карточки ниже по порядку</p>
        ) : (
          built.map((item, index) => (
            <div key={`b-${item}`} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-800 ring-1 ring-slate-200">
              {index + 1}. {item}
            </div>
          ))
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.map((item) => (
          <button
            key={item}
            type="button"
            disabled={resolved !== null}
            onClick={() => pick(item)}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {resolved === null ? (
          <>
            <button
              type="button"
              onClick={undo}
              disabled={built.length === 0}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-100 px-4 text-sm font-extrabold text-slate-700 disabled:opacity-40"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Отменить
            </button>
            <button
              type="button"
              disabled={built.length !== interact.correctOrder.length}
              onClick={() =>
                onResolved(built.every((item, index) => item === interact.correctOrder[index]))
              }
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-extrabold text-white disabled:opacity-50"
            >
              <Check className="size-4" aria-hidden="true" />
              Проверить
            </button>
          </>
        ) : (
          <Feedback
            ok={resolved}
            text={
              resolved
                ? `Верно. ${interact.explanation}`
                : `Правильный порядок: ${interact.correctOrder.join(' → ')}. ${interact.explanation}`
            }
          />
        )}
      </div>
    </div>
  );
}

function StoryChoice({
  interact,
  onResolved,
  resolved,
}: {
  interact: Extract<LessonInteract, { type: 'story' }>;
  onResolved: (ok: boolean) => void;
  resolved: boolean | null;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = interact.options.find((o) => o.id === picked);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 ring-1 ring-amber-200">
        {interact.scene}
      </div>
      <p className="text-base font-extrabold text-slate-900">{interact.prompt}</p>
      <div className="space-y-2">
        {interact.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={resolved !== null}
            onClick={() => {
              setPicked(option.id);
              onResolved(option.correct);
            }}
            className={`flex w-full rounded-2xl px-4 py-3 text-left text-sm font-bold ring-1 ${
              picked === option.id
                ? option.correct
                  ? 'bg-emerald-50 text-emerald-900 ring-emerald-300'
                  : 'bg-rose-50 text-rose-900 ring-rose-300'
                : 'bg-slate-50 text-slate-800 ring-slate-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {chosen && resolved !== null && <Feedback ok={resolved} text={chosen.feedback} />}
    </div>
  );
}
