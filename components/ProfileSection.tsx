import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Calendar, 
  History, 
  Trash2, 
  ExternalLink, 
  Shield, 
  Download, 
  MessageCircle, 
  Sparkles, 
  Eye, 
  Heart, 
  Loader2, 
  Radio, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  RefreshCw, 
  LogIn, 
  LogOut,
  Smartphone,
  Cpu,
  Cloud,
  CloudUpload,
  HardDrive,
  ArrowRightLeft,
  Check,
  ToggleLeft,
  ToggleRight,
  Database,
  Bell,
  BellRing,
  Receipt,
  CreditCard,
  Gift,
  Coins,
  Wallet,
  Users,
  Zap,
  Clock
} from 'lucide-react';
import { SavedCalculation, UserInput } from '../types';
import { exportCalculationsToPdf, downloadAudioForCalculation } from '../services/exportUtils';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';
import { testAiProxyConnection, getApiBaseUrl } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { getTopupHistory, TopupTransaction } from '../services/referralService';
import { getRemainingAttempts, getTapperCoinsBalance, isVipUnlocked } from '../services/usageLimitService';
import AuthModal from './AuthModal';
import PartnerPromoSection from './PartnerPromoSection';

interface ProfileSectionProps {
  userInput: UserInput | null;
  savedCalculations: SavedCalculation[];
  onSelectCalculation: (calc: SavedCalculation) => void;
  onDeleteCalculation: (id: string) => void;
  onClearProfile: () => void;
  onHistoryMerged?: (mergedCount: number) => void;
  onOpenNotifications?: () => void;
  onOpenUsageLimitModal?: (tab?: 'crypto' | 'wheel' | 'partner' | 'money' | 'promo' | 'crypto_pay') => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  userInput,
  savedCalculations,
  onSelectCalculation,
  onDeleteCalculation,
  onClearProfile,
  onHistoryMerged,
  onOpenNotifications,
  onOpenUsageLimitModal
}) => {
  const { user, signOut } = useAuth();
  const { loadingId, setLoadingId } = useGlobalAudio();
  const { mergeLocalCalculations } = useFirestore(user?.uid);

  // Subtabs within Profile: 'calculations' | 'topups' | 'referrals'
  const [activeProfileTab, setActiveProfileTab] = useState<'calculations' | 'topups' | 'referrals'>('calculations');
  const [topupHistory, setTopupHistory] = useState<TopupTransaction[]>(() => getTopupHistory());
  const [currentAttempts, setCurrentAttempts] = useState<number>(() => getRemainingAttempts());
  const [currentCoins, setCurrentCoins] = useState<number>(() => getTapperCoinsBalance());
  const [isVip, setIsVip] = useState<boolean>(() => isVipUnlocked());

  const refreshTopupData = () => {
    setTopupHistory(getTopupHistory());
    setCurrentAttempts(getRemainingAttempts());
    setCurrentCoins(getTapperCoinsBalance());
    setIsVip(isVipUnlocked());
  };

  useEffect(() => {
    refreshTopupData();
    const handleUpdate = () => refreshTopupData();
    window.addEventListener('chubuk_topup_history_updated', handleUpdate);
    window.addEventListener('chubuk_usage_updated', handleUpdate);
    window.addEventListener('chubuk_coins_updated', handleUpdate);
    return () => {
      window.removeEventListener('chubuk_topup_history_updated', handleUpdate);
      window.removeEventListener('chubuk_usage_updated', handleUpdate);
      window.removeEventListener('chubuk_coins_updated', handleUpdate);
    };
  }, []);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [proxyTestStatus, setProxyTestStatus] = useState<{
    testing: boolean;
    success?: boolean;
    latencyMs?: number;
    message?: string;
  }>({ testing: false });

  // History Merge State
  const [localHistoryCount, setLocalHistoryCount] = useState(0);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeStatus, setMergeStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
    mergedCount?: number;
  }>({ type: 'idle', message: '' });
  
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('chubuk_auto_sync_history');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem('chubuk_last_history_sync_time');
    } catch {
      return null;
    }
  });

  const getLocalCalculations = (): SavedCalculation[] => {
    try {
      const raw = localStorage.getItem('chubuk_history');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('chubuk_custom_proxy_url') || '';
      setProxyUrl(saved);
      const localCalcs = getLocalCalculations();
      setLocalHistoryCount(localCalcs.length);
    } catch (e) {}
  }, []);

  const handleToggleAutoSync = () => {
    const nextVal = !autoSyncEnabled;
    setAutoSyncEnabled(nextVal);
    try {
      localStorage.setItem('chubuk_auto_sync_history', String(nextVal));
    } catch (e) {}
  };

  const handleMergeHistory = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsMerging(true);
    setMergeStatus({ type: 'idle', message: '' });

    try {
      const localCalcs = getLocalCalculations();
      if (localCalcs.length === 0) {
        setMergeStatus({
          type: 'success',
          message: 'Все расчеты уже синхронизированы с вашим облачным аккаунтом!'
        });
        setIsMerging(false);
        return;
      }

      const mergeResult = await mergeLocalCalculations(localCalcs);
      const mergedCount = mergeResult.mergedCount;
      const nowStr = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(nowStr);
      try {
        localStorage.setItem('chubuk_last_history_sync_time', nowStr);
      } catch (e) {}

      setMergeStatus({
        type: 'success',
        message: `Успешно объединено: ${mergedCount} расчетов перенесено в облако!`,
        mergedCount
      });

      if (onHistoryMerged) {
        onHistoryMerged(mergedCount);
      }

      setLocalHistoryCount(0);
    } catch (err: any) {
      setMergeStatus({
        type: 'error',
        message: err?.message || 'Не удалось объединить историю. Проверьте соединение.'
      });
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = async (text: string, id: string, loadingKey: string) => {
    setLoadingId(loadingKey);
    try {
      await downloadAudioForCalculation(text, id);
    } finally {
      setLoadingId(null);
    }
  };

  const handleSaveProxy = () => {
    try {
      if (proxyUrl.trim()) {
        localStorage.setItem('chubuk_custom_proxy_url', proxyUrl.trim());
      } else {
        localStorage.removeItem('chubuk_custom_proxy_url');
      }
      setProxyTestStatus({
        testing: false,
        success: true,
        message: 'Proxy сохранен и активирован'
      });
    } catch (e) {}
  };

  const runProxyTest = async () => {
    setProxyTestStatus({ testing: true });
    try {
      const result = await testAiProxyConnection();
      setProxyTestStatus({
        testing: false,
        success: result.success,
        latencyMs: result.latencyMs,
        message: result.message
      });
    } catch (err: any) {
      setProxyTestStatus({
        testing: false,
        success: false,
        message: err?.message || 'Сетевая ошибка при проверке'
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-24">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-1 shadow-lg">
          <User size={30} />
        </div>
        <h2 className="text-3xl md:text-4xl font-serif text-white tracking-wide">Личный Кабинет & Профиль</h2>
        <p className="text-slate-400 max-w-xl mx-auto text-xs md:text-sm">
          Управление облачным аккаунтом, историей расчетов, историей пополнений и реферальной программой.
        </p>
      </div>

      {/* Profile Top Navigation Subtabs Ribbon */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/10 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveProfileTab('calculations')}
          className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs sm:text-sm font-serif font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeProfileTab === 'calculations'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
              : 'bg-transparent text-slate-300 hover:bg-white/5'
          }`}
        >
          <History size={16} />
          <span>История расчетов ({savedCalculations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProfileTab('topups')}
          className={`flex-1 min-w-[190px] py-3 px-4 rounded-xl text-xs sm:text-sm font-serif font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeProfileTab === 'topups'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
              : 'bg-transparent text-slate-300 hover:bg-white/5'
          }`}
        >
          <Receipt size={16} />
          <span>История пополнений ({topupHistory.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProfileTab('referrals')}
          className={`flex-1 min-w-[190px] py-3 px-4 rounded-xl text-xs sm:text-sm font-serif font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeProfileTab === 'referrals'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
              : 'bg-transparent text-slate-300 hover:bg-white/5'
          }`}
        >
          <Users size={16} />
          <span>Партнёрка & Рефералы (+5)</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUBTAB 1: CALCULATIONS HISTORY & SYNC                    */}
      {/* ========================================================= */}
      {activeProfileTab === 'calculations' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Banner: History Merge & Cross-Device Sync Feature */}
          <div className="bg-gradient-to-r from-[#0d162d] via-[#101b38] to-[#0d162d] border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                    <ArrowRightLeft size={18} />
                  </div>
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                    Кросс-девайс доступ к расчетам
                  </span>
                  {user && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Firestore активен
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl sm:text-2xl font-serif text-white font-bold">
                  Объединение локальной истории с облаком
                </h3>
                
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Перенесите расчеты, сделанные в этом браузере, в ваш облачный аккаунт Firestore. После объединения ваши матрицы, астрологические карты и расклады Таро будут мгновенно доступны на телефоне, планшете и других устройствах.
                </p>

                {/* Status counts badge */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-slate-300">
                    <HardDrive size={14} className="text-slate-400" />
                    <span>В браузере: <strong className="text-amber-300 font-semibold">{localHistoryCount}</strong></span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-slate-300">
                    <Cloud size={14} className="text-sky-400" />
                    <span>В облаке Firestore: <strong className="text-sky-300 font-semibold">{user ? savedCalculations.length : 'Требуется вход'}</strong></span>
                  </div>

                  {lastSyncTime && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px]">
                      <Check size={12} />
                      <span>Посл. синхронизация: {lastSyncTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action area */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                {/* Auto-sync toggle */}
                <div className="flex items-center justify-between sm:justify-start lg:justify-between gap-3 p-3 rounded-2xl bg-black/30 border border-white/10">
                  <div className="text-left">
                    <p className="text-xs text-white font-medium">Автосинхронизация</p>
                    <p className="text-[10px] text-slate-400">Объединять новые расчеты с облаком</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAutoSync}
                    className="text-amber-400 hover:text-amber-300 transition-colors p-1 cursor-pointer"
                    title={autoSyncEnabled ? "Автосинхронизация включена" : "Автосинхронизация выключена"}
                  >
                    {autoSyncEnabled ? (
                      <ToggleRight size={32} className="text-amber-400" />
                    ) : (
                      <ToggleLeft size={32} className="text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Merge button */}
                {user ? (
                  <button
                    type="button"
                    onClick={handleMergeHistory}
                    disabled={isMerging}
                    className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isMerging ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Синхронизация с Firestore...</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload size={16} />
                        <span>Объединить историю ({localHistoryCount})</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <LogIn size={16} />
                    <span>Войти для синхронизации</span>
                  </button>
                )}
              </div>
            </div>

            {/* Merge feedback banner */}
            <AnimatePresence>
              {mergeStatus.message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-4 p-3 rounded-2xl text-xs flex items-center gap-2.5 ${
                    mergeStatus.type === 'success' 
                      ? 'bg-emerald-950/70 text-emerald-200 border border-emerald-500/40' 
                      : 'bg-red-950/70 text-red-200 border border-red-500/40'
                  }`}
                >
                  {mergeStatus.type === 'success' ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle size={16} className="text-red-400 shrink-0" />
                  )}
                  <span className="flex-1">{mergeStatus.message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column: Account & Profile Details */}
            <div className="md:col-span-1 space-y-6">
              
              {/* Account Sync Card */}
              <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5 shadow-xl">
                <h3 className="text-lg font-serif text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield size={18} className="text-amber-400" />
                    Аккаунт
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${user ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                    {user ? 'В сети' : 'Гость'}
                  </span>
                </h3>

                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border border-amber-500/30" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold font-serif">
                          {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white font-medium truncate">{user.displayName || 'Искатель'}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email || 'Гостевой аккаунт'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => signOut()}
                      className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold flex items-center justify-center gap-2 border border-red-500/20 transition-all cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Выйти из аккаунта</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Войдите или зарегистрируйтесь, чтобы ваши матрицы и история были защищены и доступны на любом устройстве.
                    </p>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 text-black font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:from-amber-500 hover:to-amber-400 transition-all cursor-pointer"
                    >
                      <LogIn size={15} />
                      <span>Войти / Создать аккаунт</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Current Calculation Profile */}
              <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5 shadow-xl">
                <h3 className="text-lg font-serif text-white flex items-center gap-2">
                  <User size={18} className="text-amber-400" />
                  Текущий расчет
                </h3>
                
                {userInput ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold font-serif text-lg">
                        {userInput.name[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{userInput.name}</p>
                        <p className="text-[11px] text-amber-300/80 uppercase tracking-wider">{userInput.gender === 'male' ? 'Мужчина' : 'Женщина'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-slate-300 text-xs px-1">
                      <Calendar size={15} className="text-amber-400" />
                      <span>{new Date(userInput.birthDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>

                    <button 
                      onClick={onClearProfile}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all border border-white/5 cursor-pointer"
                    >
                      Сбросить введенные данные
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-slate-400 text-xs italic">Данные еще не введены.</p>
                    <p className="text-[11px] text-slate-500">Рассчитайте свою матрицу на главной странице.</p>
                  </div>
                )}
              </div>

              {/* Push Notifications & Reminders Panel */}
              <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-serif text-white flex items-center gap-2">
                    <BellRing size={16} className="text-amber-400" />
                    Push-Уведомления
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    PWA / Web
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Напоминания о ежедневных прогнозах, лунных фазах, смене биоритмов и благоприятных датах для сделок и свадеб.
                </p>

                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Bell size={14} className="text-amber-400" />
                  <span>Настроить каналы и время</span>
                </button>
              </div>

              {/* AI Connection & Proxy Panel */}
              <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-serif text-white flex items-center gap-2">
                    <Radio size={16} className="text-emerald-400 animate-pulse" />
                    Связь с AI (Без VPN)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                    Активен
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Все запросы к AI проксируются через защищенный европейский сервер. VPN на телефоне не требуется.
                </p>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span>Шлюз по умолчанию:</span>
                    <span className="text-amber-300 font-mono text-[10px]">Cloud Run Europe</span>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => runProxyTest()}
                      disabled={proxyTestStatus.testing}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {proxyTestStatus.testing ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      <span>Проверить скорость связи</span>
                    </button>
                  </div>

                  {proxyTestStatus.message && (
                    <div className={`p-2 rounded-xl text-[11px] flex items-center gap-2 ${proxyTestStatus.success ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-red-950/60 text-red-300 border border-red-500/30'}`}>
                      {proxyTestStatus.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                      <span>{proxyTestStatus.message}</span>
                    </div>
                  )}
                </div>

                {/* Custom Proxy Accordion */}
                <details className="group text-xs text-slate-400">
                  <summary className="cursor-pointer font-medium text-[11px] text-amber-400/80 hover:text-amber-300 select-none py-1">
                    Пользовательский Proxy URL (Опционально)
                  </summary>
                  <div className="pt-2 space-y-2">
                    <input
                      type="url"
                      value={proxyUrl}
                      onChange={(e) => setProxyUrl(e.target.value)}
                      placeholder="https://your-worker.workers.dev"
                      className="w-full bg-[#060913] border border-white/10 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveProxy}
                      className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-all"
                    >
                      Сохранить свой Proxy
                    </button>
                  </div>
                </details>
              </div>
            </div>

            {/* Right Column: History Section */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 min-h-[450px] shadow-xl flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-serif text-white flex items-center gap-3">
                    <History size={22} className="text-amber-400" />
                    История Расчетов
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Всего: {savedCalculations.length}
                    </span>
                    {savedCalculations.length > 0 && (
                      <button 
                        onClick={() => exportCalculationsToPdf(savedCalculations)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 uppercase tracking-wider transition-all border border-amber-500/30 cursor-pointer"
                      >
                        <Download size={14} />
                        PDF
                      </button>
                    )}
                  </div>
                </div>

                {savedCalculations.length > 0 ? (
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
                    {savedCalculations.map((calc) => (
                      <motion.div 
                        key={calc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{calc.input.name}</p>
                            <p className="text-[11px] text-slate-400">
                              {new Date(calc.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                          <button 
                            onClick={() => {
                              const fullText = [
                                calc.analysis?.introduction,
                                calc.analysis?.sections.map(s => `${s.title}: ${s.content}`).join('\n')
                              ].filter(Boolean).join('\n\n');
                              handleDownload(fullText.slice(0, 4500), `matrix_${calc.id}`, `dl_matrix_${calc.id}`);
                            }}
                            className="p-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all cursor-pointer"
                            title="Аудио: Матрица"
                          >
                            {loadingId === `dl_matrix_${calc.id}` ? <Loader2 className="animate-spin w-4 h-4" /> : <MessageCircle size={16} />}
                          </button>
                          {calc.astrologyResult && (
                            <button 
                              onClick={() => {
                                const fullText = [
                                  calc.astrologyResult?.introduction,
                                  calc.astrologyResult?.natalChart,
                                  calc.astrologyResult?.aspects?.map(a => `${a.title}: ${a.description}`).join('\n'),
                                  calc.astrologyResult?.spiritualPath,
                                  calc.astrologyResult?.professionalPath,
                                  calc.astrologyResult?.advice
                                ].filter(Boolean).join('\n\n');
                                handleDownload(fullText.slice(0, 4500), `astro_${calc.id}`, `dl_astro_${calc.id}`);
                              }}
                              className="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
                              title="Аудио: Астрология"
                            >
                              {loadingId === `dl_astro_${calc.id}` ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles size={16} />}
                            </button>
                          )}
                          {calc.tarotReading && (
                            <button 
                              onClick={() => {
                                const fullText = [
                                  calc.tarotReading?.cards?.map(c => c.name).join(', '),
                                  calc.tarotReading?.interpretation,
                                  calc.tarotReading?.advice
                                ].filter(Boolean).join('\n\n');
                                handleDownload(fullText.slice(0, 4500), `tarot_${calc.id}`, `dl_tarot_${calc.id}`);
                              }}
                              className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                              title="Аудио: Таро"
                            >
                              {loadingId === `dl_tarot_${calc.id}` ? <Loader2 className="animate-spin w-4 h-4" /> : <Eye size={16} />}
                            </button>
                          )}
                          <button 
                            onClick={() => exportCalculationsToPdf([calc])}
                            className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                            title="Скачать PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button 
                            onClick={() => onSelectCalculation(calc)}
                            className="p-2 rounded-xl bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
                            title="Открыть расчет"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button 
                            onClick={() => onDeleteCalculation(calc.id)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-3 opacity-40">
                    <History size={48} />
                    <p className="text-base font-serif">История пока пуста</p>
                    <p className="text-xs max-w-xs mx-auto">Каждый рассчитанный вами анализ будет автоматически сохраняться здесь.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: TOPUP & REWARD TRANSACTIONS HISTORY            */}
      {/* ========================================================= */}
      {activeProfileTab === 'topups' && (
        <div className="space-y-6 animate-fade-in">
          {/* Balance overview summary card */}
          <div className="bg-gradient-to-r from-[#0d162d] via-[#101b38] to-[#0d162d] border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Receipt size={20} className="text-amber-400" />
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                    Текущий баланс и история пополнений
                  </span>
                </div>
                <h3 className="text-2xl font-serif text-white font-bold">
                  {isVip ? '👑 VIP Безлимит' : `${currentAttempts} доступных попыток`}
                </h3>
                <p className="text-xs text-slate-300">
                  Баланс карма-токенов: <strong className="text-amber-300 font-mono">{currentCoins.toLocaleString('ru-RU')} $CHUBUK</strong>
                </p>
              </div>

              {/* Quick Top-up Button */}
              {onOpenUsageLimitModal && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenUsageLimitModal('money')}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-serif font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <CreditCard size={14} />
                    <span>Пополнить (СБП / Карта)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenUsageLimitModal('crypto_pay')}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-serif font-bold text-xs flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer"
                  >
                    <Wallet size={14} className="text-amber-400" />
                    <span>Криптошлюз</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-serif text-white font-bold flex items-center gap-2.5">
                <Clock size={20} className="text-amber-400" />
                <span>Все транзакции, оплаты и награды</span>
              </h3>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {topupHistory.length} записей
              </span>
            </div>

            {topupHistory.length > 0 ? (
              <div className="space-y-3">
                {topupHistory.map((tx) => {
                  const getIcon = () => {
                    switch (tx.type) {
                      case 'purchase_rub':
                        return <CreditCard size={18} className="text-emerald-400" />;
                      case 'crypto_deposit':
                        return <Wallet size={18} className="text-teal-400" />;
                      case 'crypto_swap':
                        return <Coins size={18} className="text-amber-400" />;
                      case 'wheel_reward':
                        return <Sparkles size={18} className="text-purple-400" />;
                      case 'partner_task':
                        return <Gift size={18} className="text-rose-400" />;
                      case 'referral_bonus':
                        return <Users size={18} className="text-sky-400" />;
                      default:
                        return <Zap size={18} className="text-amber-400" />;
                    }
                  };

                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                          {getIcon()}
                        </div>
                        <div>
                          <div className="text-sm font-serif font-bold text-white flex items-center gap-2">
                            <span>{tx.title}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                              {tx.status === 'completed' ? 'Успешно' : 'В обработке'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{new Date(tx.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            {tx.details && <span>• {tx.details}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-mono font-bold text-emerald-400">
                          +{tx.amountAttempts} попыток
                        </div>
                        {tx.priceFormatted && (
                          <div className="text-[11px] font-mono text-amber-300/80">
                            {tx.priceFormatted}
                          </div>
                        )}
                        {tx.amountCoins !== undefined && tx.amountCoins !== 0 && (
                          <div className={`text-[10px] font-mono ${tx.amountCoins > 0 ? 'text-amber-300' : 'text-slate-400'}`}>
                            {tx.amountCoins > 0 ? `+${tx.amountCoins.toLocaleString('ru-RU')} $CHUBUK` : `${tx.amountCoins.toLocaleString('ru-RU')} $CHUBUK`}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3 opacity-60">
                <Receipt size={40} className="mx-auto text-slate-400" />
                <p className="text-sm font-serif text-slate-300">История пополнений пуста</p>
                <p className="text-xs text-slate-400">
                  Пополняйте баланс через СБП, криптокошельки или крутите Колесо Фортуны!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 3: PARTNER PROMO & REFERRAL PROGRAM                */}
      {/* ========================================================= */}
      {activeProfileTab === 'referrals' && (
        <div className="animate-fade-in">
          <PartnerPromoSection
            onOpenUsageLimitModal={onOpenUsageLimitModal}
          />
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default ProfileSection;
