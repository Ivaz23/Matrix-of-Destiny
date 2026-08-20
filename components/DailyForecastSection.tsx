import React, { useState, useEffect } from 'react';
import { DailyMysticalForecast, UserInput } from '../types';
import { generateDailyMysticalForecast, VOICE_OPTIONS } from '../services/geminiService';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';
import { getAstrologyData } from '../services/astrologyUtils';
import { calculateLifePathNumber, calculateMatrix } from '../services/numerologyUtils';
import { calculateBiorhythms } from '../services/biorhythmUtils';
import { exportDailyForecastPdf } from '../services/exportUtils';
import BiorhythmVisual from './BiorhythmVisual';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Calendar, 
  Compass, 
  Heart, 
  Briefcase, 
  AlertTriangle, 
  Quote, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Loader2, 
  ExternalLink, 
  Globe, 
  Check, 
  Copy, 
  Moon, 
  Sun,
  UserCheck,
  Download,
  FileText,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Zap,
  CheckCircle2,
  Radio,
  ArrowRight,
  HeartPulse,
  Activity,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Coins,
  Wallet,
  Pill,
  Scale
} from 'lucide-react';

interface DailyForecastSectionProps {
  initialUserInput?: UserInput | null;
  onSaveBirthDate?: (input: UserInput) => void;
}

