/** Тип банка заданий по topicId — чтобы практика совпадала с темой. */
export type QuestionKind =
  | 'natural'
  | 'divisibility'
  | 'fractions'
  | 'decimals'
  | 'percents'
  | 'speed'
  | 'geometry'
  | 'line'
  | 'tables'
  | 'ratio'
  | 'rational'
  | 'equations'
  | 'powers'
  | 'poly'
  | 'systems'
  | 'functions'
  | 'roots'
  | 'quadratic'
  | 'inequalities'
  | 'rational-expr'
  | 'progressions'
  | 'trig'
  | 'vectors'
  | 'stereo'
  | 'coord'
  | 'review'
  | 'general';

export function detectKind(topicId: string): QuestionKind {
  const id = topicId.toLowerCase();

  if (id.includes('review') || id.includes('mix') && id.includes('g9-review')) return 'review';
  if (id.includes('review')) return 'review';

  if (id.includes('stereo') || id.includes('prism') || id.includes('cyl')) return 'stereo';
  if (id.includes('vector')) return 'vectors';
  if (id.includes('trig')) return 'trig';
  if (id.includes('prog')) return 'progressions';

  if (id.includes('quad-func') || id.includes('quad-shift') || id.includes('quad-zeros') || id.includes('quad-maxmin'))
    return 'quadratic';
  if (id.includes('quad-eq') || id.includes('quad-tasks') || id.includes('quad-vieta') || id.includes('quad-incomplete') || id.includes('quad-factor'))
    return 'quadratic';
  if (id.includes('quad')) return 'quadratic';

  if (id.includes('ineq')) return 'inequalities';
  if (id.includes('root')) return 'roots';

  if (id.includes('rat-') || id.includes('rational-expr') || (id.includes('g8-rat'))) return 'rational-expr';
  if (id.includes('rational') || id.includes('neg') && id.includes('rational')) return 'rational';

  if (id.includes('sys-')) return 'systems';
  if (id.includes('func-')) return 'functions';
  if (id.includes('poly') || id.includes('expr-')) return 'poly';
  if (id.includes('powers') || id.includes('power')) return 'powers';

  if (id.includes('eq-') || id.includes('equation')) return 'equations';

  if (id.includes('ratio') || id.includes('prop') || id.includes('scale') || id.includes('share') && id.includes('ratio'))
    return 'ratio';
  if (id.includes('ratio')) return 'ratio';

  if (id.includes('percent') || id.includes('percents')) return 'percents';
  if (id.includes('speed')) return 'speed';

  if (id.includes('dec') || id.includes('decimal')) return 'decimals';
  if (id.includes('frac') || id.includes('fraction')) return 'fractions';

  if (id.includes('div') || id.includes('prime') || id.includes('gcd') || id.includes('lcm') || id.includes('factor'))
    return 'divisibility';

  if (id.includes('natural') || id.includes('round') && id.includes('g5')) return 'natural';
  if (id.includes('table')) return 'tables';
  if (id.includes('line-coord') || id.includes('plane-point') || id.includes('coord-line') || id.includes('coord-method'))
    return 'coord';
  if (id.includes('line')) return 'line';
  if (id.includes('coord')) return 'coord';

  if (
    id.includes('geo') ||
    id.includes('angle') ||
    id.includes('area') ||
    id.includes('perimeter') ||
    id.includes('circle') ||
    id.includes('triangle') ||
    id.includes('parallel') ||
    id.includes('pythagoras') ||
    id.includes('similar') ||
    id.includes('plane-figure')
  )
    return 'geometry';

  if (id.includes('natural')) return 'natural';

  return 'general';
}
