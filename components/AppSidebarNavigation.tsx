import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  Sparkles, 
  Smartphone, 
  Activity, 
  BookOpen, 
  Calendar, 
  Sun, 
  Moon, 
  Star, 
  Compass, 
  Gem, 
  GitFork, 
  CloudMoon, 
  Globe, 
  HeartHandshake, 
  Layers, 
  HelpCircle, 
  User, 
  LogIn, 
  LogOut, 
  ChevronRight,
  Flame,
  Volume2,
  Coins,
  Bell
} from 'lucide-react';

export type AppNavTabId = 
  | 'matrix' 
  | 'tapper'
  | 'meditation'
  | 'wallpapers' 
  | 'chakras' 
  | 'akashic' 
  | 'powercal' 
  | 'daily' 
  | 'lunar' 
  | 'elective' 
  | 'ancestral' 
  | 'litho' 
  | 'dreams' 
  | 'cities' 
  | 'astrology' 
  | 'compatibility' 
  | 'tarot' 
  | 'horary' 
  | 'profile';

interface NavCategory {
  title: string;
  items: {
    id: AppNavTabId;
    label: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
    color: string;
  }[];
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    title: '🌟 Главные Сакральные Инструменты',
    items: [
      {
        id: 'matrix',
        label: 'Матрица Судьбы',
        description: 'Сакральная геометрия и 22 аркана души',
        icon: Sparkles,
        color: '#f59e0b'
      },
      {
        id: 'tapper',
        label: 'Карма-Тапалка Chubuk Kombat',
        description: 'Майнинг $CHUBUK, пассивный доход, комбо и дроп',
        icon: Coins,
        badge: 'GAME',
        color: '#facc15'
      },
      {
        id: 'meditation',
        label: 'Медитация & Звукотерапия',
        description: 'Частоты 432/528 Гц, пранаяма-гид и медитация на арканы',
        icon: Flame,
        badge: '432Hz',
        color: '#f59e0b'
      },
      {
        id: 'wallpapers',
        label: 'Обои и Stories 9:16',
        description: 'HD постеры-талисманы на экран смартфона',
        icon: Smartphone,
        badge: 'NEW',
        color: '#fbbf24'
      },
      {
        id: 'chakras',
        label: 'Карта Чакр & Психосоматика',
        description: 'Диагностика 7 энергоцентров и зажимов тела',
        icon: Activity,
        badge: 'NEW',
        color: '#c084fc'
      },
      {
        id: 'akashic',
        label: 'Хроники Акаши & Карма',
        description: 'Кармический хвост и расторжение клятв прошлого',
        icon: BookOpen,
        badge: 'NEW',
        color: '#f97316'
      },
      {
        id: 'powercal',
        label: 'Календарь Силы 365',
        description: 'Персональный денежный и любовный тайминг',
        icon: Calendar,
        badge: 'NEW',
        color: '#4ade80'
      },
      {
        id: 'daily',
        label: 'Ежедневный Прогноз',
        description: 'Энергии дня, биоритмы и совет на сегодня',
        icon: Sun,
        color: '#eab308'
      }
    ]
  },
  {
    title: '🌙 Луна, Астрология и Тайминг',
    items: [
      {
        id: 'lunar',
        label: 'Лунный Календарь',
        description: 'Фазы Луны, лунные сутки и энергетика',
        icon: Moon,
        color: '#93c5fd'
      },
      {
        id: 'elective',
        label: 'Выбор Золотых Дат',
        description: 'Элективная астрология для свадеб, бизнеса и сделок',
        icon: Star,
        color: '#fde047'
      },
      {
        id: 'astrology',
        label: 'Натальная Астрология',
        description: 'Планеты в знаках, дома и космограмма',
        icon: Compass,
        color: '#a78bfa'
      },
      {
        id: 'horary',
        label: 'Хорарный Вопрос',
        description: 'Астрологический ответ на вопрос момента',
        icon: HelpCircle,
        color: '#67e8f9'
      }
    ]
  },
  {
    title: '✨ Талисманы, Род и Подсознание',
    items: [
      {
        id: 'litho',
        label: 'Литотерапия & Камни',
        description: 'Минералы, масла и защитные обереги',
        icon: Gem,
        color: '#34d399'
      },
      {
        id: 'ancestral',
        label: '4 Линии Рода',
        description: 'Кармические дары и уроки 7 поколений предков',
        icon: GitFork,
        color: '#fb923c'
      },
      {
        id: 'dreams',
        label: 'Оракул Сновидений',
        description: 'Интерпретация снов через символы и арканы',
        icon: CloudMoon,
        color: '#818cf8'
      },
      {
        id: 'cities',
        label: 'Города Силы',
        description: 'Астрокартография и места наивысшей энергии',
        icon: Globe,
        color: '#38bdf8'
      }
    ]
  },
  {
    title: '🔮 Отношения и Профиль',
    items: [
      {
        id: 'compatibility',
        label: 'Совместимость Партнеров',
        description: 'Синастрия союза и общая матрица пары',
        icon: HeartHandshake,
        color: '#fb7185'
      },
      {
        id: 'tarot',
        label: 'Расклады Таро',
        description: '3 сакральные карты и послание оракула',
        icon: Layers,
        color: '#d8b4fe'
      },
      {
        id: 'profile',
        label: 'Личный Кабинет',
        description: 'История расчетов и персональные настройки',
        icon: User,
        color: '#e2e8f0'
      }
    ]
  }
];

