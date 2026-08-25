import React, { useState, useEffect, useRef } from 'react';
import { chatWithChubuk, transcribeAudio, analyzeVideo, getSpeech, decodeAudioData, VOICE_OPTIONS, runFullDivinationMachine } from '../services/geminiService';
import { MatrixNumbers, UserInput, AstrologyData } from '../types';
import { useLiveChat } from '../src/hooks/useLiveChat';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';
import { Mic, MicOff, Send, X, MessageSquare, Volume2, VolumeX, Paperclip, Loader2, Trash2, Play, Pause, Download, Users, Sparkles, Zap, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadAudioForCalculation, exportCurrentAnalysisToPdf } from '../services/exportUtils';

interface NumerologistChatProps {
  userInput: UserInput | null;
  matrix: MatrixNumbers | null;
  astrology: AstrologyData | null;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

const NumerologistChat: React.FC<NumerologistChatProps> = ({ userInput, matrix, astrology }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showContext, setShowContext] = useState(false);
  
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('chubuk_chat_sessions');
    if (saved) return JSON.parse(saved);
    return [{
      id: 'default',
      title: 'Первое пророчество',
      messages: [{ role: 'model', text: 'Приветствую. Я Chubuk. Задай мне вопрос о своей судьбе, энергиях или звездах.' }],
      createdAt: Date.now()
    }];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('chubuk_current_session_id');
    return saved || 'default';
  });

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = currentSession.messages;

  const [input, setInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].name);

  // Individual Message Audio State using Global Audio
  const { playingId, loadingId, setLoadingId, playAudio, stopAudio } = useGlobalAudio();

  const handleDownloadAudio = async (text: string, idx: number) => {
    const dlId = `dl_chat_${idx}`;
    setLoadingId(dlId);
    try {
      await downloadAudioForCalculation(text, `chat_message_${idx + 1}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const playMessage = async (text: string, idx: number) => {
    const msgId = `chat_${idx}`;
    playAudio(text, msgId, selectedVoice);
  };

  const playingMsgIdx = typeof playingId === 'string' && playingId.startsWith('chat_') ? parseInt(playingId.split('_')[1]) : null;
  const loadingMsgIdx = typeof loadingId === 'string' && loadingId.startsWith('chat_') ? parseInt(loadingId.split('_')[1]) : null;
  const stopMessageAudio = stopAudio;

  useEffect(() => {
    localStorage.setItem('chubuk_chat_sessions', JSON.stringify(sessions));
    localStorage.setItem('chubuk_current_session_id', currentSessionId);
  }, [sessions, currentSessionId]);

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: `Пророчество ${sessions.length + 1}`,
      messages: [{ role: 'model', text: 'Новый диалог открыт. Спрашивай, и я отвечу.' }],
      createdAt: Date.now()
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newId);
    setShowSessions(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      const resetSession = { ...sessions[0], messages: [{ role: 'model', text: 'История очищена. Я слушаю.' }] };
      setSessions([resetSession]);
      return;
    }
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id) {
      setCurrentSessionId(filtered[0].id);
    }
  };

  const updateMessages = (newMessages: Message[]) => {
    setSessions(prev => prev.map(s => 
      s.id === currentSessionId ? { ...s, messages: newMessages } : s
    ));
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const handleExtractInsights = async () => {
    setIsExtracting(true);
    try {
      const insights = await runFullDivinationMachine(messages, { userInput, matrix, astrology });
      console.log("Insights extracted:", insights);
      updateMessages([...messages, { role: 'model', text: insights }]);
    } catch (e) {
      console.error(e);
      updateMessages([...messages, { role: 'model', text: "Не удалось провести сеанс гадания." }]);
    } finally {
      setIsExtracting(false);
    }
  };
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isVideoAnalyzing, setIsVideoAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsTranscribing(true);
          try {
            const transcript = await transcribeAudio(base64Audio);
            setInput(prev => (prev + " " + transcript).trim());
          } catch (err) {
            console.error(err);
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVideoAnalyzing(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Video = (reader.result as string).split(',')[1];
      try {
        const analysis = await analyzeVideo(base64Video, "Проанализируй это видео с точки зрения нумерологии и энергетики.");
        const newMsgs: Message[] = [...messages, 
          { role: 'user', text: `[Видео анализ: ${file.name}]` },
          { role: 'model', text: analysis }
        ];
        updateMessages(newMsgs);
      } catch (err) {
        console.error(err);
        updateMessages([...messages, { role: 'model', text: "Не удалось проанализировать видео. Возможно, оно слишком тяжелое для эфира." }]);
      } finally {
        setIsVideoAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
  };

  const { 
    isActive: isLiveActive, 
    isConnecting: isLiveConnecting, 
    error: liveError, 
    transcript: liveTranscript,
    start: startLive, 
    stop: stopLive 
  } = useLiveChat({ userInput, matrix, astrology });

  useEffect(() => {
    if (liveError) {
      updateMessages([...messages, { role: 'model', text: `Голосовая связь прервана: ${liveError}` }]);
      setIsVoiceMode(false);
    }
  }, [liveError]);

  const toggleVoiceMode = async () => {
    if (isVoiceMode) {
      stopLive();
      setIsVoiceMode(false);
    } else {
      setIsVoiceMode(true);
      await startLive();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add user message
    const newHistory = [...messages, { role: 'user', text: userMsg } as Message];
    updateMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await chatWithChubuk(userMsg, newHistory, { userInput, matrix, astrology });
      updateMessages([...newHistory, { role: 'model', text: response }]);
    } catch (error) {
      console.error(error);
      updateMessages([...newHistory, { role: 'model', text: 'Прошу прощения, связь с эгрегором прервалась. Попробуйте еще раз.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button - Positioned safely above navigation bars */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-28 sm:bottom-24 right-4 sm:left-6 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full btn-3d flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.45)] active:scale-95 hover:scale-105 transition-all no-print cursor-pointer bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 border-2 border-amber-300"
          title="Спросить нумеролога Чубука"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 border border-black rounded-full animate-pulse"></span>
          </div>
        </button>
      )}

      {/* Chat Window & Mobile Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay on mobile/desktop for easy tap-outside to dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm sm:bg-black/40 no-print"
            />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_e, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setIsOpen(false);
                }
              }}
              className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:left-6 z-50 w-full sm:w-[460px] h-[85vh] sm:h-[620px] max-h-[90vh] flex flex-col bg-[#0b0f1d] border border-amber-500/30 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl no-print"
            >
              {/* Mobile Swipe Handle Indicator */}
              <div className="sm:hidden pt-2 pb-1 bg-gradient-to-r from-amber-700 to-amber-900 flex justify-center cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-amber-200/50 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 px-3.5 py-3 sm:p-4 flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={() => setShowSessions(!showSessions)}
                    className="p-2 rounded-xl bg-black/30 text-amber-200 hover:bg-black/50 transition-all cursor-pointer"
                    title="Все диалоги"
                  >
                    <MessageSquare size={18} />
                  </button>
                  <div className="flex flex-col">
                    <h3 className="font-serif font-bold text-white text-sm truncate max-w-[130px] sm:max-w-[170px]">{currentSession.title}</h3>
                    <p className="text-[10px] text-amber-200 uppercase tracking-widest flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLiveActive ? 'bg-red-500' : 'bg-green-400'}`}></span>
                      {isLiveActive ? 'Live Голос' : 'Оракул Онлайн'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    onClick={handleExtractInsights}
                    disabled={isExtracting}
                    className="p-2 rounded-xl bg-amber-600/60 text-white hover:bg-amber-500 transition-all shadow-[0_0_10px_rgba(245,158,11,0.3)] cursor-pointer"
                    title="Запустить машину гаданий"
                  >
                    {isExtracting ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                  </button>
                  <button
                    onClick={() => setShowContext(!showContext)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${showContext ? 'bg-amber-400 text-black' : 'bg-white/10 text-amber-200 hover:bg-white/20'}`}
                    title="Ваши данные"
                  >
                    <Users size={16} />
                  </button>
                  {userInput && matrix && astrology && (
                    <button
                      onClick={() => {
                        const lastModelMessage = [...messages].reverse().find(m => m.role === 'model')?.text || 'Нет анализа';
                        exportCurrentAnalysisToPdf(userInput, matrix, astrology, lastModelMessage);
                      }}
                      className="p-2 rounded-xl bg-white/10 text-amber-200 hover:bg-white/20 transition-all cursor-pointer hidden sm:flex"
                      title="Экспорт в PDF"
                    >
                      <FileText size={16} />
                    </button>
                  )}
                  <button
                    onClick={toggleVoiceMode}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isVoiceMode 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-white/10 text-amber-200 hover:bg-white/20'
                    }`}
                    title={isVoiceMode ? "Выключить голос" : "Включить голос"}
                  >
                    {isVoiceMode ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                  
                  {/* Close / Dismiss Button */}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-amber-200/90 hover:text-white transition-colors cursor-pointer ml-1"
                    title="Закрыть чат"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

          <div className="flex-1 flex relative overflow-hidden">
            {/* Sessions Sidebar Overlay */}
            <AnimatePresence>
              {showSessions && (
                <motion.div 
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className="absolute inset-0 z-30 bg-[#0a0f1a] border-r border-white/10 w-64 flex flex-col"
                >
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Пророчества</span>
                    <button onClick={() => createNewSession()} className="p-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-500">
                      <Send size={14} className="rotate-45" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {sessions.map(s => (
                      <div 
                        key={s.id}
                        onClick={() => { setCurrentSessionId(s.id); setShowSessions(false); }}
                        className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                          currentSessionId === s.id ? 'bg-amber-600/20 border border-amber-500/30' : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm text-white truncate">{s.title}</span>
                          <span className="text-[10px] text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button 
                          onClick={(e) => deleteSession(s.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Context Sidebar Overlay */}
            <AnimatePresence>
              {showContext && (
                <motion.div 
                  initial={{ x: 300 }}
                  animate={{ x: 0 }}
                  exit={{ x: 300 }}
                  className="absolute right-0 top-0 bottom-0 z-30 bg-[#0a0f1a] border-l border-white/10 w-64 flex flex-col shadow-2xl"
                >
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Ваш Контекст</span>
                    <button onClick={() => setShowContext(false)} className="text-slate-400 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {userInput && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Личность</p>
                        <p className="text-sm text-white">{userInput.name}, {userInput.gender === 'male' ? 'Мужчина' : 'Женщина'}</p>
                        <p className="text-xs text-amber-400">{userInput.birthDate}</p>
                      </div>
                    )}
                    {matrix && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Энергии Матрицы</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white/5 p-2 rounded-lg">
                            <p className="text-[8px] text-slate-500 uppercase">Душа</p>
                            <p className="text-xs text-amber-200 font-bold">{matrix.center}</p>
                          </div>
                          <div className="bg-white/5 p-2 rounded-lg">
                            <p className="text-[8px] text-slate-500 uppercase">Судьба</p>
                            <p className="text-xs text-amber-200 font-bold">{matrix.destiny}</p>
                          </div>
                          <div className="bg-white/5 p-2 rounded-lg">
                            <p className="text-[8px] text-slate-500 uppercase">Деньги</p>
                            <p className="text-xs text-amber-200 font-bold">{matrix.year}</p>
                          </div>
                          <div className="bg-white/5 p-2 rounded-lg">
                            <p className="text-[8px] text-slate-500 uppercase">Карма</p>
                            <p className="text-xs text-amber-200 font-bold">{matrix.bottom}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {astrology && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Звезды</p>
                        <div className="bg-white/5 p-3 rounded-lg border border-amber-500/10">
                          <p className="text-xs text-white font-serif">{astrology.zodiacSign}</p>
                          <p className="text-[10px] text-amber-400">{astrology.planet} • {astrology.element}</p>
                        </div>
                      </div>
                    )}
                    <p className="text-[9px] text-slate-600 italic leading-relaxed">
                      Chubuk использует эти данные для каждого ответа, чтобы пророчество было точным.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/60 backdrop-blur-md relative">
              {isVoiceMode && (
                <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center space-y-6">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isLiveActive ? 'bg-amber-600 shadow-[0_0_50px_rgba(245,158,11,0.5)] scale-110' : 'bg-white/5 border border-white/10'
                  }`}>
                    {isLiveActive ? (
                      <div className="flex gap-1 items-end h-8">
                        <div className="w-1.5 bg-white rounded-full animate-[bounce_1s_infinite] h-[40%]"></div>
                        <div className="w-1.5 bg-white rounded-full animate-[bounce_1.2s_infinite] h-[70%]"></div>
                        <div className="w-1.5 bg-white rounded-full animate-[bounce_0.8s_infinite] h-[50%]"></div>
                        <div className="w-1.5 bg-white rounded-full animate-[bounce_1.1s_infinite] h-[80%]"></div>
                      </div>
                    ) : (
                      <Mic size={40} className="text-white/20" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-xl font-serif text-white">
                      {isLiveConnecting ? 'Установка связи...' : isLiveActive ? 'Chubuk слушает...' : 'Голосовой режим'}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {isLiveActive 
                        ? 'Говорите прямо сейчас, Chubuk ответит вам голосом.' 
                        : 'Нажмите кнопку ниже, чтобы начать разговор.'}
                    </p>
                  </div>

                  {isLiveActive && liveTranscript && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-h-[150px] overflow-y-auto text-sm text-amber-200 italic">
                      "{liveTranscript}"
                    </div>
                  )}

                  <button
                    onClick={toggleVoiceMode}
                    className={`px-8 py-3 rounded-full font-bold transition-all ${
                      isLiveActive 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                  >
                    {isLiveActive ? 'Завершить' : 'Начать'}
                  </button>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-lg relative group ${
                      msg.role === 'user' 
                        ? 'bg-amber-600 text-white rounded-br-none' 
                        : 'bg-[#1a162e] border border-amber-500/20 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                    
                    {msg.role === 'model' && (
                      <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => handleDownloadAudio(msg.text, idx)}
                          className="p-1.5 rounded-full bg-white/5 text-slate-400 hover:bg-amber-500 hover:text-black transition-all"
                          title="Скачать аудио"
                        >
                          {loadingId === `dl_chat_${idx}` ? (
                            <Loader2 className="animate-spin" size={12} />
                          ) : (
                            <Download size={12} />
                          )}
                        </button>
                        <button
                          onClick={() => playMessage(msg.text, idx)}
                          className={`p-1.5 rounded-full bg-white/5 text-slate-400 hover:bg-amber-500 hover:text-black transition-all ${playingMsgIdx === idx ? 'bg-amber-500 text-black' : ''}`}
                        >
                          {loadingMsgIdx === idx ? (
                            <Loader2 className="animate-spin" size={12} />
                          ) : playingMsgIdx === idx ? (
                            <Pause size={12} />
                          ) : (
                            <Play size={12} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1a162e] border border-amber-500/20 rounded-2xl rounded-bl-none p-3 flex gap-1 items-center h-10">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-black/80 border-t border-white/5 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => isRecording ? stopRecording() : startRecording()}
                className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-slate-400 hover:text-amber-400'}`}
                title={isRecording ? "Остановить запись" : "Голосовой ввод"}
              >
                {isTranscribing ? <Loader2 className="animate-spin" size={20} /> : <Mic size={20} />}
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-amber-400 transition-all"
                title="Загрузить видео для анализа"
              >
                {isVideoAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleVideoUpload} 
                accept="video/*" 
                className="hidden" 
              />
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Слушаю..." : "Спросите о своей матрице..."}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-amber-900/20 cursor-pointer"
              >
                <Send size={18} className="rotate-0" />
              </button>
            </form>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  </>
);
};

export default NumerologistChat;
