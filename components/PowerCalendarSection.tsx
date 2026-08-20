import React, { useState } from 'react';
import { UserInput, MatrixNumbers, PowerCalendarDay } from '../types';
import { generateMonthPowerCalendar } from '../services/powerCalendarUtils';
import { exportPowerCalendarPdf } from '../services/exportUtils';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  DollarSign, 
  Heart, 
  Zap, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  FileDown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

interface PowerCalendarSectionProps {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
}

export const PowerCalendarSection: React.FC<PowerCalendarSectionProps> = ({ userInput, matrix }) => {
  const currentDate = new Date();
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(currentDate.getMonth());
  const [isExporting, setIsExporting] = useState(false);
  
  const days = generateMonthPowerCalendar(currentYear, currentMonthIndex, userInput, matrix);
  const [selectedDay, setSelectedDay] = useState<PowerCalendarDay>(days[Math.min(currentDate.getDate() - 1, days.length - 1)] || days[0]);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportPowerCalendarPdf({
        userInput,
        days,
        year: currentYear,
        monthName: MONTH_NAMES[currentMonthIndex],
        matrix
      });
    } catch (e) {
      console.error("Power Calendar PDF export error:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIndex(prev => prev + 1);
    }
  };

  const getTypeStyle = (type: PowerCalendarDay['energyType']) => {
    switch (type) {
      case 'wealth':
        return {
          bg: 'rgba(34, 197, 94, 0.12)',
          border: 'rgba(34, 197, 94, 0.4)',
          text: '#4ade80',
          dot: '#22c55e'
        };
      case 'love':
        return {
          bg: 'rgba(244, 63, 94, 0.12)',
          border: 'rgba(244, 63, 94, 0.4)',
          text: '#fb7185',
          dot: '#f43f5e'
        };
      case 'spirit':
        return {
          bg: 'rgba(168, 85, 247, 0.12)',
          border: 'rgba(168, 85, 247, 0.4)',
          text: '#c084fc',
          dot: '#a855f7'
        };
      case 'caution':
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.4)',
          text: '#f87171',
          dot: '#ef4444'
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          text: '#cbd5e1',
          dot: '#94a3b8'
        };
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative rounded-3xl p-8 border border-amber-500/30 bg-gradient-to-r from-[#171109] via-[#120d06] to-[#080603] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-serif font-bold uppercase tracking-wider border border-amber-500/30">
                Персональный Энергетический Тайминг
              </span>
              <span className="text-xs text-slate-400 font-mono">365 Дней</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-100 flex items-center gap-3">
              <CalendarIcon className="text-amber-400" />
              Персональный Календарь Силы
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Индивидуальный расчет энергетических циклов на каждый день года: дни максимальной денежной удачи, романтического магнетизма и периоды кармической осторожности.
            </p>
          </div>

          {/* Actions & Month Navigator Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 bg-black/60 p-2 rounded-2xl border border-white/10">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Предыдущий месяц"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-serif font-bold text-sm text-amber-200 px-3 min-w-[130px] text-center">
                {MONTH_NAMES[currentMonthIndex]} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Следующий месяц"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-serif text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer border border-emerald-400/30 disabled:opacity-50"
              title="Скачать PDF календарь"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              <span>PDF Календарь</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legend Badges */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-950/40 border border-green-500/30 text-green-300">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          <span>Денежный Прорыв & Сделки</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          <span>Любовь & Свидания</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span>Озарение & Инсайты</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300">
          <span className="w-2 h-2 rounded-full bg-red-400"></span>
          <span>Трансформация & Осторожность</span>
        </div>
      </div>

      {/* Calendar Grid & Selected Day Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar Days Matrix (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0b0e17]/90 border border-white/10 space-y-4 shadow-xl">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 font-mono pb-2 border-b border-white/5">
            {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const style = getTypeStyle(day.energyType);
              const isSelected = selectedDay.date === day.date;
              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square rounded-2xl p-1.5 flex flex-col items-center justify-between border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105 z-10'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                  style={{
                    backgroundColor: isSelected ? undefined : style.bg,
                    borderColor: isSelected ? undefined : style.border
                  }}
                >
                  <span className="text-xs font-bold text-white self-start ml-1">
                    {day.dayNumber}
                  </span>
                  
                  <span 
                    className="text-[9px] font-serif font-bold px-1 rounded-sm"
                    style={{ color: style.text }}
                  >
                    #{day.dayArcana}
                  </span>

                  <span 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: style.dot }}
                  ></span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Deep Dive Card (5 cols) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay.date}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-7 rounded-3xl border bg-[#0e121e]/95 text-slate-100 shadow-2xl space-y-5"
              style={{
                borderColor: getTypeStyle(selectedDay.energyType).border,
                boxShadow: `0 20px 50px rgba(0,0,0,0.8)`
              }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                    {selectedDay.date} • {selectedDay.weekday}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white mt-0.5">
                    {selectedDay.energyTitle}
                  </h3>
                </div>

                <span 
                  className="px-3 py-1 rounded-xl text-xs font-serif font-bold border"
                  style={{
                    color: getTypeStyle(selectedDay.energyType).text,
                    borderColor: getTypeStyle(selectedDay.energyType).border,
                    backgroundColor: getTypeStyle(selectedDay.energyType).bg
                  }}
                >
                  Аркан #{selectedDay.dayArcana}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/5 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Рекомендация на День:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedDay.shortAdvice}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Статус гармонии:</span>
                <span className={`font-bold ${selectedDay.isFavorable ? 'text-green-400' : 'text-amber-400'}`}>
                  {selectedDay.isFavorable ? '✅ Благоприятный день' : '⚠️ День трансформации'}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PowerCalendarSection;
