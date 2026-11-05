import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  Square
} from 'lucide-react';
import { UserAssignmentState } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: UserAssignmentState;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const SUGGESTED_PROMPTS = [
  "What is the HOREMOW teaching on restitution and making wrongs right?",
  "Summarize Pastor Paul Rika's books on holiness and righteousness.",
  "How can I effectively win souls and invite converts to conference?",
  "Guide me on structuring a 1-hour daily quiet time prayer.",
  "Give me key scriptures on purity and avoiding worldly traps."
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Grace and peace, ${state.profile.fullName}! I am your HOREMOW Spiritual AI Companion — strictly grounded in Pastor Paul Rika's books, conference messages, and Biblical holiness doctrines.\n\nYou can speak using the microphone or type your question below.`
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Voice Assistant States
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Clean up speech synthesis on close
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  if (!isOpen) return null;

  // Toggle Voice Recognition (Speech to Text)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputPrompt(transcript);
      };
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Mic access error", e);
      setIsListening(false);
    }
  };

  // Text-to-Speech (Voice Output)
  const speakMessage = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Calm reading speed
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!promptToSend) setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          roleMode: state.roleMode,
          context: {
            fullName: state.profile.fullName,
            chapter: state.profile.stateChapter,
            sermonsCount: state.sermons.length,
            soulsCount: state.soulsWon.length,
          }
        }),
      });

      const data = await response.json();

      const aiText = data.reply || "God bless you. Remain steadfast in holiness, restitution, and prayer.";
      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg: Message = {
        id: aiMsgId,
        sender: 'ai',
        text: aiText,
      };

      setMessages(prev => [...prev, aiMsg]);

      if (autoSpeak) {
        speakMessage(aiText, aiMsgId);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I am unable to connect to the spiritual assistant service right now. Please check your internet connection.",
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] max-w-xl w-full h-[88vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base leading-tight">HOREMOW AI Voice Assistant</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-[10px] font-extrabold uppercase border border-emerald-300/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-200" /> Grounded
                </span>
              </div>
              <p className="text-[11px] text-emerald-100">
                Grounded strictly in Pastor Paul Rika's books & HOREMOW doctrines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Auto Readout Toggle */}
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                autoSpeak ? 'bg-amber-400 text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Toggle Auto Read Aloud"
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Doctrinal Guardrail Alert Banner */}
        <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 sepia-mode:bg-[#eddcb9]/60 border-b border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-[11px] text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Answers are strictly restricted to HOREMOW books, sermon tapes & Biblical holiness.</span>
          </div>
        </div>

        {/* Suggested Prompts Bar */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 sepia-mode:bg-[#eddcb9]/40 border-b border-slate-200 dark:border-slate-800 overflow-x-auto flex gap-2 shrink-0">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap hover:border-emerald-500 transition-colors shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${
                m.sender === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}>
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line relative group ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800 sepia-mode:bg-[#eddcb9] text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700'
              }`}>
                {m.text}

                {/* Read Aloud Button for AI Messages */}
                {m.sender === 'ai' && (
                  <button
                    onClick={() => speakMessage(m.text, m.id)}
                    className={`mt-2 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                      speakingMsgId === m.id 
                        ? 'bg-amber-500 text-white animate-pulse' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    {speakingMsgId === m.id ? (
                      <>
                        <Square className="w-3 h-3" /> Stop Voice
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" /> Read Aloud
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Consulting HOREMOW scriptures & books...</span>
            </div>
          )}
        </div>

        {/* Voice Input Indicator */}
        {isListening && (
          <div className="px-4 py-2 bg-amber-500 text-slate-900 text-xs font-bold flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 animate-bounce" />
              <span>Listening to your voice... Speak your question clearly.</span>
            </div>
            <button onClick={toggleListening} className="underline text-xs cursor-pointer">Stop Mic</button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 sepia-mode:bg-[#fbf0d9] border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          <div className="flex items-center gap-2 flex-1">
            {/* Microphone Button with clear text label */}
            <button
              onClick={toggleListening}
              className={`px-3 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 ${
                isListening 
                  ? 'bg-red-600 text-white animate-bounce' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-400/40'
              }`}
              title={isListening ? "Stop Listening" : "Speak with Voice Assistant"}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Tap to Speak</span>
                </>
              )}
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening..." : "Ask or speak about HOREMOW books, messages, or doctrines..."}
              className="flex-1 text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 sepia-mode:bg-[#eddcb9]/40 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputPrompt.trim()}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

