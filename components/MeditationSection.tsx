import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Sparkles, 
  Heart, 
  Moon, 
  CloudRain, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Sliders, 
  Clock, 
  CheckCircle2, 
  DownloadCloud, 
  Wind, 
  Activity, 
  Headphones, 
  Sun,
  Shield,
  VolumeX,
  Compass
} from 'lucide-react';
import { UserInput, MatrixNumbers } from '../types';
import { ambientSound, SOUNDSCAPE_PRESETS, SoundscapePreset } from '../services/ambientSoundEngine';
import { ARCANA_DATA } from '../services/numerologyUtils';

interface MeditationSectionProps {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
  onTriggerHaptic?: (ms?: number) => void;
}

type BreathingTechnique = '478' | 'box' | 'balance';

interface BreathingPhaseConfig {
  name: string;
  duration: number; // in seconds
  action: 'inhale' | 'hold' | 'exhale' | 'hold_empty';
  instruction: string;
  color: string;
}

const BREATHING_PRESETS: Record<BreathingTechnique, {
  name: string;
  subtitle: string;
  goal: string;
  phases: BreathingPhaseConfig[];
}> = {
  '478': {
    name: 'Техника 4-7-8',
    subtitle: 'Антистресс & Погружение в сон',
    goal: 'Мгновенно успокаивает нервную систему, замедляет пульс и снимает тревожность.',
    phases: [
      { name: 'Вдох носом', duration: 4, action: 'inhale', instruction: 'Глубокий спокойный вдох через нос', color: 'from-amber-400 to-amber-600' },
      { name: 'Задержка', duration: 7, action: 'hold', instruction: 'Удерживайте воздух в легких в покое', color: 'from-purple-400 to-indigo-600' },
      { name: 'Выдох ртом', duration: 8, action: 'exhale', instruction: 'Плавный протяжный выдох со звуком', color: 'from-blue-400 to-cyan-600' }
    ]
  },
  'box': {
    name: 'Квадратное Дыхание (Box 4-4-4-4)',
    subtitle: 'Концентрация & Сила Воли',
    goal: 'Техника спецназа и йогов для железного фокуса, ясности мысли и эмоционального баланса.',
    phases: [
      { name: 'Вдох', duration: 4, action: 'inhale', instruction: 'Наполняйте живот и грудь воздухом', color: 'from-emerald-400 to-teal-600' },
      { name: 'Задержка', duration: 4, action: 'hold', instruction: 'Фиксация полного объема легких', color: 'from-amber-400 to-orange-500' },
      { name: 'Выдох', duration: 4, action: 'exhale', instruction: 'Равномерный мягкий выдох', color: 'from-blue-400 to-indigo-600' },
      { name: 'Пауза на выдохе', duration: 4, action: 'hold_empty', instruction: 'Покой в абсолютной пустоте', color: 'from-purple-500 to-rose-600' }
    ]
  },
  'balance': {
    name: 'Сакральный Баланс (5-5)',
    subtitle: 'Когерентность Сердца и Мозга',
    goal: 'Приводит сердечный ритм в идеальный резонанс с мозговыми альфа-волнами (6 вдохов в мин).',
    phases: [
      { name: 'Плавный вдох', duration: 5, action: 'inhale', instruction: 'Вдох через нос на 5 счетов', color: 'from-rose-400 to-pink-600' },
      { name: 'Плавный выдох', duration: 5, action: 'exhale', instruction: 'Выдох через нос на 5 счетов', color: 'from-sky-400 to-indigo-600' }
    ]
  }
};

