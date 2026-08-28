import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hourglass, 
  Sparkles, 
  HeartPulse, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Flame, 
  Compass, 
  Award, 
  Clock, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle2, 
  RotateCcw, 
  Share2, 
  Volume2, 
  VolumeX, 
  Download, 
  Sliders,
  AlertCircle,
  Sun,
  Moon,
  Feather,
  Sparkle
} from 'lucide-react';
import { UserInput, MatrixNumbers } from '../types';
import { calculateMatrix, calculateLifePathNumber, reduceArcana } from '../services/numerologyUtils';
import { FULL_TAROT_DECK, generatePersonalLifespanSynthesis } from '../services/geminiService';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';
import { exportLifespanPdf } from '../services/exportUtils';

interface LifespanSectionProps {
  userInput: UserInput | null;
  matrix: MatrixNumbers | null;
  onNavigateToMatrix?: () => void;
  onNavigateToTarot?: () => void;
}

interface TarotSpreadCard {
  id: number;
  name: string;
  position: 'current' | 'turningPoint' | 'longevityKey';
  positionTitle: string;
  positionDesc: string;
  meaning: string;
  timeHint: string;
  icon: string;
}

const TAROT_TIME_MEANINGS: Record<string, { meaning: string; timeHint: string }> = {
  "Шут": { meaning: "Начало нового цикла, спонтанный скачок времени, обнуление старых рамок", timeHint: "От 1 до 3 месяцев, либо неожиданно внезапно" },
  "Маг": { meaning: "Инициация, активная воля, импульс созидания и быстрое ускорение событий", timeHint: "Весенний период, 1-4 недели при активных действиях" },
  "Жрица": { meaning: "Скрытый период созревания кармы, интуитивные задержки, тайные процессы", timeHint: "Полнолуние, лунный месяц (28 дней) или 9 месяцев" },
  "Императрица": { meaning: "Плодородие, органический рост, природный темп созревания плодов", timeHint: "Лето / сезон сбора урожая, 3-9 месяцев" },
  "Император": { meaning: "Укрепление фундамента, стабилизация рубежей, долгосрочный порядок", timeHint: "4 месяца или 4-летний цикл стабильности" },
  "Жрец": { meaning: "Духовные уроки, прохождение наставничества, соблюдение сакральных традиций", timeHint: "5 месяцев или период важного обучения (до 1 года)" },
  "Влюбленные": { meaning: "Точка развилки судьбы, выбор пути, определяющий следующий 6-летний цикл", timeHint: "6 недель / 6 месяцев до судьбоносного решения" },
  "Колесница": { meaning: "Резкий рывок вперед, преодоление дистанции, стремительный триумф", timeHint: "Очень скоро: от 7 дней до 7 недель" },
  "Сила": { meaning: "Период испытания страстей, закалка выносливости, укрепление иммунитета", timeHint: "Август / знак Льва, от 8 недель до 8 месяцев" },
  "Отшельник": { meaning: "Период накопления мудрости, замедление времени, самопогружение и аскеза", timeHint: "Осень / сентябрь, 9 месяцев или 9-летний цикл" },
  "Колесо Фортуны": { meaning: "Кармический поворот судьбы, квантовый скачок, судьбоносное совпадение", timeHint: "Цикл 10 месяцев / 10 лет, непредвиденный момент" },
  "Справедливость": { meaning: "Жатва кармических плодов, юридические и причинно-следственные решения", timeHint: "Октябрь / знак Весов, 11 недель или 1 год" },
  "Повешенный": { meaning: "Фаза переоценки ценностей, временное зависание для смены парадигмы", timeHint: "Пауза от 3 до 12 месяцев для внутренней трансформации" },
  "Смерть": { meaning: "Необратимое завершение отжившего этапа, освобождение места для долголетия", timeHint: "Ноябрь / знак Скорпиона, от 13 недель до полугода" },
  "Умеренность": { meaning: "Гармоничный, плавный ход времени, исцеление биополя, алхимия терпения", timeHint: "14 месяцев или размеренное течение без спешки" },
  "Дьявол": { meaning: "Проверка на искушения, материальная привязка, высвобождение скрытой тени", timeHint: "Зима / декабрь-январь, период 15 месяцев испытаний" },
  "Башня": { meaning: "Молниеносный слом иллюзий, радикальная перезагрузка жизненной оси", timeHint: "Критически быстро: от нескольких дней до 16 недель" },
  "Звезда": { meaning: "Луч надежды, долгосрочный маяк судьбы, активация высшего предназначения", timeHint: "Февраль / знак Водолея, долгосрочный горизонт 1-2 года" },
  "Луна": { meaning: "Глубинная трансформация подсознания, выход из морока и страхов", timeHint: "Новолуние / полнолуние, цикличность 18 лунных месяцев" },
  "Солнце": { meaning: "Золотой век жизненных сил, пик витальности, счастье и ясный свет", timeHint: "Летнее солнцестояние, ближайшие 19 недель триумфа" },
  "Суд": { meaning: "Глобальное пробуждение рода, кармическое возрождение, новый статус души", timeHint: "Судьбоносный рубеж: 20 месяцев / 20-летний виток" },
  "Мир": { meaning: "Абсолютная гармония, триумфальное завершение миссии, выход на новый уровень", timeHint: "Полный круг завершен, срок: 21 месяц или вечность" }
};

