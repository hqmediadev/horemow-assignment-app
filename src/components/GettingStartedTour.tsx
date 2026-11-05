import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  Clock3,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  SkipForward,
  Users,
} from 'lucide-react';

interface GettingStartedTourProps {
  stepIndex: number;
  onStepChange: (stepIndex: number) => void;
  onClose: () => void;
}

export const GETTING_STARTED_STEPS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Your home base shows assignment targets and progress. Use the report button here when you need a summary.',
    icon: LayoutDashboard,
  },
  {
    id: 'bible',
    title: 'Bible Study',
    description: 'Choose a book and chapter to record your reading. You can also add notes as you study.',
    icon: BookOpen,
  },
  {
    id: 'books',
    title: 'HOREMOW Books',
    description: 'Update pages as you read, mark books complete, and keep personal takeaways.',
    icon: BookMarked,
  },
  {
    id: 'sermons',
    title: 'Messages',
    description: 'Add messages you have listened to, then save key scriptures and reflections.',
    icon: MessageSquareText,
  },
  {
    id: 'souls',
    title: 'Soul Winning',
    description: 'Record converts and keep their follow-up status up to date.',
    icon: Users,
  },
  {
    id: 'prayer',
    title: 'Prayer & Fasting',
    description: 'Use the prayer timer or log a completed prayer session and fasting day.',
    icon: Clock3,
  },
  {
    id: 'report',
    title: 'Official Report',
    description: 'Review your progress and generate an assignment report when you are ready.',
    icon: FileText,
  },
] as const;

export const GettingStartedTour: React.FC<GettingStartedTourProps> = ({
  stepIndex,
  onStepChange,
  onClose,
}) => {
  const step = GETTING_STARTED_STEPS[stepIndex] ?? GETTING_STARTED_STEPS[0];
  const StepIcon = step.icon;
  const isLastStep = stepIndex === GETTING_STARTED_STEPS.length - 1;

  return (
  <aside className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:bottom-4 sm:px-4 sm:pb-0">
    <section
      aria-labelledby="getting-started-title"
      aria-describedby="getting-started-description"
      className="w-full max-w-xl rounded-3xl border border-emerald-200 bg-white/95 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-emerald-900 dark:bg-slate-900/95 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <StepIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
              Guided tour · Step {stepIndex + 1} of {GETTING_STARTED_STEPS.length}
          </p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <SkipForward className="h-3.5 w-3.5" />
              Skip tour
            </button>
          </div>
          <h2 id="getting-started-title" className="mt-1 text-lg font-black text-slate-900 dark:text-white sm:text-xl">
            {step.title}
          </h2>
          <p id="getting-started-description" className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
            {step.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {GETTING_STARTED_STEPS.map((item, index) => (
          <span
            key={item.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index <= stepIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
          Explore this section, then continue when you’re ready.
        </p>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => onStepChange(stepIndex - 1)}
            disabled={stepIndex === 0}
            className="inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {isLastStep ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Finish tour
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStepChange(stepIndex + 1)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  </aside>
  );
};
