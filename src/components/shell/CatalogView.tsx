import { ClipboardList, Sparkles } from 'lucide-react';
import { getGrade, type GradeId } from '../../curriculum/index.ts';
import { controlStatus, topicStatus, type ProgressState } from '../../lib/progress/storage.ts';

type CatalogViewProps = {
  grade: GradeId;
  progress: ProgressState;
  onOpenTopic: (topicId: string) => void;
  onOpenControl: (sectionId: string) => void;
};

export function CatalogView({ grade, progress, onOpenTopic, onOpenControl }: CatalogViewProps) {
  const curriculum = getGrade(grade);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{curriculum.title}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          У каждой темы есть урок. Практика и тест — после того, как понял идею. У раздела — контрольная.
        </p>
      </section>

      {curriculum.sections.map((section) => {
        const control = controlStatus(progress, section.id);
        return (
          <section key={section.id} className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{section.title}</h3>
                <p className="text-xs font-bold text-slate-500">
                  Контрольная · {section.controlMinutes} мин
                  {control ? ` · лучший результат ${Math.round(control.percent * 100)}%` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenControl(section.id)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 text-sm font-extrabold text-white hover:bg-violet-500"
              >
                <ClipboardList className="size-4" aria-hidden="true" />
                Контрольная
              </button>
            </div>

            <ul className="mt-4 space-y-2">
              {section.topics.map((topic) => {
                const status = topicStatus(progress, topic.id);
                return (
                  <li key={topic.id}>
                    <button
                      type="button"
                      onClick={() => onOpenTopic(topic.id)}
                      className="flex w-full items-start justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-left hover:bg-indigo-50"
                    >
                      <span>
                        <span className="flex flex-wrap items-center gap-2 font-extrabold text-slate-900">
                          {topic.title}
                          {topic.hasTrainer && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-teal-700 uppercase ring-1 ring-teal-100">
                              <Sparkles className="size-3" aria-hidden="true" />
                              Тренажёр
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs font-semibold text-slate-500">{topic.goal}</span>
                      </span>
                      <span className="shrink-0 text-xs font-extrabold text-slate-500">
                        {status.testPassed ? (
                          <span className="text-emerald-600">Тест сдан</span>
                        ) : status.lessonDone ? (
                          <span className="text-sky-600">Изучено</span>
                        ) : status.practiced ? (
                          <span className="text-amber-600">Практика</span>
                        ) : (
                          <span>Урок</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
