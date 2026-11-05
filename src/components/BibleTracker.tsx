import React, { useState } from 'react';
import { 
  BookOpen, 
  Check, 
  Search, 
  Bookmark, 
  CheckCircle2, 
  FileText,
  Calendar,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { BIBLE_PLANS } from '../data/initialData';
import { ConferenceType } from '../types';

interface BibleTrackerProps {
  bibleChapters: Record<string, boolean>;
  bibleNotes: Record<string, string>;
  toggleChapterRead: (key: string) => void;
  saveChapterNote: (key: string, note: string) => void;
  activeConference: ConferenceType;
  conferenceRequiredBooks: string[];
  updateConferenceRequiredBooks: (books: string[]) => void;
}

// Complete list of Old Testament (39) & New Testament (27) books with chapter counts
const OLD_TESTAMENT_BOOKS = [
  { book: 'Genesis', totalChapters: 50 },
  { book: 'Exodus', totalChapters: 40 },
  { book: 'Leviticus', totalChapters: 27 },
  { book: 'Numbers', totalChapters: 36 },
  { book: 'Deuteronomy', totalChapters: 34 },
  { book: 'Joshua', totalChapters: 24 },
  { book: 'Judges', totalChapters: 21 },
  { book: 'Ruth', totalChapters: 4 },
  { book: '1 Samuel', totalChapters: 31 },
  { book: '2 Samuel', totalChapters: 24 },
  { book: '1 Kings', totalChapters: 22 },
  { book: '2 Kings', totalChapters: 25 },
  { book: '1 Chronicles', totalChapters: 29 },
  { book: '2 Chronicles', totalChapters: 36 },
  { book: 'Ezra', totalChapters: 10 },
  { book: 'Nehemiah', totalChapters: 13 },
  { book: 'Esther', totalChapters: 10 },
  { book: 'Job', totalChapters: 42 },
  { book: 'Psalms', totalChapters: 150 },
  { book: 'Proverbs', totalChapters: 31 },
  { book: 'Ecclesiastes', totalChapters: 12 },
  { book: 'Song of Solomon', totalChapters: 8 },
  { book: 'Isaiah', totalChapters: 66 },
  { book: 'Jeremiah', totalChapters: 52 },
  { book: 'Lamentations', totalChapters: 5 },
  { book: 'Ezekiel', totalChapters: 48 },
  { book: 'Daniel', totalChapters: 12 },
  { book: 'Hosea', totalChapters: 14 },
  { book: 'Joel', totalChapters: 3 },
  { book: 'Amos', totalChapters: 9 },
  { book: 'Obadiah', totalChapters: 1 },
  { book: 'Jonah', totalChapters: 4 },
  { book: 'Micah', totalChapters: 7 },
  { book: 'Nahum', totalChapters: 3 },
  { book: 'Habakkuk', totalChapters: 3 },
  { book: 'Zephaniah', totalChapters: 3 },
  { book: 'Haggai', totalChapters: 2 },
  { book: 'Zechariah', totalChapters: 14 },
  { book: 'Malachi', totalChapters: 4 },
];

const NEW_TESTAMENT_BOOKS = [
  { book: 'Matthew', totalChapters: 28 },
  { book: 'Mark', totalChapters: 16 },
  { book: 'Luke', totalChapters: 24 },
  { book: 'John', totalChapters: 21 },
  { book: 'Acts', totalChapters: 28 },
  { book: 'Romans', totalChapters: 16 },
  { book: '1 Corinthians', totalChapters: 16 },
  { book: '2 Corinthians', totalChapters: 13 },
  { book: 'Galatians', totalChapters: 6 },
  { book: 'Ephesians', totalChapters: 6 },
  { book: 'Philippians', totalChapters: 4 },
  { book: 'Colossians', totalChapters: 4 },
  { book: '1 Thessalonians', totalChapters: 5 },
  { book: '2 Thessalonians', totalChapters: 3 },
  { book: '1 Timothy', totalChapters: 6 },
  { book: '2 Timothy', totalChapters: 4 },
  { book: 'Titus', totalChapters: 3 },
  { book: 'Philemon', totalChapters: 1 },
  { book: 'Hebrews', totalChapters: 13 },
  { book: 'James', totalChapters: 5 },
  { book: '1 Peter', totalChapters: 5 },
  { book: '2 Peter', totalChapters: 3 },
  { book: '1 John', totalChapters: 5 },
  { book: '2 John', totalChapters: 1 },
  { book: '3 John', totalChapters: 1 },
  { book: 'Jude', totalChapters: 1 },
  { book: 'Revelation', totalChapters: 22 },
];

const ALL_BIBLE_BOOKS = [
  ...OLD_TESTAMENT_BOOKS.map(b => ({ ...b, testament: 'Old Testament' })),
  ...NEW_TESTAMENT_BOOKS.map(b => ({ ...b, testament: 'New Testament' }))
];

export const BibleTracker: React.FC<BibleTrackerProps> = ({
  bibleChapters,
  bibleNotes,
  toggleChapterRead,
  saveChapterNote,
  activeConference,
  conferenceRequiredBooks = [],
  updateConferenceRequiredBooks,
}) => {
  const [testamentFilter, setTestamentFilter] = useState<'all' | 'old' | 'new' | 'conference'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeBook, setActiveBook] = useState<string>('Joshua');
  const [editingChapterKey, setEditingChapterKey] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  
  // Custom conference book modal
  const [showBookConfigModal, setShowBookConfigModal] = useState(false);
  const [newBookInput, setNewBookInput] = useState('');

  // Filter books list
  const filteredBooks = ALL_BIBLE_BOOKS.filter(b => {
    const matchesSearch = b.book.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (testamentFilter === 'old') return b.testament === 'Old Testament';
    if (testamentFilter === 'new') return b.testament === 'New Testament';
    if (testamentFilter === 'conference') return conferenceRequiredBooks.includes(b.book);
    return true;
  });

  const effectiveBookName = activeBook || filteredBooks[0]?.book || 'Joshua';
  const selectedBookObj = ALL_BIBLE_BOOKS.find(b => b.book === effectiveBookName) || ALL_BIBLE_BOOKS[0];

  // Calculate overall Bible stats
  let totalChaptersCount = 1189; // 39 OT + 27 NT
  let totalReadCount = 0;
  ALL_BIBLE_BOOKS.forEach(b => {
    for (let c = 1; c <= b.totalChapters; c++) {
      if (bibleChapters[`${b.book}-${c}`]) totalReadCount++;
    }
  });

  // Calculate conference required books stats
  let conferenceTotalChapters = 0;
  let conferenceReadChapters = 0;
  conferenceRequiredBooks.forEach(bookName => {
    const found = ALL_BIBLE_BOOKS.find(b => b.book === bookName);
    if (found) {
      conferenceTotalChapters += found.totalChapters;
      for (let c = 1; c <= found.totalChapters; c++) {
        if (bibleChapters[`${bookName}-${c}`]) conferenceReadChapters++;
      }
    }
  });

  const conferencePercent = conferenceTotalChapters > 0 
    ? Math.round((conferenceReadChapters / conferenceTotalChapters) * 100) 
    : 0;

  const handleOpenNoteModal = (key: string) => {
    setEditingChapterKey(key);
    setTempNote(bibleNotes[key] || '');
  };

  const handleSaveNote = () => {
    if (editingChapterKey) {
      saveChapterNote(editingChapterKey, tempNote);
      setEditingChapterKey(null);
    }
  };

  const handleToggleConferenceBook = (bookName: string) => {
    if (conferenceRequiredBooks.includes(bookName)) {
      updateConferenceRequiredBooks(conferenceRequiredBooks.filter(b => b !== bookName));
    } else {
      updateConferenceRequiredBooks([...conferenceRequiredBooks, bookName]);
    }
  };

  const handleAddCustomBook = () => {
    if (newBookInput.trim() && !conferenceRequiredBooks.includes(newBookInput.trim())) {
      updateConferenceRequiredBooks([...conferenceRequiredBooks, newBookInput.trim()]);
      setNewBookInput('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Conference Requirement Overview */}
      <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950">
                Bible Study Tracker
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 sepia-mode:text-amber-800 mt-1">
              Categorized explicitly into <strong>Old Testament</strong> and <strong>New Testament</strong> with Conference Target customization.
            </p>
          </div>

          {/* Conference Target Pill & Customizer Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBookConfigModal(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Calendar className="w-4 h-4" />
              <span>Set Conference Required Books</span>
            </button>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 sepia-mode:bg-[#eddcb9]/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Conference Bible Target</div>
                <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  {conferenceReadChapters} / {conferenceTotalChapters} Ch.
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                {conferencePercent}%
              </div>
            </div>
          </div>
        </div>

        {/* Division Tabs: All / Old Testament / New Testament / Conference Required */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'all', label: `All Books (66)` },
            { id: 'old', label: `Old Testament (39)` },
            { id: 'new', label: `New Testament (27)` },
            { id: 'conference', label: `Conference Required (${conferenceRequiredBooks.length})` },
          ].map((tab) => {
            const active = testamentFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTestamentFilter(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 sepia-mode:bg-[#eddcb9] text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Books List Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3 space-y-1 shadow-xs max-h-[500px] overflow-y-auto">
            {filteredBooks.map((b) => {
              const isActiveBook = b.book === effectiveBookName;
              const isConferenceRequired = conferenceRequiredBooks.includes(b.book);

              let readBookChapters = 0;
              for (let c = 1; c <= b.totalChapters; c++) {
                if (bibleChapters[`${b.book}-${c}`]) readBookChapters++;
              }
              const isBookDone = readBookChapters === b.totalChapters;

              return (
                <button
                  key={b.book}
                  onClick={() => setActiveBook(b.book)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActiveBook
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {isBookDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    ) : (
                      <Bookmark className={`w-4 h-4 shrink-0 ${isConferenceRequired ? 'text-amber-500' : 'text-slate-400'}`} />
                    )}
                    <span className="truncate">{b.book}</span>
                    {isConferenceRequired && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-500 text-white shrink-0">
                        Conf
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 ${
                    isActiveBook ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {readBookChapters}/{b.totalChapters}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapters Interactive Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950 flex items-center gap-2">
                  <span>{selectedBookObj.book}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {selectedBookObj.testament} • {selectedBookObj.totalChapters} Chapters
                  </span>
                  {conferenceRequiredBooks.includes(selectedBookObj.book) && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
                      Conference Required
                    </span>
                  )}
                </h3>
              </div>

              {/* Mark All Read Button */}
              <button
                onClick={() => {
                  for (let c = 1; c <= selectedBookObj.totalChapters; c++) {
                    const key = `${selectedBookObj.book}-${c}`;
                    if (!bibleChapters[key]) toggleChapterRead(key);
                  }
                }}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
              >
                Mark Book Complete
              </button>
            </div>

            {/* Chapter Box Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
              {Array.from({ length: selectedBookObj.totalChapters }, (_, i) => i + 1).map((ch) => {
                const key = `${selectedBookObj.book}-${ch}`;
                const isRead = !!bibleChapters[key];
                const hasNote = !!bibleNotes[key];

                return (
                  <div
                    key={ch}
                    className={`relative group rounded-2xl border p-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isRead
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                    }`}
                    onClick={() => toggleChapterRead(key)}
                  >
                    <span className="text-xs font-bold">Ch. {ch}</span>
                    {isRead ? (
                      <Check className="w-3.5 h-3.5 mt-0.5 text-emerald-200" />
                    ) : (
                      <span className="text-[9px] text-slate-400 mt-0.5">Unread</span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenNoteModal(key);
                      }}
                      title={hasNote ? "View/Edit Note" : "Add Note"}
                      className={`absolute top-1 right-1 p-0.5 rounded-full ${
                        hasNote 
                          ? 'text-amber-300 bg-amber-900/60' 
                          : 'text-slate-400 hover:text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Conference Required Books Selector Modal */}
      {showBookConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] max-w-xl w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Select Conference Required Bible Books
              </h3>
              <button
                onClick={() => setShowBookConfigModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Check the specific Bible books assigned for your current conference or enter custom book titles.
            </p>

            {/* Quick Add Custom Book Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter custom book name (e.g. Obadiah, Titus)..."
                value={newBookInput}
                onChange={(e) => setNewBookInput(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={handleAddCustomBook}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {/* Books Toggle List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
              {ALL_BIBLE_BOOKS.map((b) => {
                const isChecked = conferenceRequiredBooks.includes(b.book);
                return (
                  <button
                    key={b.book}
                    type="button"
                    onClick={() => handleToggleConferenceBook(b.book)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{b.book}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {conferenceRequiredBooks.length} Books Selected for Conference
              </span>
              <button
                onClick={() => setShowBookConfigModal(false)}
                className="px-5 py-2 text-xs font-bold rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Done / Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Note Modal */}
      {editingChapterKey && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Notes for {editingChapterKey.replace('-', ' Chapter ')}
            </h3>

            <textarea
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="Record your spiritual insights, revelations, or scriptures from this chapter..."
              rows={4}
              className="w-full text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingChapterKey(null)}
                className="px-4 py-2 text-xs font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 text-xs font-bold rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
