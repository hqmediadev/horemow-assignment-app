import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  BookMarked, 
  Headphones, 
  Users, 
  Clock, 
  FileText, 
  Sparkles, 
  X, 
  CheckCircle2,
  Mic,
  Volume2,
  Crown,
  Bell,
  LogOut
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { BibleTracker } from './components/BibleTracker';
import { BooksTracker } from './components/BooksTracker';
import { SermonTracker } from './components/SermonTracker';
import { SoulWinningTracker } from './components/SoulWinningTracker';
import { PrayerTimer } from './components/PrayerTimer';
import { ReportGenerator } from './components/ReportGenerator';
import { AiAssistantModal } from './components/AiAssistantModal';
import { FocusPrayerMode } from './components/FocusPrayerMode';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthModal } from './components/AuthModal';
import { OverseerDashboard } from './components/OverseerDashboard';
import { GettingStartedTour, GETTING_STARTED_STEPS } from './components/GettingStartedTour';

import { 
  RoleMode, 
  DisplayTheme, 
  UserAssignmentState, 
  SermonMessage, 
  SoulWonRecord, 
  PrayerSession, 
  FastingRecord, 
  UserProfile,
  ConferenceType,
  ConferenceTarget
} from './types';
import { 
  ROLE_CONFIGS, 
  INITIAL_PROFILE, 
  INITIAL_BOOKS, 
  INITIAL_SERMONS, 
  INITIAL_SOULS, 
  INITIAL_PRAYERS, 
  INITIAL_FASTINGS,
  INITIAL_CONFERENCES 
} from './data/initialData';
import { 
  auth, 
  AccountCategory, 
  syncStateToFirestore, 
  logoutUserFromFirebase, 
  fetchUserDataFromFirestore,
  completeUserOnboarding,
  shouldShowGettingStarted,
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const LOCAL_STORAGE_KEY = 'horemow_assignment_app_state_v2';

export default function App() {
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [showGettingStartedTour, setShowGettingStartedTour] = useState<boolean>(false);
  const [gettingStartedStep, setGettingStartedStep] = useState<number>(0);
  const [isNewUserSession, setIsNewUserSession] = useState<boolean>(false);

  // Auth & Category States
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isManualAccessMode, setIsManualAccessMode] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string; fullName: string } | null>(null);
  const [accountType, setAccountType] = useState<AccountCategory>('member');
  const [isOverseerView, setIsOverseerView] = useState<boolean>(false);
  const [overseerNote, setOverseerNote] = useState<string | null>(null);

  // Load state from localStorage or initial defaults
  const [appState, setAppState] = useState<UserAssignmentState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validConferences: ConferenceType[] = ['annual', 'women', 'ministers', 'youth', 'december'];
        if (!validConferences.includes(parsed.activeConference)) {
          if ((parsed.activeConference as string) === 'Women Conference') parsed.activeConference = 'women';
          else if ((parsed.activeConference as string) === 'Ministers Conference') parsed.activeConference = 'ministers';
          else if ((parsed.activeConference as string) === 'Youth Conference') parsed.activeConference = 'youth';
          else if ((parsed.activeConference as string) === 'December (General) Conference') parsed.activeConference = 'december';
          else parsed.activeConference = 'women';
        }
        parsed.conferenceTargets = {
          ...INITIAL_CONFERENCES,
          ...(parsed.conferenceTargets || {})
        };
        return parsed;
      }
    } catch (e) {
      console.error('Error reading localStorage state', e);
    }
    return {
      profile: INITIAL_PROFILE,
      roleMode: 'leader',
      theme: 'light',
      activeConference: 'women',
      conferenceTargets: INITIAL_CONFERENCES,
      bibleChapters: {
        'Joshua-1': true,
        'Joshua-2': true,
        'Joshua-3': true,
        'Joshua-4': true,
        'Ruth-1': true,
        'Ruth-2': true,
      },
      bibleNotes: {
        'Joshua-1': 'Be strong and of a good courage; be not afraid.',
      },
      books: INITIAL_BOOKS,
      sermons: INITIAL_SERMONS,
      soulsWon: INITIAL_SOULS,
      prayerSessions: INITIAL_PRAYERS,
      fastingRecords: INITIAL_FASTINGS,
      lastUpdated: new Date().toISOString(),
    };
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [isFocusPrayerMode, setIsFocusPrayerMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Form state inside modal
  const [tempProfile, setTempProfile] = useState<UserProfile>(appState.profile);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Logged in via Firebase
        const [data, tokenResult] = await Promise.all([
          fetchUserDataFromFirestore(user.uid),
          user.getIdTokenResult(),
        ]);
        const isOverseer = tokenResult.claims.overseer === true;
        const isNewMember = !isOverseer && shouldShowGettingStarted(
          data?.onboardingCompleted,
          user.metadata.creationTime || null,
        );
        setAccountType(isOverseer ? 'overseer' : 'member');
        setIsOverseerView(isOverseer);
        setIsNewUserSession(isNewMember);
        setShowGettingStartedTour(isNewMember);
        if (isNewMember) {
          setGettingStartedStep(0);
          setActiveTab('dashboard');
        }
        if (data) {
          if (data.overseerNote) {
            setOverseerNote(data.overseerNote);
          }
          if (data.state) {
            setAppState(data.state);
          }
          setCurrentUser({
            uid: user.uid,
            email: user.email || '',
            fullName: data.fullName || data.state?.profile?.fullName || 'HOREMOW Member'
          });
        } else {
          setCurrentUser({
            uid: user.uid,
            email: user.email || '',
            fullName: appState.profile.fullName || 'HOREMOW Member'
          });
        }
        setShowAuthModal(false);
        setShowWelcome(false);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, [isManualAccessMode]);

  // Sync state to LocalStorage and Firebase Firestore on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }

    if (currentUser?.uid) {
      syncStateToFirestore(currentUser.uid, appState);
    }
  }, [appState, currentUser, accountType]);

  const handleAuthSuccess = (
    cat: AccountCategory, 
    uid: string, 
    email: string, 
    fullName: string, 
    loadedState?: UserAssignmentState | null,
    isNewUser = false
  ) => {
    const shouldShowGettingStartedTour = isNewUser && cat === 'member';
    setGettingStartedStep(0);
    setIsNewUserSession(shouldShowGettingStartedTour);
    setShowGettingStartedTour(shouldShowGettingStartedTour);
    if (shouldShowGettingStartedTour) setActiveTab('dashboard');
    setAccountType(cat);
    if (cat === 'overseer') {
      setIsOverseerView(true);
    } else {
      setIsOverseerView(false);
    }
    setCurrentUser({ uid, email, fullName });
    setShowWelcome(false);
    if (loadedState) {
      setAppState(loadedState);
    } else if (fullName) {
      setAppState(prev => ({
        ...prev,
        profile: { ...prev.profile, fullName }
      }));
    }
    setShowAuthModal(false);
    setIsManualAccessMode(false);
    showToast(`Signed in successfully as ${cat === 'overseer' ? 'Overseer' : 'Member'}`);
  };

  const handleSignOut = async () => {
    await logoutUserFromFirebase();
    setCurrentUser(null);
    setIsNewUserSession(false);
    setShowGettingStartedTour(false);
    setAccountType('member');
    setIsOverseerView(false);
    setShowAuthModal(true);
    showToast("Signed out of account");
  };

  // Apply Theme class to HTML body
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'sepia-mode');
    if (appState.theme === 'dark') {
      root.classList.add('dark');
    } else if (appState.theme === 'sepia') {
      root.classList.add('sepia-mode');
    }
  }, [appState.theme]);

  // Toast alert trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const finishGettingStarted = async () => {
    setShowGettingStartedTour(false);
    setIsNewUserSession(false);

    if (!currentUser?.uid) return;

    try {
      await completeUserOnboarding(currentUser.uid);
    } catch (error) {
      console.error('Unable to save onboarding completion:', error);
      showToast('Could not save tour completion. You may see this tour again.');
    }
  };

  const changeGettingStartedStep = (stepIndex: number) => {
    const nextStep = GETTING_STARTED_STEPS[stepIndex];
    if (!nextStep) return;

    setGettingStartedStep(stepIndex);
    setActiveTab(nextStep.id);
  };

  const selectAppTab = (tab: string) => {
    setActiveTab(tab);
    if (!showGettingStartedTour) return;

    const stepIndex = GETTING_STARTED_STEPS.findIndex((step) => step.id === tab);
    if (stepIndex >= 0) setGettingStartedStep(stepIndex);
  };

  // State Updates Handlers
  const setRoleMode = (roleMode: RoleMode) => {
    setAppState(prev => ({ ...prev, roleMode }));
    showToast(`Switched to ${ROLE_CONFIGS[roleMode].roleName} Mode`);
  };

  const setTheme = (theme: DisplayTheme) => {
    setAppState(prev => ({ ...prev, theme }));
  };

  const setActiveConference = (conference: ConferenceType) => {
    setAppState(prev => ({ ...prev, activeConference: conference }));
    showToast(`Active Event Set: ${conference}`);
  };

  const updateConferenceTargets = (conf: ConferenceType, targets: Partial<ConferenceTarget>) => {
    setAppState(prev => ({
      ...prev,
      conferenceTargets: {
        ...prev.conferenceTargets,
        [conf]: { ...prev.conferenceTargets[conf], ...targets }
      }
    }));
    showToast(`Updated targets for ${conf}`);
  };

  // Bible Chapter Toggle
  const toggleChapterRead = (key: string) => {
    setAppState(prev => {
      const currentVal = !!prev.bibleChapters[key];
      const updated = { ...prev.bibleChapters, [key]: !currentVal };
      return { ...prev, bibleChapters: updated };
    });
    showToast("Updated Bible Reading Log");
  };

  const saveChapterNote = (key: string, note: string) => {
    setAppState(prev => ({
      ...prev,
      bibleNotes: { ...prev.bibleNotes, [key]: note }
    }));
    showToast("Saved Chapter Notes");
  };

  // Books Progress Update
  const updateBookProgress = (
    id: string, 
    pagesRead: number, 
    status: 'not_started' | 'reading' | 'completed',
    notes?: string
  ) => {
    setAppState(prev => ({
      ...prev,
      books: prev.books.map(b => b.id === id ? { ...b, pagesRead, status, notes } : b)
    }));
    showToast("Updated Book Reading Progress");
  };

  const addCustomBook = (bookData: { title: string; author: string; totalPages: number }) => {
    const newBook = {
      id: 'b_' + Date.now(),
      title: bookData.title,
      author: bookData.author,
      totalPages: bookData.totalPages,
      pagesRead: 0,
      status: 'not_started' as const,
      conferenceTag: appState.activeConference,
    };
    setAppState(prev => ({
      ...prev,
      books: [...prev.books, newBook]
    }));
    showToast(`Added book "${bookData.title}"`);
  };

  // Add Sermon
  const addSermon = (sermonData: Omit<SermonMessage, 'id'>) => {
    const newSermon: SermonMessage = {
      ...sermonData,
      id: 's_' + Date.now(),
    };
    setAppState(prev => ({
      ...prev,
      sermons: [newSermon, ...prev.sermons]
    }));
    showToast("Logged New Sermon Message");
  };

  // Add Soul Won
  const addSoulWon = (soulData: Omit<SoulWonRecord, 'id'>) => {
    const newSoul: SoulWonRecord = {
      ...soulData,
      id: 'w_' + Date.now(),
    };
    setAppState(prev => ({
      ...prev,
      soulsWon: [newSoul, ...prev.soulsWon]
    }));
    showToast("Added Convert Record");
  };

  const updateSoulStatus = (id: string, status: SoulWonRecord['status'], conferenceInvited: boolean) => {
    setAppState(prev => ({
      ...prev,
      soulsWon: prev.soulsWon.map(s => s.id === id ? { ...s, status, conferenceInvited } : s)
    }));
    showToast("Updated Soul Follow-up Status");
  };

  // Add Prayer Session
  const addPrayerSession = (sessionData: Omit<PrayerSession, 'id'>) => {
    const newSession: PrayerSession = {
      ...sessionData,
      id: 'p_' + Date.now(),
    };
    setAppState(prev => ({
      ...prev,
      prayerSessions: [newSession, ...prev.prayerSessions]
    }));
    showToast("Recorded Prayer Session");
  };

  // Add Fasting Record
  const addFastingRecord = (recordData: Omit<FastingRecord, 'id'>) => {
    const newRecord: FastingRecord = {
      ...recordData,
      id: 'f_' + Date.now(),
    };
    setAppState(prev => ({
      ...prev,
      fastingRecords: [newRecord, ...prev.fastingRecords]
    }));
    showToast("Logged Fasting Day");
  };

  // Quick One-Touch Actions
  const quickAddChapter = () => {
    for (let c = 1; c <= 24; c++) {
      const key = `Joshua-${c}`;
      if (!appState.bibleChapters[key]) {
        toggleChapterRead(key);
        return;
      }
    }
    toggleChapterRead('Judges-1');
  };

  const quickAddSermon = () => {
    addSermon({
      title: 'Walking in Uncompromised Holiness',
      speaker: 'Pastor Paul Rika',
      dateListened: new Date().toISOString().split('T')[0],
      durationMinutes: 60,
      keyScripture: 'Hebrews 12:14',
      revelationNotes: 'One-touch quick message log.',
      tags: ['Holiness'],
      conferenceTag: appState.activeConference,
    });
  };

  const quickAddSoul = () => {
    addSoulWon({
      name: `New Convert ${appState.soulsWon.length + 1}`,
      dateWon: new Date().toISOString().split('T')[0],
      status: 'new_convert',
      conferenceInvited: true,
      notes: 'Logged via quick one-touch button.',
      conferenceTag: appState.activeConference,
    });
  };

  // Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setAppState(prev => ({ ...prev, profile: tempProfile }));
    setShowProfileModal(false);
    showToast("Updated Member Profile");
  };

  if (showWelcome && !currentUser && !isManualAccessMode) {
    return (
      <>
        <WelcomeScreen
          onLogin={() => {
            setShowWelcome(false);
            setShowAuthModal(true);
          }}
        />
        <AuthModal
          isOpen={showAuthModal}
          pageMode
          onClose={() => {
            setShowAuthModal(false);
            setShowWelcome(true);
          }}
          onSuccess={handleAuthSuccess}
          onContinueManualAccess={() => {
            setIsManualAccessMode(true);
            setShowWelcome(false);
            setShowAuthModal(false);
            showToast("Using App in Local Manual Mode");
          }}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${
      appState.theme === 'dark' 
        ? 'bg-slate-950 text-slate-100' 
        : appState.theme === 'sepia' 
        ? 'bg-[#f5e9d3] text-amber-950' 
        : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-emerald-600 shadow-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        roleMode={appState.roleMode}
        setRoleMode={setRoleMode}
        theme={appState.theme}
        setTheme={setTheme}
        profile={appState.profile}
        activeConference={appState.activeConference}
        setActiveConference={setActiveConference}
        openProfileModal={() => {
          setTempProfile(appState.profile);
          setShowProfileModal(true);
        }}
        openAiModal={() => setShowAiModal(true)}
        enterFocusMode={() => setIsFocusPrayerMode(true)}
        streakDays={7}
        accountType={accountType}
        isOverseerView={isOverseerView}
        setIsOverseerView={setIsOverseerView}
        openAuthModal={() => setShowAuthModal(true)}
        isLoggedIn={!!currentUser}
        onSignOut={handleSignOut}
      />

      {/* Main Container */}
      {isOverseerView ? (
        <OverseerDashboard
          overseerName={currentUser?.fullName || appState.profile.fullName || 'Overseer'}
          onSwitchToMyAssignment={() => setIsOverseerView(false)}
        />
      ) : (
        <main className="mx-auto max-w-7xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8">
          
          {/* Overseer Pastoral Directive Banner (if left by Overseer) */}
          {overseerNote && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 shadow-md flex items-start justify-between gap-4 border border-amber-300">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-950/10 rounded-2xl shrink-0">
                  <Crown className="w-5 h-5 text-slate-950" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-950">
                    Overseer Pastoral Directive & Encouragement
                  </h4>
                  <p className="text-xs font-bold leading-relaxed text-slate-900">
                    "{overseerNote}"
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOverseerNote(null)}
                className="text-slate-950/70 hover:text-slate-950 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Tabs Bar */}
          <div className="-mx-3 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sepia-mode:border-[#e2d5b7] sepia-mode:bg-[#fbf0d9] sm:mx-0">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'bible', label: 'Bible Study', icon: BookOpen },
              { id: 'books', label: 'HOREMOW Books', icon: BookMarked },
              { id: 'sermons', label: 'Messages', icon: Headphones },
              { id: 'souls', label: 'Soul Winning', icon: Users },
              { id: 'prayer', label: 'Prayer & Fasting', icon: Clock },
              { id: 'report', label: 'Official Report', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => selectAppTab(tab.id)}
                  className={`shrink-0 cursor-pointer whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-bold transition-all sm:px-4 ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 sepia-mode:text-amber-900 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Views */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              state={appState}
              isNewUser={isNewUserSession}
              setTab={setActiveTab}
              quickAddSermon={quickAddSermon}
              quickAddChapter={quickAddChapter}
              quickAddSoul={quickAddSoul}
              openPrayerTimer={() => setActiveTab('prayer')}
            />
          )}

          {activeTab === 'bible' && (
            <BibleTracker
              bibleChapters={appState.bibleChapters}
              bibleNotes={appState.bibleNotes}
              toggleChapterRead={toggleChapterRead}
              saveChapterNote={saveChapterNote}
              activeConference={appState.activeConference}
              conferenceRequiredBooks={appState.conferenceTargets[appState.activeConference]?.requiredBibleBooks || INITIAL_CONFERENCES[appState.activeConference]?.requiredBibleBooks || []}
              updateConferenceRequiredBooks={(books) => updateConferenceTargets(appState.activeConference, { requiredBibleBooks: books })}
            />
          )}

          {activeTab === 'books' && (
            <BooksTracker
              books={appState.books}
              updateBookProgress={updateBookProgress}
              addCustomBook={addCustomBook}
              activeConference={appState.activeConference}
            />
          )}

          {activeTab === 'sermons' && (
            <SermonTracker
              sermons={appState.sermons}
              addSermon={addSermon}
              targetCount={appState.conferenceTargets[appState.activeConference]?.targetMessages || INITIAL_CONFERENCES[appState.activeConference]?.targetMessages || ROLE_CONFIGS[appState.roleMode].targetSermons}
              activeConference={appState.activeConference}
              updateConferenceTargets={updateConferenceTargets}
            />
          )}

          {activeTab === 'souls' && (
            <SoulWinningTracker
              soulsWon={appState.soulsWon}
              addSoulWon={addSoulWon}
              updateSoulStatus={updateSoulStatus}
              targetCount={appState.conferenceTargets[appState.activeConference]?.targetSouls || INITIAL_CONFERENCES[appState.activeConference]?.targetSouls || ROLE_CONFIGS[appState.roleMode].targetSouls}
              activeConference={appState.activeConference}
            />
          )}

          {activeTab === 'prayer' && (
            <PrayerTimer
              prayerSessions={appState.prayerSessions}
              fastingRecords={appState.fastingRecords}
              addPrayerSession={addPrayerSession}
              addFastingRecord={addFastingRecord}
              targetDailyMinutes={ROLE_CONFIGS[appState.roleMode].dailyPrayerMinutes}
              targetFastingDays={ROLE_CONFIGS[appState.roleMode].monthlyFastingDays}
              activeConference={appState.activeConference}
            />
          )}

          {activeTab === 'report' && (
            <ReportGenerator state={appState} />
          )}

        </main>
      )}

      {/* Auth Gate Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          if (!currentUser && !isManualAccessMode) setShowWelcome(true);
        }}
        onSuccess={handleAuthSuccess}
        onContinueManualAccess={() => {
          setIsManualAccessMode(true);
          setShowWelcome(false);
          setShowAuthModal(false);
          showToast("Using App in Local Manual Mode");
        }}
      />

      {showGettingStartedTour && (
        <GettingStartedTour
          onClose={() => void finishGettingStarted()}
          stepIndex={gettingStartedStep}
          onStepChange={changeGettingStartedStep}
        />
      )}

      {/* Member Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveProfile}
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md space-y-4 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] sm:p-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white sepia-mode:text-amber-950">
                Member Profile Information
              </h3>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={tempProfile.fullName}
                  onChange={(e) => setTempProfile({ ...tempProfile, fullName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Registration ID</label>
                  <input
                    type="text"
                    value={tempProfile.memberId}
                    onChange={(e) => setTempProfile({ ...tempProfile, memberId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Assignment Year</label>
                  <input
                    type="number"
                    value={tempProfile.assignmentYear}
                    onChange={(e) => setTempProfile({ ...tempProfile, assignmentYear: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Country of Fellowship</label>
                <select
                  value={tempProfile.country || 'Nigeria'}
                  onChange={(e) => setTempProfile({ ...tempProfile, country: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1 font-semibold cursor-pointer"
                >
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
                  <option value="Other Country">🌐 Other International Branch</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">State / Chapter</label>
                  <input
                    type="text"
                    value={tempProfile.stateChapter}
                    onChange={(e) => setTempProfile({ ...tempProfile, stateChapter: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Zone / Region</label>
                  <input
                    type="text"
                    value={tempProfile.zoneRegion}
                    onChange={(e) => setTempProfile({ ...tempProfile, zoneRegion: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">LGA / District</label>
                  <input
                    type="text"
                    value={tempProfile.lgaDistrict || ''}
                    onChange={(e) => setTempProfile({ ...tempProfile, lgaDistrict: e.target.value })}
                    placeholder="e.g. Ikeja District"
                    className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Branch / Fellowship</label>
                  <input
                    type="text"
                    value={tempProfile.branchFellowship || ''}
                    onChange={(e) => setTempProfile({ ...tempProfile, branchFellowship: e.target.value })}
                    placeholder="e.g. Ikeja HQ Branch"
                    className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Coordinator Name</label>
                <input
                  type="text"
                  value={tempProfile.coordinatorName}
                  onChange={(e) => setTempProfile({ ...tempProfile, coordinatorName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        state={appState}
      />

      {/* Floating Voice AI Assistant Trigger Button */}
      {!showAiModal && (
        <button
          onClick={() => setShowAiModal(true)}
          className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2.5 rounded-full border border-emerald-300/50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-3.5 font-bold text-white shadow-2xl ring-4 ring-emerald-400/40 transition-all hover:scale-105 hover:from-emerald-700 hover:to-teal-800 active:scale-95 sm:right-6 sm:px-5 sm:py-3.5"
          title="Open Voice AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute -inset-1 rounded-full bg-amber-400 opacity-75 animate-ping"></span>
            <Mic className="w-5 h-5 text-amber-300 relative z-10" />
          </div>
          <span className="hidden sm:inline text-xs font-black tracking-wide uppercase">Voice AI Assistant</span>
          <Volume2 className="w-4 h-4 text-emerald-200 hidden sm:inline" />
        </button>
      )}

      {/* Focus Prayer Mode Overlay */}
      {isFocusPrayerMode && (
        <FocusPrayerMode
          onClose={() => setIsFocusPrayerMode(false)}
          onLogSession={(minutes, topic, notes) => {
            addPrayerSession({
              date: new Date().toISOString().split('T')[0],
              durationMinutes: minutes,
              focusTopic: topic,
              notes,
              conferenceTag: appState.activeConference,
            });
            setIsFocusPrayerMode(false);
          }}
        />
      )}

    </div>
  );
}
