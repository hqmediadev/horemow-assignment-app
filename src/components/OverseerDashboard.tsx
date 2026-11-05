import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Crown, 
  Award, 
  Search, 
  Filter, 
  BookOpen, 
  Flame, 
  HeartHandshake, 
  Clock, 
  Send, 
  ExternalLink, 
  Loader2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  User,
  Sparkles,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { 
  FirebaseUserData, 
  fetchAllMembersForOverseer, 
  sendOverseerNoteToMember 
} from '../lib/firebase';
import { HoremowLogo } from './HoremowLogo';
import { UserAssignmentState } from '../types';

interface OverseerDashboardProps {
  overseerName: string;
  onSwitchToMyAssignment: () => void;
}

export const OverseerDashboard: React.FC<OverseerDashboardProps> = ({
  overseerName,
  onSwitchToMyAssignment
}) => {
  const [members, setMembers] = useState<FirebaseUserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<'all' | 'first_class' | 'second_upper' | 'below_50'>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Modal for Viewing Member Detailed Assignment
  const [selectedMember, setSelectedMember] = useState<FirebaseUserData | null>(null);
  
  // Note sending state
  const [noteInput, setNoteInput] = useState<string>('');
  const [sendingNote, setSendingNote] = useState<boolean>(false);
  const [noteSuccess, setNoteSuccess] = useState<boolean>(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const loadMembers = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAllMembersForOverseer();
      setMembers(data);
    } catch (e) {
      console.error(e);
      setLoadError('Unable to load members. Confirm this account has overseer access, then try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Helper calculation for member goal score
  const calculateMemberScore = (state?: UserAssignmentState) => {
    if (!state) return 0;
    
    // Bible read count
    const totalChaptersRead = Object.values(state.bibleChapters || {}).filter(Boolean).length;
    const biblePercent = Math.min(100, Math.round((totalChaptersRead / 60) * 100)); // rough standard benchmark

    // Books completed
    const completedBooks = (state.books || []).filter(b => b.status === 'completed').length;
    const booksPercent = Math.min(100, Math.round((completedBooks / 4) * 100));

    // Sermons
    const sermonCount = (state.sermons || []).length;
    const sermonsPercent = Math.min(100, Math.round((symptomClamp(sermonCount) / 10) * 100));

    // Prayer
    const totalPrayerMins = (state.prayerSessions || []).reduce((acc, p) => acc + (p.durationMinutes || 0), 0);
    const prayerHours = totalPrayerMins / 60;
    const prayerPercent = Math.min(100, Math.round((prayerHours / 20) * 100));

    return Math.round((biblePercent + booksPercent + sermonsPercent + prayerPercent) / 4);
  };

  function symptomClamp(val: number) {
    return Math.max(0, val || 0);
  }

  // Filtered members list
  const filteredMembers = members.filter(m => {
    const query = searchTerm.toLowerCase();
    const nameMatch = (m.fullName || '').toLowerCase().includes(query) ||
                      (m.stateChapter || '').toLowerCase().includes(query) ||
                      (m.zoneRegion || '').toLowerCase().includes(query) ||
                      (m.country || '').toLowerCase().includes(query) ||
                      (m.lgaDistrict || '').toLowerCase().includes(query) ||
                      (m.branchFellowship || '').toLowerCase().includes(query);
    
    if (!nameMatch) return false;

    // Country filter
    if (filterCountry !== 'all') {
      const mCountry = m.country || m.state?.profile?.country || 'Nigeria';
      if (mCountry !== filterCountry) return false;
    }

    // Role filter
    if (filterRole !== 'all') {
      if (m.accountType !== filterRole) return false;
    }

    // Grade score filter
    const score = calculateMemberScore(m.state);
    if (filterGrade === 'first_class') return score >= 100;
    if (filterGrade === 'second_upper') return score >= 50 && score < 100;
    if (filterGrade === 'below_50') return score < 50;

    return true;
  });

  // Aggregated Stats
  const totalMembers = members.length;
  const totalSoulsWon = members.reduce((acc, m) => acc + (m.state?.soulsWon?.length || 0), 0);
  const firstClassCount = members.filter(m => calculateMemberScore(m.state) >= 100).length;
  const secondUpperCount = members.filter(m => {
    const s = calculateMemberScore(m.state);
    return s >= 50 && s < 100;
  }).length;
  const avgGoalScore = totalMembers > 0 
    ? Math.round(members.reduce((acc, m) => acc + calculateMemberScore(m.state), 0) / totalMembers)
    : 0;

  const handleSendNote = async () => {
    if (!selectedMember || !noteInput.trim()) return;
    setSendingNote(true);
    setNoteSuccess(false);
    setNoteError(null);
    try {
      await sendOverseerNoteToMember(selectedMember.uid, noteInput.trim());
      setNoteSuccess(true);
      // update local selected member state
      setSelectedMember(prev => prev ? { ...prev, overseerNote: noteInput.trim() } : null);
      // reload members
      loadMembers();
      setTimeout(() => setNoteSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      setNoteError('Unable to deliver the note. Confirm overseer access and try again.');
    } finally {
      setSendingNote(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Overseer Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> Executive Overseer & Leadership Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Greetings, {overseerName || 'Overseer'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Oversight and monitoring for HOREMOW members under your spiritual jurisdiction. Review individual goal scores, Bible progress, and send pastoral notes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onSwitchToMyAssignment}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-all backdrop-blur-xs border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-300" />
              <span>My Personal Assignment</span>
            </button>

            <button
              onClick={loadMembers}
              disabled={loading}
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md"
              title="Refresh Members Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Total Members */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Members</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalMembers}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">Active Profiles</div>
        </div>

        {/* Avg Goal Score */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Average Goal Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {avgGoalScore}%
          </div>
          <div className="text-[11px] text-amber-600 font-semibold">Branch Average</div>
        </div>

        {/* First Class */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>First Class (100%)</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {firstClassCount}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold">Full Standard</div>
        </div>

        {/* 2nd Class Upper */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>2nd Class Upper</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
            {secondUpperCount}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold">50% - 99% Score</div>
        </div>

        {/* Souls Won */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Souls Won</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">
            {totalSoulsWon}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold">Soul Harvest</div>
        </div>

      </div>

      {/* Member Directory Table Section */}
      <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
        
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Member Assignment Roster
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search member, country, chapter..."
                className="text-xs p-2.5 pl-9 rounded-xl bg-slate-50 dark:bg-slate-800 sepia-mode:bg-[#eddcb9]/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 sm:w-56"
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            </div>

            {/* Country Filter Dropdown */}
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="text-xs font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 sepia-mode:bg-[#eddcb9]/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">🌍 All Countries</option>
              <option value="Nigeria">🇳🇬 Nigeria</option>
              <option value="Ghana">🇬🇭 Ghana</option>
              <option value="Kenya">🇰🇪 Kenya</option>
              <option value="South Africa">🇿🇦 South Africa</option>
              <option value="United Kingdom">🇬🇧 United Kingdom</option>
              <option value="United States">🇺🇸 United States</option>
              <option value="Cameroon">🇨🇲 Cameroon</option>
              <option value="Liberia">🇱🇷 Liberia</option>
              <option value="Sierra Leone">🇸🇱 Sierra Leone</option>
              <option value="Canada">🇨🇦 Canada</option>
              <option value="Germany">🇩🇪 Germany</option>
              <option value="France">🇫🇷 France</option>
              <option value="Other Country">🌐 Other International</option>
            </select>

            {/* Role Filter Dropdown */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="text-xs font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 sepia-mode:bg-[#eddcb9]/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">👥 All Roles</option>
              <option value="member">General Member</option>
              <option value="overseer">Leader / Overseer</option>
            </select>

            {/* Filter buttons */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setFilterGrade('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${filterGrade === 'all' ? 'bg-white dark:bg-slate-900 text-emerald-700 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                All Scores
              </button>
              <button
                onClick={() => setFilterGrade('first_class')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${filterGrade === 'first_class' ? 'bg-white dark:bg-slate-900 text-emerald-700 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                1st Class (100%)
              </button>
              <button
                onClick={() => setFilterGrade('second_upper')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${filterGrade === 'second_upper' ? 'bg-white dark:bg-slate-900 text-emerald-700 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                2nd Class Upper
              </button>
              <button
                onClick={() => setFilterGrade('below_50')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${filterGrade === 'below_50' ? 'bg-white dark:bg-slate-900 text-red-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                &lt; 50%
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
              <p className="text-xs font-semibold">Loading member assignment documents from Firebase...</p>
            </div>
          ) : loadError ? (
            <div className="space-y-3 p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
              <p className="text-sm font-bold text-red-700 dark:text-red-300">{loadError}</p>
              <button
                type="button"
                onClick={loadMembers}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
              >
                Try again
              </button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No members match the current filter criteria</p>
              <p className="text-xs text-slate-400">Registered members will automatically populate in this table once they sign up or submit assignments.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 sepia-mode:bg-[#eddcb9]/40 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4 pl-6">Member Name & Email</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Chapter / Zone / Branch</th>
                  <th className="p-4">Account Role</th>
                  <th className="p-4">Goal Score</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4">Souls Won</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredMembers.map((m) => {
                  const score = calculateMemberScore(m.state);
                  const isFirstClass = score >= 100;
                  const isSecondUpper = score >= 50 && score < 100;
                  const memberCountry = m.country || m.state?.profile?.country || 'Nigeria';
                  const memberDistrict = m.lgaDistrict || m.state?.profile?.lgaDistrict || '';
                  const memberBranch = m.branchFellowship || m.state?.profile?.branchFellowship || '';

                  return (
                    <tr key={m.uid} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Name */}
                      <td className="p-4 pl-6">
                        <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {m.fullName || 'HOREMOW Member'}
                        </div>
                        <div className="text-[11px] text-slate-400">{m.email}</div>
                      </td>

                      {/* Country */}
                      <td className="p-4">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1">
                          {memberCountry}
                        </span>
                      </td>

                      {/* Chapter / Zone / Branch */}
                      <td className="p-4">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">
                          {m.stateChapter || 'National HQ'}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {m.zoneRegion || 'Central Zone'} {memberBranch ? `• ${memberBranch}` : ''}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                          m.accountType === 'overseer' 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40' 
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}>
                          {m.accountType === 'overseer' && <Crown className="w-3 h-3 text-amber-500" />}
                          {m.accountType || 'Member'}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="p-4 font-black text-sm text-slate-900 dark:text-white">
                        {score}%
                      </td>

                      {/* Classification Badge */}
                      <td className="p-4">
                        {isFirstClass ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[11px] inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" /> First Class
                          </span>
                        ) : isSecondUpper ? (
                          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-extrabold text-[11px]">
                            Second Class Upper
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-extrabold text-[11px]">
                            Below 50%
                          </span>
                        )}
                      </td>

                      {/* Souls */}
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                        {m.state?.soulsWon?.length || 0}
                      </td>

                      {/* Action */}
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedMember(m);
                            setNoteInput(m.overseerNote || '');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Inspect Assignment</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Member Assignment Detailed Inspection Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] max-w-3xl w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg">{selectedMember.fullName}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-[10px] font-extrabold uppercase border border-emerald-300/40">
                    {selectedMember.accountType}
                  </span>
                </div>
                <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                  <span>{selectedMember.country || selectedMember.state?.profile?.country || 'Nigeria'}</span>
                  <span>•</span>
                  <span>{selectedMember.stateChapter}</span>
                  <span>•</span>
                  <span>{selectedMember.zoneRegion}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
              
              {/* Location & Administrative Details Badge */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Country</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {selectedMember.country || selectedMember.state?.profile?.country || 'Nigeria'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">State / Chapter</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {selectedMember.stateChapter || 'National HQ'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">LGA / District</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {selectedMember.lgaDistrict || selectedMember.state?.profile?.lgaDistrict || 'Central District'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Branch Fellowship</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {selectedMember.branchFellowship || selectedMember.state?.profile?.branchFellowship || 'Main HQ Fellowship'}
                  </span>
                </div>
              </div>
              
              {/* Score breakdown banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 sepia-mode:bg-[#eddcb9]/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500">Overall Goal Score</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {calculateMemberScore(selectedMember.state)}%
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500">Classification</div>
                  <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    {calculateMemberScore(selectedMember.state) >= 100
                      ? 'First Class (100%)'
                      : calculateMemberScore(selectedMember.state) >= 50
                      ? 'Second Class Upper'
                      : 'Below 50%'}
                  </div>
                </div>
              </div>

              {/* Progress Summary Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                  <div className="text-[11px] font-bold text-slate-500">Bible Chapters</div>
                  <div className="text-lg font-black text-emerald-600">
                    {Object.values(selectedMember.state?.bibleChapters || {}).filter(Boolean).length}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                  <div className="text-[11px] font-bold text-slate-500">Books Completed</div>
                  <div className="text-lg font-black text-amber-600">
                    {(selectedMember.state?.books || []).filter(b => b.status === 'completed').length} / {(selectedMember.state?.books || []).length}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                  <div className="text-[11px] font-bold text-slate-500">Sermons</div>
                  <div className="text-lg font-black text-purple-600">
                    {(selectedMember.state?.sermons || []).length}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                  <div className="text-[11px] font-bold text-slate-500">Souls Won</div>
                  <div className="text-lg font-black text-orange-600">
                    {(selectedMember.state?.soulsWon || []).length}
                  </div>
                </div>
              </div>

              {/* Overseer Encouragement / Pastoral Note Box */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Send Pastoral Encouragement / Directive to Member</span>
                </div>

                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  rows={3}
                  placeholder="Type an encouraging note, prayer focus, or assignment directive to display on this member's dashboard..."
                  className="w-full text-xs p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="flex items-center justify-between">
                  {noteSuccess ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Note delivered to member's dashboard!
                    </span>
                  ) : noteError ? (
                    <span role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">
                      {noteError}
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-700 dark:text-amber-300">
                      This note will be pinned to top of the member's home screen.
                    </span>
                  )}

                  <button
                    onClick={handleSendNote}
                    disabled={sendingNote || !noteInput.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {sendingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Deliver Directive</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
