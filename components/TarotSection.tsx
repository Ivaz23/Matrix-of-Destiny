
import React, { useState, useEffect, useRef } from 'react';
import { TarotCard, TarotReading, UserInput, MatrixNumbers } from '../types';
import { generateTarotReading, FULL_TAROT_DECK, MAJOR_ARCANA, generateTarotAtmosphere, getSpeech, decodeAudioData, VOICE_OPTIONS } from '../services/geminiService';
import { Volume2, VolumeX, Loader2, Download } from 'lucide-react';
import { downloadAudioForCalculation, exportTarotPdf } from '../services/exportUtils';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';

interface TarotSectionProps {
  userInput: UserInput | null;
  matrix: MatrixNumbers | null;
  onSave: (reading: TarotReading) => void;
}

const TarotSection: React.FC<TarotSectionProps> = ({ userInput, matrix, onSave }) => {
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [isLaying, setIsLaying] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [selectedSpread, setSelectedSpread] = useState<'day' | 'trinity'>('day');
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [atmosphereImg, setAtmosphereImg] = useState<string | null>(null);
  const [isAtmosphereLoading, setIsAtmosphereLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].name);

  const { playingId, loadingId, setLoadingId, playAudio, stopAudio, error: audioError } = useGlobalAudio();

  const handleDownloadAudio = async (text: string, title: string) => {
    const dlId = `dl_${title}`;
    setLoadingId(dlId);
    try {
      await downloadAudioForCalculation(text, `tarot_${title}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    const fetchAtmosphere = async () => {
      setIsAtmosphereLoading(true);
      const img = await generateTarotAtmosphere(userInput, matrix);
      if (img) setAtmosphereImg(img);
      setIsAtmosphereLoading(false);
    };

    if (userInput || matrix) {
      fetchAtmosphere();
    }
  }, [userInput, matrix]);

  const playInterpretation = async () => {
    if (!reading) return;
    
    const cardsText = reading.cards.map(c => c.name).join(', ');
    const timeFrameText = reading.timeFrame ? `Сроки реализации: ${reading.timeFrame}.` : "";
    const textToSpeak = `Арканы раскрыты: ${cardsText}. ${reading.interpretation}. ${timeFrameText} Совет свыше: ${reading.advice}`;
    
    playAudio(textToSpeak, 'tarot', selectedVoice);
  };

  const isPlaying = playingId === 'tarot';
  const isAudioLoading = loadingId === 'tarot';

  const handleExportPdf = async () => {
    if (!reading) return;
    try {
      setIsExportingPdf(true);
      await exportTarotPdf({
        userInput,
        reading,
        question,
        filename: `Расклад_Таро_${(userInput?.name || 'Странник').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`
      });
    } catch (e) {
      console.error("Failed to export Tarot PDF:", e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleReading = async () => {
    stopAudio();
    setIsLaying(true);
    setReading(null);
    setRevealedIndices([]);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const count = selectedSpread === 'day' ? 1 : 3;
    const shuffled = [...FULL_TAROT_DECK].sort(() => 0.5 - Math.random());
    const pickedCards: TarotCard[] = shuffled.slice(0, count).map((name, id) => ({ id, name }));

    try {
      const result = await generateTarotReading(pickedCards, question, { userInput, matrix });
      setReading(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLaying(false);
    }
  };

  const toggleReveal = (index: number) => {
    if (!revealedIndices.includes(index)) {
      setRevealedIndices([...revealedIndices, index]);
    }
  };

  const isMajorArcana = (cardName: string) => MAJOR_ARCANA.includes(cardName);

  return (
    <section className="relative w-full max-w-5xl mx-auto py-20 px-4 rounded-[3rem] overflow-hidden shadow-2xl">
      <div className="absolute inset-0 z-0">
        {atmosphereImg ? (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-1000 animate-fade-in"
            style={{ backgroundImage: `url(${atmosphereImg})` }}
          ></div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-black opacity-60"></div>
        )}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
      </div>

      <div className="relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 animate-pulse">
            Священный Оракул
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-amber-100 mb-6 drop-shadow-xl">
            Священное <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">Таро</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg font-light leading-relaxed mb-8">
            Карты Таро — это зеркало вашей души. Сформулируйте намерение и позвольте энергиям арканов зазвучать.
          </p>
          
          <div className="max-w-lg mx-auto mb-10 no-print">
            <div className="relative group">
              <input 
                type="text"
                placeholder="Сформулируйте свой вопрос..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-black/40 border-2 border-amber-500/20 focus:border-amber-500/60 rounded-2xl px-6 py-4 text-amber-100 placeholder-amber-500/30 outline-none transition-all font-serif text-lg text-center backdrop-blur-sm"
              />
              <div className="absolute -bottom-6 left-0 right-0 text-[10px] text-amber-500/40 uppercase tracking-widest font-bold">
                Поле вашего намерения
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-12">
          <div className="flex bg-black/40 p-2 rounded-2xl border border-white/10 no-print backdrop-blur-md shadow-inner">
            <button
              onClick={() => { setSelectedSpread('day'); setReading(null); stopAudio(); }}
              className={`px-8 py-3 rounded-xl transition-all font-serif text-sm tracking-widest uppercase ${selectedSpread === 'day' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              Карта Дня
            </button>
            <button
              onClick={() => { setSelectedSpread('trinity'); setReading(null); stopAudio(); }}
              className={`px-8 py-3 rounded-xl transition-all font-serif text-sm tracking-widest uppercase ${selectedSpread === 'trinity' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              Триединство
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-10 min-h-[350px] w-full items-center perspective-1000">
            {isLaying ? (
               <div className="flex flex-col items-center gap-6 animate-pulse">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-amber-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-4 bg-amber-500/20 rounded-full animate-pulse flex items-center justify-center">
                       <span className="text-amber-500 font-serif text-2xl">†</span>
                    </div>
                  </div>
                  <p className="text-amber-500 font-serif uppercase tracking-widest text-xs">Сонастройка с потоком...</p>
               </div>
            ) : reading ? (
              reading.cards.map((card, idx) => (
                <div 
                  key={idx} 
                  className={`perspective-1000 cursor-pointer transition-transform duration-500 hover:scale-105 ${revealedIndices.includes(idx) ? 'animate-float' : ''}`}
                  style={{ animationDelay: `${idx * 0.5}s` }}
                  onClick={() => toggleReveal(idx)}
                >
                  <div className={`relative w-52 h-80 transition-all duration-700 transform-style-3d ${revealedIndices.includes(idx) ? 'rotate-y-180' : ''}`}>
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#0c0a1a] via-[#1a162e] to-black rounded-2xl border-2 border-amber-500/50 flex flex-col items-center justify-center p-6 shadow-2xl overflow-hidden">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent"></div>
                      <div className="w-14 h-14 rounded-full border border-amber-500/30 flex items-center justify-center mb-6 text-amber-500 font-serif text-2xl shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                        {idx + 1}
                      </div>
                      <h3 className="text-xl md:text-2xl font-serif text-amber-100 text-center drop-shadow-md z-10 tracking-wider px-2">
                        {card.name}
                      </h3>
                      <div className="mt-auto text-[9px] text-amber-500/40 uppercase tracking-[0.4em] font-bold">
                        {isMajorArcana(card.name) ? 'Arcana Major' : 'Arcana Minor'}
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 backface-hidden bg-[#050a14] rounded-2xl border-2 border-amber-500/20 flex items-center justify-center shadow-lg group overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/sacred-geometry.png')] opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                      <div className="w-full h-full p-5 flex items-center justify-center">
                         <div className="w-full h-full border border-amber-500/10 rounded-xl flex items-center justify-center relative">
                            <div className="w-20 h-20 border-2 border-amber-500/30 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:border-amber-500/60 transition-all duration-700 shadow-[inset_0_0_15px_rgba(251,191,36,0.1)]">
                               <span className="text-amber-500 text-3xl font-serif">†</span>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <button 
                onClick={handleReading}
                className="group relative"
              >
                <div className="absolute -inset-8 bg-amber-500/10 rounded-full blur-[60px] group-hover:bg-amber-500/20 transition-all duration-700"></div>
                <div className="relative w-52 h-80 bg-gradient-to-br from-slate-950 to-black rounded-2xl border-2 border-dashed border-amber-500/30 flex flex-col items-center justify-center gap-6 group-hover:border-amber-500 group-hover:shadow-[0_0_30px_rgba(251,191,36,0.1)] transition-all backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full bg-amber-500/5 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-8 h-8 text-amber-500/40 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-500 group-hover:text-amber-400 text-center px-4">Разложить Поток</span>
                </div>
              </button>
            )}
          </div>

          {reading && revealedIndices.length === reading.cards.length && (
            <div className="w-full card-3d rounded-3xl p-8 md:p-12 animate-fade-in-up bg-black/60 backdrop-blur-xl border-amber-500/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                  <button
                    onClick={playInterpretation}
                    disabled={isAudioLoading}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                      isPlaying 
                        ? 'bg-amber-500 text-black shadow-amber-500/40 scale-105 animate-pulse' 
                        : 'bg-white/5 text-amber-400 hover:bg-amber-500 hover:text-black hover:scale-105 border border-amber-500/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isAudioLoading ? (
                       <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                    ) : isPlaying ? (
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                       <svg className="w-6 h-6 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </button>
                  <div className="flex flex-col">
                    <span className="text-amber-100 font-serif text-lg tracking-wide">Голос Оракула</span>
                    <span className="text-slate-500 text-xs uppercase tracking-widest">{isPlaying ? 'Трансляция истины...' : 'Слушать интерпретацию'}</span>
                  </div>
                </div>

                {isPlaying && (
                  <div className="flex items-end gap-1.5 h-12 md:h-16 px-6">
                    {[0.6, 1.2, 0.8, 1.1, 0.9, 1.4, 0.7, 1.3, 1.0, 1.5, 0.8].map((speed, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-gradient-to-t from-amber-600 to-amber-300 rounded-t-full"
                        style={{ 
                          height: `${Math.random() * 100}%`,
                          animation: `bounce ${speed}s ease-in-out infinite alternate`
                        }}
                      ></div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isExportingPdf ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Download size={16} />
                    )}
                    <span>{isExportingPdf ? 'Экспорт...' : 'Скачать PDF'}</span>
                  </button>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold ml-1">Мистический тембр:</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => { stopAudio(); setSelectedVoice(e.target.value); }}
                      className="bg-black/40 border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs text-amber-200 focus:outline-none focus:border-amber-500 cursor-pointer hover:bg-black/60 transition-colors appearance-none"
                    >
                      {VOICE_OPTIONS.map(v => (
                        <option key={v.name} value={v.name}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {audioError && (
                <div className="mb-6 text-center text-amber-500 text-xs font-medium animate-bounce">
                  {audioError}
                </div>
              )}

              {question && (
                <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <span className="text-[10px] text-amber-500/60 uppercase font-bold tracking-widest block mb-1">Ваш вопрос:</span>
                  <p className="text-amber-100 italic">"{question}"</p>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-12">
                 <div className="md:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                      <h4 className="text-2xl font-serif text-amber-100 flex items-center gap-4">
                        <span className="w-1.5 h-10 bg-gradient-to-b from-amber-300 to-amber-600 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.3)]"></span>
                        Толкование Потока
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadAudio(reading.interpretation, 'interpretation')}
                          className="p-2 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
                          title="Скачать аудио"
                        >
                          {loadingId === 'dl_interpretation' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                        </button>
                        <button
                          onClick={() => playAudio(reading.interpretation, 'interpretation', selectedVoice)}
                          className={`p-2 rounded-full transition-all ${
                            playingId === 'interpretation' ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {loadingId === 'interpretation' ? <Loader2 className="animate-spin" size={16} /> : playingId === 'interpretation' ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-200 leading-[2] text-xl font-light whitespace-pre-wrap italic">
                      {reading.interpretation}
                    </p>
                    
                    {/* NEW: Time Frame Indicator */}
                    {reading.timeFrame && (
                      <div className="flex items-center gap-4 p-5 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl animate-fade-in-up relative group/time">
                        <div className="absolute top-2 right-2 flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadAudio(reading.timeFrame || '', 'timeframe')}
                            className="p-1.5 rounded-lg bg-white/5 text-indigo-400 hover:bg-white/10 opacity-0 group-hover/time:opacity-100 transition-all"
                            title="Скачать аудио"
                          >
                            {loadingId === 'dl_timeframe' ? <Loader2 className="animate-spin" size={12} /> : <Download size={12} />}
                          </button>
                          <button
                            onClick={() => playAudio(reading.timeFrame || '', 'timeframe', selectedVoice)}
                            className={`p-1.5 rounded-lg transition-all ${
                              playingId === 'timeframe' 
                                ? 'bg-indigo-500 text-white' 
                                : 'bg-white/5 text-indigo-400 hover:bg-white/10 opacity-0 group-hover/time:opacity-100'
                            }`}
                          >
                            {loadingId === 'timeframe' ? <Loader2 className="animate-spin" size={12} /> : playingId === 'timeframe' ? <VolumeX size={12} /> : <Volume2 size={12} />}
                          </button>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-[0.2em] block mb-0.5">Временной Горизонт (Хронос)</span>
                          <p className="text-indigo-100 font-serif text-lg">{reading.timeFrame}</p>
                        </div>
                      </div>
                    )}
                 </div>
                 
                 <div className="flex flex-col gap-6">
                   <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-3xl flex flex-col justify-center relative overflow-hidden group/advice shadow-inner">
                      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadAudio(reading.advice, 'advice')}
                          className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 opacity-0 group-hover/advice:opacity-100 transition-all"
                          title="Скачать аудио"
                        >
                          {loadingId === 'dl_advice' ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                        </button>
                        <button
                          onClick={() => playAudio(reading.advice, 'advice', selectedVoice)}
                          className={`p-2 rounded-lg transition-all ${
                            playingId === 'advice' 
                              ? 'bg-amber-500 text-black' 
                              : 'bg-white/5 text-slate-400 hover:bg-white/10 opacity-0 group-hover/advice:opacity-100'
                          }`}
                        >
                          {loadingId === 'advice' ? <Loader2 className="animate-spin" size={14} /> : playingId === 'advice' ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                      </div>
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/advice:scale-125 transition-transform duration-1000">
                        <svg className="w-20 h-20 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </div>
                      <h4 className="text-amber-400 font-serif mb-6 flex items-center gap-3 tracking-widest text-sm uppercase">
                        <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Совет Свыше
                      </h4>
                      <p className="text-amber-100 italic leading-loose text-lg font-serif">
                        "{reading.advice}"
                      </p>
                      <div className="mt-8 pt-6 border-t border-amber-500/10 flex gap-4">
                        <button 
                          onClick={() => onSave(reading)}
                          className="flex-1 text-[10px] text-amber-500 hover:text-amber-400 uppercase tracking-[0.4em] font-bold transition-all text-center"
                        >
                          Сохранить
                        </button>
                        <button 
                          onClick={() => { stopAudio(); setReading(null); setRevealedIndices([]); setQuestion(''); }}
                          className="flex-1 text-[10px] text-amber-500/40 hover:text-amber-400 uppercase tracking-[0.4em] font-bold transition-all text-center"
                        >
                          Собрать Колоду
                        </button>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .rotate-y-180 { transform: rotateY(180deg); }
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        
        @keyframes bounce {
          0% { height: 20%; opacity: 0.4; }
          100% { height: 100%; opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default TarotSection;
