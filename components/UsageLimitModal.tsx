import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Coins, 
  CreditCard, 
  Gift, 
  KeyRound, 
  Ticket, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowRight,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  CircleDot,
  Wallet
} from 'lucide-react';
import { 
  CRYPTO_PACKAGES, 
  MONEY_PACKAGES, 
  PARTNER_TASKS, 
  WHEEL_SECTORS, 
  MAX_FREE_ATTEMPTS,
  getRemainingAttempts,
  getBonusAttempts,
  getUsageCount,
  getTapperCoinsBalance,
  convertChubukCoinsToAttempts,
  getCanSpinWheelFree,
  spinWheelAndClaimReward,
  getCompletedPartnerTasks,
  completePartnerTask,
  processMoneyPayment,
  redeemPromoCode,
  isVipUnlocked,
  isUserAdmin,
  MoneyPackage,
  CryptoPackage,
  PartnerTask,
  FortuneWheelSector,
  PaymentReceipt
} from '../services/usageLimitService';
import { CryptoPaymentGateway } from './CryptoPaymentGateway';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminAuth: () => void;
  onSuccessVipUnlock?: () => void;
  onTriggerHaptic?: (pattern?: number | number[]) => void;
  initialTab?: 'crypto' | 'wheel' | 'partner' | 'money' | 'promo' | 'crypto_pay';
}

