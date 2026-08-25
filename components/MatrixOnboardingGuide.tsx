import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  X, 
  BookOpen, 
  Flame, 
  Coins, 
  ShieldAlert, 
  Crown, 
  Layers, 
  Lightbulb, 
  Volume2
} from 'lucide-react';
import { MatrixNumbers, UserInput } from '../types';

interface MatrixOnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  matrix: MatrixNumbers | null;
  userInput: UserInput | null;
  onSelectPoint?: (position: 'center' | 'month' | 'day' | 'year' | 'bottom') => void;
}

interface StepData {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  userValueKey?: keyof MatrixNumbers;
  positionId?: 'center' | 'month' | 'day' | 'year' | 'bottom';
  description: string;
  howToRead: string;
  positiveTip: string;
  shadowWarning: string;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    glow: string;
  };
}

export const MatrixOnboardingGuide: React.FC<MatrixOnboardingGuideProps> = ({
  isOpen,
  onClose,
  matrix,
  userInput,
  onSelectPoint
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps: StepData[] = [
    {
      id: 'intro',
      title: 'Что такое Матрица Судьбы?',
      subtitle: '22 Высших Аркана и Сакральная Геометрия Души',
      badge: 'Введение',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <Compass className="w-6 h-6 text-amber-400" />,
      description: 'Матрица Судьбы — это древняя сакральная система самопознания на стыке нумерологии, 22 старших арканов Таро и кармической астрологии. Она рассчитывается строго по вашей дате рождения и формирует восьмиконечную звезду (октаграмму).',
      howToRead: 'Каждая точка матрицы — это конкретный Аркан (число от 1 до 22), который отвечает за определенную сферу вашей жизни: таланты, финансы, отношения, карму и предназначение.',
      positiveTip: 'Любая энергия матрицы может проживаться в «Плюсе» (созидание, гармония, изобилие) или в «Минусе» (блоки, страхи, деструктив).',
      shadowWarning: 'Ваша главная задача — осознать свои энергии и шаг за шагом вывести их в плюсовое состояние.',
      colorTheme: {
        bg: 'from-amber-950/40 via-[#0a0f1d] to-[#060a14]',
        border: 'border-amber-500/30',
        text: 'text-amber-300',
        glow: 'rgba(245, 158, 11, 0.2)'
      }
    },
    {
      id: 'center',
      title: 'Центр Матрицы: Зона Комфорта & Душа',
      subtitle: 'Ваше истинное «Я» и точка энергетического баланса',
      badge: 'Центральная Точка E',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      icon: <Crown className="w-6 h-6 text-yellow-400" />,
      userValueKey: 'center',
      positionId: 'center',
      description: 'Центральный аркан — это сердцевина вашей матрицы. Он определяет характер, внутреннее состояние счастья, то, где ваша душа черпает силы и в каких условиях вы чувствуете себя максимально гармонично.',
      howToRead: 'Когда вам тяжело или нет энергии — вернитесь к проявлениям этого аркана. Он моментально восстанавливает ресурс.',
      positiveTip: 'В плюсе: состояние наполненности, уверенности, интуитивное понимание своего пути.',
      shadowWarning: 'В минусе: опустошенность, потеря ориентиров, хроническая усталость, внутренний конфликт.',
      colorTheme: {
        bg: 'from-yellow-950/40 via-[#0a0f1d] to-[#060a14]',
        border: 'border-yellow-500/40',
        text: 'text-yellow-300',
        glow: 'rgba(234, 179, 8, 0.25)'
      }
    },
    {
      id: 'top',
      title: 'Верхняя Вершина: Канал Духовности & Таланты',
      subtitle: 'Связь с Высшим «Я» и врожденные дары души',
      badge: 'Верхняя Точка B (Месяц)',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      userValueKey: 'month',
      positionId: 'month',
      description: 'Рассчитывается по месяцу вашего рождения. Это ваш прямой канал связи со Вселенной, ангелами-хранителями, тонкой интуицией и врожденными способностями, данными от рождения.',
      howToRead: 'Показывает, через какие духовные практики, творчество или инсайты к вам приходят озарения и вдохновение.',
      positiveTip: 'В плюсе: развитая интуиция, вещие сны, легкое обучение, дар вести за собой людей.',
      shadowWarning: 'В минусе: сомнения в себе, материализм без души, нежелание развивать свои таланты.',
      colorTheme: {
        bg: 'from-purple-950/40 via-[#0a0f1d] to-[#060a14]',
        border: 'border-purple-500/40',
        text: 'text-purple-300',
        glow: 'rgba(168, 85, 247, 0.25)'
      }
    },
    {
      id: 'left',
      title: 'Левая Вершина: Визитная Карточка & Личность',
      subtitle: 'То, как вас считывает мир и способ контакта с социумом',
      badge: 'Левая Точка A (День)',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: <BookOpen className="w-6 h-6 text-indigo-400" />,
      userValueKey: 'day',
      positionId: 'day',
      description: 'Определяется днем вашего рождения (при дате >22 складывается, напр. 25 = 2+5 = 7). Это ваша визитка в социуме, первое впечатление, манера общения и первичная энергия действия.',
      howToRead: 'Показывает, какое качество в вас сразу замечают окружающие и через какое поведение вы легко открываете любые двери.',
      positiveTip: 'В плюсе: харизма, легкий контакт с людьми, естественное лидерство и уверенность.',
      shadowWarning: 'В минусе: замкнутость, агрессия, гордыня или надевание чужих масок.',
      colorTheme: {
        bg: 'from-indigo-950/40 via-[#0a0f1d] to-[#060a14]',
        border: 'border-indigo-500/40',
        text: 'text-indigo-300',
        glow: 'rgba(99, 102, 241, 0.25)'
      }
    },
    {
      id: 'right',
      title: 'Правая Вершина: Материя, Финансы & Здоровье',
      subtitle: 'Материализация целей, физическое тело и богатство',
      badge: 'Правая Точка C (Год)',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Coins className="w-6 h-6 text-emerald-400" />,
      userValueKey: 'year',
      positionId: 'year',
      description: 'Рассчитывается по сумме цифр года рождения. Отвечает за земную проявленность: способность зарабатывать деньги, удерживать богатство, здоровье физического тела и иммунитет.',
      howToRead: 'Указывает на сферы наибольшей финансовой отдачи и сигнализирует о психосоматических уязвимостях при стрессе.',
      positiveTip: 'В плюсе: стабильный финансовый поток, крепкое здоровье, реализация масштабных проектов.',
      shadowWarning: 'В минусе: зацикленность на деньгах или бедность, психосоматика, страх потерь.',
      colorTheme: {
        bg: 'from-emerald-950/40 via-[#0a0f1d] to-[#060a14]',
        border: 'border-emerald-500/40',
        text: 'text-emerald-300',
        glow: 'rgba(16, 185, 129, 0.25)'
      }
    },
    {
      id: 'bottom',
      title: 'Нижняя Вершина: Кармический Хвост',
      subtitle: 'Главный невыученный урок души из прошлого воплощения',
      badge: 'Нижняя Точка D (Карма)',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: <ShieldAlert className="w-6 h-6 text-rose-400" />,
      userValueKey: 'bottom',
      positionId: 'bottom',
      description: 'Самая глубокая точка матрицы. При рождении эта энергия всегда входит в жизнь со знаком «минус» как кармический багаж. Именно здесь кроются повторяющиеся жизненные грабли и блоки.',
      howToRead: 'Пока вы не выведете кармический хвост в плюс, денежный канал и гармоничные отношения будут перекрываться проверками судьбы.',
      positiveTip: 'В плюсе: мощнейший трамплин духовной силы, мудрость, освобождение от родовых сценариев.',
      shadowWarning: 'В минусе: повторение одних и тех же ошибок, чувство жертвы, токсичные привязанности.',
      colorTheme: {
        bg: 'from-rose-950/40 via-[#0a0f1d] to-[#060a14]',
        border: 'border-rose-500/40',
        text: 'text-rose-300',
        glow: 'rgba(244, 63, 94, 0.25)'
      }
    },
    {
      id: 'destiny',
      title: 'Предназначение & Тройной Вектор Жизни',
      subtitle: 'Личное (до 40), Социальное (40-60) и Духовное (после 60)',
      badge: 'Вектор Эволюции',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: <Layers className="w-6 h-6 text-cyan-400" />,
      userValueKey: 'destiny',
      description: 'Матрица рассчитывает 3 ключевых предназначения человека по диагоналям Неба (дух) и Земли (материя): 1) Для себя (раскрыть индивидуальность), 2) Для людей и рода (отдать пользу обществу), 3) Духовное (награда Вселенной).',
      howToRead: 'Окончательное число предназначения объединяет ваши духовные и земные уроки в единую путеводную звезду.',
      positiveTip: 'В плюсе: четкое ощущение "я на своем месте", признание, удовлетворение от каждого дня.',
      shadowWarning: 'В минусе: кризис среднего возраста, потеря смысла, жизнь чужими ожиданиями.',
      colorTheme: {
        bg: 'from-cyan-950/40 via-[#0a0f1d] to-[#060a14]',
        border: 'border-cyan-500/40',
        text: 'text-cyan-300',
        glow: 'rgba(6, 182, 212, 0.25)'
      }
    },
    {
      id: 'action',
      title: 'Как применять Матрицу на практике?',
      subtitle: 'Интерактивные нажатия, голос оракула и персональные PDF',
      badge: 'Практика',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <Lightbulb className="w-6 h-6 text-amber-400" />,
      description: 'Теперь вы готовы к чтению матрицы! Вы можете нажимать на любую сферу на графике, чтобы мгновенно прочитать подробную расшифровку, прослушать голос Chubuk с советом и скачать полный PDF-манускрипт.',
      howToRead: 'Обращайте особое внимание на разделы «В плюсе» и «В минусе» в каждом аркане: используйте их как ежедневный компас решений.',
      positiveTip: 'Регулярно сверяйтесь с ежедневным прогнозом и картой чакр во вкладках приложения.',
      shadowWarning: 'Матрица — это не фатум, а карта возможностей. Вы сами управляете своими энергиями.',
      colorTheme: {
        bg: 'from-amber-950/40 via-[#0a0f1d] to-[#060a14]',
        border: 'border-amber-500/40',
        text: 'text-amber-300',
        glow: 'rgba(245, 158, 11, 0.3)'
      }
    }
  ];

  const current = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem('chubuk_matrix_onboarding_done', 'true');
    } catch (e) {
      // ignore
    }
    onClose();
  };

  const userArcanaValue = current.userValueKey && matrix ? matrix[current.userValueKey] : null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="absolute inset-0" 
        onClick={handleFinish}
      />

      <motion.div
        key={current.id}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`relative w-full max-w-xl rounded-3xl bg-gradient-to-b ${current.colorTheme.bg} border ${current.colorTheme.border} p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]`}
        style={{
          boxShadow: `0 20px 60px -15px ${current.colorTheme.glow}`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div className="min-w-0">
              <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${current.badgeColor}`}>
                {current.badge}
              </span>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Шаг {currentStep + 1} из {steps.length}
              </p>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Закрыть обучение"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-4 sm:py-5 space-y-4 sm:space-y-5 custom-scrollbar pr-1">
          {/* Main Title & Subtitle */}
          <div>
            <h3 className="font-serif font-bold text-white text-lg sm:text-xl leading-snug">
              {current.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300/80 font-light mt-1">
              {current.subtitle}
            </p>
          </div>

          {/* User's Current Calculation Dynamic Callout */}
          {userArcanaValue && userInput && (
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-serif font-black text-xl flex items-center justify-center shadow-md shrink-0">
                  {userArcanaValue}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-serif font-bold text-white block truncate">
                    Ваш {userArcanaValue} Аркан ({userInput.name})
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
                    Рассчитан в вашей персональной матрице
                  </span>
                </div>
              </div>

              {current.positionId && onSelectPoint && (
                <button
                  onClick={() => {
                    handleFinish();
                    onSelectPoint(current.positionId!);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-amber-300 text-xs font-serif font-bold transition-colors cursor-pointer shrink-0"
                >
                  Открыть
                </button>
              )}
            </div>
          )}

          {/* Main Explanation */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {current.description}
            </p>
            <div className="pt-2 border-t border-white/5">
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-amber-400 font-serif mb-1 flex items-center gap-1.5">
                <Lightbulb size={13} />
                Как правильно читать значение:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                {current.howToRead}
              </p>
            </div>
          </div>

          {/* Positive vs Shadow Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                <CheckCircle2 size={12} />
                Энергия в Плюсе
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {current.positiveTip}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1">
                <Flame size={12} />
                Энергия в Минусе
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {current.shadowWarning}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          {/* Step Indicators Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStep 
                    ? 'w-6 bg-amber-400' 
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                title={`Шаг ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>

          {/* Buttons: Prev & Next */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-serif font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">Назад</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 cursor-pointer"
            >
              <span>{isLast ? 'Начать исследование!' : 'Далее'}</span>
              {!isLast ? <ChevronRight size={15} /> : <CheckCircle2 size={15} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
