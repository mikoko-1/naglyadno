import { useMemo, useState } from 'react';

type FormulaXRayProps = {
  dark?: boolean;
};

/**
 * Слайдер «рентген»: сухая алгебра → геометрическая модель (a+b)².
 */
export function FormulaXRay({ dark }: FormulaXRayProps) {
  const [t, setT] = useState(35);
  const blend = t / 100;

  const a = 56;
  const b = 34;
  const size = a + b;

  const algebraOpacity = 1 - blend;
  const geoOpacity = blend;

  const labels = useMemo(
    () => [
      { key: 'a2', label: 'a²', color: '#6366f1' },
      { key: 'ab1', label: 'ab', color: '#14b8a6' },
      { key: 'ab2', label: 'ab', color: '#14b8a6' },
      { key: 'b2', label: 'b²', color: '#f59e0b' },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Режим рентгена · (a + b)²</h3>
        <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          Тяни слайдер: символы превращаются в площади. Физический смысл формулы — квадрат со стороной a+b.
        </p>
      </div>

      <label className="block">
        <div className="mb-2 flex justify-between text-xs font-semibold">
          <span className={dark ? 'text-slate-400' : 'text-slate-500'}>Алгебра</span>
          <span className="tabular-nums text-indigo-500">{t}%</span>
          <span className={dark ? 'text-slate-400' : 'text-slate-500'}>Геометрия</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={t}
          onChange={(e) => setT(Number(e.target.value))}
          className="w-full accent-indigo-500"
          aria-label="Слайдер рентгена формулы"
        />
      </label>

      <div
        className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 ${
          dark ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}
        style={{ minHeight: 280 }}
      >
        {/* Алгебраический слой */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-300"
          style={{ opacity: algebraOpacity }}
        >
          <p className={`font-mono text-2xl font-semibold sm:text-3xl ${dark ? 'text-slate-100' : 'text-slate-900'}`}>
            (a + b)²
          </p>
          <p className={`font-mono text-lg ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            = a² + 2ab + b²
          </p>
          <p className={`max-w-xs text-center text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
            Пока это запись. Сдвинь слайдер вправо — увидишь, откуда берутся слагаемые.
          </p>
        </div>

        {/* Геометрический слой */}
        <div
          className="relative mx-auto flex flex-col items-center justify-center transition-opacity duration-300"
          style={{ opacity: geoOpacity }}
        >
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-xs" role="img" aria-label="Квадрат (a+b)^2">
            <rect x={0} y={0} width={a} height={a} fill={labels[0].color} opacity={0.85} />
            <rect x={a} y={0} width={b} height={a} fill={labels[1].color} opacity={0.85} />
            <rect x={0} y={a} width={a} height={b} fill={labels[2].color} opacity={0.85} />
            <rect x={a} y={a} width={b} height={b} fill={labels[3].color} opacity={0.9} />
            <text x={a / 2} y={a / 2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="700">
              a²
            </text>
            <text x={a + b / 2} y={a / 2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="700">
              ab
            </text>
            <text x={a / 2} y={a + b / 2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="700">
              ab
            </text>
            <text x={a + b / 2} y={a + b / 2} textAnchor="middle" dominantBaseline="middle" fill="#111" fontSize="9" fontWeight="700">
              b²
            </text>
            {/* Разметки сторон */}
            <text x={a / 2} y={-4} textAnchor="middle" fill={dark ? '#94a3b8' : '#64748b'} fontSize="7">
              a
            </text>
            <text x={a + b / 2} y={-4} textAnchor="middle" fill={dark ? '#94a3b8' : '#64748b'} fontSize="7">
              b
            </text>
          </svg>
          <p className={`mt-3 text-center text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            Площадь большого квадрата = a² + ab + ab + b² = a² + 2ab + b²
          </p>
        </div>
      </div>

      <div className={`grid gap-2 sm:grid-cols-3 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
        {[
          ['a²', 'квадрат стороны a'],
          ['2ab', 'два прямоугольника a×b'],
          ['b²', 'квадрат стороны b'],
        ].map(([title, desc]) => (
          <div
            key={title}
            className={`rounded-2xl px-3 py-2 text-xs ${dark ? 'bg-white/5' : 'bg-white ring-1 ring-slate-200'}`}
          >
            <p className="font-semibold text-indigo-500">{title}</p>
            <p className="mt-0.5 opacity-80">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