export const MeditationSection: React.FC<MeditationSectionProps> = ({
  userInput,
  matrix,
  onTriggerHaptic
}) => {
  // Navigation sub-tabs
  const [activeTab, setActiveTab] = useState<'soundscape' | 'breathing' | 'arcana_meditation'>('soundscape');

  // Sound Engine State
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string>('campfire_rain_birds');
  const [remainingTimerStr, setRemainingTimerStr] = useState<string | null>(null);
  const [showMixer, setShowMixer] = useState(false);

  // Volume sliders
  const [fireVol, setFireVol] = useState(80);
  const [rainVol, setRainVol] = useState(65);
  const [birdsVol, setBirdsVol] = useState(75);
  const [melodyVol, setMelodyVol] = useState(25);
  const [tibetanVol, setTibetanVol] = useState(0);
  const [solfeggioVol, setSolfeggioVol] = useState(0);
  const [thetaVol, setThetaVol] = useState(0);
  const [windVol, setWindVol] = useState(20);

  // Precaching status
  const [isPrecached, setIsPrecached] = useState(false);
  const [isPrecaching, setIsPrecaching] = useState(false);
  const [precacheToast, setPrecacheToast] = useState<string | null>(null);

  // --- Breathing Pranayama State ---
  const [breathingTech, setBreathingTech] = useState<BreathingTechnique>('478');
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [breathingCyclesCompleted, setBreathingCyclesCompleted] = useState(0);

  // --- Meditation Session Stats ---
  const [totalMinutesMeditated, setTotalMinutesMeditated] = useState(() => {
    try {
      return Number(localStorage.getItem('chubuk_meditation_minutes') || '15');
    } catch {
      return 15;
    }
  });

  // Track sound engine status
  useEffect(() => {
    const unsub = ambientSound.onOfflineStatusChange((status) => {
      setIsPrecached(status.isPrecached);
    });

    const interval = setInterval(() => {
      const state = ambientSound.getState();
      setIsPlayingSound(state.isPlaying);
      if (state.timerEndsAt && state.isPlaying) {
        const diff = Math.max(0, state.timerEndsAt - Date.now());
        if (diff === 0) {
          setRemainingTimerStr(null);
        } else {
          const m = Math.floor(diff / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setRemainingTimerStr(`${m}:${s < 10 ? '0' : ''}${s}`);
        }
      } else {
        setRemainingTimerStr(null);
      }
    }, 1000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  // Sync volume states on mount
  useEffect(() => {
    const state = ambientSound.getState();
    setIsPlayingSound(state.isPlaying);
    setFireVol(Math.round(state.fireVolume * 100));
    setRainVol(Math.round(state.rainVolume * 100));
    setBirdsVol(Math.round(state.birdsVolume * 100));
    setMelodyVol(Math.round(state.melodyVolume * 100));
    setTibetanVol(Math.round(state.tibetanVolume * 100));
    setSolfeggioVol(Math.round(state.solfeggioVolume * 100));
    setThetaVol(Math.round(state.thetaVolume * 100));
    setWindVol(Math.round(state.windVolume * 100));
  }, []);

  // --- Breathing Timer Loop ---
  useEffect(() => {
    if (!isBreathingActive) return;

    const preset = BREATHING_PRESETS[breathingTech];
    const currentPhase = preset.phases[currentPhaseIndex];

    const timer = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          // Switch to next phase
          const nextIndex = (currentPhaseIndex + 1) % preset.phases.length;
          if (nextIndex === 0) {
            setBreathingCyclesCompleted((c) => c + 1);
            // Save minute increment
            const newTotal = totalMinutesMeditated + 1;
            setTotalMinutesMeditated(newTotal);
            try {
              localStorage.setItem('chubuk_meditation_minutes', String(newTotal));
            } catch {}
          }
          setCurrentPhaseIndex(nextIndex);
          onTriggerHaptic?.(25);
          return preset.phases[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathingActive, breathingTech, currentPhaseIndex, totalMinutesMeditated, onTriggerHaptic]);

  const handleToggleBreathing = () => {
    onTriggerHaptic?.(15);
    if (!isBreathingActive) {
      const preset = BREATHING_PRESETS[breathingTech];
      setCurrentPhaseIndex(0);
      setPhaseSecondsLeft(preset.phases[0].duration);
      setIsBreathingActive(true);
    } else {
      setIsBreathingActive(false);
    }
  };

  const handleSelectBreathingTech = (tech: BreathingTechnique) => {
    onTriggerHaptic?.(10);
    setBreathingTech(tech);
    setIsBreathingActive(false);
    setCurrentPhaseIndex(0);
    setPhaseSecondsLeft(BREATHING_PRESETS[tech].phases[0].duration);
  };

  const handleSelectPreset = (preset: SoundscapePreset) => {
    onTriggerHaptic?.(12);
    setActivePresetId(preset.id);
    ambientSound.loadPreset(preset);
    setFireVol(preset.fire);
    setRainVol(preset.rain);
    setBirdsVol(preset.birds);
    setMelodyVol(preset.melody);
    setTibetanVol(preset.tibetan432);
    setSolfeggioVol(preset.solfeggio528);
    setThetaVol(preset.thetaWaves);
    setWindVol(preset.wind);
    if (!isPlayingSound) {
      ambientSound.start();
      setIsPlayingSound(true);
    }
  };

  const toggleSoundPlay = () => {
    onTriggerHaptic?.(15);
    if (isPlayingSound) {
      ambientSound.stop();
      setIsPlayingSound(false);
    } else {
      ambientSound.start();
      setIsPlayingSound(true);
    }
  };

  const handleSetTimer = (minutes: number) => {
    onTriggerHaptic?.(10);
    ambientSound.setTimer(minutes);
    if (!isPlayingSound) {
      ambientSound.start();
      setIsPlayingSound(true);
    }
  };

  const handleClearTimer = () => {
    onTriggerHaptic?.(10);
    ambientSound.clearTimer();
  };

  const handlePrecache = async () => {
    onTriggerHaptic?.(10);
    setIsPrecaching(true);
    const res = await ambientSound.precacheSoundscapesToServiceWorker();
    setIsPrecaching(false);
    if (res.success) {
      setIsPrecached(true);
      setPrecacheToast(`Сохранено ${res.count} ландшафтов в память устройства!`);
      setTimeout(() => setPrecacheToast(null), 4000);
    }
  };

  // User's Core Arcana for Personalized Meditation
  const coreArcana = matrix?.center || matrix?.day || 1;
  const coreArcanaInfo = ARCANA_DATA[coreArcana] || ARCANA_DATA[1];

  const currentBreathingPhase = BREATHING_PRESETS[breathingTech].phases[currentPhaseIndex];
  const phaseProgress = 1 - phaseSecondsLeft / currentBreathingPhase.duration;

  return (
    <div className="w-full space-y-6 animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-r from-[#180e07] via-[#120a05] to-[#0a0502] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-serif font-bold uppercase tracking-wider border border-amber-500/30">
                Сакральное Святилище
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono">
                432 Гц • 528 Гц • Пранаяма
              </span>
              {isPrecached && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center gap-1">
                  <CheckCircle2 size={11} /> Офлайн
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-amber-100 flex items-center gap-3">
              <Flame className="text-amber-400 animate-pulse" />
              Медитация, Звукотерапия & Пранаяма
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-light leading-relaxed">
              Погрузитесь в сакральное состояние гармонии с помощью процедурной звукотерапии, частот исцеления биополя и осознанных дыхательных ритмов.
            </p>
          </div>

          {/* Quick Stats & Master Play */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Практик</span>
              <span className="text-lg font-serif font-bold text-amber-300">{totalMinutesMeditated} мин</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSoundPlay}
              className={`p-4 rounded-2xl flex items-center gap-2.5 font-serif font-bold text-sm shadow-xl transition-all cursor-pointer ${
                isPlayingSound
                  ? 'bg-amber-500 text-black shadow-amber-500/30'
                  : 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-amber-500/20 hover:brightness-110'
              }`}
            >
              {isPlayingSound ? (
                <>
                  <Pause size={18} />
                  <span>Пауза</span>
                </>
              ) : (
                <>
                  <Play size={18} className="fill-black" />
                  <span>Включить Звук</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              onTriggerHaptic?.(8);
              setActiveTab('soundscape');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'soundscape'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Headphones size={15} />
            <span>Звуковые Частоты (432/528 Гц)</span>
          </button>

          <button
            onClick={() => {
              onTriggerHaptic?.(8);
              setActiveTab('breathing');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'breathing'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Wind size={15} />
            <span>Дыхание (Пранаяма)</span>
          </button>

          <button
            onClick={() => {
              onTriggerHaptic?.(8);
              setActiveTab('arcana_meditation');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'arcana_meditation'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Sparkles size={15} />
            <span>Медитация на Аркан Души ({coreArcana})</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: SOUNDSCAPE & 432 HZ FREQUENCIES --- */}
      {activeTab === 'soundscape' && (
        <div className="space-y-6">
          {/* Active Preset Status Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-black/60 to-purple-950/40 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                isPlayingSound
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
                  : 'bg-black/60 border-white/10 text-slate-400'
              }`}>
                <Flame size={28} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400/90 block">
                  Текущий сакральный поток
                </span>
                <h3 className="text-lg font-serif font-bold text-white">
                  {SOUNDSCAPE_PRESETS.find(p => p.id === activePresetId)?.name || 'Сакральный Ландшафт'}
                </h3>
                <p className="text-xs text-slate-400 font-light">
                  {SOUNDSCAPE_PRESETS.find(p => p.id === activePresetId)?.description}
                </p>
              </div>
            </div>

            {/* Timer & Caching Action */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              {remainingTimerStr ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono">
                  <Clock size={13} />
                  <span>Таймер: {remainingTimerStr}</span>
                  <button onClick={handleClearTimer} className="hover:text-white ml-1 text-xs">✕</button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Таймер:</span>
                  {[10, 20, 45].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleSetTimer(m)}
                      className="px-2.5 py-1 rounded-lg bg-black/50 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/30 text-[11px] font-mono text-slate-300 transition-all cursor-pointer"
                    >
                      {m}м
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handlePrecache}
                disabled={isPrecaching}
                className="px-3 py-1.5 rounded-xl bg-black/50 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Сохранить звуки в кэш Service Worker для игры офлайн"
              >
                <DownloadCloud size={13} />
                <span>{isPrecached ? 'Офлайн SW' : 'Кэш'}</span>
              </button>
            </div>
          </div>

          {precacheToast && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-serif text-center">
              {precacheToast}
            </div>
          )}

          {/* Soundscape Presets Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Выберите целебный звуковой ландшафт:
              </h3>
              <button
                onClick={() => setShowMixer(!showMixer)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Sliders size={13} />
                <span>{showMixer ? 'Скрыть микшер слоев' : 'Настроить слои частот'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SOUNDSCAPE_PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-500/20 via-black/80 to-purple-950/30 border-amber-400 text-amber-100 shadow-lg shadow-amber-500/10'
                        : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20 hover:bg-black/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-amber-500/30 text-amber-300' : 'bg-white/5 text-slate-400'}`}>
                            {preset.id.includes('fire') && <Flame size={16} />}
                            {preset.id.includes('tibetan') && <Sparkles size={16} />}
                            {preset.id.includes('solfeggio') && <Heart size={16} />}
                            {preset.id.includes('theta') && <Moon size={16} />}
                            {preset.id.includes('birds') && <CloudRain size={16} />}
                            {preset.id.includes('zen') && <Wind size={16} />}
                          </div>
                          <span className="text-sm font-serif font-bold text-white">{preset.name}</span>
                        </div>
                        {isSelected && isPlayingSound && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-light leading-relaxed mb-3">
                        {preset.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400 font-mono">
                      <span>{preset.tibetan432 > 0 ? '432 Гц' : preset.solfeggio528 > 0 ? '528 Гц' : 'Природа'}</span>
                      <span className={isSelected ? 'text-amber-400 font-bold' : ''}>
                        {isSelected ? (isPlayingSound ? '▶ Играет' : '✓ Выбран') : 'Слушать'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multichannel Volume Mixer */}
          {showMixer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-black/60 border border-amber-500/30 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders size={18} className="text-amber-400" />
                  <h4 className="text-sm font-serif font-bold text-white">Индивидуальный Микшер Частот</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">Синтез в реальном времени</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fire */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-amber-200">
                    <span className="flex items-center gap-1.5"><Flame size={14} className="text-amber-400" /> Костер & Угли</span>
                    <span className="font-mono">{fireVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={fireVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setFireVol(v);
                      ambientSound.setFireVolume(v / 100);
                    }}
                    className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Tibetan 432 Hz */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-purple-200">
                    <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-purple-400" /> Тибетские Чаши (432 Гц)</span>
                    <span className="font-mono">{tibetanVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tibetanVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setTibetanVol(v);
                      ambientSound.setTibetanVolume(v / 100);
                    }}
                    className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Rain */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-blue-200">
                    <span className="flex items-center gap-1.5"><CloudRain size={14} className="text-blue-400" /> Вечерний Дождь</span>
                    <span className="font-mono">{rainVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rainVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setRainVol(v);
                      ambientSound.setRainVolume(v / 100);
                    }}
                    className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Solfeggio 528 Hz */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-rose-200">
                    <span className="flex items-center gap-1.5"><Heart size={14} className="text-rose-400" /> Сольфеджио (528 Гц)</span>
                    <span className="font-mono">{solfeggioVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={solfeggioVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSolfeggioVol(v);
                      ambientSound.setSolfeggioVolume(v / 100);
                    }}
                    className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Birds */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-emerald-200">
                    <span className="flex items-center gap-1.5">🐦 Лесные Птицы</span>
                    <span className="font-mono">{birdsVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={birdsVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setBirdsVol(v);
                      ambientSound.setBirdsVolume(v / 100);
                    }}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Theta Waves */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-cyan-200">
                    <span className="flex items-center gap-1.5"><Moon size={14} className="text-cyan-400" /> Тета-Волны (6 Гц Транс)</span>
                    <span className="font-mono">{thetaVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={thetaVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setThetaVol(v);
                      ambientSound.setThetaVolume(v / 100);
                    }}
                    className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* --- TAB 2: PRANAYAMA BREATHING GUIDE --- */}
      {activeTab === 'breathing' && (
        <div className="space-y-6">
          {/* Technique Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['478', 'box', 'balance'] as BreathingTechnique[]).map((techKey) => {
              const item = BREATHING_PRESETS[techKey];
              const isSelected = breathingTech === techKey;
              return (
                <button
                  key={techKey}
                  onClick={() => handleSelectBreathingTech(techKey)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/20 to-purple-950/40 border-amber-400 text-amber-100 shadow-md'
                      : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-serif font-bold text-white block mb-0.5">{item.name}</span>
                  <span className="text-[11px] text-amber-300/80 font-mono block mb-1.5">{item.subtitle}</span>
                  <p className="text-[11px] text-slate-400 leading-tight">{item.goal}</p>
                </button>
              );
            })}
          </div>

          {/* Interactive Breathing Sphere & Visualizer */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#120a06] via-black/80 to-[#0c0604] border border-amber-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl space-y-6">
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>

            {/* Pulsing Breathing Circle */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Outer guide ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/10 animate-spin-slow"></div>

              {/* Animated scaling circle */}
              <motion.div
                animate={{
                  scale: isBreathingActive
                    ? currentBreathingPhase.action === 'inhale'
                      ? [0.65, 1.1]
                      : currentBreathingPhase.action === 'hold'
                      ? 1.1
                      : currentBreathingPhase.action === 'exhale'
                      ? [1.1, 0.65]
                      : 0.65
                    : 0.85
                }}
                transition={{
                  duration: isBreathingActive ? currentBreathingPhase.duration : 2,
                  ease: 'easeInOut'
                }}
                className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr ${currentBreathingPhase.color} flex flex-col items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.35)] relative`}
              >
                <div className="p-5 text-center text-white select-none">
                  <span className="text-xs font-mono uppercase tracking-widest text-white/80 block mb-1">
                    {isBreathingActive ? currentBreathingPhase.name : 'Готовы к практике?'}
                  </span>
                  <span className="text-4xl sm:text-5xl font-serif font-black block">
                    {isBreathingActive ? phaseSecondsLeft : '🧘'}
                  </span>
                  <span className="text-[11px] text-white/90 font-light block mt-1">
                    {isBreathingActive ? (currentBreathingPhase.action === 'inhale' ? 'Вдох...' : currentBreathingPhase.action === 'exhale' ? 'Выдох...' : 'Задержка') : 'Нажмите Старт'}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Instruction Text */}
            <div className="max-w-md space-y-1">
              <p className="text-sm font-serif font-medium text-amber-200">
                {isBreathingActive ? currentBreathingPhase.instruction : BREATHING_PRESETS[breathingTech].goal}
              </p>
              {isBreathingActive && (
                <span className="text-xs text-slate-400 font-mono block">
                  Завершено циклов: {breathingCyclesCompleted}
                </span>
              )}
            </div>

            {/* Control Button */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleToggleBreathing}
              className={`px-8 py-3.5 rounded-2xl font-serif font-bold text-sm shadow-xl transition-all cursor-pointer flex items-center gap-2 ${
                isBreathingActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 text-black shadow-amber-500/30'
              }`}
            >
              {isBreathingActive ? (
                <>
                  <Pause size={18} />
                  <span>Остановить Дыхание</span>
                </>
              ) : (
                <>
                  <Play size={18} className="fill-black" />
                  <span>Начать Дыхательную Сессию</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}

      {/* --- TAB 3: PERSONAL ARCANA MEDITATION --- */}
      {activeTab === 'arcana_meditation' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/40 via-black/80 to-purple-950/40 border border-amber-500/30 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-serif font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  {coreArcana}
                </div>
                <div>
                  <span className="text-xs uppercase font-mono tracking-widest text-amber-400 block">
                    Медитация на Ведущий Аркан Матрицы
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    Аркан {coreArcana}: {coreArcanaInfo.name}
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono self-start sm:self-auto">
                Энергия: {coreArcanaInfo.energy}
              </span>
            </div>

            {/* Sacred Meditation Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-black/50 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  Визуализация & Настройка
                </h4>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  Закройте глаза. Сделайте 3 глубоких вдоха и выдоха. Представьте золотой луч, входящий через макушку и наполняющий ваше сердце энергией {coreArcanaInfo.name}. Ощутите силу аркана в каждой клетке тела.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/50 border border-purple-500/20 space-y-2">
                <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Heart size={14} className="text-purple-400" />
                  Сакральная Аффирмация
                </h4>
                <p className="text-xs italic font-serif text-purple-100 leading-relaxed">
                  «Я нахожусь в гармонии с Высшим замыслом моей души. Энергия аркана {coreArcanaInfo.name} раскрывает мой истинный потенциал, изобилие и внутренний покой.»
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-300 font-serif text-center sm:text-left">
                Рекомендуется проводить медитацию под звуки Тибетских чаш 432 Гц в течение 10–15 минут.
              </span>
              <button
                onClick={() => {
                  const tibetanPreset = SOUNDSCAPE_PRESETS.find(p => p.id === 'tibetan_432') || SOUNDSCAPE_PRESETS[4];
                  handleSelectPreset(tibetanPreset);
                  handleSetTimer(15);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-serif font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
              >
                <Play size={14} className="fill-black" />
                <span>Запустить 15-мин медитацию</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationSection;
