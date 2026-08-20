import React, { useState } from 'react';
import { UserInput, MatrixNumbers } from '../types';
import { calculateAkashicKarma } from '../services/akashicUtils';
import { exportAkashicKarmaPdf } from '../services/exportUtils';
import { 
  BookOpen, 
  Sparkles, 
  RotateCcw, 
  Flame, 
  Key, 
  ShieldAlert, 
  Award,
  Scroll,
  FileDown,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AkashicRecordsSectionProps {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
}

export const AkashicRecordsSection: React.FC<AkashicRecordsSectionProps> = ({ userInput, matrix }) => {
  const [isExporting, setIsExporting] = useState(false);
  const karma = calculateAkashicKarma(userInput, matrix);
  const userName = userInput?.name || 'Странник';

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportAkashicKarmaPdf({
        userInput,
        karma,
        matrix
      });
    } catch (e) {
      console.error("Akashic PDF export error:", e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative rounded-3xl p-8 border border-amber-500/30 bg-gradient-to-r from-[#170e08] via-[#120b06] to-[#080503] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-serif font-bold uppercase tracking-wider border border-amber-500/30">
                Хроники Акаши
              </span>
              <span className="text-xs text-slate-400 font-mono">Кармический Хвост Прошлых Жизней</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-100 flex items-center gap-3">
              <BookOpen className="text-amber-400" />
              Книга Прошлых Воплощений и Расторжение Клятв
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Глубинный срез памяти души: кем вы были в прошлом воплощении, какую невыполненную клятву принесли в этот мир и как трансформировать кармический долг в силу.
            </p>
          </div>

          {/* Action Button: Download PDF */}
          <div className="flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-black font-bold font-serif text-sm shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] flex items-center gap-2.5 transition-all cursor-pointer border border-amber-300/40 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 size={18} className="animate-spin text-black" />
                  <span>Формирование PDF...</span>
                </>
              ) : (
                <>
                  <FileDown size={18} className="text-black" />
                  <span>Скачать Кармический Отчет (PDF)</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Karmic Tail Master Card */}
      <div className="p-7 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#16100c] to-[#0a0705] text-slate-100 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-amber-500/20 gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
              Ваш Кармический Хвост:
            </span>
            <h3 className="text-2xl font-serif font-bold text-white">
              {karma.karmicTailName}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {karma.karmicTailArcanas.map((arc, i) => (
              <span 
                key={i}
                className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-serif font-bold text-lg flex items-center justify-center shadow-lg"
              >
                {arc}
              </span>
            ))}
          </div>
        </div>

        {/* 2-Column Past Life Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-2 uppercase font-mono">
              <Scroll size={16} className="text-amber-400" />
              Роль Души в Прошлом Воплощении:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {karma.pastLifeRole}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <span className="text-xs font-bold text-red-400 flex items-center gap-2 uppercase font-mono">
              <ShieldAlert size={16} className="text-red-400" />
              Кармическая Ловушка в Этой Жизни:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {karma.currentLifeTrap}
            </p>
          </div>
        </div>

        {/* Unfulfilled Vow & Oath */}
        <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
          <span className="text-xs font-bold text-red-300 flex items-center gap-2 uppercase font-mono">
            <Flame size={16} className="text-red-400" />
            Невыполненный Обет / Клятва Прошлого:
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-serif italic">
            «{karma.unfulfilledOath}»
          </p>
        </div>

        {/* Soul Growth Task */}
        <div className="p-5 rounded-2xl bg-green-950/20 border border-green-500/30 space-y-2">
          <span className="text-xs font-bold text-green-300 flex items-center gap-2 uppercase font-mono">
            <Award size={16} className="text-green-400" />
            Главная Задача Духовного Роста:
          </span>
          <p className="text-xs text-slate-200 leading-relaxed">
            {karma.soulGrowthTask}
          </p>
        </div>

        {/* Sacred Release Ritual Text */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-black/60 border border-amber-500/40 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase">
            <Key size={14} />
            Сакральная Формула Расторжения Прошлых Клятв
          </div>
          <p className="font-serif text-base text-amber-100 italic leading-relaxed max-w-2xl mx-auto">
            «{karma.releaseRitualAffirmation}»
          </p>
          <p className="text-[11px] text-slate-400">
            Произнесите вслух 3 раза при зажженной свече для освобождения энергетического канала.
          </p>
        </div>

        {/* Bottom PDF Download Banner */}
        <div className="p-6 rounded-2xl bg-black/50 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-amber-200 font-serif">Сохранить Кармический Манускрипт</h4>
            <p className="text-xs text-slate-400">Скачайте полный структурированный PDF с расшифровкой кармического хвоста и практикой освобождения.</p>
          </div>
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold font-serif text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
            <span>Скачать PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AkashicRecordsSection;
