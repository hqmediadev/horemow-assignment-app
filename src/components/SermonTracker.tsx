import React, { useState } from 'react';
import { 
  Headphones, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Sparkles,
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { SermonMessage, ConferenceType, ConferenceTarget } from '../types';

interface SermonTrackerProps {
  sermons: SermonMessage[];
  addSermon: (sermon: Omit<SermonMessage, 'id'>) => void;
  targetCount: number;
  activeConference: ConferenceType;
  updateConferenceTargets?: (conf: ConferenceType, targets: Partial<ConferenceTarget>) => void;
}

const PRESET_MESSAGES = [
  {
    title: 'Restitution: The Highway to Heaven',
    speaker: 'Pastor Paul Rika',
    keyScripture: 'Luke 19:8-9, Proverbs 28:13',
    durationMinutes: 90,
    tags: ['Restitution', 'Doctrine']
  },
  {
    title: 'Maintaining the Garments of Purity and White',
    speaker: 'Pastor Paul Rika',
    keyScripture: 'Ecclesiastes 9:8, Revelation 19:8',
    durationMinutes: 75,
    tags: ['Holiness', 'Rapture']
  },
  {
    title: 'The Great Commission and Soul Winning Mandate',
    speaker: 'Pastor Paul Rika',
    keyScripture: 'Mark 16:15, Ezekiel 3:17',
    durationMinutes: 80,
    tags: ['Evangelism']
  },
  {
    title: 'Overcoming Satanic Traps in the End Time',
    speaker: 'Pastor Paul Rika',
    keyScripture: '2 Corinthians 2:11, Ephesians 6:11',
    durationMinutes: 85,
    tags: ['Spiritual Warfare']
  }
];

export const SermonTracker: React.FC<SermonTrackerProps> = ({
  sermons,
  addSermon,
  targetCount,
  activeConference,
  updateConferenceTargets
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAiDocModal, setShowAiDocModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // AI Document upload state
  const [docText, setDocText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('Pastor Paul Rika');
  const [dateListened, setDateListened] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [keyScripture, setKeyScripture] = useState('');
  const [revelationNotes, setRevelationNotes] = useState('');
  const [tagInput, setTagInput] = useState('');

  const filteredSermons = sermons.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.keyScripture && s.keyScripture.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addSermon({
      title: title.trim(),
      speaker: speaker.trim() || 'Pastor Paul Rika',
      dateListened,
      durationMinutes,
      keyScripture: keyScripture.trim(),
      revelationNotes: revelationNotes.trim(),
      tags: tagInput ? tagInput.split(',').map(t => t.trim()) : ['HOREMOW Message'],
      conferenceTag: activeConference,
    });

    setTitle('');
    setKeyScripture('');
    setRevelationNotes('');
    setShowAddModal(false);
  };

  const handleLogPreset = (preset: typeof PRESET_MESSAGES[0]) => {
    addSermon({
      title: preset.title,
      speaker: preset.speaker,
      dateListened: new Date().toISOString().split('T')[0],
      durationMinutes: preset.durationMinutes,
      keyScripture: preset.keyScripture,
      revelationNotes: 'Listened to recording and noted core holiness teachings.',
      tags: preset.tags,
      conferenceTag: activeConference,
    });
  };

  const handleParseDocument = async () => {
    if (!docText.trim()) return;
    setIsParsing(true);
    setParseResult(null);

    try {
      const res = await fetch('/api/ai/parse-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: docText }),
      });
      const data = await res.json();
      if (data.result) {
        setParseResult(data.result);
        if (updateConferenceTargets && data.result.conferenceType) {
          updateConferenceTargets(data.result.conferenceType, {
            targetMessages: data.result.targetMessages || targetCount,
            targetBooks: data.result.targetBooks || 5,
            targetPrayerHours: data.result.targetPrayerHours || 30,
            targetFastingDays: data.result.targetFastingDays || 7,
            targetSouls: data.result.targetSouls || 10,
          });
        }
      }
    } catch (err) {
      console.error('Failed to parse assignment doc', err);
    } finally {
      setIsParsing(false);
    }
  };

  const sermonPercent = Math.min(100, Math.round((sermons.length / targetCount) * 100));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                <Headphones className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950">
                Messages
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 sepia-mode:text-amber-800 mt-1">
              Record inspired Pastor Paul Rika & HOREMOW messages listened to on tape, radio, or conference recordings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAiDocModal(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-600" />
              <span>Upload Assignment Flyer / Sheet</span>
            </button>

            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Target</div>
              <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                {sermons.length} / {targetCount} Messages
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 text-xs font-bold rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Log Message
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${sermonPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recommended Messages Presets */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Quick Preset HOREMOW Messages
          </h3>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Click to log instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_MESSAGES.map((p, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/60 shadow-2xs hover:border-indigo-500 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest">{p.speaker}</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-2">
                  {p.title}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">{p.keyScripture}</p>
              </div>

              <button
                onClick={() => handleLogPreset(p)}
                className="mt-3 w-full py-2 text-[11px] font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Mark Listened
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search logged messages by title, scripture, or speaker..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
        />
      </div>

      {/* Sermon Log Feed */}
      <div className="space-y-3">
        {filteredSermons.map((sermon) => (
          <div
            key={sermon.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-extrabold uppercase">
                  {sermon.speaker}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {sermon.dateListened}
                </span>
                {sermon.durationMinutes && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {sermon.durationMinutes} mins
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {sermon.title}
              </h3>

              {sermon.keyScripture && (
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Scripture: {sermon.keyScripture}
                </div>
              )}

              {sermon.revelationNotes && (
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl mt-1">
                  "{sermon.revelationNotes}"
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-1 shrink-0">
              {sermon.tags?.map((t, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Assignment Document Parser Modal */}
      {showAiDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                AI Assignment Document Parser
              </h3>
              <button onClick={() => setShowAiDocModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Paste your official HOREMOW conference flyer text or assignment guideline document below. Gemini AI will automatically configure your required targets!
            </p>

            <textarea
              rows={5}
              placeholder="Paste conference syllabus, flyer text, or assignment guidelines here..."
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />

            <button
              onClick={handleParseDocument}
              disabled={isParsing || !docText.trim()}
              className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Parsing Assignment Document...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Extract & Apply Assignment Targets
                </>
              )}
            </button>

            {parseResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Targets Extracted & Configured!
                </div>
                <div className="text-emerald-800 dark:text-emerald-300">
                  Target Messages: <strong>{parseResult.targetMessages || targetCount}</strong> • Prayer: <strong>{parseResult.targetPrayerHours || 30} hrs</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Sermon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Headphones className="w-5 h-5 text-indigo-600" />
              Log New HOREMOW Message
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Message Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Holiness and Righteousness in Business"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Preacher / Speaker</label>
                  <input
                    type="text"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date Listened</label>
                  <input
                    type="date"
                    value={dateListened}
                    onChange={(e) => setDateListened(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Key Scripture</label>
                  <input
                    type="text"
                    placeholder="e.g. Heb 12:14"
                    value={keyScripture}
                    onChange={(e) => setKeyScripture(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Revelation Notes & Key Points</label>
                <textarea
                  rows={3}
                  placeholder="What was God's message to your heart?"
                  value={revelationNotes}
                  onChange={(e) => setRevelationNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Message
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
