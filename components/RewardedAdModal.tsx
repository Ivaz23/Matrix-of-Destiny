import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Clock, 
  Gift, 
  Lock, 
  Unlock, 
  Volume2, 
  VolumeX,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { 
  recordRewardedWatch, 
  recordAdClick,
  getMonetizationSettings 
} from '../services/monetizationService';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  sectionId: string;
  onRewardGranted: () => void;
  onTriggerHaptic?: (pattern?: number | number[]) => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  sectionTitle,
  sectionId,
  onRewardGranted,
  onTriggerHaptic
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(12);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const settings = getMonetizationSettings();

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setTimeLeft(12);
      setIsCompleted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isPlaying && timeLeft === 0 && !isCompleted) {
      setIsCompleted(true);
      recordRewardedWatch(sectionId);
      if (onTriggerHaptic) onTriggerHaptic([50, 100, 50, 100]);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, isCompleted, sectionId, onTriggerHaptic]);

  if (!isOpen) return null;

  const handleStartWatch = () => {
    setIsPlaying(true);
    if (onTriggerHaptic) onTriggerHaptic(40);
  };

  const handleClaimReward = () => {
    onRewardGranted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-b from-[#130b24] via-[#090e1c] to-[#04060d] border border-amber-500/40 p-6 sm:p-8 text-center text-slate-100 shadow-2xl">
        {/* Close button (only when not watching or completed) */}
        {(!isPlaying || isCompleted) && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        )}

        {/* STATE 1: PROMPT TO WATCH */}
        {!isPlaying && !isCompleted && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-xl animate-bounce">
              <Lock size={30} className="text-amber-400" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-wider">
                Премиум Разблокировка
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                Открыть раздел «{sectionTitle}»
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed max-w-md mx-auto">
                Посмотрите короткий спонсорский ролик (12 секунд), чтобы мгновенно и бесплатно получить доступ к полному расширенному анализу.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-left space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 size={14} />
                <span>Глубокий анализ арканов и кармических связей</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 size={14} />
                <span>Персональные ключи балансировки энергий</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 size={14} />
                <span>Без оформления платных подписок</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStartWatch}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 active:scale-95 text-black font-serif font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer transition-all"
              >
                <Play size={18} fill="black" />
                <span>Смотреть видео (12 сек)</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 2: PLAYING SPONSOR VIDEO / INTERACTIVE EXPERIENCE */}
        {isPlaying && !isCompleted && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2 text-amber-300">
                <Sparkles size={14} className="animate-spin" />
                Спонсорский показ
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
                <Clock size={12} />
                {timeLeft}с
              </span>
            </div>

            {/* Video / Interactive Sponsor Card */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-black border border-indigo-500/40 p-6 aspect-video flex flex-col items-center justify-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-3xl animate-pulse">
                🔮
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-serif font-bold text-white">
                  Личные Талисманы и Браслеты Шамбала
                </h4>
                <p className="text-xs text-indigo-200">
                  Заряжены на привлечение изобилия и защиту от негативных программ
                </p>
              </div>
              <a
                href={settings.affiliateLithotherapyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordAdClick()}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-serif text-white flex items-center gap-1.5 transition-all"
              >
                <span>Узнать подробнее</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/10">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${((12 - timeLeft) / 12) * 100}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-400 font-light">
              Награда будет начислена автоматически после завершения таймера
            </p>
          </div>
        )}

        {/* STATE 3: COMPLETED / REWARD READY */}
        {isCompleted && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-xl animate-scale-in">
              <Unlock size={32} className="text-emerald-400" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-serif font-bold uppercase tracking-wider">
                Доступ открыт!
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">
                Раздел «{sectionTitle}» разблокирован
              </h3>
              <p className="text-xs text-slate-300 font-light">
                Спасибо за просмотр! Теперь вам доступна полная информация данного блока.
              </p>
            </div>

            <button
              onClick={handleClaimReward}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:brightness-110 active:scale-95 text-black font-serif font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 cursor-pointer transition-all"
            >
              Перейти к изучению →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
