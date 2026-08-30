
import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { VOICE_OPTIONS, askChubukAboutMatrix, chatWithChubuk, generateFullAudioAnalysisText } from '../services/geminiService';
import { Download, Play, Pause, Loader2, MessageCircle, Volume2, VolumeX, FileText, Sparkles } from 'lucide-react';
import { exportStylizedMatrixPdf, downloadAudioForCalculation, downloadFullAudioAnalysis } from '../services/exportUtils';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';
import MatrixTable from './MatrixTable';
import PythagoreanSquareTable from './PythagoreanSquareTable';
import DailyForecastSection from './DailyForecastSection';
import { YandexAdBanner } from './YandexAdBanner';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  userInput: any;
  matrix: any;
  astrology?: any;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, userInput, matrix, astrology }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].name);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [isGeneratingFullAudio, setIsGeneratingFullAudio] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const getChatKey = (input: any) => {
    if (input?.name && input?.birthDate) {
      return `chubuk_chat_${encodeURIComponent(input.name)}_${input.birthDate}`;
    }
    return 'chubuk_latest_matrix_chat';
  };

  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>(() => {
    try {
      const key = getChatKey(userInput);
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Automatically update and reset chat data when a new participant/user is selected or calculated
  useEffect(() => {
    const key = getChatKey(userInput);
    try {
      const saved = localStorage.getItem(key);
      setChatHistory(saved ? JSON.parse(saved) : []);
    } catch {
      setChatHistory([]);
    }
    setQuestion('');
    setAnswer(null);
  }, [userInput?.name, userInput?.birthDate]);
  
  const { playingId, loadingId, setLoadingId, playAudio, stopAudio, error: globalAudioError } = useGlobalAudio();

  const handleClearChat = () => {
    const key = getChatKey(userInput);
    localStorage.removeItem(key);
    localStorage.removeItem('chubuk_latest_matrix_chat');
    setChatHistory([]);
    setQuestion('');
    setAnswer(null);
    stopAudio();
  };

  const toggleSection = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await exportStylizedMatrixPdf({
        userInput,
        matrix,
        astrology,
        analysis,
        chatHistory,
        filename: `Матрица_Судьбы_${userInput?.name?.replace(/\s+/g, '_') || 'анализ'}`
      });
    } catch (e) {
      console.error("PDF export error:", e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    const userMsg = question.trim();
    setIsAsking(true);
    setAnswer(null);
    setQuestion('');
    stopAudio();

    const newHistory = [...chatHistory, { role: 'user', text: userMsg } as const];
    setChatHistory(newHistory);

    try {
      const response = await chatWithChubuk(userMsg, chatHistory, { 
        userInput, 
        matrix, 
        astrology 
      });
      setAnswer(response);
      const updatedHistory = [...newHistory, { role: 'model', text: response } as const];
      setChatHistory(updatedHistory);
      const key = getChatKey(userInput);
      localStorage.setItem(key, JSON.stringify(updatedHistory));
      localStorage.setItem('chubuk_latest_matrix_chat', JSON.stringify(updatedHistory));
      // Automatically read the answer
      playAudio(response, 'answer', selectedVoice);
    } catch (e) {
      console.error(e);
      setAnswer("Энергии сегодня туманны. Попробуйте сформулировать иначе.");
    } finally {
      setIsAsking(false);
    }
  };

  const handleSectionAudio = (text: string, id: number | string, event: React.MouseEvent) => {
    event.stopPropagation();
    playAudio(text, id, selectedVoice);
  };

  const handleDownloadAudio = async (text: string, title: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const dlId = `dl_${title}`;
    setLoadingId(dlId);
    try {
      await downloadAudioForCalculation(text, `chubuk_${title.toLowerCase().replace(/\s+/g, '_')}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleFullAudioAnalysis = async () => {
    const dlId = 'full_audio_ind_dl';
    setLoadingId(dlId);
    setIsGeneratingFullAudio(true);
    try {
      await downloadFullAudioAnalysis('individual', {
        input: userInput,
        matrix: matrix,
        astrology: astrology
      }, `chubuk_full_analysis_${userInput.name.toLowerCase().replace(/\s+/g, '_')}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingFullAudio(false);
      setLoadingId(null);
    }
  };

  const getIcon = (index: number) => {
    switch (index) {
      case 0: return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
      case 1: return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
      default: return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
    }
  };

  return (
    <div id="analysis-results-container" className="w-full max-w-4xl mx-auto space-y-8 pb-10">
      
      <div className="card-3d rounded-3xl p-8 relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(251,191,36,0.15)] transition-all duration-500 animate-fade-in-up">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-all duration-700"></div>
        
        <div className="absolute top-6 right-6 z-20 no-print flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all bg-gradient-to-r from-amber-500/25 via-amber-500/35 to-amber-600/40 text-amber-200 border border-amber-500/50 hover:from-amber-500 hover:to-amber-600 hover:text-black shadow-[0_0_20px_rgba(251,191,36,0.25)] cursor-pointer"
            title="Скачать отчет (PDF)"
          >
            {isGeneratingPdf ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <FileText size={15} className="text-amber-400 group-hover:text-black" />
            )}
            <span>{isGeneratingPdf ? 'Формирование отчета...' : 'Скачать отчет (PDF)'}</span>
          </button>

          <button
            onClick={handleFullAudioAnalysis}
            disabled={isGeneratingFullAudio}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-black"
          >
            {isGeneratingFullAudio ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <Download size={15} />
            )}
            {isGeneratingFullAudio ? 'Считывание...' : 'Аудио Разбор'}
          </button>
          
          <button
            onClick={(e) => handleDownloadAudio(analysis.introduction, 'introduction', e)}
            className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all"
            title="Скачать аудио вступления"
          >
            {loadingId === 'dl_introduction' ? <Loader2 className="animate-spin w-4 h-4" /> : <Download size={15} />}
          </button>

          <select
            value={selectedVoice}
            onChange={(e) => { stopAudio(); setSelectedVoice(e.target.value); }}
            className="appearance-none bg-black/60 border border-amber-500/30 rounded-xl py-1.5 pl-3 pr-8 text-xs text-amber-200 focus:outline-none focus:border-amber-500 cursor-pointer hover:bg-black/80 transition-colors"
          >
            {VOICE_OPTIONS.map(v => (
              <option key={v.name} value={v.name}>{v.label}</option>
            ))}
          </select>
        </div>

        <h3 className="text-3xl font-serif text-amber-100 mb-6 relative z-10 flex items-center gap-4">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
             <span className="font-serif font-bold text-xl">C</span>
          </span>
          <span className="text-glow">Матрица Души</span>
        </h3>
        <div className="prose prose-invert prose-lg max-w-none relative z-10">
          <p className="text-slate-300 font-light leading-relaxed italic pl-6 border-l-2 border-amber-500/30">
            {analysis.introduction}
          </p>
          <MatrixTable matrix={matrix} />
          <PythagoreanSquareTable birthDate={userInput?.birthDate || ''} />
        </div>
      </div>

      <div className="space-y-6">
        {analysis.sections.map((section, index) => (
          <div 
            key={index} 
            className={`transition-all duration-500 rounded-2xl overflow-hidden border card-3d-item ${
              openIndex === index 
                ? 'bg-gradient-to-br from-[#1a162e] to-black border-amber-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform scale-[1.01]' 
                : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            <div
              onClick={() => toggleSection(index)}
              className="w-full text-left p-6 flex items-center justify-between group cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection(index); } }}
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 transform group-hover:rotate-6 ${
                  openIndex === index ? 'bg-amber-500 text-black rotate-3' : 'bg-[#0f1219] text-amber-500 border border-amber-500/20'
                }`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {getIcon(index)}
                  </svg>
                </div>
                <h4 className={`font-serif text-xl font-bold tracking-wide transition-colors ${openIndex === index ? 'text-amber-100' : 'text-slate-300 group-hover:text-white'}`}>
                  {section.title}
                </h4>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                   onClick={(e) => handleDownloadAudio(section.content, section.title, e)}
                   className="p-3 rounded-full bg-white/5 text-slate-400 hover:bg-amber-500/20 hover:text-amber-500 transition-all z-20"
                   title="Скачать аудио"
                >
                  {loadingId === `dl_${section.title}` ? <Loader2 className="animate-spin w-5 h-5" /> : <Download size={20} />}
                </button>
                <div 
                   onClick={(e) => handleSectionAudio(section.content, index, e)}
                   className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-20 hover:scale-110 shadow-lg ${
                     playingId === index ? 'bg-green-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-black'
                   }`}
                >
                  {loadingId === index ? (
                     <Loader2 className="animate-spin w-5 h-5" />
                  ) : playingId === index ? (
                     <Pause size={24} />
                  ) : (
                     <Play size={24} className="translate-x-0.5" />
                  )}
                </div>
              </div>
            </div>

            <div className={`overflow-hidden transition-all duration-700 ${openIndex === index ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-8 pt-2 border-t border-white/5 bg-black/20">
                <p className="text-slate-300 leading-8 font-light text-lg tracking-wide whitespace-pre-wrap">
                  {section.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Mystical Forecast Embedded Block */}
      <div className="w-full no-print pt-6">
        <DailyForecastSection initialUserInput={userInput} />
      </div>

      {/* Stylized PDF Export Banner */}
      <div className="card-3d rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-r from-[#14182b]/80 via-[#0d1020]/90 to-[#14182b]/80 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] no-print">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <FileText size={28} />
          </div>
          <div>
            <h4 className="text-xl font-serif text-amber-200 font-bold mb-1 flex items-center gap-2">
              <span>Полный Сакральный Отчет (PDF)</span>
              <Sparkles size={16} className="text-amber-400 animate-pulse" />
            </h4>
            <p className="text-sm text-slate-400 font-light">
              Структурированный PDF-документ с сакральными ключами Матрицы Судьбы, астрологическим анализом натала, прогнозом и талисманами.
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="w-full sm:w-auto px-7 py-4 btn-3d rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2.5 shrink-0 shadow-[0_0_25px_rgba(251,191,36,0.35)] hover:scale-105 transition-transform cursor-pointer"
        >
          {isGeneratingPdf ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Download size={18} />
          )}
          <span>{isGeneratingPdf ? 'Формирование отчета...' : 'Скачать отчет (PDF)'}</span>
        </button>
      </div>

      {/* In-feed Yandex / Sponsor Banner */}
      <YandexAdBanner placement="infeed" />

      {/* NEW: Ask specific question about Matrix */}
      <div className="card-3d rounded-3xl p-8 border-amber-500/30 bg-black/40 shadow-inner no-print">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
           <h4 className="text-2xl font-serif text-amber-100 flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Задать вопрос Судьбе</span>
           </h4>
           {userInput?.name && (
             <div className="flex items-center gap-2">
               <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                 Вопрошающий: {userInput.name}
               </span>
               {chatHistory.length > 0 && (
                 <button
                   onClick={handleClearChat}
                   className="text-[11px] text-slate-400 hover:text-amber-400 underline underline-offset-2 transition-colors ml-2"
                 >
                   Очистить диалог
                 </button>
               )}
             </div>
           )}
         </div>
         <p className="text-slate-400 text-sm mb-6 font-light">
           Спросите Старца Chubuk о конкретной сфере жизни в контексте персональной матрицы{userInput?.name ? ` для ${userInput.name}` : ''}.
         </p>
         
         <div className="flex gap-4">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Например: Какое предназначение мне открыть в этом году?"
              className="flex-1 input-3d rounded-xl px-5 py-3 text-amber-100 outline-none focus:border-amber-500 transition-colors"
            />
            <button 
              onClick={handleAskQuestion}
              disabled={isAsking || !question.trim()}
              className="px-6 py-3 btn-3d rounded-xl font-bold uppercase text-xs tracking-widest disabled:opacity-50"
            >
              {isAsking ? '...' : 'Задать вопрос'}
            </button>
         </div>

         {globalAudioError && (
           <div className="mt-4 text-center text-amber-500 text-xs font-medium animate-pulse">
             {globalAudioError}
           </div>
         )}

         {chatHistory.length > 0 && (
           <div className="mt-8 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
             {chatHistory.map((msg, idx) => (
               <div 
                 key={idx} 
                 className={`p-6 rounded-2xl animate-fade-in relative group ${
                   msg.role === 'user' 
                     ? 'bg-white/5 border border-white/10 ml-12' 
                     : 'bg-amber-500/5 border border-amber-500/20 mr-12'
                 }`}
               >
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${msg.role === 'user' ? 'bg-slate-400' : 'bg-amber-500 animate-pulse'}`}></div>
                     <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                       {msg.role === 'user' ? 'Вы' : 'Chubuk'}
                     </span>
                   </div>
                   
                   {msg.role === 'model' && (
                     <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button
                         onClick={(e) => handleDownloadAudio(msg.text, `chat_ans_${idx}`, e)}
                         className="p-1.5 rounded-lg bg-white/5 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all"
                         title="Скачать аудио"
                       >
                         {loadingId === `dl_chat_ans_${idx}` ? <Loader2 className="animate-spin w-3 h-3" /> : <Download size={12} />}
                       </button>
                       <button
                         onClick={(e) => handleSectionAudio(msg.text, `chat_ans_${idx}`, e)}
                         className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                           playingId === `chat_ans_${idx}` ? 'bg-amber-500 text-black' : 'text-amber-500 border border-amber-500/30'
                         }`}
                       >
                         {playingId === `chat_ans_${idx}` ? <Pause size={14} /> : <Play size={14} className="translate-x-0.5" />}
                       </button>
                     </div>
                   )}
                 </div>
                 <p className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-slate-300' : 'text-amber-100 italic'}`}>
                   {msg.text}
                 </p>
               </div>
             ))}
             {isAsking && (
               <div className="flex gap-1 items-center p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl mr-12 animate-pulse">
                 <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-100"></div>
                 <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-200"></div>
               </div>
             )}
           </div>
         )}
      </div>
    </div>
  );
};

export default AnalysisResults;
