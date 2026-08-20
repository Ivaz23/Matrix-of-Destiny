import React, { useState } from 'react';
import { UserInput, MatrixNumbers, DreamAnalysisResult } from '../types';
import { calculateLunarData } from '../services/lunarUtils';
import { exportDreamOraclePdf } from '../services/exportUtils';
import { 
  Sparkles, 
  Moon, 
  Send, 
  Eye, 
  Key, 
  ShieldAlert, 
  Compass, 
  Loader2,
  BookOpen,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DreamOracleSectionProps {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
}

export const DreamOracleSection: React.FC<DreamOracleSectionProps> = ({ userInput, matrix }) => {
  const [dreamText, setDreamText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<DreamAnalysisResult | null>(null);

  const handleExportPdf = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      await exportDreamOraclePdf({
        userInput,
        dreamText,
        result: {
          interpretation: result.hiddenSubconsciousMessage,
          keySymbols: result.symbolicDecodings.map(s => `${s.symbol}: ${s.meaning}`),
          warning: result.lunarContext,
          actionableAdvice: result.wakingWorldActionAdvice,
          arcanaConnection: matrix?.center || 10,
          archetype: result.archetypeArcanas[0]?.name || 'Странник',
          isProphetic: dreamText.length > 50
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAnalyzeDream = () => {
    if (!dreamText.trim()) return;
    setLoading(true);

    const lunar = calculateLunarData();
    const centerArcana = matrix?.center || 10;
    const destinyArcana = matrix?.destiny || 19;

    setTimeout(() => {
      // Offline archetypal symbol parser
      const lower = dreamText.toLowerCase();
      const decodings: { symbol: string; meaning: string }[] = [];

      if (lower.includes('вода') || lower.includes('море') || lower.includes('океан') || lower.includes('река')) {
        decodings.push({
          symbol: "Водная стихия",
          meaning: "Глубинные эмоции, состояние психики и очищение. Чистая вода — к духовному росту, мутная — к скрытым переживаниям."
        });
      }
      if (lower.includes('полет') || lower.includes('летать') || lower.includes('небо') || lower.includes('птица')) {
        decodings.push({
          symbol: "Полет и Высота",
          meaning: "Стремление души к свободе, преодоление земных ограничений и расширение творческого горизонта."
        });
      }
      if (lower.includes('дом') || lower.includes('комната') || lower.includes('дверь') || lower.includes('замок')) {
        decodings.push({
          symbol: "Дом и Помещения",
          meaning: "Отражение структуры вашей личности. Новые тайные комнаты символизируют нераскрытые таланты."
        });
      }
      if (lower.includes('деньги') || lower.includes('золото') || lower.includes('монет') || lower.includes('клад')) {
        decodings.push({
          symbol: "Золото и Ресурсы",
          meaning: "Пробуждение энергии изобилия и признание собственной ценности."
        });
      }
      if (decodings.length === 0) {
        decodings.push({
          symbol: "Сакральный Сюжет",
          meaning: "Сон отражает работу подсознания над ключевым жизненным выбором в текущем цикле."
        });
      }

      setResult({
        dreamText,
        archetypeArcanas: [
          { arcana: 18, name: "Луна (Скрытые тайны и интуиция)", relevance: "Прямой контакт с подсознанием и преодоление иллюзий." },
          { arcana: centerArcana, name: `${centerArcana}-й Аркан Судьбы (Центр Души)`, relevance: "Сон передает послание о вашем главном предназначении." }
        ],
        lunarContext: `Сон приснился в ${lunar.lunarDay}-е лунные сутки (${lunar.phaseName}). В этот день сны ${lunar.lunarDay % 2 === 0 ? 'вещие и быстро проявляются наяву' : 'показывают внутреннее психологическое очищение'}.`,
        hiddenSubconsciousMessage: `Ваша душа стремится освободиться от лишнего ментального шума и сфокусироваться на созидании. Обратите внимание на чувства, которые вы испытали в момент пробуждения.`,
        symbolicDecodings: decodings,
        spiritualWarningOrBlessing: `Благословение на доверие внутреннему компасу: не позволяйте сомнениям заглушить тихий голос вашей интуиции.`,
        wakingWorldActionAdvice: `Запишите ключевые озарения из этого сна в блокнот и сделайте один практический шаг к своей цели до захода солнца.`
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-2">
          <Moon size={14} className="text-indigo-400" />
          Сакральная Онейромантия
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-100 font-bold">
          AI Оракул Сновидений
        </h2>
      </div>

      {/* Input Box */}
      <div className="card-3d rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-br from-[#0c0f1e] via-[#080a14] to-[#04050a] space-y-4 shadow-xl">
        <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
          Опишите ваш сон (сюжет, эмоции, персонажи, символы):
        </label>
        <textarea
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          placeholder="Мне приснилось, что я поднимаюсь на высокую гору на рассвете, а в небе летит птица из золотого света..."
          rows={4}
          className="w-full rounded-2xl bg-black/60 border border-white/10 p-4 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
        />

        <div className="flex justify-end">
          <button
            onClick={handleAnalyzeDream}
            disabled={loading || !dreamText.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Оракул расшифровывает...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Истолковать Сон</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-6"
          >
            {/* Lunar & Subconscious message banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-black/60 to-purple-950/40 border border-indigo-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider block">
                  ✦ Контекст Лунного Дня:
                </span>
                <button
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
                  <span>PDF Толкование Сна</span>
                </button>
              </div>
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                {result.lunarContext}
              </p>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-200">
                <strong className="text-amber-300 block mb-1">Послание подсознания:</strong>
                <p className="font-light">{result.hiddenSubconsciousMessage}</p>
              </div>
            </div>

            {/* Archetypes & Symbols grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Symbols */}
              <div className="p-5 rounded-3xl bg-black/50 border border-white/10 space-y-3">
                <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} />
                  <span>Расшифровка Символов Сна:</span>
                </span>
                <div className="space-y-2">
                  {result.symbolicDecodings.map((sym, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                      <strong className="text-amber-300 text-xs block">{sym.symbol}</strong>
                      <p className="text-xs text-slate-300 font-light">{sym.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arcana Resonance */}
              <div className="p-5 rounded-3xl bg-black/50 border border-white/10 space-y-3">
                <span className="text-xs text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Key size={14} />
                  <span>Связь с Арканами Судьбы:</span>
                </span>
                <div className="space-y-2">
                  {result.archetypeArcanas.map((arc, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-1">
                      <strong className="text-purple-300 text-xs block">{arc.name}</strong>
                      <p className="text-xs text-slate-300 font-light">{arc.relevance}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action advice */}
            <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/30 text-xs text-slate-300 space-y-2">
              <strong className="text-amber-300 uppercase tracking-wider block">
                Совет для бодрствующего мира (Наяву):
              </strong>
              <p className="font-light leading-relaxed">{result.wakingWorldActionAdvice}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DreamOracleSection;
