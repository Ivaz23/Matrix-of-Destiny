import React, { useState } from 'react';
import { 
  Sparkles, 
  KeyRound, 
  Ticket, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock
} from 'lucide-react';
import { redeemPromoCode, MAX_FREE_ATTEMPTS } from '../services/usageLimitService';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminAuth: () => void;
  onSuccessVipUnlock?: () => void;
  onTriggerHaptic?: (pattern?: number | number[]) => void;
}

export const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminAuth,
  onSuccessVipUnlock,
  onTriggerHaptic
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerHaptic?.(15);
    setPromoError(null);
    setPromoSuccess(null);

    const res = redeemPromoCode(promoCode);
    if (res.success) {
      setPromoSuccess(res.message);
      onTriggerHaptic?.([30, 60, 30]);
      setTimeout(() => {
        onSuccessVipUnlock?.();
        onClose();
      }, 1200);
    } else {
      setPromoError(res.message);
      onTriggerHaptic?.([50, 50, 50]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in no-print">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0e1628] via-[#090e1c] to-[#050811] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/15 blur-[70px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/15 blur-[70px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Top Visual: 3 Exhausted Crystals */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                <Sparkles size={18} />
              </div>
            ))}
          </div>

          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
            Лимит Попыток • {MAX_FREE_ATTEMPTS} из {MAX_FREE_ATTEMPTS} использовано
          </span>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
            Бесплатный Лимит Исчерпан
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
            Вы провели 3 полноценных расклада / расчета на сегодня. Чтобы продолжить без ограничений, активируйте промокод или войдите как администратор.
          </p>
        </div>

        {/* Promo Code Form */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-serif font-bold">
            <Ticket size={16} className="text-amber-400" />
            <span>Активация VIP Промокода</span>
          </div>

          <form onSubmit={handleApplyPromo} className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  if (promoError) setPromoError(null);
                }}
                placeholder="Например: CHUBUK-VIP"
                className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs sm:text-sm font-mono tracking-wider"
              />
              <button
                type="submit"
                className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md"
              >
                Применить
              </button>
            </div>

            {promoError && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="text-red-400 shrink-0" />
                <span>{promoError}</span>
              </div>
            )}

            {promoSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>{promoSuccess}</span>
              </div>
            )}
          </form>
        </div>

        {/* Admin Secret Gateway Button */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Clock size={14} className="text-amber-400/80" />
            <span>Сброс бесплатных попыток: в 00:00</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onTriggerHaptic?.(10);
              onClose();
              onOpenAdminAuth();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-serif font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound size={14} />
            <span>Вход для Создателя / Админа 👑</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default UsageLimitModal;
