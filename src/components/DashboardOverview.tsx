import React from 'react';
import { 
  BookMarked, 
  Headphones, 
  Users, 
  Clock, 
  Sparkles, 
  FileText, 
  ArrowRight,
  Award,
  TrendingUp,
  BookOpen,
  Calendar,
  ShieldCheck,
  CheckCircle,
  Crown
} from 'lucide-react';
import { UserAssignmentState } from '../types';
import { ROLE_CONFIGS, BIBLE_PLANS, INITIAL_CONFERENCES } from '../data/initialData';
import { HoremowLogo } from './HoremowLogo';

interface DashboardOverviewProps {
  state: UserAssignmentState;
  isNewUser?: boolean;
  setTab: (tab: string) => void;
  quickAddSermon: () => void;
  quickAddChapter: () => void;
  quickAddSoul: () => void;
  openPrayerTimer: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  state,
  isNewUser = false,
  setTab,
  quickAddSermon,
  quickAddChapter,
  quickAddSoul,
  openPrayerTimer,
}) => {
  const roleConfig = ROLE_CONFIGS[state.roleMode];
  const activeConferenceObj = state.conferenceTargets?.[state.activeConference] || INITIAL_CONFERENCES[state.activeConference] || INITIAL_CONFERENCES.annual;

  // 1. Calculate Bible progress
  const activePlan = BIBLE_PLANS[0]; // Historical
  const totalBibleChaptersGoal = activePlan.totalChapters;
  const bibleReadCount = Object.values(state.bibleChapters).filter(Boolean).length;
  const biblePercent = Math.min(100, Math.round((bibleReadCount / totalBibleChaptersGoal) * 100));

  // 2. Books progress
  const completedBooks = state.books.filter(b => b.status === 'completed').length;
  const targetBooks = activeConferenceObj.targetBooks || roleConfig.targetBooks;
  const booksPercent = Math.min(100, Math.round((completedBooks / targetBooks) * 100));

  // 3. Sermons/Messages progress
  const sermonCount = state.sermons.length;
  const targetSermons = activeConferenceObj.targetMessages || roleConfig.targetSermons;
  const sermonsPercent = Math.min(100, Math.round((sermonCount / targetSermons) * 100));

  // 4. Prayer & Fasting progress
  const totalPrayerMinutes = state.prayerSessions.reduce((acc, p) => acc + p.durationMinutes, 0);
  const totalPrayerHours = Math.round(totalPrayerMinutes / 60);
  const targetPrayerHours = activeConferenceObj.targetPrayerHours || 30;
  const prayerPercent = Math.min(100, Math.round((totalPrayerHours / targetPrayerHours) * 100));

  // Core Academic Goal Score (Average of 4 required pillars: Bible, Books, Messages, Prayer)
  // Note: Soul winning is tracked separately as requested!
  const overallCompletion = Math.round(
    (biblePercent + booksPercent + sermonsPercent + prayerPercent) / 4
  );

  // Classification: FIRST CLASS (100%), SECOND CLASS UPPER (50% - 99%), BELOW 50% (<50%)
  const isFirstClass = overallCompletion >= 100;
  const isSecondClassUpper = overallCompletion >= 50 && overallCompletion < 100;
  const goalClassification = overallCompletion >= 100
    ? "First Class"
    : overallCompletion >= 50
    ? "Second Class Upper"
    : "Below 50%";

  // Souls Won stats (tracked separately from core academic grade)
  const soulsCount = state.soulsWon.length;
  const targetSouls = activeConferenceObj.targetSouls || roleConfig.targetSouls;
  const soulsPercent = Math.min(100, Math.round((soulsCount / targetSouls) * 100));

  return (
    <div className="space-y-6">
      
      {/* Bento Grid Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Hero Banner Card with Watermark Logo */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 border border-emerald-900/60 shadow-lg flex flex-col justify-between min-h-[240px]">
          
          {/* Subtle Background Watermark */}
          <div className="absolute top-1/2 -right-12 -translate-y-1/2 opacity-10 pointer-events-none select-none">
            <HoremowLogo size={320} />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {roleConfig.roleName}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {activeConferenceObj.name}
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isNewUser ? 'Welcome' : 'Welcome back'}, {state.profile.fullName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {roleConfig.description}
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-emerald-300 font-medium gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span>Country: <strong className="text-white">{state.profile.country || 'Nigeria'}</strong></span>
              <span>•</span>
              <span>Chapter: <strong className="text-white">{state.profile.stateChapter}</strong></span>
              {state.profile.branchFellowship && (
                <>
                  <span>•</span>
                  <span>Branch: <strong className="text-white">{state.profile.branchFellowship}</strong></span>
                </>
              )}
            </div>
            <button
              onClick={() => setTab('report')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center gap-1 transition-colors border border-amber-500/30"
            >
              Full Verification Report <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Goal Score & First Class / Second Class Upper Card */}
        <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs flex flex-col justify-between items-center text-center">
          
          <div className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-extrabold">
              <Award className="w-4 h-4 text-amber-500" /> Goal Score
            </span>
          </div>

          {/* Metric Ring */}
          <div className="relative w-28 h-28 my-2 flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="46"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-slate-800 sepia-mode:text-amber-200/50"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="46"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={290}
                strokeDashoffset={290 - (290 * overallCompletion) / 100}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-1000 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white sepia-mode:text-amber-950">{overallCompletion}%</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Completion</span>
            </div>
          </div>

          {/* Official First Class / Second Class Upper Badge */}
          <div className={`w-full py-2 px-3 rounded-2xl flex items-center justify-center gap-2 border font-extrabold text-xs shadow-xs ${
            isFirstClass 
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 sepia-mode:text-amber-900' 
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 sepia-mode:text-amber-950'
          }`}>
            {isFirstClass ? <Crown className="w-4 h-4 text-amber-500" /> : <Award className="w-4 h-4 text-emerald-600" />}
            <span>{goalClassification}</span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {isFirstClass 
              ? "100% Full Standard Reached across all 4 pillars!"
              : "Complete 100% in Bible, Books, Messages & Prayer to reach First Class."}
          </p>
        </div>

      </div>

      {/* One-Touch Quick Actions Bar */}
      <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            One-Touch Quick Log
          </h3>
          <span className="text-[11px] text-slate-400">Record instant daily entries</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={quickAddChapter}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-300 transition-all text-left flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950">+1 Bible Chapter</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Update reading log</div>
            </div>
          </button>

          <button
            onClick={quickAddSermon}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-300 transition-all text-left flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950">+1 Message</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Log Pastor Rika message</div>
            </div>
          </button>

          <button
            onClick={quickAddSoul}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-amber-300 transition-all text-left flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950">+1 Soul Won</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Add convert / invitee</div>
            </div>
          </button>

          <button
            onClick={openPrayerTimer}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-purple-300 transition-all text-left flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950">Prayer Alarm Timer</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Quiet time focus</div>
            </div>
          </button>
        </div>
      </div>

      {/* 4 Academic Pillars + Soul Harvest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. Bible Reading Pillar */}
        <div 
          onClick={() => setTab('bible')}
          className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {biblePercent}% Done
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white sepia-mode:text-amber-950 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Bible Reading Plan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 sepia-mode:text-amber-800 mt-1">
              Old & New Testaments ({activeConferenceObj.name})
            </p>
          </div>

          <div className="mt-5 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Chapters Read</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{bibleReadCount} / {totalBibleChaptersGoal}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${biblePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. HOREMOW Books Pillar */}
        <div 
          onClick={() => setTab('books')}
          className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs hover:shadow-md hover:border-teal-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400 flex items-center justify-center shadow-xs">
                <BookMarked className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {completedBooks} / {targetBooks} Books
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white sepia-mode:text-amber-950 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              HOREMOW Books
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 sepia-mode:text-amber-800 mt-1">
              Required books for {activeConferenceObj.name}
            </p>
          </div>

          <div className="mt-5 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Books Completed</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">{completedBooks} / {targetBooks}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${booksPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Messages Pillar */}
        <div 
          onClick={() => setTab('sermons')}
          className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs hover:shadow-md hover:border-indigo-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {sermonCount} Logged
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white sepia-mode:text-amber-950 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Messages
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 sepia-mode:text-amber-800 mt-1">
              Target: {targetSermons} messages ({activeConferenceObj.name})
            </p>
          </div>

          <div className="mt-5 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Progress</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{sermonCount} / {targetSermons}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${sermonsPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. Prayer & Fasting Pillar */}
        <div 
          onClick={() => setTab('prayer')}
          className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs hover:shadow-md hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {totalPrayerHours} / {targetPrayerHours} hrs
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white sepia-mode:text-amber-950 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Prayer & Fasting
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 sepia-mode:text-amber-800 mt-1">
              Target: {targetPrayerHours} prayer hrs • {activeConferenceObj.targetFastingDays} fast days
            </p>
          </div>

          <div className="mt-5 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Prayer Hours Reached</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">{totalPrayerHours} / {targetPrayerHours} hrs</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${prayerPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Soul Winning Card (Tracked Separately from Grade Score) */}
        <div 
          onClick={() => setTab('souls')}
          className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-amber-200/80 dark:border-amber-900/40 sepia-mode:border-[#e2d5b7] shadow-xs hover:shadow-md hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Separate Harvest Metric
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white sepia-mode:text-amber-950 group-hover:text-amber-600 transition-colors">
              Soul Winning Harvest
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Conference Invites & Converts ({soulsCount} / {targetSouls} target)
            </p>
          </div>

          <div className="mt-5 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Soul Harvest</span>
              <span className="text-amber-600 font-bold">{soulsCount} / {targetSouls}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${soulsPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Assignment Verification Card */}
        <div 
          onClick={() => setTab('report')}
          className="bg-gradient-to-br from-slate-950 to-emerald-950 text-white p-6 rounded-3xl border border-emerald-900 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PDF Export
              </span>
            </div>

            <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
              Official Verification Report
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Generate & print your completed HOREMOW grade certificate and conference breakdown.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-emerald-300 font-bold border-t border-white/10">
            <span>View & Export PDF</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Recent Activity Log Feed */}
      <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 sepia-mode:border-[#e2d5b7]">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white sepia-mode:text-amber-950 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Recent Activity Feed
        </h3>

        <div className="space-y-3">
          {state.sermons.slice(0, 3).map((sermon) => (
            <div key={sermon.id} className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 sepia-mode:bg-[#eddcb9]/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950">
                    Message: {sermon.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {sermon.speaker} • {sermon.keyScripture || 'Message Study'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 shrink-0">{sermon.dateListened}</span>
            </div>
          ))}

          {state.soulsWon.slice(0, 2).map((soul) => (
            <div key={soul.id} className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 sepia-mode:bg-[#eddcb9]/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950">
                    Soul Won: {soul.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Status: {soul.status.replace('_', ' ')} • {soul.location || 'Local Outreach'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 shrink-0">{soul.dateWon}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