const DailyForecastSection: React.FC<DailyForecastSectionProps> = ({ 
  initialUserInput, 
  onSaveBirthDate 
}) => {
  const getStoredInput = () => {
    try {
      const saved = localStorage.getItem('chubuk_user_input');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const stored = getStoredInput();

  // Helper for formatting local date to YYYY-MM-DD
  const getLocalDateString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State for user birthdate & name
  const [name, setName] = useState(initialUserInput?.name || stored?.name || '');
  const [birthDate, setBirthDate] = useState(initialUserInput?.birthDate || stored?.birthDate || '');
  const [targetDate, setTargetDate] = useState(getLocalDateString(0));
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].name);

  // Plain-language explainer toggle
  const [showPlainExplainer, setShowPlainExplainer] = useState(false);

  // Forecast state
  const [forecast, setForecast] = useState<DailyMysticalForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { playingId, loadingId, playAudio, stopAudio } = useGlobalAudio();

  // Keep in sync with initialUserInput when changed externally
  useEffect(() => {
    if (initialUserInput) {
      if (initialUserInput.birthDate && initialUserInput.birthDate !== birthDate) {
        setBirthDate(initialUserInput.birthDate);
      }
      if (initialUserInput.name && initialUserInput.name !== name) {
        setName(initialUserInput.name);
      }
    }
  }, [initialUserInput?.birthDate, initialUserInput?.name]);

  const loadForecast = async (forceFresh = false, overrideDate?: string, overrideBirth?: string) => {
    const activeBirth = overrideBirth || birthDate;
    const activeTarget = overrideDate || targetDate;
    if (!activeBirth) return;

    setIsLoading(true);
    setError(null);
    stopAudio();

    if (forceFresh) {
      const cacheKey = `daily_forecast:${activeBirth}:${activeTarget}`;
      localStorage.removeItem(cacheKey);
    }

    try {
      const result = await generateDailyMysticalForecast(activeBirth, name, activeTarget);
      setForecast(result);
      if (onSaveBirthDate && activeBirth) {
        onSaveBirthDate({
          name: name || 'Странник',
          birthDate: activeBirth,
          gender: initialUserInput?.gender || 'female'
        });
      }
    } catch (err: any) {
      console.error("Forecast generation error:", err);
      setError("Не удалось составить прогноз из-за помех в космическом эфире. Попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch if birthDate is already available
  useEffect(() => {
    if (birthDate) {
      loadForecast();
    }
  }, [birthDate, targetDate]);

  const effectiveBiorhythms = forecast?.biorhythms || (birthDate && targetDate ? calculateBiorhythms(birthDate, targetDate) : null);

  const handleCopyForecast = () => {
    if (!forecast) return;
    let text = `✨ Мистический прогноз на ${forecast.date} (${forecast.zodiacSign}, ЧЖП ${forecast.lifePathNumber}):\n\n` +
      `🌌 Транзиты планет: ${forecast.planetaryTransits}\n\n` +
      `🔮 Общая атмосфера: ${forecast.generalVibe}\n\n` +
      `⚡ Личное влияние: ${forecast.personalImpact}\n\n` +
      `💖 Любовь: ${forecast.loveAndRelations}\n\n` +
      `💼 Дела и карьера: ${forecast.careerAndMoney}\n\n`;

    if (effectiveBiorhythms) {
      text += `⚡ Персональные биоритмы дня (Интеграл: ${effectiveBiorhythms.averageScore >= 0 ? '+' : ''}${effectiveBiorhythms.averageScore}%):\n` +
        `• 🔴 Физический (23д): ${effectiveBiorhythms.physical.value}% [${effectiveBiorhythms.physical.phase === 'peak' ? 'Подъем' : effectiveBiorhythms.physical.phase === 'critical' ? 'Критический' : 'Спад'}]\n` +
        `• 💗 Эмоциональный (28д): ${effectiveBiorhythms.emotional.value}% [${effectiveBiorhythms.emotional.phase === 'peak' ? 'Подъем' : effectiveBiorhythms.emotional.phase === 'critical' ? 'Критический' : 'Спад'}]\n` +
        `• 🔵 Интеллектуальный (33д): ${effectiveBiorhythms.intellectual.value}% [${effectiveBiorhythms.intellectual.phase === 'peak' ? 'Подъем' : effectiveBiorhythms.intellectual.phase === 'critical' ? 'Критический' : 'Спад'}]\n` +
        `• 🟣 Интуитивный (38д): ${effectiveBiorhythms.intuitive.value}% [${effectiveBiorhythms.intuitive.phase === 'peak' ? 'Подъем' : effectiveBiorhythms.intuitive.phase === 'critical' ? 'Критический' : 'Спад'}]\n` +
        `Динамика: ${effectiveBiorhythms.summaryText}\n\n`;
    }

    if (forecast.healthAndVitality) {
      text += `🌿 Здоровье и тонус: Риск недомоганий ${forecast.healthAndVitality.diseaseRiskPercentage}%. ` +
        `Уязвимые зоны: ${forecast.healthAndVitality.vulnerableOrgansOrSystems.join(', ')}. ` +
        `Прогноз: ${forecast.healthAndVitality.vitalityForecast} ` +
        `Целебный совет: ${forecast.healthAndVitality.healingRemedy}\n\n`;
    }

    if (forecast.financialFlow) {
      text += `💰 Финансовый поток: Прибыль ${forecast.financialFlow.profitPotential}% / Риск убытков ${forecast.financialFlow.lossRisk}%. ` +
        `Где прибыль: ${forecast.financialFlow.profitOpportunities} ` +
        `Где риск убыли: ${forecast.financialFlow.lossDangers} ` +
        `Золотое правило денег: ${forecast.financialFlow.wealthActionAdvice}\n\n`;
    }

    text += `⚠️ Предостережение: ${forecast.warningOrCaution}\n\n` +
      `📜 Аффирмация: ${forecast.affirmation}\n\n` +
      `Портал Chubuk Matrix`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadFullForecast = () => {
    if (!forecast) return;
    let fullSpeech = `Мистический прогноз на ${forecast.date}. Для знака ${forecast.zodiacSign}, число жизненного пути ${forecast.lifePathNumber}. ` +
      `Астрологическая картина дня: ${forecast.planetaryTransits}. ` +
      `Космическая энергия дня: ${forecast.generalVibe}. ` +
      `Ваше личное влияние: ${forecast.personalImpact}. ` +
      `Сфера любви: ${forecast.loveAndRelations}. ` +
      `Дела и работа: ${forecast.careerAndMoney}. `;

    if (effectiveBiorhythms) {
      fullSpeech += `Персональные биоритмы дня: интегральный энергетический индекс составляет ${effectiveBiorhythms.averageScore >= 0 ? 'плюс ' : 'минус '}${Math.abs(effectiveBiorhythms.averageScore)} процентов. ` +
        `Физический цикл: ${effectiveBiorhythms.physical.value} процентов. ` +
        `Эмоциональный цикл: ${effectiveBiorhythms.emotional.value} процентов. ` +
        `Интеллектуальный тонус: ${effectiveBiorhythms.intellectual.value} процентов. ` +
        `Интуитивный потенциал: ${effectiveBiorhythms.intuitive.value} процентов. ` +
        `${effectiveBiorhythms.summaryText} `;
    }

    if (forecast.healthAndVitality) {
      fullSpeech += `Прогноз здоровья: Вероятность недомоганий составляет ${forecast.healthAndVitality.diseaseRiskPercentage} процентов. ` +
        `Уязвимые системы организма: ${forecast.healthAndVitality.vulnerableOrgansOrSystems.join(', ')}. ` +
        `${forecast.healthAndVitality.vitalityForecast} ` +
        `Рекомендация для тела: ${forecast.healthAndVitality.healingRemedy}. `;
    }

    if (forecast.financialFlow) {
      fullSpeech += `Финансовый вектор: Потенциал прибыли ${forecast.financialFlow.profitPotential} процентов, риск убыли ${forecast.financialFlow.lossRisk} процентов. ` +
        `Возможности прибыли: ${forecast.financialFlow.profitOpportunities}. ` +
        `Опасность убыли: ${forecast.financialFlow.lossDangers}. ` +
        `Совет для кошелька: ${forecast.financialFlow.wealthActionAdvice}. `;
    }

    fullSpeech += `Предостережение дня: ${forecast.warningOrCaution}. ` +
      `Сакральная аффирмация: ${forecast.affirmation}`;

    playAudio(fullSpeech, 'daily_full_forecast', selectedVoice);
  };

  const handleDownloadDailyPdf = async () => {
    if (!forecast) return;
    try {
      setIsExportingPdf(true);
      await exportDailyForecastPdf({
        userInput: {
          name: name || 'Странник',
          birthDate: birthDate,
          gender: initialUserInput?.gender || 'female'
        },
        forecast,
        astrology: astroData,
        matrix: matrix,
        filename: `Сакральный_Манускрипт_${(name || 'Странник').replace(/\s+/g, '_')}_${forecast.targetDate || 'прогноз'}`
      });
    } catch (e) {
      console.error("Daily forecast PDF export error:", e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const astroData = birthDate ? getAstrologyData(birthDate) : null;
  const lifePath = birthDate ? calculateLifePathNumber(birthDate) : null;
  const matrix = birthDate ? calculateMatrix(birthDate) : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Title & Introduction Banner */}
      <div className="card-3d rounded-3xl p-8 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border-amber-500/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="space-y-3 z-10">
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest">
              <Sparkles size={14} className="animate-spin text-amber-400" style={{ animationDuration: '4s' }} />
              <span>Search Grounding • Астро-Транзиты в реальном времени</span>
            </div>
            
            <button
              onClick={() => setShowPlainExplainer(!showPlainExplainer)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all text-xs font-bold shadow-sm"
              title="Нажмите, чтобы прочитать простое объяснение без сложных терминов"
            >
              <HelpCircle size={13} className="text-emerald-400" />
              <span>Кто не в теме? Объяснение простыми словами</span>
              {showPlainExplainer ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif text-amber-100 font-bold">
            Ежедневный Мистический Прогноз
          </h2>
          <p className="text-slate-300 text-sm max-w-xl font-light leading-relaxed">
            Персональный резонанс вашей Матрицы и Натальной карты с актуальным положением планет и фазой Луны на выбранный день.
          </p>
        </div>

        <div className="z-10 flex flex-col items-center sm:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-mono">Google Live Grounding</span>
          </div>
          <span className="text-[11px] text-slate-400">Синхронизация с эфемеридами</span>
        </div>
      </div>

      {/* ================= PLAIN LANGUAGE EXPLAINER (ДЛЯ ТЕХ, КТО НЕ В ТЕМЕ) ================= */}
      <AnimatePresence>
        {showPlainExplainer && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="card-3d rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-[#0a1214] to-black/80 space-y-6 shadow-2xl relative">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">Гид для новичков</span>
                    <h3 className="text-xl font-serif text-white font-bold">Что такое Search Grounding и Транзиты — простыми словами</h3>
                  </div>
                </div>

                <button
                  onClick={() => setShowPlainExplainer(false)}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-white/5 border border-white/10"
                >
                  Свернуть гид
                </button>
              </div>

              {/* 3 Main Pillars in simple analogies */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* 1. Search Grounding */}
                <div className="bg-black/50 border border-emerald-500/20 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <Globe size={16} className="text-emerald-400" />
                    <span>1. Search Grounding (Живой поиск)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Никаких выдумок:</strong> ИИ не берет шаблонный гороскоп «из головы». В момент вашего нажатия система обращается в реальный Google Search, чтобы узнать точные астрономические координаты планет и фазу Луны именно на сегодня.
                  </p>
                </div>

                {/* 2. Transit */}
                <div className="bg-black/50 border border-emerald-500/20 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <Compass size={16} className="text-amber-400" />
                    <span>2. Астро-Транзиты (Погода за окном)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Аналогия:</strong> Ваша дата рождения — это «паспорт вашей души» (фундамент). А планеты прямо сейчас — это «погода на улице». Транзит показывает, как сегодняшнее небо взаимодействует лично с вами (попутный ветер или дождь).
                  </p>
                </div>

                {/* 3. Real Life Application */}
                <div className="bg-black/50 border border-emerald-500/20 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                    <Zap size={16} className="text-teal-400" />
                    <span>3. Зачем это нужно на практике?</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Персональный компас:</strong> Вы точно знаете, когда лучше назначать важные встречи, запускать проекты или делать крупные покупки, а в какие дни лучше сберечь нервы и не спорить с близкими.
                  </p>
                </div>
              </div>

              {/* Jargon-free Mini Cheat Sheet */}
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Шпаргалка терминов без заумных слов:</span>
                </h4>
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="text-amber-300 font-bold mb-1">🌙 Фаза Луны</div>
                    <div className="text-slate-300 text-[11px]">
                      Уровень вашей батарейки. <em>Растущая</em> — энергия растет (старт дел). <em>Убывающая</em> — очищение и финал. <em>Полнолуние</em> — пик эмоций.
                    </div>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="text-amber-300 font-bold mb-1">⚡ Аспекты Планет</div>
                    <div className="text-slate-300 text-[11px]">
                      Космический светофор. <em>Гармоничные</em> — зеленый свет и удача без сопротивления. <em>Напряженные</em> — знак «внимание, не спешите».
                    </div>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="text-amber-300 font-bold mb-1">🔄 Ретроградность</div>
                    <div className="text-slate-300 text-[11px]">
                      Ревизия и работа над ошибками. Время не для резких стартов, а для перепроверки документов и завершения начатого.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date & Profile Input Bar */}
      <div className="card-3d rounded-3xl p-6 sm:p-7 border border-amber-500/20 bg-black/40 shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          <div>
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserCheck size={14} />
              <span>Ваше Имя</span>
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Странник"
              className="w-full input-3d rounded-xl px-4 py-2.5 text-sm text-amber-100 outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Дата вашего рождения *</span>
            </label>
            <input 
              type="date" 
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full input-3d rounded-xl px-4 py-2.5 text-sm text-amber-100 outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={14} />
                <span>Дата прогноза</span>
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => { const d = getLocalDateString(0); setTargetDate(d); loadForecast(false, d); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    targetDate === getLocalDateString(0)
                      ? 'bg-amber-500 text-black'
                      : 'bg-white/5 text-slate-400 hover:text-amber-300'
                  }`}
                >
                  Сегодня
                </button>
                <button
                  type="button"
                  onClick={() => { const d = getLocalDateString(1); setTargetDate(d); loadForecast(false, d); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    targetDate === getLocalDateString(1)
                      ? 'bg-amber-500 text-black'
                      : 'bg-white/5 text-slate-400 hover:text-amber-300'
                  }`}
                >
                  Завтра
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <input 
                type="date" 
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="flex-1 input-3d rounded-xl px-3 py-2.5 text-sm text-amber-100 outline-none focus:border-amber-500"
              />
              <button
                onClick={() => loadForecast(true)}
                disabled={isLoading || !birthDate}
                className="px-4 py-2.5 btn-3d rounded-xl font-bold uppercase text-xs tracking-wider flex items-center gap-2 disabled:opacity-50"
                title="Обновить прогноз с поиском в реальном времени"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                <span className="hidden sm:inline">{isLoading ? 'Поиск...' : 'Узнать'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* User Badges if birthdate set */}
        {birthDate && astroData && lifePath && matrix && (
          <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-400">Ваш профиль:</span>
            <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1.5">
              <span>Знак:</span>
              <span className="font-bold">{astroData.zodiacSign}</span>
              <span className="text-[10px] text-slate-400">({astroData.element})</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1.5">
              <span>Число Жизненного Пути:</span>
              <span className="font-bold text-amber-200">{lifePath}</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1.5">
              <span>Аркан Личности:</span>
              <span className="font-bold text-amber-200">{matrix.day}</span>
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/40 text-red-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400 shrink-0" size={20} />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => loadForecast(true)}
            className="px-4 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-black transition-all text-xs font-bold"
          >
            Повторить
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="card-3d rounded-3xl p-12 text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-amber-500/10 border-b-amber-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center text-amber-400">
              <Sparkles size={24} className="animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-serif text-amber-200 font-bold">Считывание космических транзитов...</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Google Search Grounding сканирует эфемериды, аспекты планет и фазу Луны на {targetDate}.
            </p>
          </div>
        </div>
      )}

      {/* Empty State when no birthdate */}
      {!birthDate && !isLoading && (
        <div className="card-3d rounded-3xl p-12 text-center space-y-4 border-dashed border-amber-500/30">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
            <Moon size={32} />
          </div>
          <h3 className="text-2xl font-serif text-amber-100 font-bold">Укажите дату рождения</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Чтобы раскрыть точный мистический прогноз дня с учетом вашего Знака Зодиака, Числа Пути и энергий Матрицы, выберите дату рождения в поле выше.
          </p>
        </div>
      )}

      {/* Display Forecast */}
      {forecast && !isLoading && (
        <div className="space-y-6">
          
          {/* Header Action Bar */}
          <div className="card-3d rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border-amber-500/20 bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold">
                {forecast.dayMatrixArcana || '✧'}
              </div>
              <div>
                <h4 className="text-base font-bold text-amber-100">Прогноз на {forecast.date}</h4>
                <p className="text-xs text-slate-400">
                  {forecast.zodiacSign} • Число Пути: {forecast.lifePathNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <select
                value={selectedVoice}
                onChange={(e) => { stopAudio(); setSelectedVoice(e.target.value); }}
                className="appearance-none bg-black/60 border border-amber-500/30 rounded-xl py-1.5 pl-3 pr-8 text-xs text-amber-200 focus:outline-none focus:border-amber-500 cursor-pointer hover:bg-black/80 transition-colors"
              >
                {VOICE_OPTIONS.map(v => (
                  <option key={v.name} value={v.name}>{v.label}</option>
                ))}
              </select>

              <button
                onClick={handleReadFullForecast}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  playingId === 'daily_full_forecast'
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-black'
                }`}
                title="Озвучить полный прогноз"
              >
                {loadingId === 'daily_full_forecast' ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : playingId === 'daily_full_forecast' ? (
                  <Pause size={14} />
                ) : (
                  <Play size={14} />
                )}
                <span>{playingId === 'daily_full_forecast' ? 'Пауза' : 'Слушать'}</span>
              </button>

              <button
                onClick={handleDownloadDailyPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black font-semibold text-xs transition-all shadow-sm"
                title="Скачать Сакральный Манускрипт Прогноза (PDF)"
              >
                {isExportingPdf ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <FileText size={14} />
                )}
                <span>PDF Прогноз</span>
              </button>

              <button
                onClick={handleCopyForecast}
                className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all"
                title="Скопировать прогноз"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Planetary Transits Card (Search Grounding Highlight) */}
          <div className="card-3d rounded-3xl p-7 relative overflow-hidden border border-amber-500/30 bg-gradient-to-br from-[#12162a] via-[#090b14] to-[#04060c] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-amber-400">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <Sun size={22} className="text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 block">Астрономические Данные • Google Search Grounding</span>
                  <h3 className="text-xl font-serif text-amber-100 font-bold">Планетарные Транзиты и Фаза Луны</h3>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Compass size={13} className="text-amber-400" />
                <span>Реальное небо на {forecast.date}</span>
              </div>
            </div>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-light pl-4 border-l-2 border-amber-500/40">
              {forecast.planetaryTransits}
            </p>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/15 flex items-start gap-2.5 text-xs text-slate-300">
              <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-amber-200">Перевод на простой язык:</strong> Эти планетарные аспекты показывают, какие космические энергии активны прямо сейчас. Они проецируются на блоки ниже (Любовь, Карьера, Предостережение), подсказывая вам лучшие моменты для действий.
              </div>
            </div>
          </div>

          {/* Two-Column Grid: General Vibe & Personal Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* General Vibe */}
            <div className="card-3d rounded-3xl p-6 border border-amber-500/20 bg-gradient-to-b from-[#111422] to-[#080a12] space-y-3">
              <div className="flex items-center gap-3 text-amber-300">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Globe size={18} />
                </div>
                <h4 className="font-serif text-lg font-bold text-amber-100">Космическая Атмосфера</h4>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                {forecast.generalVibe}
              </p>
            </div>

            {/* Personal Impact */}
            <div className="card-3d rounded-3xl p-6 border border-amber-500/20 bg-gradient-to-b from-[#111422] to-[#080a12] space-y-3">
              <div className="flex items-center gap-3 text-amber-300">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Sparkles size={18} />
                </div>
                <h4 className="font-serif text-lg font-bold text-amber-100">Персональное Влияние</h4>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                {forecast.personalImpact}
              </p>
            </div>

          </div>

          {/* Spheres: Love and Career */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Love & Relations */}
            <div className="card-3d rounded-3xl p-6 border border-rose-500/20 bg-gradient-to-b from-[#141224] to-[#080a12] space-y-3">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <Heart size={18} />
                </div>
                <h4 className="font-serif text-lg font-bold text-rose-200">Любовь и Отношения</h4>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                {forecast.loveAndRelations}
              </p>
            </div>

            {/* Career & Money */}
            <div className="card-3d rounded-3xl p-6 border border-amber-500/20 bg-gradient-to-b from-[#111822] to-[#080a12] space-y-3">
              <div className="flex items-center gap-3 text-amber-400">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Briefcase size={18} />
                </div>
                <h4 className="font-serif text-lg font-bold text-amber-200">Дела, Проекты и Решения</h4>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                {forecast.careerAndMoney}
              </p>
            </div>

          </div>

          {/* ================= BIORHYTHMS SECTION ================= */}
          {effectiveBiorhythms && (
            <BiorhythmVisual 
              biorhythms={effectiveBiorhythms} 
              targetDateStr={targetDate} 
            />
          )}

          {/* ================= HEALTH & ILLNESS RISK CARD ================= */}
          {forecast.healthAndVitality && (
            <div className="card-3d rounded-3xl p-7 border border-emerald-500/30 bg-gradient-to-br from-[#0c1917] via-[#091112] to-[#04090a] space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>

              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <HeartPulse size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">
                      Биоритмы и Астросоматика
                    </span>
                    <h3 className="text-xl font-serif text-emerald-100 font-bold">
                      Здоровье и Вероятность Недомоганий
                    </h3>
                  </div>
                </div>

                {/* Risk Level Badge */}
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${
                  forecast.healthAndVitality.diseaseRiskPercentage > 60
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    : forecast.healthAndVitality.diseaseRiskPercentage > 40
                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                    : forecast.healthAndVitality.diseaseRiskPercentage > 25
                    ? 'bg-lime-950/60 border-lime-500/40 text-lime-300'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                }`}>
                  <Activity size={14} className="animate-pulse" />
                  <span>
                    {forecast.healthAndVitality.diseaseRiskPercentage > 60
                      ? 'Высокий риск спада сил'
                      : forecast.healthAndVitality.diseaseRiskPercentage > 40
                      ? 'Повышенная уязвимость'
                      : forecast.healthAndVitality.diseaseRiskPercentage > 25
                      ? 'Умеренная нагрузка'
                      : 'Минимальный риск • Тонус на пике'}
                  </span>
                </div>
              </div>

              {/* Progress Gauges (Vitality vs Disease Risk) */}
              <div className="bg-black/50 border border-emerald-500/15 rounded-2xl p-4.5 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                    <span>Жизненный тонус: {100 - forecast.healthAndVitality.diseaseRiskPercentage}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-300 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
                    <span>Риск заболевания / недомогания: {forecast.healthAndVitality.diseaseRiskPercentage}%</span>
                  </div>
                </div>

                {/* Split Dual-Color Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-white/10">
                  <div 
                    className="h-full rounded-l-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-700 shadow-inner"
                    style={{ width: `${100 - forecast.healthAndVitality.diseaseRiskPercentage}%` }}
                    title={`Тонус: ${100 - forecast.healthAndVitality.diseaseRiskPercentage}%`}
                  ></div>
                  <div 
                    className="h-full rounded-r-full bg-gradient-to-r from-amber-500 to-rose-600 transition-all duration-700 shadow-inner"
                    style={{ width: `${forecast.healthAndVitality.diseaseRiskPercentage}%` }}
                    title={`Риск болезни: ${forecast.healthAndVitality.diseaseRiskPercentage}%`}
                  ></div>
                </div>
              </div>

              {/* Vulnerable Organs & Psychosomatics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vulnerable Zones */}
                <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                    <ShieldAlert size={14} className="text-emerald-400" />
                    <span>Уязвимые органы и зоны тела:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {forecast.healthAndVitality.vulnerableOrgansOrSystems.map((organ, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs font-medium"
                      >
                        ◈ {organ}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Psychosomatic Trigger */}
                <div className="bg-black/40 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <Zap size={14} className="text-amber-400" />
                    <span>Психосоматический триггер:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {forecast.healthAndVitality.psychosomaticTrigger}
                  </p>
                </div>
              </div>

              {/* Detailed Vitality Forecast */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Подробный прогноз иммунитета и самочувствия:
                </span>
                <p className="text-slate-200 text-sm leading-relaxed font-light pl-3 border-l-2 border-emerald-500/40">
                  {forecast.healthAndVitality.vitalityForecast}
                </p>
              </div>

              {/* Restorative Remedy Advice */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-[#0a1614] to-teal-950/40 border border-emerald-500/35 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                  <Pill size={16} />
                </div>
                <div className="space-y-1 text-xs">
                  <strong className="text-emerald-300 font-bold block">
                    🌿 Целебный совет и рецепт восстановления:
                  </strong>
                  <p className="text-slate-300 leading-relaxed font-light">
                    {forecast.healthAndVitality.healingRemedy}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= FINANCIAL FLOW: PROFIT VS LOSS CARD ================= */}
          {forecast.financialFlow && (
            <div className="card-3d rounded-3xl p-7 border border-amber-500/35 bg-gradient-to-br from-[#1c180e] via-[#100d08] to-[#080604] space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>

              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Coins size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
                      Денежные Потоки и Финансовые Риски
                    </span>
                    <h3 className="text-xl font-serif text-amber-100 font-bold">
                      Финансовый Поток: Прибыль vs Убыль
                    </h3>
                  </div>
                </div>

                {/* Flow Vector Badge */}
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${
                  forecast.financialFlow.flowVector === 'profit_favored'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : forecast.financialFlow.flowVector === 'caution_loss_risk'
                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                    : forecast.financialFlow.flowVector === 'high_risk'
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    : 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                }`}>
                  <Scale size={14} />
                  <span>
                    {forecast.financialFlow.flowVector === 'profit_favored'
                      ? '✦ Зеленый свет для прибыли и сделок'
                      : forecast.financialFlow.flowVector === 'caution_loss_risk'
                      ? '⚠️ Внимание: риск спонтанных трат'
                      : forecast.financialFlow.flowVector === 'high_risk'
                      ? '🚫 Высокий риск убытков • Режим паузы'
                      : '⚖️ Баланс доходов и расходов'}
                  </span>
                </div>
              </div>

              {/* Profit Potential vs Loss Risk Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Profit Potential */}
                <div className="bg-black/50 border border-emerald-500/25 rounded-2xl p-4.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                      <TrendingUp size={16} className="text-emerald-400" />
                      <span>Потенциал Прибыли</span>
                    </div>
                    <span className="text-xl font-bold font-serif text-emerald-400">
                      {forecast.financialFlow.profitPotential}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-emerald-500/20">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-700"
                      style={{ width: `${forecast.financialFlow.profitPotential}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Вероятность удачных сделок, притока денег и закрытия вопросов
                  </span>
                </div>

                {/* Loss Risk */}
                <div className="bg-black/50 border border-rose-500/25 rounded-2xl p-4.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                      <TrendingDown size={16} className="text-rose-400" />
                      <span>Риск Убыли и Трат</span>
                    </div>
                    <span className="text-xl font-bold font-serif text-rose-400">
                      {forecast.financialFlow.lossRisk}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-rose-500/20">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-700"
                      style={{ width: `${forecast.financialFlow.lossRisk}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Опасность скрытых трат, денежных утечек и невыгодных покупок
                  </span>
                </div>
              </div>

              {/* 2-Col Breakdown: Where Profit Is vs Where Loss Risk Hides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Where Profit Opens */}
                <div className="bg-gradient-to-b from-emerald-950/30 to-black/50 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Где возможна прибыль (Точки роста):</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {forecast.financialFlow.profitOpportunities}
                  </p>
                </div>

                {/* Where Loss Dangers Lie */}
                <div className="bg-gradient-to-b from-rose-950/30 to-black/50 border border-rose-500/20 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span>Где таится убыль (Денежные ловушки):</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {forecast.financialFlow.lossDangers}
                  </p>
                </div>
              </div>

              {/* Golden Wealth Advice */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-black/60 to-amber-500/15 border-2 border-amber-500/40 flex items-start gap-3 shadow-[0_4px_20px_rgba(245,158,11,0.15)]">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                  <Wallet size={16} />
                </div>
                <div className="space-y-1 text-xs">
                  <strong className="text-amber-200 font-bold uppercase tracking-wider block">
                    👑 Золотое правило для кошелька на день:
                  </strong>
                  <p className="text-slate-200 leading-relaxed font-light">
                    {forecast.financialFlow.wealthActionAdvice}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning / Caution */}
          <div className="card-3d rounded-3xl p-6 border border-amber-500/30 bg-amber-950/20 space-y-3">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40">
                <AlertTriangle size={18} />
              </div>
              <h4 className="font-serif text-lg font-bold text-amber-200">Предостережение Дня</h4>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed font-light">
              {forecast.warningOrCaution}
            </p>
          </div>

          {/* Sacred Affirmation */}
          <div className="card-3d rounded-3xl p-8 border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-black/60 to-amber-500/10 text-center relative overflow-hidden shadow-[0_10px_30px_rgba(251,191,36,0.15)]">
            <Quote className="mx-auto text-amber-500/30 mb-3" size={32} />
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block mb-2">
              Сакральная Аффирмация Дня
            </span>
            <p className="text-lg sm:text-xl font-serif italic text-amber-100 max-w-2xl mx-auto leading-relaxed">
              "{forecast.affirmation}"
            </p>
          </div>

          {/* Google Search Grounding Sources */}
          {forecast.sources && forecast.sources.length > 0 && (
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <Globe size={14} className="text-emerald-400" />
                <span>Источники Google Search Grounding:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {forecast.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-xs text-slate-300 hover:text-amber-200 border border-white/10 transition-colors"
                  >
                    <span className="max-w-[200px] truncate">{src.title}</span>
                    <ExternalLink size={12} className="text-slate-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default DailyForecastSection;
