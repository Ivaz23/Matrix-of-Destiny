import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Calendar, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  ShieldAlert, 
  Compass, 
  ChevronRight,
  Flame,
  Sun,
  Moon,
  Zap,
  Info,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { MatrixNumbers, UserInput } from '../types';
import { reduceArcana } from '../services/numerologyUtils';
import { calculateLunarData } from '../services/lunarUtils';
import { getSpeech, decodeAudioData } from '../services/geminiService';

interface DailyArcanaWidgetProps {
  matrix?: MatrixNumbers | null;
  userInput?: UserInput | null;
  onOpenFullForecast?: () => void;
  onAskNumerologist?: (question: string) => void;
  onTriggerHaptic?: (ms?: number) => void;
}

const ARCANA_DATA: Record<number, { title: string; archetype: string; element: string; color: string; advice: string; trap: string }> = {
  1: { title: 'Маг', archetype: 'Первопроходец и Творец', element: 'Воздух', color: 'from-amber-400 to-yellow-600', advice: 'Запускайте новые идеи, берите инициативу и материализуйте мысли в реальные действия.', trap: 'Гордыня и манипулирование окружающими.' },
  2: { title: 'Жрица', archetype: 'Интуиция и Тайна', element: 'Вода', color: 'from-cyan-400 to-blue-600', advice: 'Слушайте внутренний голос, доверяйте знакам и сохраняйте внутреннее спокойствие.', trap: 'Сплетни, пассивность и мнительность.' },
  3: { title: 'Императрица', archetype: 'Плодородие и Изобилие', element: 'Земля', color: 'from-emerald-400 to-teal-600', advice: 'Занимайтесь уютом, красотой, инвестициями и заботой о себе и близких.', trap: 'Гиперконтроль и материальная зацикленность.' },
  4: { title: 'Император', archetype: 'Структура и Власть', element: 'Огонь', color: 'from-red-500 to-amber-700', advice: 'Наведите порядок в делах, структурируйте бюджет и принимайте твердые решения.', trap: 'Тирания, упрямство и давление на людей.' },
  5: { title: 'Иерофант', archetype: 'Мудрость и Традиции', element: 'Земля', color: 'from-indigo-400 to-purple-600', advice: 'Учитесь новому, делитесь знаниями, соблюдайте законы и договоренности.', trap: 'Догматизм, поучения и осуждение чужих взглядов.' },
  6: { title: 'Влюбленные', archetype: 'Выбор и Сердечность', element: 'Воздух', color: 'from-rose-400 to-pink-600', advice: 'Делайте выбор сердцем, укрепляйте отношения и окружите себя гармонией.', trap: 'Идеализация, сомнения и зависимость от одобрения.' },
  7: { title: 'Колесница', archetype: 'Движение и Триумф', element: 'Огонь', color: 'from-amber-500 to-orange-600', advice: 'Ставьте четкие цели, будьте за рулем своей жизни и двигайтесь только вперед.', trap: 'Агрессия, воинственность и распыление сил.' },
  8: { title: 'Справедливость', archetype: 'Баланс и Карма', element: 'Воздух', color: 'from-blue-400 to-indigo-600', advice: 'Осознавайте причинно-следственные связи, будьте честны и держите баланс.', trap: 'Осуждение, обиды на несправедливость судьбы.' },
  9: { title: 'Отшельник', archetype: 'Глубина и Мудрость', element: 'Земля', color: 'from-violet-400 to-purple-700', advice: 'Уделите время самоанализу, глубоким размышлениям и берегите личные границы.', trap: 'Уход в глухую изоляцию и страх перед социумом.' },
  10: { title: 'Колесо Фортуны', archetype: 'Поток и Удача', element: 'Вода', color: 'from-amber-300 to-yellow-500', advice: 'Доверьтесь жизненному потоку, ловите счастливые синхроничности и знаки.', trap: 'Лень, апатия и слепое упование на авось.' },
  11: { title: 'Сила', archetype: 'Энергия и Потенциал', element: 'Огонь', color: 'from-orange-400 to-red-600', advice: 'Проявляйте мягкую уверенность, направляйте силу на спорт и крупные проекты.', trap: 'Агрессия, выгорание и физическое перенапряжение.' },
  12: { title: 'Повешенный', archetype: 'Служение и Новый Взгляд', element: 'Вода', color: 'from-teal-400 to-cyan-600', advice: 'Взгляните на привычные вещи под другим углом и бескорыстно помогите другим.', trap: 'Жертвенность, обиды и неумение говорить «нет».' },
  13: { title: 'Трансформация', archetype: 'Обновление и Перерождение', element: 'Вода', color: 'from-slate-400 to-indigo-900', advice: 'Смело отпускайте старое и отжившее, освобождая место для новых чудес.', trap: 'Цепляние за прошлое и страх перемен.' },
  14: { title: 'Умеренность', archetype: 'Гармония и Баланс', element: 'Вода', color: 'from-emerald-300 to-cyan-600', advice: 'Соблюдайте золотую середину во всем: эмоциях, тратах, питании и работе.', trap: 'Впадение в крайности и нетерпеливость.' },
  15: { title: 'Дьявол', archetype: 'Харизма и Теневая Сила', element: 'Огонь', color: 'from-rose-600 to-purple-900', advice: 'Управляйте ресурсами, видьте людей насквозь и трансформируйте искушения в рост.', trap: 'Манипуляции, зависимости и жажда легкой наживы.' },
  16: { title: 'Башня', archetype: 'Прорыв и Прозрение', element: 'Огонь', color: 'from-red-600 to-amber-700', advice: 'Разрушайте иллюзии, освобождайтесь от сковывающих рамок и стройте заново.', trap: 'Агрессивные конфликты и разрушительный гнев.' },
  17: { title: 'Звезда', archetype: 'Вдохновение и Талант', element: 'Воздух', color: 'from-cyan-300 to-indigo-500', advice: 'Проявляйте свое творчество, верьте в свою мечту и вдохновляйте окружающих.', trap: 'Гордыня, оторванность от реальности и лень.' },
  18: { title: 'Луна', archetype: 'Подсознание и Образы', element: 'Вода', color: 'from-purple-300 to-indigo-800', advice: 'Работайте со снами и визуализацией, материализуйте позитивные образы.', trap: 'Страхи, сомнения, иллюзии и мнительность.' },
  19: { title: 'Солнце', archetype: 'Радость и Лидерство', element: 'Огонь', color: 'from-amber-400 to-orange-500', advice: 'Светите людям, радуйтесь мелочам, делитесь теплом и проявляйте щедрость.', trap: 'Эгоизм, агрессивное давление и недовольство.' },
  20: { title: 'Страшный Суд', archetype: 'Пробуждение и Род', element: 'Огонь', color: 'from-indigo-400 to-blue-700', advice: 'Укрепляйте родовые связи, прощайте старые обиды и пробуждайте истинную суть.', trap: 'Осуждение близких и родовые претензии.' },
  21: { title: 'Мир', archetype: 'Глобальность и Свобода', element: 'Земля', color: 'from-blue-300 to-emerald-500', advice: 'Мыслите глобально, открывайтесь миру и выходите за привычные границы.', trap: 'Враждебность к иному и ограниченность мышления.' },
  22: { title: 'Высшая Свобода', archetype: 'Легкость и Доверие', element: 'Воздух', color: 'from-sky-300 to-purple-400', advice: 'Относитесь к жизни легко, будьте спонтанны, открыты новому и не привязывайтесь.', trap: 'Безответственность, инфантилизм и хаос.' }
};

