import { motion, useReducedMotion } from 'framer-motion';
import { useId, useMemo } from 'react';
import { buildSectors } from '../lib/pieGeometry.ts';

/** Центр и радиус в координатах viewBox 0 0 200 200. Корка рисуется чуть шире. */
const CX = 100;
const CY = 100;
const RADIUS = 80;

type FractionPieProps = {
  denominator: number;
  selectedSlices: readonly boolean[];
  onToggle: (index: number) => void;
};

export function FractionPie({ denominator, selectedSlices, onToggle }: FractionPieProps) {
  const reduceMotion = useReducedMotion();
  const rawId = useId().replace(/:/g, '');
  const fillId = `slice-fill-${rawId}`;
  const shadowId = `pie-shadow-${rawId}`;
  const sectors = useMemo(() => buildSectors(denominator, CX, CY, RADIUS), [denominator]);

  return (
    <motion.div
      key={denominator}
      initial={reduceMotion ? false : { opacity: 0.35, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <svg
        viewBox="0 0 200 200"
        className="mx-auto h-auto w-full max-w-[440px] touch-manipulation select-none overflow-visible"
        role="group"
        aria-label={`Пирог, разделённый на ${denominator} равных частей`}
        fontFamily="Nunito, Segoe UI, sans-serif"
      >
        <defs>
          <filter id={shadowId} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0f172a" floodOpacity="0.12" />
          </filter>
          <linearGradient id={fillId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#5eead4" />
          </linearGradient>
        </defs>

        <circle cx={CX} cy={CY} r="93" fill="#fff7ed" filter={`url(#${shadowId})`} />
        <circle cx={CX} cy={CY} r="91" fill="#f3e0c8" />
        <circle cx={CX} cy={CY} r="83" fill="#fffdfb" />

        <g>
          {sectors.map((sector) => {
            const selected = selectedSlices[sector.index] ?? false;
            return (
              <g
                key={sector.index}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={`Часть ${sector.index + 1} из ${denominator}, ${selected ? 'выделена' : 'не выделена'}`}
                data-slice={sector.index}
                data-selected={selected}
                className="pie-slice cursor-pointer outline-none focus-visible:[&_.slice-edge]:stroke-indigo-600"
                onClick={() => onToggle(sector.index)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  onToggle(sector.index);
                }}
              >
                <path
                  className="slice-edge"
                  d={sector.path}
                  fill="#fffdfb"
                  stroke="#eadfce"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
                <motion.path
                  d={sector.path}
                  fill={`url(#${fillId})`}
                  initial={false}
                  animate={{ opacity: selected ? 1 : 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.28 }}
                  pointerEvents="none"
                />
                {!selected && (
                  <path
                    d={sector.path}
                    fill="#e0e7ff"
                    className="hover-slice pointer-events-none opacity-0 transition-opacity duration-200"
                  />
                )}
                <text
                  x={sector.label.x}
                  y={sector.label.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={denominator >= 8 ? 8 : 11}
                  fontWeight={800}
                  fill={selected ? '#1e1b4b' : '#94a3b8'}
                  pointerEvents="none"
                  aria-hidden="true"
                >
                  {sector.index + 1}
                </text>
              </g>
            );
          })}
        </g>

        <circle cx={CX} cy={CY} r="6" fill="#ffffff" stroke="#eadfce" pointerEvents="none" />
      </svg>
    </motion.div>
  );
}
