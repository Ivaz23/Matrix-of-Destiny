import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  ShieldAlert, 
  BookOpen, 
  Sliders, 
  Compass, 
  HelpCircle, 
  Flame, 
  Heart, 
  Coins, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  Layers,
  Activity
} from 'lucide-react';
import { UserInput, MatrixNumbers } from '../types';
import { 
  ARCANA_PSYCHOLOGY_DATA, 
  getArcanaProfile, 
  buildMatrixPsychologicalMap, 
  ArcanaPsychologyProfile 
} from '../services/arcanaPsychologyData';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';
import { chatWithChubuk } from '../services/geminiService';

interface PsychologicalPortraitSectionProps {
  userInput: UserInput | null;
  matrix: MatrixNumbers | null;
  onNavigateToMatrix?: () => void;
}

export const PsychologicalPortraitSection: React.FC<PsychologicalPortraitSectionProps> = ({
  userInput,
  matrix,
  onNavigateToMatrix
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'test' | 'encyclopedia'>('profile');
  const [selectedPosition, setSelectedPosition] = useState<'day' | 'month' | 'year' | 'karmic' | 'comfort' | 'destiny'>('day');
  const [displayMode, setDisplayMode] = useState<'plus' | 'minus' | 'keys' | 'position'>('plus');
  const [selectedEncyclopediaArcana, setSelectedEncyclopediaArcana] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Interactive Energy Balance Sliders (0 = 100% Minus, 100 = 100% Plus)
  const [balanceScores, setBalanceScores] = useState<Record<string, number>>({
    day: 70,
    month: 80,
    year: 65,
    karmic: 45,
    comfort: 75
  });

  // AI Psychological Report State
  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false);
  const [aiPsychologyReport, setAiPsychologyReport] = useState<string | null>(null);

  const { playingId, playAudio, stopAudio } = useGlobalAudio();

  const matrixMap = useMemo(() => {
    if (!matrix) return null;
    return buildMatrixPsychologicalMap(matrix);
  }, [matrix]);

  const activeProfile: ArcanaPsychologyProfile = useMemo(() => {
    if (!matrixMap) return getArcanaProfile(1);
    switch (selectedPosition) {
      case 'day': return matrixMap.dayProfile;
      case 'month': return matrixMap.monthProfile;
      case 'year': return matrixMap.yearProfile;
      case 'karmic': return matrixMap.karmicProfile;
      case 'comfort': return matrixMap.comfortProfile;
      case 'destiny': return matrixMap.destinyProfile;
      default: return matrixMap.dayProfile;
    }
  }, [matrixMap, selectedPosition]);

  const getPositionTitle = (pos: typeof selectedPosition) => {
    switch (pos) {
      case 'day': return 'Точка А: Личность & Визитка (День)';
      case 'month': return 'Точка B: Таланты & Высшая Связь (Месяц)';
      case 'year': return 'Точка C: Деньги & Материализация (Год)';
      case 'karmic': return 'Точка D: Кармический Хвост (Главный Урок)';
      case 'comfort': return 'Точка E: Зона Комфорта (Центр Души)';
      case 'destiny': return 'Предназначение: Итоговый Синтез';
    }
  };

  const getPositionNuanceText = (profile: ArcanaPsychologyProfile, pos: typeof selectedPosition) => {
    switch (pos) {
      case 'day': return profile.positionNuances.dayCard;
      case 'month': return profile.positionNuances.talentMonth;
      case 'year': return profile.positionNuances.moneyYear;
      case 'karmic': return profile.positionNuances.karmicTail;
      case 'comfort': return profile.positionNuances.comfortCenter;
      case 'destiny': return profile.positionNuances.comfortCenter + ' ' + profile.positionNuances.talentMonth;
    }
  };

  const totalResourceIndex = useMemo(() => {
    const values = Object.values(balanceScores) as number[];
    const sum = values.reduce((a: number, b: number) => a + b, 0);
    return values.length > 0 ? Math.round(sum / values.length) : 50;
  }, [balanceScores]);

  const handleGenerateAiPsychologySynthesis = async () => {
    if (!userInput || !matrix || !matrixMap) return;
    setIsGeneratingAiReport(true);
    setAiPsychologyReport(null);
    try {
      const prompt = `Составь глубокий, профессиональный и кристально ясный психологический портрет личности на стыке глубинной психологии К.Г. Юнга и Матрицы Судьбы для:
Имя: ${userInput.name}, Пол: ${userInput.gender === 'male' ? 'Мужской' : 'Женский'}, Дата рождения: ${userInput.birthDate}.
Ключевые энергии матрицы:
- Визитка личности (День): ${matrix.day} Аркан (${matrixMap.dayProfile.name})
- Таланты и дух (Месяц): ${matrix.month} Аркан (${matrixMap.monthProfile.name})
- Финансовый канал (Год): ${matrix.year} Аркан (${matrixMap.yearProfile.name})
- Кармический хвост / главный теневой урок (Низ): ${matrix.bottom} Аркан (${matrixMap.karmicProfile.name})
- Зона комфорта души (Центр): ${matrix.center} Аркан (${matrixMap.comfortProfile.name})

Главная цель: Раз и навсегда убрать сумбур и противоречия в трактовках. Четко разложи:
1. ПСИХОЛОГИЧЕСКИЙ АРХЕТИП И СТЕРЖЕНЬ: В чем главная суперсила человека, когда он находится в ПЛЮСЕ.
2. ВНУТРЕННИЙ ПСИХОЛОГИЧЕСКИЙ КОНФЛИКТ: Как энергия визитки (${matrix.day}) конфликтует с теневой программой кармического хвоста (${matrix.bottom}), и почему человек может скатываться в минус.
3. ТРИГГЕРЫ ПЕРЕХОДА В МИНУС: Точные жизненные ситуации, которые включают детские травмы, гиперконтроль, страх или агрессию.
4. ПОШАГОВЫЙ АЛГОРИТМ ПЕРЕВОДА ИЗ МИНУСА В ПЛЮС: 3 конкретных психологических ключа действий.
5. ФОРМУЛА ДЕНЕГ И ОТНОШЕНИЙ: Как вывести финансовый (${matrix.year}) и любовный каналы на максимум реализации.

Напиши вдумчиво, структурированно, уважительно и без псевдоэзотерической воды.`;

      const response = await chatWithChubuk(prompt, [], { userInput, matrix });
      setAiPsychologyReport(response);
    } catch (e) {
      console.error(e);
      setAiPsychologyReport('Не удалось сформировать психологический отчет. Проверьте соединение с сервером.');
    } finally {
      setIsGeneratingAiReport(false);
    }
  };

  const filteredArcanas = useMemo(() => {
    const list = Object.values(ARCANA_PSYCHOLOGY_DATA);
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(a => 
      a.name.toLowerCase().includes(term) || 
      a.archetype.toLowerCase().includes(term) || 
      a.arcana.toString() === term ||
      a.roman.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const selectedEncyclopediaProfile = ARCANA_PSYCHOLOGY_DATA[selectedEncyclopediaArcana] || ARCANA_PSYCHOLOGY_DATA[1];

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#090d16] border border-amber-500/30 p-6 sm:p-8 shadow-2xl shadow-purple-950/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold tracking-wide">
              <Brain size={14} className="text-amber-400" />
              Глубинная Нумеропсихология
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Психологический Портрет & Арканы
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Кристально понятная система без мистического тумана. Каждая энергия раскрыта через дуальность: <span className="text-emerald-400 font-semibold">ПЛЮС (Ресурс)</span>, <span className="text-rose-400 font-semibold">МИНУС (Тень и Блоки)</span> и <span className="text-amber-300 font-semibold">Ключи Трансформации</span> с учетом позиции в матрице.
            </p>
          </div>

          {userInput && matrix && (
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-right">
                <span className="text-[11px] text-slate-400 uppercase tracking-widest block">Профиль</span>
                <span className="text-sm font-serif font-bold text-amber-300">{userInput.name}</span>
                <span className="text-[11px] text-slate-400 block font-mono">{userInput.birthDate}</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl font-serif text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Compass size={15} />
            <span>Ваш Персональный Портрет</span>
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2.5 rounded-xl font-serif text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'test'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Sliders size={15} />
            <span>Индекс Ресурса (+ / -)</span>
          </button>

          <button
            onClick={() => setActiveTab('encyclopedia')}
            className={`px-4 py-2.5 rounded-xl font-serif text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'encyclopedia'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <BookOpen size={15} />
            <span>Энциклопедия 22 Арканов</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PERSONAL PSYCHOLOGICAL PORTRAIT */}
      {activeTab === 'profile' && (
        <div className="space-y-8">
          {!matrix ? (
            <div className="bg-[#0b1020]/90 border border-amber-500/30 rounded-3xl p-8 text-center space-y-4 shadow-xl">
              <Sparkles className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
              <h3 className="text-xl font-serif text-white">Матрица еще не рассчитана</h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Введите дату рождения на главной странице, чтобы мгновенно раскрыть полный персональный психологический портрет.
              </p>
              {onNavigateToMatrix && (
                <button
                  onClick={onNavigateToMatrix}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
                >
                  Перейти к расчету
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Concept Clarification Callout */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                  <HelpCircle size={20} />
                </div>
                <div className="space-y-1 text-xs sm:text-sm text-slate-200">
                  <span className="font-bold text-amber-300 block font-serif">
                    Почему в нумерологии одна энергия трактуется по-разному?
                  </span>
                  <p className="leading-relaxed text-slate-300">
                    Энергия аркана — это не приговор, а частотный диапазон. В зависимости от уровня осознанности человек проявляет либо высшие качества (<span className="text-emerald-400 font-semibold">ПЛЮС</span>), либо эго-ловушки (<span className="text-rose-400 font-semibold">МИНУС</span>). Кроме того, одна и та же энергия на линии денег дает доход, а в кармическом хвосте требует проработки старого долга.
                  </p>
                </div>
              </div>

              {/* Position Switcher Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { key: 'day', label: 'Личность (A)', num: matrix.day, icon: Compass, color: 'text-sky-400' },
                  { key: 'month', label: 'Талант (B)', num: matrix.month, icon: Sparkles, color: 'text-purple-400' },
                  { key: 'year', label: 'Финансы (C)', num: matrix.year, icon: Coins, color: 'text-amber-400' },
                  { key: 'karmic', label: 'Карма (D)', num: matrix.bottom, icon: AlertTriangle, color: 'text-rose-400' },
                  { key: 'comfort', label: 'Душа (E)', num: matrix.center, icon: Heart, color: 'text-emerald-400' },
                  { key: 'destiny', label: 'Судьба', num: matrix.destiny, icon: Flame, color: 'text-yellow-400' },
                ].map((item) => {
                  const isSel = selectedPosition === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedPosition(item.key as any)}
                      className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2 cursor-pointer ${
                        isSel
                          ? 'bg-gradient-to-b from-amber-500/20 to-purple-900/40 border-amber-400 shadow-lg shadow-amber-500/10'
                          : 'bg-[#0b1020]/80 hover:bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-400">{item.label}</span>
                        <item.icon size={15} className={item.color} />
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold font-mono text-white">{item.num}</span>
                        <span className="text-[10px] text-amber-300 truncate">
                          {ARCANA_PSYCHOLOGY_DATA[item.num]?.name.split(' ')[0] || 'Аркан'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Main Card for Selected Energy */}
              <div className="bg-[#0b1020]/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                {/* Energy Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400">
                        {activeProfile.arcana} ({activeProfile.roman})
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-purple-900/50 text-purple-300 border border-purple-500/30 font-medium">
                        {activeProfile.element}
                      </span>
                      <span className="text-xs text-slate-400">{activeProfile.symbol}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                      {activeProfile.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-amber-200/90 font-medium">
                      Архетип: {activeProfile.archetype}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 max-w-sm">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
                      {getPositionTitle(selectedPosition)}
                    </span>
                    <p className="text-xs text-slate-200 mt-1 italic leading-relaxed">
                      {getPositionNuanceText(activeProfile, selectedPosition)}
                    </p>
                  </div>
                </div>

                {/* Core Drive & Motto */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] text-amber-400 uppercase tracking-wider font-bold">Девиз Души</span>
                    <p className="text-sm font-serif italic text-slate-200">{activeProfile.motto}</p>
                  </div>
                  <div className="text-xs text-slate-300 max-w-md border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
                    <span className="text-amber-400 font-bold block text-[11px] uppercase">Главный Драйвер:</span>
                    {activeProfile.coreDrive}
                  </div>
                </div>

                {/* View Mode Toggle: Plus vs Minus vs Keys vs Nuances */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/10">
                  <button
                    onClick={() => setDisplayMode('plus')}
                    className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      displayMode === 'plus'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <CheckCircle2 size={15} className="text-emerald-300" />
                    <span>В ПЛЮСЕ (+) Ресурс</span>
                  </button>

                  <button
                    onClick={() => setDisplayMode('minus')}
                    className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      displayMode === 'minus'
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <AlertTriangle size={15} className="text-rose-300" />
                    <span>В МИНУСЕ (-) Тень</span>
                  </button>

                  <button
                    onClick={() => setDisplayMode('keys')}
                    className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      displayMode === 'keys'
                        ? 'bg-amber-600 text-black shadow-lg shadow-amber-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Zap size={15} className="text-amber-950" />
                    <span>Ключи Перехода (- ➔ +)</span>
                  </button>

                  <button
                    onClick={() => setDisplayMode('position')}
                    className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      displayMode === 'position'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Layers size={15} className="text-purple-300" />
                    <span>Специфика Позиции</span>
                  </button>
                </div>

                {/* Display Panels */}
                <AnimatePresence mode="wait">
                  {displayMode === 'plus' && (
                    <motion.div
                      key="plus-mode"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                        <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 size={16} />
                          {activeProfile.plusTraits.title}
                        </span>
                        <p className="text-slate-200 text-sm leading-relaxed">
                          {activeProfile.plusTraits.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block">
                            🧠 Мышление в Ресурсе
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            {activeProfile.plusTraits.mindset}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                          <span className="text-sky-400 text-xs font-bold uppercase tracking-wider block">
                            👥 Поведение в Социуме
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {activeProfile.plusTraits.socialBehavior}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block">
                            💰 Деньги и Карьера
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {activeProfile.plusTraits.moneyAndCareer}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                          <span className="text-pink-400 text-xs font-bold uppercase tracking-wider block">
                            ❤️ Любовь и Отношения
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {activeProfile.plusTraits.loveAndRelationships}
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3 text-xs text-slate-300">
                        <Activity size={16} className="text-emerald-400 shrink-0" />
                        <span><strong>Телесный маркер ресурса:</strong> {activeProfile.plusTraits.somaticHealth}</span>
                      </div>
                    </motion.div>
                  )}

                  {displayMode === 'minus' && (
                    <motion.div
                      key="minus-mode"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                        <span className="text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                          <AlertTriangle size={16} />
                          {activeProfile.minusTraits.title}
                        </span>
                        <p className="text-slate-200 text-sm leading-relaxed">
                          {activeProfile.minusTraits.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                          <span className="text-rose-400 text-xs font-bold uppercase tracking-wider block">
                            🪤 Ловушки Эго & Самообман
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {activeProfile.minusTraits.egoTraps}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                          <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider block">
                            ⚠️ Токсичные Паттерны
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {activeProfile.minusTraits.toxicPatterns}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                          <span className="text-orange-400 text-xs font-bold uppercase tracking-wider block">
                            💸 Денежные Блоки & Сливы
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {activeProfile.minusTraits.moneyBlockers}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                          <span className="text-purple-400 text-xs font-bold uppercase tracking-wider block">
                            💔 Разрушение Отношений
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {activeProfile.minusTraits.relationshipDestruction}
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3 text-xs text-slate-300">
                        <ShieldAlert size={16} className="text-rose-400 shrink-0" />
                        <span><strong>Психосоматика и зажимы:</strong> {activeProfile.minusTraits.psychosomatics}</span>
                      </div>
                    </motion.div>
                  )}

                  {displayMode === 'keys' && (
                    <motion.div
                      key="keys-mode"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                        <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                          <Zap size={16} />
                          Алгоритм Трансформации: Как переключить энергию в плюс
                        </span>
                        
                        <div className="space-y-2.5 pt-1">
                          {activeProfile.transformationKeys.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-xs text-slate-200">
                              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold font-mono shrink-0 text-[10px]">
                                {idx + 1}
                              </span>
                              <p className="leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                          <span className="text-rose-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <AlertTriangle size={14} />
                            Триггеры Слива Энергии
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {activeProfile.drainTriggers.map((t, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-2">
                          <span className="text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldAlert size={14} />
                            Красные Флаги (Что категорически нельзя)
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {activeProfile.redFlags.map((r, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Sacred Affirmation */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-amber-950/40 to-black border border-amber-500/20 text-center space-y-1">
                        <span className="text-[11px] text-amber-300 uppercase tracking-widest font-bold block">
                          Исцеляющая Аффирмация
                        </span>
                        <p className="text-sm font-serif italic text-white">«{activeProfile.affirmation}»</p>
                      </div>
                    </motion.div>
                  )}

                  {displayMode === 'position' && (
                    <motion.div
                      key="position-mode"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                        <span className="text-purple-300 font-bold text-xs uppercase tracking-wider">
                          Почему {activeProfile.arcana} Аркан звучит по-разному на разных позициях:
                        </span>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          В матрице судьбы энергия не существует в вакууме. Она адаптируется под задачу конкретного энергетического узла.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                          <span className="text-sky-400 text-xs font-bold block">Визитка (День рождения)</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{activeProfile.positionNuances.dayCard}</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                          <span className="text-purple-400 text-xs font-bold block">Талант Души (Месяц)</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{activeProfile.positionNuances.talentMonth}</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                          <span className="text-amber-400 text-xs font-bold block">Линия Денег (Год)</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{activeProfile.positionNuances.moneyYear}</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                          <span className="text-rose-400 text-xs font-bold block">Кармический Хвост (Низ)</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{activeProfile.positionNuances.karmicTail}</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                          <span className="text-emerald-400 text-xs font-bold block">Зона Комфорта (Центр)</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{activeProfile.positionNuances.comfortCenter}</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                          <span className="text-pink-400 text-xs font-bold block">Линия Любви</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{activeProfile.positionNuances.loveLine}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Core Conflict Synthesis Card */}
              {matrixMap && (
                <div className="bg-gradient-to-r from-purple-950/40 via-amber-950/20 to-black border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                      <Zap size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] text-amber-300 uppercase tracking-widest font-bold block">
                        Психологический Синтез Конфликтов
                      </span>
                      <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                        {matrixMap.coreConflictAnalysis.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {matrixMap.coreConflictAnalysis.description}
                  </p>

                  <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/30 flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-amber-200 font-medium leading-relaxed">
                      <strong>Ключ разрешения:</strong> {matrixMap.coreConflictAnalysis.resolutionKey}
                    </p>
                  </div>

                  <div className="text-xs text-slate-400 italic pt-2">
                    {matrixMap.overallResourceRecommendation}
                  </div>
                </div>
              )}

              {/* AI Deep Psychological Synthesis Trigger */}
              <div className="bg-[#0b1020]/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-serif text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-400" />
                      ИИ-Глубинный Психологический Отчет
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl">
                      Сгенерируйте персональный синтез всех 5 ключевых энергий вашей матрицы с детальным разбором теневых триггеров и алгоритмов роста.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateAiPsychologySynthesis}
                    disabled={isGeneratingAiReport}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isGeneratingAiReport ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Синтезирую...</span>
                      </>
                    ) : (
                      <>
                        <Brain size={16} />
                        <span>Сформировать отчет</span>
                      </>
                    )}
                  </button>
                </div>

                {aiPsychologyReport && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 sm:p-6 rounded-2xl bg-black/60 border border-white/10 space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line custom-scrollbar max-h-[500px] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-amber-400 font-serif font-bold text-xs uppercase tracking-wider">
                        Персональный Психологический Отчет
                      </span>
                      <button
                        onClick={() => {
                          if (playingId === 'ai_psychology_report') {
                            stopAudio();
                          } else {
                            playAudio(aiPsychologyReport, 'ai_psychology_report', 'Fenrir');
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30 transition-all cursor-pointer"
                      >
                        {playingId === 'ai_psychology_report' ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        <span>{playingId === 'ai_psychology_report' ? 'Остановить' : 'Озвучить'}</span>
                      </button>
                    </div>
                    {aiPsychologyReport}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE RESOURCE BALANCE TRACKER */}
      {activeTab === 'test' && (
        <div className="space-y-8">
          <div className="bg-[#0b1020]/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block">
                Диагностика Состояния в Реальном Времени
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Шкала Ресурса: Где вы сейчас — в Плюсе или в Минусе?
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                Отметьте на ползунках, как вы ощущаете себя в последние дни по каждому каналу. Система рассчитает ваш интегральный индекс ресурса и подскажет, какая энергия сейчас требует внимания.
              </p>
            </div>

            {/* Total Index Gauge */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/30 via-black to-amber-950/30 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-black/60 border-2 border-amber-500/40 shadow-inner">
                  <span className="text-2xl font-bold font-mono text-amber-300">{totalResourceIndex}%</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Текущий Баланс Матрицы</span>
                  <p className="text-base sm:text-lg font-serif font-bold text-white">
                    {totalResourceIndex >= 75 ? '🌟 Высокий Ресурс (Свет)' : totalResourceIndex >= 50 ? '⚖️ Баланс (Зона Роста)' : '⚠️ Слив Энергии (Тень)'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {totalResourceIndex >= 75
                      ? 'Ваши энергии раскрываются гармонично. Отличный момент для масштабирования.'
                      : totalResourceIndex >= 50
                      ? 'Есть просадки в кармических каналах. Требуется осознанная корректировка.'
                      : 'Включились программы тени. Рекомендуется отдых и практики заземления.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setBalanceScores({ day: 70, month: 80, year: 65, karmic: 45, comfort: 75 })}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/5 flex items-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw size={13} />
                <span>Сбросить тест</span>
              </button>
            </div>

            {/* Sliders List */}
            <div className="space-y-5 pt-2">
              {[
                { id: 'day', label: '1. Личность & Визитка (Точка А)', sub: 'Уверенность в себе, проявление в обществе, ясность мыслей' },
                { id: 'month', label: '2. Таланты & Вдохновение (Точка B)', sub: 'Связь с интуицией, творческий поток, вдохновение' },
                { id: 'year', label: '3. Финансы & Материализация (Точка C)', sub: 'Удовлетворенность доходом, отсутствие страха бедности, порядок в делах' },
                { id: 'karmic', label: '4. Кармический Урок (Точка D)', sub: 'Свобода от обид, отсутствие претензий к миру, спокойствие' },
                { id: 'comfort', label: '5. Зона Комфорта Души (Точка E)', sub: 'Внутренний покой, контакт с телом, качество сна и отдыха' },
              ].map((item) => {
                const val = balanceScores[item.id] || 50;
                return (
                  <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-serif font-bold text-white block">{item.label}</span>
                        <span className="text-xs text-slate-400">{item.sub}</span>
                      </div>
                      <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded-lg border ${
                        val >= 70 ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' :
                        val >= 45 ? 'bg-amber-950/60 text-amber-300 border-amber-500/30' :
                        'bg-rose-950/60 text-rose-300 border-rose-500/30'
                      }`}>
                        {val}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={val}
                        onChange={(e) => setBalanceScores({ ...balanceScores, [item.id]: parseInt(e.target.value) })}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span className="text-rose-400">Глубокий Минус (0%)</span>
                        <span className="text-amber-400">Баланс (50%)</span>
                        <span className="text-emerald-400">Чистый Плюс (100%)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETE 22 ARCANA ENCYCLOPEDIA */}
      {activeTab === 'encyclopedia' && (
        <div className="space-y-8">
          <div className="bg-[#0b1020]/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block">
                  Полный Справочник
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  Энциклопедия Всех 22 Старших Арканов
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Выберите любой аркан от 1 до 22 для мгновенного разбора его плюсов, минусов и алгоритма переключения.
                </p>
              </div>

              <div className="w-full md:w-64">
                <input
                  type="text"
                  placeholder="Поиск по имени, номеру..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Arcanas Grid Picker */}
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-11 gap-2">
              {filteredArcanas.map((item) => {
                const isSel = selectedEncyclopediaArcana === item.arcana;
                return (
                  <button
                    key={item.arcana}
                    onClick={() => setSelectedEncyclopediaArcana(item.arcana)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSel
                        ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-black font-bold border-amber-300 shadow-md shadow-amber-500/30'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">{item.arcana}</span>
                    <span className="text-[9px] truncate max-w-full font-serif opacity-80">{item.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Encyclopedia Arcana Details */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
                      {selectedEncyclopediaProfile.arcana} ({selectedEncyclopediaProfile.roman})
                    </span>
                    <span className="text-xs text-slate-400">{selectedEncyclopediaProfile.symbol}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                    {selectedEncyclopediaProfile.name}
                  </h3>
                  <p className="text-xs text-amber-300/90">
                    Архетип: {selectedEncyclopediaProfile.archetype} ({selectedEncyclopediaProfile.element})
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Девиз</span>
                  <span className="text-xs font-serif italic text-slate-200">
                    {selectedEncyclopediaProfile.motto}
                  </span>
                </div>
              </div>

              {/* Plus & Minus Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Plus */}
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {selectedEncyclopediaProfile.plusTraits.title}
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedEncyclopediaProfile.plusTraits.description}
                  </p>
                  <div className="space-y-2 pt-1 text-xs text-slate-300">
                    <p><strong>Мышление:</strong> {selectedEncyclopediaProfile.plusTraits.mindset}</p>
                    <p><strong>Деньги:</strong> {selectedEncyclopediaProfile.plusTraits.moneyAndCareer}</p>
                    <p><strong>Любовь:</strong> {selectedEncyclopediaProfile.plusTraits.loveAndRelationships}</p>
                  </div>
                </div>

                {/* Minus */}
                <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                  <span className="text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {selectedEncyclopediaProfile.minusTraits.title}
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedEncyclopediaProfile.minusTraits.description}
                  </p>
                  <div className="space-y-2 pt-1 text-xs text-slate-300">
                    <p><strong>Ловушки Эго:</strong> {selectedEncyclopediaProfile.minusTraits.egoTraps}</p>
                    <p><strong>Токсичность:</strong> {selectedEncyclopediaProfile.minusTraits.toxicPatterns}</p>
                    <p><strong>Блоки денег:</strong> {selectedEncyclopediaProfile.minusTraits.moneyBlockers}</p>
                  </div>
                </div>
              </div>

              {/* Transformation Keys */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Zap size={15} />
                  Ключи Перевода из Минуса в Плюс
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {selectedEncyclopediaProfile.transformationKeys.map((k, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300">
                      <span className="text-amber-400 font-bold font-mono text-[10px] block mb-1">Шаг {i + 1}</span>
                      {k}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
