import type { LessonVisual } from '../../curriculum/types.ts';

type LessonVisualsProps = {
  visual?: LessonVisual;
};

export function LessonVisuals({ visual }: LessonVisualsProps) {
  if (!visual || visual === 'none') return null;

  if (visual === 'pie') {
    return (
      <svg viewBox="0 0 160 160" className="mx-auto mt-4 h-40 w-40" aria-hidden="true">
        <circle cx="80" cy="80" r="70" fill="#fff7ed" stroke="#f3e0c8" strokeWidth="8" />
        <path d="M80 80 L80 10 A70 70 0 0 1 149 95 Z" fill="#818cf8" />
        <path d="M80 80 L149 95 A70 70 0 0 1 80 150 Z" fill="#5eead4" />
        <path d="M80 80 L80 150 A70 70 0 0 1 11 95 Z" fill="#e0e7ff" />
        <path d="M80 80 L11 95 A70 70 0 0 1 80 10 Z" fill="#fffdfb" stroke="#eadfce" />
        <circle cx="80" cy="80" r="5" fill="#fff" stroke="#eadfce" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 280 64" className="mx-auto mt-4 h-16 w-full max-w-sm" aria-hidden="true">
      <line x1="16" y1="32" x2="264" y2="32" stroke="#94a3b8" strokeWidth="3" />
      {[0, 1, 2, 3, 4].map((n) => {
        const x = 40 + n * 50;
        return (
          <g key={n}>
            <line x1={x} y1="24" x2={x} y2="40" stroke="#64748b" strokeWidth="2" />
            <text x={x} y="56" textAnchor="middle" fontSize="12" fontWeight="700" fill="#64748b">
              {n}
            </text>
          </g>
        );
      })}
      <circle cx="115" cy="32" r="7" fill="#4f46e5" />
      <text x="115" y="18" textAnchor="middle" fontSize="11" fontWeight="800" fill="#4f46e5">
        1/2
      </text>
    </svg>
  );
}
