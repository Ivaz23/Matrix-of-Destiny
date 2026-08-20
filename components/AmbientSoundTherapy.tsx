import React, { useState, useEffect } from 'react';
import { ambientSound } from '../services/ambientSoundEngine';
import { Flame, CloudRain, Volume2, VolumeX, Play, Pause, Clock, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AmbientSoundTherapy: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fireVol, setFireVol] = useState(70);
  const [rainVol, setRainVol] = useState(70);
  const [masterVol, setMasterVol] = useState(80);
  const [selectedTimer, setSelectedTimer] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);

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
      if (selectedTimer) {
        ambientSound.setTimer(selectedTimer);
      }
      ambientSound.start();
      setIsPlaying(true);
    }
  };

  const handleFireChange = (val: number) => {
    setFireVol(val);
    ambientSound.setFireVolume(val / 100);
  };

  const handleRainChange = (val: number) => {
    setRainVol(val);
    ambientSound.setRainVolume(val / 100);
  };

  const handleMasterChange = (val: number) => {
    setMasterVol(val);
    ambientSound.setMasterVolume(val / 100);
  };

  const handleTimerChange = (minutes: number | null) => {
    setSelectedTimer(minutes);
    if (isPlaying) {
      ambientSound.setTimer(minutes);
    }
  };

  // Timer countdown tracker
  useEffect(() => {
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
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Floating Mini Controller at bottom right */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <motion.button
          onClick={() => setIsExpanded(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all ${
            isPlaying
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
              : 'bg-[#0b111e]/85 border-white/10 text-slate-300 hover:border-amber-500/30'
          }`}
          title="Звуки костра и дождя"
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
            {isPlaying ? 'Костер & Дождь играет' : 'Звуки Костра и Дождя'}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg rounded-3xl p-7 border-2 border-amber-500/40 bg-gradient-to-b from-[#140e0a] via-[#0d0a08] to-[#060403] text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden space-y-6"
            >
              {/* Warm Campfire ambient background visual glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                    <Flame size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-amber-100">
                      Убежище у Костра
                    </h3>
                    <p className="text-xs text-slate-400">
                      Звуковая терапия: живое пламя и мягкий дождь
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Central Fire & Rain Visual Stage */}
              <div className="relative h-36 rounded-2xl bg-gradient-to-b from-black/80 to-[#100b08] border border-amber-500/30 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                {/* Floating flame particles / glow */}
                <div className="flex items-center gap-6 z-10">
                  <div className={`p-4 rounded-full border transition-all duration-700 ${
                    isPlaying && fireVol > 0
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.5)] scale-110'
                      : 'bg-black/50 border-white/10 text-slate-500'
                  }`}>
                    <Flame size={32} className={isPlaying && fireVol > 0 ? 'animate-bounce' : ''} />
                  </div>

                  {/* Master Play/Pause Giant Button */}
                  <motion.button
                    onClick={togglePlay}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center font-bold shadow-2xl transition-all ${
                      isPlaying
                        ? 'bg-amber-500 text-black shadow-[0_0_35px_rgba(245,158,11,0.6)]'
                        : 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg hover:shadow-amber-500/40'
                    }`}
                  >
                    {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                  </motion.button>

                  <div className={`p-4 rounded-full border transition-all duration-700 ${
                    isPlaying && rainVol > 0
                      ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-110'
                      : 'bg-black/50 border-white/10 text-slate-500'
                  }`}>
                    <CloudRain size={32} className={isPlaying && rainVol > 0 ? 'animate-pulse' : ''} />
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 uppercase tracking-widest font-mono mt-3 z-10">
                  {isPlaying ? 'Процедурная генерация звука активна' : 'Нажмите Play для погружения'}
                </span>
              </div>

              {/* Volume Sliders Mixer */}
              <div className="space-y-4 bg-black/40 p-4.5 rounded-2xl border border-white/10">
                {/* 1. Fire Volume */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-amber-200">
                    <div className="flex items-center gap-2">
                      <Flame size={14} className="text-amber-400" />
                      <span>Треск и тепло костра</span>
                    </div>
                    <span className="font-mono">{fireVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={fireVol}
                    onChange={(e) => handleFireChange(Number(e.target.value))}
                    className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 2. Rain Volume */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-blue-200">
                    <div className="flex items-center gap-2">
                      <CloudRain size={14} className="text-blue-400" />
                      <span>Шум и капли дождя</span>
                    </div>
                    <span className="font-mono">{rainVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rainVol}
                    onChange={(e) => handleRainChange(Number(e.target.value))}
                    className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 3. Master Volume */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <div className="flex items-center gap-2">
                      <Volume2 size={14} className="text-amber-400" />
                      <span>Общая громкость</span>
                    </div>
                    <span className="font-mono">{masterVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={masterVol}
                    onChange={(e) => handleMasterChange(Number(e.target.value))}
                    className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Sleep / Meditation Timer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-300">
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
                      onClick={() => handleTimerChange(t.val)}
                      className={`py-2 rounded-xl border text-xs font-medium transition-all ${
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

              {/* Footer guidance */}
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200/80 flex items-start gap-2">
                <Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Звук продолжает звучать в фоновом режиме, пока вы изучаете матрицу, прогноз или делаете расклады Таро.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AmbientSoundTherapy;
