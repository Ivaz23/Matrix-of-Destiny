import React, { useState, useRef } from 'react';
import { UserInput, MatrixNumbers, WallpaperTheme, WallpaperType } from '../types';
import { calculateLithotherapyProfile } from '../services/lithotherapyUtils';
import { exportWallpaperImage } from '../services/wallpaperExportUtils';
import { 
  Smartphone, 
  Sparkles, 
  Download, 
  Image as ImageIcon, 
  Sliders, 
  Check, 
  Palette, 
  Type, 
  Shield, 
  Gem, 
  Compass, 
  Layers,
  Flame,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SacredWallpapersSectionProps {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
}

export const SacredWallpapersSection: React.FC<SacredWallpapersSectionProps> = ({ userInput, matrix }) => {
  const [theme, setTheme] = useState<WallpaperTheme>('gold_alchemy');
  const [type, setType] = useState<WallpaperType>('phone_wallpaper');
  const [showSigil, setShowSigil] = useState(true);
  const [showAffirmation, setShowAffirmation] = useState(true);
  const [showStone, setShowStone] = useState(true);
  const [showMatrixCode, setShowMatrixCode] = useState(true);
  const [customQuote, setCustomQuote] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const userName = userInput?.name || 'Странник';
  const litho = calculateLithotherapyProfile(matrix);
  const primaryStone = litho.primaryStones[0]?.name || 'Аметист';
  const wealthStone = litho.wealthStones[0]?.name || 'Пирит';

  const centerArcana = matrix?.center || 10;
  const destinyArcana = matrix?.destiny || 19;
  const moneyArcana = matrix?.earth || 15;
  const loveArcana = matrix?.month || 6;

  // Default affirmations by theme
  const themeQuotes: Record<WallpaperTheme, string> = {
    gold_alchemy: '«Сила, мудрость и изобилие Вселенной проявляются через меня каждый миг.»',
    cosmic_violet: '«Моя интуиция безгранична. Я соединен с высшим космическим потоком.»',
    emerald_wealth: '«Денежный поток изобилия и масштабных возможностей открыт для меня.»',
    sacred_obsidian: '«Я непоколебим. Мое биополе защищено сакральной силой предков.»',
    rose_love: '«Мое сердце наполнено безусловной любовью, теплом и гармонией мира.»'
  };

  const activeAffirmation = customQuote.trim() || themeQuotes[theme];

  // Theme visual presets
  const themeStyles: Record<WallpaperTheme, {
    bg: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    glow: string;
    sigilColor: string;
    name: string;
    icon: string;
  }> = {
    gold_alchemy: {
      bg: 'linear-gradient(180deg, #161208 0%, #0d0a04 40%, #050402 100%)',
      border: 'rgba(234, 179, 8, 0.45)',
      textPrimary: '#fef08a',
      textSecondary: '#ffd700',
      accent: '#eab308',
      glow: 'rgba(234, 179, 8, 0.25)',
      sigilColor: '#facc15',
      name: 'Золотая Алхимия',
      icon: '✨'
    },
    cosmic_violet: {
      bg: 'linear-gradient(180deg, #140d2a 0%, #0b0717 40%, #030208 100%)',
      border: 'rgba(168, 85, 247, 0.45)',
      textPrimary: '#e9d5ff',
      textSecondary: '#c084fc',
      accent: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.25)',
      sigilColor: '#d8b4fe',
      name: 'Космический Неон',
      icon: '🌌'
    },
    emerald_wealth: {
      bg: 'linear-gradient(180deg, #061e13 0%, #03120b 40%, #010804 100%)',
      border: 'rgba(34, 197, 94, 0.45)',
      textPrimary: '#bbf7d0',
      textSecondary: '#4ade80',
      accent: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.25)',
      sigilColor: '#86efac',
      name: 'Изумрудное Изобилие',
      icon: '💰'
    },
    sacred_obsidian: {
      bg: 'linear-gradient(180deg, #1c1c24 0%, #0f0f13 40%, #050507 100%)',
      border: 'rgba(226, 232, 240, 0.4)',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      accent: '#cbd5e1',
      glow: 'rgba(255, 255, 255, 0.15)',
      sigilColor: '#f1f5f9',
      name: 'Сакральный Обсидиан',
      icon: '🖤'
    },
    rose_love: {
      bg: 'linear-gradient(180deg, #240a15 0%, #15050c 40%, #080204 100%)',
      border: 'rgba(244, 63, 94, 0.45)',
      textPrimary: '#fecdd3',
      textSecondary: '#fb7185',
      accent: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.25)',
      sigilColor: '#fda4af',
      name: 'Розовый Кварц (Любовь)',
      icon: '💖'
    }
  };

  const curStyle = themeStyles[theme];

  const handleDownload = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const filename = `Talisman_Wallpaper_${theme}_${userName.replace(/\s+/g, '_')}`;
      await exportWallpaperImage('sacred-poster-render-target', filename, 3);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-8 border border-amber-500/30 bg-gradient-to-r from-[#120e0a] via-[#1a140d] to-[#0d0a07] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-serif font-bold uppercase tracking-wider border border-amber-500/30">
                HD 9:16 Экспорт
              </span>
              <span className="text-xs text-slate-400 font-mono">Stories & Lock Screen</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-100 flex items-center gap-3">
              <Smartphone className="text-amber-400" />
              Генератор Сакральных Обоев и Stories
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Создайте персональный талисман-обои на экран смартфона с вашей матрицей, сакральной геометрией и кодом изобилия в премиальном качестве.
            </p>
          </div>

          <motion.button
            onClick={handleDownload}
            disabled={isExporting}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-sm shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:shadow-[0_0_35px_rgba(245,158,11,0.65)] transition-all cursor-pointer shrink-0"
          >
            {isExporting ? (
              <>
                <Loader2 size={18} className="animate-spin text-black" />
                <span>Генерация Ultra HD...</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check size={18} className="text-black font-bold" />
                <span>Сохранено в галерею!</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Скачать Обои (9:16 PNG)</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Main Studio Grid: Controls & 9:16 Live Canvas Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Controls & Customizers (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Theme Selector */}
          <div className="p-6 rounded-2xl bg-[#0d121f]/90 border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Palette size={16} />
              1. Выберите сакральную тему постера
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(themeStyles) as WallpaperTheme[]).map((tKey) => {
                const t = themeStyles[tKey];
                const isSel = theme === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => setTheme(tKey)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col gap-1.5 ${
                      isSel 
                        ? 'border-amber-400 bg-white/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                        : 'border-white/5 bg-black/40 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{t.icon}</span>
                      {isSel && <Check size={14} className="text-amber-400" />}
                    </div>
                    <span className="text-xs font-bold text-white font-serif">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Elements Toggles */}
          <div className="p-6 rounded-2xl bg-[#0d121f]/90 border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Sliders size={16} />
              2. Элементы на постере
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-amber-500/30 transition-all">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400" />
                  Сакральный Сигил и Мандала
                </span>
                <input 
                  type="checkbox" 
                  checked={showSigil} 
                  onChange={(e) => setShowSigil(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-amber-500/30 transition-all">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                  <Shield size={14} className="text-purple-400" />
                  Код Матрицы (Арканы)
                </span>
                <input 
                  type="checkbox" 
                  checked={showMatrixCode} 
                  onChange={(e) => setShowMatrixCode(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-amber-500/30 transition-all">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                  <Gem size={14} className="text-blue-400" />
                  Камни-Талисманы
                </span>
                <input 
                  type="checkbox" 
                  checked={showStone} 
                  onChange={(e) => setShowStone(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-amber-500/30 transition-all">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                  <Type size={14} className="text-green-400" />
                  Аффирмация Силы
                </span>
                <input 
                  type="checkbox" 
                  checked={showAffirmation} 
                  onChange={(e) => setShowAffirmation(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Custom Quote / Intention */}
          <div className="p-6 rounded-2xl bg-[#0d121f]/90 border border-white/10 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Type size={16} />
              3. Персональное намерение / Цитата
            </h3>
            <textarea
              value={customQuote}
              onChange={(e) => setCustomQuote(e.target.value)}
              placeholder="Введите свое намерение или оставьте по умолчанию..."
              rows={2}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>Рекомендуется 1–2 вдохновляющие фразы</span>
              {customQuote && (
                <button 
                  onClick={() => setCustomQuote('')} 
                  className="text-amber-400 hover:underline"
                >
                  Сбросить к канонической
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: 9:16 Device Live Preview (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-2">
            <Smartphone size={14} className="text-amber-400" />
            <span>Предпросмотр 9:16 (Smart Screen)</span>
          </div>

          {/* Mock Smartphone Frame */}
          <div className="w-[330px] sm:w-[350px] p-3.5 rounded-[44px] bg-[#000000] border-4 border-slate-700 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative">
            {/* Phone speaker notch */}
            <div className="w-24 h-4.5 bg-black rounded-b-xl mx-auto absolute top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
              <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
            </div>

            {/* Poster Render Target Element (Exported by html2canvas) */}
            <div 
              id="sacred-poster-render-target"
              className="w-full aspect-[9/16] rounded-[34px] p-6 flex flex-col justify-between items-center text-center relative overflow-hidden select-none"
              style={{
                background: curStyle.bg,
                border: `1.5px solid ${curStyle.border}`,
                boxShadow: `inset 0 0 40px ${curStyle.glow}`
              }}
            >
              {/* Sacred geometric background lattice */}
              <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
                <svg width="280" height="280" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="48" stroke={curStyle.sigilColor} strokeWidth="0.5" strokeDasharray="2 2" />
                  <circle cx="50" cy="50" r="36" stroke={curStyle.sigilColor} strokeWidth="0.5" />
                  <polygon points="50,4 96,50 50,96 4,50" stroke={curStyle.sigilColor} strokeWidth="0.5" />
                  <polygon points="50,14 86,50 50,86 14,50" stroke={curStyle.sigilColor} strokeWidth="0.5" />
                  <polygon points="50,22 78,50 50,78 22,50" stroke={curStyle.sigilColor} strokeWidth="0.4" />
                </svg>
              </div>

              {/* TOP: Header brand & Name */}
              <div className="relative z-10 pt-4 space-y-1">
                <span className="text-[9px] uppercase tracking-[3px] font-mono text-slate-400 font-bold block">
                  ✦ CHUBUK MATRIX ✦
                </span>
                <h4 
                  className="font-serif text-lg font-bold tracking-wider uppercase"
                  style={{ color: curStyle.textPrimary }}
                >
                  {userName}
                </h4>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] text-slate-400">Код Души:</span>
                  <span 
                    className="text-xs font-serif font-bold px-2 py-0.5 rounded-full border"
                    style={{ 
                      color: curStyle.textSecondary,
                      borderColor: curStyle.border,
                      background: 'rgba(0,0,0,0.4)'
                    }}
                  >
                    Аркан #{centerArcana}
                  </span>
                </div>
              </div>

              {/* CENTER: Sacred Sigil & Central Geometry */}
              <div className="relative z-10 my-auto flex flex-col items-center">
                {showSigil && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
                    className="w-32 h-32 relative flex items-center justify-center mb-2"
                  >
                    {/* Glowing outer aura */}
                    <div 
                      className="absolute inset-0 rounded-full blur-xl opacity-40"
                      style={{ background: curStyle.glow }}
                    ></div>
                    
                    <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="46" stroke={curStyle.sigilColor} strokeWidth="1" />
                      <circle cx="50" cy="50" r="38" stroke={curStyle.sigilColor} strokeWidth="0.6" strokeDasharray="3 3" />
                      <circle cx="50" cy="50" r="28" stroke={curStyle.sigilColor} strokeWidth="0.8" />
                      <polygon points="50,8 92,75 8,75" stroke={curStyle.sigilColor} strokeWidth="0.8" />
                      <polygon points="50,92 92,25 8,25" stroke={curStyle.sigilColor} strokeWidth="0.8" />
                      <circle cx="50" cy="50" r="8" fill={curStyle.sigilColor} fillOpacity="0.2" stroke={curStyle.sigilColor} strokeWidth="1.2" />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-serif font-bold" style={{ color: curStyle.textPrimary }}>
                        {centerArcana}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Matrix Codes Mini Badges */}
                {showMatrixCode && (
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <div className="px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[10px]">
                      <span className="text-slate-400 block text-[8px] uppercase">Судьба</span>
                      <strong style={{ color: curStyle.textSecondary }}>#{destinyArcana}</strong>
                    </div>
                    <div className="px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[10px]">
                      <span className="text-slate-400 block text-[8px] uppercase">Деньги</span>
                      <strong style={{ color: '#4ade80' }}>#{moneyArcana}</strong>
                    </div>
                    <div className="px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[10px]">
                      <span className="text-slate-400 block text-[8px] uppercase">Любовь</span>
                      <strong style={{ color: '#fb7185' }}>#{loveArcana}</strong>
                    </div>
                  </div>
                )}

                {/* Talisman Mineral */}
                {showStone && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-[10px]">
                    <span className="text-amber-400">💎</span>
                    <span className="text-slate-300 font-medium">Камень: {primaryStone}</span>
                  </div>
                )}
              </div>

              {/* BOTTOM: Power Affirmation & Sacred Footer */}
              <div className="relative z-10 pb-3 space-y-3 w-full">
                {showAffirmation && (
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 backdrop-blur-sm">
                    <p 
                      className="font-serif text-[11px] leading-relaxed italic"
                      style={{ color: curStyle.textPrimary }}
                    >
                      {activeAffirmation}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[8px] text-slate-500 uppercase tracking-widest font-mono pt-1 border-t border-white/5">
                  <span>Сакральный Оберег</span>
                  <span>9:16 HD Talisman</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-3 max-w-xs">
            Идеально подходит для установки на экран блокировки iPhone/Android и публикации в Instagram Stories.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SacredWallpapersSection;
