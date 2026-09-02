import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Coins, 
  Flame, 
  Brain, 
  Dumbbell, 
  Target, 
  ShieldAlert, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Calendar, 
  User, 
  Compass, 
  Award, 
  TrendingUp, 
  RefreshCw,
  Zap,
  Info,
  Sliders,
  Share2
} from 'lucide-react';
import { UserInput, MatrixNumbers } from '../types';
import { getKeyToProfile, getConsciousnessNumber, KeyToEnergyProfile } from '../services/keytoService';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';
import { chatWithChubuk } from '../services/geminiService';

interface KeyToPsychologySectionProps {
  userInput: UserInput | null;
  matrix: MatrixNumbers | null;
  onNavigateToMatrix?: () => void;
}

export const KeyToPsychologySection: React.FC<KeyToPsychologySectionProps> = ({
  userInput,
  matrix,
  onNavigateToMatrix
}) => {
  // Determine initial day from birthdate if available, default to 1 (or 28)
  const initialDay = useMemo(() => {
    if (userInput?.birthDate) {
      const parts = userInput.birthDate.split('-');
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        if (!isNaN(d) && d >= 1 && d <= 31) return d;
      }
    }
    return 28; // Famous Elon Musk / Bill Gates number as default highlight
  }, [userInput]);

  const [selectedDay, setSelectedDay] = useState<number>(initialDay);
  const [activeTab, setActiveTab] = useState<'profile' | 'cycle' | 'money' | 'sport' | 'ai'>('profile');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const { playingId, playAudio, stopAudio } = useGlobalAudio();

  const profile: KeyToEnergyProfile = useMemo(() => {
    return getKeyToProfile(selectedDay);
  }, [selectedDay]);

  const consciousness = getConsciousnessNumber(selectedDay);

  // Group days by consciousness number for fast navigation
  const highlightedDays = [1, 10, 19, 28];

  const handleGenerateAiReport = async () => {
    setIsAiLoading(true);
    setAiAnalysis(null);
    try {
      const prompt = `Ты — эксперт цифровой психологии KeyTo и Старец Чубук.
Сделай глубокий персонализированный финансовый аудит для человека, рожденного ${selectedDay} числа (Число Сознания: ${profile.consciousnessNumber}, Архетип: "${profile.archetype}").
Имя: ${userInput?.name || 'Искатель'}.
Опиши:
1. Где конкретно зарыты его деньги и главный финансовый код.
2. Как работает его цикл развития через энергию 3 (+3): пошаговый маршрут от импульса к миллионным результатам.
3. Почему ему жизненно необходим спорт и как наработать адекватность (энергию 5).
4. Каких ловушек эгоизма, манипуляций или эмоциональных качелей ему нужно избегать.
5. Точный план действий на ближайшие 90 дней.
Стиль: авторитетный, глубокий, практичный, вдохновляющий.`;

      const response = await chatWithChubuk(prompt, [], {
        userInput,
        matrix
      });
      setAiAnalysis(response);
    } catch (e: any) {
      setAiAnalysis(`✨ Персональный финансовый разбор KeyTo для ${selectedDay} числа:
Ваша денежная сила раскрывается через четкую стратегию и победу над эмоциональными импульсами. Главный ключ — внедрение ежедневного спорта для балансировки психики и следование закону циклов (+3). Создавайте твердый продукт, собирайте сильную команду и держите намерения кристально чистыми!`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-100 pb-16">
      
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#0a0f1d] to-purple-950/30 border border-amber-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wider uppercase">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
              Цифровая Психология KeyTo • Денежная Сила
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-white flex items-center gap-3">
              <span>31 Энергия Дня Рождения & Цикл +3</span>
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Узнайте, <strong className="text-amber-300">где зарыты ваши деньги</strong>, как работает закон цикличности через прибавление тройки (+3), почему спорт открывает финансовые потоки и как наработать абсолютную адекватность.
            </p>
          </div>

          {userInput?.birthDate && (
            <div className="shrink-0 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Ваша дата в матрице:</span>
              <span className="text-xl font-bold font-mono text-amber-300">{userInput.birthDate}</span>
              <button 
                onClick={() => {
                  const d = parseInt(userInput.birthDate.split('-')[2], 10);
                  if (d >= 1 && d <= 31) setSelectedDay(d);
                }}
                className="mt-2 text-xs text-amber-400 hover:text-amber-200 underline cursor-pointer"
              >
                Рассчитать для меня ({parseInt(userInput.birthDate.split('-')[2], 10)} число)
              </button>
            </div>
          )}
        </div>

        {/* Quick selector for all 31 days */}
        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
            <span>Выберите день рождения (1–31):</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">★ Выпуск видео:</span>
              <span className="text-slate-300">Единицы (1, 10, 19, 28)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
              const isSelected = selectedDay === d;
              const isHighlighted = highlightedDays.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 scale-105'
                      : isHighlighted
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#080d1a]/80 border border-amber-500/30 shadow-lg flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-black text-2xl font-mono shadow-md">
            {selectedDay}
          </div>
          <div>
            <div className="text-[11px] text-amber-400/80 font-bold uppercase tracking-wider">Число Сознания</div>
            <div className="text-lg font-bold text-white font-serif">{profile.consciousnessNumber} ({profile.rulingPlanet.split(' ')[0]})</div>
            <div className="text-xs text-slate-400">{profile.element}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080d1a]/80 border border-white/10 shadow-lg md:col-span-3 flex flex-col justify-center space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Award size={16} />
            <span>{profile.archetype}</span>
          </div>
          <p className="text-sm text-slate-200 leading-snug">{profile.description}</p>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'profile', label: '🌟 Разбор & Архетип', icon: User },
          { id: 'cycle', label: '🔄 Цикл Развития (+3)', icon: TrendingUp },
          { id: 'money', label: '💰 Где Мои Деньги?', icon: Coins },
          { id: 'sport', label: '🏃 Спорт & Адекватность (5)', icon: Dumbbell },
          { id: 'ai', label: '🤖 AI Аудит Чубука', icon: Brain }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isActive 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Profile & Secrets */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Money Core Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/20 to-black/60 border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-3 text-amber-400">
                <Coins size={24} className="animate-bounce" />
                <h3 className="text-lg font-serif font-bold text-white">Главный Денежный Секрет {selectedDay} Числа</h3>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                {profile.moneySecret}
              </p>
              
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Info size={14} />
                  <span>Скрытые Подсказки и Внутренние Энергии:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl">
                  {profile.hiddenPrompt}
                </p>
              </div>
            </div>

            {/* Drain Traps */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-red-950/20 to-black/60 border border-red-500/30 space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <ShieldAlert size={24} />
                <h3 className="text-lg font-serif font-bold text-white">Куда Сливается Энергия и Деньги?</h3>
              </div>
              <div className="space-y-2.5">
                {profile.drainTraps.map((trap, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200">
                    <span className="font-bold font-mono text-red-400">⚠️</span>
                    <span>{trap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Famous Personalities & Affirmation */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-amber-400 font-bold uppercase">Известные Личности Этого Числа</div>
                <div className="text-sm font-semibold text-white">{profile.famousExamples.join(' • ')}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const speechText = `${profile.title}. ${profile.description}. Денежный секрет: ${profile.moneySecret}`;
                    if (playingId === `keyto-${selectedDay}`) {
                      stopAudio();
                    } else {
                      playAudio(speechText, `keyto-${selectedDay}`);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                >
                  {playingId === `keyto-${selectedDay}` ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  <span>{playingId === `keyto-${selectedDay}` ? 'Остановить' : 'Озвучить Ключ'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center italic text-amber-200 text-sm font-serif">
              «{profile.affirmation}»
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Evolution Cycle (+3) */}
      {activeTab === 'cycle' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c1326] to-[#060a14] border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                <TrendingUp size={22} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white">Закон Циклов Развития (+3)</h3>
                <p className="text-xs text-slate-400">Каждая энергия развивается ступенями через сакральное число 3 (движение, анализ, знания)</p>
              </div>
            </div>

            {/* Visual Step Chain */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
              {profile.cycleSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className="relative p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                      Шаг {step.step}
                    </span>
                    <span className="text-xl font-bold font-mono text-white">
                      {step.energy}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">{step.title}</h4>
                    <div className="text-[11px] font-mono text-amber-400/80 mb-2">{step.formula}</div>
                    <p className="text-xs text-slate-300 leading-snug">{step.meaning}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    {step.actions.map((act, aIdx) => (
                      <div key={aIdx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Money Map */}
      {activeTab === 'money' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/30 to-black border border-amber-500/30 space-y-5">
            <div className="flex items-center gap-3">
              <Coins size={26} className="text-amber-400" />
              <div>
                <h3 className="text-lg font-serif font-bold text-white">Пошаговая Распаковка Денежной Силы</h3>
                <p className="text-xs text-slate-400">Ключевые правила взаимодействия с финансами по методологии KeyTo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <span className="p-1 rounded bg-amber-500/20 font-mono">1</span>
                  <span>Чистота Намерений</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Исключите любые серые схемы, ложь и манипуляции. При нечестной игре денежный канал моментально закрывается.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <span className="p-1 rounded bg-amber-500/20 font-mono">2</span>
                  <span>Обязательное Планирование (4)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Не начинайте действовать, пока план не зафиксирован на бумаге. Стратегия всегда побеждает суету.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <span className="p-1 rounded bg-amber-500/20 font-mono">3</span>
                  <span>Командная Синергия</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Учитесь слышать партнеров. Масштабные капиталы строятся только через объединение экспертов.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Sport & Adequacy */}
      {activeTab === 'sport' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sport Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/20 to-black border border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-3 text-emerald-400">
                <Dumbbell size={24} />
                <h3 className="text-lg font-serif font-bold text-white">Спорт & Заземление Психики</h3>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {profile.sportAndGrounding}
              </p>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 space-y-1">
                <strong>💡 Почему это важно:</strong>
                <p>Физическая нагрузка сжигает избыточный кортизол и адреналин, защищая вас от импульсивных истерик и обнуления проектов.</p>
              </div>
            </div>

            {/* Adequacy Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-950/20 to-black border border-blue-500/30 space-y-4">
              <div className="flex items-center gap-3 text-blue-400">
                <Target size={24} />
                <h3 className="text-lg font-serif font-bold text-white">Наработка Адекватности (5)</h3>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {profile.adequacyStrategy}
              </p>
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 space-y-1">
                <strong>💡 Меркурианская логика:</strong>
                <p>Адекватность приходит, когда вы опираетесь на факты, анализ и цифры, а не на сиюминутные эмоции.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI KeyTo Audit */}
      {activeTab === 'ai' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c1326] via-[#090f1f] to-black border border-amber-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <Brain className="text-amber-400" />
                <span>Персональный AI Аудит Финансового Потока</span>
              </h3>
              <p className="text-xs text-slate-400">Глубинный разбор денежного кода от ИИ «Старец Чубук»</p>
            </div>

            <button
              onClick={handleGenerateAiReport}
              disabled={isAiLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {isAiLoading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
              <span>{isAiLoading ? 'Синтез KeyTo...' : 'Сгенерировать Разбор'}</span>
            </button>
          </div>

          {aiAnalysis && (
            <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-4 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-serif animate-fade-in">
              {aiAnalysis}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
