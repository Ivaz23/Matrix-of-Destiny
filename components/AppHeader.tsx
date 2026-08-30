import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Smartphone, 
  Mic, 
  User as UserIcon, 
  LogIn, 
  LogOut, 
  Layers, 
  Moon, 
  ChevronLeft,
  Search,
  Radio,
  Sliders,
  Bell
} from 'lucide-react';
import { AppNavTabId } from './AppSidebarNavigation';
import { UserInput, MatrixNumbers } from '../types';
import { isUserAdmin, getRemainingAttempts, MAX_FREE_ATTEMPTS, isVipUnlocked } from '../services/usageLimitService';
import { getUserCustomAvatar, UserCustomAvatar } from '../services/avatarService';

interface AppHeaderProps {
  activeTab: AppNavTabId;
  onSelectTab: (tabId: AppNavTabId) => void;
  onOpenSidebar: () => void;
  onOpenAndroidModal: () => void;
  onOpenVoiceChat?: () => void;
  onOpenNotifications?: () => void;
  onOpenAdminAuth?: () => void;
  onOpenUsageLimitModal?: () => void;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
  userInput: UserInput | null;
  matrix: MatrixNumbers | null;
  onTriggerHaptic?: (pattern?: number | number[]) => void;
}

const TAB_TITLES: Record<AppNavTabId, { title: string; subtitle: string; icon: string }> = {
  matrix: { title: 'Матрица Судьбы', subtitle: '22 сакральных аркана души', icon: '🌟' },
  lifespan: { title: 'Хронос: Сроки & Долголетие', subtitle: 'Таро на сроки событий, возрастные рубежи и витальность', icon: '⏳' },
  psychology: { title: 'Психологический Портрет', subtitle: 'Плюсы, минусы, тени и ключи трансформации 22 арканов', icon: '🧠' },
  caching: { title: 'Кэширование & Оптимизация', subtitle: 'Управление памятью, предрасчет 22 арканов и офлайн-режим', icon: '⚡' },
  cooking: { title: 'Кэширование & Оптимизация', subtitle: 'Управление памятью, предрасчет 22 арканов и офлайн-режим', icon: '⚡' },
  meditation: { title: 'Медитационный Центр', subtitle: 'Звуковые ландшафты и духовные медитации', icon: '🧘' },
  tapper: { title: 'Chubuk Kombat', subtitle: 'Тапалка кармы, майнинг и дроп $CHUBUK', icon: '🪙' },
  daily: { title: 'Прогноз Дня', subtitle: 'Космическая погода и биоритмы', icon: '🔮' },
  wallpapers: { title: 'Сакральные Обои', subtitle: 'HD талисманы 9:16 на экран', icon: '📱' },
  chakras: { title: 'Карта Чакр', subtitle: 'Диагностика 7 энергоцентров', icon: '🧘' },
  akashic: { title: 'Хроники Акаши', subtitle: 'Ченнелинг кармической памяти', icon: '📜' },
  powercal: { title: 'Календарь Силы', subtitle: 'Благоприятные циклы года', icon: '⚡' },
  lunar: { title: 'Лунный Календарь', subtitle: 'Фазы, лунные сутки и стоянки', icon: '🌙' },
  elective: { title: 'Элективные Даты', subtitle: 'Подбор времени для ключевых дел', icon: '📅' },
  ancestral: { title: 'Родовое Древо', subtitle: '7 поколений предков и карма', icon: '🌿' },
  litho: { title: 'Литотерапия', subtitle: 'Камни и кристаллы по матрице', icon: '💎' },
  dreams: { title: 'Оракул Снов', subtitle: 'Толкование через архетипы', icon: '💤' },
  cities: { title: 'Города Силы', subtitle: 'Астрокартография и места силы', icon: '🏛️' },
  astrology: { title: 'Натальная Астрология', subtitle: 'Планеты, дома и аспекты', icon: '♈' },
  compatibility: { title: 'Совместимость', subtitle: 'Синастрия двух судеб', icon: '❤️' },
  market: { title: 'Сакральный Маркет', subtitle: 'Талисманы, браслеты по арканам, колоды Таро и книги', icon: '🛍️' },
  tarot: { title: 'Таро Расклады', subtitle: 'Кельтский крест и триптих', icon: '🃏' },
  horary: { title: 'Хорарная Астрология', subtitle: 'Ответ звезд на вопрос момента', icon: '🕰️' },
  faq: { title: 'База Знаний & FAQ', subtitle: 'Часто задаваемые вопросы о матрице и 22 арканах', icon: '❓' },
  profile: { title: 'Мой Профиль', subtitle: 'История расчетов и архив', icon: '👤' },
  admin: { title: 'Админ-Панель', subtitle: 'Master Control, управление ИИ, промокодами и аналитикой', icon: '👑' },
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSidebar,
  onOpenAndroidModal,
  onOpenVoiceChat,
  onOpenNotifications,
  onOpenAdminAuth,
  onOpenUsageLimitModal,
  user,
  onSignIn,
  onSignOut,
  userInput,
  matrix,
  onTriggerHaptic
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [notificationsActive, setNotificationsActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => isUserAdmin(user));
  const [isVip, setIsVip] = useState(() => isVipUnlocked());
  const [remainingAttempts, setRemainingAttempts] = useState(() => getRemainingAttempts(user));
  const [customAvatar, setCustomAvatar] = useState<UserCustomAvatar | null>(() => getUserCustomAvatar());
  const currentTabInfo = TAB_TITLES[activeTab] || TAB_TITLES.matrix;

  useEffect(() => {
    const handleAvatarUpdate = (e: any) => {
      setCustomAvatar(e.detail || getUserCustomAvatar());
    };
    window.addEventListener('chubuk_avatar_updated', handleAvatarUpdate);
    return () => window.removeEventListener('chubuk_avatar_updated', handleAvatarUpdate);
  }, []);

  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef<any>(null);

  const handleLogoClick = () => {
    onTriggerHaptic?.(10);
    logoClickCountRef.current += 1;
    if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);
    
    if (logoClickCountRef.current >= 3) {
      logoClickCountRef.current = 0;
      onTriggerHaptic?.([20, 50, 80]);
      onOpenAdminAuth?.();
    } else {
      logoClickTimerRef.current = setTimeout(() => {
        if (logoClickCountRef.current < 3) {
          onSelectTab('matrix');
        }
        logoClickCountRef.current = 0;
      }, 400);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);

    const checkNotifStatus = () => {
      try {
        const raw = localStorage.getItem('chubuk_push_notification_settings');
        if (raw) {
          const parsed = JSON.parse(raw);
          setNotificationsActive(Boolean(parsed.enabled));
        }
      } catch {}
    };
    checkNotifStatus();

    const handleAdminChange = () => {
      setIsAdmin(isUserAdmin(user));
      setIsVip(isVipUnlocked());
      setRemainingAttempts(getRemainingAttempts(user));
    };

    const handleUsageChange = () => {
      setRemainingAttempts(getRemainingAttempts(user));
      setIsAdmin(isUserAdmin(user));
      setIsVip(isVipUnlocked());
    };

    // Global keyboard shortcut: Ctrl+Shift+A or Alt+A to trigger secret admin modal
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'Ф' || e.key === 'ф')) ||
          (e.altKey && (e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф'))) {
        e.preventDefault();
        onOpenAdminAuth?.();
      }
    };

    window.addEventListener('chubuk_notifications_updated', checkNotifStatus);
    window.addEventListener('chubuk_admin_state_changed', handleAdminChange);
    window.addEventListener('chubuk_usage_updated', handleUsageChange);
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('chubuk_notifications_updated', checkNotifStatus);
      window.removeEventListener('chubuk_admin_state_changed', handleAdminChange);
      window.removeEventListener('chubuk_usage_updated', handleUsageChange);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [user, onOpenAdminAuth]);

  return (
    <header className="sticky top-0 z-40 bg-[#050a14]/95 backdrop-blur-xl border-b border-amber-500/20 shadow-md no-print safe-area-pt">
      {/* Top App Status Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2">
        {/* Left: Brand Icon + Screen Back / Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {activeTab !== 'matrix' ? (
            <button
              onClick={() => {
                onTriggerHaptic?.(10);
                onSelectTab('matrix');
              }}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10 text-slate-300 hover:text-amber-300 flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Назад в Матрицу"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <div 
              onClick={handleLogoClick}
              title="Chubuk Matrix (3 нажатия для Master Control)"
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 text-black font-serif font-black text-base flex items-center justify-center shadow-md shrink-0 cursor-pointer select-none active:scale-95 transition-transform"
            >
              C
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs shrink-0">{currentTabInfo.icon}</span>
              <h1 className="font-serif font-bold text-xs sm:text-sm text-white tracking-wide truncate">
                {currentTabInfo.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Center/Right Compact Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Admin Master Badge / Usage Attempt Counter */}
          {isAdmin || isVip ? (
            <button
              onClick={() => {
                onTriggerHaptic?.(12);
                if (isAdmin) {
                  onSelectTab('admin');
                } else {
                  onOpenUsageLimitModal?.();
                }
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 hover:border-amber-300 text-[11px] font-serif font-bold transition-all cursor-pointer"
              title={isAdmin ? "Панель администратора" : "VIP статус"}
            >
              <span className="text-amber-400 text-xs">👑</span>
              <span className="font-mono">{isAdmin ? 'Master' : 'VIP'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onTriggerHaptic?.(10);
                onOpenUsageLimitModal?.();
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                remainingAttempts > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/20'
                  : 'bg-red-500/15 border-red-500/40 text-red-300 animate-pulse'
              }`}
              title="Попытки расчетов. Нажмите для пополнения / Колеса Фортуны"
            >
              <Sparkles size={11} className={remainingAttempts > 0 ? "text-amber-400" : "text-red-400"} />
              <span className="font-mono font-bold">
                {remainingAttempts > 0 ? `${remainingAttempts}` : '0'}
              </span>
              <span className="text-[9px] text-amber-400 font-bold bg-amber-500/20 px-1 rounded">+</span>
            </button>
          )}

          {/* Active Profile Pill */}
          {userInput && matrix && (
            <button
              onClick={() => {
                onTriggerHaptic?.(10);
                onSelectTab('profile');
              }}
              className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="font-medium truncate max-w-[80px]">{userInput.name}</span>
              <span className="font-mono text-amber-400 font-bold bg-black/40 px-1 rounded text-[10px]">
                {matrix.center}
              </span>
            </button>
          )}

          {/* Push Notifications Button */}
          {onOpenNotifications && (
            <button
              onClick={() => {
                onTriggerHaptic?.(10);
                onOpenNotifications();
              }}
              className={`relative p-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                notificationsActive
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title="Push-уведомления"
            >
              <Bell size={14} className={notificationsActive ? 'text-amber-400' : ''} />
              {notificationsActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          )}

          {/* Android Button */}
          <button
            onClick={() => {
              onTriggerHaptic?.(15);
              onOpenAndroidModal();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#0e1626] border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-black text-[11px] font-serif font-bold transition-all cursor-pointer"
            title="Android Приложение"
          >
            <Smartphone size={12} className="text-amber-400" />
            <span className="hidden sm:inline">App</span>
          </button>

          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-1 pl-1 pr-1 py-0.5 rounded-xl bg-black/40 border border-white/10">
              {customAvatar?.imageUrl ? (
                <img src={customAvatar.imageUrl} alt="Avatar" className="w-5 h-5 rounded-full border border-amber-400 object-cover" />
              ) : user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full border border-amber-500/30" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-[9px]">
                  <UserIcon size={10} />
                </div>
              )}
              <button 
                onClick={onSignOut} 
                className="p-1 hover:text-red-400 text-slate-400 transition-colors" 
                title="Выйти"
              >
                <LogOut size={11} />
              </button>
            </div>
          ) : customAvatar?.imageUrl ? (
            <button
              onClick={() => {
                onTriggerHaptic?.(10);
                onSelectTab('profile');
              }}
              className="flex items-center gap-1 p-0.5 rounded-xl border border-amber-400/60 bg-amber-500/10 hover:bg-amber-500/20 transition-all cursor-pointer"
              title="Мой Магический Аватар"
            >
              <img src={customAvatar.imageUrl} alt="Avatar" className="w-6 h-6 rounded-lg border border-amber-400 object-cover shadow-sm" />
            </button>
          ) : (
            <button 
              onClick={onSignIn}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black text-[11px] font-bold transition-all cursor-pointer"
            >
              <LogIn size={11} />
              <span className="hidden sm:inline">Войти</span>
            </button>
          )}

          {/* All Screens Drawer Menu Toggle */}
          <button
            onClick={() => {
              onTriggerHaptic?.(10);
              onOpenSidebar();
            }}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-gradient-to-r from-[#151c2e] to-[#0c101d] border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
            title="Все разделы"
          >
            <Layers size={14} className="text-amber-400" />
            <span className="text-[11px] font-serif font-bold uppercase hidden md:inline">
              Меню
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
