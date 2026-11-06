export type Point = {
  x: number;
  y: number;
};

export type Sector = {
  index: number;
  startAngle: number;
  endAngle: number;
  path: string;
  label: Point;
};

/**
 * Полярные координаты → точка на окружности в системе SVG.
 *
 * Обычная формула:
 *   x = cx + r · cos(θ)
 *   y = cy + r · sin(θ)
 *
 * В математике угол 0 смотрит вправо и растёт против часовой стрелки.
 * В SVG ось Y направлена вниз, поэтому та же формула визуально
 * закручивает угол по часовой — удобно резать пирог «как часы».
 *
 * θ задаётся в радианах.
 */
export function polarToCartesian(cx: number, cy: number, r: number, angle: number): Point {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

/**
 * Контур одного сектора.
 *
 * 1. M — встаём в центр пирога.
 * 2. L — идём на окружность в начало сектора.
 * 3. A — дуга радиуса r до конца сектора.
 * 4. Z — замыкаем контур обратно в центр.
 *
 * large-arc-flag = 1, только если сектор больше 180°.
 * При делении от 2 до 10 частей каждый сектор ≤ 180°, флаг остаётся 0,
 * но проверка оставлена, чтобы формула не сломалась при другом знаменателе.
 *
 * sweep-flag = 1 — дуга в сторону увеличения угла.
 * Из-за оси Y SVG это движение по часовой стрелке: от «12 часов» к «3», «6», «9».
 */
export function sectorPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${round(start.x)} ${round(start.y)}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${round(end.x)} ${round(end.y)}`,
    'Z',
  ].join(' ');
}

/**
 * Делит круг на `count` равных секторов.
 * Первый сектор начинается сверху (−π/2), дальше по часовой стрелке.
 * Небольшой зазор (не больше 8% сектора) отделяет куски друг от друга.
 */
export function buildSectors(count: number, cx: number, cy: number, r: number): Sector[] {
  const fullTurn = Math.PI * 2;
  const sectorAngle = fullTurn / count;
  const gap = Math.min(0.05, sectorAngle * 0.08);
  const origin = -Math.PI / 2;

  return Array.from({ length: count }, (_, index) => {
    const startAngle = origin + index * sectorAngle + gap / 2;
    const endAngle = origin + (index + 1) * sectorAngle - gap / 2;
    const label = polarToCartesian(cx, cy, r * 0.64, (startAngle + endAngle) / 2);

    return {
      index,
      startAngle,
      endAngle,
      path: sectorPath(cx, cy, r, startAngle, endAngle),
      label,
    };
  });
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
