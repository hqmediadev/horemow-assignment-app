import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Sparkles, 
  Clock, 
  Flame,
  CheckCircle2
} from 'lucide-react';

interface FocusPrayerModeProps {
  onClose: () => void;
  onLogSession: (minutes: number, topic: string, notes: string) => void;
}

const HOLINESS_SCRIPTURES = [
  { text: "Follow peace with all men, and holiness, without which no man shall see the Lord.", ref: "Hebrews 12:14" },
  { text: "But as he which hath called you is holy, so be ye holy in all manner of conversation; Because it is written, Be ye holy; for I am holy.", ref: "1 Peter 1:15-16" },
  { text: "He that covereth his sins shall not prosper: but whoso confesseth and forsaketh them shall have mercy.", ref: "Proverbs 28:13" },
  { text: "Son of man, I have made thee a watchman unto the house of Israel: therefore hear the word at my mouth, and give them warning from me.", ref: "Ezekiel 3:17" },
  { text: "Blessed are the pure in heart: for they shall see God.", ref: "Matthew 5:8" },
];

export const FocusPrayerMode: React.FC<FocusPrayerModeProps> = ({
  onClose,
  onLogSession,
}) => {
  const [seconds, setSeconds] = useState(30 * 60); // Default 30 mins
  const [isRunning, setIsRunning] = useState(false);
  const [scriptureIndex, setScriptureIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [topic, setTopic] = useState('Personal Holiness & Rapture Readiness');

  // Scripture rotator interval
  useEffect(() => {
    const sInterval = setInterval(() => {
      setScriptureIndex(prev => (prev + 1) % HOLINESS_SCRIPTURES.length);
    }, 12000);
    return () => clearInterval(sInterval);
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isRunning) {
      setIsRunning(false);
      onLogSession(30, topic, notes || 'Completed 30-min Focus Prayer Mode.');
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const currentScripture = HOLINESS_SCRIPTURES[scriptureIndex];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white flex flex-col justify-between p-6 sm:p-10 backdrop-blur-md overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base tracking-tight text-white">Focus Prayer & Quiet Time</h2>
            <p className="text-xs text-emerald-300/80">Distraction-Free Spiritual Sanctuary</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2 text-xs font-semibold"
        >
          <X className="w-4 h-4" /> Exit Focus Mode
        </button>
      </div>

      {/* Center Timer & Scripture */}
      <div className="relative z-10 max-w-2xl mx-auto w-full text-center space-y-8 my-auto">
        
        {/* Animated Scripture Banner */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2 transition-all">
          <p className="text-base sm:text-lg font-serif italic text-emerald-100 leading-relaxed">
            "{currentScripture.text}"
          </p>
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            — {currentScripture.ref}
          </div>
        </div>

        {/* Large Timer Display */}
        <div className="space-y-3">
          <div className="text-6xl sm:text-8xl font-mono font-extrabold tracking-widest text-white drop-shadow-lg">
            {timeFormatted}
          </div>
          <p className="text-xs text-slate-300 font-medium uppercase tracking-wider">
            {isRunning ? 'Quiet Time Prayer Active' : 'Select Timer Duration & Press Start'}
          </p>
        </div>

        {/* Topic Input */}
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter current prayer burden..."
          className="w-full text-center text-xs p-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-xl flex items-center gap-2 transition-transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" /> Begin Prayer
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-xl flex items-center gap-2 transition-transform active:scale-95"
            >
              <Pause className="w-5 h-5 fill-white" /> Pause
            </button>
          )}

          <button
            onClick={() => {
              setIsRunning(false);
              setSeconds(30 * 60);
            }}
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Revelation Pad */}
      <div className="relative z-10 max-w-xl mx-auto w-full">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Quiet Time Notes & Revelations..."
          rows={2}
          className="w-full text-xs p-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-slate-400 focus:outline-none"
        />
      </div>

    </div>
  );
};
