import React, { useState } from 'react';
import { calculateLunarData } from '../services/lunarUtils';
import { exportLunarCalendarPdf } from '../services/exportUtils';
import { 
  Moon, 
  Sun, 
  Sparkles, 
  Calendar, 
  Scissors, 
  Coins, 
  Heart, 
  HeartPulse, 
  Sprout, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  Quote,
  Zap,
  FileDown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LunarCalendarSection: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [activeCategory, setActiveCategory] = useState<'beauty' | 'finance' | 'love' | 'health' | 'garden' | 'mystic'>('beauty');
  const [isExporting, setIsExporting] = useState(false);

  const lunar = calculateLunarData(selectedDate);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportLunarCalendarPdf({
        lunarInfo: lunar,
        targetDate: selectedDate
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const categories = [
    { key: 'beauty' as const, label: 'Стрижка и Красота', icon: Scissors, color: 'text-pink-400', border: 'border-pink-500/40', bg: 'bg-pink-500/10' },
    { key: 'finance' as const, label: 'Деньги и Бизнес', icon: Coins, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
    { key: 'love' as const, label: 'Любовь и Отношения', icon: Heart, color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-500/10' },
    { key: 'health' as const, label: 'Здоровье и Тело', icon: HeartPulse, color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
    { key: 'garden' as const, label: 'Растения и Дом', icon: Sprout, color: 'text-teal-400', border: 'border-teal-500/40', bg: 'bg-teal-500/10' },
    { key: 'mystic' as const, label: 'Сны и Интуиция', icon: Eye, color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10' }
  ];

  const getAdvice = () => {
    switch (activeCategory) {
      case 'beauty': return lunar.haircutAndBeautyAdvice;
      case 'finance': return lunar.financeAndBusinessAdvice;
      case 'love': return lunar.relationshipsAdvice;
      case 'health': return lunar.healthAndDetoxAdvice;
      case 'garden': return lunar.gardenAndPlantsAdvice;
      case 'mystic': return lunar.dreamAndMysticAdvice;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Date Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-2">
            <Moon size={14} className="text-indigo-400" />
            Астрономический и Сакральный Календарь
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-100 font-bold">
            Лунный Календарь и Фазы
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Selector Navigation */}
          <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              title="Предыдущий день"
            >
              <ChevronLeft size={16} />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-mono text-amber-300 font-bold px-2 py-1 outline-none border-none cursor-pointer"
            />

            <button
              onClick={handleNextDay}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              title="Следующий день"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold transition-colors ml-1"
            >
              Сегодня
            </button>
          </div>

          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            <span>PDF Календарь</span>
          </button>
        </div>
      </div>

      {/* Main Moon Hero Card */}
      <div className="card-3d rounded-3xl p-7 border border-indigo-500/30 bg-gradient-to-br from-[#0e1224] via-[#090d18] to-[#04060c] space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Moon Visual Disc */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-black/40 border border-white/10 relative">
            <div className="text-6xl sm:text-7xl mb-2 drop-shadow-[0_0_25px_rgba(165,180,252,0.4)]">
              {lunar.symbol}
            </div>
            <span className="text-xl font-serif font-bold text-indigo-200 text-center">
              {lunar.phaseName}
            </span>
            <span className="text-xs text-slate-400 font-mono mt-1">
              Освещенность: <strong className="text-indigo-300">{lunar.illuminationPercentage}%</strong>
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Лунные сутки</span>
                <span className="text-lg font-bold font-serif text-indigo-300">{lunar.lunarDay}-й лунный день</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Луна в знаке</span>
                <span className="text-lg font-bold font-serif text-amber-300">{lunar.zodiacSign}</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Символ суток</span>
                <span className="text-sm font-bold text-slate-200 truncate block">{lunar.sacredSymbol}</span>
              </div>
            </div>

            {/* Void of Course Warning if active */}
            {lunar.isVoidOfCourse && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2.5">
                <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                <span>{lunar.voidOfCourseDetails}</span>
              </div>
            )}

            {/* General Vibe */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-200 leading-relaxed">
              <strong className="text-indigo-300 block mb-1">🌌 Энергетический фон дня:</strong>
              <p className="font-light">{lunar.generalVibe}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Guidance Tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(({ key, label, icon: Icon, color, border, bg }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                activeCategory === key
                  ? `${bg} ${border} ${color} shadow-lg scale-102`
                  : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Active Advice Box */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-black/50 border border-white/10 space-y-3"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Sparkles size={16} className="text-amber-400" />
            <span>Рекомендация на {lunar.lunarDay}-й лунный день:</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            {getAdvice()}
          </p>
        </motion.div>
      </div>

      {/* Favorable vs Unfavorable Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Favorable */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-emerald-950/20 to-black/40 border border-emerald-500/25 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 size={16} />
            <span>Благоприятно сегодня:</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {lunar.favorableActivities.map((act, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Unfavorable */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-rose-950/20 to-black/40 border border-rose-500/25 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <XCircle size={16} />
            <span>Не рекомендуется:</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {lunar.unfavorableActivities.map((act, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Affirmation */}
      <div className="card-3d rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 via-black/60 to-indigo-950/30 text-center space-y-2">
        <Quote className="mx-auto text-indigo-400/30" size={24} />
        <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest block">
          Лунная Аффирмация
        </span>
        <p className="font-serif italic text-slate-200 max-w-xl mx-auto text-sm sm:text-base">
          "{lunar.affirmation}"
        </p>
      </div>
    </div>
  );
};

export default LunarCalendarSection;
