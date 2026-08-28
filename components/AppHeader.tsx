import React, { useState, useEffect } from 'react';
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

interface AppHeaderProps {
  activeTab: AppNavTabId;
  onSelectTab: (tabId: AppNavTabId) => void;
  onOpenSidebar: () => void;
  onOpenAndroidModal: () => void;
  onOpenVoiceChat?: () => void;
  onOpenNotifications?: () => void;
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
  user,
  onSignIn,
  onSignOut,
  userInput,
  matrix,
  onTriggerHaptic
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [notificationsActive, setNotificationsActive] = useState(false);
  const currentTabInfo = TAB_TITLES[activeTab] || TAB_TITLES.matrix;

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
    window.addEventListener('chubuk_notifications_updated', checkNotifStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('chubuk_notifications_updated', checkNotifStatus);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#050a14]/95 backdrop-blur-2xl border-b border-amber-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.7)] no-print safe-area-pt">
      {/* Top App Status Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Left: Brand Icon + Screen Back / Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {activeTab !== 'matrix' ? (
            <button
              onClick={() => {
                onTriggerHaptic?.(10);
                onSelectTab('matrix');
              }}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10 text-slate-300 hover:text-amber-300 flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Назад в Матрицу"
            >
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div 
              onClick={() => {
                onTriggerHaptic?.(10);
                onSelectTab('matrix');
              }}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 text-black font-serif font-black text-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0 cursor-pointer"
            >
              C
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm shrink-0">{currentTabInfo.icon}</span>
              <h1 className="font-serif font-bold text-sm sm:text-base text-white tracking-wide truncate">
                {currentTabInfo.title}
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-light truncate hidden sm:block">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Center/Right Status Badges */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active User Energy Pill if calculated */}
          {userInput && matrix && (
            <button
              onClick={() => {
                onTriggerHaptic?.(10);
                onSelectTab('profile');
              }}
              className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-medium truncate max-w-[100px]">{userInput.name}</span>
              <span className="font-mono text-amber-400 font-bold bg-black/40 px-1.5 py-0.2 rounded text-[10px]">
                {matrix.center} Аркан
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
              className={`relative p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                notificationsActive
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
              title="Настройка Push-уведомлений и напоминаний о прогнозах"
            >
              <Bell size={15} className={notificationsActive ? 'text-amber-400' : ''} />
              {notificationsActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#050a14] animate-pulse" />
              )}
            </button>
          )}

          {/* Android App Button */}
          <button
            onClick={() => {
              onTriggerHaptic?.(15);
              onOpenAndroidModal();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0e1626] border border-amber-500/40 text-amber-300 hover:border-amber-400 hover:bg-amber-500 hover:text-black text-xs font-serif font-bold transition-all shadow-sm cursor-pointer"
            title="Копия на Android (PWA & APK)"
          >
            <Smartphone size={14} className="text-amber-400" />
            <span className="text-[11px] font-bold">Android</span>
          </button>

          {/* Voice AI Assistant Button */}
          {onOpenVoiceChat && (
            <button
              onClick={() => {
                onTriggerHaptic?.([20, 40]);
                onOpenVoiceChat();
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-purple-900/40 to-amber-900/40 border border-purple-500/40 text-purple-300 hover:border-amber-400 hover:text-amber-200 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
              title="Голосовой Оракул AI"
            >
              <Mic size={14} className="text-amber-400" />
              <span className="hidden sm:inline text-[11px]">Голос AI</span>
            </button>
          )}

          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-xl bg-black/40 border border-white/10">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full border border-amber-500/30" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-[10px]">
                  <UserIcon size={12} />
                </div>
              )}
              <span className="text-[10px] text-slate-300 font-medium max-w-[70px] truncate hidden sm:inline">
                {user.displayName?.split(' ')[0]}
              </span>
              <button 
                onClick={onSignOut} 
                className="p-1 hover:text-red-400 text-slate-400 transition-colors" 
                title="Выйти"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onSignIn}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black text-xs font-bold transition-all cursor-pointer"
            >
              <LogIn size={13} />
              <span className="text-[11px] hidden sm:inline">Войти</span>
            </button>
          )}

          {/* All Screens Drawer Menu Toggle */}
          <button
            onClick={() => {
              onTriggerHaptic?.(10);
              onOpenSidebar();
            }}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#151c2e] to-[#0c101d] border border-amber-500/40 text-amber-300 hover:border-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm"
            title="Все 21 раздел приложения"
          >
            <Layers size={16} className="text-amber-400" />
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
