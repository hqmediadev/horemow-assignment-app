import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft,
  User, 
  Lock, 
  Mail, 
  MapPin, 
  Sparkles, 
  ChevronDown, 
  LogIn, 
  UserPlus, 
  Loader2, 
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { 
  AccountCategory, 
  registerUserWithFirebase, 
  loginUserWithFirebase,
  signInWithGoogle,
} from '../lib/firebase';
import { UserAssignmentState } from '../types';
import { HoremowLogo } from './HoremowLogo';

interface AuthModalProps {
  isOpen: boolean;
  pageMode?: boolean;
  onClose: () => void;
  onSuccess: (
    accountType: AccountCategory, 
    uid: string, 
    email: string, 
    fullName: string, 
    loadedState?: UserAssignmentState | null,
    isNewUser?: boolean
  ) => void;
  onContinueManualAccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  pageMode = false,
  onClose,
  onSuccess,
  onContinueManualAccess
}) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const accountType: AccountCategory = 'member';
  const [country, setCountry] = useState<string>('Nigeria');
  const [stateChapter, setStateChapter] = useState<string>('Lagos Chapter');
  const [zoneRegion, setZoneRegion] = useState<string>('South-West Zone 1');
  const [lgaDistrict, setLgaDistrict] = useState<string>('Ikeja LGA District');
  const [branchFellowship, setBranchFellowship] = useState<string>('Ikeja Central HQ Fellowship');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide your email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (isRegister && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const { user, userData } = await registerUserWithFirebase(
          email,
          password,
          fullName,
          country,
          stateChapter,
          zoneRegion,
          lgaDistrict,
          branchFellowship
        );
        onSuccess(accountType, user.uid, user.email || email, fullName, userData.state, userData.onboardingCompleted === false);
      } else {
        const { user, userData, tokenResult } = await loginUserWithFirebase(email, password);
        const resolvedAccountType: AccountCategory = tokenResult.claims.overseer === true ? 'overseer' : 'member';
        const resolvedName = userData?.fullName || userData?.state?.profile?.fullName || 'HOREMOW Member';
        onSuccess(
          resolvedAccountType, 
          user.uid, 
          user.email || email, 
          resolvedName, 
          userData?.state || null,
          userData?.onboardingCompleted === false
        );
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please try again or create a new account.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email and password sign-in is disabled for this Firebase project. Enable it under Firebase Console > Authentication > Sign-in method.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = `This domain is not authorized for Firebase Authentication. Add ${window.location.hostname} under Firebase Console > Authentication > Settings > Authorized domains.`;
      } else if (err.code === 'permission-denied' || err.code === 'firestore/permission-denied') {
        msg = 'Firebase Authentication succeeded, but Firestore rejected the assignment profile. Deploy the project Firestore rules, then sign in again to initialize the record.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const { user, userData, tokenResult } = await signInWithGoogle();
      const resolvedAccountType: AccountCategory = tokenResult.claims.overseer === true ? 'overseer' : 'member';
      const resolvedName = userData?.fullName || user.displayName || 'HOREMOW Member';
      onSuccess(
        resolvedAccountType,
        user.uid,
        user.email || '',
        resolvedName,
        userData?.state || null,
        userData?.onboardingCompleted === false,
      );
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google sign-in was cancelled. You can try again whenever you are ready.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Your browser blocked the Google sign-in popup. Allow popups for this site and try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Google sign-in is disabled for this Firebase project. Enable Google under Firebase Console > Authentication > Sign-in method.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setErrorMsg('An account already exists with this email. Sign in using the method you used when you created the account; Google account linking is not available yet.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg(`This domain is not authorized for Firebase Authentication. Add ${window.location.hostname} under Firebase Console > Authentication > Settings > Authorized domains.`);
      } else if (err.code === 'permission-denied' || err.code === 'firestore/permission-denied') {
        setErrorMsg('Google authentication succeeded, but Firestore rejected the assignment profile. Deploy the project Firestore rules, then sign in again.');
      } else {
        setErrorMsg(err.message || 'Unable to continue with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={pageMode
      ? 'fixed inset-0 z-50 flex justify-center overflow-y-auto bg-slate-100 dark:bg-slate-950'
      : 'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/80 p-4 backdrop-blur-sm'
    }>
      <div className={pageMode
        ? 'min-h-[100svh] w-full max-w-lg overflow-hidden border-x border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 sepia-mode:bg-[#fbf0d9]'
        : 'my-8 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sepia-mode:bg-[#fbf0d9]'
      }>
        
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-3">
            <HoremowLogo className="w-10 h-10 ring-2 ring-amber-400/60 rounded-xl" />
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                HOREMOW Portal Sign In
              </h2>
              <p className="text-xs text-emerald-100/90 font-medium">
                Holiness Revival Movement Worldwide
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="relative z-10 flex min-h-10 shrink-0 items-center gap-1 rounded-xl px-2 text-xs font-bold text-emerald-50 transition hover:bg-white/10"
            aria-label="Back to welcome page"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">

          {/* Toggle Tabs (Sign In / Register) */}
          <div className="flex bg-slate-100 dark:bg-slate-800 sepia-mode:bg-[#eddcb9] p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                !isRegister 
                  ? 'bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] text-emerald-700 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isRegister 
                  ? 'bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] text-emerald-700 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Account</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name (if registering) */}
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 sepia-mode:text-[#432818] mb-1">
                  Full Name & Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Bro. Emmanuel Okafor"
                    className="w-full text-xs p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 sepia-mode:bg-[#eddcb9]/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    required={isRegister}
                  />
                  <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 sepia-mode:text-[#432818] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. emmanuel@horemow.org"
                  className="w-full text-xs p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 sepia-mode:bg-[#eddcb9]/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 sepia-mode:text-[#432818] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 sepia-mode:bg-[#eddcb9]/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            {/* Administrative Location Details (if registering) */}
            {isRegister && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Administrative Location & Branch</span>
                </div>

                {/* Country Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Country of Fellowship
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full text-xs font-medium p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
                    <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      State / Chapter
                    </label>
                    <input
                      type="text"
                      value={stateChapter}
                      onChange={(e) => setStateChapter(e.target.value)}
                      placeholder="e.g. Lagos Chapter"
                      className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Zone / Region
                    </label>
                    <input
                      type="text"
                      value={zoneRegion}
                      onChange={(e) => setZoneRegion(e.target.value)}
                      placeholder="e.g. South-West Zone 1"
                      className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      LGA / District
                    </label>
                    <input
                      type="text"
                      value={lgaDistrict}
                      onChange={(e) => setLgaDistrict(e.target.value)}
                      placeholder="e.g. Ikeja District"
                      className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Branch / Fellowship
                    </label>
                    <input
                      type="text"
                      value={branchFellowship}
                      onChange={(e) => setBranchFellowship(e.target.value)}
                      placeholder="e.g. Ikeja HQ Branch"
                      className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Primary Firebase Auth Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating with Firebase...</span>
                </>
              ) : isRegister ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Save to Firebase</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>

          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase">
              <span className="bg-white px-3 text-slate-400 dark:bg-slate-900 sepia-mode:bg-[#fbf0d9]">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.64 5.93c4.46-4.12 7.12-10.2 7.12-17.58Z" />
                <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 4)" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.64-5.93c-2.13 1.43-4.85 2.28-8.26 2.28-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -4)" />
              </svg>
            )}
            <span>{isRegister ? 'Sign up with Google' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold">
              <span className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] px-3 text-slate-400">
              OR USE OFFLINE ACCESS
              </span>
            </div>
          </div>

          {/* Manual / Guest Access Button */}
          <button
            type="button"
            onClick={onContinueManualAccess}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Continue with Manual / Local Access (Offline Mode)</span>
          </button>

        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 sepia-mode:bg-[#eddcb9]/40 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
          Firebase Auth & Firestore Encrypted Cloud Synchronization
        </div>

      </div>
    </div>
  );
};
