import React from 'react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Eye, 
  CheckCircle2, 
  Flame, 
  Calendar,
  Mic,
  Crown,
  LogIn,
  LogOut
} from 'lucide-react';
import { RoleMode, DisplayTheme, UserProfile, ConferenceType } from '../types';
import { ROLE_CONFIGS } from '../data/initialData';
import { HoremowLogo } from './HoremowLogo';
import { AccountCategory } from '../lib/firebase';

interface NavbarProps {
  roleMode: RoleMode;
  setRoleMode: (mode: RoleMode) => void;
  activeConference: ConferenceType;
  setActiveConference: (conf: ConferenceType) => void;
  theme: DisplayTheme;
  setTheme: (theme: DisplayTheme) => void;
  profile: UserProfile;
  openProfileModal: () => void;
  openAiModal: () => void;
  enterFocusMode: () => void;
  streakDays: number;
  accountType: AccountCategory;
  isOverseerView: boolean;
  setIsOverseerView: (val: boolean) => void;
  openAuthModal: () => void;
  isLoggedIn: boolean;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roleMode,
  setRoleMode,
  activeConference,
  setActiveConference,
  theme,
  setTheme,
  profile,
  openProfileModal,
  openAiModal,
  enterFocusMode,
  streakDays,
  accountType,
  isOverseerView,
  setIsOverseerView,
  openAuthModal,
  isLoggedIn,
  onSignOut
}) => {
  const conferencesList: { id: ConferenceType; label: string }[] = [
    { id: 'annual', label: 'Annual Cycle' },
    { id: 'women', label: 'Women' },
    { id: 'ministers', label: 'Ministers' },
    { id: 'youth', label: 'Youth' },
    { id: 'december', label: 'December (General)' },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 sepia-mode:bg-[#fbf0d9]/90 border-b border-slate-200 dark:border-slate-800 sepia-mode:border-[#e2d5b7] transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 sm:min-h-16 sm:gap-3 sm:py-0">
          
          {/* Logo & Clean Title */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5 cursor-pointer" onClick={openProfileModal}>
            <HoremowLogo size={38} />
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white sepia-mode:text-amber-950 flex items-center gap-1.5 leading-tight">
                HOREMOW
                {accountType === 'overseer' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-black border border-amber-300/40 hidden sm:inline-flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-500" /> Overseer
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Overseer Portal View Switcher Button */}
          {accountType === 'overseer' && (
            <button
              onClick={() => setIsOverseerView(!isOverseerView)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border ${
                isOverseerView 
                  ? 'bg-amber-500 text-slate-900 border-amber-400 ring-2 ring-amber-300/50' 
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300/50 hover:bg-amber-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{isOverseerView ? 'Switch to My Assignment' : 'Overseer Portal'}</span>
            </button>
          )}

          {/* Conference Context Selector */}
          {!isOverseerView && (
            <div className="hidden md:flex items-center bg-emerald-50/80 dark:bg-emerald-950/40 sepia-mode:bg-[#eddcb9] p-1 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-600" /> Event:
              </span>
              {conferencesList.map((c) => {
                const active = activeConference === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConference(c.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                      active
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Role Switcher Pill */}
          {!isOverseerView && (
            <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-800 sepia-mode:bg-[#eddcb9] p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              {(Object.keys(ROLE_CONFIGS) as RoleMode[]).map((mode) => {
                const active = roleMode === mode;
                const cfg = ROLE_CONFIGS[mode];
                return (
                  <button
                    key={mode}
                    onClick={() => setRoleMode(mode)}
                    title={cfg.description}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
                      active
                        ? 'bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {active && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {cfg.roleName.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          )}

          {/* Actions & Utilities */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            
            {/* Streak Badge */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 sepia-mode:bg-amber-200/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{streakDays}d Streak</span>
            </div>

            {/* Voice AI Assistant Button */}
            <button
              onClick={openAiModal}
              title="Open Voice AI Assistant"
              className="px-3 py-1.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer ring-2 ring-emerald-400/30"
            >
              <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">Voice AI</span>
            </button>

            {/* Theme Toggle (Light / Dark / Sepia) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 sepia-mode:bg-[#eddcb9] p-1 rounded-2xl">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-xl transition-colors ${
                  theme === 'light' ? 'bg-white text-amber-500 shadow-xs' : 'text-slate-400'
                }`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-xl transition-colors ${
                  theme === 'dark' ? 'bg-slate-900 text-indigo-400 shadow-xs' : 'text-slate-400'
                }`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`p-1.5 rounded-xl transition-colors ${
                  theme === 'sepia' ? 'bg-[#fbf0d9] text-amber-800 shadow-xs' : 'text-slate-400'
                }`}
                title="Sepia Mode"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Login / Auth Button or User Profile */}
            {isLoggedIn ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={openProfileModal}
                  className="p-1 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  title="Profile Settings"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                    {profile.fullName ? profile.fullName.charAt(0) : 'H'}
                  </div>
                </button>
                
                <button
                  onClick={onSignOut}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="Sign Out / Switch Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                title="Login or register"
                className="px-3 py-1.5 text-xs font-extrabold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Login / Register</span>
              </button>
            )}

          </div>

          {!isOverseerView && (
            <div className="flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-1 dark:border-emerald-800/60 dark:bg-emerald-950/40 md:hidden">
              <span className="flex shrink-0 items-center gap-1 px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                <Calendar className="h-3 w-3" /> Event
              </span>
              {conferencesList.map((conference) => (
                <button
                  key={conference.id}
                  onClick={() => setActiveConference(conference.id)}
                  className={`shrink-0 rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                    activeConference === conference.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {conference.label}
                </button>
              ))}
            </div>
          )}

          {!isOverseerView && (
            <div className="flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/60 bg-slate-100 p-1 dark:border-slate-700/60 dark:bg-slate-800 xl:hidden">
              {(Object.keys(ROLE_CONFIGS) as RoleMode[]).map((mode) => {
                const active = roleMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setRoleMode(mode)}
                    title={ROLE_CONFIGS[mode].description}
                    className={`shrink-0 rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                      active
                        ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {ROLE_CONFIGS[mode].roleName.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
