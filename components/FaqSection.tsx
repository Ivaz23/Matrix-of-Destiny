import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Sparkles, 
  Compass, 
  Zap, 
  Heart, 
  Coins, 
  ShieldCheck, 
  BookOpen, 
  Flame, 
  Layers, 
  RefreshCw,
  MessageCircleQuestion,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { UserInput, MatrixNumbers } from '../types';

interface FaqSectionProps {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
  onNavigateToChat?: () => void;
  onTriggerHaptic?: (pattern?: number | number[]) => void;
}

interface FaqItem {
  id: string;
  category: 'basics' | 'karma' | 'finance_love' | 'energies' | 'destiny' | 'practice';
  categoryLabel: string;
  question: string;
  shortAnswer: string;
  detailedAnswer: string[];
  practicalTip: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'what-is-matrix',
    category: 'basics',
    categoryLabel: 'Основы Матрицы',
    question: 'Что такое Матрица Судьбы и как она рассчитывается?',
    shortAnswer: 'Матрица Судьбы — это система самопознания на стыке нумерологии и 22 старших арканов Таро, основанная на дате вашего рождения.',
    detailedAnswer: [
      'Метод рассчитывает персональную диаграмму из двух наложенных квадратов (прямого — материального и диагонального — духовного).',
      'Все расчеты сводятся к числам от 1 до 22 через нумерологическое сложение (например, 23 = 2+3 = 5, 29 = 2+9 = 11).',
      'Матрица не является предсказанием будущего или приговором — это энергетический паспорт вашей души и дорожная карта потенциала.'
    ],
    practicalTip: 'Матрица показывает не неизбежность, а энергетические сценарии. Ваша свободная воля определяет, проживаете ли вы арканы в плюсе или в минусе.',
    icon: Sparkles
  },
  {
    id: 'center-and-day',
    category: 'basics',
    categoryLabel: 'Основы Матрицы',
    question: 'В чем разница между Арканом Дня Рождения и Арканом в Центре (Зоне Комфорта)?',
    shortAnswer: 'День рождения — это ваша внешняя визитная карточка, а Центр — ядро души и источник восполнения ресурса.',
    detailedAnswer: [
      'Аркан дня рождения (левая вершина) — это ваш характер, поведение в социуме, то, как вас впервые считывают незнакомые люди.',
      'Аркан в Центре (точка комфорта / точка Д) — это глубинная сущность вашего «Я». В этом состоянии душе максимально спокойно, безопасно и уютно.',
      'Когда вы истощены или находитесь в стрессе, именно аркан в центре подсказывает, где взять энергию.'
    ],
    practicalTip: 'Если чувствуете эмоциональное выгорание, делайте практики по центральному аркану — это мгновенно перезаряжает вашу внутреннюю батарейку.',
    icon: Compass
  },
  {
    id: 'karmic-tail',
    category: 'karma',
    categoryLabel: 'Карма и Хвост',
    question: 'Что такое Кармический Хвост (3 нижних аркана) и почему он всегда в минусе при рождении?',
    shortAnswer: 'Кармический хвост — это нерешенный багаж и ошибки прошлых воплощений, с которыми душа пришла для исцеления.',
    detailedAnswer: [
      'Кармический хвост расположен в самом низу матрицы (красная зона) и состоит из трех связанных энергий.',
      'По умолчанию с раннего детства эти три энергии проявляются в «минусе» — это сценарии-грабли, на которые человек наступает неосознанно.',
      'Пока кармический хвост не осознан и не выведен в плюс, он блокирует поток денег и гармоничные отношения, так как находится на входе в эти каналы.'
    ],
    practicalTip: 'Начните проработку матрицы именно с нижнего аркана (главного кармического долга). Как только он выходит в плюс, автоматически открываются финансы и личная жизнь.',
    icon: Flame
  },
  {
    id: 'money-line',
    category: 'finance_love',
    categoryLabel: 'Деньги и Отношения',
    question: 'Где в матрице искать финансовый канал и как снять денежные блоки?',
    shortAnswer: 'Денежный канал находится на правой нижней диагонали матрицы между долларом ($) и точкой материального баланса.',
    detailedAnswer: [
      'Аркан под знаком доллара указывает на сферы деятельности и профессии, через которые к вам естественным образом приходят деньги.',
      'Соседний аркан на стыке с каналом отношений показывает, что именно блокирует финансовый поток (страхи, жадность, обесценивание).',
      'Деньги в Матрице не приходят через изнурительный труд, если нарушен баланс отдачи и получения по вашим управляющим энергиям.'
    ],
    practicalTip: 'Посмотрите на ваш денежный аркан: если он, например, 3 (Императрица) — деньги идут через заботу, красоту и пассивный доход; если 7 (Колесница) — через цели, лидерство и движение.',
    icon: Coins
  },
  {
    id: 'love-line',
    category: 'finance_love',
    categoryLabel: 'Деньги и Отношения',
    question: 'Как по матрице узнать своего идеального партнера и причину конфликтов в паре?',
    shortAnswer: 'Линия отношений (под значком сердца) описывает типаж идеального спутника, условия знакомства и сценарии гармонии.',
    detailedAnswer: [
      'Аркан на входе в канал отношений указывает на качества партнера, с которым союз будет прочным и счастливым.',
      'Точка баланса между любовью и деньгами показывает, как семья влияет на ваше благосостояние и наоборот.',
      'Если вы привлекаете токсичных партнеров — это сигнал, что арканы в канале любви проживаются по теневому (минусовому) полюсу.'
    ],
    practicalTip: 'Проанализируйте совместимость в разделе «Совместимость» — общая матрица пары покажет совместную кармическую задачу вашего союза.',
    icon: Heart
  },
  {
    id: 'plus-minus',
    category: 'energies',
    categoryLabel: 'Плюс и Минус Арканов',
    question: 'Что значит проживать аркан в «плюсе» или в «минусе»? Можно ли навсегда закрепить плюс?',
    shortAnswer: 'Каждый аркан — это спектр вибраций: от созидания и мудрости (плюс) до страхов, гордыни и агрессии (минус).',
    detailedAnswer: [
      '«Плюс» — это проявление высших качеств энергии: принятие, щедрость, созидание, доверие миру и раскрытие талантов.',
      '«Минус» — это искажение энергии: манипуляции, жертвенность, гиперконтроль, зависимость, лень или обиды.',
      'Арканы — это живые динамические состояния, а не статичная отметка. В моменты усталости или кризиса человек может временно соскальзывать в минус.'
    ],
    practicalTip: 'Используйте раздел «Психологический Портрет (+/-)», чтобы распознать свои персональные триггеры сваливания в минус и ключи быстрого возврата в ресурс.',
    icon: Layers
  },
  {
    id: 'destiny-years',
    category: 'destiny',
    categoryLabel: 'Предназначение',
    question: 'Что такое 3 предназначения (Личное, Социальное, Духовное) и возрастные рубежи 20, 40, 60 лет?',
    shortAnswer: 'Матрица делит жизненный путь на 3 этапа взросления души со сменяющимися духовными экзаменами.',
    detailedAnswer: [
      '1. Личное предназначение (до 40 лет, Небо + Земля) — познание себя, гармонизация мужского и женского начал, наведение порядка в материальной жизни.',
      '2. Социальное предназначение (от 40 до 60 лет, Мужской + Женский род) — служение обществу, передача опыта, реализация в социуме.',
      '3. Духовное предназначение (после 60 лет) — высший синтез мудрости, с которым душа переходит на новый уровень осознанности.'
    ],
    practicalTip: 'В возрасте 39–41 года наступает период так называемой «проверки на зрелость» — если личные задачи не решены, могут происходить резкие жизненные трансформации.',
    icon: ShieldCheck
  },
  {
    id: 'does-matrix-change',
    category: 'practice',
    categoryLabel: 'Практика и ИИ',
    question: 'Меняется ли Матрица Судьбы при смене фамилии, имени или с годами?',
    shortAnswer: 'Базовая матрица по дате рождения остается неизменной на всю жизнь, но меняется уровень осознанности и чистота проживания энергий.',
    detailedAnswer: [
      'Дата рождения — это космический отпечаток момента прихода души в этот мир, она постоянна.',
      'При смене фамилии или имени может меняться ваше нумерологическое звучание в социуме (число имени), но базовая матричная структура арканов остается прежней.',
      'С годами человек естественным образом эволюционирует, переводя все больше арканов из минуса в плюс через осознанность и опыт.'
    ],
    practicalTip: 'Регулярно проверяйте свой «Прогноз Дня» и раздел «Хронос & Долголетие» — они показывают текущие временные циклы и влияние энергий прямо сейчас.',
    icon: RefreshCw
  }
];

