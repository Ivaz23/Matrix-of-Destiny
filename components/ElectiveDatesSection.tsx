import React, { useState } from 'react';
import { UserInput, BestDatesQueryResult } from '../types';
import { findBestFavorableDates } from '../services/electiveUtils';
import { exportElectiveDatesPdf } from '../services/exportUtils';
import { addCustomReminder, requestNotificationPermission } from '../services/notificationService';
import { 
  generateGoogleCalendarUrl, 
  generateSingleIcsContent, 
  generateBulkIcsContent, 
  downloadIcsFile 
} from '../services/calendarExportUtils';
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
  Loader2,
  Bell,
  BellRing,
  Check,
  CalendarPlus,
  Download,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ElectiveDatesSectionProps {
  userInput?: UserInput | null;
  onOpenNotifications?: () => void;
}

export const ElectiveDatesSection: React.FC<ElectiveDatesSectionProps> = ({ userInput, onOpenNotifications }) => {
  const [selectedCategory, setSelectedCategory] = useState<BestDatesQueryResult['goalCategory']>('wedding');
  const [daysRange, setDaysRange] = useState<number>(45);
  const [isExporting, setIsExporting] = useState(false);
  const [scheduledDates, setScheduledDates] = useState<Record<string, boolean>>({});
  const [toastText, setToastText] = useState<string | null>(null);

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

  const handleExportBulkIcs = () => {
    const icsContent = generateBulkIcsContent(result, userInput?.name);
    downloadIcsFile(`chubuk_favorable_dates_${selectedCategory}.ics`, icsContent);
    setToastText(`📅 Файл .ics со всеми ТОП-датами успешно сформирован и скачан!`);
    setTimeout(() => setToastText(null), 4000);
  };

  const handleAddToGoogleCalendar = (item: BestDatesQueryResult['topDates'][0]) => {
    const url = generateGoogleCalendarUrl(item, result.goalTitle, userInput?.name);
    window.open(url, '_blank', 'noopener,noreferrer');
    setToastText(`✨ Открыт Google Календарь для даты ${item.formattedDate}`);
    setTimeout(() => setToastText(null), 3500);
  };

  const handleDownloadSingleIcs = (item: BestDatesQueryResult['topDates'][0]) => {
    const icsContent = generateSingleIcsContent(item, result.goalTitle, userInput?.name);
    downloadIcsFile(`chubuk_date_${item.date}_${selectedCategory}.ics`, icsContent);
    setToastText(`📥 .ics файл для ${item.formattedDate} скачан!`);
    setTimeout(() => setToastText(null), 3500);
  };

  const handleQuickSchedule = async (item: BestDatesQueryResult['topDates'][0]) => {
    await requestNotificationPermission();
    const categoryLabels: Record<string, string> = {
      wedding: 'Свадьба и Союз',
      business: 'Бизнес и Сделки',
      property: 'Покупка Недвижимости/Авто',
      travel: 'Путешествие и Переезд',
      health_beauty: 'Здоровье и Красота',
      spiritual: 'Духовная Практика'
    };

    addCustomReminder({
      title: `${categoryLabels[selectedCategory] || 'Важное Дело'}: ${item.formattedDate}`,
      targetDate: item.date,
      targetTime: '08:30',
      category: selectedCategory === 'wedding' ? 'wedding' : selectedCategory === 'business' ? 'business' : 'custom',
      description: `Благоприятный день (рейтинг ${item.score}%). Золотой час: ${item.goldenHourTip}`
    });

    setScheduledDates(prev => ({ ...prev, [item.date]: true }));
    setToastText(`🔔 Напоминание установлено на ${item.formattedDate} в 08:30!`);
    setTimeout(() => setToastText(null), 3500);
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

          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/40 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Настройка автоматических Push-уведомлений о благоприятных днях"
            >
              <BellRing size={14} className="text-amber-400" />
              <span>Push-напоминания</span>
            </button>
          )}

          {/* Bulk ICS export */}
          <button
            onClick={handleExportBulkIcs}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/40 text-blue-200 text-xs font-bold transition-all shadow-md cursor-pointer"
            title="Экспортировать все найденные ТОП-даты в один .ics файл для импорта в Apple/Google/Outlook календарь"
          >
            <CalendarPlus size={14} className="text-blue-300" />
            <span>Календарь (.ics)</span>
          </button>

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

      {/* Floating Toast Notification */}
      {toastText && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0a1812] to-black border-2 border-emerald-500 text-emerald-200 text-xs font-bold shadow-2xl flex items-center gap-2.5 backdrop-blur-md"
        >
          <BellRing size={16} className="text-emerald-400 animate-bounce" />
          <span>{toastText}</span>
        </motion.div>
      )}

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

              {/* Action Buttons: Calendar Exports & Push Notification */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToGoogleCalendar(item)}
                    className="py-1.5 px-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Добавить это событие прямо в ваш Google Calendar"
                  >
                    <CalendarPlus size={13} className="text-blue-400" />
                    <span>Google Calendar</span>
                    <ExternalLink size={10} className="opacity-60" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSingleIcs(item)}
                    className="py-1.5 px-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Скачать файл события .ics для Apple Calendar, Outlook и др."
                  >
                    <Download size={13} className="text-indigo-400" />
                    <span>Скачать .ics</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickSchedule(item)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    scheduledDates[item.date]
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-200'
                  }`}
                >
                  {scheduledDates[item.date] ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span>Напоминание включено</span>
                    </>
                  ) : (
                    <>
                      <Bell size={14} className="text-amber-400" />
                      <span>🔔 Напомнить в приложении</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ElectiveDatesSection;
