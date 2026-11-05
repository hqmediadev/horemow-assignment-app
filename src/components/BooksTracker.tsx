import React, { useState } from 'react';
import { 
  BookMarked, 
  Search, 
  Sparkles, 
  Plus,
  Calendar,
  X,
  PlusCircle,
  Tag
} from 'lucide-react';
import { HoremowBook, ConferenceType } from '../types';

interface BooksTrackerProps {
  books: HoremowBook[];
  updateBookProgress: (id: string, pagesRead: number, status: 'not_started' | 'reading' | 'completed', notes?: string) => void;
  activeConference: ConferenceType;
  addCustomBook?: (book: Omit<HoremowBook, 'id'>) => void;
}

export const BooksTracker: React.FC<BooksTrackerProps> = ({
  books,
  updateBookProgress,
  activeConference,
  addCustomBook
}) => {
  const [selectedBook, setSelectedBook] = useState<HoremowBook | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [conferenceFilter, setConferenceFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // New book modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('Pastor Paul Rika');
  const [newPages, setNewPages] = useState(120);
  const [newSummary, setNewSummary] = useState('');
  const [newConferenceTag, setNewConferenceTag] = useState<ConferenceType>(activeConference);

  // Editing state inside modal
  const [pagesInput, setPagesInput] = useState<number>(0);
  const [notesInput, setNotesInput] = useState<string>('');

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
    const matchesConf = conferenceFilter === 'all' || (b.conferenceTag && b.conferenceTag === conferenceFilter);
    return matchesSearch && matchesFilter && matchesConf;
  });

  const handleOpenBook = (book: HoremowBook) => {
    setSelectedBook(book);
    setPagesInput(book.pagesRead);
    setNotesInput(book.notes || '');
  };

  const handleSaveBook = () => {
    if (!selectedBook) return;

    let newStatus: 'not_started' | 'reading' | 'completed' = 'reading';
    if (pagesInput <= 0) newStatus = 'not_started';
    else if (pagesInput >= selectedBook.totalPages) newStatus = 'completed';

    updateBookProgress(selectedBook.id, Math.min(pagesInput, selectedBook.totalPages), newStatus, notesInput);
    setSelectedBook(null);
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (addCustomBook) {
      addCustomBook({
        title: newTitle,
        author: newAuthor || 'Pastor Paul Rika',
        totalPages: Number(newPages) || 100,
        pagesRead: 0,
        status: 'not_started',
        summary: newSummary || 'HOREMOW required reading material.',
        keyTakeaways: ['Deepen holiness and spiritual doctrine'],
        conferenceTag: newConferenceTag,
      });
    }

    setNewTitle('');
    setNewSummary('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filters */}
      <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                <BookMarked className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950">
                HOREMOW Books Reader
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 sepia-mode:text-amber-800 mt-1">
              Required publications by Pastor Paul Rika & Conference specialized titles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Conference Book</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          
          {/* Conference Tag Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Event:
            </span>
            <select
              value={conferenceFilter}
              onChange={(e) => setConferenceFilter(e.target.value)}
              className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-2.5 py-1.5"
            >
              <option value="all">All Conferences</option>
              <option value="annual">Annual Cycle</option>
              <option value="women">Women Conference</option>
              <option value="ministers">Ministers Conference</option>
              <option value="youth">Youth Conference</option>
              <option value="december">December General</option>
            </select>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs">
              {['all', 'completed', 'reading', 'not_started'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-xl font-semibold capitalize transition-all cursor-pointer ${
                    filterStatus === st 
                      ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Book Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBooks.map((book) => {
          const percent = Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100));

          return (
            <div
              key={book.id}
              onClick={() => handleOpenBook(book)}
              className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs hover:shadow-md hover:border-teal-500/50 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Book Badge Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      book.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : book.status === 'reading'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {book.status.replace('_', ' ')}
                    </span>
                    {book.conferenceTag && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950 dark:text-teal-300">
                        {book.conferenceTag}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {book.pagesRead} / {book.totalPages} pp
                  </span>
                </div>

                {/* Title & Author */}
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Author: {book.author}
                </p>

                {/* Summary */}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {book.summary}
                </p>
              </div>

              {/* Progress Bar & Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Reading Progress</span>
                  <span className="text-teal-600 font-bold">{percent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Conference Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-teal-600" /> Add Required Conference Book
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Holiness Code for Believers"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Author Name</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Pages</label>
                  <input
                    type="number"
                    min="1"
                    value={newPages}
                    onChange={(e) => setNewPages(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Assign Event</label>
                  <select
                    value={newConferenceTag}
                    onChange={(e) => setNewConferenceTag(e.target.value as ConferenceType)}
                    className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none font-bold"
                  >
                    <option value="annual">Annual Cycle</option>
                    <option value="women">Women Conference</option>
                    <option value="ministers">Ministers Conference</option>
                    <option value="youth">Youth Conference</option>
                    <option value="december">December General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Brief Overview / Summary</label>
                <textarea
                  rows={2}
                  placeholder="Summary or purpose of book..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
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
                  className="px-5 py-2 text-xs font-bold rounded-2xl bg-teal-600 text-white hover:bg-teal-700"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Reading & Notes Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] max-w-lg w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                Update Reading Progress
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950 mt-1">
                {selectedBook.title}
              </h3>
              <p className="text-xs text-slate-500">By {selectedBook.author}</p>
            </div>

            {/* Page Count Input */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span>Pages Read</span>
                <span>{pagesInput} / {selectedBook.totalPages} Pages</span>
              </div>
              <input
                type="range"
                min="0"
                max={selectedBook.totalPages}
                value={pagesInput}
                onChange={(e) => setPagesInput(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between items-center gap-2 pt-1">
                <button
                  onClick={() => setPagesInput(Math.max(0, pagesInput - 10))}
                  className="px-2.5 py-1 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  -10 Pages
                </button>
                <input
                  type="number"
                  min="0"
                  max={selectedBook.totalPages}
                  value={pagesInput}
                  onChange={(e) => setPagesInput(Number(e.target.value))}
                  className="w-20 text-center text-xs py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
                <button
                  onClick={() => setPagesInput(Math.min(selectedBook.totalPages, pagesInput + 10))}
                  className="px-2.5 py-1 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  +10 Pages
                </button>
              </div>
            </div>

            {/* Personal Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Personal Reading Notes & Revelations
              </label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Write summary notes or lessons from this book..."
                rows={3}
                className="w-full text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 text-xs font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBook}
                className="px-4 py-2 text-xs font-bold rounded-2xl bg-teal-600 text-white hover:bg-teal-700"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
