import React, { useState, useRef, useEffect } from 'react';
import { Compass, Sparkles, HelpCircle, Flame, ShieldAlert, CheckCircle2, Volume2, VolumeX, ChevronRight, Info } from 'lucide-react';
import { MatrixNumbers, UserInput, EnergyDetails } from '../types';
import { getEnergyAnalysis, getSpeech, decodeAudioData } from '../services/geminiService';
import { calculateKarmicTailTriad, getKarmicTailDetails, ARCANA_SHORT_NAMES, KarmicTailDetails } from '../services/karmicTailUtils';

interface MatrixVisualProps {
  matrix: MatrixNumbers;
  userInput: UserInput | null;
  onOpenGuide?: () => void;
}

type MatrixPosition = 'day' | 'month' | 'year' | 'bottom' | 'center' | 'karmic_mid' | 'karmic_in';

const POSITION_TITLES: Record<MatrixPosition, string> = {
  day: "Личность (Портрет)",
  month: "Талант (Высшая Суть)",
  year: "Материя и Здоровье",
  bottom: "Кармический Хвост (Главный Урок)",
  center: "Зона Комфорта (Душа)",
  karmic_mid: "Кармический Хвост (Связующий Узел)",
  karmic_in: "Кармический Хвост (Вход в Отношения и Деньги)"
};

