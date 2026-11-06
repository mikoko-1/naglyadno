import { useRef } from 'react';
import { DENOMINATOR_MAX, DENOMINATOR_MIN } from '../data/levels.ts';

const THUMB = 32;

type DenominatorSliderProps = {
  value: number;
  onChange: (denominator: number) => void;
};

function partsLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 < 10 || mod100 > 20) {
    if (mod10 === 1) return `${count} часть`;
    if (mod10 >= 2 && mod10 <= 4) return `${count} части`;
  }
  return `${count} частей`;
}

function offset(value: number): string {
  const span = DENOMINATOR_MAX - DENOMINATOR_MIN;
  const ratio = (value - DENOMINATOR_MIN) / span;
  return `calc((100% - ${THUMB}px) * ${ratio})`;
}

function valueFromClientX(clientX: number, rect: DOMRect): number {
  const usable = rect.width - THUMB;
  const x = clientX - rect.left - THUMB / 2;
  const ratio = usable <= 0 ? 0 : Math.min(1, Math.max(0, x / usable));
  const raw = DENOMINATOR_MIN + ratio * (DENOMINATOR_MAX - DENOMINATOR_MIN);
  return Math.round(raw);
}

export function DenominatorSlider({ value, onChange }: DenominatorSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const ratio = (value - DENOMINATOR_MIN) / (DENOMINATOR_MAX - DENOMINATOR_MIN);
  const ticks = Array.from(
    { length: DENOMINATOR_MAX - DENOMINATOR_MIN + 1 },
    (_, index) => DENOMINATOR_MIN + index,
  );

  function updateFromPointer(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    onChange(valueFromClientX(clientX, rect));
  }

  function step(next: number) {
    const clamped = Math.min(DENOMINATOR_MAX, Math.max(DENOMINATOR_MIN, next));
    onChange(clamped);
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-sm font-extrabold text-slate-800">Части пирога</p>
        <p className="text-xs font-bold text-slate-400">от 2 до 10</p>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={DENOMINATOR_MIN}
        aria-valuemax={DENOMINATOR_MAX}
        aria-valuenow={value}
        aria-valuetext={partsLabel(value)}
        aria-label="Знаменатель: на сколько равных частей разрезан пирог"
        className="relative h-12 touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromPointer(event.clientX);
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          updateFromPointer(event.clientX);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            step(value + 1);
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            step(value - 1);
          } else if (event.key === 'Home') {
            event.preventDefault();
            step(DENOMINATOR_MIN);
          } else if (event.key === 'End') {
            event.preventDefault();
            step(DENOMINATOR_MAX);
          }
        }}
      >
        <div className="absolute top-1/2 right-4 left-4 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 left-4 h-1.5 -translate-y-1/2 rounded-full bg-indigo-600"
          style={{ width: `calc((100% - ${THUMB}px) * ${ratio})` }}
        />
        <div
          className="absolute top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-sm font-extrabold text-indigo-700 shadow-[0_4px_14px_rgba(15,23,42,0.14)] ring-2 ring-indigo-600"
          style={{ left: offset(value) }}
        >
          {value}
        </div>
      </div>

      <div className="relative mt-1 h-9">
        {ticks.map((tick) => (
          <button
            key={tick}
            type="button"
            style={{ left: offset(tick), width: THUMB }}
            className={`absolute top-0 grid h-9 place-items-center rounded-lg text-sm font-extrabold transition-colors ${
              tick === value ? 'text-indigo-700' : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => onChange(tick)}
            aria-pressed={tick === value}
            aria-label={partsLabel(tick)}
          >
            {tick}
          </button>
        ))}
      </div>

      <p className="text-sm leading-relaxed text-slate-500">
        Знаменатель — на сколько равных частей разрезан пирог.
      </p>
    </div>
  );
}
