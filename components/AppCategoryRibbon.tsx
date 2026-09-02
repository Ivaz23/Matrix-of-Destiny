import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppNavTabId } from './AppSidebarNavigation';
import { isUserAdmin } from '../services/usageLimitService';

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
  adminOnly?: boolean;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'matrix', label: 'Матрица Судьбы', shortLabel: 'Матрица', icon: '🌟', highlight: true },
  { id: 'keyto', label: 'KeyTo: Денежная Сила & Циклы', shortLabel: 'KeyTo Деньги 💰', icon: '💰', badge: 'HOT', highlight: true },
  { id: 'lifespan', label: 'Хронос: Сроки & Долголетие', shortLabel: 'Сроки & Долголетие ⏳', icon: '⏳', badge: 'NEW', highlight: true },
  { id: 'psychology', label: 'Психологический Портрет (+/-)', shortLabel: 'Психология (+/-)', icon: '🧠', badge: 'NEW', highlight: true },
  { id: 'caching', label: 'Кэширование & Память', shortLabel: 'Кэширование ⚡', icon: '⚡', badge: 'TURBO', highlight: true },
  { id: 'meditation', label: 'Медитационный Центр', shortLabel: 'Медитации 🧘', icon: '🧘', badge: 'NEW', highlight: true },
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
  { id: 'market', label: 'Сакральный Маркет', shortLabel: 'Маркет 🛍️', icon: '🛍️', badge: 'NEW', highlight: true },
  { id: 'litho', label: 'Литотерапия', shortLabel: 'Камни', icon: '💎' },
  { id: 'dreams', label: 'Оракул Снов', shortLabel: 'Сонник', icon: '💤' },
  { id: 'cities', label: 'Города Силы', shortLabel: 'Места Силы', icon: '🏛️' },
  { id: 'horary', label: 'Хорарный Оракул', shortLabel: 'Хорар', icon: '🕰️' },
  { id: 'ancestral', label: 'Родовое Древо', shortLabel: 'Род', icon: '🌿' },
  { id: 'elective', label: 'Элективные Даты', shortLabel: 'Электив', icon: '📅' },
  { id: 'faq', label: 'FAQ (База Знаний)', shortLabel: 'FAQ ❓', icon: '❓', highlight: true },
  { id: 'profile', label: 'Мой Профиль', shortLabel: 'Профиль', icon: '👤' },
  { id: 'admin', label: 'Админ-Панель', shortLabel: 'Админка 👑', icon: '👑', badge: 'VIP', adminOnly: true },
];

export const AppCategoryRibbon: React.FC<AppCategoryRibbonProps> = ({
  activeTab,
  onSelectTab,
  onTriggerHaptic
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);
  const [isAdmin, setIsAdmin] = useState(() => isUserAdmin());

  useEffect(() => {
    const handleAdminChange = () => {
      setIsAdmin(isUserAdmin());
    };
    window.addEventListener('chubuk_admin_state_changed', handleAdminChange);
    return () => window.removeEventListener('chubuk_admin_state_changed', handleAdminChange);
  }, []);

  const visibleCategories = CATEGORIES.filter(cat => !cat.adminOnly || isAdmin);

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
    <div className="w-full bg-[#070c17]/90 border-b border-white/5 py-1.5 px-2 sticky top-[45px] z-30 backdrop-blur-xl no-print">
      <div 
        ref={containerRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-1 max-w-7xl mx-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {visibleCategories.map((item) => {
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              ref={isSelected ? activeBtnRef : null}
              onClick={() => {
                onTriggerHaptic?.(8);
                onSelectTab(item.id);
              }}
              className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-amber-500 text-black font-bold shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <span className="text-xs leading-none">{item.icon}</span>
              <span className="font-serif tracking-tight">{item.shortLabel}</span>
              
              {item.badge && !isSelected && (
                <span className="text-[8px] font-black px-1 py-0.2 rounded-full uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
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