const MatrixVisual: React.FC<MatrixVisualProps> = ({ matrix, userInput, onOpenGuide }) => {
  const [activePoint, setActivePoint] = useState<{ id: MatrixPosition; value: number } | null>(null);
  const [animatingId, setAnimatingId] = useState<MatrixPosition | null>(null); // For 3D Pop animation
  const [details, setDetails] = useState<EnergyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isKarmicModalOpen, setIsKarmicModalOpen] = useState(false);
  
  // Audio State
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Compute Karmic Tail Triad and Details
  const karmicTriad = calculateKarmicTailTriad(matrix);
  const [dBottom, dMid, dIn] = karmicTriad;
  const karmicTailInfo = getKarmicTailDetails(matrix);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handlePointClick = async (id: MatrixPosition, value: number) => {
    // 1. Trigger Animation
    setAnimatingId(id);
    stopAudio();

    // 2. Wait for animation "pop" before opening modal (400ms delay)
    setTimeout(() => {
        setAnimatingId(null);
        setActivePoint({ id, value });
        setDetails(null);
        setError(null);
        
        if (userInput) {
          setIsLoading(true);
          getEnergyAnalysis(POSITION_TITLES[id], value, userInput.gender)
            .then(data => setDetails(data))
            .catch(e => {
              console.error("Failed to fetch details", e);
              setError(e.message || "Не удалось загрузить информацию");
            })
            .finally(() => setIsLoading(false));
        }
    }, 400);
  };

  const closeInfo = () => {
    setActivePoint(null);
    setDetails(null);
    stopAudio();
  };

  const playAudio = async () => {
    if (!details) return;
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsAudioLoading(true);
    setAudioError(null);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const textToSpeak = `Энергия ${activePoint?.value}. ${details.general}. Совет Chubuk: ${details.advice}`;
      // Use default 'Kore' voice for visual interaction
      const base64Audio = await getSpeech(textToSpeak, 'Kore');
      const buffer = await decodeAudioData(base64Audio, ctx);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      
      sourceRef.current = source;
      setIsPlaying(true);

    } catch (e: any) {
      console.error("Audio playback error", e);
      const errorMsg = e.message || "";
      if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        setAudioError("Голос Оракула временно перегружен. Пожалуйста, попробуйте через минуту.");
      } else {
        setAudioError("Не удалось воспроизвести аудио. Попробуйте еще раз.");
      }
      setIsPlaying(false);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch (e) {
        // Ignore
      }
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto flex flex-col items-center animate-fade-in group print:my-4">
      
      {/* 3D Tilt SVG Container with 1:1 Aspect Ratio */}
      <div className="relative w-full max-w-[400px] aspect-square mx-auto flex items-center justify-center p-1 sm:p-2">
        <div className="w-full h-full transition-transform duration-500" style={{ transformStyle: 'preserve-3d' }}>
          <svg viewBox="-30 -30 460 460" className="w-full h-full drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)] overflow-visible print:drop-shadow-none">
            <defs>
              {/* 3D Sphere Gradients */}
              <radialGradient id="sphereGold" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#b45309" />
              </radialGradient>
              <radialGradient id="spherePurple" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#e9d5ff" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#581c87" />
              </radialGradient>
              <radialGradient id="sphereRed" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#fecaca" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </radialGradient>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <filter id="hoverGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            <style>{`
              .pop-effect {
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                transform-box: fill-box;
                transform-origin: center;
              }
              .pop-active {
                transform: scale(1.35) translateZ(40px);
                filter: brightness(1.2);
              }
            `}</style>

            {/* Background Geometry */}
            <rect x="50" y="50" width="300" height="300" transform="rotate(45 200 200)" fill="none" strokeWidth="1" className="stroke-white/20 print:stroke-black" />
            <rect x="50" y="50" width="300" height="300" fill="none" strokeWidth="1" className="stroke-white/10 print:stroke-black" />

            {/* Connecting Lines with Glow */}
            <g className="stroke-amber-500/40 print:stroke-black" strokeWidth="1.5" filter="url(#glow)">
              <line x1="200" y1="20" x2="200" y2="380" />
              <line x1="20" y1="200" x2="380" y2="200" />
              <line x1="72" y1="72" x2="328" y2="328" />
              <line x1="328" y1="72" x2="72" y2="328" />
            </g>

            {/* --- Karmic Tail Segment Visualizer --- */}
            <g className="karmic-tail-track">
              {/* Glowing connecting ribbon for the 3 lower arcana */}
              <path 
                d="M 200 350 L 200 255" 
                stroke="url(#sphereRed)" 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeDasharray="4 2"
                className="opacity-60 animate-pulse" 
              />
              {/* Karmic Tail Bracket */}
              <path 
                d="M 225 350 Q 235 305 225 255" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="1.5" 
                strokeDasharray="2 2"
                className="opacity-70"
              />
              <text x="240" y="305" dy="0.35em" fontSize="9" fontWeight="bold" className="fill-red-400 font-serif tracking-wider uppercase">Хвост</text>
            </g>

            {/* --- Interactive 3D Spheres --- */}

            {/* Central (Comfort Zone) */}
            <g 
              onClick={() => handlePointClick('center', matrix.center)} 
              className={`cursor-pointer group/node pop-effect ${animatingId === 'center' ? 'pop-active' : ''}`}
            >
              {/* Pulsing Aura */}
              <circle cx="200" cy="200" r="35" className="fill-amber-500/20 blur-md group-hover/node:fill-amber-500/50 transition-all duration-300 group-hover/node:animate-pulse" />
              <circle cx="200" cy="200" r="45" className="fill-transparent stroke-amber-500/10 stroke-1 group-hover/node:stroke-amber-500/40 group-hover/node:scale-110 transition-all duration-500" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
              
              {/* Core Sphere */}
              <circle cx="200" cy="200" r="28" className="fill-[url(#sphereGold)] shadow-inner print:fill-white print:stroke-black print:stroke-2 group-hover/node:filter-url(#hoverGlow)" />
              <text x="200" y="200" dy="0.35em" textAnchor="middle" fontSize="18" fontWeight="bold" fontFamily="Cinzel" className="fill-amber-950 shadow-sm print:fill-black pointer-events-none">{matrix.center}</text>
            </g>

            {/* Top (Month) */}
            <g 
              onClick={() => handlePointClick('month', matrix.month)}
              className={`cursor-pointer group/node hover:scale-110 pop-effect ${animatingId === 'month' ? 'pop-active' : ''}`}
            >
              <circle cx="200" cy="50" r="25" className="fill-purple-500/20 blur-md group-hover/node:fill-purple-500/40 group-hover/node:animate-pulse" />
              <circle cx="200" cy="50" r="22" className="fill-[url(#spherePurple)] print:fill-white print:stroke-black print:stroke-2 group-hover/node:filter-url(#hoverGlow)" />
              <text x="200" y="50" dy="0.35em" textAnchor="middle" fontSize="14" fontWeight="bold" className="fill-purple-950 print:fill-black pointer-events-none">{matrix.month}</text>
              <text x="200" y="16" textAnchor="middle" fontSize="10" className="uppercase tracking-widest font-bold fill-[#a855f7] print:fill-black opacity-80 sm:opacity-0 group-hover/node:opacity-100 transition-opacity translate-y-0 duration-300">Талант</text>
            </g>

            {/* Right (Year) */}
            <g 
              onClick={() => handlePointClick('year', matrix.year)}
              className={`cursor-pointer group/node hover:scale-110 pop-effect ${animatingId === 'year' ? 'pop-active' : ''}`}
            >
              <circle cx="350" cy="200" r="25" className="fill-red-500/20 blur-md group-hover/node:fill-red-500/40 group-hover/node:animate-pulse" />
              <circle cx="350" cy="200" r="22" className="fill-[url(#sphereRed)] print:fill-white print:stroke-black print:stroke-2 group-hover/node:filter-url(#hoverGlow)" />
              <text x="350" y="200" dy="0.35em" textAnchor="middle" fontSize="14" fontWeight="bold" className="fill-red-950 print:fill-black pointer-events-none">{matrix.year}</text>
              <text x="350" y="238" textAnchor="middle" fontSize="10" className="uppercase tracking-widest font-bold fill-[#ef4444] print:fill-black opacity-80 sm:opacity-0 group-hover/node:opacity-100 transition-opacity translate-y-0 duration-300">Материя</text>
            </g>

            {/* Left (Day) */}
            <g 
              onClick={() => handlePointClick('day', matrix.day)}
              className={`cursor-pointer group/node hover:scale-110 pop-effect ${animatingId === 'day' ? 'pop-active' : ''}`}
            >
              <circle cx="50" cy="200" r="25" className="fill-purple-500/20 blur-md group-hover/node:fill-purple-500/40 group-hover/node:animate-pulse" />
              <circle cx="50" cy="200" r="22" className="fill-[url(#spherePurple)] print:fill-white print:stroke-black print:stroke-2 group-hover/node:filter-url(#hoverGlow)" />
              <text x="50" y="200" dy="0.35em" textAnchor="middle" fontSize="14" fontWeight="bold" className="fill-purple-950 print:fill-black pointer-events-none">{matrix.day}</text>
              <text x="50" y="165" textAnchor="middle" fontSize="10" className="uppercase tracking-widest font-bold fill-[#a855f7] print:fill-black opacity-80 sm:opacity-0 group-hover/node:opacity-100 transition-opacity translate-y-0 duration-300">Я</text>
            </g>

            {/* --- Karmic Tail Nodes (Three Lower Arcana) --- */}

            {/* 1. Karmic Inflow Node D2 (Entrance to Money/Love) */}
            <g 
              onClick={() => handlePointClick('karmic_in', dIn)}
              className={`cursor-pointer group/node hover:scale-110 pop-effect ${animatingId === 'karmic_in' ? 'pop-active' : ''}`}
            >
              <circle cx="200" cy="255" r="16" className="fill-rose-950 stroke-rose-500 stroke-1 shadow-md group-hover/node:fill-rose-900 group-hover/node:stroke-rose-400 transition-all" />
              <text x="200" y="255" dy="0.35em" textAnchor="middle" fontSize="11" fontWeight="bold" className="fill-rose-200 pointer-events-none">{dIn}</text>
              <text x="175" y="255" dy="0.35em" textAnchor="end" fontSize="8" className="fill-rose-400/80 uppercase font-mono tracking-tight opacity-0 group-hover/node:opacity-100 transition-opacity">Вход</text>
            </g>

            {/* 2. Karmic Mid Node D1 (Intermediate Karmic Node) */}
            <g 
              onClick={() => handlePointClick('karmic_mid', dMid)}
              className={`cursor-pointer group/node hover:scale-110 pop-effect ${animatingId === 'karmic_mid' ? 'pop-active' : ''}`}
            >
              <circle cx="200" cy="305" r="18" className="fill-rose-900 stroke-red-500 stroke-1.5 shadow-md group-hover/node:fill-rose-800 group-hover/node:stroke-red-400 transition-all" />
              <text x="200" y="305" dy="0.35em" textAnchor="middle" fontSize="12" fontWeight="bold" className="fill-rose-100 pointer-events-none">{dMid}</text>
              <text x="172" y="305" dy="0.35em" textAnchor="end" fontSize="8" className="fill-rose-400/80 uppercase font-mono tracking-tight opacity-0 group-hover/node:opacity-100 transition-opacity">Узел</text>
            </g>

            {/* 3. Karmic Bottom Node D (Main Past Life Debt) */}
            <g 
              onClick={() => handlePointClick('bottom', matrix.bottom)}
              className={`cursor-pointer group/node hover:scale-110 pop-effect ${animatingId === 'bottom' ? 'pop-active' : ''}`}
            >
              <circle cx="200" cy="355" r="24" className="fill-red-500/20 blur-md group-hover/node:fill-red-500/40 group-hover/node:animate-pulse" />
              <circle cx="200" cy="355" r="21" className="fill-[url(#sphereRed)] print:fill-white print:stroke-black print:stroke-2 group-hover/node:filter-url(#hoverGlow)" />
              <text x="200" y="355" dy="0.35em" textAnchor="middle" fontSize="14" fontWeight="bold" className="fill-red-950 print:fill-black pointer-events-none">{matrix.bottom}</text>
              <text x="200" y="394" textAnchor="middle" fontSize="10" className="uppercase tracking-widest font-bold fill-[#ef4444] print:fill-black opacity-80 sm:opacity-0 group-hover/node:opacity-100 transition-opacity translate-y-0 duration-300">Основа</text>
            </g>

          </svg>
        </div>
      </div>

      {/* Karmic Tail Sacred Visual Banner & Summary */}
      <div className="mt-4 w-full rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-rose-950/40 border border-rose-500/30 p-4 shadow-lg backdrop-blur-md no-print">
        <div className="flex items-center justify-between gap-3 mb-2.5 pb-2.5 border-b border-rose-500/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Flame size={16} />
            </div>
            <div>
              <span className="text-xs font-serif font-bold text-white tracking-wide block">
                Кармический Хвост (Три Нижних Аркана)
              </span>
              <span className="text-[10px] text-rose-300/80 font-mono">
                Код души: {karmicTailInfo.code}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsKarmicModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-serif font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>Разбор</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* 3 Lower Arcana Badges */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div 
            onClick={() => handlePointClick('bottom', dBottom)}
            className="p-2 rounded-xl bg-black/40 border border-red-500/30 hover:border-red-400 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-102"
          >
            <span className="text-[9px] uppercase font-bold text-red-400 mb-0.5">Основа (D)</span>
            <span className="text-base font-serif font-black text-red-200">{dBottom}</span>
            <span className="text-[9px] text-slate-300 truncate w-full">{ARCANA_SHORT_NAMES[dBottom] || `Аркан ${dBottom}`}</span>
          </div>

          <div 
            onClick={() => handlePointClick('karmic_mid', dMid)}
            className="p-2 rounded-xl bg-black/40 border border-rose-500/30 hover:border-rose-400 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-102"
          >
            <span className="text-[9px] uppercase font-bold text-rose-400 mb-0.5">Узел (D1)</span>
            <span className="text-base font-serif font-black text-rose-200">{dMid}</span>
            <span className="text-[9px] text-slate-300 truncate w-full">{ARCANA_SHORT_NAMES[dMid] || `Аркан ${dMid}`}</span>
          </div>

          <div 
            onClick={() => handlePointClick('karmic_in', dIn)}
            className="p-2 rounded-xl bg-black/40 border border-purple-500/30 hover:border-purple-400 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-102"
          >
            <span className="text-[9px] uppercase font-bold text-purple-400 mb-0.5">Вход (D2)</span>
            <span className="text-base font-serif font-black text-purple-200">{dIn}</span>
            <span className="text-[9px] text-slate-300 truncate w-full">{ARCANA_SHORT_NAMES[dIn] || `Аркан ${dIn}`}</span>
          </div>
        </div>

        {/* Short Textual Meaning for User */}
        <div className="space-y-1.5 text-xs">
          <p className="font-serif font-bold text-rose-200 text-xs">
            ✨ {karmicTailInfo.title}
          </p>
          <p className="text-slate-300 text-[11px] leading-relaxed font-light line-clamp-2">
            {karmicTailInfo.pastLifeStory}
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-rose-300/90">
            <span className="truncate">🔑 Ключ в плюс: {karmicTailInfo.unlockKeys[0]}</span>
            <button 
              onClick={() => setIsKarmicModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 underline font-medium shrink-0 ml-2"
            >
              Читать полностью
            </button>
          </div>
        </div>
      </div>

      {/* Onboarding Guide Trigger Banner */}
      {onOpenGuide && (
        <div className="mt-3 flex items-center justify-center no-print">
          <button
            onClick={onOpenGuide}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 hover:from-amber-500/25 hover:to-amber-500/25 border border-amber-500/30 hover:border-amber-400/50 text-amber-300 text-xs font-serif font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer group"
            title="Открыть пошаговое интерактивное руководство по Матрице"
          >
            <Compass size={14} className="text-amber-400 group-hover:rotate-45 transition-transform" />
            <span>Как читать значения Матрицы?</span>
          </button>
        </div>
      )}

      {/* Dedicated Karmic Tail In-Depth Modal */}
      {isKarmicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in no-print perspective-1000">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" 
            onClick={() => setIsKarmicModalOpen(false)}
          />
          
          <div className="relative card-3d w-full max-w-xl rounded-3xl overflow-hidden flex flex-col max-h-[88vh] animate-float shadow-2xl shadow-rose-950/40 border border-rose-500/40 bg-[#0b0e1b]">
            
            {/* Header */}
            <div className="p-6 border-b border-rose-500/20 bg-gradient-to-r from-rose-950/60 via-purple-950/40 to-transparent flex justify-between items-start shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold">
                    КАРМИЧЕСКИЙ ХВОСТ: {karmicTailInfo.code}
                  </span>
                  <span className="text-slate-400 text-xs font-serif">3 нижних аркана</span>
                </div>
                <h3 className="text-lg md:text-xl font-serif font-bold text-white">
                  {karmicTailInfo.title}
                </h3>
                <p className="text-xs text-rose-300/80 font-sans mt-0.5">
                  {karmicTailInfo.subtitle}
                </p>
              </div>

              <button 
                onClick={() => setIsKarmicModalOpen(false)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all transform hover:rotate-90"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/40 text-sm">
              
              {/* 3 Arcana Visual Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-b from-rose-950/50 to-black/50 border border-red-500/30 text-center">
                  <span className="text-[10px] text-red-400 font-bold uppercase block mb-1">Базовый долг (D)</span>
                  <div className="w-10 h-10 mx-auto rounded-xl bg-red-500/20 text-red-200 font-serif font-black text-lg flex items-center justify-center border border-red-500/40 mb-1">
                    {dBottom}
                  </div>
                  <span className="text-xs font-medium text-white block">{ARCANA_SHORT_NAMES[dBottom]}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Корень кармы</span>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-b from-rose-950/50 to-black/50 border border-rose-500/30 text-center">
                  <span className="text-[10px] text-rose-400 font-bold uppercase block mb-1">Узел характера (D1)</span>
                  <div className="w-10 h-10 mx-auto rounded-xl bg-rose-500/20 text-rose-200 font-serif font-black text-lg flex items-center justify-center border border-rose-500/40 mb-1">
                    {dMid}
                  </div>
                  <span className="text-xs font-medium text-white block">{ARCANA_SHORT_NAMES[dMid]}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Эмоциональный блок</span>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-b from-rose-950/50 to-black/50 border border-purple-500/30 text-center">
                  <span className="text-[10px] text-purple-400 font-bold uppercase block mb-1">Вход в блага (D2)</span>
                  <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/20 text-purple-200 font-serif font-black text-lg flex items-center justify-center border border-purple-500/40 mb-1">
                    {dIn}
                  </div>
                  <span className="text-xs font-medium text-white block">{ARCANA_SHORT_NAMES[dIn]}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Ключ к деньгам и любви</span>
                </div>
              </div>

              {/* Past Life Story */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-rose-400" />
                  Память Прошлых Воплощений (Откуда пришел хвост)
                </h4>
                <p className="text-slate-300 font-light leading-relaxed">
                  {karmicTailInfo.pastLifeStory}
                </p>
                <p className="text-xs text-rose-200/90 pt-1 font-medium">
                  📌 Главный кармический долг: {karmicTailInfo.karmicDebt}
                </p>
              </div>

              {/* Triggers in This Life */}
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-red-400" />
                  Как проявляется в минусе и основные триггеры
                </h4>
                <p className="text-slate-300 font-light leading-relaxed">
                  {karmicTailInfo.negativeManifestation}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {karmicTailInfo.triggers.map((trig, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-black/40 border border-red-500/20 text-[11px] text-red-200">
                      • {trig}
                    </div>
                  ))}
                </div>
              </div>

              {/* Keys to Plus State */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Ключи к выводу кармического хвоста в плюс
                </h4>
                <p className="text-slate-300 font-light leading-relaxed">
                  {karmicTailInfo.positiveManifestation}
                </p>
                <div className="space-y-1.5 pt-1">
                  {karmicTailInfo.unlockKeys.map((keyStep, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-black/40 border border-emerald-500/20 text-xs text-emerald-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span>{keyStep}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sacred Affirmation */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest">
                  Сакральная Аффирмация Исцеления Кармы
                </span>
                <p className="font-serif italic text-amber-100 text-sm">
                  «{karmicTailInfo.affirmation}»
                </p>
              </div>

            </div>

          </div>
        </div>
      )}
      
      {/* Expanded Info Modal - Glassmorphism Style */}
      {activePoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in no-print perspective-1000">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
            onClick={closeInfo}
          ></div>
          
          <div className="relative card-3d w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[85vh] animate-float shadow-2xl shadow-amber-500/10" style={{ animationDuration: '8s' }}>
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-start shrink-0 bg-gradient-to-r from-black/40 to-transparent">
              <div>
                <p className="text-amber-500 text-xs uppercase tracking-[0.2em] mb-1 font-bold">
                  {POSITION_TITLES[activePoint.id]}
                </p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-black font-bold text-xl shadow-lg ring-2 ring-amber-500/30">
                     {activePoint.value}
                   </div>
                   <span className="text-slate-300 text-sm font-light">Аркан Судьбы</span>
                </div>
              </div>
              <button 
                onClick={closeInfo} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all transform hover:rotate-90"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/40">
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative w-16 h-16">
                     <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
                     <div className="absolute inset-4 bg-amber-500/20 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-amber-500/80 animate-pulse text-sm uppercase tracking-widest font-bold">Анализ Chubuk...</p>
                </div>
              ) : details ? (
                <>
                  {/* Audio Player Card */}
                  <div className="bg-gradient-to-r from-amber-900/40 to-transparent p-5 rounded-2xl border border-amber-500/20 flex items-center justify-between gap-4 group hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={playAudio}
                        disabled={isAudioLoading}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                          isPlaying 
                            ? 'bg-amber-500 text-black shadow-amber-500/40 scale-105' 
                            : 'bg-white/10 text-amber-400 hover:bg-amber-500 hover:text-black hover:scale-105'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isAudioLoading ? (
                           <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                        ) : isPlaying ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                        ) : (
                          <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                      </button>
                      <div className="flex flex-col">
                        <span className="text-amber-100 font-bold text-sm tracking-wide">Голос Chubuk</span>
                        <span className="text-slate-500 text-xs">{isPlaying ? 'Трансляция потока...' : 'Слушать интерпретацию'}</span>
                      </div>
                    </div>
                    
                    {/* Visualizer Animation */}
                    {isPlaying && (
                      <div className="flex items-end gap-1 h-8">
                        <div className="w-1 bg-amber-500 rounded-t animate-[bounce_1s_infinite] h-[40%]"></div>
                        <div className="w-1 bg-amber-500 rounded-t animate-[bounce_1.2s_infinite] h-[70%]"></div>
                        <div className="w-1 bg-amber-500 rounded-t animate-[bounce_0.8s_infinite] h-[50%]"></div>
                        <div className="w-1 bg-amber-500 rounded-t animate-[bounce_1.1s_infinite] h-[80%]"></div>
                        <div className="w-1 bg-amber-500 rounded-t animate-[bounce_0.9s_infinite] h-[60%]"></div>
                      </div>
                    )}
                  </div>

                  {audioError && (
                    <div className="text-center text-amber-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                      {audioError}
                    </div>
                  )}

                  <div className="space-y-6 text-sm md:text-base">
                    <div>
                      <h4 className="text-lg font-serif text-white mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
                        Суть Энергии
                      </h4>
                      <p className="text-slate-300 leading-relaxed font-light">
                        {details.general}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-gradient-to-br from-green-900/20 to-transparent p-5 rounded-xl border-l-2 border-green-500 backdrop-blur-sm">
                        <h4 className="text-green-400 font-bold uppercase text-xs mb-2 tracking-widest flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          В Плюсе
                        </h4>
                        <p className="text-slate-300 leading-relaxed">{details.positive}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-red-900/20 to-transparent p-5 rounded-xl border-l-2 border-red-500 backdrop-blur-sm">
                        <h4 className="text-red-400 font-bold uppercase text-xs mb-2 tracking-widest flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          В Минусе
                        </h4>
                        <p className="text-slate-300 leading-relaxed">{details.negative}</p>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-xl relative overflow-hidden shadow-inner">
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                         <svg className="w-16 h-16 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                       </div>
                       <h4 className="text-amber-400 font-serif mb-2 flex items-center gap-2">
                         Совет от Chubuk
                       </h4>
                       <p className="text-amber-100/90 italic font-medium relative z-10">
                         "{details.advice}"
                       </p>
                    </div>
                  </div>
                </>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-400 mb-2">
                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {error}
                  </div>
                  <button 
                    onClick={() => activePoint && handlePointClick(activePoint.id, activePoint.value)}
                    className="text-xs text-amber-500 hover:text-amber-400 underline uppercase tracking-widest"
                  >
                    Попробовать снова
                  </button>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  Информация недоступна.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatrixVisual;