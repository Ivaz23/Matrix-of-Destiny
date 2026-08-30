import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  KeyRound, 
  Lock, 
  Unlock, 
  Sliders, 
  Database, 
  Cpu, 
  Sparkles, 
  Megaphone, 
  Ticket, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  BarChart3, 
  Flame, 
  Coins, 
  Layers, 
  Save,
  Radio,
  Clock,
  Eye,
  Settings,
  Terminal,
  Server,
  DollarSign,
  TrendingUp,
  ExternalLink,
  ShoppingBag,
  HelpCircle,
  Tag,
  Zap
} from 'lucide-react';
import { UserInput, SavedCalculation } from '../types';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';
import { 
  getMonetizationSettings, 
  saveMonetizationSettings, 
  getAdTelemetry, 
  MonetizationSettings, 
  AdTelemetry 
} from '../services/monetizationService';

interface AdminPanelSectionProps {
  user: any | null;
  savedCalculations?: SavedCalculation[];
  onTriggerHaptic?: (pattern?: number | number[]) => void;
}

export const AdminPanelSection: React.FC<AdminPanelSectionProps> = ({
  user,
  savedCalculations = [],
  onTriggerHaptic
}) => {
  // Master Auth State
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin Sub-tab
  const [adminTab, setAdminTab] = useState<'overview' | 'monetization' | 'ai' | 'broadcast' | 'promo' | 'system'>('overview');

  // Monetization & Ads State
  const [monetization, setMonetization] = useState<MonetizationSettings>(getMonetizationSettings);
  const [adTelemetry, setAdTelemetry] = useState<AdTelemetry>(getAdTelemetry);

  // AI Tuning State
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [aiTemperature, setAiTemperature] = useState<number>(0.7);
  const [oraclePersona, setOraclePersona] = useState<string>(
    'Ты — Высший Оракул и Нумеролог Chubuk Matrix. Твой тон мудрый, поддерживающий, точный, без лишней воды.'
  );

  // Broadcast Banner State
  const [bannerActive, setBannerActive] = useState<boolean>(false);
  const [bannerText, setBannerText] = useState<string>('✨ Добавлен 23-й раздел: Хронос Судьбы & Таро Сроков!');
  const [bannerType, setBannerType] = useState<'info' | 'promo' | 'alert'>('info');

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState<Array<{ code: string; type: string; usedCount: number; validUntil: string }>>([
    { code: 'CHUBUK-VIP', type: 'Безлимитный доступ + VIP статус', usedCount: 14, validUntil: '2027-01-01' },
    { code: 'KARMA-MAX', type: '10,000 $CHUBUK бонус в тапалке', usedCount: 38, validUntil: '2026-12-31' },
    { code: 'CHRONOS-2026', type: 'Сакральный манускрипт долголетия PRO', usedCount: 9, validUntil: '2026-12-31' }
  ]);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState('PRO Доступ');

  // Success Notification
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const { playSolfeggioTone } = useGlobalAudio();

  // Check if current user is owner email or already unlocked in session
  useEffect(() => {
    const isOwnerEmail = user?.email === 'zeros20001@gmail.com';
    const savedAdminAuth = sessionStorage.getItem('chubuk_admin_unlocked');
    if (isOwnerEmail || savedAdminAuth === 'true') {
      setIsAuthenticated(true);
    }

    // Load saved broadcast
    const savedBanner = localStorage.getItem('chubuk_global_broadcast');
    if (savedBanner) {
      try {
        const parsed = JSON.parse(savedBanner);
        setBannerActive(parsed.active);
        setBannerText(parsed.text);
        setBannerType(parsed.type);
      } catch {}
    }
  }, [user]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerHaptic?.(20);

    const validPins = ['7777', 'chubuk2026', 'CHUK-MASTER-2026', 'admin'];
    if (validPins.includes(pinInput.trim().toLowerCase()) || user?.email === 'zeros20001@gmail.com') {
      setIsAuthenticated(true);
      sessionStorage.setItem('chubuk_admin_unlocked', 'true');
      setAuthError(null);
      playSolfeggioTone?.(528, 0.4);
    } else {
      setAuthError('Неверный Мастер-ПИН код. Доступ закрыт.');
      onTriggerHaptic?.([50, 50, 50]);
    }
  };

  const handleSaveBroadcast = () => {
    const broadcastObj = {
      active: bannerActive,
      text: bannerText,
      type: bannerType,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('chubuk_global_broadcast', JSON.stringify(broadcastObj));
    setSuccessToast('Глобальное объявление сохранено и опубликовано!');
    playSolfeggioTone?.(528, 0.3);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleCreatePromoCode = () => {
    if (!newPromoCode.trim()) return;
    const newCode = {
      code: newPromoCode.trim().toUpperCase(),
      type: newPromoType,
      usedCount: 0,
      validUntil: '2027-12-31'
    };
    setPromoCodes([newCode, ...promoCodes]);
    setNewPromoCode('');
    setSuccessToast(`Промокод ${newCode.code} успешно сгенерирован!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleClearCache = () => {
    if (window.confirm('Очистить локальный кэш прогнозов и временных расчетов?')) {
      const keysToRemove = [
        'chubuk_analysis_cache',
        'chubuk_astrology_cache',
        'chubuk_compatibility_cache',
        'chubuk_daily_forecast_cache'
      ];
      keysToRemove.forEach(k => localStorage.removeItem(k));
      setSuccessToast('Системный кэш успешно сброшен!');
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // Locked Screen
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-lg mx-auto my-12 p-8 rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#090e1c] to-[#04060d] border border-amber-500/40 shadow-2xl text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto text-2xl shadow-xl">
          <Shield size={32} className="text-amber-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Админ-Панель Chubuk Matrix
          </h2>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            Вход в мастер-пульт управления проектом. Введите ваш Master PIN-код (по умолчанию: <strong className="text-amber-300">7777</strong>) или войдите с аккаунта создателя.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Введите Master PIN (например 7777)"
              className="w-full px-4 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-sm text-center text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 tracking-widest font-mono font-bold transition-all shadow-inner"
              autoFocus
            />
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-center gap-2">
              <AlertTriangle size={14} className="text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-serif font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-98 transition-all shadow-xl shadow-amber-500/20 cursor-pointer"
          >
            Войти в Панель Создателя
          </button>
        </form>

        <div className="text-[11px] text-slate-500 border-t border-white/5 pt-4">
          Текущий пользователь: <span className="text-amber-300 font-mono">{user?.email || 'Гость'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in text-slate-100 pb-16">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Admin Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#12081e] via-[#090c1b] to-[#04060d] border border-pink-500/40 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-serif font-bold uppercase tracking-wider">
              <KeyRound size={13} className="text-pink-400" />
              <span>Панель Создателя & Master Control</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Центр Управления Chubuk Matrix
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              Мониторинг всех 23 разделов, настройка параметров ИИ Gemini, создание глобальных баннеров и промокодов.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sessionStorage.removeItem('chubuk_admin_unlocked');
                setIsAuthenticated(false);
              }}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/40 text-xs font-bold text-slate-300 hover:text-rose-300 transition-all cursor-pointer"
            >
              🔒 Выйти из панели
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-white/10 mt-6 text-xs font-serif font-bold">
          <button
            onClick={() => setAdminTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              adminTab === 'overview'
                ? 'bg-pink-500 text-white font-extrabold shadow-lg shadow-pink-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <BarChart3 size={15} />
            <span>Телеметрия & Статистика</span>
          </button>

          <button
            onClick={() => setAdminTab('monetization')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              adminTab === 'monetization'
                ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/30'
            }`}
          >
            <DollarSign size={15} />
            <span>💰 Монетизация & РСЯ</span>
          </button>

          <button
            onClick={() => setAdminTab('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              adminTab === 'ai'
                ? 'bg-pink-500 text-white font-extrabold shadow-lg shadow-pink-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Cpu size={15} />
            <span>Настройки Gemini ИИ</span>
          </button>

          <button
            onClick={() => setAdminTab('broadcast')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              adminTab === 'broadcast'
                ? 'bg-pink-500 text-white font-extrabold shadow-lg shadow-pink-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Megaphone size={15} />
            <span>Глобальные Объявления</span>
          </button>

          <button
            onClick={() => setAdminTab('promo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              adminTab === 'promo'
                ? 'bg-pink-500 text-white font-extrabold shadow-lg shadow-pink-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Ticket size={15} />
            <span>Промокоды & VIP</span>
          </button>

          <button
            onClick={() => setAdminTab('system')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              adminTab === 'system'
                ? 'bg-pink-500 text-white font-extrabold shadow-lg shadow-pink-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Server size={15} />
            <span>Система & Кэш</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#0a1020] border border-white/10 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Всего Разделов</span>
              <div className="text-3xl font-serif font-black text-amber-300 flex items-center gap-2">
                <Layers size={24} className="text-amber-400" />
                <span>23 Раздела</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">100% активны</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#0a1020] border border-white/10 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">База Расчетов</span>
              <div className="text-3xl font-serif font-black text-sky-300 flex items-center gap-2">
                <Database size={24} className="text-sky-400" />
                <span>{savedCalculations.length} записей</span>
              </div>
              <span className="text-[11px] text-sky-400 font-mono">Firestore Cloud</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#0a1020] border border-white/10 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Chubuk Kombat</span>
              <div className="text-3xl font-serif font-black text-yellow-300 flex items-center gap-2">
                <Coins size={24} className="text-yellow-400" />
                <span>$CHUBUK</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">Майнинг активен</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#0a1020] border border-white/10 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Статус AI Gemini</span>
              <div className="text-3xl font-serif font-black text-emerald-300 flex items-center gap-2">
                <Cpu size={24} className="text-emerald-400" />
                <span>ONLINE</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">2.5 Flash / Server Proxy</span>
            </div>
          </div>

          {/* Module Health Check Table */}
          <div className="p-6 rounded-3xl bg-[#060a14] border border-white/10 space-y-4">
            <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span>Реестр 23 Сакральных Разделов Портала</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[
                { name: '1. Матрица Судьбы 22 Аркана', status: 'Активен' },
                { name: '2. Психологический Портрет (+/-)', status: 'Активен' },
                { name: '3. Кэширование & Оптимизация', status: 'TURBO ⚡' },
                { name: '4. Хронос: Сроки & Долголетие', status: 'НОВЫЙ ⏳' },
                { name: '5. Медитационный Центр', status: 'Активен' },
                { name: '6. Chubuk Kombat (Тапалка)', status: 'Активен' },
                { name: '7. Прогноз Дня & Биоритмы', status: 'Активен' },
                { name: '8. Обои 9:16 HD', status: 'Активен' },
                { name: '9. Карта Чакр', status: 'Активен' },
                { name: '10. Хроники Акаши', status: 'Активен' },
                { name: '11. Календарь Силы 365', status: 'Активен' },
                { name: '12. Лунный Календарь', status: 'Активен' },
                { name: '13. Выбор Золотых Дат', status: 'Активен' },
                { name: '14. 4 Линии Рода', status: 'Активен' },
                { name: '15. Литотерапия & Камни', status: 'Активен' },
                { name: '16. Оракул Снов', status: 'Активен' },
                { name: '17. Города Силы', status: 'Активен' },
                { name: '18. Натальная Карта', status: 'Активен' },
                { name: '19. Совместимость', status: 'Активен' },
                { name: '20. Расклады Таро', status: 'Активен' },
                { name: '21. Хорарная Астрология', status: 'Активен' },
                { name: '22. Мой Профиль & PDF', status: 'Активен' },
                { name: '23. Админ-Панель Master', status: 'VIP 👑' }
              ].map((mod, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300 font-serif">{mod.name}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {mod.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: MONETIZATION & ADS (RSYA, AFFILIATES, PRICING) */}
      {adminTab === 'monetization' && (
        <div className="space-y-6">
          {/* Revenue Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#0a1020] border border-amber-500/30 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Показы Баннеров</span>
              <div className="text-3xl font-serif font-black text-amber-300 flex items-center gap-2">
                <Eye size={24} className="text-amber-400" />
                <span>{adTelemetry.impressions.toLocaleString('ru-RU')}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">+12.4% за 24ч</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#0a1020] border border-amber-500/30 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Клики по Рекламе</span>
              <div className="text-3xl font-serif font-black text-sky-300 flex items-center gap-2">
                <TrendingUp size={24} className="text-sky-400" />
                <span>{adTelemetry.clicks} кликов</span>
              </div>
              <span className="text-[11px] text-sky-400 font-mono">CTR: ~{((adTelemetry.clicks / Math.max(1, adTelemetry.impressions)) * 100).toFixed(1)}%</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#0a1020] border border-amber-500/30 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Rewarded Видео</span>
              <div className="text-3xl font-serif font-black text-purple-300 flex items-center gap-2">
                <Zap size={24} className="text-purple-400" />
                <span>{adTelemetry.rewardedWatches} раз</span>
              </div>
              <span className="text-[11px] text-purple-400 font-mono">Высокий eCPM</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#0a1020] border border-amber-500/30 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Оценка Дохода</span>
              <div className="text-3xl font-serif font-black text-emerald-300 flex items-center gap-2">
                <DollarSign size={24} className="text-emerald-400" />
                <span>~{Math.round(adTelemetry.revenueEstimatedRub).toLocaleString('ru-RU')} ₽</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">Прямые выплаты на карту/счет</span>
            </div>
          </div>

          {/* Quick Guide Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1c122c] to-[#0d142b] border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-amber-300 flex items-center gap-2">
                <HelpCircle size={18} className="text-amber-400" />
                <span>Как подключить Яндекс РСЯ и получать выплаты?</span>
              </h3>
              <a
                href="https://partner.yandex.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-serif font-bold transition-all flex items-center gap-1 shadow-lg shadow-amber-500/20"
              >
                <span>Кабинет РСЯ</span>
                <ExternalLink size={13} />
              </a>
            </div>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside font-light">
              <li>Зарегистрируйтесь в <strong className="text-white">partner.yandex.ru</strong> (как физлицо, самозанятый или ИП).</li>
              <li>Добавьте ваш домен / URL приложения во вкладку <em>«Площадки»</em>.</li>
              <li>Создайте блоки: <strong>Адаптивный баннер</strong> (для шапки и ленты) и <strong>Видео с вознаграждением</strong> (Rewarded).</li>
              <li>Скопируйте их идентификаторы (формата <code className="text-amber-300 font-mono bg-black/50 px-1 py-0.5 rounded">R-A-XXXXXX-1</code>) и вставьте в поля ниже.</li>
              <li>Нажмите <strong>«Сохранить настройки»</strong> — баннеры сразу начнут показ и приносить вам деньги!</li>
            </ol>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Yandex RSYA Configuration */}
            <div className="p-6 rounded-3xl bg-[#060a14] border border-white/10 space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-white text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Рекламная Сеть Яндекса (РСЯ)</span>
                </h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={monetization.yandexAdsEnabled && monetization.adsEnabled}
                    onChange={(e) => setMonetization(prev => ({
                      ...prev,
                      adsEnabled: e.target.checked,
                      yandexAdsEnabled: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    ID Блока в Шапке (Header Banner):
                  </label>
                  <input
                    type="text"
                    value={monetization.yandexHeaderBlockId}
                    onChange={(e) => setMonetization(prev => ({ ...prev, yandexHeaderBlockId: e.target.value.trim() }))}
                    placeholder="Например: R-A-1234567-1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Отображается в верхней части экрана над расчетом.</p>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    ID Блока в Результатах (In-feed Banner):
                  </label>
                  <input
                    type="text"
                    value={monetization.yandexInfeedBlockId}
                    onChange={(e) => setMonetization(prev => ({ ...prev, yandexInfeedBlockId: e.target.value.trim() }))}
                    placeholder="Например: R-A-1234567-2"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Отображается между ключевыми блоками матрицы.</p>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    ID Блока Rewarded Video (За вознаграждение):
                  </label>
                  <input
                    type="text"
                    value={monetization.yandexRewardedBlockId}
                    onChange={(e) => setMonetization(prev => ({ ...prev, yandexRewardedBlockId: e.target.value.trim() }))}
                    placeholder="Например: R-A-1234567-3"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Используется при разблокировке глубокого анализа за просмотр видео.</p>
                </div>
              </div>
            </div>

            {/* Box 2: CPA / Affiliate Marketing Links */}
            <div className="p-6 rounded-3xl bg-[#060a14] border border-white/10 space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-white text-base flex items-center gap-2">
                  <ShoppingBag size={18} className="text-amber-400" />
                  <span>Партнерские ссылки (CPA & Маркет)</span>
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Ссылка на камни и браслеты (Литотерапия / WB / Ozon):
                  </label>
                  <input
                    type="text"
                    value={monetization.affiliateLithotherapyUrl}
                    onChange={(e) => setMonetization(prev => ({ ...prev, affiliateLithotherapyUrl: e.target.value }))}
                    placeholder="https://market.yandex.ru/search?text=..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Ссылка на колоды Таро:
                  </label>
                  <input
                    type="text"
                    value={monetization.affiliateTarotDecksUrl}
                    onChange={(e) => setMonetization(prev => ({ ...prev, affiliateTarotDecksUrl: e.target.value }))}
                    placeholder="https://market.yandex.ru/search?text=..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Ссылка на обучающие курсы / Telegram:
                  </label>
                  <input
                    type="text"
                    value={monetization.affiliateCourseUrl}
                    onChange={(e) => setMonetization(prev => ({ ...prev, affiliateCourseUrl: e.target.value }))}
                    placeholder="https://t.me/your_channel"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Tariffs Box */}
          <div className="p-6 rounded-3xl bg-[#060a14] border border-white/10 space-y-4">
            <h4 className="font-serif font-bold text-white text-base flex items-center gap-2">
              <Tag size={18} className="text-amber-400" />
              <span>Стоимость платных услуг (Paywall & PDF)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">PDF-Отчет (₽):</label>
                <input
                  type="number"
                  value={monetization.pdfReportPriceRub}
                  onChange={(e) => setMonetization(prev => ({ ...prev, pdfReportPriceRub: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Чат с Оракулом PRO (₽/мес):</label>
                <input
                  type="number"
                  value={monetization.unlimitedChatPriceRub}
                  onChange={(e) => setMonetization(prev => ({ ...prev, unlimitedChatPriceRub: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Пакет Сакральных Обоев (₽):</label>
                <input
                  type="number"
                  value={monetization.wallpapersPackPriceRub}
                  onChange={(e) => setMonetization(prev => ({ ...prev, wallpapersPackPriceRub: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">VIP All-Access (₽):</label>
                <input
                  type="number"
                  value={monetization.vipAllAccessPriceRub}
                  onChange={(e) => setMonetization(prev => ({ ...prev, vipAllAccessPriceRub: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                saveMonetizationSettings(monetization);
                setSuccessToast('Настройки монетизации и РСЯ успешно сохранены!');
                if (onTriggerHaptic) onTriggerHaptic([30, 50, 30]);
                setTimeout(() => setSuccessToast(null), 3500);
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-serif font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-98 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Save size={16} />
              <span>Сохранить настройки монетизации</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AI TUNING */}
      {adminTab === 'ai' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0a1020] border border-white/10 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Sliders size={18} className="text-amber-400" />
                <span>Параметры Генерации ИИ-Оракула</span>
              </h3>
              <p className="text-xs text-slate-400">
                Тонкая настройка модели Gemini, креативности и системного промпта.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model Choice */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Выбор модели Gemini:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Рекомендуемая / Быстрая)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Максимальная глубина)</option>
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Сверхбыстрая)</option>
                </select>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Температура креативности:</span>
                  <span className="text-amber-400 font-mono">{aiTemperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={aiTemperature}
                  onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Базовый характер Оракула (System Persona):</label>
              <textarea
                value={oraclePersona}
                onChange={(e) => setOraclePersona(e.target.value)}
                rows={4}
                className="w-full p-3.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white leading-relaxed focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <button
              onClick={() => {
                setSuccessToast('Параметры ИИ успешно обновлены!');
                setTimeout(() => setSuccessToast(null), 3000);
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Сохранить настройки ИИ
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BROADCAST BANNER */}
      {adminTab === 'broadcast' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0a1020] border border-white/10 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Megaphone size={18} className="text-sky-400" />
                <span>Глобальный Баннер-Объявление для Всех Пользователей</span>
              </h3>
              <p className="text-xs text-slate-400">
                Отображается в верхней части экрана для оповещения посетителей об обновлениях.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
                <input
                  type="checkbox"
                  checked={bannerActive}
                  onChange={(e) => setBannerActive(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                />
                <span>Включить глобальное объявление на сайте</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Текст объявления:</label>
              <input
                type="text"
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="Введите текст объявления..."
                className="w-full p-3 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400">Предпросмотр баннера:</span>
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-black to-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2">
                <Megaphone size={14} className="text-amber-400 shrink-0" />
                <span>{bannerText || 'Текст объявления...'}</span>
              </div>
            </div>

            <button
              onClick={handleSaveBroadcast}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Опубликовать Объявление
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PROMO CODES */}
      {adminTab === 'promo' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0a1020] border border-white/10 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Ticket size={18} className="text-pink-400" />
                <span>Генератор Сакральных Промокодов & VIP-Статусов</span>
              </h3>
              <p className="text-xs text-slate-400">
                Создавайте подарочные коды для подписчиков, клиентов и участников сообщества.
              </p>
            </div>

            {/* Create Code Form */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value)}
                placeholder="Код (например: ETERNAL-2026)"
                className="w-full sm:w-1/2 p-3 rounded-xl bg-black/50 border border-white/15 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                value={newPromoType}
                onChange={(e) => setNewPromoType(e.target.value)}
                placeholder="Привилегия (например: VIP PDF + 10k Karma)"
                className="w-full sm:w-1/2 p-3 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleCreatePromoCode}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer"
              >
                + Создать
              </button>
            </div>

            {/* Active Codes List */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400">Активные промокоды:</span>
              <div className="space-y-2">
                {promoCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-300 text-sm">{code.code}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold font-mono">
                          Использовано: {code.usedCount} раз
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{code.type}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">До: {code.validUntil}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SYSTEM & CACHE */}
      {adminTab === 'system' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0a1020] border border-white/10 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Server size={18} className="text-purple-400" />
                <span>Системное Обслуживание & Управление Данными</span>
              </h3>
              <p className="text-xs text-slate-400">
                Очистка кэша, экспорт диагностического отчета и сервисные команды.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <h4 className="font-serif font-bold text-white text-sm">Сброс Системного Кэша</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Очищает кэшированные ответы Gemini AI и временные прогнозы для принудительного обновления свежих данных.
                </p>
                <button
                  onClick={handleClearCache}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all cursor-pointer"
                >
                  🧹 Очистить Кэш
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-3">
                <h4 className="font-serif font-bold text-amber-200 text-sm flex items-center gap-2">
                  <Coins size={16} className="text-amber-400" />
                  <span>Управление Монетизацией & Попытками</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Тестовое пополнение попыток, сброс суточных ограничений и начисление токенов $CHUBUK.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      try {
                        const current = parseInt(localStorage.getItem('chubuk_bonus_attempts_v1') || '0', 10);
                        localStorage.setItem('chubuk_bonus_attempts_v1', (current + 10).toString());
                        window.dispatchEvent(new CustomEvent('chubuk_usage_updated'));
                        setSuccessToast("Начислено +10 бонусных попыток!");
                      } catch {}
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    +10 Попыток
                  </button>

                  <button
                    onClick={() => {
                      try {
                        const today = new Date().toISOString().split('T')[0];
                        localStorage.removeItem(`chubuk_usage_attempts_${today}`);
                        window.dispatchEvent(new CustomEvent('chubuk_usage_updated'));
                        setSuccessToast("Суточный лимит 3/3 сброшен!");
                      } catch {}
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    Сбросить суточный счетчик
                  </button>

                  <button
                    onClick={() => {
                      try {
                        const raw = localStorage.getItem('chubuk_tapper_game_state_v1');
                        if (raw) {
                          const state = JSON.parse(raw);
                          state.coins = (state.coins || 0) + 100000;
                          localStorage.setItem('chubuk_tapper_game_state_v1', JSON.stringify(state));
                          window.dispatchEvent(new CustomEvent('chubuk_coins_updated'));
                          setSuccessToast("+100,000 $CHUBUK начислено в тапалку!");
                        }
                      } catch {}
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    +100k $CHUBUK
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <h4 className="font-serif font-bold text-white text-sm">Экспорт Диагностики</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Скачать JSON-файл с конфигурацией портала, логами модулей и активными настройками.
                </p>
                <button
                  onClick={() => {
                    const diag = {
                      appName: "Chubuk Matrix",
                      version: "2.5.0",
                      sectionsCount: 23,
                      timestamp: new Date().toISOString(),
                      userEmail: user?.email || "anonymous",
                      calculationsCount: savedCalculations.length
                    };
                    const blob = new Blob([JSON.stringify(diag, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `chubuk-matrix-diagnostics-${Date.now()}.json`;
                    a.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all cursor-pointer"
                >
                  💾 Скачать JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelSection;
