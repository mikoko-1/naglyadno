import { useMemo, useState } from 'react';

type StressTestSandboxProps = {
  dark?: boolean;
};

type Mode = 'div0' | 'sqrtNeg';

export function StressTestSandbox({ dark }: StressTestSandboxProps) {
  const [mode, setMode] = useState<Mode>('div0');
  const [denom, setDenom] = useState(1);
  const [underRoot, setUnderRoot] = useState(4);

  const denomSafe = Math.max(denom, 0.001);
  const quotient = 1 / denomSafe;
  const nearSingularity = denom < 0.05;

  const path = useMemo(() => {
    // y = 1/x for x in (0.02 .. 2]
    const pts: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const x = 0.02 + (i / 80) * 1.98;
      const y = 1 / x;
      const px = 20 + (x / 2) * 260;
      const py = 160 - Math.min(y, 40) * 3.2;
      pts.push(`${px},${py}`);
    }
    return pts.join(' ');
  }, []);

  const markerX = 20 + (denomSafe / 2) * 260;
  const markerY = 160 - Math.min(quotient, 40) * 3.2;

  // Complex: sqrt(re + i*0) when re < 0 → 0 + i*sqrt(|re|)
  const imag = underRoot < 0 ? Math.sqrt(-underRoot) : 0;
  const real = underRoot >= 0 ? Math.sqrt(underRoot) : 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Песочница разрушений</h3>
        <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          Ломай привычные операции осознанно: смотри, где математика упирается в стену — и почему.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['div0', '÷ на ноль'],
            ['sqrtNeg', '√ из отрицательного'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              mode === id
                ? 'bg-indigo-600 text-white'
                : dark
                  ? 'bg-white/5 text-slate-300 ring-1 ring-white/10'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'div0' && (
        <div
          className={`rounded-3xl border p-5 ${dark ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}
        >
          <p className="font-mono text-xl font-semibold">
            1 ÷ {denom.toFixed(3)} ={' '}
            <span className={nearSingularity ? 'text-rose-500' : 'text-indigo-500'}>
              {quotient > 500 ? '→ ∞' : quotient.toFixed(2)}
            </span>
          </p>
          <label className="mt-4 block">
            <span className={`text-xs font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Знаменатель → 0
            </span>
            <input
              type="range"
              min={0.001}
              max={1}
              step={0.001}
              value={denom}
              onChange={(e) => setDenom(Number(e.target.value))}
              className="mt-2 w-full accent-rose-500"
            />
          </label>

          <svg viewBox="0 0 300 180" className="mt-4 w-full" role="img" aria-label="График 1/x">
            <line x1="20" y1="160" x2="290" y2="160" stroke={dark ? '#334155' : '#cbd5e1'} />
            <line x1="20" y1="160" x2="20" y2="10" stroke={dark ? '#334155' : '#cbd5e1'} />
            <polyline fill="none" stroke="#6366f1" strokeWidth="2" points={path} />
            <line
              x1="20"
              y1="10"
              x2="20"
              y2="160"
              stroke="#f43f5e"
              strokeDasharray="4 3"
              opacity={nearSingularity ? 1 : 0.25}
            />
            <circle cx={markerX} cy={markerY} r="5" fill="#f43f5e" />
            <text x="24" y="18" fill={dark ? '#94a3b8' : '#64748b'} fontSize="9">
              y = 1/x
            </text>
            <text x="250" y="175" fill={dark ? '#94a3b8' : '#64748b'} fontSize="9">
              x → 0
            </text>
          </svg>

          <p className={`mt-3 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            {nearSingularity
              ? 'Сингулярность: величина уходит в бесконечность. В вещественных числах деление на ноль не определено — нет конечного результата.'
              : 'Уменьшай знаменатель — смотри, как график взлетает. Это визуальный «запрет» операции 1÷0.'}
          </p>
        </div>
      )}

      {mode === 'sqrtNeg' && (
        <div
          className={`rounded-3xl border p-5 ${dark ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}
        >
          <p className="font-mono text-xl font-semibold">
            √({underRoot}) ={' '}
            {underRoot >= 0 ? (
              <span className="text-indigo-500">{real.toFixed(2)}</span>
            ) : (
              <span className="text-violet-400">
                {real.toFixed(0)} + {imag.toFixed(2)}i
              </span>
            )}
          </p>
          <label className="mt-4 block">
            <span className={`text-xs font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Подкоренное выражение
            </span>
            <input
              type="range"
              min={-9}
              max={9}
              step={0.1}
              value={underRoot}
              onChange={(e) => setUnderRoot(Number(e.target.value))}
              className="mt-2 w-full accent-violet-500"
            />
          </label>

          <svg viewBox="0 0 300 200" className="mt-4 w-full" role="img" aria-label="Комплексная плоскость">
            <line x1="20" y1="100" x2="280" y2="100" stroke={dark ? '#334155' : '#cbd5e1'} />
            <line x1="150" y1="20" x2="150" y2="180" stroke={dark ? '#334155' : '#cbd5e1'} />
            <text x="270" y="95" fill={dark ? '#94a3b8' : '#64748b'} fontSize="9">
              Re
            </text>
            <text x="155" y="28" fill={dark ? '#94a3b8' : '#64748b'} fontSize="9">
              Im
            </text>
            {/* Числовая прямая «подсветка» */}
            <rect x="20" y="96" width="260" height="8" fill="#6366f1" opacity={0.15} />
            <circle
              cx={150 + real * 18}
              cy={100 - imag * 18}
              r="7"
              fill={underRoot >= 0 ? '#6366f1' : '#a78bfa'}
            />
            {underRoot < 0 && (
              <path
                d={`M ${150 + 4} 100 Q ${150 + 20} ${100 - imag * 9} ${150} ${100 - imag * 18}`}
                fill="none"
                stroke="#a78bfa"
                strokeDasharray="3 2"
              />
            )}
          </svg>

          <p className={`mt-3 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            {underRoot >= 0
              ? 'Ответ лежит на действительной оси (числовая прямая).'
              : 'Выход за ℝ: появляется мнимая часть. Корень из отрицательного «поднимает» точку с прямой в комплексную плоскость.'}
          </p>
        </div>
      )}
    </div>
  );
}
