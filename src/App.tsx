import { useCallback, useMemo, useState } from 'react';
import { LessonRunner } from './components/lesson/LessonRunner.tsx';
import { QuizRunner } from './components/quiz/QuizRunner.tsx';
import { AppHeader } from './components/shell/AppHeader.tsx';
import { CatalogView } from './components/shell/CatalogView.tsx';
import { HomeView } from './components/shell/HomeView.tsx';
import { TopicHub } from './components/shell/TopicHub.tsx';
import { getGrade, getTopic, type GradeId, type RouteState } from './curriculum/index.ts';
import {
  loadProgress,
  recordLessonComplete,
  recordResult,
  saveProgress,
  type ProgressState,
} from './lib/progress/storage.ts';
import { getTrainer } from './trainers/registry.ts';

function subtitleFor(route: RouteState): string {
  if (route.view === 'home') return 'Математика 5–9';
  if (route.view === 'catalog') return `${route.grade} класс`;
  if (route.view === 'topic' || route.view === 'trainer' || route.view === 'lesson') {
    return getTopic(route.grade, route.topicId)?.topic.title ?? `${route.grade} класс`;
  }
  if (route.view === 'quiz') {
    if (route.mode === 'control') return 'Контрольная';
    return route.mode === 'practice' ? 'Практика' : 'Тест';
  }
  return 'Наглядно';
}

export default function App() {
  const [route, setRoute] = useState<RouteState>({ view: 'home' });
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  const activeGrade: GradeId | undefined = useMemo(() => {
    if (route.view === 'home') return undefined;
    return route.grade;
  }, [route]);

  const persist = useCallback((next: ProgressState) => {
    setProgress(next);
    saveProgress(next);
  }, []);

  function toggleSound() {
    const next = { ...progress, soundOn: !progress.soundOn };
    persist(next);
    try {
      localStorage.setItem('naglyadno-sound', next.soundOn ? 'on' : 'off');
    } catch {
      // ignore
    }
  }

  function openGrade(grade: GradeId) {
    setRoute({ view: 'catalog', grade });
  }

  function handleQuizFinished(score: number, total: number) {
    if (route.view !== 'quiz') return;
    const id = route.mode === 'control' ? route.sectionId : route.topicId;
    if (!id) return;
    persist(recordResult(progress, route.mode, id, score, total));
  }

  function handleLessonComplete() {
    if (route.view !== 'lesson') return;
    persist(recordLessonComplete(progress, route.topicId));
  }

  function handleTrainerStreak(delta: number) {
    if (!Number.isFinite(delta)) {
      persist({ ...progress, streak: 0 });
      return;
    }
    persist({ ...progress, streak: Math.max(0, progress.streak + delta) });
  }

  const Trainer = route.view === 'trainer' ? getTrainer(route.topicId) : undefined;

  return (
    <div className="relative min-h-svh bg-[#f6f7fb] text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.16),transparent_62%)]" />
      <AppHeader
        subtitle={subtitleFor(route)}
        streak={progress.streak}
        soundOn={progress.soundOn}
        activeGrade={activeGrade}
        onToggleSound={toggleSound}
        onSelectGrade={openGrade}
        onHome={() => setRoute({ view: 'home' })}
      />

      <main className="relative mx-auto w-full max-w-5xl px-4 py-5 pb-16 sm:px-6 sm:py-8">
        {route.view === 'home' && <HomeView progress={progress} onOpenGrade={openGrade} />}

        {route.view === 'catalog' && (
          <CatalogView
            grade={route.grade}
            progress={progress}
            onOpenTopic={(topicId) => setRoute({ view: 'topic', grade: route.grade, topicId })}
            onOpenControl={(sectionId) =>
              setRoute({ view: 'quiz', grade: route.grade, mode: 'control', sectionId })
            }
          />
        )}

        {route.view === 'topic' && (
          <TopicHub
            grade={route.grade}
            topicId={route.topicId}
            progress={progress}
            onBack={() => setRoute({ view: 'catalog', grade: route.grade })}
            onLesson={() => setRoute({ view: 'lesson', grade: route.grade, topicId: route.topicId })}
            onPractice={() =>
              setRoute({
                view: 'quiz',
                grade: route.grade,
                mode: 'practice',
                topicId: route.topicId,
              })
            }
            onTest={() =>
              setRoute({
                view: 'quiz',
                grade: route.grade,
                mode: 'test',
                topicId: route.topicId,
              })
            }
            onTrainer={() =>
              setRoute({ view: 'trainer', grade: route.grade, topicId: route.topicId })
            }
          />
        )}

        {route.view === 'lesson' && (
          <LessonRunner
            grade={route.grade}
            topicId={route.topicId}
            onExit={() => setRoute({ view: 'topic', grade: route.grade, topicId: route.topicId })}
            onComplete={handleLessonComplete}
            onOpenTrainer={() =>
              setRoute({ view: 'trainer', grade: route.grade, topicId: route.topicId })
            }
          />
        )}

        {route.view === 'trainer' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setRoute({ view: 'topic', grade: route.grade, topicId: route.topicId })}
              className="text-sm font-extrabold text-slate-600 hover:text-indigo-700"
            >
              ← К теме
            </button>
            {Trainer ? (
              <Trainer onStreakDelta={handleTrainerStreak} soundOn={progress.soundOn} />
            ) : (
              <p className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
                Тренажёр для этой темы пока не подключен.
              </p>
            )}
          </div>
        )}

        {route.view === 'quiz' && (
          <QuizRunner
            grade={route.grade}
            mode={route.mode}
            topicId={route.topicId}
            sectionId={route.sectionId}
            onFinished={handleQuizFinished}
            onExit={() => {
              if (route.mode === 'control') {
                setRoute({ view: 'catalog', grade: route.grade });
                return;
              }
              if (route.topicId) {
                setRoute({ view: 'topic', grade: route.grade, topicId: route.topicId });
                return;
              }
              setRoute({ view: 'catalog', grade: route.grade });
            }}
          />
        )}
      </main>

      {route.view === 'catalog' && (
        <p className="sr-only">
          Открыт {getGrade(route.grade).title}: {getGrade(route.grade).sections.length} разделов
        </p>
      )}
    </div>
  );
}
