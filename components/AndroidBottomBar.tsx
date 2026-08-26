import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Sun, 
  Smartphone, 
  Layers, 
  User, 
  Flame,
  DownloadCloud
} from 'lucide-react';
import { AppNavTabId } from './AppSidebarNavigation';

interface AndroidBottomBarProps {
  activeTab: AppNavTabId;
  onSelectTab: (tabId: AppNavTabId) => void;
  onOpenSidebar: () => void;
  onOpenAndroidModal: () => void;
  isStandalone: boolean;
  canInstall: boolean;
  onTriggerHaptic?: (pattern?: number | number[]) => void;
}

export const AndroidBottomBar: React.FC<AndroidBottomBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSidebar,
  onOpenAndroidModal,
  isStandalone,
  canInstall,
  onTriggerHaptic
}) => {
  const handleTabClick = (tabId: AppNavTabId) => {
    onTriggerHaptic?.(12);
    onSelectTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMenuClick = () => {
    onTriggerHaptic?.([10, 30, 10]);
    onOpenSidebar();
  };

  const navItems = [
    { id: 'matrix' as AppNavTabId, label: 'Матрица', icon: Sparkles },
    { id: 'daily' as AppNavTabId, label: 'Прогноз', icon: Sun },
    { id: 'chakras' as AppNavTabId, label: 'Чакры', icon: Flame },
    { id: 'wallpapers' as AppNavTabId, label: 'Обои', icon: Smartphone, badge: 'HD' },
    { id: 'profile' as AppNavTabId, label: 'Профиль', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block no-print pointer-events-auto">
      {/* Mini App Banner if in browser mode */}
      {!isStandalone && (
        <div className="max-w-md mx-auto px-3 mb-1.5 flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#0d1322]/95 backdrop-blur-md border border-amber-500/30 text-[11px] shadow-xl">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-serif text-amber-200 font-bold">Android App</span>
            <span className="text-[10px] text-slate-400">PWA & APK</span>
          </div>
          <button
            onClick={() => {
              onTriggerHaptic?.(15);
              onOpenAndroidModal();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-[10px] uppercase tracking-wider hover:brightness-110 transition-all shadow-sm cursor-pointer"
          >
            <DownloadCloud size={12} />
            <span>Установить</span>
          </button>
        </div>
      )}

      {/* Main Glassmorphic Navigation Bar */}
      <nav className="bg-[#050811]/95 backdrop-blur-2xl border-t border-amber-500/25 px-2 py-1.5 safe-area-pb shadow-[0_-10px_30px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* First 2 items */}
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[54px] ${
                  isSelected ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="app-tab-indicator"
                    className="absolute inset-0 bg-amber-500/15 border border-amber-500/30 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <Icon size={18} className={isSelected ? 'text-amber-400' : ''} />
                  <span className="text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Center Floating Action Button: All 18 Sections Menu */}
          <div className="relative -top-3 flex flex-col items-center px-1">
            <button
              onClick={handleMenuClick}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 text-black flex items-center justify-center shadow-[0_4px_20px_rgba(245,158,11,0.55)] border-2 border-[#050811] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Открыть меню всех 18 разделов"
            >
              <Layers size={21} className="stroke-[2.5]" />
            </button>
            <span className="text-[9px] font-bold text-amber-300 tracking-wider uppercase mt-0.5">
              Меню
            </span>
          </div>

          {/* Last 3 items */}
          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[54px] ${
                  isSelected ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="app-tab-indicator"
                    className="absolute inset-0 bg-amber-500/15 border border-amber-500/30 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <Icon size={18} className={isSelected ? 'text-amber-400' : ''} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-amber-500 text-black font-black text-[7px] rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AndroidBottomBar;
