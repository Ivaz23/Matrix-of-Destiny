import React, { useState } from 'react';
import { UserInput, MatrixNumbers, AncestralLineInfo } from '../types';
import { calculateAncestralLineage } from '../services/ancestralUtils';
import { exportAncestralLineagePdf } from '../services/exportUtils';
import { 
  Users, 
  Sparkles, 
  Shield, 
  Heart, 
  Flame, 
  Zap, 
  Scroll, 
  CheckCircle2,
  TreeDeciduous,
  Compass,
  FileDown,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AncestralLineageSectionProps {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
}

export const AncestralLineageSection: React.FC<AncestralLineageSectionProps> = ({ userInput, matrix }) => {
  const [activeSide, setActiveSide] = useState<AncestralLineInfo['side']>('father_male');
  const [isExporting, setIsExporting] = useState(false);

  const analysis = calculateAncestralLineage(userInput?.birthDate || '2000-01-01', matrix);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportAncestralLineagePdf({
        userInput,
        matrix,
        lineage: analysis
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const getSideIcon = (side: AncestralLineInfo['side']) => {
    switch (side) {
      case 'father_male': return <Shield size={18} className="text-amber-400" />;
      case 'father_female': return <Heart size={18} className="text-rose-400" />;
      case 'mother_male': return <Zap size={18} className="text-indigo-400" />;
      case 'mother_female': return <Sparkles size={18} className="text-purple-400" />;
    }
  };

  const selectedLine = analysis.lines.find(l => l.side === activeSide) || analysis.lines[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
            <TreeDeciduous size={14} className="text-amber-400" />
            4 Линии Квадрата Рода
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-100 font-bold">
            Глубокий Анализ Родовых Программ
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
            Резонанс Рода: {analysis.overallKarmaScore}%
          </div>
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all shadow-lg hover:shadow-purple-500/20 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            <span>PDF Манускрипт Рода</span>
          </button>
        </div>
      </div>

      {/* 4 Quadrants Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {analysis.lines.map((line) => (
          <button
            key={line.side}
            onClick={() => setActiveSide(line.side)}
            className={`p-4 rounded-3xl border text-left space-y-2 transition-all ${
              activeSide === line.side
                ? 'bg-gradient-to-b from-amber-500/20 to-black/80 border-amber-400 text-slate-100 shadow-xl scale-102'
                : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                {getSideIcon(line.side)}
              </div>
              <span className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-xs font-serif">
                {line.keyArcana}
              </span>
            </div>
            <span className="text-xs font-serif font-bold block text-slate-200">
              {line.title.split('(')[0]}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {line.title.match(/\((.*?)\)/)?.[1] || ''}
            </span>
          </button>
        ))}
      </div>

      {/* Active Line Detailed Breakdown */}
      <motion.div
        key={selectedLine.side}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-3d rounded-3xl p-7 border border-amber-500/30 bg-gradient-to-br from-[#16120e] via-[#0d0a08] to-[#050403] space-y-6 shadow-2xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300">
              {getSideIcon(selectedLine.side)}
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-100">
                {selectedLine.title}
              </h3>
              <span className="text-xs text-amber-300 font-mono">
                Ведущая энергия: {selectedLine.keyArcana}-й Аркан Судьбы
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Gift */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 space-y-2">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
              ✦ Благословение и Дар Предков:
            </span>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {selectedLine.generationalGift}
            </p>
          </div>

          {/* Karmic Task */}
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/25 space-y-2">
            <span className="text-xs text-rose-400 font-bold uppercase tracking-wider block">
              ⚠️ Родовая Кармическая Задача:
            </span>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {selectedLine.karmicLesson}
            </p>
          </div>
        </div>

        {/* Action & Healing */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1">
            <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">
              Практический шаг для исцеления родового узла:
            </span>
            <p className="text-xs text-slate-200 font-light">
              {selectedLine.actionStep}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest block mb-1">
              Аффирмация соединения с родом
            </span>
            <p className="font-serif italic text-amber-200 text-xs sm:text-sm">
              "{selectedLine.healingAffirmation}"
            </p>
          </div>
        </div>
      </motion.div>

      {/* Lineage Summary & Ritual Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/30 via-black/60 to-purple-950/30 border border-purple-500/30 space-y-4">
        <div className="flex items-center gap-2 text-purple-300 font-bold font-serif text-base">
          <Flame size={18} className="text-amber-400" />
          <span>Сакральный Ритуал Благодарности Предкам</span>
        </div>
        <p className="text-xs text-slate-300 font-light leading-relaxed">
          {analysis.ancestralHealingRitual}
        </p>
      </div>
    </div>
  );
};

export default AncestralLineageSection;
