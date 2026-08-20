import React, { useState } from 'react';
import { UserInput, BestDatesQueryResult } from '../types';
import { findBestFavorableDates } from '../services/electiveUtils';
import { exportElectiveDatesPdf } from '../services/exportUtils';
import { 
  Calendar, 
  Heart, 
  Briefcase, 
  Key, 
  Plane, 
  Sparkles, 
  Star, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  FileDown,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ElectiveDatesSectionProps {
  userInput?: UserInput | null;
}

export const ElectiveDatesSection: React.FC<ElectiveDatesSectionProps> = ({ userInput }) => {
  const [selectedCategory, setSelectedCategory] = useState<BestDatesQueryResult['goalCategory']>('wedding');
  const [daysRange, setDaysRange] = useState<number>(45);
  const [isExporting, setIsExporting] = useState(false);

  const result = findBestFavorableDates(selectedCategory, userInput, daysRange);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportElectiveDatesPdf({
        userInput,
        category: selectedCategory,
        queryResult: result
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const categories = [
    { key: 'wedding' as const, label: 'Свадьба и Любовь', icon: Heart, color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-500/10' },
    { key: 'business' as const, label: 'Бизнес и Сделки', icon: Briefcase, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
    { key: 'property' as const, label: 'Недвижимость и Авто', icon: Key, color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
    { key: 'travel' as const, label: 'Поездки и Переезд', icon: Plane, color: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-500/10' },
    { key: 'health_beauty' as const, label: 'Здоровье и Детокс', icon: Sparkles, color: 'text-teal-400', border: 'border-teal-500/40', bg: 'bg-teal-500/10' },
    { key: 'spiritual' as const, label: 'Духовные Практики', icon: Star, color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
            <Calendar size={14} className="text-amber-400" />
            Элективная Астро-Нумерология
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-100 font-bold">
            Календарь Благоприятных Дат
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Days range selector */}
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 text-xs">
            <span className="text-slate-400 pl-2">Горизонт:</span>
            {[30, 45, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDaysRange(d)}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                  daysRange === d
                    ? 'bg-amber-500/30 border border-amber-400 text-amber-200'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d} дн.
              </button>
            ))}
          </div>

          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            <span>PDF Даты</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {categories.map(({ key, label, icon: Icon, color, border, bg }) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold gap-1.5 transition-all text-center ${
              selectedCategory === key
                ? `${bg} ${border} ${color} shadow-lg scale-102`
                : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Strategy Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-black/50 to-amber-500/15 border border-amber-500/30 space-y-1 text-xs">
        <strong className="text-amber-300 font-bold uppercase tracking-wider block">
          ✦ Астро-нумерологическая стратегия выбора:
        </strong>
        <p className="text-slate-300 font-light leading-relaxed">
          {result.generalStrategy}
        </p>
      </div>

      {/* Top Recommended Dates Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif font-bold text-slate-200 flex items-center gap-2">
          <Star size={18} className="text-amber-400" />
          <span>Лучшие даты на {result.timeframe}:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.topDates.map((item, idx) => (
            <motion.div
              key={item.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-3xl p-5 border space-y-3.5 shadow-lg relative overflow-hidden ${
                item.rating === 'exceptional'
                  ? 'bg-gradient-to-br from-emerald-950/40 via-[#0a1410] to-[#040806] border-emerald-500/40 shadow-emerald-950/30'
                  : item.rating === 'favorable'
                  ? 'bg-gradient-to-br from-amber-950/30 via-[#120f08] to-[#060402] border-amber-500/30'
                  : 'bg-black/40 border-white/10'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      item.rating === 'exceptional'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.rating === 'exceptional' ? '✦ Идеальный день' : '✓ Благоприятно'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.lunarDay}-й лунный день ({item.moonSign})
                    </span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-slate-100 mt-1 capitalize">
                    {item.formattedDate}
                  </h4>
                </div>

                {/* Score badge */}
                <div className="text-right">
                  <span className={`text-2xl font-bold font-serif ${
                    item.score >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {item.score}%
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">резонанс</span>
                </div>
              </div>

              {/* Day Arcana */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-center justify-between">
                <span>Аркан дня: <strong className="text-amber-300">{item.dayArcana}-й Аркан Судьбы</strong></span>
                <span className="text-slate-400 text-[11px] font-mono">{item.date}</span>
              </div>

              {/* Golden Hour Tip */}
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Clock size={13} className="text-amber-400 shrink-0" />
                <span className="font-light">{item.goldenHourTip}</span>
              </div>

              {/* Pros & Cautions */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-white/5">
                {item.pros.map((p, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-emerald-300">
                    <span className="font-bold">✓</span>
                    <span className="font-light">{p}</span>
                  </div>
                ))}
                {item.cautions.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                    <span className="text-amber-400">⚠️</span>
                    <span className="font-light">{c}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ElectiveDatesSection;
