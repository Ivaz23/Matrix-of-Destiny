import React, { useState, useEffect } from 'react';
import { UserInput, HoraryResult } from '../types';
import { generateHoraryAnalysis, VOICE_OPTIONS } from '../services/geminiService';
import { exportHoraryPdf } from '../services/exportUtils';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';
import { 
  Sparkles, 
  HelpCircle, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Loader2, 
  Download, 
  FileText,
  Compass, 
  Zap, 
  Flame, 
  Share2, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HorarySectionProps {
  userInput: UserInput | null;
  onSave?: (result: HoraryResult) => void;
}

const PRESET_QUESTIONS = [
  "Сбудется ли задуманное в ближайший месяц?",
  "Будет ли финансовый рост и успех в моем деле?",
  "Стоит ли начинать новые отношения или союз?",
  "Будет ли поездка или переезд благоприятным?",
  "Каков истинный исход волнующей меня ситуации?"
];

const HorarySection: React.FC<HorarySectionProps> = ({ userInput, onSave }) => {
  const [question, setQuestion] = useState('');
  
  const getHoraryKey = (input: any) => {
    if (input?.name && input?.birthDate) {
      return `chubuk_horary_${encodeURIComponent(input.name)}_${input.birthDate}`;
    }
    return 'chubuk_latest_horary';
  };

  const [result, setResult] = useState<HoraryResult | null>(() => {
    try {
      const key = getHoraryKey(userInput);
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Automatically update and reset horary oracle state when participant changes
  useEffect(() => {
    const key = getHoraryKey(userInput);
    try {
      const saved = localStorage.getItem(key);
      setResult(saved ? JSON.parse(saved) : null);
    } catch {
      setResult(null);
    }
    setQuestion('');
    stopAudio();
  }, [userInput?.name, userInput?.birthDate]);

  const [loading, setLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].name);

  const { playingId, loadingId, playAudio, stopAudio } = useGlobalAudio();

  const handleAsk = async (questionToAsk?: string) => {
    const q = questionToAsk || question;
    if (!q.trim()) return;
    setLoading(true);
    stopAudio();
    try {
      const res = await generateHoraryAnalysis(q, { userInput });
      setResult(res);
      const key = getHoraryKey(userInput);
      localStorage.setItem(key, JSON.stringify(res));
      localStorage.setItem('chubuk_latest_horary', JSON.stringify(res));
      if (onSave) {
        onSave(res);
      }
    } catch (err) {
      console.error("Horary oracle error:", err);
    } finally {
      setLoading(false);
    }
  };

  const playVoiceover = () => {
    if (!result) return;
    const textToSpeak = `
      Вопрос Судьбе: ${result.question}. 
      Вердикт Оракула: ${result.answer}. 
      ${result.probability ? `Вероятность свершения: ${result.probability} процентов.` : ''}
      Сроки: ${result.timing || 'в ближайший период'}. 
      ${result.favorableConditions ? `Условия успеха: ${result.favorableConditions}.` : ''}
      ${result.risksAndWarnings ? `Предостережение: ${result.risksAndWarnings}.` : ''}
      Толкование: ${result.explanation}. 
      Совет Судьбы: ${result.advice}.
      ${result.affirmation ? `Сакральное намерение: ${result.affirmation}` : ''}
    `;
    playAudio(textToSpeak, 'horary', selectedVoice);
  };

  const isPlaying = playingId === 'horary';
  const isAudioLoading = loadingId === 'horary';

  const handleDownloadPdf = async () => {
    if (!result) return;
    try {
      setIsExportingPdf(true);
      await exportHoraryPdf({
        userInput,
        result,
        filename: `Ответ_Судьбы_${(userInput?.name || 'Странник').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`
      });
    } catch (e) {
      console.error("PDF export error:", e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 animate-fade-in pb-24 px-4 sm:px-0">
      {/* Top Banner */}
      <div className="relative rounded-3xl p-8 sm:p-12 text-center overflow-hidden border border-amber-500/30 bg-gradient-to-b from-[#11172e] via-[#090d1c] to-[#04060c] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <HelpCircle size={14} className="text-amber-400" />
            Хорарный Оракул и Развилки Будущего
          </div>

          <h2 className="text-4xl sm:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500">
            Задать вопрос Судьбе
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            Сформулируйте волнующий вас вопрос. Оракул считает положение звезд текущего часа, кармические развилки и откроет вердикт: <span className="text-amber-300 font-medium">«Сбудется ли?», «Что произойдет, ЕСЛИ...»</span> и какие действия приведут к победе.
          </p>

          {/* Quick presets */}
          <div className="pt-2">
            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">
              Быстрые сакральные вопросы:
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              {PRESET_QUESTIONS.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(pq);
                    handleAsk(pq);
                  }}
                  disabled={loading}
                  className="px-3.5 py-1.5 text-xs rounded-full bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-all text-left"
                >
                  {pq}
                </button>
              ))}
            </div>
          </div>

          {/* Input & Action */}
          <div className="pt-4 space-y-4 max-w-2xl mx-auto">
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Напишите ваш вопрос (например: «Будет ли успешным новое начинание?» или «Сбудется ли задуманное в этом месяце?»)..."
                className="w-full bg-[#050814]/90 border border-amber-500/30 focus:border-amber-400 rounded-2xl p-5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm leading-relaxed min-h-[110px] shadow-inner resize-none"
              />
            </div>

            <button
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              className="w-full py-4 rounded-2xl btn-3d font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin text-amber-950" size={20} />
                  <span>Считывание небесного часа...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-amber-950" />
                  <span>Получить ответ Судьбы</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Main Verdict Card */}
            <div className="card-3d rounded-3xl p-8 sm:p-10 space-y-8 border border-amber-500/40 bg-gradient-to-b from-[#131936] via-[#0b0e22] to-[#050712] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Compass size={160} className="text-amber-400" />
              </div>

              {/* Action bar: Audio & PDF */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-white font-bold">Ответ Оракула Судьбы</h3>
                    <p className="text-xs text-slate-400">{new Date(result.timestamp || Date.now()).toLocaleString('ru-RU')}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Voice Selector */}
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="bg-black/50 border border-white/15 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                  >
                    {VOICE_OPTIONS.map(v => (
                      <option key={v.name} value={v.name} className="bg-slate-900 text-white">
                        {v.label}
                      </option>
                    ))}
                  </select>

                  {/* Audio Button */}
                  <button
                    onClick={isPlaying ? stopAudio : playVoiceover}
                    disabled={isAudioLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      isPlaying
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500 hover:text-black'
                    }`}
                  >
                    {isAudioLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : isPlaying ? (
                      <VolumeX size={14} />
                    ) : (
                      <Volume2 size={14} />
                    )}
                    <span>{isPlaying ? 'Стоп' : 'Слушать голос'}</span>
                  </button>

                  {/* PDF Download Button */}
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isExportingPdf}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black border border-amber-400 hover:brightness-110 transition-all shadow-md disabled:opacity-50"
                  >
                    {isExportingPdf ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    <span>{isExportingPdf ? 'Создание PDF...' : 'Скачать PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Question Recall */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-300">
                <span className="text-amber-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Вопрос странника</span>
                «{result.question}»
              </div>

              {/* Big Verdict Banner */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#151c3a] to-amber-500/15 border-2 border-amber-500/40 text-center space-y-4">
                <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                  Вердикт Небесных Сфер
                </div>
                <div className="text-2xl sm:text-3xl font-serif text-white font-bold leading-snug">
                  {result.answer}
                </div>

                {result.probability !== undefined && (
                  <div className="pt-2 max-w-md mx-auto space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">Вероятность благоприятного исхода</span>
                      <span className="text-amber-400">{result.probability}%</span>
                    </div>
                    <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.probability}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Timing & Ruling Energies */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                    <Clock size={16} />
                    <span>Сроки и Временной горизонт</span>
                  </div>
                  <p className="text-slate-200 text-sm font-medium leading-relaxed">
                    {result.timing || "В течение ближайшего лунного цикла (2-4 недели)"}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Zap size={16} />
                    <span>Правящая энергия часа</span>
                  </div>
                  <p className="text-slate-200 text-sm font-medium leading-relaxed">
                    {result.rulingPlanetOrArcana || "Гармония планет и аркана судьбы"}
                  </p>
                </div>
              </div>

              {/* «ЕСЛИ БУДЕТ...» - Favorable Conditions */}
              {result.favorableConditions && (
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 size={16} />
                    <span>«ЕСЛИ БУДЕТ...» — Сакральные условия успеха</span>
                  </div>
                  <p className="text-emerald-100 text-sm leading-relaxed">
                    {result.favorableConditions}
                  </p>
                </div>
              )}

              {/* Risks and Warnings */}
              {result.risksAndWarnings && (
                <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle size={16} />
                    <span>Кармические ловушки и риски (Чего избегать)</span>
                  </div>
                  <p className="text-rose-100 text-sm leading-relaxed">
                    {result.risksAndWarnings}
                  </p>
                </div>
              )}

              {/* Deep Interpretation */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-serif text-base font-bold">
                  <BookOpen size={18} />
                  <span>Глубокое толкование от старца Чубука</span>
                </div>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                  {result.explanation}
                </p>
              </div>

              {/* Practical Advice & Affirmation */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/40 text-center space-y-4">
                <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                  Практический совет и Сакральное намерение
                </div>
                <p className="text-slate-100 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
                  {result.advice}
                </p>
                {result.affirmation && (
                  <div className="pt-3 border-t border-amber-500/20">
                    <p className="font-serif italic text-amber-300 text-sm sm:text-base">
                      «{result.affirmation}»
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom PDF Download Banner */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 text-left">
                  <FileText className="text-amber-400 shrink-0" size={24} />
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider">Сохранить Сакральный Манускрипт</div>
                    <div className="text-[11px] text-slate-400">Экспортируйте ответ судьбы с кармическими условиями в высоком качестве PDF</div>
                  </div>
                </div>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 shadow-lg disabled:opacity-50"
                >
                  {isExportingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  <span>{isExportingPdf ? 'Экспорт...' : 'Скачать PDF'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HorarySection;
