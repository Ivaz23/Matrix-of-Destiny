import React, { useState } from 'react';
import { UserInput, MatrixNumbers, AstrologyData } from '../types';
import { calculateCityPowerProfile } from '../services/cityPowerUtils';
import { exportCitiesOfPowerPdf } from '../services/exportUtils';
import { 
  MapPin, 
  Search, 
  Sparkles, 
  Coins, 
  Heart, 
  Briefcase, 
  AlertTriangle, 
  Target,
  Compass,
  Globe,
  FileDown,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CitiesOfPowerSectionProps {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
  astrology?: AstrologyData | null;
}

export const CitiesOfPowerSection: React.FC<CitiesOfPowerSectionProps> = ({ userInput, matrix, astrology }) => {
  const [searchCity, setSearchCity] = useState('Дубай');
  const [activeCity, setActiveCity] = useState('Дубай');
  const [isExporting, setIsExporting] = useState(false);

  const popularCities = ['Дубай', 'Бали', 'Париж', 'Москва', 'Рим', 'Нью-Йорк', 'Токио', 'Стамбул'];

  const profile = calculateCityPowerProfile(activeCity, matrix, astrology);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportCitiesOfPowerPdf({
        userInput,
        profile
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setActiveCity(searchCity.trim());
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-teal-400 font-bold flex items-center gap-2">
            <Globe size={14} className="text-teal-400" />
            Основы Астрокартографии и Релокации
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-100 font-bold">
            Города Силы и Резонанс Пространств
          </h2>
        </div>

        <button
          onClick={handleExportPdf}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-200 text-xs font-bold transition-all shadow-lg hover:shadow-teal-500/20 cursor-pointer disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
          <span>PDF Город Силы</span>
        </button>
      </div>

      {/* Search and Quick Chips */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400" />
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Введите название любого города мира (например, Лондон, Алматы, Барселона)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-slate-200 text-sm focus:border-teal-500 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Рассчитать</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-slate-400 text-[11px]">Популярные направления:</span>
          {popularCities.map((city) => (
            <button
              key={city}
              onClick={() => { setSearchCity(city); setActiveCity(city); }}
              className={`px-3 py-1 rounded-xl border text-xs transition-all ${
                activeCity.toLowerCase() === city.toLowerCase()
                  ? 'bg-teal-500/20 border-teal-400 text-teal-200 font-bold'
                  : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Main City Result Card */}
      <motion.div
        key={profile.cityName}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-3d rounded-3xl p-7 border border-teal-500/30 bg-gradient-to-br from-[#0a1816] via-[#060e0d] to-[#020605] space-y-6 shadow-2xl relative overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-teal-500/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/20 border border-teal-400 text-teal-300">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-slate-100">
                {profile.cityName}
              </h3>
              <span className="text-xs text-slate-400">
                Страна: <strong className="text-teal-300">{profile.country}</strong>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl font-bold font-serif text-teal-300">{profile.compatibilityScore}%</span>
            <span className="text-[10px] text-slate-400 block font-mono">энергетический резонанс</span>
          </div>
        </div>

        {/* 4 Impact Vectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Wealth */}
          <div className="p-4.5 rounded-2xl bg-black/50 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Coins size={15} />
              <span>Денежный поток:</span>
            </div>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {profile.wealthImpact}
            </p>
          </div>

          {/* Love */}
          <div className="p-4.5 rounded-2xl bg-black/50 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <Heart size={15} />
              <span>Любовь и Отношения:</span>
            </div>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {profile.loveImpact}
            </p>
          </div>

          {/* Career */}
          <div className="p-4.5 rounded-2xl bg-black/50 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Briefcase size={15} />
              <span>Карьера и Статус:</span>
            </div>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {profile.careerImpact}
            </p>
          </div>
        </div>

        {/* Target Purpose & Caution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/20 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-teal-300">
              <Target size={14} />
              <span>Идеальная цель посещения:</span>
            </div>
            <p className="text-xs text-slate-300 font-light">{profile.bestPurposeForVisit}</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-300">
              <AlertTriangle size={14} />
              <span>Зона внимания:</span>
            </div>
            <p className="text-xs text-slate-300 font-light">{profile.energyWarning}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CitiesOfPowerSection;