export const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminAuth,
  onSuccessVipUnlock,
  onTriggerHaptic,
  initialTab = 'crypto'
}) => {
  const [activeTab, setActiveTab] = useState<'crypto' | 'wheel' | 'partner' | 'money' | 'promo' | 'crypto_pay'>(initialTab);
  
  // Balances & States
  const [coins, setCoins] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(0);
  const [bonusAttempts, setBonusAttempts] = useState<number>(0);
  const [dailyUsed, setDailyUsed] = useState<number>(0);
  const [isVip, setIsVip] = useState<boolean>(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  // Feedback banners
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Wheel state
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelResult, setWheelResult] = useState<FortuneWheelSector | null>(null);
  const [canFreeSpin, setCanFreeSpin] = useState<boolean>(true);

  // Money Checkout modal state
  const [selectedMoneyPkg, setSelectedMoneyPkg] = useState<MoneyPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'sbp' | 'card' | 'yoomoney' | 'stars'>('sbp');
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [lastReceipt, setLastReceipt] = useState<PaymentReceipt | null>(null);

  // Promo code state
  const [promoInput, setPromoInput] = useState<string>('');

  // Partner Task Timer / In-Progress
  const [pendingTask, setPendingTask] = useState<{ id: string; secondsLeft: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const updateAllStats = () => {
    setCoins(getTapperCoinsBalance());
    setRemainingAttempts(getRemainingAttempts());
    setBonusAttempts(getBonusAttempts());
    setDailyUsed(getUsageCount());
    setIsVip(isVipUnlocked());
    setCompletedTasks(getCompletedPartnerTasks());
    setCanFreeSpin(getCanSpinWheelFree().canSpin);
  };

  useEffect(() => {
    if (isOpen) {
      updateAllStats();
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleUsageUpdated = () => updateAllStats();
    const handleCoinsUpdated = () => updateAllStats();
    const handleAdminChanged = () => updateAllStats();

    window.addEventListener('chubuk_usage_updated', handleUsageUpdated);
    window.addEventListener('chubuk_coins_updated', handleCoinsUpdated);
    window.addEventListener('chubuk_admin_state_changed', handleAdminChanged);

    return () => {
      window.removeEventListener('chubuk_usage_updated', handleUsageUpdated);
      window.removeEventListener('chubuk_coins_updated', handleCoinsUpdated);
      window.removeEventListener('chubuk_admin_state_changed', handleAdminChanged);
    };
  }, []);

  // Partner Task Timer
  useEffect(() => {
    if (!pendingTask) return;
    if (pendingTask.secondsLeft <= 0) {
      const res = completePartnerTask(pendingTask.id);
      if (res.success) {
        onTriggerHaptic?.([40, 80, 40]);
        setToastMessage({ text: res.message, type: 'success' });
      } else {
        setToastMessage({ text: res.message, type: 'error' });
      }
      setPendingTask(null);
      updateAllStats();
      return;
    }

    const timer = setTimeout(() => {
      setPendingTask(prev => prev ? { ...prev, secondsLeft: prev.secondsLeft - 1 } : null);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pendingTask]);

  // Render Canvas for Wheel
  useEffect(() => {
    if (activeTab !== 'wheel' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numSectors = WHEEL_SECTORS.length;
    const arc = (2 * Math.PI) / numSectors;
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;

    ctx.clearRect(0, 0, size, size);

    // Draw Sectors
    WHEEL_SECTORS.forEach((sec, i) => {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = sec.color;
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.lineTo(center, center);
      ctx.fill();

      ctx.strokeStyle = '#f59e0b44';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text & Icon
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = sec.textColor;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${sec.icon} ${sec.label}`, radius - 20, 4);
      ctx.restore();
    });

    // Outer Glow Ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center Gold Hub
    ctx.beginPath();
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', center, center + 4);
  }, [activeTab]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Crypto Conversion Handler
  const handleConvertCrypto = (pkg: CryptoPackage) => {
    onTriggerHaptic?.(20);
    const res = convertChubukCoinsToAttempts(pkg);
    if (res.success) {
      onTriggerHaptic?.([30, 60, 30]);
      showToast(res.message, 'success');
      updateAllStats();
    } else {
      onTriggerHaptic?.([50, 50, 50]);
      showToast(res.message, 'error');
    }
  };

  // 2. Wheel Spin Handler
  const handleSpinWheel = (costType: 'free' | 'coins') => {
    if (isSpinning) return;
    onTriggerHaptic?.(25);
    setWheelResult(null);

    const spinRes = spinWheelAndClaimReward(costType);
    if (!spinRes.success) {
      showToast(spinRes.message, 'error');
      onTriggerHaptic?.([50, 50]);
      return;
    }

    setIsSpinning(true);

    const numSectors = WHEEL_SECTORS.length;
    const sectorAngleDeg = 360 / numSectors;
    const targetSectorIndex = spinRes.sectorIndex ?? 0;

    // Pointer is at the top (270 deg or 90 deg offset in canvas)
    // Sector 0 is from 0 to sectorAngleDeg
    // To land on sector i, the wheel must stop such that sector i is at top (270 deg)
    const extraFullRotations = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetDeg = extraFullRotations + (360 - (targetSectorIndex * sectorAngleDeg + sectorAngleDeg / 2)) - 90;

    setWheelRotation(prev => prev + targetDeg);

    setTimeout(() => {
      setIsSpinning(false);
      if (spinRes.sector) {
        setWheelResult(spinRes.sector);
        onTriggerHaptic?.([40, 80, 40]);
        showToast(`🎉 Выигрыш: ${spinRes.sector.label}!`, 'success');
      }
      updateAllStats();
    }, 4500);
  };

  // 3. Partner Task Click
  const handleStartPartnerTask = (task: PartnerTask) => {
    onTriggerHaptic?.(15);
    if (completedTasks.includes(task.id)) {
      showToast('Вы уже получили награду за это задание!', 'info');
      return;
    }

    // Open target link
    if (task.actionUrl.startsWith('http')) {
      window.open(task.actionUrl, '_blank', 'noopener,noreferrer');
    }

    // Start 10-second verification countdown
    setPendingTask({ id: task.id, secondsLeft: 10 });
    showToast(`Задание начато! Проверка завершится через 10 секунд...`, 'info');
  };

  // 4. Money Payment Checkout
  const handleConfirmPayment = () => {
    if (!selectedMoneyPkg) return;
    setIsPaying(true);
    onTriggerHaptic?.(20);

    setTimeout(() => {
      const receipt = processMoneyPayment(selectedMoneyPkg, paymentMethod);
      setIsPaying(false);
      setSelectedMoneyPkg(null);
      setLastReceipt(receipt);
      onTriggerHaptic?.([40, 90, 40]);
      showToast(`Оплата ${receipt.priceRub} ₽ прошла успешно! Начислено: ${receipt.pkgTitle}`, 'success');
      updateAllStats();
    }, 1800);
  };

  // 5. Promo Code Submit
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerHaptic?.(15);
    const res = redeemPromoCode(promoInput);
    if (res.success) {
      onTriggerHaptic?.([30, 70, 30]);
      showToast(res.message, 'success');
      setPromoInput('');
      updateAllStats();
      onSuccessVipUnlock?.();
    } else {
      onTriggerHaptic?.([50, 50, 50]);
      showToast(res.message, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in no-print overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e1628] via-[#090e1c] to-[#050811] border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_70px_rgba(245,158,11,0.25)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/15 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/15 blur-[80px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        {/* Toast / Notification Banner */}
        {toastMessage && (
          <div className={`mb-3 p-3 rounded-2xl text-xs flex items-center gap-2.5 transition-all shadow-lg animate-fade-in z-20 ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200' 
              : toastMessage.type === 'error'
              ? 'bg-red-500/20 border border-red-500/50 text-red-200'
              : 'bg-amber-500/20 border border-amber-500/50 text-amber-200'
          }`}>
            {toastMessage.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
        )}

        {/* Header with Live Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Монетизация & Энергия
              </span>
              {isVip && (
                <span className="text-[10px] font-serif font-bold text-amber-300 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-purple-500/30 border border-amber-500/40">
                  👑 VIP MASTER
                </span>
              )}
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-white mt-1">
              Пополнение Попыток & Магазин
            </h2>
          </div>

          {/* User Live Balance Pills */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
              <Coins size={15} className="text-amber-400" />
              <div className="text-right">
                <div className="text-[9px] text-slate-400 font-mono uppercase">Баланс $CHUBUK</div>
                <div className="text-xs font-mono font-bold text-amber-300">
                  {Math.floor(coins).toLocaleString('ru-RU')}
                </div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2">
              <Zap size={15} className="text-purple-400" />
              <div className="text-right">
                <div className="text-[9px] text-slate-400 font-mono uppercase">Попытки</div>
                <div className="text-xs font-mono font-bold text-purple-300">
                  {isVip ? '∞ Безлимит' : `${remainingAttempts} шт.`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Ribbon */}
        <div className="flex items-center gap-1.5 py-3 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('crypto'); onTriggerHaptic?.(10); }}
            className={`px-3 py-2 rounded-xl text-xs font-medium font-serif flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'crypto'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Coins size={14} />
            <span>Крипта $CHUBUK (10к:3)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('wheel'); onTriggerHaptic?.(10); }}
            className={`px-3 py-2 rounded-xl text-xs font-medium font-serif flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'wheel'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Sparkles size={14} />
            <span>🎡 Колесо Фортуны</span>
            {canFreeSpin && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('partner'); onTriggerHaptic?.(10); }}
            className={`px-3 py-2 rounded-xl text-xs font-medium font-serif flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'partner'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Gift size={14} />
            <span>Партнёрки & Яндекс (+5..+10)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('money'); onTriggerHaptic?.(10); }}
            className={`px-3 py-2 rounded-xl text-xs font-medium font-serif flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'money'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <CreditCard size={14} />
            <span>Оплата Рублями / СБП</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('crypto_pay'); onTriggerHaptic?.(10); }}
            className={`px-3 py-2 rounded-xl text-xs font-medium font-serif flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'crypto_pay'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Wallet size={14} />
            <span>Криптошлюз (USDT/BTC/ETH)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('promo'); onTriggerHaptic?.(10); }}
            className={`px-3 py-2 rounded-xl text-xs font-medium font-serif flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'promo'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Ticket size={14} />
            <span>Промокод & Вход Мастера</span>
          </button>
        </div>

        {/* Scrollable Tab Content Container */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4">
          
          {/* ========================================================= */}
          {/* TAB 1: CRYPTO $CHUBUK CONVERSION                          */}
          {/* ========================================================= */}
          {activeTab === 'crypto' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-transparent border border-amber-500/30 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-black shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-amber-200">
                    Официальный курс: 10,000 $CHUBUK = 3 попытки
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Зарабатывайте монеты $CHUBUK в разделе «Тапалка», выполняя сакральные практики и прокачивая арканы. Обменивайте их на мгновенные попытки или вечный безлимит!
                  </p>
                </div>
              </div>

              {/* Package Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CRYPTO_PACKAGES.map((pkg) => {
                  const canAfford = coins >= pkg.coinsCost;
                  return (
                    <div 
                      key={pkg.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        pkg.isVip 
                          ? 'bg-gradient-to-b from-purple-950/40 to-black/60 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                          : 'bg-black/40 border-white/10 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-serif font-bold text-sm text-white flex items-center gap-1.5">
                            {pkg.title}
                          </div>
                          <div className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                            {pkg.coinsCost.toLocaleString('ru-RU')} $CHUBUK
                          </div>
                        </div>

                        {pkg.bonusText && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                            {pkg.bonusText}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleConvertCrypto(pkg)}
                        disabled={!canAfford}
                        className={`w-full py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md'
                            : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        <Coins size={14} />
                        <span>{canAfford ? 'Обменять' : 'Не хватает монет'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: FORTUNE WHEEL                                      */}
          {/* ========================================================= */}
          {activeTab === 'wheel' && (
            <div className="space-y-4 animate-fade-in text-center flex flex-col items-center">
              <div className="max-w-md mx-auto">
                <h4 className="font-serif font-bold text-base text-amber-200">
                  Сакральное Колесо Фортуны Старца
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  1 бесплатное вращение каждые 24 часа. Дополнительные вращения — всего за 2,000 $CHUBUK. Испытайте милость Вселенной!
                </p>
              </div>

              {/* Wheel Container */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
                {/* Pointer / Flapper Arrow at top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-[0_4px_10px_rgba(245,158,11,0.8)]" />

                {/* Canvas Wheel */}
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transition: isSpinning ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                  }}
                  className="w-full h-full rounded-full shadow-[0_0_35px_rgba(245,158,11,0.3)]"
                />
              </div>

              {/* Won Result Highlight */}
              {wheelResult && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border border-amber-500/50 text-white animate-fade-in max-w-sm">
                  <div className="text-xs text-amber-300 font-mono uppercase font-bold">Выпал сектор:</div>
                  <div className="font-serif font-bold text-lg text-amber-200">{wheelResult.icon} {wheelResult.label}</div>
                  <div className="text-xs text-slate-300">{wheelResult.description}</div>
                </div>
              )}

              {/* Spin Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md pt-2">
                <button
                  type="button"
                  onClick={() => handleSpinWheel('free')}
                  disabled={isSpinning || !canFreeSpin}
                  className={`flex-1 py-3 px-4 rounded-xl font-serif font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer w-full ${
                    canFreeSpin && !isSpinning
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110'
                      : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  <Sparkles size={16} />
                  <span>{canFreeSpin ? 'Бесплатное Вращение 🌟' : 'Использовано сегодня'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSpinWheel('coins')}
                  disabled={isSpinning || coins < 2000}
                  className={`flex-1 py-3 px-4 rounded-xl font-serif font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer w-full ${
                    coins >= 2000 && !isSpinning
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                      : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  <Coins size={16} />
                  <span>Крутить за 2,000 $CHUBUK</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: PARTNER & YANDEX REWARD TASKS                      */}
          {/* ========================================================= */}
          {activeTab === 'partner' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-red-500/10 to-transparent border border-amber-500/30 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 text-black shrink-0 shadow-md">
                  <Gift size={20} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-amber-200">
                    Партнерские задания Яндекса и сервисов
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Даем повышенную награду: от <strong className="text-amber-300 font-bold">+5 до +10 попыток</strong> за простой переход, просмотр или подписку!
                  </p>
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-2.5">
                {PARTNER_TASKS.map((task) => {
                  const isDone = completedTasks.includes(task.id);
                  const isCurrentPending = pendingTask?.id === task.id;

                  return (
                    <div 
                      key={task.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDone 
                          ? 'bg-black/30 border-white/5 opacity-60' 
                          : 'bg-black/50 border-white/10 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
                          {task.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-white">
                              {task.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                              +{task.rewardAttempts} Попыток
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                              +{task.rewardCoins.toLocaleString('ru-RU')} $CHUBUK
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ⏱️ {task.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center justify-end">
                        {isDone ? (
                          <div className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-400 text-xs font-mono flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            <span>Получено</span>
                          </div>
                        ) : isCurrentPending ? (
                          <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-mono font-bold flex items-center gap-2 animate-pulse">
                            <Clock size={14} />
                            <span>Проверка ({pendingTask.secondsLeft}с)...</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartPartnerTask(task)}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <span>Выполнить</span>
                            <ExternalLink size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: RUBLE / SBP / CARD PAYMENTS                        */}
          {/* ========================================================= */}
          {activeTab === 'money' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500 text-black shrink-0 shadow-md">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-emerald-200">
                    Оплата Рублями: СБП, Банковские Карты, ЮMoney
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Мгновенное пополнение попыток и токенов без комиссии. Выберите подходящий пакет:
                  </p>
                </div>
              </div>

              {/* Money Packages Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MONEY_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative ${
                      pkg.isPopular 
                        ? 'bg-gradient-to-b from-amber-500/15 to-black/60 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : pkg.isVip
                        ? 'bg-gradient-to-b from-purple-900/30 to-black/60 border-purple-500/40'
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {pkg.badge && (
                      <span className="absolute -top-2.5 right-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md">
                        {pkg.badge}
                      </span>
                    )}

                    <div>
                      <div className="font-serif font-bold text-base text-white">
                        {pkg.title}
                      </div>
                      <div className="text-xs text-slate-300 mt-1 mb-2">
                        {pkg.description}
                      </div>
                      <div className="text-lg font-serif font-bold text-amber-300">
                        {pkg.priceRub} ₽
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMoneyPkg(pkg);
                        onTriggerHaptic?.(15);
                      }}
                      className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-serif font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <CreditCard size={14} />
                      <span>Купить за {pkg.priceRub} ₽</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Last Receipt Notification */}
              {lastReceipt && (
                <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/40 text-xs text-slate-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-emerald-200 font-bold">Последний чек: {lastReceipt.orderId}</div>
                      <div className="text-[11px] text-slate-400">{lastReceipt.pkgTitle} — {lastReceipt.priceRub} ₽ (Оплачено через {lastReceipt.paymentMethod.toUpperCase()})</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                    УСПЕШНО
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: PROMO CODE & MASTER PIN                            */}
          {/* ========================================================= */}
          {activeTab === 'promo' && (
            <div className="space-y-4 animate-fade-in">
              {/* Promo code box */}
              <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-sm text-amber-300 font-serif font-bold">
                  <Ticket size={18} className="text-amber-400" />
                  <span>Активация VIP Промокода</span>
                </div>
                <p className="text-xs text-slate-300">
                  Если у вас есть подарочный или партнерский промокод — введите его ниже для мгновенной активации безлимита или бонусных попыток.
                </p>

                <form onSubmit={handleApplyPromo} className="space-y-3 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Например: CHUBUK-VIP или INFINITY"
                      className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs sm:text-sm font-mono tracking-wider"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md"
                    >
                      Применить
                    </button>
                  </div>
                </form>
              </div>

              {/* Master PIN button */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-serif font-bold text-white flex items-center gap-1.5">
                    <KeyRound size={15} className="text-amber-400" />
                    <span>Секретный Вход для Создателя / Админа</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Вход по мастер-паролю для вечного снятия лимитов и доступа в админ-панель
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onTriggerHaptic?.(10);
                    onClose();
                    onOpenAdminAuth();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-serif font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <KeyRound size={14} />
                  <span>Ввести Мастер-Пароль 👑</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: CRYPTO PAYMENT GATEWAY (USDT/BTC/ETH)              */}
          {/* ========================================================= */}
          {activeTab === 'crypto_pay' && (
            <div className="space-y-4 animate-fade-in">
              <CryptoPaymentGateway
                onSuccessPayment={(attempts, tx) => {
                  updateAllStats();
                  showToast(`Криптодепозит подтвержден! Зачислено +${attempts} попыток.`, 'success');
                }}
                onTriggerHaptic={onTriggerHaptic}
              />
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-amber-400" />
            <span>Шифрование транзакций и сакральная безопасность</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs cursor-pointer"
          >
            Закрыть
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* SUB-MODAL: MONEY CHECKOUT PAYMENT GATEWAY                 */}
      {/* ========================================================= */}
      {selectedMoneyPkg && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#0f172a] to-[#090e1c] border border-amber-500/40 rounded-3xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.3)] space-y-4">
            
            <button
              onClick={() => setSelectedMoneyPkg(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 text-xl">
                💳
              </div>
              <h3 className="font-serif font-bold text-xl text-white">
                Оплата пакета «{selectedMoneyPkg.title}»
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Сумма к оплате: <strong className="text-amber-300 text-sm">{selectedMoneyPkg.priceRub} ₽</strong>
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase text-slate-400">
                Способ оплаты
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'sbp', label: 'СБП (QR / Перевод)', icon: '⚡' },
                  { id: 'card', label: 'Банковская Карта (МИР)', icon: '💳' },
                  { id: 'yoomoney', label: 'ЮMoney', icon: '🟣' },
                  { id: 'stars', label: 'Telegram Stars', icon: '⭐' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border text-xs font-serif font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Details Preview */}
            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Пакет:</span>
                <span className="font-bold text-white">{selectedMoneyPkg.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Начисление:</span>
                <span className="text-emerald-300 font-bold">
                  {selectedMoneyPkg.isVip ? 'Безлимит' : `+${selectedMoneyPkg.attempts} попыток`}
                </span>
              </div>
              {selectedMoneyPkg.bonusCoins && (
                <div className="flex justify-between">
                  <span>Бонусные монеты:</span>
                  <span className="text-amber-300 font-bold">+{selectedMoneyPkg.bonusCoins.toLocaleString('ru-RU')} $CHUBUK</span>
                </div>
              )}
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={isPaying}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-serif font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer flex items-center justify-center gap-2"
            >
              {isPaying ? (
                <span>Проведение платежа...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Оплатить {selectedMoneyPkg.priceRub} ₽</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageLimitModal;
