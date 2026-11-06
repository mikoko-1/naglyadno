import { ArrowLeft, BookOpen, ClipboardCheck, Gamepad2, Pencil } from 'lucide-react';
import { getTopic, type GradeId } from '../../curriculum/index.ts';
import { topicStatus, type ProgressState } from '../../lib/progress/storage.ts';
import { getLesson } from '../../content/lessons/index.ts';
import { getTrainer } from '../../trainers/registry.ts';

type TopicHubProps = {
  grade: GradeId;
  topicId: string;
  progress: ProgressState;
  onBack: () => void;
  onLesson: () => void;
  onPractice: () => void;
  onTest: () => void;
  onTrainer: () => void;
};

export function TopicHub({
  grade,
  topicId,
  progress,
  onBack,
  onLesson,
  onPractice,
  onTest,
  onTrainer,
}: TopicHubProps) {
  const found = getTopic(grade, topicId);
  if (!found) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold text-rose-800">
        Тема не найдена.
      </div>
    );
  }

  const { topic, section } = found;
  const status = topicStatus(progress, topic.id);
  const hasTrainer = Boolean(topic.hasTrainer && getTrainer(topic.id));
  const hasLesson = Boolean(getLesson(topic.id));

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 hover:text-indigo-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        К каталогу
      </button>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-extrabold tracking-wide text-slate-400 uppercase">{section.title}</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{topic.title}</h2>
        <p className="mt-2 text-sm font-semibold text-slate-600 sm:text-base">{topic.goal}</p>

        <p className="mt-3 rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-800">
          Сначала урок — понять идею. Потом тренажёр и практика. Тест — когда уже уверен.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold">
          {status.lessonDone && (
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700 ring-1 ring-sky-100">
              Урок изучен
            </span>
          )}
          {status.practiced && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-100">
              Практика пройдена
            </span>
          )}
          {status.testPassed && status.bestTest && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-100">
              Тест {Math.round(status.bestTest.percent * 100)}%
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {hasLesson && (
            <button
              type="button"
              onClick={onLesson}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-sm font-extrabold text-white hover:bg-indigo-500 sm:col-span-2"
            >
              <BookOpen className="size-4" aria-hidden="true" />
              {status.lessonDone ? 'Повторить урок' : 'Начать урок'}
            </button>
          )}
          {hasTrainer && (
            <button
              type="button"
              onClick={onTrainer}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-teal-600 text-sm font-extrabold text-white hover:bg-teal-500"
            >
              <Gamepad2 className="size-4" aria-hidden="true" />
              Тренажёр
            </button>
          )}
          <button
            type="button"
            onClick={onPractice}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <Pencil className="size-4" aria-hidden="true" />
            Практика
          </button>
          <button
            type="button"
            onClick={onTest}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <ClipboardCheck className="size-4" aria-hidden="true" />
            Тест
          </button>
        </div>
      </section>
    </div>
  );
}