export const DailyArcanaWidget: React.FC<DailyArcanaWidgetProps> = ({
  matrix,
  userInput,
  onOpenFullForecast,
  onAskNumerologist,
  onTriggerHaptic
}) => {
  const [activeMode, setActiveMode] = useState<'resonance' | 'general' | 'advice'>('resonance');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Ask Numerologist Chat Quick Action Handler
  const handleAskAboutDay = () => {
    onTriggerHaptic?.(12);
    const question = 'Что означает мой аркан дня для моих текущих дел?';
    if (onAskNumerologist) {
      onAskNumerologist(question);
    } else {
      window.dispatchEvent(new CustomEvent('chubuk:ask-numerologist', { detail: { question } }));
    }
  };

  // Compute Current Date Info
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Universal Day Arcana (1-22)
  const dayArcanaNum = reduceArcana(day + month + year);
  const dayArcana = ARCANA_DATA[dayArcanaNum] || ARCANA_DATA[10];

  // Lunar data
  const lunar = calculateLunarData(now);

  // Personal Resonance with User's Matrix
  const userPortrait = matrix?.day || (userInput?.birthDate ? reduceArcana(new Date(userInput.birthDate).getDate()) : null);
  const userComfort = matrix?.center || null;
  const userKarma = matrix?.bottom || null;

  // Personal Day Resonance Number: combine Universal Day + User's Day energy
  const personalResonanceNum = userPortrait ? reduceArcana(dayArcanaNum + userPortrait) : dayArcanaNum;
  const personalArcana = ARCANA_DATA[personalResonanceNum] || dayArcana;

  const formattedDate = now.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
  });

  // Synthesize Personalized Insight
  const getPersonalInsight = () => {
    if (!matrix || !userInput) {
      return {
        title: `Энергия дня: ${dayArcana.title} (${dayArcanaNum} Аркан)`,
        subtitle: `Архетип: ${dayArcana.archetype}`,
        text: `Сегодня пространство вибрирует на частоте ${dayArcanaNum}-го аркана. ${dayArcana.advice}`,
        focus: dayArcana.advice,
        trap: dayArcana.trap
      };
    }

    const userName = userInput.name ? userInput.name.split(' ')[0] : 'Искатель';
    let resonanceType = 'Гармоничный резонанс';
    if (dayArcanaNum === userPortrait) resonanceType = 'День Силы (Полное совпадение с Арканом Личности)';
    else if (dayArcanaNum === userComfort) resonanceType = 'День Душевного Спокойствия (Связь с Зоной Комфорта)';
    else if (dayArcanaNum === userKarma) resonanceType = 'Кармическая Проверка (Активация нижнего урока)';

    return {
      title: `${userName}, ваш личный код дня — ${personalResonanceNum} (${personalArcana.title})`,
      subtitle: `${resonanceType} • ${dayArcanaNum} + ${userPortrait} = ${personalResonanceNum}`,
      text: `Вселенский поток ${dayArcanaNum}-го Аркана (${dayArcana.title}) соединяется с вашей личной энергией ${userPortrait}-го Аркана, формируя персональный вектор ${personalResonanceNum} (${personalArcana.title}).`,
      focus: personalArcana.advice,
      trap: personalArcana.trap
    };
  };

  const insight = getPersonalInsight();

  const handleToggleAudio = async () => {
    onTriggerHaptic?.(15);
    if (isPlayingAudio) {
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch {}
      }
      setIsPlayingAudio(false);
      return;
    }

    setIsAudioLoading(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const speechText = `Приветствую! Сегодня ${formattedDate}. Вселенский аркан дня — ${dayArcanaNum}, ${dayArcana.title}. ${insight.text} Главный совет для вас: ${insight.focus} Остерегайтесь: ${insight.trap}`;
      const base64 = await getSpeech(speechText, 'Kore');
      const buffer = await decodeAudioData(base64, ctx);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlayingAudio(false);
      source.start();

      sourceRef.current = source;
      setIsPlayingAudio(true);
    } catch (e) {
      console.error("Audio widget playback error:", e);
      setIsPlayingAudio(false);
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#090e1f]/95 via-[#0c1328]/95 to-[#080c18]/95 border border-amber-500/30 shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-xl p-5 md:p-6 transition-all duration-300">
      
      {/* Mystical Background Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
            <Sun size={17} className="animate-[spin_20s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold text-white tracking-wide">
                Аркан Дня & Сакральный Резонанс
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                {dayArcanaNum} АРКАН
              </span>
            </div>
            <p className="text-[11px] text-slate-400 capitalize font-sans">
              {formattedDate} • {lunar.lunarDay} л.д. ({lunar.zodiacSign})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Access to Numerologist Chat */}
          <button
            type="button"
            onClick={handleAskAboutDay}
            className="px-2.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 hover:from-amber-500/35 hover:to-amber-500/35 border border-amber-400/50 text-amber-200 text-xs font-serif font-bold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-amber-500/20 cursor-pointer group"
            title="Спросить Чубука: Что означает мой аркан дня для моих текущих дел?"
          >
            <MessageSquare size={14} className="text-amber-300 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Спросить о делах</span>
            <span className="sm:hidden">О делах</span>
          </button>

          <button
            type="button"
            onClick={handleToggleAudio}
            disabled={isAudioLoading}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isPlayingAudio
                ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30'
                : 'bg-white/5 border-white/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/40'
            }`}
            title="Озвучить сакральный совет дня"
          >
            {isAudioLoading ? (
              <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            ) : isPlayingAudio ? (
              <VolumeX size={15} />
            ) : (
              <Volume2 size={15} />
            )}
            <span className="hidden sm:inline text-[11px]">
              {isPlayingAudio ? 'Стоп' : 'Голос'}
            </span>
          </button>

          {onOpenFullForecast && (
            <button
              type="button"
              onClick={() => {
                onTriggerHaptic?.(10);
                onOpenFullForecast();
              }}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-serif font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer group"
            >
              <span>Прогноз</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid md:grid-cols-12 gap-4 items-center">
        
        {/* Left: Dual Arcana Sacred Badges */}
        <div className="md:col-span-4 flex items-center justify-center gap-3 bg-black/30 p-3.5 rounded-2xl border border-white/5">
          {/* Universal Arcana */}
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Космос</span>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${dayArcana.color} p-0.5 shadow-lg relative group cursor-pointer`}>
              <div className="w-full h-full rounded-2xl bg-[#080d19]/90 flex flex-col items-center justify-center p-1">
                <span className="text-lg font-serif font-black text-white">{dayArcanaNum}</span>
                <span className="text-[9px] font-serif text-amber-200 truncate max-w-[50px] leading-tight">{dayArcana.title}</span>
              </div>
            </div>
            <span className="text-[10px] text-amber-300/80 mt-1 font-mono font-medium">Общий</span>
          </div>

          <div className="text-amber-500/50 font-serif text-lg font-bold">⚡</div>

          {/* User Personal Resonance Arcana */}
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-bold text-amber-400 mb-1">Вы в Матрице</span>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${personalArcana.color} p-0.5 shadow-lg shadow-amber-500/20 relative group cursor-pointer ring-2 ring-amber-500/40`}>
              <div className="w-full h-full rounded-2xl bg-[#080d19]/90 flex flex-col items-center justify-center p-1">
                <span className="text-lg font-serif font-black text-amber-300">{personalResonanceNum}</span>
                <span className="text-[9px] font-serif text-amber-200 truncate max-w-[50px] leading-tight">{personalArcana.title}</span>
              </div>
            </div>
            <span className="text-[10px] text-amber-400 mt-1 font-mono font-bold">Резонанс</span>
          </div>
        </div>

        {/* Right: Insight & Guidance Panel */}
        <div className="md:col-span-8 space-y-2.5">
          
          {/* Mode Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5 w-full sm:w-fit">
            <button
              type="button"
              onClick={() => { onTriggerHaptic?.(5); setActiveMode('resonance'); }}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                activeMode === 'resonance'
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Персональный Резонанс
            </button>
            <button
              type="button"
              onClick={() => { onTriggerHaptic?.(5); setActiveMode('advice'); }}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                activeMode === 'advice'
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Совет & Практика
            </button>
            <button
              type="button"
              onClick={() => { onTriggerHaptic?.(5); setActiveMode('general'); }}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                activeMode === 'general'
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Энергия Дня
            </button>
          </div>

          {/* Content Switching */}
          <AnimatePresence mode="wait">
            {activeMode === 'resonance' ? (
              <motion.div
                key="resonance"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-1.5"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{insight.title}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {insight.text}
                </p>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-100 flex items-start gap-2">
                  <Zap size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Ключ дня: </span>
                    <span>{insight.focus}</span>
                  </div>
                </div>
              </motion.div>
            ) : activeMode === 'advice' ? (
              <motion.div
                key="advice"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-2"
              >
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-300">Делайте сегодня (в плюс): </span>
                    <span>{personalArcana.advice}</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2">
                  <ShieldAlert size={15} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-300">Ловушка дня (в минус): </span>
                    <span>{personalArcana.trap}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-1.5"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sun size={14} className="text-amber-400" />
                  <span>{dayArcanaNum} Аркан — {dayArcana.title} ({dayArcana.archetype})</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Стихия: <span className="text-amber-300 font-medium">{dayArcana.element}</span>. {dayArcana.advice}
                </p>
                <p className="text-[11px] text-slate-400">
                  🌙 Луна в знаке <span className="text-slate-200 font-medium">{lunar.zodiacSign}</span>, {lunar.lunarDay}-й лунный день. {lunar.isVoidOfCourse ? '⚠️ Луна без курса — важные контракты лучше перенести.' : 'Благоприятный лунный фон для текущих задач.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
