import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  UserCheck, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { SoulWonRecord } from '../types';

interface SoulWinningTrackerProps {
  soulsWon: SoulWonRecord[];
  addSoulWon: (soul: Omit<SoulWonRecord, 'id'>) => void;
  updateSoulStatus: (id: string, status: SoulWonRecord['status'], conferenceInvited: boolean) => void;
  targetCount: number;
}

export const SoulWinningTracker: React.FC<SoulWinningTrackerProps> = ({
  soulsWon,
  addSoulWon,
  updateSoulStatus,
  targetCount,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [dateWon, setDateWon] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<SoulWonRecord['status']>('new_convert');
  const [conferenceInvited, setConferenceInvited] = useState(true);
  const [notes, setNotes] = useState('');

  const filteredSouls = soulsWon.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.location && s.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSoulWon({
      name: name.trim(),
      phone: phone.trim(),
      location: location.trim(),
      dateWon,
      status,
      conferenceInvited,
      notes: notes.trim(),
    });

    // Reset Form
    setName('');
    setPhone('');
    setLocation('');
    setNotes('');
    setShowAddModal(false);
  };

  const soulsPercent = Math.min(100, Math.round((soulsWon.length / targetCount) * 100));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950">
                Soul Winning & Evangelism Directory
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 sepia-mode:text-amber-800 mt-1">
              Track converts brought to Christ, follow-up progress, and HOREMOW conference invitations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500">Soul Winning Target</div>
              <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                {soulsWon.length} / {targetCount} Souls
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 text-white hover:bg-amber-700 shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Convert
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${soulsPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search convert name or outreach location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Converts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSouls.map((soul) => (
          <div
            key={soul.id}
            className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  soul.status === 'established'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : soul.status === 'attending_fellowship'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    : soul.status === 'followed_up'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {soul.status.replace('_', ' ')}
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white sepia-mode:text-amber-950 mt-1">
                  {soul.name}
                </h3>
              </div>

              {/* Conference Tag */}
              {soul.conferenceInvited && (
                <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-800">
                  Invited to Conference
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
              {soul.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{soul.phone}</span>
                </div>
              )}
              {soul.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{soul.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Saved: {soul.dateWon}</span>
              </div>
            </div>

            {soul.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                "{soul.notes}"
              </p>
            )}

            {/* Quick Status Updater */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Update Follow-up:</span>
              <select
                value={soul.status}
                onChange={(e) => updateSoulStatus(soul.id, e.target.value as SoulWonRecord['status'], soul.conferenceInvited)}
                className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="new_convert">New Convert</option>
                <option value="followed_up">Followed Up</option>
                <option value="attending_fellowship">Attending Fellowship</option>
                <option value="established">Established in Faith</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Add Convert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] max-w-md w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white sepia-mode:text-amber-950 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              Add Soul Won / Convert Record
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Convert Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brother Samuel Adebayo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+234..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date Saved</label>
                  <input
                    type="date"
                    value={dateWon}
                    onChange={(e) => setDateWon(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location / City</label>
                <input
                  type="text"
                  placeholder="e.g. Ikeja, Lagos"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 mt-1"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="confCheck"
                  checked={conferenceInvited}
                  onChange={(e) => setConferenceInvited(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="confCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Invited to HOREMOW Global / Regional Conference
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Discipleship Follow-up Notes</label>
                <textarea
                  rows={2}
                  placeholder="Outreach details, spiritual state, follow-up plan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 text-white hover:bg-amber-700"
              >
                Save Convert Record
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
