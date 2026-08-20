import React, { useState } from 'react';
import { UserInput, MatrixNumbers, AstrologyData, StoneTalisman } from '../types';
import { calculateLithotherapyProfile } from '../services/lithotherapyUtils';
import { exportLithotherapyPdf } from '../services/exportUtils';
import { 
  Sparkles, 
  Gem, 
  Shield, 
  Coins, 
  Heart, 
  Droplet, 
  Flame, 
  Sun, 
  Moon, 
  Info,
  CheckCircle2,
  FileDown,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LithotherapySectionProps {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
  astrology?: AstrologyData | null;
}

export const LithotherapySection: React.FC<LithotherapySectionProps> = ({ userInput, matrix, astrology }) => {
  const [selectedTab, setSelectedTab] = useState<'stones' | 'oils' | 'metals' | 'rituals'>('stones');
  const [isExporting, setIsExporting] = useState(false);

  const profile = calculateLithotherapyProfile(matrix, astrology);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportLithotherapyPdf({
        userInput,
        profile
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const renderStoneCard = (stone: StoneTalisman, badgeTitle: string, badgeColor: string) => (
    <div className="rounded-3xl p-5 border border-white/10 bg-gradient-to-br from-black/60 to-[#0e0f18] space-y-3.5 relative overflow-hidden shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
            {badgeTitle}
          </span>
          <h4 className="text-lg font-serif font-bold text-slate-100 mt-1">
            {stone.name}
          </h4>
        </div>
        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
          <Gem size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-xl bg-black/40 border border-white/5">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">Стихия</span>
          <span className="text-amber-300 font-medium">{stone.element}</span>
        </div>
        <div className="p-2 rounded-xl bg-black/40 border border-white/5">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">Чакра</span>
          <span className="text-purple-300 font-medium">{stone.chakra}</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 font-light leading-relaxed">
        {stone.properties}
      </p>

      <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-amber-300 font-bold">
          <Sun size={12} />
          <span>Активация:</span>
        </div>
        <p className="text-slate-300 font-light text-[11px]">{stone.activationMethod}</p>

        <div className="flex items-center gap-1.5 text-cyan-300 font-bold pt-1 border-t border-white/5">
          <Droplet size={12} />
          <span>Очищение:</span>
        </div>
        <p className="text-slate-300 font-light text-[11px]">{stone.cleansingMethod}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-bold flex items-center gap-2">
            <Gem size={14} className="text-purple-400" />
            Сакральные Минералы и Ароматерапия
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-100 font-bold">
            Литотерапия и Талисманы
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tab switchers */}
          <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-2xl border border-white/10 text-xs">
            {[
              { key: 'stones' as const, label: 'Кристаллы' },
              { key: 'oils' as const, label: 'Ароматы и Масла' },
              { key: 'metals' as const, label: 'Металлы' },
              { key: 'rituals' as const, label: 'Ритуалы зарядки' }
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setSelectedTab(t.key)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedTab === t.key
                    ? 'bg-purple-500/30 border border-purple-400 text-purple-200 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-200 text-xs font-bold transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            <span>PDF Талисманы</span>
          </button>
        </div>
      </div>

      {/* Personalized Matrix Guidance Header Card */}
      <div className="card-3d rounded-3xl p-6 border border-purple-500/30 bg-gradient-to-br from-[#120e24] via-[#090812] to-[#040308] space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-amber-400">
          <Sparkles size={14} />
          <span>Персональный резонанс матрицы:</span>
        </div>
        <p className="text-sm text-slate-200 font-light leading-relaxed">
          {profile.personalizedGuidance}
        </p>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5 text-xs text-slate-400">
          <span>Священный символ: <strong className="text-purple-300 font-serif">{profile.sacredGeometrySymbol}</strong></span>
        </div>
      </div>

      {/* STONES TAB */}
      {selectedTab === 'stones' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {renderStoneCard(profile.primaryStones[0], '✦ Камень Души и Судьбы', 'bg-purple-500/20 text-purple-300 border border-purple-500/30')}
          {renderStoneCard(profile.wealthStones[0], '💰 Денежный Магнит', 'bg-amber-500/20 text-amber-300 border border-amber-500/30')}
          {renderStoneCard(profile.loveStones[0], '💖 Камень Любви и Сердца', 'bg-rose-500/20 text-rose-300 border border-rose-500/30')}
          {renderStoneCard(profile.protectionStones[0], '🛡️ Защитный Оберег', 'bg-slate-700/50 text-slate-200 border border-slate-500/30')}
        </div>
      )}

      {/* OILS TAB */}
      {selectedTab === 'oils' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {profile.essentialOils.map((oil, idx) => (
            <div key={idx} className="rounded-3xl p-5 border border-white/10 bg-black/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300">
                  <Droplet size={20} />
                </div>
                <div>
                  <h4 className="text-base font-serif font-bold text-slate-100">{oil.name}</h4>
                  <span className="text-[11px] text-slate-400 font-light">{oil.scentProfile}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300">
                <strong className="text-teal-300 block mb-1">Воздействие:</strong>
                <p className="font-light">{oil.effect}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-teal-950/20 border border-teal-500/20 text-xs text-slate-300">
                <strong className="text-amber-300 block mb-1">Рекомендуемый ритуал:</strong>
                <p className="font-light">{oil.recommendedRitual}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* METALS TAB */}
      {selectedTab === 'metals' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile.metals.map((metal, idx) => (
            <div key={idx} className="rounded-3xl p-5 border border-amber-500/30 bg-gradient-to-b from-[#18140e] to-black/60 space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 mx-auto flex items-center justify-center font-bold text-xl">
                ✦
              </div>
              <h4 className="font-serif font-bold text-slate-100 text-base">{metal}</h4>
              <p className="text-xs text-slate-300 font-light">
                Гармонично проводит потоки вашей ведущей стихии, усиливая контакт с кристаллом.
              </p>
            </div>
          ))}
        </div>
      )}

      {/* RITUALS TAB */}
      {selectedTab === 'rituals' && (
        <div className="space-y-4">
          <div className="rounded-3xl p-6 bg-black/50 border border-white/10 space-y-3">
            <h4 className="text-base font-serif font-bold text-amber-300 flex items-center gap-2">
              <Moon size={18} />
              <span>Правило Лунной Зарядки</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Положите ваш минерал на подоконник в ночь Полнолуния на белую натуральную ткань. Произнесите вслух намерение: <em>«Силой Вселенной и Лунного света, очистись и наполнись благословением для защиты и процветания»</em>.
            </p>
          </div>

          <div className="rounded-3xl p-6 bg-black/50 border border-white/10 space-y-3">
            <h4 className="text-base font-serif font-bold text-emerald-300 flex items-center gap-2">
              <Droplet size={18} />
              <span>Очищение Солью и Водой</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Раз в месяц закапывайте защитные камни в сухую крупную морскую соль на 12–24 часа. Соль впитает накопившийся энергоинформационный шум. После процедуры выбросьте соль.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LithotherapySection;
