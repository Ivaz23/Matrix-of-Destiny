import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Sun, 
  Smartphone, 
  Layers, 
  Scroll, 
  Zap, 
  Moon, 
  Calendar, 
  Users, 
  Gem, 
  Eye, 
  Compass, 
  Compass as CompassIcon,
  Heart, 
  Flame, 
  Clock, 
  User
} from 'lucide-react';
import { AppNavTabId } from './AppSidebarNavigation';

interface AppCategoryRibbonProps {
  activeTab: AppNavTabId;
  onSelectTab: (tabId: AppNavTabId) => void;
  onTriggerHaptic?: (pattern?: number | number[]) => void;
}

interface CategoryItem {
  id: AppNavTabId;
  label: string;
  shortLabel: string;
  icon: string;
  badge?: string;
  highlight?: boolean;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'matrix', label: 'Матрица Судьбы', shortLabel: 'Матрица', icon: '🌟', highlight: true },
  { id: 'tapper', label: 'Chubuk Kombat (Тапалка)', shortLabel: 'Тапалка 🪙', icon: '🪙', badge: 'PLAY', highlight: true },
  { id: 'daily', label: 'Прогноз Дня', shortLabel: 'Прогноз', icon: '🔮', badge: 'AI' },
  { id: 'wallpapers', label: 'Обои 9:16 HD', shortLabel: 'Обои 9:16', icon: '📱', badge: 'HD' },
  { id: 'chakras', label: 'Энергия Чакр', shortLabel: 'Чакры', icon: '🧘' },
  { id: 'akashic', label: 'Хроники Акаши', shortLabel: 'Акаши', icon: '📜' },
  { id: 'powercal', label: 'Календарь Силы', shortLabel: 'Календарь', icon: '⚡' },
  { id: 'lunar', label: 'Лунный Цикл', shortLabel: 'Луна', icon: '🌙' },
  { id: 'tarot', label: 'Таро Расклады', shortLabel: 'Таро', icon: '🃏' },
  { id: 'astrology', label: 'Натальная Карта', shortLabel: 'Астрология', icon: '♈' },
  { id: 'compatibility', label: 'Совместимость', shortLabel: 'Синастрия', icon: '❤️' },
  { id: 'litho', label: 'Литотерапия', shortLabel: 'Камни', icon: '💎' },
  { id: 'dreams', label: 'Оракул Снов', shortLabel: 'Сонник', icon: '💤' },
  { id: 'cities', label: 'Города Силы', shortLabel: 'Места Силы', icon: '🏛️' },
  { id: 'horary', label: 'Хорарный Оракул', shortLabel: 'Хорар', icon: '🕰️' },
  { id: 'ancestral', label: 'Родовое Древо', shortLabel: 'Род', icon: '🌿' },
  { id: 'elective', label: 'Элективные Даты', shortLabel: 'Электив', icon: '📅' },
  { id: 'profile', label: 'Мой Профиль', shortLabel: 'Профиль', icon: '👤' },
];

export const AppCategoryRibbon: React.FC<AppCategoryRibbonProps> = ({
  activeTab,
  onSelectTab,
  onTriggerHaptic
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Auto scroll into view when active tab changes
  useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
      const container = containerRef.current;
      const button = activeBtnRef.current;
      const containerWidth = container.offsetWidth;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;

      container.scrollTo({
        left: buttonLeft - containerWidth / 2 + buttonWidth / 2,
        behavior: 'smooth'
      });
    }
  }, [activeTab]);

  return (
    <div className="w-full bg-[#070c17]/90 border-b border-white/5 py-2 px-2 sticky top-[53px] z-30 backdrop-blur-xl no-print">
      <div 
        ref={containerRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-2 max-w-7xl mx-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((item) => {
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              ref={isSelected ? activeBtnRef : null}
              onClick={() => {
                onTriggerHaptic?.(8);
                onSelectTab(item.id);
              }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <span className="text-xs leading-none">{item.icon}</span>
              <span className="font-serif tracking-tight">{item.shortLabel}</span>
              
              {item.badge && (
                <span
                  className={`text-[8px] font-black px-1.2 py-0.2 rounded-full uppercase ${
                    isSelected
                      ? 'bg-black text-amber-300'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AppCategoryRibbon;
