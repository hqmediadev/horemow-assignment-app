import React from 'react';
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Clock3,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  Users,
  X,
} from 'lucide-react';

interface GettingStartedTourProps {
  onClose: () => void;
  onOpenSection: (tab: string) => void;
}

const sections = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'See assignment targets and your progress in one place.',
    icon: LayoutDashboard,
  },
  {
    id: 'bible',
    title: 'Bible Study',
    description: 'Follow your reading plan and keep chapter notes.',
    icon: BookOpen,
  },
  {
    id: 'books',
    title: 'HOREMOW Books',
    description: 'Track books, reading progress, and takeaways.',
    icon: BookMarked,
  },
  {
    id: 'sermons',
    title: 'Messages',
    description: 'Log sermons, scriptures, and personal reflections.',
    icon: MessageSquareText,
  },
  {
    id: 'souls',
    title: 'Soul Winning',
    description: 'Record converts and follow-up progress.',
    icon: Users,
  },
  {
    id: 'prayer',
    title: 'Prayer & Fasting',
    description: 'Keep a record of prayer sessions and fasting.',
    icon: Clock3,
  },
  {
    id: 'report',
    title: 'Official Report',
    description: 'Review and share a summary of your assignment.',
    icon: FileText,
  },
];

export const GettingStartedTour: React.FC<GettingStartedTourProps> = ({
  onClose,
  onOpenSection,
}) => (
  <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="getting-started-title"
      className="max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:rounded-3xl sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            Your app map
          </p>
          <h2 id="getting-started-title" className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            Let’s get you started
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Your assignment is ready. Here’s where to find the tools—choose a section to open it, or skip the tour.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Skip tour"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {sections.map(({ id, title, description, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onOpenSection(id)}
            className="group flex min-h-20 items-start gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-emerald-400 hover:bg-emerald-50/70 dark:border-slate-700 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-slate-900 dark:text-white">{title}</span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-600 dark:text-slate-300">{description}</span>
            </span>
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-xl px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Skip tour
        </button>
        <button
          type="button"
          onClick={() => onOpenSection('dashboard')}
          className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          Start with Dashboard
        </button>
      </div>
    </section>
  </div>
);