interface AppSidebarNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AppNavTabId;
  onSelectTab: (id: AppNavTabId) => void;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenAndroidModal?: () => void;
  onOpenNotifications?: () => void;
}

export const AppSidebarNavigation: React.FC<AppSidebarNavigationProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  user,
  onSignIn,
  onSignOut,
  onOpenAndroidModal,
  onOpenNotifications
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Filter items by search query
  const filteredCategories = NAV_CATEGORIES.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          {/* Sidebar Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-[#070b14] border-l border-amber-500/20 text-slate-100 h-full flex flex-col z-10 shadow-[-20px_0_60px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            {/* Ambient gold glow in top corner */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header: Logo, Title & Close button */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0a0f1c]/90 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center font-serif text-black font-bold text-lg shadow-lg">
                  C
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm tracking-widest text-white">
                    CHUBUK <span className="text-amber-400">MATRIX</span>
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">Сакральный Навигатор</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-amber-500/30 transition-all cursor-pointer"
                title="Закрыть меню (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="p-4 border-b border-white/5 bg-[#050811] shrink-0">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по 17 разделам..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Categories & Links Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {filteredCategories.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-2.5">
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                    {cat.title}
                  </h4>

                  <div className="space-y-1.5">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      const isSelected = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectTab(item.id);
                            onClose();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                            isSelected
                              ? 'border-amber-500/60 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent shadow-[0_0_20px_rgba(245,158,11,0.15)] text-amber-200'
                              : 'border-white/5 bg-[#090e1a]/70 hover:border-white/20 hover:bg-white/5 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div 
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                                isSelected 
                                  ? 'bg-amber-500 text-black border-amber-400 shadow-md font-bold' 
                                  : 'bg-black/40 border-white/10 group-hover:border-amber-500/40 text-slate-300'
                              }`}
                              style={{ color: isSelected ? '#000' : item.color }}
                            >
                              <Icon size={18} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-serif font-bold truncate ${isSelected ? 'text-amber-200' : 'text-white'}`}>
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5 font-sans">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <ChevronRight 
                            size={15} 
                            className={`shrink-0 transition-transform ${
                              isSelected ? 'text-amber-400 translate-x-1' : 'text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5'
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredCategories.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  Ничего не найдено по запросу «{searchQuery}»
                </div>
              )}
            </div>

            {/* Footer Profile & Quick Action */}
            <div className="p-4 border-t border-white/10 bg-[#080d19] shrink-0 space-y-2.5">
              {onOpenNotifications && (
                <button
                  onClick={() => {
                    onOpenNotifications();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 hover:border-amber-400 hover:text-white transition-all text-xs font-serif font-bold cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-amber-400" />
                    <span>🔔 Настроить Push-уведомления</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Напоминания
                  </span>
                </button>
              )}

              {onOpenAndroidModal && (
                <button
                  onClick={() => {
                    onOpenAndroidModal();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 text-amber-200 hover:border-amber-400 hover:text-white transition-all text-xs font-serif font-bold cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-amber-400" />
                    <span>Установить на Android</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-500/40">
                    PWA / APK
                  </span>
                </button>
              )}

              {user ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-amber-500/30" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                        <User size={16} />
                      </div>
                    )}
                    <div className="text-left">
                      <span className="text-xs font-bold text-white block truncate max-w-[140px]">
                        {user.displayName || user.email?.split('@')[0]}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">Авторизован</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { onSignOut(); onClose(); }}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Выйти"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { onSignIn(); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
                >
                  <LogIn size={15} />
                  <span>Войти через Google для сохранения</span>
                </button>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AppSidebarNavigation;
