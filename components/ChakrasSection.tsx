import React, { useState } from 'react';
import { UserInput, MatrixNumbers, ChakraInfo } from '../types';
import { calculateChakraProfile } from '../services/chakraUtils';
import { exportChakrasPdf } from '../services/exportUtils';
import { 
  Activity, 
  Sparkles, 
  Heart, 
  Zap, 
  ShieldCheck, 
  Flame, 
  Eye, 
  Crown, 
  Info, 
  ChevronRight,
  AlertCircle,
  FileDown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChakrasSectionProps {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
}

export const ChakrasSection: React.FC<ChakrasSectionProps> = ({ userInput, matrix }) => {
  const [isExporting, setIsExporting] = useState(false);
  const profile = calculateChakraProfile(userInput, matrix);
  const [selectedChakra, setSelectedChakra] = useState<ChakraInfo>(profile.chakras[3]); // Default Anahata

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportChakrasPdf({
        userInput,
        profile,
        matrix
      });
    } catch (e) {
      console.error("Chakras PDF export error:", e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative rounded-3xl p-8 border border-purple-500/30 bg-gradient-to-r from-[#140b22] via-[#10081c] to-[#08040d] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-serif font-bold uppercase tracking-wider border border-purple-500/30">
                Энергетическая Анатомия
              </span>
              <span className="text-xs text-slate-400 font-mono">Психосоматика & 7 Чакр</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-purple-100 flex items-center gap-3">
              <Activity className="text-purple-400" />
              Сакральная Психосоматика и Карта Чакр
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Диагностика энергетических центров по вашей Матрице Судьбы: определение телесных зажимов, органов под нагрузкой и целебных практик для раскрытия потенциала.
            </p>
          </div>

          <div className="flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-600 to-indigo-600 text-white font-bold font-serif text-sm shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] flex items-center gap-2.5 transition-all cursor-pointer border border-purple-300/30 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Формирование PDF...</span>
                </>
              ) : (
                <>
                  <FileDown size={18} className="text-white" />
                  <span>Скачать Карту Чакр (PDF)</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 7 Chakras Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 px-1">
            Выберите энергетический центр:
          </h3>
          <div className="space-y-2.5">
            {profile.chakras.map((chakra, idx) => {
              const isSelected = selectedChakra.id === chakra.id;
              return (
                <motion.button
                  key={chakra.id}
                  onClick={() => setSelectedChakra(chakra)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-purple-400 bg-gradient-to-r from-purple-950/60 to-black/60 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      : 'border-white/5 bg-[#0b0e17]/80 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-md"
                      style={{ 
                        backgroundColor: chakra.bgGlow,
                        border: `1.5px solid ${chakra.color}`,
                        color: chakra.color
                      }}
                    >
                      {7 - idx}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-serif">{chakra.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{chakra.sanskritName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-0.5 rounded-md text-xs font-serif font-bold border"
                      style={{ 
                        color: chakra.color,
                        borderColor: `${chakra.color}40`,
                        backgroundColor: `${chakra.color}15`
                      }}
                    >
                      #{chakra.arcana}
                    </span>
                    <ChevronRight size={16} className={isSelected ? 'text-purple-400' : 'text-slate-600'} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Chakra Deep Dive Detail Card (7 cols) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedChakra.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-7 rounded-3xl border bg-[#0d101a]/95 text-slate-100 shadow-2xl space-y-6 relative overflow-hidden"
              style={{
                borderColor: `${selectedChakra.color}60`,
                boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${selectedChakra.bgGlow}`
              }}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: selectedChakra.color }}
                    ></span>
                    <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
                      {selectedChakra.sanskritName}
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white">
                    {selectedChakra.name}
                  </h3>
                </div>

                <div 
                  className="px-4 py-2 rounded-2xl border text-center self-start sm:self-auto"
                  style={{
                    backgroundColor: `${selectedChakra.color}15`,
                    borderColor: `${selectedChakra.color}50`
                  }}
                >
                  <span className="text-[10px] text-slate-400 block uppercase">Энергия в Матрице</span>
                  <span className="font-serif font-bold text-lg" style={{ color: selectedChakra.color }}>
                    Аркан #{selectedChakra.arcana}
                  </span>
                </div>
              </div>

              {/* Physical & Psychosomatic Core Grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase font-mono">
                    <Heart size={14} /> Физические Органы:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedChakra.physicalOrgans}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase font-mono">
                    <AlertCircle size={14} /> Психосоматический Блок:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedChakra.psychosomaticBlock}
                  </p>
                </div>
              </div>

              {/* Resource State vs Negative Symptoms */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-green-950/20 border border-green-500/30 space-y-1.5">
                  <span className="text-xs font-bold text-green-300 flex items-center gap-1.5 uppercase font-mono">
                    <Zap size={14} className="text-green-400" /> Ресурсное Проявление (Плюс):
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedChakra.positiveState}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                  <span className="text-xs font-bold text-red-300 flex items-center gap-1.5 uppercase font-mono">
                    <ShieldCheck size={14} className="text-red-400" /> Симптомы Зажима / Дисбаланса:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedChakra.negativeSymptoms.map((sym, i) => (
                      <div key={i} className="p-2 rounded-xl bg-black/40 text-[11px] text-red-200/90 border border-red-500/20">
                        • {sym}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Healing Practice Card */}
              <div 
                className="p-4.5 rounded-2xl border flex items-start gap-3.5"
                style={{
                  backgroundColor: `${selectedChakra.color}10`,
                  borderColor: `${selectedChakra.color}40`
                }}
              >
                <Sparkles size={20} className="shrink-0 mt-0.5" style={{ color: selectedChakra.color }} />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: selectedChakra.color }}>
                    Целебная Практика для Раскрытия Центра:
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedChakra.healingExercise}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChakrasSection;
