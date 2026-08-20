import React, { useState, useEffect, useRef } from 'react';

interface VoiceControlProps {
  onNavigate: (section: 'calculator' | 'results' | 'services' | 'top') => void;
  onAction: (action: 'print' | 'scrollDown' | 'scrollUp') => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ onNavigate, onAction }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [permissionError, setPermissionError] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  
  // Use refs to maintain stable instances and state access within callbacks
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const onNavigateRef = useRef(onNavigate);
  const onActionRef = useRef(onAction);

  // Update refs when props change
  useEffect(() => {
    onNavigateRef.current = onNavigate;
    onActionRef.current = onAction;
  }, [onNavigate, onAction]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'ru-RU';
        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore abort errors on cleanup
        }
      }
    };
  }, []);

  // Initialize event listeners once
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const text = lastResult[0].transcript.toLowerCase().trim();
      setTranscript(text);
      
      // Process command
      const cmd = text;
      const navigate = onNavigateRef.current;
      const action = onActionRef.current;

      console.log("Voice Command:", cmd);

      // Helper for fuzzy matching
      const matches = (keywords: string[]) => keywords.some(k => cmd.includes(k));

      // Navigation Logic
      if (matches(['калькулятор', 'расчет', 'начать', 'ввод', 'форма', 'новы', 'calculate'])) {
        navigate('calculator');
      } 
      else if (matches(['результат', 'матрица', 'анализ', 'разбор', 'покажи', 'what is my', 'result'])) {
        navigate('results');
      } 
      else if (matches(['услуги', 'скачать', 'купить', 'цена', 'стоимость', 'services'])) {
        navigate('services');
      } 
      else if (matches(['вверх', 'наверх', 'старт', 'домой', 'начало', 'top', 'home'])) {
        navigate('top');
      }
      
      // Action Logic
      else if (matches(['вниз', 'дальше', 'ниже', 'прокрути', 'листай', 'down', 'scroll'])) {
        action('scrollDown');
      } 
      else if (matches(['выше', 'назад', 'подними', 'обратно', 'up', 'back'])) {
        action('scrollUp');
      } 
      else if (matches(['печать', 'сохранить', 'pdf', 'пдф', 'скачать отчет', 'print', 'save'])) {
        action('print');
      }
      
      setTimeout(() => setTranscript(''), 2000);
    };

    recognition.onerror = (event: any) => {
      // Suppress console spam for expected errors
      if (event.error !== 'no-speech') {
        console.warn("Speech recognition error:", event.error);
      }

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setPermissionError(true);
        setIsListening(false);
        shouldListenRef.current = false;
      }
    };

    recognition.onend = () => {
      // Auto-restart if it was supposed to be listening and no critical error occurred
      if (shouldListenRef.current && !permissionError) {
         try {
           recognition.start();
         } catch (e) {
           setIsListening(false);
           shouldListenRef.current = false;
         }
      } else {
        setIsListening(false);
      }
    };

  }, [permissionError]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    // Reset error state on retry
    if (permissionError) {
      setPermissionError(false);
    }

    if (isListening) {
      shouldListenRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (e) { console.error(e); }
      setIsListening(false);
    } else {
      shouldListenRef.current = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Start failed:", e);
        setIsListening(false);
        shouldListenRef.current = false;
      }
    }
  };

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2 no-print">
      
      {/* Transcript/Error Bubble */}
      {transcript && (
        <div className="bg-black/80 backdrop-blur-md border border-amber-500/30 text-amber-100 px-4 py-2 rounded-xl rounded-br-none mb-2 text-sm animate-fade-in-up shadow-lg pointer-events-none">
          "{transcript}"
        </div>
      )}
      
      {permissionError && (
        <div className="bg-red-900/90 backdrop-blur-md border border-red-500/50 text-white px-4 py-2 rounded-xl rounded-br-none mb-2 text-xs max-w-[200px] animate-fade-in-up shadow-lg">
          Доступ к микрофону запрещен браузером.
        </div>
      )}

      <button
        onClick={toggleListening}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border ${
          isListening 
            ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_30px_rgba(245,158,11,0.6)] scale-110' 
            : permissionError
              ? 'bg-red-900/80 border-red-500/50 text-red-200'
              : 'bg-[#1a162e]/90 border-white/10 text-slate-400 hover:text-amber-400 hover:border-amber-500/50'
        }`}
        title={isListening ? "Слушаю..." : "Голосовое управление"}
      >
        {isListening && (
          <span className="absolute inset-0 rounded-full border border-amber-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
        )}
        
        {permissionError ? (
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
           </svg>
        ) : (
          <svg className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
      
      {isListening && (
        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-black/50 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
          Говорите...
        </div>
      )}
    </div>
  );
};

export default VoiceControl;