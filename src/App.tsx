import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccountPanel } from './components/account/AccountPanel.tsx';
import { PaywallModal } from './components/billing/PaywallModal.tsx';
import { TrialLockedView } from './components/billing/TrialLockedView.tsx';
import { InfiniteExamGenerator } from './components/exam/InfiniteExamGenerator.tsx';
import { LessonRunner } from './components/lesson/LessonRunner.tsx';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow.tsx';
import { DailyPlanView } from './components/plan/DailyPlanView.tsx';
import { MiniDrillModal } from './components/plan/MiniDrillModal.tsx';
import { ParentReportView } from './components/parent/ParentReportView.tsx';
import { QuizRunner } from './components/quiz/QuizRunner.tsx';
import { WeakSpotsRadar } from './components/radar/WeakSpotsRadar.tsx';
import { SocratesFab, SocraticAITutor } from './components/socratic/SocraticAITutor.tsx';
import { LegalDocView } from './components/legal/LegalDocView.tsx';
import { AppHeader } from './components/shell/AppHeader.tsx';
import { CatalogView } from './components/shell/CatalogView.tsx';
import { HomeView } from './components/shell/HomeView.tsx';
import { SiteFooter } from './components/shell/SiteFooter.tsx';
import { TopicHub } from './components/shell/TopicHub.tsx';
import { YearTrackView } from './components/year/YearTrackView.tsx';
import type { LegalDocId } from './lib/legal/seller.ts';
import { LEGAL_DOC_TITLES } from './lib/legal/seller.ts';
import {
  getGrade,
  getTopic,
  type AppMode,
  type GradeId,
  type RouteState,
} from './curriculum/index.ts';
import { canUse, socratesLeft } from './lib/account/limits.ts';
import {
  bumpExamStart,
  bumpSocrates,
  defaultAccount,
  ensureTrialStarted,
  hasFullAccess,
  loadAccount,
  logActivity,
  saveAccount,
  type AccountState,
} from './lib/account/storage.ts';
import {
  loadProgress,
  recordLessonComplete,
  recordResult,
  saveProgress,
  type ProgressState,
} from './lib/progress/storage.ts';
import { loadSkills, type MicroSkillId, type SkillsState } from './lib/skills/microSkills.ts';
import { confirmRobokassaFromUrl } from './lib/billing/confirmRobokassa.ts';
import {
  getSessionUserId,
  onAuthChange,
  pullCloudState,
  scheduleCloudPush,
} from './lib/supabase/sync.ts';
import {
  getGradeYear,
  loadYearProgress,
  markActivity,
  saveYearProgress,
  type YearProgressState,
} from './lib/year/progress.ts';
import { getTrainer } from './trainers/registry.ts';

type Theme = 'light' | 'dark';

