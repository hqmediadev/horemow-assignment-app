import React from 'react';
import { ArrowRight, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin }) => {
  return (
    <main className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#061426] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-white sm:px-8 sm:pb-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[min(68svh,40rem)] w-full max-w-[34rem] overflow-hidden">
        <img
          src="https://res.cloudinary.com/heckogkv/image/upload/v1793878379/images_3_r0wv5a.jpg"
          alt=""
          className="h-full w-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,20,38,0.12)_0%,rgba(6,20,38,0.04)_45%,#061426_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#061426_0%,transparent_18%,transparent_82%,#061426_100%)]" />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#061426] via-[#071a30]/90 to-transparent" />
        <svg className="absolute inset-x-0 bottom-0 h-2/5 w-full opacity-30" viewBox="0 0 1440 400" preserveAspectRatio="none">
          <path d="M0 210 120 165l120 70 180-130 160 110 150-85 170 105 170-125 150 70 140-80v300H0Z" fill="#12385a" />
          <path d="M0 290 140 220l130 50 180-105 180 120 160-85 180 70 190-100 140 65 140-60v225H0Z" fill="#0b2947" />
          <path d="M0 345 170 275l170 55 170-90 180 65 170-45 180 65 180-70 210 50v95H0Z" fill="#071d34" />
        </svg>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,24,0.05)_0%,transparent_30%,rgba(4,12,24,0.18)_100%)]" />
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-end pb-8 pt-28 text-center sm:pb-10">
        <h1 className="text-4xl font-black leading-none tracking-tight drop-shadow-lg sm:text-5xl">
          HOREMOW
        </h1>
        <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-sky-100 sm:text-xs">
          Holiness Revival Movement Worldwide
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100/90 backdrop-blur-sm sm:text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
          Spiritual Assignment Companion
        </div>
        <p className="mt-4 max-w-sm text-xs leading-5 text-slate-200/85 sm:text-sm sm:leading-6">
          Bible study, HOREMOW reading, prayer, and faithful service.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-sky-100/80 sm:text-xs">
          <BookOpen className="h-4 w-4 text-emerald-300" />
          <span className="italic">“Follow peace with all men, and holiness…”</span>
          <span className="text-sky-200/60">Hebrews 12:14</span>
        </div>
      </section>

      <footer className="relative z-10 mx-auto w-full max-w-md">
        <button
          onClick={onLogin}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-extrabold text-white shadow-[0_12px_36px_rgba(16,185,129,0.3)] transition hover:bg-emerald-400 active:scale-[0.99] sm:min-h-16 sm:text-base"
        >
          <Sparkles className="h-4 w-4 text-emerald-100" />
          <span>Log in or create an account</span>
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-3 text-center text-[11px] text-slate-300/70 sm:text-xs">
          Sign in to continue to your assignment
        </p>
      </footer>
    </main>
  );
};
