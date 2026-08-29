import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Gift, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  HeartHandshake, 
  Coins, 
  ShieldCheck, 
  UserPlus,
  Send,
  Award
} from 'lucide-react';
import { 
  getReferralStats, 
  getUserReferralCode, 
  applyReferralCode, 
  simulateFriendJoined, 
  ReferralStats 
} from '../services/referralService';
import { useAuth } from '../hooks/useAuth';

interface PartnerPromoSectionProps {
  onTriggerHaptic?: (pattern?: number | number[]) => void;
  onOpenUsageLimitModal?: (tab?: 'crypto' | 'wheel' | 'partner' | 'money' | 'promo' | 'crypto_pay') => void;
}

export const PartnerPromoSection: React.FC<PartnerPromoSectionProps> = ({
  onTriggerHaptic,
  onOpenUsageLimitModal
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats>(() => getReferralStats(user?.uid));
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [friendNameInput, setFriendNameInput] = useState('');

  const referralCode = stats.referralCode;
  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?ref=${referralCode}`
    : `https://chubuk-matrix.app/?ref=${referralCode}`;

  const refreshStats = () => {
    setStats(getReferralStats(user?.uid));
  };

  useEffect(() => {
    refreshStats();
    const handleReferralUpdate = () => refreshStats();
    window.addEventListener('chubuk_referral_updated', handleReferralUpdate);
    return () => {
      window.removeEventListener('chubuk_referral_updated', handleReferralUpdate);
    };
  }, [user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    onTriggerHaptic?.(15);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    onTriggerHaptic?.(15);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareTelegram = () => {
    onTriggerHaptic?.(15);
    const text = encodeURIComponent(
      `🔮 Привет! Рассчитай свою персональную Матрицу Судьбы, Натальную Карту и расклад Таро на сакральном сервисе Chubuk Matrix. По моей ссылке ты сразу получишь +5 БЕСПЛАТНЫХ ПОПЫТОК расчетов!`
    );
    const url = encodeURIComponent(referralLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleApplyFriendCode = () => {
    onTriggerHaptic?.(20);
    setFeedback(null);
    const res = applyReferralCode(friendCodeInput);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setFriendCodeInput('');
      refreshStats();
      onTriggerHaptic?.([30, 60, 30]);
    } else {
      setFeedback({ type: 'error', message: res.message });
      onTriggerHaptic?.([50, 50]);
    }
  };

  const handleTestInviteFriend = () => {
    onTriggerHaptic?.(20);
    const res = simulateFriendJoined(friendNameInput.trim() || undefined);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setFriendNameInput('');
      refreshStats();
      onTriggerHaptic?.([40, 80, 40]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-400 mb-1 shadow-lg">
          <HeartHandshake size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-serif text-white tracking-wide">
          Партнерская Программа & Пригласи Друга
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-xs md:text-sm leading-relaxed">
          Делитесь сакральными знаниями с друзьями и близкими. Приводите новых искателей истины — и каждый из вас мгновенно получит <strong className="text-amber-300 font-semibold">+5 бесплатных попыток</strong> на любые расчеты и расклады Таро!
        </p>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1 */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0c1222] to-[#070b14] border border-amber-500/30 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xl shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-serif">Приглашено друзей</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              {stats.totalInvited} <span className="text-xs text-amber-400 font-normal">чел.</span>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0c1222] to-[#070b14] border border-purple-500/30 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xl shrink-0">
            <Zap size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-serif">Заработано попыток</div>
            <div className="text-2xl font-bold font-mono text-purple-300 mt-0.5">
              +{stats.totalAttemptsEarned} <span className="text-xs text-slate-400 font-normal">шт.</span>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0c1222] to-[#070b14] border border-emerald-500/30 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xl shrink-0">
            <Gift size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-serif">Бонус за каждого</div>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-0.5">
              +5 / +5 <span className="text-xs text-slate-400 font-normal">обоим</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Referral Sharing Box */}
      <div className="bg-gradient-to-b from-[#0d162d] via-[#101b38] to-[#0a1020] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Ваша персональная ссылка
              </span>
              <span className="text-[10px] text-emerald-300 flex items-center gap-1 font-mono">
                <ShieldCheck size={12} />
                Мгновенное начисление
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-white font-bold mt-1.5">
              Поделитесь ссылкой и получите +5 попыток
            </h3>
          </div>

          {/* Quick Telegram Share Button */}
          <button
            type="button"
            onClick={handleShareTelegram}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer shrink-0"
          >
            <Send size={15} />
            <span>Отправить в Telegram</span>
          </button>
        </div>

        {/* Link and Code inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {/* Link Bar (2 cols) */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs text-slate-300 font-serif flex items-center justify-between">
              <span>Реферальная ссылка для друзей:</span>
              <span className="text-[10px] text-amber-400/80">Кликабельна для регистрации</span>
            </label>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/60 border border-white/10">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="bg-transparent text-xs font-mono text-amber-200 px-2 flex-1 outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Скопировано!' : 'Копировать ссылку'}</span>
              </button>
            </div>
          </div>

          {/* Promo Code Box (1 col) */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-serif flex items-center justify-between">
              <span>Ваш Реф-Код:</span>
            </label>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/60 border border-white/10">
              <span className="font-mono font-bold text-sm text-white px-2 flex-1 tracking-wider text-center">
                {referralCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition-all cursor-pointer shrink-0"
                title="Копировать код"
              >
                {copiedCode ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40'
                  : 'bg-red-950/80 text-red-200 border border-red-500/40'
              }`}
            >
              <Sparkles size={16} className={feedback.type === 'success' ? 'text-emerald-400 shrink-0' : 'text-red-400 shrink-0'} />
              <span className="flex-1 font-medium">{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two Forms: Enter Friend Code & Test Simulation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10 relative z-10">
          {/* Form 1: Apply Friend's Code */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2.5">
            <h4 className="text-xs font-serif font-bold text-white flex items-center gap-1.5">
              <Gift size={14} className="text-amber-400" />
              <span>Вас пригласил друг? Введите его код:</span>
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={friendCodeInput}
                onChange={(e) => setFriendCodeInput(e.target.value)}
                placeholder="Например: CHK-MARI-777"
                className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-amber-500/50 text-xs text-white placeholder-slate-500 font-mono outline-none uppercase"
              />
              <button
                type="button"
                onClick={handleApplyFriendCode}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-serif font-bold text-xs transition-all cursor-pointer shrink-0"
              >
                Получить +5
              </button>
            </div>
          </div>

          {/* Form 2: Test / Direct Friend Invite Simulator */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2.5">
            <h4 className="text-xs font-serif font-bold text-white flex items-center gap-1.5">
              <UserPlus size={14} className="text-purple-400" />
              <span>Тестовая регистрация нового друга (+5 попыток):</span>
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={friendNameInput}
                onChange={(e) => setFriendNameInput(e.target.value)}
                placeholder="Имя друга (например: Елена В.)"
                className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 focus:border-purple-500/50 text-xs text-white placeholder-slate-500 font-serif outline-none"
              />
              <button
                type="button"
                onClick={handleTestInviteFriend}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-serif font-bold text-xs transition-all cursor-pointer shrink-0"
              >
                +5 Попыток
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invited Friends List & Statistics */}
      <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif text-white font-bold">
                Статистика приглашенных друзей
              </h3>
              <p className="text-xs text-slate-400">
                Список искателей, зарегистрировавшихся по вашему сакральному коду
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
            {stats.invitedList.length} друзей
          </span>
        </div>

        {stats.invitedList.length > 0 ? (
          <div className="space-y-2.5">
            {stats.invitedList.map((friend) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-300 font-serif font-bold flex items-center justify-center text-sm">
                    {friend.name[0] || 'И'}
                  </div>
                  <div>
                    <div className="text-sm font-serif font-semibold text-white">
                      {friend.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Регистрация: {friend.date}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
                    <Sparkles size={13} />
                    +{friend.bonusAwarded} попыток
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">
                    Бонус зачислен
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3 opacity-60">
            <Users size={40} className="mx-auto text-slate-400" />
            <p className="text-sm font-serif text-slate-300">Вы пока не пригласили друзей</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Скопируйте вашу реферальную ссылку выше и отправьте в Telegram, чтобы получить первые +5 попыток!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerPromoSection;