function subtitleFor(route: RouteState): string {
  if (route.view === 'home') return 'Математика 5–9 · учебный год';
  if (route.view === 'year') return `Учебный год · ${route.grade} класс`;
  if (route.view === 'plan') return 'План на сегодня';
  if (route.view === 'exam') return 'Бесконечная контрольная';
  if (route.view === 'radar') return 'Диагностический радар';
  if (route.view === 'parent') return 'Кабинет родителя';
  if (route.view === 'account') return 'Аккаунт и подписка';
  if (route.view === 'legal') return LEGAL_DOC_TITLES[route.doc];
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

function modeFromRoute(route: RouteState): AppMode {
  if (route.view === 'year') return 'year';
  if (route.view === 'exam') return 'exam';
  if (route.view === 'radar') return 'radar';
  if (route.view === 'plan') return 'plan';
  if (route.view === 'parent') return 'parent';
  if (route.view === 'account') return 'account';
  return 'lessons';
}

function loadTheme(): Theme {
  try {
    return localStorage.getItem('naglyadno-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export default function App() {
  const [route, setRoute] = useState<RouteState>({ view: 'home' });
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [skills, setSkills] = useState<SkillsState>(() => loadSkills());
  const [account, setAccount] = useState<AccountState>(() => ensureTrialStarted(loadAccount()));
  const [yearProgress, setYearProgress] = useState<YearProgressState>(() => loadYearProgress());
  const [theme, setTheme] = useState<Theme>(() => loadTheme());
  const [socratesOpen, setSocratesOpen] = useState(false);
  const [socratesContext, setSocratesContext] = useState<string | undefined>();
  const [socratesSeed, setSocratesSeed] = useState<string | undefined>();
  const [socratesLimitHint, setSocratesLimitHint] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<string | undefined>();
  const [drillSkill, setDrillSkill] = useState<MicroSkillId | null>(null);

  const dark = theme === 'dark';
  const mode = modeFromRoute(route);
  const fullAccess = hasFullAccess(account);
  const accessLocked = account.onboardingDone && !fullAccess;

  const activeGrade: GradeId | undefined = useMemo(() => {
    if (route.view === 'exam') return route.grade ?? account.grade;
    if (route.view === 'year' || route.view === 'catalog' || route.view === 'topic' || route.view === 'lesson' || route.view === 'trainer' || route.view === 'quiz') {
      return route.grade;
    }
    return account.onboardingDone ? account.grade : undefined;
  }, [route, account]);

  const persistYear = useCallback(
    (next: YearProgressState) => {
      setYearProgress(next);
      saveYearProgress(next);
      scheduleCloudPush({ account, progress, year: next });
    },
    [account, progress],
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    try {
      localStorage.setItem('naglyadno-theme', theme);
    } catch {
      // ignore
    }
  }, [dark, theme]);

  useEffect(() => {
    function applyCloud(bundle: {
      account: AccountState;
      progress: ProgressState;
      year: YearProgressState;
    }) {
      setAccount(bundle.account);
      setProgress(bundle.progress);
      setYearProgress(bundle.year);
    }

    void getSessionUserId().then(async (id) => {
      if (!id) return;
      const pulled = await pullCloudState();
      if (pulled) applyCloud(pulled);
    });

    return onAuthChange((id) => {
      if (!id) return;
      void pullCloudState().then((pulled) => {
        if (pulled) applyCloud(pulled);
      });
    });
  }, []);

  // Возврат с Робокассы: подтверждаем оплату (Result URL часто даёт 401 без JWT)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromRobokassa =
      params.get('paid') === '1' ||
      ((params.has('InvId') || params.has('inv_id')) &&
        (params.has('OutSum') || params.has('out_summ')));
    if (!fromRobokassa) return;

    let cancelled = false;
    void (async () => {
      const id = await getSessionUserId();
      if (!id || cancelled) return;

      if (params.has('InvId') || params.has('inv_id')) {
        await confirmRobokassaFromUrl(params);
      }

      for (let i = 0; i < 4 && !cancelled; i++) {
        const pulled = await pullCloudState();
        if (pulled) {
          setAccount(ensureTrialStarted(pulled.account));
          setProgress(pulled.progress);
          setYearProgress(pulled.year);
          if (pulled.account.plan === 'plus') break;
        }
        await new Promise((r) => setTimeout(r, 1200));
      }

      const clean = new URLSearchParams(params);
      for (const key of [...clean.keys()]) {
        if (
          key === 'paid' ||
          key === 'OutSum' ||
          key === 'out_summ' ||
          key === 'InvId' ||
          key === 'inv_id' ||
          key === 'SignatureValue' ||
          key === 'crc' ||
          key === 'Culture' ||
          key === 'IsTest' ||
          key === 'PaymentMethod' ||
          key === 'IncSum' ||
          key === 'IncCurrLabel' ||
          key === 'EMail' ||
          key === 'Fee' ||
          key.startsWith('Shp_')
        ) {
          clean.delete(key);
        }
      }
      const qs = clean.toString();
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`,
      );
      setRoute({ view: 'account' });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const persistProgress = useCallback(
    (next: ProgressState) => {
      setProgress(next);
      saveProgress(next);
      scheduleCloudPush({ account, progress: next, year: yearProgress });
    },
    [account, yearProgress],
  );

  const persistAccount = useCallback(
    (next: AccountState) => {
      const stamped = ensureTrialStarted(next);
      setAccount(stamped);
      saveAccount(stamped);
      scheduleCloudPush({ account: stamped, progress, year: yearProgress });
    },
    [progress, yearProgress],
  );

  function openPaywall(reason: string) {
    setPaywallReason(reason);
    setPaywallOpen(true);
  }

  function openLegal(doc: LegalDocId) {
    setRoute({ view: 'legal', doc });
  }

  function openSocrates(payload?: { contextNote?: string; seedUserMessage?: string }) {
    setSocratesContext(payload?.contextNote);
    setSocratesSeed(payload?.seedUserMessage);
    setSocratesLimitHint(null);
    setSocratesOpen(true);
  }

  function gateSocratesSend(): boolean {
    const gate = canUse(account, 'socrates');
    if (!gate.ok) {
      setSocratesLimitHint(gate.reason ?? 'Лимит');
      openPaywall(gate.reason ?? 'Нужен Плюс для безлимита Сократа');
      return false;
    }
    const next = bumpSocrates(account);
    persistAccount(next);
    setSocratesLimitHint(
      socratesLeft(next) !== null ? `Осталось сообщений сегодня: ${socratesLeft(next)}` : null,
    );
    return true;
  }

  function gateExamStart(examMode: 'express' | 'full' | 'surgical'): boolean {
    if (examMode === 'surgical') {
      const gate = canUse(account, 'surgical');
      if (!gate.ok) {
        openPaywall(gate.reason ?? 'Хирургия на Плюс');
        return false;
      }
    }
    const gate = canUse(account, 'exam');
    if (!gate.ok) {
      openPaywall(gate.reason ?? 'Лимит контрольных');
      return false;
    }
    persistAccount(bumpExamStart(account));
    return true;
  }

  function toggleSound() {
    const next = { ...progress, soundOn: !progress.soundOn };
    persistProgress(next);
    try {
      localStorage.setItem('naglyadno-sound', next.soundOn ? 'on' : 'off');
    } catch {
      // ignore
    }
  }

  function openGrade(grade: GradeId) {
    setRoute({ view: 'catalog', grade });
  }

  function handleModeChange(next: AppMode) {
    if (accessLocked && next !== 'account') {
      openPaywall('Пробный период закончился — нужен Плюс');
      setRoute({ view: 'account' });
      return;
    }
    if (next === 'year') {
      setRoute({ view: 'year', grade: account.grade || activeGrade || 6 });
      return;
    }
    if (next === 'exam') {
      setRoute({ view: 'exam', grade: account.grade || activeGrade || 6 });
      return;
    }
    if (next === 'radar') {
      setRoute({ view: 'radar' });
      return;
    }
    if (next === 'plan') {
      setRoute({ view: 'plan' });
      return;
    }
    if (next === 'parent') {
      setRoute({ view: 'parent' });
      return;
    }
    if (next === 'account') {
      setRoute({ view: 'account' });
      return;
    }
    if (account.grade) setRoute({ view: 'catalog', grade: account.grade });
    else if (activeGrade) setRoute({ view: 'catalog', grade: activeGrade });
    else setRoute({ view: 'home' });
  }

  function handleQuizFinished(score: number, total: number) {
    if (route.view !== 'quiz') return;
    const id = route.mode === 'control' ? route.sectionId : route.topicId;
    if (!id) return;
    persistProgress(recordResult(progress, route.mode, id, score, total));
    persistAccount(
      logActivity(account, {
        minutes: Math.max(3, Math.round(total * 1.2)),
        correct: score,
        attempts: total,
      }),
    );
    if (route.yearWeek && (route.mode === 'practice' || route.mode === 'test')) {
      persistYear(markActivity(yearProgress, route.grade, route.yearWeek, route.mode));
    }
  }

  function handleLessonComplete() {
    if (route.view !== 'lesson') return;
    persistProgress(recordLessonComplete(progress, route.topicId));
    persistAccount(logActivity(account, { minutes: 10, correct: 1, attempts: 1 }));
    if (route.yearWeek) {
      persistYear(markActivity(yearProgress, route.grade, route.yearWeek, 'lesson'));
    }
  }

  function handleTrainerStreak(delta: number) {
    if (!Number.isFinite(delta)) {
      persistProgress({ ...progress, streak: 0 });
      return;
    }
    persistProgress({ ...progress, streak: Math.max(0, progress.streak + delta) });
  }

  const Trainer = route.view === 'trainer' ? getTrainer(route.topicId) : undefined;

  if (!account.onboardingDone) {
    if (route.view === 'legal') {
      return (
        <div className={`min-h-svh ${dark ? 'bg-slate-950 text-slate-100' : 'bg-[#f6f7fb] text-slate-900'}`}>
          <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <LegalDocView
              doc={route.doc}
              dark={dark}
              onBack={() => setRoute({ view: 'home' })}
              onOpenDoc={openLegal}
            />
          </main>
          <SiteFooter dark={dark} onOpenLegal={openLegal} />
        </div>
      );
    }

    return (
      <div className={`min-h-svh px-4 py-8 ${dark ? 'bg-slate-950 text-slate-100' : 'bg-[#f6f7fb] text-slate-900'}`}>
        <div className="mx-auto mb-6 flex max-w-lg items-center justify-between">
          <p className="text-sm font-semibold">Наглядно</p>
          <button
            type="button"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="text-xs font-semibold text-indigo-500"
          >
            {dark ? 'Светлая' : 'Тёмная'}
          </button>
        </div>
        <OnboardingFlow
          account={account}
          skills={skills}
          dark={dark}
          onDone={(nextAccount, nextSkills) => {
            persistAccount(nextAccount);
            setSkills(nextSkills);
            setRoute({ view: 'year', grade: nextAccount.grade });
          }}
        />
        <SiteFooter dark={dark} onOpenLegal={openLegal} />
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-svh transition-colors ${
        dark ? 'bg-slate-950 text-slate-100' : 'bg-[#f6f7fb] text-slate-900'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-72 ${
          dark
            ? 'bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.22),transparent_62%)]'
            : 'bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.16),transparent_62%)]'
        }`}
      />
      <AppHeader
        subtitle={subtitleFor(route)}
        streak={progress.streak}
        soundOn={progress.soundOn}
        dark={dark}
        mode={mode}
        account={account}
        activeGrade={activeGrade}
        onToggleSound={toggleSound}
        onToggleTheme={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
        onSelectGrade={openGrade}
        onHome={() => setRoute({ view: 'home' })}
        onModeChange={handleModeChange}
      />

      <main className="relative mx-auto w-full max-w-5xl px-4 py-5 pb-8 sm:px-6 sm:py-8">
        {route.view === 'legal' && (
          <LegalDocView
            doc={route.doc}
            dark={dark}
            onBack={() => setRoute({ view: accessLocked ? 'account' : 'home' })}
            onOpenDoc={openLegal}
          />
        )}

        {accessLocked && route.view !== 'account' && route.view !== 'legal' && (
          <TrialLockedView
            dark={dark}
            onPay={() => openPaywall('Пробный период закончился — оформи Плюс')}
            onAccount={() => setRoute({ view: 'account' })}
          />
        )}

        {!accessLocked && route.view === 'home' && (
          <HomeView progress={progress} onOpenGrade={openGrade} />
        )}

        {!accessLocked && route.view === 'year' && (
          <YearTrackView
            grade={route.grade}
            yearProgress={yearProgress}
            dark={dark}
            onMark={(week, activity) => persistYear(markActivity(yearProgress, route.grade, week, activity))}
            onToggleUnlockAll={() => {
              const g = getGradeYear(yearProgress, route.grade);
              persistYear({
                ...yearProgress,
                byGrade: {
                  ...yearProgress.byGrade,
                  [route.grade]: { ...g, unlockAll: !g.unlockAll },
                },
              });
            }}
            onOpenLesson={(topicId, week) =>
              setRoute({ view: 'lesson', grade: route.grade, topicId, yearWeek: week })
            }
            onOpenPractice={(topicId, week) =>
              setRoute({
                view: 'quiz',
                grade: route.grade,
                mode: 'practice',
                topicId,
                yearWeek: week,
              })
            }
            onOpenTest={(topicId, week) =>
              setRoute({
                view: 'quiz',
                grade: route.grade,
                mode: 'test',
                topicId,
                yearWeek: week,
              })
            }
            onOpenExam={(week) => setRoute({ view: 'exam', grade: route.grade, yearWeek: week })}
            onOpenSocrates={(_week, note) => openSocrates({ contextNote: note, seedUserMessage: note })}
            onOpenRadar={(week) => setRoute({ view: 'radar', yearWeek: week })}
          />
        )}

        {!accessLocked && route.view === 'plan' && (
          <DailyPlanView
            account={account}
            skills={skills}
            dark={dark}
            onStartDrill={(skillId) => setDrillSkill(skillId as MicroSkillId)}
            onOpenSocrates={openSocrates}
            onOpenExam={() => setRoute({ view: 'exam', grade: account.grade })}
            onOpenRadar={() => setRoute({ view: 'radar' })}
          />
        )}

        {!accessLocked && route.view === 'parent' && (
          <ParentReportView
            account={account}
            skills={skills}
            dark={dark}
            onUnlock={openPaywall}
          />
        )}

        {route.view === 'account' && (
          <AccountPanel
            account={account}
            progress={progress}
            yearProgress={yearProgress}
            dark={dark}
            onAccountChange={persistAccount}
            onCloudPulled={(bundle) => {
              setAccount(ensureTrialStarted(bundle.account));
              setProgress(bundle.progress);
              setYearProgress(bundle.year);
            }}
            onOpenPaywall={openPaywall}
            onResetOnboarding={() => {
              const next = { ...defaultAccount(), grade: account.grade };
              persistAccount(next);
              setRoute({ view: 'home' });
            }}
          />
        )}

        {!accessLocked && route.view === 'exam' && (
          <InfiniteExamGenerator
            preferredGrade={route.grade ?? account.grade}
            dark={dark}
            onSkillsChange={setSkills}
            onOpenSocrates={openSocrates}
            onBeforeStart={gateExamStart}
            onAnswer={({ correct, skillId }) => {
              persistAccount(
                logActivity(account, {
                  minutes: 1,
                  correct: correct ? 1 : 0,
                  attempts: 1,
                  skill: skillId,
                }),
              );
            }}
          />
        )}

        {!accessLocked && route.view === 'radar' && (
          <WeakSpotsRadar
            skills={skills}
            dark={dark}
            onSkillsChange={setSkills}
            onOpenSocrates={openSocrates}
          />
        )}

        {!accessLocked && route.view === 'catalog' && (
          <CatalogView
            grade={route.grade}
            progress={progress}
            onOpenTopic={(topicId) => setRoute({ view: 'topic', grade: route.grade, topicId })}
            onOpenControl={(sectionId) =>
              setRoute({ view: 'quiz', grade: route.grade, mode: 'control', sectionId })
            }
          />
        )}

        {!accessLocked && route.view === 'topic' && (
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

        {!accessLocked && route.view === 'lesson' && (
          <LessonRunner
            grade={route.grade}
            topicId={route.topicId}
            dark={dark}
            onExit={() => setRoute({ view: 'topic', grade: route.grade, topicId: route.topicId })}
            onComplete={handleLessonComplete}
            onOpenTrainer={() =>
              setRoute({ view: 'trainer', grade: route.grade, topicId: route.topicId })
            }
          />
        )}

        {!accessLocked && route.view === 'trainer' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setRoute({ view: 'topic', grade: route.grade, topicId: route.topicId })}
              className={`text-sm font-semibold ${dark ? 'text-slate-400 hover:text-indigo-300' : 'text-slate-600 hover:text-indigo-700'}`}
            >
              ← К теме
            </button>
            {Trainer ? (
              <Trainer onStreakDelta={handleTrainerStreak} soundOn={progress.soundOn} />
            ) : (
              <p
                className={`rounded-3xl border p-4 text-sm font-semibold ${
                  dark
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-100'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                }`}
              >
                Тренажёр для этой темы пока не подключен.
              </p>
            )}
          </div>
        )}

        {!accessLocked && route.view === 'quiz' && (
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

      <SiteFooter dark={dark} onOpenLegal={openLegal} />

      {!accessLocked && !socratesOpen && (
        <SocratesFab dark={dark} onClick={() => openSocrates()} />
      )}
      <SocraticAITutor
        open={socratesOpen}
        onClose={() => {
          setSocratesOpen(false);
          setSocratesSeed(undefined);
          setSocratesLimitHint(null);
        }}
        contextNote={socratesContext}
        seedUserMessage={socratesSeed}
        dark={dark}
        onBeforeSend={gateSocratesSend}
        limitHint={socratesLimitHint}
      />

      <PaywallModal
        open={paywallOpen}
        dark={dark}
        account={account}
        reason={paywallReason}
        onClose={() => setPaywallOpen(false)}
        onNeedLogin={() => {
          setPaywallOpen(false);
          setRoute({ view: 'account' });
        }}
      />

      {drillSkill && (
        <MiniDrillModal
          skillId={drillSkill}
          skills={skills}
          dark={dark}
          onClose={() => setDrillSkill(null)}
          onSkillsChange={setSkills}
          onAttempt={(correct) => {
            persistAccount(
              logActivity(account, {
                minutes: 1,
                correct: correct ? 1 : 0,
                attempts: 1,
                skill: drillSkill,
              }),
            );
          }}
        />
      )}

      {route.view === 'catalog' && (
        <p className="sr-only">
          Открыт {getGrade(route.grade).title}: {getGrade(route.grade).sections.length} разделов
        </p>
      )}
    </div>
  );
}
