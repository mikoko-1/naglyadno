import type { GradeId } from '../../curriculum/types.ts';

export type ActivityResult = {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  at: string;
};

export type ProgressState = {
  streak: number;
  soundOn: boolean;
  /** Ключ: lesson:topicId | practice:topicId | test:topicId | control:sectionId */
  results: Record<string, ActivityResult>;
};

const STORAGE_KEY = 'naglyadno-progress-v1';

export const PASS_THRESHOLD = {
  practice: 0,
  test: 0.7,
  control: 0.6,
} as const;

function emptyState(): ProgressState {
  return { streak: 0, soundOn: true, results: {} };
}

export function resultKey(
  mode: 'lesson' | 'practice' | 'test' | 'control',
  id: string,
): string {
  return `${mode}:${id}`;
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as ProgressState;
    return {
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      soundOn: parsed.soundOn !== false,
      results: parsed.results ?? {},
    };
  } catch {
    return emptyState();
  }
}

export function saveProgress(state: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // private mode — прогресс живёт только в памяти сессии
  }
}

export function recordResult(
  state: ProgressState,
  mode: 'lesson' | 'practice' | 'test' | 'control',
  id: string,
  score: number,
  total: number,
): ProgressState {
  const percent = total === 0 ? 0 : score / total;
  const passed =
    mode === 'practice' || mode === 'lesson' ? true : percent >= PASS_THRESHOLD[mode];
  const key = resultKey(mode, id);
  const previous = state.results[key];
  const nextResult: ActivityResult = {
    score,
    total,
    percent: mode === 'lesson' ? 1 : percent,
    passed,
    at: new Date().toISOString(),
  };

  const keepBest =
    previous && previous.percent > nextResult.percent ? previous : nextResult;

  let streak = state.streak;
  if (mode === 'test' || mode === 'control') {
    streak = passed ? state.streak + 1 : 0;
  }

  return {
    ...state,
    streak,
    results: {
      ...state.results,
      [key]: keepBest,
    },
  };
}

export function recordLessonComplete(state: ProgressState, topicId: string): ProgressState {
  return recordResult(state, 'lesson', topicId, 1, 1);
}

export function topicStatus(
  state: ProgressState,
  topicId: string,
): {
  lessonDone: boolean;
  practiced: boolean;
  testPassed: boolean;
  bestTest?: ActivityResult;
} {
  const lesson = state.results[resultKey('lesson', topicId)];
  const practice = state.results[resultKey('practice', topicId)];
  const test = state.results[resultKey('test', topicId)];
  return {
    lessonDone: Boolean(lesson?.passed),
    practiced: Boolean(practice),
    testPassed: Boolean(test?.passed),
    bestTest: test,
  };
}

export function controlStatus(state: ProgressState, sectionId: string): ActivityResult | undefined {
  return state.results[resultKey('control', sectionId)];
}

export function gradeCompletion(state: ProgressState, topicIds: string[], sectionIds: string[]) {
  const testsPassed = topicIds.filter((id) => topicStatus(state, id).testPassed).length;
  const controlsPassed = sectionIds.filter((id) => controlStatus(state, id)?.passed).length;
  return {
    testsPassed,
    testsTotal: topicIds.length,
    controlsPassed,
    controlsTotal: sectionIds.length,
  };
}

export type { GradeId };
