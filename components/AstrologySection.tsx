import React, { useState, useEffect, useRef } from 'react';
import { UserInput, AstrologyData, AstrologyResult } from '../types';
import { getAstrologyData } from '../services/astrologyUtils';
import { generateAstrologyAnalysis, generateAstrologyBackground, getSpeech, decodeAudioData, VOICE_OPTIONS } from '../services/geminiService';
import { Sparkles, Star, Moon, Sun, Wind, Droplets, Flame, Mountain, Volume2, VolumeX, Briefcase, Compass, Loader2, Download } from 'lucide-react';
import { downloadAudioForCalculation, exportAstrologyPdf } from '../services/exportUtils';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';

interface AstrologySectionProps {
  userInput: UserInput | null;
}

const AstrologySection: React.FC<AstrologySectionProps> = ({ userInput }) => {
  const [astroData, setAstroData] = useState<AstrologyData | null>(null);
  const [analysis, setAnalysis] = useState<AstrologyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].name);

  const { playingId, loadingId, setLoadingId, playAudio, stopAudio, error: audioError } = useGlobalAudio();

  const handleDownloadAudio = async (text: string, title: string) => {
    const dlId = `dl_${title}`;
    setLoadingId(dlId);
    try {
      await downloadAudioForCalculation(text, `astrology_${title}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    if (userInput?.birthDate) {
      const data = getAstrologyData(userInput.birthDate);
      setAstroData(data);
      handleAnalysis(data);
    }
  }, [userInput]);

  const playInterpretation = async () => {
    if (!analysis) return;
    
    const textToSpeak = `
      ${analysis.introduction}. 
      Ваша небесная конфигурация: ${analysis.natalChart}. 
      Духовный путь: ${analysis.spiritualPath}. 
      Профессиональный путь: ${analysis.professionalPath}. 
      Совет звезд: ${analysis.advice}
    `;
    
    playAudio(textToSpeak, 'astrology', selectedVoice);
  };

  const isPlaying = playingId === 'astrology';
  const isAudioLoading = loadingId === 'astrology';

  const handleAnalysis = async (data: AstrologyData) => {
    if (!userInput) return;
    setLoading(true);
    try {
      const res = await generateAstrologyAnalysis(userInput, data);
      setAnalysis(res);
      // Generate background image asynchronously without blocking
      generateAstrologyBackground(data.zodiacSign)
        .then(bg => { if (bg) setBgImage(bg); })
        .catch(() => {});
    } catch (err) {
      console.error("Astrology analysis failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!astroData || !analysis) return;
    try {
      setIsExportingPdf(true);
      await exportAstrologyPdf({
        userInput,
        astroData,
        analysis,
        filename: `Астрология_${(userInput?.name || 'Странник').replace(/\s+/g, '_')}_${astroData.zodiacSign}`
      });
    } catch (e) {
      console.error("Failed to export Astrology PDF:", e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Огонь': return <Flame className="text-orange-500" />;
      case 'Вода': return <Droplets className="text-blue-500" />;
      case 'Воздух': return <Wind className="text-cyan-400" />;
      case 'Земля': return <Mountain className="text-emerald-500" />;
      default: return <Star />;
    }
  };

  if (!userInput) {
    return (
      <div className="text-center py-20 opacity-50">
        <p className="text-xl font-serif">Введите данные для построения натальной карты</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Hero Section */}
      <div className="relative h-[450px] rounded-[3rem] overflow-hidden card-3d flex items-center justify-center text-center p-8 shadow-2xl">
        {bgImage && (
          <div 
            className="absolute inset-0 z-0 opacity-60 bg-cover bg-center transition-opacity duration-1000"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-mystic-dark via-mystic-dark/40 to-transparent z-1" />
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} className="text-mystic-gold" />
            Звездная Карта
          </div>
          <h2 className="text-7xl md:text-9xl font-serif text-glow leading-tight">{astroData?.zodiacSign}</h2>
          <p className="text-xl md:text-2xl text-slate-300 font-light max-w-3xl mx-auto italic leading-relaxed">
            {analysis?.introduction || "Считывание небесных сфер..."}
          </p>

          {analysis && (
            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={playInterpretation}
                  disabled={isAudioLoading}
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all font-serif tracking-widest uppercase text-sm ${
                    isPlaying 
                      ? 'bg-mystic-gold text-black shadow-[0_0_30px_rgba(255,215,0,0.4)]' 
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  } disabled:opacity-50`}
                >
                  {isAudioLoading ? (
                    <Sparkles className="animate-spin" size={18} />
                  ) : isPlaying ? (
                    <VolumeX size={18} />
                  ) : (
                    <Volume2 size={18} />
                  )}
                  {isPlaying ? 'Остановить' : 'Слушать Оракула'}
                </button>

                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
                >
                  {isExportingPdf ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Download size={16} />
                  )}
                  <span>{isExportingPdf ? 'Экспорт...' : 'Скачать PDF'}</span>
                </button>

                <div className="flex flex-col items-start gap-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Голос:</span>
                  <select
                    value={selectedVoice}
                    onChange={(e) => { stopAudio(); setSelectedVoice(e.target.value); }}
                    className="bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-mystic-gold focus:outline-none focus:border-mystic-gold cursor-pointer"
                  >
                    {VOICE_OPTIONS.map(v => (
                      <option key={v.name} value={v.name}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {audioError && (
                <div className="text-amber-500 text-xs font-medium animate-bounce">
                  {audioError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audio Visualizer Overlay */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 h-24 px-10 pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-gradient-to-t from-mystic-gold to-transparent rounded-t-full"
                style={{ 
                  height: `${20 + Math.random() * 80}%`,
                  animation: `audio-bar ${0.5 + Math.random()}s ease-in-out infinite alternate`,
                  opacity: 0.3 + Math.random() * 0.7
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Стихия', value: astroData?.element, icon: getElementIcon(astroData?.element || '') },
          { label: 'Планета', value: astroData?.planet, icon: <Sun className="text-mystic-gold" /> },
          { label: 'Дом', value: astroData?.house, icon: <Moon className="text-purple-400" /> },
          { label: 'Знак', value: astroData?.zodiacSign, icon: <Star className="text-white" /> },
        ].map((stat, i) => (
          <div key={i} className="card-3d p-8 flex flex-col items-center text-center space-y-3 hover:border-mystic-gold/30 transition-all group">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-2 group-hover:scale-110 transition-transform duration-500">
              {stat.icon}
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{stat.label}</span>
            <span className="text-2xl font-serif text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Natal Chart Description */}
            <div className="card-3d p-10 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Star size={120} />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-serif flex items-center gap-4">
                  <Star className="text-mystic-gold" size={24} />
                  Небесная Конфигурация
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadAudio(analysis?.natalChart || '', 'natal')}
                    className="p-2 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
                    title="Скачать аудио"
                  >
                    {loadingId === 'dl_natal' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                  </button>
                  <button
                    onClick={() => playAudio(analysis?.natalChart || '', 'natal', selectedVoice)}
                    className={`p-2 rounded-full transition-all ${
                      playingId === 'natal' ? 'bg-mystic-gold text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {loadingId === 'natal' ? <Loader2 className="animate-spin" size={16} /> : playingId === 'natal' ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-mystic-gold/50 to-transparent" />
              <p className="text-slate-200 leading-relaxed font-light text-xl first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-mystic-gold">
                {loading ? "Анализ планетарных аспектов..." : analysis?.natalChart}
              </p>
            </div>

            {/* Deep Path Sections */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-3d p-8 space-y-4 border-mystic-gold/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-serif text-mystic-gold flex items-center gap-3">
                    <Compass size={24} />
                    Духовный Путь
                  </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadAudio(analysis?.spiritualPath || '', 'spiritual')}
                    className="p-2 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
                    title="Скачать аудио"
                  >
                    {loadingId === 'dl_spiritual' ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                  </button>
                  <button
                    onClick={() => playAudio(analysis?.spiritualPath || '', 'spiritual', selectedVoice)}
                    className={`p-2 rounded-full transition-all ${
                      playingId === 'spiritual' ? 'bg-mystic-gold text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {loadingId === 'spiritual' ? <Loader2 className="animate-spin" size={14} /> : playingId === 'spiritual' ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>
                </div>
                <p className="text-slate-300 leading-relaxed font-light italic">
                  {analysis?.spiritualPath}
                </p>
              </div>
              <div className="card-3d p-8 space-y-4 border-mystic-gold/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-serif text-mystic-gold flex items-center gap-3">
                    <Briefcase size={24} />
                    Профессиональный Путь
                  </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadAudio(analysis?.professionalPath || '', 'professional')}
                    className="p-2 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
                    title="Скачать аудио"
                  >
                    {loadingId === 'dl_professional' ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                  </button>
                  <button
                    onClick={() => playAudio(analysis?.professionalPath || '', 'professional', selectedVoice)}
                    className={`p-2 rounded-full transition-all ${
                      playingId === 'professional' ? 'bg-mystic-gold text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {loadingId === 'professional' ? <Loader2 className="animate-spin" size={14} /> : playingId === 'professional' ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>
                </div>
                <p className="text-slate-300 leading-relaxed font-light italic">
                  {analysis?.professionalPath}
                </p>
              </div>
            </div>

            {/* Expanded Insights */}
            <div className="space-y-8">
              <div className="card-3d p-10 space-y-6 bg-gradient-to-br from-purple-900/10 to-transparent">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-serif text-white flex items-center gap-4">
                    <Sparkles className="text-purple-400" size={24} />
                    Кармические Уроки
                  </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadAudio(analysis?.karmicLessons || '', 'karmic')}
                    className="p-2 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
                    title="Скачать аудио"
                  >
                    {loadingId === 'dl_karmic' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                  </button>
                  <button
                    onClick={() => playAudio(analysis?.karmicLessons || '', 'karmic', selectedVoice)}
                    className={`p-2 rounded-full transition-all ${
                      playingId === 'karmic' ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {loadingId === 'karmic' ? <Loader2 className="animate-spin" size={16} /> : playingId === 'karmic' ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
                </div>
                <p className="text-slate-300 leading-relaxed font-light text-lg">
                  {loading ? "Считывание кармических узлов..." : analysis?.karmicLessons}
                </p>
              </div>

              <div className="card-3d p-10 space-y-6 bg-gradient-to-br from-cyan-900/10 to-transparent">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-serif text-white flex items-center gap-4">
                    <Sun className="text-cyan-400" size={24} />
                    Планетарные Влияния
                  </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadAudio(analysis?.planetaryInfluences || '', 'planetary')}
                    className="p-2 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
                    title="Скачать аудио"
                  >
                    {loadingId === 'dl_planetary' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                  </button>
                  <button
                    onClick={() => playAudio(analysis?.planetaryInfluences || '', 'planetary', selectedVoice)}
                    className={`p-2 rounded-full transition-all ${
                      playingId === 'planetary' ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {loadingId === 'planetary' ? <Loader2 className="animate-spin" size={16} /> : playingId === 'planetary' ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
                </div>
                <p className="text-slate-300 leading-relaxed font-light text-lg">
                  {loading ? "Анализ небесных сфер..." : analysis?.planetaryInfluences}
                </p>
              </div>
            </div>

          {/* Aspects */}
          <div className="grid md:grid-cols-3 gap-6">
            {analysis?.aspects.map((aspect, i) => (
              <div key={i} className="card-3d p-8 space-y-4 hover:bg-white/5 transition-all cursor-default border-white/5">
                <h4 className="text-mystic-gold font-serif text-xl border-b border-white/10 pb-2">{aspect.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{aspect.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Traits */}
          <div className="card-3d p-10 space-y-8">
            <h3 className="text-2xl font-serif text-center tracking-wide">Архетипические Черты</h3>
            <div className="space-y-4">
              {astroData?.traits.map((trait, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-mystic-gold/40 transition-all">
                  <span className="text-base font-medium text-slate-200">{trait}</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-mystic-gold shadow-[0_0_15px_rgba(255,215,0,0.6)] group-hover:scale-125 transition-transform" />
                </div>
              ))}
            </div>
          </div>

          {/* Advice */}
          <div className="card-3d p-10 bg-mystic-gold/5 border-mystic-gold/20 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:scale-150 transition-transform duration-1000">
              <Sparkles size={160} className="text-mystic-gold" />
            </div>
            <h3 className="text-2xl font-serif mb-6 italic text-mystic-gold">Совет Звезд</h3>
            <p className="text-slate-200 text-lg leading-relaxed relative z-10 font-light italic">
              "{analysis?.advice}"
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes audio-bar {
          0% { height: 20%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
};

export default AstrologySection;
