import React, { useState, useEffect } from 'react';
import { 
  ambientSound, 
  SOUNDSCAPE_PRESETS, 
  SoundscapePreset 
} from '../services/ambientSoundEngine';
import { 
  Flame, 
  CloudRain, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Clock, 
  Sparkles, 
  X, 
  DownloadCloud, 
  CheckCircle2, 
  WifiOff, 
  Radio, 
  Wind, 
  Heart, 
  Moon, 
  Sliders, 
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AmbientSoundTherapy: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string>('campfire_rain');
  
  // Channels
  const [fireVol, setFireVol] = useState(85);
  const [rainVol, setRainVol] = useState(65);
  const [tibetanVol, setTibetanVol] = useState(0);
  const [solfeggioVol, setSolfeggioVol] = useState(0);
  const [thetaVol, setThetaVol] = useState(0);
  const [windVol, setWindVol] = useState(25);
  const [masterVol, setMasterVol] = useState(80);

  const [selectedTimer, setSelectedTimer] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  // Offline SW cache status
  const [isPrecached, setIsPrecached] = useState(false);
  const [isPrecaching, setIsPrecaching] = useState(false);
  const [showAdvancedMixer, setShowAdvancedMixer] = useState(false);
  const [offlineToast, setOfflineToast] = useState<string | null>(null);

  // Sync state with engine
  const togglePlay = () => {
    if (isPlaying) {
      ambientSound.stop();
      setIsPlaying(false);
      setSelectedTimer(null);
    } else {
      ambientSound.setMasterVolume(masterVol / 100);
      ambientSound.setFireVolume(fireVol / 100);
      ambientSound.setRainVolume(rainVol / 100);
      ambientSound.setTibetanVolume(tibetanVol / 100);
      ambientSound.setSolfeggioVolume(solfeggioVol / 100);
      ambientSound.setThetaVolume(thetaVol / 100);
      ambientSound.setWindVolume(windVol / 100);

      if (selectedTimer) {
        ambientSound.setTimer(selectedTimer);
      }
      ambientSound.start();
      setIsPlaying(true);
    }
  };

  const handleSelectPreset = (preset: SoundscapePreset) => {
    setActivePresetId(preset.id);
    setFireVol(preset.fire);
    setRainVol(preset.rain);
    setTibetanVol(preset.tibetan432);
    setSolfeggioVol(preset.solfeggio528);
    setThetaVol(preset.thetaWaves);
    setWindVol(preset.wind);

    ambientSound.applyPreset(preset);

    if (!isPlaying) {
      ambientSound.setMasterVolume(masterVol / 100);
      ambientSound.start();
      setIsPlaying(true);
    }
  };

  const handlePrecacheSoundscapes = async () => {
    setIsPrecaching(true);
    const res = await ambientSound.precacheSoundscapesToServiceWorker();
    setIsPrecaching(false);
    if (res.success) {
      setIsPrecached(true);
      setOfflineToast(`Успешно! ${res.count} звуковых ландшафтов сохранены в офлайн-память Service Worker.`);
      setTimeout(() => setOfflineToast(null), 4000);
    } else {
      setOfflineToast('Звуки уже синтезируются в реальном времени.');
      setTimeout(() => setOfflineToast(null), 3000);
    }
  };

  // Timer countdown tracker & offline status subscription
  useEffect(() => {
    const unsub = ambientSound.onOfflineStatusChange((status) => {
      setIsPrecached(status.isPrecached);
    });

    const interval = setInterval(() => {
      const state = ambientSound.getState();
      setIsPlaying(state.isPlaying);
      if (state.timerEndsAt && state.isPlaying) {
        const diff = Math.max(0, state.timerEndsAt - Date.now());
        if (diff === 0) {
          setRemainingTime(null);
        } else {
          const m = Math.floor(diff / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setRemainingTime(`${m}:${s < 10 ? '0' : ''}${s}`);
        }
      } else {
        setRemainingTime(null);
      }
    }, 1000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Floating Mini Controller at bottom right */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <motion.button
          onClick={() => setIsExpanded(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all cursor-pointer ${
            isPlaying
              ? 'bg-amber-950/85 border-amber-500/50 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
              : 'bg-[#0b111e]/85 border-white/10 text-slate-300 hover:border-amber-500/30'
          }`}
          title="Звуковая медитация и ландшафты"
        >
          <div className="relative">
            <Flame 
              size={18} 
              className={isPlaying ? 'text-amber-400 animate-pulse' : 'text-slate-400'} 
            />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </div>
          <span className="text-xs font-bold font-serif hidden sm:inline">
            {isPlaying ? 'Звуки Костра & 432 Гц' : 'Звуковая Терапия'}
          </span>
          {remainingTime && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
              {remainingTime}
            </span>
          )}
        </motion.button>
      </div>

      {/* Expanded Sanctuary Modal / Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
            <div 
              className="absolute inset-0"
              onClick={() => setIsExpanded(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-3xl p-5 sm:p-7 border-2 border-amber-500/40 bg-gradient-to-b from-[#140e0a] via-[#0d0a08] to-[#060403] text-slate-100 shadow-[0_20px_70px_rgba(0,0,0,0.95)] relative overflow-hidden space-y-5 max-h-[92vh] flex flex-col"
            >
              {/* Warm Campfire ambient background visual glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 relative z-10 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0">
                    <Flame size={22} className={isPlaying ? 'animate-pulse' : ''} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-100 truncate">
                        Сакральная Звуковая Терапия
                      </h3>
                      {isPrecached && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                          <CheckCircle2 size={10} />
                          Офлайн SW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      Огонь, дождь, Тибетские чаши 432 Гц, Сольфеджио 528 Гц и Тета-ритмы
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-5 custom-scrollbar pr-1">
                {/* Offline Caching Banner & Action */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-black/60 border border-amber-500/25 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isPrecached ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isPrecached ? <CheckCircle2 size={16} /> : <DownloadCloud size={16} />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-serif font-bold text-slate-200 block truncate">
                        {isPrecached ? 'Офлайн-кэш Service Worker активен' : 'Сохранить звуки в Service Worker'}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {isPrecached ? 'Звуки работают без интернета и при слабой связи' : 'Предзагрузка звуковых ландшафтов для игры офлайн'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handlePrecacheSoundscapes}
                    disabled={isPrecaching}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-serif font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isPrecached
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                        : 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    }`}
                  >
                    {isPrecaching ? (
                      <span className="animate-spin text-xs">⏳</span>
                    ) : isPrecached ? (
                      <>
                        <CheckCircle2 size={12} />
                        <span>Обновить</span>
                      </>
                    ) : (
                      <>
                        <DownloadCloud size={12} />
                        <span>Кэшировать</span>
                      </>
                    )}
                  </button>
                </div>

                {offlineToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-center font-serif"
                  >
                    {offlineToast}
                  </motion.div>
                )}

                {/* Central Soundscape Stage */}
                <div className="relative p-5 rounded-2xl bg-gradient-to-b from-black/80 to-[#100b08] border border-amber-500/30 flex flex-col items-center justify-center overflow-hidden shadow-inner space-y-3">
                  <div className="flex items-center gap-4 sm:gap-6 z-10">
                    <div className={`p-3.5 rounded-full border transition-all duration-700 ${
                      isPlaying && fireVol > 0
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.5)] scale-105'
                        : 'bg-black/50 border-white/10 text-slate-600'
                    }`}>
                      <Flame size={24} className={isPlaying && fireVol > 0 ? 'animate-bounce' : ''} />
                    </div>

                    <div className={`p-3.5 rounded-full border transition-all duration-700 ${
                      isPlaying && (tibetanVol > 0 || solfeggioVol > 0)
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.5)] scale-105'
                        : 'bg-black/50 border-white/10 text-slate-600'
                    }`}>
                      <Sparkles size={24} className={isPlaying && (tibetanVol > 0 || solfeggioVol > 0) ? 'animate-spin' : ''} />
                    </div>

                    {/* Master Play/Pause Giant Button */}
                    <motion.button
                      onClick={togglePlay}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold shadow-2xl transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-500 text-black shadow-[0_0_35px_rgba(245,158,11,0.6)]'
                          : 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg hover:shadow-amber-500/40'
                      }`}
                    >
                      {isPlaying ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
                    </motion.button>

                    <div className={`p-3.5 rounded-full border transition-all duration-700 ${
                      isPlaying && thetaVol > 0
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.5)] scale-105'
                        : 'bg-black/50 border-white/10 text-slate-600'
                    }`}>
                      <Moon size={24} className={isPlaying && thetaVol > 0 ? 'animate-pulse' : ''} />
                    </div>

                    <div className={`p-3.5 rounded-full border transition-all duration-700 ${
                      isPlaying && rainVol > 0
                        ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_25px_rgba(59,130,246,0.5)] scale-105'
                        : 'bg-black/50 border-white/10 text-slate-600'
                    }`}>
                      <CloudRain size={24} className={isPlaying && rainVol > 0 ? 'animate-pulse' : ''} />
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 uppercase tracking-widest font-mono z-10 text-center">
                    {isPlaying ? 'Процедурный синтез и офлайн-звук активны' : 'Выберите пресет или нажмите Play'}
                  </span>
                </div>

                {/* Soundscape Presets Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold uppercase tracking-wider text-amber-300 font-serif">
                      Сакральные Пресеты:
                    </span>
                    <button
                      onClick={() => setShowAdvancedMixer(!showAdvancedMixer)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Sliders size={12} />
                      <span>{showAdvancedMixer ? 'Скрыть микшер' : 'Настроить слои'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SOUNDSCAPE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          activePresetId === preset.id
                            ? 'bg-gradient-to-r from-amber-500/20 to-amber-950/40 border-amber-400 text-amber-200 shadow-md'
                            : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {preset.id === 'campfire_rain' && <Flame size={14} className="text-amber-400" />}
                          {preset.id === 'tibetan_432' && <Sparkles size={14} className="text-purple-400" />}
                          {preset.id === 'solfeggio_528' && <Heart size={14} className="text-rose-400" />}
                          {preset.id === 'deep_theta' && <Moon size={14} className="text-cyan-400" />}
                          {preset.id === 'forest_stream' && <CloudRain size={14} className="text-blue-400" />}
                          <span className="text-xs font-serif font-bold truncate">{preset.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                          {preset.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multichannel Volume Mixer (Detailed) */}
                <div className={`space-y-3.5 bg-black/40 p-4 rounded-2xl border border-white/10 transition-all ${showAdvancedMixer ? 'block' : 'hidden sm:block'}`}>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Индивидуальные слои частот:</span>
                  </div>

                  {/* 1. Fire Volume */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-amber-200 font-medium">
                      <div className="flex items-center gap-2">
                        <Flame size={13} className="text-amber-400" />
                        <span>Живой огонь и треск углей</span>
                      </div>
                      <span className="font-mono text-[11px]">{fireVol}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={fireVol}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFireVol(val);
                        ambientSound.setFireVolume(val / 100);
                      }}
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* 2. Rain Volume */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-blue-200 font-medium">
                      <div className="flex items-center gap-2">
                        <CloudRain size={13} className="text-blue-400" />
                        <span>Мягкий дождь</span>
                      </div>
                      <span className="font-mono text-[11px]">{rainVol}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rainVol}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setRainVol(val);
                        ambientSound.setRainVolume(val / 100);
                      }}
                      className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* 3. Tibetan Bowl 432 Hz */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-purple-200 font-medium">
                      <div className="flex items-center gap-2">
                        <Sparkles size={13} className="text-purple-400" />
                        <span>Тибетские чаши (432 Гц)</span>
                      </div>
                      <span className="font-mono text-[11px]">{tibetanVol}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={tibetanVol}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTibetanVol(val);
                        ambientSound.setTibetanVolume(val / 100);
                      }}
                      className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* 4. Solfeggio 528 Hz */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-rose-200 font-medium">
                      <div className="flex items-center gap-2">
                        <Heart size={13} className="text-rose-400" />
                        <span>Сольфеджио Любви (528 Гц)</span>
                      </div>
                      <span className="font-mono text-[11px]">{solfeggioVol}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={solfeggioVol}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSolfeggioVol(val);
                        ambientSound.setSolfeggioVolume(val / 100);
                      }}
                      className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* 5. Theta Waves */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-cyan-200 font-medium">
                      <div className="flex items-center gap-2">
                        <Moon size={13} className="text-cyan-400" />
                        <span>Бинауральная Тета (6 Гц)</span>
                      </div>
                      <span className="font-mono text-[11px]">{thetaVol}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={thetaVol}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setThetaVol(val);
                        ambientSound.setThetaVolume(val / 100);
                      }}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* 6. Wind */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-emerald-200 font-medium">
                      <div className="flex items-center gap-2">
                        <Wind size={13} className="text-emerald-400" />
                        <span>Ветер в соснах и колокольчики</span>
                      </div>
                      <span className="font-mono text-[11px]">{windVol}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={windVol}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setWindVol(val);
                        ambientSound.setWindVolume(val / 100);
                      }}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Master Volume */}
                  <div className="space-y-1 pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                      <div className="flex items-center gap-2">
                        <Volume2 size={14} className="text-amber-400" />
                        <span>Общая громкость мастера</span>
                      </div>
                      <span className="font-mono">{masterVol}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={masterVol}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMasterVol(val);
                        ambientSound.setMasterVolume(val / 100);
                      }}
                      className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Sleep / Meditation Timer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-300 font-serif">
                      <Clock size={13} />
                      <span>Таймер медитации / сна:</span>
                    </div>
                    {remainingTime && (
                      <span className="text-amber-400 font-mono font-bold">Осталось: {remainingTime}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {[
                      { label: '15 мин', val: 15 },
                      { label: '30 мин', val: 30 },
                      { label: '60 мин', val: 60 },
                      { label: 'Без таймера', val: null }
                    ].map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedTimer(t.val);
                          ambientSound.setTimer(t.val);
                        }}
                        className={`py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          selectedTimer === t.val
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                            : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guidance notice */}
                <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200/80 flex items-start gap-2">
                  <Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Звуковой фон сохраняется в кэше Service Worker и непрерывно играет в фоне, пока вы читаете манускрипты, делаете расчеты или закрываете браузер.
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AmbientSoundTherapy;
