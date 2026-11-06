import { ArrowRight, CheckCircle2, ClipboardList } from 'lucide-react';
import { CURRICULUM, type GradeId } from '../../curriculum/index.ts';
import { gradeCompletion, type ProgressState } from '../../lib/progress/storage.ts';

type HomeViewProps = {
  progress: ProgressState;
  onOpenGrade: (grade: GradeId) => void;
};

export function HomeView({ progress, onOpenGrade }: HomeViewProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-indigo-600">Математика 5–9</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Сначала понять — потом проверить
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed font-semibold text-slate-600 sm:text-base">
          У каждой темы есть короткий урок: идея, пример и «попробуй сам». Дальше — тренажёр,
          практика, тест и контрольная по разделу.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {CURRICULUM.map((grade) => {
          const topicIds = grade.sections.flatMap((s) => s.topics.map((t) => t.id));
          const sectionIds = grade.sections.map((s) => s.id);
          const stats = gradeCompletion(progress, topicIds, sectionIds);
          return (
            <button
              key={grade.id}
              type="button"
              onClick={() => onOpenGrade(grade.id)}
              className="rounded-3xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{grade.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {topicIds.length} тем · {sectionIds.length} контрольных
                  </p>
                </div>
                <ArrowRight className="size-5 text-indigo-600" aria-hidden="true" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-100">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Тесты {stats.testsPassed}/{stats.testsTotal}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-violet-700 ring-1 ring-violet-100">
                  <ClipboardList className="size-3.5" aria-hidden="true" />
                  КР {stats.controlsPassed}/{stats.controlsTotal}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
