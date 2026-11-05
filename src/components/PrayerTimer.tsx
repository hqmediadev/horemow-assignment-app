import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Plus, 
  Flame, 
  BellRing,
  BellOff,
  Calendar,
  Sparkles
} from 'lucide-react';
import { PrayerSession, FastingRecord, ConferenceType } from '../types';

interface PrayerTimerProps {
  prayerSessions: PrayerSession[];
  fastingRecords: FastingRecord[];
  addPrayerSession: (session: Omit<PrayerSession, 'id'>) => void;
  addFastingRecord: (record: Omit<FastingRecord, 'id'>) => void;
  targetDailyMinutes: number;
  targetFastingDays: number;
  activeConference: ConferenceType;
}

export const PrayerTimer: React.FC<PrayerTimerProps> = ({
  prayerSessions,
  fastingRecords,
  addPrayerSession,
  addFastingRecord,
  targetDailyMinutes,
  targetFastingDays,
  activeConference,
}) => {
  // Timer State
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(30 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState<boolean>(false);
  const [focusTopic, setFocusTopic] = useState<string>('Personal Consecration & HOREMOW Revival');

  // Manual Log Modal
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [logType, setLogType] = useState<'prayer' | 'fasting'>('prayer');
  const [manualMinutes, setManualMinutes] = useState<number>(60);
  const [fastingType, setFastingType] = useState<'6am_6pm' | 'full' | 'dry'>('6am_6pm');
  const [logPurpose, setLogPurpose] = useState<string>('');

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const alarmIntervalRef = useRef<any>(null);

  // Trigger Alarm Chime using Web Audio API when time reaches 0
  const triggerAlarm = () => {
    setIsAlarmRinging(true);
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const playChimeTone = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 tone
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      };

      playChimeTone();
      alarmIntervalRef.current = setInterval(playChimeTone, 1000);
    } catch (e) {
      console.log('Alarm trigger error:', e);
    }
  };

  const stopAlarm = () => {
    setIsAlarmRinging(false);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timeLeftSeconds === 0 && isRunning) {
      setIsRunning(false);
      stopAmbientAudio();
      triggerAlarm();
      
      // Auto log completed session!
      addPrayerSession({
        date: new Date().toISOString().split('T')[0],
        durationMinutes: selectedMinutes,
        focusTopic: focusTopic || 'Quiet Time Prayer Session',
        notes: `Completed ${selectedMinutes}-minute prayer session with alarm notification.`,
        conferenceTag: activeConference,
      });
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeftSeconds]);

  // Ambient Sound Synthesizer via Web Audio API
  const startAmbientAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(174, ctx.currentTime); // Solfeggio 174 Hz
      gain.gain.setValueAtTime(0.05, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;
      setIsAudioEnabled(true);
    } catch (e) {
      console.log('Audio Context Error:', e);
    }
  };

  const stopAmbientAudio = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    setIsAudioEnabled(false);
  };

  const toggleAudio = () => {
    if (isAudioEnabled) {
      stopAmbientAudio();
    } else {
      startAmbientAudio();
    }
  };

  const handleStartTimer = () => {
    stopAlarm();
    setIsRunning(true);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
    stopAmbientAudio();
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    stopAmbientAudio();
    stopAlarm();
    setTimeLeftSeconds(selectedMinutes * 60);
  };

  const handleSelectPreset = (mins: number) => {
    setIsRunning(false);
    stopAmbientAudio();
    stopAlarm();
    setSelectedMinutes(mins);
    setTimeLeftSeconds(mins * 60);
  };

  // Format Time display MM:SS
  const minsDisplay = Math.floor(timeLeftSeconds / 60);
  const secsDisplay = timeLeftSeconds % 60;
  const timeFormatted = `${String(minsDisplay).padStart(2, '0')}:${String(secsDisplay).padStart(2, '0')}`;

  const totalPrayerMins = prayerSessions.reduce((acc, p) => acc + p.durationMinutes, 0);

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];

    if (logType === 'prayer') {
      addPrayerSession({
        date: todayStr,
        durationMinutes: manualMinutes,
        focusTopic: logPurpose || 'Quiet Time Prayer',
        conferenceTag: activeConference,
      });
    } else {
      addFastingRecord({
        date: todayStr,
        type: fastingType,
        purpose: logPurpose || 'Personal Consecration',
        conferenceTag: activeConference,
      });
    }

    setShowLogModal(false);
    setLogPurpose('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 sepia-mode:border-[#e2d5b7] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                <Clock className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white sepia-mode:text-amber-950">
                Prayer & Fasting Routine
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 sepia-mode:text-amber-800 mt-1">
              Focus timer with audio bell alarm, quiet time intercession & conference fasting target records.
            </p>
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2.5 text-xs font-bold rounded-2xl bg-purple-600 text-white hover:bg-purple-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Manual Log
          </button>
        </div>
      </div>

      {/* Alarm Ringing Banner Notification */}
      {isAlarmRinging && (
        <div className="p-4 rounded-3xl bg-amber-500 text-white shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <BellRing className="w-6 h-6 text-white animate-spin" />
            <div>
              <div className="font-extrabold text-sm">PRAYER TIME IS COMPLETED!</div>
              <div className="text-xs text-amber-100">Your prayer duration has finished. Hallelujah!</div>
            </div>
          </div>
          <button
            onClick={stopAlarm}
            className="px-4 py-2 rounded-2xl bg-white text-amber-900 font-extrabold text-xs shadow-md flex items-center gap-1 cursor-pointer"
          >
            <BellOff className="w-4 h-4" /> Mute Alarm
          </button>
        </div>
      )}

      {/* Main Prayer Timer Module */}
      <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border border-purple-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-purple-400" /> Event: {activeConference}
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Daily Target: {targetDailyMinutes} Minutes
            </h3>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleAudio}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isAudioEnabled 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{isAudioEnabled ? 'Ambient Sound ON' : 'Ambient Sound OFF'}</span>
          </button>
        </div>

        {/* Preset Duration Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[15, 30, 45, 60, 90, 120].map((mins) => (
            <button
              key={mins}
              onClick={() => handleSelectPreset(mins)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                selectedMinutes === mins
                  ? 'bg-purple-500 text-white ring-2 ring-purple-300 shadow-md'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              {mins} Mins
            </button>
          ))}
        </div>

        {/* Timer Display Circle */}
        <div className="flex flex-col items-center justify-center my-6 space-y-4">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-white/5 border-4 border-purple-500/30 flex flex-col items-center justify-center shadow-inner relative">
            <span className="text-4xl sm:text-5xl font-mono font-extrabold tracking-widest text-white">
              {timeFormatted}
            </span>
            <span className="text-xs text-purple-300 font-medium mt-1">
              {isRunning ? 'Praying in Progress...' : 'Ready to Pray'}
            </span>
          </div>

          {/* Focus Topic Input */}
          <div className="max-w-md w-full">
            <input
              type="text"
              value={focusTopic}
              onChange={(e) => setFocusTopic(e.target.value)}
              placeholder="Prayer Focus / Intercession Topic..."
              className="w-full text-center text-xs p-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4 pt-2">
            {!isRunning ? (
              <button
                onClick={handleStartTimer}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" /> Start Session
              </button>
            ) : (
              <button
                onClick={handlePauseTimer}
                className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Pause className="w-5 h-5 fill-white" /> Pause
              </button>
            )}

            <button
              onClick={handleResetTimer}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Session Logs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Prayer History */}
        <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Prayer Sessions History
            </h3>
            <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
              {totalPrayerMins} total mins
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {prayerSessions.map((ps) => (
              <div key={ps.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {ps.focusTopic}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {ps.notes || 'Quiet time intercession'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-purple-600">{ps.durationMinutes} mins</div>
                  <div className="text-[10px] text-slate-400">{ps.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fasting History */}
        <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" />
              Fasting Days Record
            </h3>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              {fastingRecords.length} / {targetFastingDays} days target
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {fastingRecords.map((fr) => (
              <div key={fr.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                    {fr.type.replace('_', ' ')} Fasting
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {fr.purpose}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Completed
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{fr.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Manual Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleManualSave}
            className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Record Spiritual Session
            </h3>

            {/* Type selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs">
              <button
                type="button"
                onClick={() => setLogType('prayer')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                  logType === 'prayer' ? 'bg-purple-600 text-white' : 'text-slate-500'
                }`}
              >
                Prayer Session
              </button>
              <button
                type="button"
                onClick={() => setLogType('fasting')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                  logType === 'fasting' ? 'bg-amber-600 text-white' : 'text-slate-500'
                }`}
              >
                Fasting Day
              </button>
            </div>

            {logType === 'prayer' ? (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Duration (Minutes)</label>
                <input
                  type="number"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Fasting Type</label>
                <select
                  value={fastingType}
                  onChange={(e) => setFastingType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1 font-bold"
                >
                  <option value="6am_6pm">6:00 AM to 6:00 PM Fasting</option>
                  <option value="full">24-Hour Full Fasting</option>
                  <option value="dry">Dry Fasting</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Purpose / Focus Topic</label>
              <input
                type="text"
                placeholder="e.g. World Evangelism & Personal Purity"
                value={logPurpose}
                onChange={(e) => setLogPurpose(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none mt-1"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-2xl bg-purple-600 text-white hover:bg-purple-700"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
