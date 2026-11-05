import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Download, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  BookMarked, 
  Headphones, 
  Users, 
  Clock, 
  Award,
  Crown,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { UserAssignmentState } from '../types';
import { ROLE_CONFIGS, BIBLE_PLANS, INITIAL_CONFERENCES } from '../data/initialData';
import { HoremowLogo } from './HoremowLogo';

interface ReportGeneratorProps {
  state: UserAssignmentState;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ state }) => {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const roleConfig = ROLE_CONFIGS[state.roleMode];
  const activeConferenceObj = state.conferenceTargets?.[state.activeConference] || INITIAL_CONFERENCES[state.activeConference] || INITIAL_CONFERENCES.annual;

  // Calculated Metrics
  const activePlan = BIBLE_PLANS[0];
  const bibleReadCount = Object.values(state.bibleChapters).filter(Boolean).length;
  const biblePercent = Math.min(100, Math.round((bibleReadCount / activePlan.totalChapters) * 100));

  const completedBooksCount = state.books.filter(b => b.status === 'completed').length;
  const targetBooks = activeConferenceObj.targetBooks || roleConfig.targetBooks;
  const booksPercent = Math.min(100, Math.round((completedBooksCount / targetBooks) * 100));

  const sermonsCount = state.sermons.length;
  const targetSermons = activeConferenceObj.targetMessages || roleConfig.targetSermons;
  const sermonsPercent = Math.min(100, Math.round((sermonsCount / targetSermons) * 100));

  const totalPrayerMins = state.prayerSessions.reduce((acc, p) => acc + p.durationMinutes, 0);
  const totalPrayerHours = Math.round(totalPrayerMins / 60);
  const targetPrayerHours = activeConferenceObj.targetPrayerHours || 30;
  const prayerPercent = Math.min(100, Math.round((totalPrayerHours / targetPrayerHours) * 100));

  // Academic Goal Score % (Average of Bible, Books, Messages, Prayer)
  const goalScore = Math.round((biblePercent + booksPercent + sermonsPercent + prayerPercent) / 4);
  const isFirstClass = goalScore >= 100;
  const classification = goalScore >= 100 
    ? "First Class - 100% Full Standard" 
    : goalScore >= 50 
    ? "Second Class Upper" 
    : "Below 50%";

  const reportDataPayload = {
    profile: state.profile,
    roleMode: roleConfig.roleName,
    activeConference: activeConferenceObj.name,
    goalScore: `${goalScore}%`,
    classification,
    bibleChaptersRead: `${bibleReadCount} / ${activePlan.totalChapters}`,
    horemowBooksCompleted: `${completedBooksCount} / ${targetBooks}`,
    messagesListened: `${sermonsCount} / ${targetSermons}`,
    soulsWonCount: `${state.soulsWon.length} / ${activeConferenceObj.targetSouls || roleConfig.targetSouls}`,
    totalPrayerHoursLogged: totalPrayerHours,
    fastingDaysCompleted: state.fastingRecords.length,
  };

  const generateAiReport = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/report-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportData: reportDataPayload }),
      });
      const data = await res.json();
      if (data.summary) {
        setAiSummary(data.summary);
      } else {
        setAiSummary('The candidate demonstrates steadfast commitment to holiness, righteousness, and soul winning in alignment with HOREMOW doctrines.');
      }
    } catch (e) {
      console.error(e);
      setAiSummary('Remarkable progress recorded across Bible study, Pastor Paul Rika books, and message listening.');
    } finally {
      setLoadingAi(false);
    }
  };

  const getPlainTextReport = () => {
    return `================================================
HOLINESS REVIVAL MOVEMENT WORLDWIDE (HOREMOW)
OFFICIAL ASSIGNMENT SUBMISSION & GRADE CERTIFICATE
================================================

MEMBER DETAILS:
---------------
Full Name: ${state.profile.fullName}
Registration ID: ${state.profile.memberId}
State / Chapter: ${state.profile.stateChapter}
Zone / Region: ${state.profile.zoneRegion}
Assignment Mode: ${roleConfig.roleName}
Event / Conference: ${activeConferenceObj.name}
Coordinator: ${state.profile.coordinatorName}

GOAL SCORE & DEGREE CLASSIFICATION:
----------------------------------
Academic Goal Score: ${goalScore}%
Official Classification: ${classification}

ACADEMIC PILLARS BREAKDOWN:
--------------------------
1. BIBLE READING PLAN: ${bibleReadCount} / ${activePlan.totalChapters} chapters (${biblePercent}%)
2. HOREMOW BOOKS: ${completedBooksCount} / ${targetBooks} completed (${booksPercent}%)
3. MESSAGES: ${sermonsCount} / ${targetSermons} listened (${sermonsPercent}%)
4. PRAYER & FASTING: ${totalPrayerHours} / ${targetPrayerHours} hrs prayer • ${state.fastingRecords.length} fast days (${prayerPercent}%)

EVANGELISM HARVEST (SEPARATE):
-----------------------------
Souls Won & Follow-up: ${state.soulsWon.length} / ${activeConferenceObj.targetSouls || roleConfig.targetSouls} converts

${aiSummary ? `\nSPIRITUAL REVIEW & MENTORSHIP SUMMARY:\n-------------------------------------\n${aiSummary}\n` : ''}
================================================
Generated via HOREMOW Assignment Tracker Web App
================================================`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getPlainTextReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([getPlainTextReport()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `HOREMOW_Report_${state.profile.fullName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Bar */}
      <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950">
              Official HOREMOW Assignment Report
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 sepia-mode:text-amber-800 mt-1">
            Generated official grade certificate for State Coordinators and Conference verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={generateAiReport}
            disabled={loadingAi}
            className="px-3.5 py-2.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {loadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>AI Review Summary</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3.5 py-2.5 text-xs font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-2.5 text-xs font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .txt</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 text-xs font-extrabold rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Page */}
      <div className="bg-white text-slate-900 p-8 rounded-3xl border-2 border-emerald-900/30 shadow-xl space-y-6 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        
        {/* Emblem Header */}
        <div className="flex flex-col items-center justify-center text-center border-b-2 border-emerald-800 pb-6 space-y-2">
          <HoremowLogo size={64} />
          <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 mt-1">
            Holiness Revival Movement Worldwide (HOREMOW)
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            Assignment Completion & Verification Grade
          </h1>
          <p className="text-xs font-medium text-slate-600">
            Target Event: <strong className="text-slate-900">{activeConferenceObj.name}</strong> • Year {state.profile.assignmentYear}
          </p>
        </div>

        {/* Member Profile Table */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200">
          <div>
            <span className="text-slate-500 font-medium">Member Name:</span>
            <div className="font-extrabold text-slate-900 text-sm">{state.profile.fullName}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Country:</span>
            <div className="font-extrabold text-slate-900">{state.profile.country || 'Nigeria'}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">State / Chapter:</span>
            <div className="font-bold text-slate-900">{state.profile.stateChapter}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Zone / Region:</span>
            <div className="font-bold text-slate-900">{state.profile.zoneRegion}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Branch Fellowship:</span>
            <div className="font-bold text-slate-900">{state.profile.branchFellowship || 'Main HQ Branch'}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Assignment Role:</span>
            <div className="font-extrabold text-emerald-800">{roleConfig.roleName}</div>
          </div>
        </div>

        {/* Goal Score & Classification Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 text-amber-400">
              {isFirstClass ? <Crown className="w-8 h-8" /> : <Award className="w-8 h-8" />}
            </div>
            <div>
              <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Goal Score Grade Standard</div>
              <div className="text-xl font-black text-white">{classification}</div>
            </div>
          </div>
          <div className="text-center sm:text-right bg-white/10 px-5 py-2.5 rounded-2xl border border-white/20">
            <div className="text-3xl font-black text-amber-300">{goalScore}%</div>
            <div className="text-[10px] text-emerald-200 uppercase font-bold">Academic Completion</div>
          </div>
        </div>

        {/* AI Mentorship Summary */}
        {aiSummary && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1 text-xs">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> AI Review & Spiritual Assessment
            </div>
            <p className="text-emerald-950 leading-relaxed whitespace-pre-line">
              {aiSummary}
            </p>
          </div>
        )}

        {/* Core Pillars Tables */}
        <div className="space-y-6 text-xs">
          
          {/* 1. Bible */}
          <div className="space-y-2">
            <h3 className="font-bold uppercase text-emerald-900 border-b pb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1. Bible Reading Progress</span>
              <span className="text-emerald-700 font-bold">{bibleReadCount} / {activePlan.totalChapters} Chapters ({biblePercent}%)</span>
            </h3>
          </div>

          {/* 2. Books */}
          <div className="space-y-2">
            <h3 className="font-bold uppercase text-emerald-900 border-b pb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><BookMarked className="w-4 h-4 text-emerald-600" /> 2. HOREMOW Books ({completedBooksCount} / {targetBooks} Completed)</span>
            </h3>
            <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Author</th>
                  <th className="p-2 border text-center">Pages</th>
                  <th className="p-2 border text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state.books.map((b) => (
                  <tr key={b.id}>
                    <td className="p-2 border font-bold">{b.title}</td>
                    <td className="p-2 border">{b.author}</td>
                    <td className="p-2 border text-center font-mono">{b.pagesRead} / {b.totalPages}</td>
                    <td className="p-2 border text-center font-bold uppercase text-[10px]">{b.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. Messages */}
          <div className="space-y-2">
            <h3 className="font-bold uppercase text-emerald-900 border-b pb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Headphones className="w-4 h-4 text-emerald-600" /> 3. Messages ({sermonsCount} / {targetSermons} Target)</span>
            </h3>
            <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="p-2 border">Message Title</th>
                  <th className="p-2 border">Speaker</th>
                  <th className="p-2 border">Scripture</th>
                  <th className="p-2 border text-center">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state.sermons.map((s) => (
                  <tr key={s.id}>
                    <td className="p-2 border font-bold">{s.title}</td>
                    <td className="p-2 border">{s.speaker}</td>
                    <td className="p-2 border font-mono">{s.keyScripture || '-'}</td>
                    <td className="p-2 border text-center">{s.dateListened}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Soul Winning (Separate Harvest) */}
          <div className="space-y-2">
            <h3 className="font-bold uppercase text-amber-900 border-b pb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-amber-600" /> 4. Soul Winning Harvest ({state.soulsWon.length} Converts Logged)</span>
            </h3>
            <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-amber-50 font-bold">
                <tr>
                  <th className="p-2 border">Convert Name</th>
                  <th className="p-2 border">Location</th>
                  <th className="p-2 border text-center">Status</th>
                  <th className="p-2 border text-center">Conf. Invited</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state.soulsWon.map((w) => (
                  <tr key={w.id}>
                    <td className="p-2 border font-bold">{w.name}</td>
                    <td className="p-2 border">{w.location || '-'}</td>
                    <td className="p-2 border text-center font-bold uppercase text-[10px]">{w.status.replace('_', ' ')}</td>
                    <td className="p-2 border text-center font-bold">{w.conferenceInvited ? 'YES' : 'NO'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Verification Sign-off */}
        <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs">
          <div className="space-y-8">
            <div className="border-b-2 border-slate-400 w-48" />
            <div className="font-bold">Member Signature & Date</div>
          </div>
          <div className="space-y-8 text-right">
            <div className="border-b-2 border-slate-400 w-48 ml-auto" />
            <div className="font-bold">Coordinator Stamp & Signature</div>
          </div>
        </div>

      </div>

    </div>
  );
};