export const LifespanSection: React.FC<LifespanSectionProps> = ({
  userInput,
  matrix: propMatrix,
  onNavigateToMatrix,
  onNavigateToTarot
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'chronos' | 'tarot' | 'oracle' | 'keys'>('chronos');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [tarotReading, setTarotReading] = useState<TarotSpreadCard[] | null>(null);
  const [selectedCustomEvent, setSelectedCustomEvent] = useState<string>('general');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [isReadingCards, setIsReadingCards] = useState<boolean>(false);
  const [vitalityBoostActive, setVitalityBoostActive] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { playSolfeggioTone } = useGlobalAudio();

  // Calculate Matrix & Life Path
  const effectiveMatrix = useMemo(() => {
    if (propMatrix) return propMatrix;
    if (userInput?.birthDate) {
      try {
        return calculateMatrix(userInput.birthDate);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  }, [propMatrix, userInput]);

  const lifePath = useMemo(() => {
    if (!userInput?.birthDate) return 9;
    return calculateLifePathNumber(userInput.birthDate);
  }, [userInput]);

  // Numerology Lifespan & Vitality Calculations
  const calculations = useMemo(() => {
    if (!userInput?.birthDate || !effectiveMatrix) {
      return {
        vitalityScore: 88,
        baseLongevityMin: 82,
        baseLongevityMax: 96,
        currentAge: 25,
        currentPhaseName: 'Лето Судьбы: Расцвет и Экспансия',
        seasons: [
          { name: 'Весна (Становление)', range: '0 – 28 лет', arcana: 19, desc: 'Закладка фундамента здоровья, поиск своего пути, формирование костной структуры и характера.' },
          { name: 'Лето (Пик Реализации)', range: '29 – 56 лет', arcana: 9, desc: 'Максимум социальной и финансовой отдачи, защита энергетики от выгорания, укрепление рода.' },
          { name: 'Осень (Мудрость и Жатва)', range: '57 – 84 года', arcana: 5, desc: 'Период наставничества, накопления духовного Оджаса, передача наследия, управление долголетием.' },
          { name: 'Зима (Сакральный Хронос)', range: '85+ лет', arcana: 21, desc: 'Патриаршество, созерцание плодов воплощения, абсолютная ясность ума и связь с высшим истоком.' }
        ],
        turningPoints: [
          { age: 21, task: 'Сепарация от родительского поля, обретение собственного источника энергии' },
          { age: 28, task: 'Первое возвращение Сатурна: кристаллизация вектора профессии и здоровья' },
          { age: 33, task: 'Сакральный возраст Христа: проверка на верность высшему предназначению' },
          { age: 37, task: 'Фатальная точка судьбы: отказ от детских эго-программ, заземление сил' },
          { age: 42, task: 'Оппозиция Урана: вторая молодость, смена приоритетов, защита сосудов' },
          { age: 49, task: 'Семилетний цикл мудрости: трансформация гормонального фона и праны' },
          { age: 56, task: 'Второе возвращение Сатурна: переход в статус старейшины рода' },
          { age: 63, task: 'Саттвическое очищение: духовное служение и сохранение гибкости суставов' },
          { age: 72, task: 'Золотой рубеж долголетия: активация резервного запаса ДНК' },
          { age: 84, task: 'Полный цикл Урана: абсолютная целостность и трансцендентная мудрость' },
          { age: 91, task: 'Век долгожителя: благословение потомков и высшая гармония' }
        ],
        element: 'Огонь и Земля',
        vulnerableZone: 'Сердечно-сосудистая система и нервное перенапряжение',
        vitalityFactors: [
          { name: 'Врожденная прана (День рождения)', val: 92, color: 'text-amber-400' },
          { name: 'Родовой запас прочности (Центр)', val: 86, color: 'text-emerald-400' },
          { name: 'Иммунный каркас (Число судьбы)', val: 89, color: 'text-sky-400' },
          { name: 'Стрессоустойчивость матрицы', val: 84, color: 'text-purple-400' }
        ]
      };
    }

    const birthDateObj = new Date(userInput.birthDate);
    const now = new Date();
    let age = now.getFullYear() - birthDateObj.getFullYear();
    const m = now.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDateObj.getDate())) {
      age--;
    }
    const safeAge = Math.max(0, age);

    // Dynamic vitality score based on matrix parameters
    const dayVal = effectiveMatrix.day;
    const centerVal = effectiveMatrix.center;
    const bottomVal = effectiveMatrix.bottom;
    const destinyVal = effectiveMatrix.destiny;

    // Mathematical formula for vitality potential
    const rawVitality = Math.round(75 + ((dayVal + centerVal + destinyVal) % 20) + (safeAge > 50 ? 5 : 2));
    const clampedVitality = Math.min(98, Math.max(78, rawVitality));

    const minLongevity = 80 + Math.round((dayVal + centerVal) % 10);
    const maxLongevity = 94 + Math.round((destinyVal * 3) % 11);

    // Current phase name
    let phaseName = 'Весна Судьбы: Закладка Резервов и Фундамента';
    if (safeAge >= 29 && safeAge <= 56) phaseName = 'Лето Судьбы: Расцвет, Сила и Социальная Экспансия';
    else if (safeAge >= 57 && safeAge <= 84) phaseName = 'Осень Судьбы: Мудрость, Жатва и Духовное Наставничество';
    else if (safeAge >= 85) phaseName = 'Зима Судьбы: Сакральный Хронос и Золотое Долголетие';

    const seasons = [
      { 
        name: 'Весна (Становление & Иммунитет)', 
        range: '0 – 28 лет', 
        arcana: effectiveMatrix.day, 
        desc: `Энергия ${effectiveMatrix.day}-го Аркана формирует структуру тела, первичный запас праны и устойчивость к детским травмам.` 
      },
      { 
        name: 'Лето (Пик Силы & Реализация)', 
        range: '29 – 56 лет', 
        arcana: effectiveMatrix.center, 
        desc: `Энергия ${effectiveMatrix.center}-го Аркана управляет балансом работы и отдыха. Главный вызов — не сжечь витальность в погоне за успехом.` 
      },
      { 
        name: 'Осень (Мудрость & Жатва Кармы)', 
        range: '57 – 84 года', 
        arcana: effectiveMatrix.destiny, 
        desc: `Энергия ${effectiveMatrix.destiny}-го Аркана включает резервный Оджас, передачу знаний и укрепление сосудистой системы.` 
      },
      { 
        name: 'Зима (Хронос Долголетия & Старейшина)', 
        range: '85+ лет', 
        arcana: reduceArcana(effectiveMatrix.day + effectiveMatrix.center), 
        desc: `Энергия высшей гармонии. Период созерцания, чистой ясности сознания и передачи благословения потомкам.` 
      }
    ];

    const turningPoints = [
      { age: 21, task: `Сепарация от родительских программ, активация личной визитки (${effectiveMatrix.day} Аркан)` },
      { age: 28, task: `Первый кризис Сатурна: кристаллизация профессии и отказ от истощающих привычек` },
      { age: 33, task: `Сакральная точка выбора: синхронизация талантов (${effectiveMatrix.month} Аркан) с реальной миссией` },
      { age: 37, task: `Кармическая ревизия: проработка хвоста (${effectiveMatrix.bottom} Аркан), защита от выгорания` },
      { age: 42, task: `Переход Урана: омоложение биополя, пересмотр питания и смена темпа жизни` },
      { age: 49, task: `Семилетний цикл мудрости: гармонизация душевного комфорта (${effectiveMatrix.center} Аркан)` },
      { age: 56, task: `Второе возвращение Сатурна: переход на уровень мастера и хранителя рода` },
      { age: 63, task: `Саттвическое очищение: укрепление суставов, медитации и глубокий сон` },
      { age: 72, task: `Врата Золотого Долголетия: поддержание высокого энергетического тонуса` },
      { age: 84, task: `Великий цикл Урана: полная интеграция опыта души и абсолютная мудрость` },
      { age: 91, task: `Патриаршество: вековой рубеж духовного триумфа и гармонии` }
    ];

    return {
      vitalityScore: clampedVitality,
      baseLongevityMin: minLongevity,
      baseLongevityMax: maxLongevity,
      currentAge: safeAge,
      currentPhaseName: phaseName,
      seasons,
      turningPoints,
      element: effectiveMatrix.day % 2 === 0 ? 'Вода и Земля (Накопление & Заземление)' : 'Огонь и Воздух (Динамика & Движение)',
      vulnerableZone: effectiveMatrix.bottom === 9 || effectiveMatrix.bottom === 18 
        ? 'Нервная система, психосоматика и глубина сна' 
        : effectiveMatrix.bottom === 5 || effectiveMatrix.bottom === 15 
        ? 'Печень, обмен веществ и пищеварительный тракт' 
        : 'Сердечно-сосудистая система и мышечные зажимы',
      vitalityFactors: [
        { name: 'Врожденная прана (Визитка)', val: 80 + (dayVal % 18), color: 'text-amber-400' },
        { name: 'Родовой ресурс (Центр)', val: 82 + (centerVal % 16), color: 'text-emerald-400' },
        { name: 'Иммунный потенциал (Судьба)', val: 85 + (destinyVal % 14), color: 'text-sky-400' },
        { name: 'Стрессоустойчивость кармы', val: 78 + ((22 - bottomVal) % 20), color: 'text-purple-400' }
      ]
    };
  }, [userInput, effectiveMatrix, lifePath]);

  // Deal 3-Card Tarot Spread for Time & Longevity
  const handleDealTarotSpread = () => {
    setIsReadingCards(true);
    playSolfeggioTone?.(528, 0.4);

    setTimeout(() => {
      // Pick 3 unique cards
      const availableCards = [...FULL_TAROT_DECK];
      const drawn: string[] = [];
      while (drawn.length < 3 && availableCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        drawn.push(availableCards.splice(randomIndex, 1)[0]);
      }

      const card1 = drawn[0];
      const card2 = drawn[1];
      const card3 = drawn[2];

      const info1 = TAROT_TIME_MEANINGS[card1] || { meaning: "Период концентрации внутренних сил и осознания вектора судьбы.", timeHint: "Ближайшие 1-3 месяца" };
      const info2 = TAROT_TIME_MEANINGS[card2] || { meaning: "Рубеж важного кармического выбора и смены жизненного сценария.", timeHint: "Срок от 6 до 12 месяцев" };
      const info3 = TAROT_TIME_MEANINGS[card3] || { meaning: "Главный фактор продления витальности — баланс труда, отдыха и духовных практик.", timeHint: "Долгосрочный ориентир на десятилетия" };

      const spread: TarotSpreadCard[] = [
        {
          id: 1,
          name: card1,
          position: 'current',
          positionTitle: '1. Аркан Текущего Срока (Где вы сейчас)',
          positionDesc: 'Энергетическая скорость и текущая фаза жизненного потока.',
          meaning: info1.meaning,
          timeHint: info1.timeHint,
          icon: '⏳'
        },
        {
          id: 2,
          name: card2,
          position: 'turningPoint',
          positionTitle: '2. Аркан Ближайшего Рубежа (Срок перемен)',
          positionDesc: 'Временной горизонт следующей важной трансформации судьбы.',
          meaning: info2.meaning,
          timeHint: info2.timeHint,
          icon: '⚡'
        },
        {
          id: 3,
          name: card3,
          position: 'longevityKey',
          positionTitle: '3. Аркан Вектора Долголетия (Ключ к годам)',
          positionDesc: 'Сакральный ресурс для сохранения молодости, сил и ясности ума.',
          meaning: info3.meaning,
          timeHint: info3.timeHint,
          icon: '🛡️'
        }
      ];

      setTarotReading(spread);
      setIsReadingCards(false);
    }, 800);
  };

  // Generate Deep AI Synthesis
  const handleGenerateAISynthesis = async () => {
    setIsSynthesizing(true);
    playSolfeggioTone?.(432, 0.4);

    try {
      const report = await generatePersonalLifespanSynthesis({
        userInput,
        matrix: effectiveMatrix,
        vitalityScore: calculations.vitalityScore,
        currentAge: calculations.currentAge,
        baseLongevityMin: calculations.baseLongevityMin,
        baseLongevityMax: calculations.baseLongevityMax,
        tarotCards: tarotReading ? tarotReading.map(c => `${c.positionTitle}: ${c.name} (${c.timeHint})`).join('; ') : 'Расклад не запущен',
        customQuestion: customQuestion || undefined
      });
      setAiReport(report);
    } catch (e) {
      console.error(e);
      setAiReport(`### 📜 Сакральный Манускрипт Хроноса & Долголетия\n\n**Для: ${userInput?.name || 'Искателя Истины'}**\n\n- **Потенциал долголетия:** Природный коридор составляет ${calculations.baseLongevityMin}–${calculations.baseLongevityMax} лет активной, наполненной жизни при соблюдении гармонии ведущего ${effectiveMatrix?.center || 9}-го Аркана Души.\n- **Текущий этап:** ${calculations.currentPhaseName}. Время максимального раскрытия внутреннего авторитета и укрепления сосудистой системы.\n- **Ключевой совет Хроноса:** Не растрачивайте энергию на импульсивные конфликты. Регулярная медитация и саттвическое питание дадут телу дополнительный запас праны на 15–20 лет.`);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportLifespanPdf({
        userInput,
        matrix: effectiveMatrix,
        lifespanData: calculations,
        tarotReading,
        aiReport
      });
    } catch (err) {
      console.error("Failed to export Lifespan PDF:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in text-slate-100 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0c1222] via-[#090d19] to-[#04060d] border border-amber-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-wider">
              <Hourglass size={13} className="text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Сакральная Хронометрия & Таро Времени</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Хронос Судьбы: Сроки & Долголетие
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              Комплексный нумерологический расчет биологических сезонов, критических рубежей трансформации и расклад Таро на временные горизонты событий и потенциал долголетия души.
            </p>
          </div>

          {/* Quick Vitality Badge */}
          <div className="w-full md:w-auto flex md:flex-col items-center justify-between p-4 rounded-2xl bg-black/40 border border-amber-500/30 shadow-lg text-center min-w-[200px]">
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Потенциал Витальности</span>
              <div className="text-3xl sm:text-4xl font-serif font-black text-amber-300 flex items-center justify-center gap-1.5 mt-0.5">
                <HeartPulse size={26} className="text-rose-400 animate-pulse" />
                <span>{calculations.vitalityScore}%</span>
              </div>
            </div>
            <div className="text-[11px] text-emerald-300 font-serif font-semibold mt-1">
              Коридор: {calculations.baseLongevityMin} – {calculations.baseLongevityMax} лет
            </div>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-white/10 mt-6 text-xs font-serif font-bold">
          <button
            onClick={() => setActiveSubTab('chronos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'chronos'
                ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Clock size={15} />
            <span>1. Хронос & Сезоны Жизни</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tarot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'tarot'
                ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Layers size={15} />
            <span>2. Таро на Сроки & Рубежи</span>
          </button>

          <button
            onClick={() => setActiveSubTab('oracle')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'oracle'
                ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Sparkles size={15} />
            <span>3. ИИ-Оракул Долголетия</span>
          </button>

          <button
            onClick={() => setActiveSubTab('keys')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'keys'
                ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <ShieldCheck size={15} />
            <span>4. Кодекс Продления Ресурса</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer bg-gradient-to-r from-amber-500/20 to-yellow-600/20 hover:from-amber-500/30 hover:to-yellow-600/30 text-amber-300 border border-amber-500/40 ml-auto shadow-sm"
          >
            <Download size={15} className={isExportingPdf ? 'animate-bounce' : ''} />
            <span>{isExportingPdf ? 'Создание PDF...' : 'Скачать PDF'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CHRONOS & LIFECYCLES */}
      {activeSubTab === 'chronos' && (
        <div className="space-y-8">
          {/* User Profile Context Strip */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#0d1527] to-black border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-serif font-black text-xl flex items-center justify-center">
                {effectiveMatrix ? effectiveMatrix.center : '9'}
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-base">
                  {userInput?.name || 'Странник Судьбы'} • {calculations.currentAge} лет
                </h3>
                <p className="text-xs text-amber-300/90 font-mono">
                  Текущий цикл: <strong className="text-white">{calculations.currentPhaseName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setVitalityBoostActive(true);
                  playSolfeggioTone?.(528, 0.5);
                  setTimeout(() => setVitalityBoostActive(false), 3000);
                }}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  vitalityBoostActive
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/30'
                    : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <Zap size={14} className={vitalityBoostActive ? 'animate-spin' : ''} />
                <span>{vitalityBoostActive ? 'Прана Активирована 528 Гц!' : 'Активировать Прану 528 Гц'}</span>
              </button>
            </div>
          </div>

          {/* 4 Great Seasons of Life */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                <Sun size={20} className="text-amber-400" />
                <span>4 Великих Сезона Жизни & Энергетические Фазы</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Циклы 0 – 85+ лет</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {calculations.seasons.map((season, idx) => {
                const isCurrent = 
                  (idx === 0 && calculations.currentAge <= 28) ||
                  (idx === 1 && calculations.currentAge >= 29 && calculations.currentAge <= 56) ||
                  (idx === 2 && calculations.currentAge >= 57 && calculations.currentAge <= 84) ||
                  (idx === 3 && calculations.currentAge >= 85);

                return (
                  <div
                    key={idx}
                    className={`rounded-3xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-gradient-to-b from-amber-950/50 via-[#131b2e] to-[#080d1a] border-amber-400 shadow-xl shadow-amber-500/10'
                        : 'bg-[#070c18]/80 border-white/10'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold text-[9px] uppercase tracking-wider">
                        Вы здесь
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="text-[11px] font-mono font-bold text-amber-400/90">{season.range}</div>
                      <h4 className="text-base font-serif font-bold text-white">{season.name}</h4>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs text-amber-200">
                        <span>Управитель:</span>
                        <strong className="text-amber-300 font-bold">{season.arcana} Аркан</strong>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/5">
                        {season.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chronological Timeline: 11 Critical Turning Points */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
              <Hourglass size={20} className="text-amber-400" />
              <span>Хронологическая Шкала Рубежей Трансформации</span>
            </h2>
            <p className="text-xs text-slate-400">
              Возрастные точки проверок судьбы: переходные коридоры, где решается сохранение здоровья и умножение сил.
            </p>

            <div className="p-6 rounded-3xl bg-[#060a14] border border-white/10 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {calculations.turningPoints.map((tp, idx) => {
                  const passed = calculations.currentAge > tp.age;
                  const isCurrent = Math.abs(calculations.currentAge - tp.age) <= 2;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3.5 transition-all ${
                        isCurrent
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                          : passed
                          ? 'bg-black/30 border-white/5 text-slate-400'
                          : 'bg-[#090f1e]/60 border-white/10 text-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-serif font-black text-sm shrink-0 ${
                        isCurrent ? 'bg-amber-500 text-black' : passed ? 'bg-white/5 text-slate-500' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {tp.age}
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-serif text-amber-300">{tp.age} лет</span>
                          {isCurrent && <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-black font-bold">АКТИВНЫЙ РУБЕЖ</span>}
                          {passed && <span className="text-[10px] text-emerald-400 font-mono">✓ Пройдено</span>}
                        </div>
                        <p className="text-slate-300 leading-relaxed">{tp.task}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Vitality Factors Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#080e1c] border border-white/10 space-y-4">
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-emerald-400" />
                <span>Энергетический Каркас Витальности</span>
              </h3>
              <div className="space-y-3">
                {calculations.vitalityFactors.map((factor, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{factor.name}</span>
                      <span className={factor.color}>{factor.val}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-1000"
                        style={{ width: `${factor.val}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#080e1c] border border-white/10 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Flame size={18} className="text-rose-400" />
                  <span>Биосоматика & Защита от Утечек</span>
                </h3>
                <div className="space-y-3 text-xs mt-3 text-slate-300">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <strong className="text-amber-300 block mb-1">Стихийный баланс:</strong>
                    <span>{calculations.element}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <strong className="text-rose-300 block mb-1">Зона повышенного внимания:</strong>
                    <span>{calculations.vulnerableZone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400 italic">
                💡 При гармоничном проживании энергий матрицы вы сохраняете до +15 лет активного, бодрого тонуса.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TAROT OF TIME & SPREAD */}
      {activeSubTab === 'tarot' && (
        <div className="space-y-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c1426] to-[#060912] border border-amber-500/30 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto text-2xl shadow-xl">
              🃏
            </div>
            <div className="max-w-xl mx-auto space-y-1">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Сакральный Расклад Таро на Сроки & Временные Горизонты
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                Колода Таро содержит в себе временные шифры планет, знаков и стихий. Расклад укажет скорость процессов, ближайший кармический рубеж и ключ к продлению жизненных сил.
              </p>
            </div>

            {/* Custom Question Field */}
            <div className="max-w-md mx-auto space-y-2 pt-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Задать вопрос о сроке (например: «Когда придет новая работа?»)"
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all text-center"
              />
            </div>

            <button
              onClick={handleDealTarotSpread}
              disabled={isReadingCards}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-serif font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isReadingCards ? (
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="animate-spin" />
                  <span>Перемешивание Хронос-Колоды...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Разложить Карты Времени 78 Арканов</span>
                </span>
              )}
            </button>
          </div>

          {/* Cards Result Grid */}
          {tarotReading && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {tarotReading.map((card, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl p-6 bg-gradient-to-b from-[#0f172a] via-[#0a0f1d] to-[#050811] border border-amber-500/30 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{card.icon}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                          Позиция {idx + 1}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-serif font-bold text-amber-400 block">{card.positionTitle}</span>
                        <p className="text-[11px] text-slate-400">{card.positionDesc}</p>
                      </div>

                      {/* Card Visual Plate */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-black to-black border border-amber-500/40 text-center space-y-1">
                        <span className="text-2xl block mb-1">🎴</span>
                        <h4 className="text-base font-serif font-bold text-amber-200">{card.name}</h4>
                        <div className="text-[11px] font-mono text-emerald-300 font-bold">
                          Срок: {card.timeHint}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/5">
                        {card.meaning}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action to Synthesize with AI */}
              <div className="text-center pt-4">
                <button
                  onClick={() => {
                    setActiveSubTab('oracle');
                    handleGenerateAISynthesis();
                  }}
                  className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  🔮 Расшифровать Расклад через ИИ-Оракула
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI ORACLE SYNTHESIS */}
      {activeSubTab === 'oracle' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0a1020] border border-amber-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-400" />
                  <span>Глубинный Манускрипт Долголетия & Сроков Жизни</span>
                </h3>
                <p className="text-xs text-slate-300 font-light">
                  Синтез даты рождения, 22 арканов, астрологических циклов Сатурна и Юпитера.
                </p>
              </div>

              <button
                onClick={handleGenerateAISynthesis}
                disabled={isSynthesizing}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSynthesizing ? 'Синтез Хроноса...' : aiReport ? 'Обновить Манускрипт' : 'Сформировать Манускрипт'}
              </button>
            </div>

            {isSynthesizing && (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Sparkles size={32} className="text-amber-400 animate-spin" />
                <p className="text-xs text-amber-300 font-serif uppercase tracking-wider">
                  ИИ-Оракул Chubuk вычисляет коридоры судьбы и формулу долголетия...
                </p>
              </div>
            )}

            {aiReport && !isSynthesizing && (
              <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                <div className="whitespace-pre-line prose prose-invert max-w-none">
                  {aiReport}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SACRED LONGEVITY CODE & BIOHACKING */}
      {activeSubTab === 'keys' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pillar 1 */}
            <div className="p-6 rounded-3xl bg-[#080e1c] border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg font-bold">
                  1
                </div>
                <h4 className="font-serif font-bold text-white text-base">Биоритмический Сон & Мелатонин</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                С 22:00 до 02:00 происходит регенерация шишковидной железы и тонких тел. 1 час сна до полуночи равен 2 часам после. Это ключевой фактор омоложения клеток.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-3xl bg-[#080e1c] border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-lg font-bold">
                  2
                </div>
                <h4 className="font-serif font-bold text-white text-base">Саттвическое Питание Злаками</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Питание цельными крупами (гречка, овес, киноа, рис Басмати с топленым маслом Гхи) снижает окислительный стресс и наполняет праной сердечную чакру Анахату.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-3xl bg-[#080e1c] border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center text-lg font-bold">
                  3
                </div>
                <h4 className="font-serif font-bold text-white text-base">Звуковая Терапия 432 / 528 Гц</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Частота 528 Гц резонирует со структурой воды и восстанавливает ДНК, а 432 Гц успокаивает блуждающий нерв, снимая психосоматические спазмы сосудов.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-3xl bg-[#080e1c] border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-lg font-bold">
                  4
                </div>
                <h4 className="font-serif font-bold text-white text-base">Прощение & Расторжение Обид</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Хронические обиды блокируют 4-й энергоцентр и съедают до 30% жизненного запаса. Ежедневная практика благодарности возвращает легкость дыхания.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifespanSection;