const CATEGORIES = [
  { id: 'all', label: 'Все вопросы', icon: BookOpen },
  { id: 'basics', label: 'Основы Матрицы', icon: Sparkles },
  { id: 'karma', label: 'Карма и Хвост', icon: Flame },
  { id: 'finance_love', label: 'Деньги и Отношения', icon: Coins },
  { id: 'energies', label: 'Плюс / Минус', icon: Layers },
  { id: 'destiny', label: 'Предназначение', icon: Compass },
  { id: 'practice', label: 'Практика', icon: HelpCircle },
];

export const FaqSection: React.FC<FaqSectionProps> = ({
  userInput,
  matrix,
  onNavigateToChat,
  onTriggerHaptic
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<string[]>(['what-is-matrix']);

  const toggleExpand = (id: string) => {
    onTriggerHaptic?.(5);
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    onTriggerHaptic?.(10);
    setExpandedIds(FAQ_DATA.map(i => i.id));
  };

  const collapseAll = () => {
    onTriggerHaptic?.(10);
    setExpandedIds([]);
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch = 
        item.question.toLowerCase().includes(q) ||
        item.shortAnswer.toLowerCase().includes(q) ||
        item.detailedAnswer.some(a => a.toLowerCase().includes(q)) ||
        item.practicalTip.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0c1427] via-[#090e1c] to-[#121b30] border border-amber-500/30 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle size={13} className="text-amber-400" />
                База Знаний & FAQ
              </span>
              {matrix && (
                <span className="px-2.5 py-1 rounded-full bg-white/5 text-slate-300 text-xs font-mono">
                  Матрица: <strong className="text-amber-300">{matrix.center} Аркан</strong>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-wide">
              Часто Задаваемые Вопросы
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl font-sans">
              Цельные, практичные и понятные ответы на главные вопросы о 22 Арканах, кармических узлах, деньгах и предназначении.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <button
              onClick={expandAll}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-all cursor-pointer"
            >
              Развернуть все
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-all cursor-pointer"
            >
              Свернуть
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mt-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск вопроса (например: кармический хвост, деньги, совместимость, плюс/минус)..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-black/50 border border-amber-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm sm:text-base transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-white/10 text-slate-400 hover:text-white text-xs"
            >
              Очистить
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                onTriggerHaptic?.(5);
                setSelectedCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-[#0a101d]/80 text-slate-300 hover:bg-white/10 hover:text-white border-white/5'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-black' : 'text-amber-400'} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-3.5">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#090e1c]/80 border border-white/5 text-center space-y-3">
            <MessageCircleQuestion size={36} className="mx-auto text-amber-400 opacity-60" />
            <p className="text-base text-slate-300 font-serif">По вашему запросу ничего не найдено</p>
            <p className="text-xs text-slate-500">Попробуйте изменить поисковую фразу или выбрать другую категорию</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-serif font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedIds.includes(faq.id);
            const Icon = faq.icon;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl transition-all duration-300 border overflow-hidden ${
                  isExpanded
                    ? 'bg-gradient-to-b from-[#0e1628] to-[#0a101d] border-amber-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
                    : 'bg-[#090e1c]/80 hover:bg-[#0c1424] border-white/5 hover:border-white/15'
                }`}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3.5 text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                      isExpanded 
                        ? 'bg-amber-500 text-black shadow-md' 
                        : 'bg-white/5 text-amber-400 border border-white/10'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/80 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                          {faq.categoryLabel}
                        </span>
                      </div>
                      <h3 className={`font-serif font-bold text-sm sm:text-base transition-colors ${
                        isExpanded ? 'text-amber-200' : 'text-slate-100 hover:text-amber-300'
                      }`}>
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  <div className={`p-1.5 rounded-lg shrink-0 transition-transform duration-300 ${
                    isExpanded ? 'rotate-180 bg-amber-500/20 text-amber-300' : 'text-slate-500 bg-white/5'
                  }`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* Accordion Body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4 border-t border-white/5">
                        
                        {/* Short Summary Lead */}
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-100 text-sm font-medium leading-relaxed">
                          {faq.shortAnswer}
                        </div>

                        {/* Bullet Details */}
                        <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                          {faq.detailedAnswer.map((point, idx) => (
                            <div key={idx} className="flex items-start gap-2.5">
                              <CheckCircle2 size={15} className="text-amber-400 mt-0.5 shrink-0" />
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>

                        {/* Practical Tip Callout */}
                        <div className="p-3.5 rounded-xl bg-[#070c17] border border-amber-400/30 flex items-start gap-3 shadow-inner">
                          <Lightbulb size={17} className="text-amber-400 mt-0.5 shrink-0 animate-pulse" />
                          <div className="text-xs sm:text-sm text-slate-200">
                            <strong className="text-amber-300 font-serif">Практический совет: </strong>
                            {faq.practicalTip}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Helper Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#0a101d] to-amber-950/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="font-serif font-bold text-white text-sm sm:text-base">
              Остались индивидуальные вопросы по вашей Матрице?
            </h4>
            <p className="text-xs text-slate-400">
              Спросите персонального ИИ-Нумеролога или воспользуйтесь живым голосовым оракулом.
            </p>
          </div>
        </div>

        {onNavigateToChat && (
          <button
            onClick={() => {
              onTriggerHaptic?.(10);
              onNavigateToChat();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0 cursor-pointer"
          >
            Спросить ИИ-Нумеролога
          </button>
        )}
      </div>

    </div>
  );
};

export default FaqSection;
