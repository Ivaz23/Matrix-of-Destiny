import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Clock, 
  Flame, 
  CloudRain, 
  Moon, 
  Sun, 
  Heart, 
  Wind, 
  Sliders, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Bookmark, 
  Award, 
  Info, 
  Share2, 
  Mic, 
  Volume1, 
  DownloadCloud, 
  Compass, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Feather, 
  RefreshCw,
  Sparkle
} from 'lucide-react';
import { ambientSound, SOUNDSCAPE_PRESETS, SoundscapePreset } from '../services/ambientSoundEngine';
import { UserInput, MatrixNumbers } from '../types';

export interface MeditationCenterProps {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
  onNavigateToMatrix?: () => void;
  onNavigateToChakras?: () => void;
}

export interface GuidedMeditation {
  id: string;
  title: string;
  subtitle: string;
  category: 'chakra' | 'karma' | 'akashic' | 'matrix' | 'abundance' | 'sleep' | 'grounding';
  categoryLabel: string;
  durationMinutes: number;
  frequency: string;
  recommendedArcana?: number[];
  associatedElement?: string;
  coverGradient: string;
  icon: string;
  soundscapePresetId: string;
  description: string;
  affirmation: string;
  steps: {
    title: string;
    durationSeconds: number;
    guidance: string;
    instruction: string;
    breathPace?: { inhale: number; hold: number; exhale: number; pause: number };
  }[];
}

const GUIDED_MEDITATIONS: GuidedMeditation[] = [
  {
    id: 'anidra_heart_528',
    title: 'Активация Сакрального Сердца (Анахата)',
    subtitle: 'Раскрытие безусловной любви, прощение и исцеление сердечного центра',
    category: 'chakra',
    categoryLabel: 'Чакры & Любовь',
    durationMinutes: 15,
    frequency: '528 Гц (Частота Любви & ДНК)',
    recommendedArcana: [6, 14, 17, 21],
    associatedElement: 'Воздух',
    coverGradient: 'from-emerald-950 via-teal-900 to-black',
    icon: '💚',
    soundscapePresetId: 'solfeggio_528',
    description: 'Медитация растворяет застарелые обиды, снимает блок в грудном отделе и раскрывает мощный поток изумрудного света для привлечения гармоничных отношений.',
    affirmation: 'Мое сердце открыто миру. Я отпускаю прошлое с благодарностью и наполняюсь чистой безусловной любовью.',
    steps: [
      {
        title: '1. Заземление и Погружение в Тело',
        durationSeconds: 120,
        guidance: 'Примите удобное положение с прямой спиной. Закройте глаза. Почувствуйте опору под собой. Сделайте медленный глубокий вдох через нос, наполняя живот, и мягкий протяжный выдох через приоткрытый рот, отпуская все напряжение дня.',
        instruction: 'Глубокое дыхание животом, расслабление мышц лица и плеч.',
        breathPace: { inhale: 4, hold: 2, exhale: 6, pause: 2 }
      },
      {
        title: '2. Фокус в Центре Груди',
        durationSeconds: 180,
        guidance: 'Перенесите все свое внимание в середину грудной клетки — в духовное сердце Анахата. Представьте там мягкое мерцание изумрудно-зеленого кристалла. С каждым вдохом этот свет становится ярче, теплее и просторнее.',
        instruction: 'Ощутите физическое тепло и легкое расширение в груди.',
        breathPace: { inhale: 5, hold: 0, exhale: 5, pause: 0 }
      },
      {
        title: '3. Растворение Обид и Освобождение',
        durationSeconds: 240,
        guidance: 'Позвольте образам прошлых обид или боли плавно подняться на поверхность. Не судите их. Окружите каждый образ изумрудным светом прощения. Мысленно произнесите: «Я благодарю за опыт и отпускаю тебя навсегда».',
        instruction: 'Глубокий выдох с чувством облегчения и сброса тяжести.',
        breathPace: { inhale: 4, hold: 4, exhale: 6, pause: 2 }
      },
      {
        title: '4. Наполнение Волной 528 Гц',
        durationSeconds: 240,
        guidance: 'Почувствуйте, как сакральная вибрация 528 Гц вибрирует в каждой клетке. Изумрудный свет выходит за пределы тела, создавая защитный кокон любви и гармонии вокруг вашей ауры.',
        instruction: 'Ощущение невесомости, благодарности и глубокого покоя.',
        breathPace: { inhale: 5, hold: 2, exhale: 5, pause: 1 }
      },
      {
        title: '5. Закрепление и Интеграция',
        durationSeconds: 120,
        guidance: 'Сделайте глубокий вдох, сохраняя тепло в сердце. Мягко пошевелите пальцами рук и ног. Медленно откройте глаза с ощущением обновленности и внутренней силы.',
        instruction: 'Улыбка сердцем и мягкое возвращение в пространство.',
        breathPace: { inhale: 4, hold: 2, exhale: 4, pause: 2 }
      }
    ]
  },
  {
    id: 'karmic_tail_release',
    title: 'Очищение Кармического Хвоста и Уз',
    subtitle: 'Освобождение от клятв, обетов и чужих грузов прошлых воплощений',
    category: 'karma',
    categoryLabel: 'Карма & Прошлое',
    durationMinutes: 20,
    frequency: '432 Гц (Гармония Вселенной)',
    recommendedArcana: [8, 12, 13, 15, 16, 18],
    associatedElement: 'Огонь & Земля',
    coverGradient: 'from-amber-950 via-orange-950 to-black',
    icon: '📜',
    soundscapePresetId: 'tibetan_432',
    description: 'Глубокая трансформация кармических уроков души. Расторжение неосознанных договоров лишений, безденежья и одиночества, заложенных в кармическом хвосте матрицы.',
    affirmation: 'Я свободен(на) от старых клятв и долгов прошлого. Моя душа выбирает путь радости, света и изобилия здесь и сейчас.',
    steps: [
      {
        title: '1. Вход в Священное Пространство',
        durationSeconds: 180,
        guidance: 'Сделайте три очищающих вдоха. Представьте вокруг себя круг из мягкого фиолетового и золотого пламени. Это священное пространство абсолютной безопасности и защиты Высших Сил.',
        instruction: 'Защитный купол света вокруг вашего энергетического тела.',
        breathPace: { inhale: 4, hold: 4, exhale: 4, pause: 4 }
      },
      {
        title: '2. Проявление Кармических Нитей',
        durationSeconds: 240,
        guidance: 'Взгляните вниз, в область основания позвоночника и нижних арканов матрицы. Осознайте тонкие темные нити или тяжелые узы, связывающие вас со сценариями прошлого. Признайте их существование без страха.',
        instruction: 'Спокойное наблюдение за ощущениями в теле.',
        breathPace: { inhale: 4, hold: 2, exhale: 6, pause: 2 }
      },
      {
        title: '3. Расторжение Клятв и Обетов',
        durationSeconds: 300,
        guidance: 'Золотой луч Архангела Михаила и высших энергий касается этих нитей. Мысленно произнесите: «Властью моей бессмертной души я расторгаю все клятвы страданий, обесценивания и вины. Я возвращаю себе свою божественную силу».',
        instruction: 'Визуализация вспышки золотого света, растворяющего старые узы.',
        breathPace: { inhale: 5, hold: 3, exhale: 5, pause: 2 }
      },
      {
        title: '4. Заполнение Освобожденных Каналов Праной',
        durationSeconds: 300,
        guidance: 'На место старых уз вливается чистая хрустальная энергия исцеления. Все чакры выравниваются по центральной оси. Ваши родовые и кармические каналы наполняются силой предков.',
        instruction: 'Ощущение легкости в пояснице и прилива теплой энергии.',
        breathPace: { inhale: 5, hold: 2, exhale: 5, pause: 2 }
      },
      {
        title: '5. Запечатывание Аффирмацией Силы',
        durationSeconds: 180,
        guidance: 'Произнесите сакральную формулу: «Мой кармический хвост исцелен. Я иду в свое истинное предназначение с чистым сердцем». Глубокий вдох и мягкое возвращение.',
        instruction: 'Глубокий вдох, заземление ладоней к сердцу.',
        breathPace: { inhale: 4, hold: 2, exhale: 4, pause: 2 }
      }
    ]
  },
  {
    id: 'akashic_hall_journey',
    title: 'Врата в Хроники Акаши & Наставник',
    subtitle: 'Ченнелинг мудрости души и ответ на главный жизненный вопрос',
    category: 'akashic',
    categoryLabel: 'Хроники Акаши',
    durationMinutes: 25,
    frequency: '6 Гц Тета-Ритм (Транс & Сверхсознание)',
    recommendedArcana: [2, 5, 9, 17, 20],
    associatedElement: 'Эфир',
    coverGradient: 'from-purple-950 via-indigo-950 to-black',
    icon: '🔮',
    soundscapePresetId: 'deep_theta',
    description: 'Трансцендентное путешествие по тета-волнам в Храм Вечной Памяти. Открытие Книги Жизни и прямой контакт с духовными наставниками и высшим аспектом «Я».',
    affirmation: 'Я соединяюсь с источником вечной мудрости. Ответы на все вопросы уже живут внутри меня.',
    steps: [
      {
        title: '1. Погружение в Тета-Состояние',
        durationSeconds: 240,
        guidance: 'Под звуки бинауральных волн 6 Гц ваше тело становится тяжелым и расслабленным, а сознание — кристально ясным и невесомым. С каждым выдохом вы погружаетесь глубже в океан покоя.',
        instruction: 'Синхронизация полушарий мозга, глубокое мышечное расслабление.',
        breathPace: { inhale: 4, hold: 7, exhale: 8, pause: 0 }
      },
      {
        title: '2. Восхождение по Хрустальной Лестнице',
        durationSeconds: 300,
        guidance: 'Перед вами возникает сияющая лестница из чистого аметиста и хрусталя. С каждым шагом вверх вы оставляете суету материального мира. 10... 9... 8... Вы приближаетесь к вратам Хроник Акаши.',
        instruction: 'Ощущение парения и расширения границ сознания.',
        breathPace: { inhale: 4, hold: 4, exhale: 4, pause: 2 }
      },
      {
        title: '3. Вход в Храм и Книга Судьбы',
        durationSeconds: 360,
        guidance: 'Вы входите в величественный зал без стен и потолка, сотканный из золотистого света. Перед вами на постаменте лежит сияющий том — Книга вашей Души. Вас встречает ваш Духовный Хранитель.',
        instruction: 'Сформулируйте в мыслях один главный вопрос, волнующий вашу душу.',
        breathPace: { inhale: 5, hold: 2, exhale: 5, pause: 2 }
      },
      {
        title: '4. Получение Ответа и Ченнелинг',
        durationSeconds: 420,
        guidance: 'Хранитель открывает нужную страницу. Доверьтесь первому образу, слову, чувству или озарению, которое приходит. Примите этот дар без сомнений — это голос вашего высшего предназначения.',
        instruction: 'Тишина ума, чистое принятие сакрального послания.',
        breathPace: { inhale: 5, hold: 0, exhale: 5, pause: 0 }
      },
      {
        title: '5. Возвращение с Сакральным Даром',
        durationSeconds: 180,
        guidance: 'Поблагодарите Хранителя и Хроники Акаши. Поместите полученный ответ в свое сердце. Медленно спускайтесь обратно в физическое тело. Вы чувствуете ясность, покой и несокрушимую уверенность.',
        instruction: 'Мягкий вдох, заземление ступней о пол.',
        breathPace: { inhale: 4, hold: 2, exhale: 4, pause: 2 }
      }
    ]
  },
  {
    id: 'abundance_golden_flow',
    title: 'Золотой Поток Изобилия и Денежная Емкость',
    subtitle: 'Активация денежного канала и снятие блоков на принятие благ',
    category: 'abundance',
    categoryLabel: 'Деньги & Изобилие',
    durationMinutes: 15,
    frequency: '432 Гц & Золотое Сечение',
    recommendedArcana: [3, 4, 7, 10, 11, 19, 22],
    associatedElement: 'Земля & Огонь',
    coverGradient: 'from-amber-950 via-yellow-950 to-black',
    icon: '✨',
    soundscapePresetId: 'campfire_rain_birds',
    description: 'Медитация на расширение финансовой емкости, активацию 3-й чакры Манипура и пробитие финансовых потолков через энергию 10 (Колесо Фортуны) и 19 (Солнце) арканов.',
    affirmation: 'Я нахожусь в непрерывном потоке вселенского изобилия. Деньги приходят ко мне легко, радостно и на высшее благо.',
    steps: [
      {
        title: '1. Снятие Зажима в Челюсти и Диафрагме',
        durationSeconds: 120,
        guidance: 'Деньги — это расслабленная энергия. Расслабьте челюсти, язык, живот и плечи. Сбросьте напряжение контроля. Вселенная уже позаботилась обо всем необходимом.',
        instruction: 'Глубокий расслабленный выдох, освобождение диафрагмы.',
        breathPace: { inhale: 4, hold: 2, exhale: 6, pause: 2 }
      },
      {
        title: '2. Золотое Солнце в Манипуре',
        durationSeconds: 240,
        guidance: 'В области солнечного сплетения визуализируйте пылающее золотое солнце. Это ваш генератор материализации. Оно растет, наполняя вас уверенностью, достоинством и магнитной силой изобилия.',
        instruction: 'Ощутите плотность, силу и уверенность в животе.',
        breathPace: { inhale: 4, hold: 4, exhale: 4, pause: 2 }
      },
      {
        title: '3. Водопад Космического Золота',
        durationSeconds: 300,
        guidance: 'С неба на вашу макушку ниспадает непрерывный поток золотого сияния и благополучия. Он омывает все сферы вашей жизни: проекты, доходы, подарки судьбы и возможности.',
        instruction: 'Раскройте ладони вверх в жесте готовности принимать.',
        breathPace: { inhale: 5, hold: 2, exhale: 5, pause: 1 }
      },
      {
        title: '4. Расширение Энергетической Емкости',
        durationSeconds: 180,
        guidance: 'Представьте желаемую сумму или материальную цель. Почувствуйте, как легко и естественно вы владеете этим прямо сейчас, без чувства страха или долга. Ваша емкость безгранична.',
        instruction: 'Состояние благодарности так, будто все уже свершилось.',
        breathPace: { inhale: 4, hold: 2, exhale: 4, pause: 2 }
      },
      {
        title: '5. Якорение Состояния Богатства',
        durationSeconds: 60,
        guidance: 'Соедините большой и указательный пальцы обеих рук (чин-мудра). Заякорите это ощущение богатства и радости. Вы — магнит для лучших возможностей мира.',
        instruction: 'Глубокий вдох, улыбка и открытие глаз.',
        breathPace: { inhale: 4, hold: 2, exhale: 4, pause: 2 }
      }
    ]
  },
  {
    id: 'pranayama_4elements',
    title: 'Заземление и Наполнение Праной 4 Стихий',
    subtitle: 'Мгновенное центрирование, восстановление сил и снятие тревоги',
    category: 'grounding',
    categoryLabel: 'Пранаяма & Энергия',
    durationMinutes: 10,
    frequency: '432 Гц Дзен Природа',
    recommendedArcana: [1, 7, 11, 22],
    associatedElement: 'Земля, Вода, Огонь, Воздух',
    coverGradient: 'from-slate-950 via-emerald-950 to-black',
    icon: '🌿',
    soundscapePresetId: 'birds_forest',
    description: 'Экспресс-практика синхронизации четырех природных стихий в тонких телах. Снимает панику, расфокус и возвращает вас в точку кристальной силы.',
    affirmation: 'Я заземлен(а), защищен(а) и наполнен(а) вечной силой жизни. Я есть покой и нерушимая опора.',
    steps: [
      {
        title: '1. Стихия Земли — Корни Устойчивости',
        durationSeconds: 150,
        guidance: 'Почувствуйте стопы или основание тела. Представьте, как мощные золотые корни уходят глубоко в недра Земли. Вы непоколебимы, как древняя гора.',
        instruction: 'Ощущение веса, стабильности и физической защищенности.',
        breathPace: { inhale: 4, hold: 4, exhale: 4, pause: 4 }
      },
      {
        title: '2. Стихия Воды — Текучесть и Очищение',
        durationSeconds: 150,
        guidance: 'Хрустальный горный поток омывает ваше тело сверху донизу, унося весь осадок чужих мыслей, усталость и токсины вглубь Земли на переработку.',
        instruction: 'Ощущение свежести, гибкости и эмоционального освобождения.',
        breathPace: { inhale: 4, hold: 2, exhale: 6, pause: 2 }
      },
      {
        title: '3. Стихия Огня — Трансформация и Воля',
        durationSeconds: 150,
        guidance: 'Вдохните тепло костра. Внутренний огонь сжигает последние остатки сомнений и страха, зажигая искру смелости и радости жизни.',
        instruction: 'Ощущение тепла в груди и прилива активной бодрости.',
        breathPace: { inhale: 5, hold: 2, exhale: 4, pause: 1 }
      },
      {
        title: '4. Стихия Воздуха — Свобода и Полет',
        durationSeconds: 150,
        guidance: 'Вдохните свежий утренний ветер с ароматом сосен. Ваш ум становится чистым, как горное небо. Вы в балансе, силе и гармонии.',
        instruction: 'Полный гармоничный вдох и легкий выдох.',
        breathPace: { inhale: 4, hold: 2, exhale: 4, pause: 2 }
      }
    ]
  },
  {
    id: 'yoga_nidra_theta_sleep',
    title: 'Йога-Нидра: Тета-Сон и Исцеление Нервной Системы',
    subtitle: 'Квантовое расслабление, перезагрузка психики и глубокий восстановительный сон',
    category: 'sleep',
    categoryLabel: 'Сон & Восстановление',
    durationMinutes: 30,
    frequency: '6 Гц Тета + Ночной Дождь',
    recommendedArcana: [2, 9, 12, 18],
    associatedElement: 'Вода & Эфир',
    coverGradient: 'from-blue-950 via-slate-950 to-black',
    icon: '🌙',
    soundscapePresetId: 'campfire_rain',
    description: 'Древняя практика осознанного расслабления на грани сна и бодрствования. Один час Йога-Нидры заменяет 4 часа полноценного сна, исцеляя выгорание и стресс.',
    affirmation: 'Мое тело отдыхает и регенерирует. Я доверяю ночи и погружаюсь в целебный целительный сон.',
    steps: [
      {
        title: '1. Санкальпа (Сакральное Намерение)',
        durationSeconds: 180,
        guidance: 'Лягте на спину в шавасану. Сформулируйте короткое позитивное намерение в настоящем времени: «Я абсолютно здоров(а) и счастлив(а)» или «Мое тело исцеляется».',
        instruction: 'Мысленно повторите намерение три раза с глубокой верой.',
        breathPace: { inhale: 4, hold: 0, exhale: 6, pause: 2 }
      },
      {
        title: '2. Ротация Сознания по Телу',
        durationSeconds: 480,
        guidance: 'Переносите внимание вслед за звуком: большой палец правой руки... ладонь... запястье... локоть... плечо... правый бок... таз... бедро... стопа. Переход на левую сторону... затем спина... живот... грудь... лицо... все тело целиком.',
        instruction: 'Не двигайтесь, просто касайтесь вниманием каждой точки.',
        breathPace: { inhale: 4, hold: 0, exhale: 6, pause: 0 }
      },
      {
        title: '3. Осознание Противоположностей',
        durationSeconds: 420,
        guidance: 'Ощутите тело невероятно тяжелым, будто оно врастает в кровать... А теперь почувствуйте его легким, как перышко, парящее в воздухе... Почувствуйте холод... и мягкое согревающее тепло.',
        instruction: 'Балансировка симпатической и парасимпатической нервной системы.',
        breathPace: { inhale: 4, hold: 0, exhale: 6, pause: 2 }
      },
      {
        title: '4. Пространство Читтакаша & Погружение',
        durationSeconds: 540,
        guidance: 'Вглядитесь в темный экран перед закрытыми глазами — священное пространство Читтакаша. Вы растворяетесь в уютных каплях ночного дождя и шепоте звезд. Вы в безопасности.',
        instruction: 'Плавный переход в целительный сон или глубочайший тета-транс.',
        breathPace: { inhale: 4, hold: 0, exhale: 6, pause: 0 }
      },
      {
        title: '5. Завершение или Переход в Ночной Сон',
        durationSeconds: 180,
        guidance: 'Если вы медитируете днем — сделайте глубокий вдох и медленно потянитесь. Если вы готовитесь ко сну — просто отпустите все мысли и засыпайте под шум дождя.',
        instruction: 'Глубокий покой и восстановление всех ресурсов организма.',
        breathPace: { inhale: 4, hold: 0, exhale: 6, pause: 0 }
      }
    ]
  }
];

export const MeditationCenter: React.FC<MeditationCenterProps> = ({
  userInput,
  matrix,
  onNavigateToMatrix,
  onNavigateToChakras
}) => {
  // Navigation tabs within Meditation Center
  const [activeSubTab, setActiveSubTab] = useState<'soundscapes' | 'guided' | 'breathing'>('guided');

  // Soundscape state
  const [isPlayingSoundscape, setIsPlayingSoundscape] = useState(false);
  const [activeSoundscapeId, setActiveSoundscapeId] = useState<string>('campfire_rain_birds');
  const [fireVol, setFireVol] = useState(80);
  const [rainVol, setRainVol] = useState(65);
  const [birdsVol, setBirdsVol] = useState(75);
  const [melodyVol, setMelodyVol] = useState(30);
  const [tibetanVol, setTibetanVol] = useState(0);
  const [solfeggioVol, setSolfeggioVol] = useState(0);
  const [thetaVol, setThetaVol] = useState(0);
  const [windVol, setWindVol] = useState(25);
  const [masterVol, setMasterVol] = useState(80);
  const [soundscapeTimer, setSoundscapeTimer] = useState<number | null>(null);
  const [showMixer, setShowMixer] = useState(false);

  // Guided Meditation session state
  const [selectedMeditation, setSelectedMeditation] = useState<GuidedMeditation>(GUIDED_MEDITATIONS[0]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepRemainingSeconds, setStepRemainingSeconds] = useState(0);
  const [totalSessionSeconds, setTotalSessionSeconds] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [voiceNarrationEnabled, setVoiceNarrationEnabled] = useState(true);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);
  const [totalMinutesMeditated, setTotalMinutesMeditated] = useState(0);

  // Breathing Box / Prana Guide state
  const [breathingPattern, setBreathingPattern] = useState<'box' | 'relax' | 'coherent' | 'energize'>('box');
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breathCount, setBreathCount] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  // Timer interval references
  const sessionTimerRef = useRef<number | null>(null);
  const breathingTimerRef = useRef<number | null>(null);

  // Speech synthesis reference
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load history/stats from localStorage
  useEffect(() => {
    try {
      const stats = localStorage.getItem('chubuk_meditation_stats');
      if (stats) {
        const parsed = JSON.parse(stats);
        setCompletedSessionsCount(parsed.sessions || 0);
        setTotalMinutesMeditated(parsed.minutes || 0);
      }
    } catch (e) {}
  }, []);

  // Sync ambient sound state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const state = ambientSound.getState();
      setIsPlayingSoundscape(state.isPlaying);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Guided Meditation Step Timer Loop
  useEffect(() => {
    if (isSessionActive && !isSessionPaused && !sessionCompleted) {
      sessionTimerRef.current = window.setInterval(() => {
        setStepRemainingSeconds(prev => {
          if (prev <= 1) {
            // Advance to next step
            if (currentStepIndex < selectedMeditation.steps.length - 1) {
              const nextIndex = currentStepIndex + 1;
              setCurrentStepIndex(nextIndex);
              const nextStepDuration = selectedMeditation.steps[nextIndex].durationSeconds;
              // Speak step guidance if enabled
              speakGuidance(selectedMeditation.steps[nextIndex].guidance);
              return nextStepDuration;
            } else {
              // Session Finished!
              handleFinishSession();
              return 0;
            }
          }
          return prev - 1;
        });

        setTotalSessionSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [isSessionActive, isSessionPaused, currentStepIndex, selectedMeditation, sessionCompleted]);

  // Breathing Box Timer Loop
  useEffect(() => {
    if (!isBreathingActive) {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
      return;
    }

    const getPatternConfig = () => {
      switch (breathingPattern) {
        case 'box': return { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };
        case 'relax': return { inhale: 4, hold1: 7, exhale: 8, hold2: 0 };
        case 'coherent': return { inhale: 5, hold1: 0, exhale: 5, hold2: 0 };
        case 'energize': return { inhale: 4, hold1: 2, exhale: 4, hold2: 2 };
      }
    };

    const cfg = getPatternConfig();

    breathingTimerRef.current = window.setInterval(() => {
      setBreathCount(prev => {
        if (prev <= 1) {
          // Switch phase
          if (breathPhase === 'inhale') {
            if (cfg.hold1 > 0) {
              setBreathPhase('hold1');
              return cfg.hold1;
            } else {
              setBreathPhase('exhale');
              return cfg.exhale;
            }
          } else if (breathPhase === 'hold1') {
            setBreathPhase('exhale');
            return cfg.exhale;
          } else if (breathPhase === 'exhale') {
            if (cfg.hold2 > 0) {
              setBreathPhase('hold2');
              return cfg.hold2;
            } else {
              setCompletedCycles(c => c + 1);
              setBreathPhase('inhale');
              return cfg.inhale;
            }
          } else {
            // hold2 -> inhale
            setCompletedCycles(c => c + 1);
            setBreathPhase('inhale');
            return cfg.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };
  }, [isBreathingActive, breathPhase, breathingPattern]);

  // Speech Narration helper
  const speakGuidance = (text: string) => {
    if (!voiceNarrationEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Calming, slow pace
      utterance.pitch = 0.95;
      utterance.lang = 'ru-RU';
      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore
    }
  };

  const stopGuidanceSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Start Guided Session
  const handleStartSession = (meditation: GuidedMeditation) => {
    setSelectedMeditation(meditation);
    setCurrentStepIndex(0);
    setStepRemainingSeconds(meditation.steps[0].durationSeconds);
    setTotalSessionSeconds(0);
    setSessionCompleted(false);
    setIsSessionActive(true);
    setIsSessionPaused(false);

    // Apply matching soundscape preset automatically!
    const preset = SOUNDSCAPE_PRESETS.find(p => p.id === meditation.soundscapePresetId) || SOUNDSCAPE_PRESETS[0];
    ambientSound.applyPreset(preset);
    ambientSound.setMasterVolume(0.75);
    ambientSound.start();
    setIsPlayingSoundscape(true);
    setActiveSoundscapeId(preset.id);

    // Speak first step
    speakGuidance(meditation.steps[0].guidance);
  };

  const handlePauseResumeSession = () => {
    if (isSessionPaused) {
      setIsSessionPaused(false);
      ambientSound.start();
      setIsPlayingSoundscape(true);
      speakGuidance(selectedMeditation.steps[currentStepIndex].guidance);
    } else {
      setIsSessionPaused(true);
      ambientSound.stop();
      setIsPlayingSoundscape(false);
      stopGuidanceSpeech();
    }
  };

  const handleStopSession = () => {
    setIsSessionActive(false);
    setIsSessionPaused(false);
    setSessionCompleted(false);
    stopGuidanceSpeech();
  };

  const handleFinishSession = () => {
    setIsSessionActive(false);
    setSessionCompleted(true);
    stopGuidanceSpeech();

    // Soft finish chime / celebration
    const sessionMins = Math.max(1, Math.round(totalSessionSeconds / 60));
    const newSessions = completedSessionsCount + 1;
    const newMinutes = totalMinutesMeditated + sessionMins;
    setCompletedSessionsCount(newSessions);
    setTotalMinutesMeditated(newMinutes);

    try {
      localStorage.setItem('chubuk_meditation_stats', JSON.stringify({
        sessions: newSessions,
        minutes: newMinutes,
        lastCompleted: Date.now(),
        lastMeditationTitle: selectedMeditation.title
      }));
    } catch (e) {}
  };

  const handleNextStep = () => {
    if (currentStepIndex < selectedMeditation.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setStepRemainingSeconds(selectedMeditation.steps[nextIndex].durationSeconds);
      speakGuidance(selectedMeditation.steps[nextIndex].guidance);
    } else {
      handleFinishSession();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setStepRemainingSeconds(selectedMeditation.steps[prevIndex].durationSeconds);
      speakGuidance(selectedMeditation.steps[prevIndex].guidance);
    }
  };

  // Soundscape Play/Pause
  const handleToggleSoundscape = () => {
    if (isPlayingSoundscape) {
      ambientSound.stop();
      setIsPlayingSoundscape(false);
    } else {
      ambientSound.setMasterVolume(masterVol / 100);
      ambientSound.start();
      setIsPlayingSoundscape(true);
    }
  };

  const handleSelectSoundscapePreset = (preset: SoundscapePreset) => {
    setActiveSoundscapeId(preset.id);
    setFireVol(preset.fire);
    setRainVol(preset.rain);
    setBirdsVol(preset.birds || 0);
    setMelodyVol(preset.melody || 0);
    setTibetanVol(preset.tibetan432);
    setSolfeggioVol(preset.solfeggio528);
    setThetaVol(preset.thetaWaves);
    setWindVol(preset.wind);

    ambientSound.applyPreset(preset);

    if (!isPlayingSoundscape) {
      ambientSound.setMasterVolume(masterVol / 100);
      ambientSound.start();
      setIsPlayingSoundscape(true);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate arcana personal affinity
  const userCentralArcana = matrix?.center;
  const recommendedForUser = GUIDED_MEDITATIONS.filter(m => 
    userCentralArcana ? m.recommendedArcana?.includes(userCentralArcana) : false
  );

  return (
    <div className="w-full max-w-5xl space-y-6 animate-fade-in text-slate-100">
      {/* Top Hero Banner & Meditation Center Identity */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#13111f] via-[#090b14] to-[#04060d] p-6 sm:p-8 shadow-2xl">
        {/* Glow ambient spots */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold">
              <Sparkles size={14} className="text-amber-400" />
              <span>Сакральный Храм Звука и Духа 432 / 528 Гц</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-white">
              Медитационный <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600">Центр</span>
            </h2>

            <p className="text-sm text-slate-300 font-light leading-relaxed">
              Погрузитесь в целебные звуковые ландшафты живой природы, сакральные частоты Сольфеджио и пошаговые духовные медитации для раскрытия сердечного центра, очищения кармы и перезагрузки сознания.
            </p>
          </div>

          {/* Stats Badge */}
          <div className="flex items-center gap-3 bg-black/50 border border-white/10 p-3.5 rounded-2xl shrink-0 backdrop-blur-md">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/40">
              🧘
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white font-mono">{totalMinutesMeditated}</span>
                <span className="text-xs text-slate-400 font-serif">мин практики</span>
              </div>
              <p className="text-[11px] text-amber-300 font-medium">
                {completedSessionsCount} {completedSessionsCount === 1 ? 'сессия завершена' : 'сессий завершено'}
              </p>
            </div>
          </div>
        </div>

        {/* Personalized Matrix Arcana Resonance Note if calculated */}
        {userInput && matrix && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>
                Профиль: <strong className="text-amber-300">{userInput.name}</strong> • Центральный аркан души: <strong className="text-amber-300">{matrix.center} Аркан</strong>
              </span>
            </div>

            {recommendedForUser.length > 0 && (
              <button
                onClick={() => {
                  setSelectedMeditation(recommendedForUser[0]);
                  setActiveSubTab('guided');
                }}
                className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-serif font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Sparkle size={13} />
                <span>Рекомендовано для вашего {matrix.center} Аркана</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main 3-Way Sub-Navigation Tabs */}
      <div className="flex items-center justify-center p-1.5 rounded-2xl bg-[#080d1a] border border-amber-500/20 max-w-md mx-auto shadow-lg">
        <button
          onClick={() => setActiveSubTab('guided')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'guided'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={14} />
          <span>Духовные Медитации</span>
        </button>

        <button
          onClick={() => setActiveSubTab('soundscapes')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'soundscapes'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame size={14} />
          <span>Звуковые Ландшафты</span>
        </button>

        <button
          onClick={() => setActiveSubTab('breathing')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'breathing'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wind size={14} />
          <span>Пранаяма</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. GUIDED SPIRITUAL MEDITATIONS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'guided' && (
        <div className="space-y-6">
          {/* Active Session Player Modal / Full Screen Stage */}
          <AnimatePresence>
            {isSessionActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="relative overflow-hidden rounded-3xl border-2 border-amber-500/50 bg-gradient-to-b from-[#180f1a] via-[#0d0912] to-[#040306] p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-6"
              >
                {/* Visual Ambient Mandala Rings Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-96 h-96 rounded-full border border-amber-500 animate-spin" style={{ animationDuration: '40s' }} />
                  <div className="absolute w-72 h-72 rounded-full border border-purple-500 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
                  <div className="absolute w-48 h-48 rounded-full border border-emerald-500 animate-pulse" />
                </div>

                {/* Session Header */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30">
                      {selectedMeditation.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                        {selectedMeditation.categoryLabel} • {selectedMeditation.frequency}
                      </span>
                      <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                        {selectedMeditation.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Voice narration toggle */}
                    <button
                      onClick={() => {
                        const next = !voiceNarrationEnabled;
                        setVoiceNarrationEnabled(next);
                        if (!next) stopGuidanceSpeech();
                        else speakGuidance(selectedMeditation.steps[currentStepIndex].guidance);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        voiceNarrationEnabled
                          ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                      title="Голосовое сопровождение наставника"
                    >
                      <Mic size={14} className={voiceNarrationEnabled ? 'text-purple-400' : ''} />
                      <span className="hidden sm:inline">Голос наставника: {voiceNarrationEnabled ? 'ВКЛ' : 'ВЫКЛ'}</span>
                    </button>

                    <button
                      onClick={handleStopSession}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-serif font-bold transition-all cursor-pointer"
                    >
                      Завершить
                    </button>
                  </div>
                </div>

                {/* Central Visual Focus & Breathing Mandala */}
                <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center space-y-4">
                  {/* Glowing step indicator circle */}
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-emerald-500/20 blur-xl animate-pulse" />
                    <div className="w-full h-full rounded-full border-2 border-amber-500/30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md shadow-inner">
                      <span className="text-3xl sm:text-4xl font-mono font-bold text-amber-300">
                        {formatTime(stepRemainingSeconds)}
                      </span>
                      <span className="text-[11px] font-serif text-slate-400 mt-1">
                        Шаг {currentStepIndex + 1} из {selectedMeditation.steps.length}
                      </span>
                    </div>
                  </div>

                  {/* Step Title & Instruction */}
                  <div className="max-w-xl space-y-2">
                    <h4 className="text-base sm:text-lg font-serif font-bold text-amber-200">
                      {selectedMeditation.steps[currentStepIndex].title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light bg-black/40 p-4 rounded-2xl border border-white/5">
                      «{selectedMeditation.steps[currentStepIndex].guidance}»
                    </p>
                    <p className="text-[11px] text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={13} />
                      <span>{selectedMeditation.steps[currentStepIndex].instruction}</span>
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 relative z-10">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Общее время: {formatTime(totalSessionSeconds)}</span>
                    <span>План: {selectedMeditation.durationMinutes} мин</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, ((currentStepIndex + 1) / selectedMeditation.steps.length) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Session Player Controls */}
                <div className="relative z-10 flex items-center justify-between pt-2">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStepIndex === 0}
                    className={`flex items-center gap-1 px-3.5 py-2 rounded-xl border text-xs font-serif font-bold transition-all cursor-pointer ${
                      currentStepIndex === 0 ? 'opacity-30 border-white/5 cursor-not-allowed' : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <ChevronLeft size={16} />
                    <span>Назад</span>
                  </button>

                  <button
                    onClick={handlePauseResumeSession}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-serif font-black text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    {isSessionPaused ? <Play size={18} /> : <Pause size={18} />}
                    <span>{isSessionPaused ? 'Продолжить' : 'Пауза'}</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-serif font-bold transition-all cursor-pointer"
                  >
                    <span>{currentStepIndex === selectedMeditation.steps.length - 1 ? 'Завершить' : 'Вперед'}</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Session Completed Celebration Card */}
          {sessionCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-black/80 text-center space-y-4 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center text-3xl shadow-lg">
                ✨
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-white">Практика Успешно Завершена!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Ваше биополе сгармонизировано, тонкие тела наполнены светом, а ум пребывает в состоянии чистого спокойствия.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 max-w-md mx-auto">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block mb-1">
                  Сакральная Аффирмация Дня:
                </span>
                <p className="text-xs font-serif text-amber-200 italic">
                  «{selectedMeditation.affirmation}»
                </p>
              </div>

              <button
                onClick={() => setSessionCompleted(false)}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-serif font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Вернуться к списку медитаций
              </button>
            </motion.div>
          )}

          {/* Guided Meditations Catalog Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {GUIDED_MEDITATIONS.map((meditation) => {
              const isRecommended = userCentralArcana && meditation.recommendedArcana?.includes(userCentralArcana);
              return (
                <div
                  key={meditation.id}
                  className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4 bg-gradient-to-b ${meditation.coverGradient} shadow-xl hover:border-amber-500/50 ${
                    selectedMeditation.id === meditation.id ? 'border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'border-white/10'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="text-2xl p-2.5 rounded-2xl bg-black/40 border border-white/10">
                          {meditation.icon}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                            {meditation.categoryLabel}
                          </span>
                          <h3 className="font-serif font-bold text-base text-white">
                            {meditation.title}
                          </h3>
                        </div>
                      </div>

                      {isRecommended && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-serif font-bold shrink-0">
                          🌟 Резонанс {userCentralArcana} Аркана
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 font-light leading-relaxed">
                      {meditation.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-black/40 border border-white/5 text-amber-200">
                        ⏱️ {meditation.durationMinutes} минут
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-black/40 border border-white/5 text-purple-300">
                        ⚡ {meditation.frequency}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-black/40 border border-white/5 text-emerald-300">
                        🌿 {meditation.steps.length} ступеней
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-slate-400 italic truncate max-w-[200px]">
                      «{meditation.affirmation}»
                    </div>

                    <button
                      onClick={() => handleStartSession(meditation)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-serif font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <Play size={14} className="fill-black" />
                      <span>Начать практику</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. AMBIENT SOUNDSCAPES & FREQUENCY STUDIO TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'soundscapes' && (
        <div className="space-y-6">
          {/* Main Soundboard Player Stage */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#160f0b] via-[#0e0a08] to-[#050302] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border transition-all ${
                  isPlayingSoundscape
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
                    : 'bg-black/50 border-white/10 text-slate-400'
                }`}>
                  <Flame size={24} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Процедурный Синтезатор Природы & 432 / 528 Гц
                  </h3>
                  <p className="text-xs text-slate-400">
                    Настоящий Web Audio генератор без пауз и задержек. Работает в фоне и офлайн.
                  </p>
                </div>
              </div>

              {/* Master Play Button */}
              <button
                onClick={handleToggleSoundscape}
                className={`px-6 py-2.5 rounded-2xl font-serif font-black text-sm flex items-center gap-2 shadow-xl transition-all cursor-pointer ${
                  isPlayingSoundscape
                    ? 'bg-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.5)]'
                    : 'bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:brightness-110'
                }`}
              >
                {isPlayingSoundscape ? <Pause size={18} /> : <Play size={18} />}
                <span>{isPlayingSoundscape ? 'Приостановить' : 'Включить Звук'}</span>
              </button>
            </div>

            {/* Soundscape Presets Carousel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-bold uppercase tracking-wider text-amber-300">
                  Готовые Сакральные Пресеты:
                </span>
                <button
                  onClick={() => setShowMixer(!showMixer)}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-serif font-medium text-[11px]"
                >
                  <Sliders size={12} />
                  <span>{showMixer ? 'Скрыть микшер слоев' : 'Настроить микшер слоев'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {SOUNDSCAPE_PRESETS.map((preset) => {
                  const isCurrent = activeSoundscapeId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectSoundscapePreset(preset)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                        isCurrent
                          ? 'bg-gradient-to-r from-amber-500/25 to-amber-950/40 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10'
                          : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">
                          {preset.id.includes('fire') ? '🔥' : preset.id.includes('birds') ? '🐦' : preset.id.includes('tibetan') ? '🔔' : preset.id.includes('solfeggio') ? '💚' : '🌙'}
                        </span>
                        <span className="text-xs font-serif font-bold truncate">{preset.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Multichannel Volume Sliders Mixer */}
            <div className={`space-y-4 bg-black/50 p-5 rounded-2xl border border-white/10 ${showMixer ? 'block' : 'hidden sm:block'}`}>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Индивидуальное микширование слоев:
              </span>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* 1. Fire */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-amber-200">
                    <span className="flex items-center gap-1.5"><Flame size={13} className="text-amber-400" /> Живой костер и треск</span>
                    <span className="font-mono text-[11px]">{fireVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={fireVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setFireVol(v);
                      ambientSound.setFireVolume(v / 100);
                    }}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 2. Rain */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-blue-200">
                    <span className="flex items-center gap-1.5"><CloudRain size={13} className="text-blue-400" /> Шум вечернего дождя</span>
                    <span className="font-mono text-[11px]">{rainVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rainVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setRainVol(v);
                      ambientSound.setRainVolume(v / 100);
                    }}
                    className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 3. Forest Birds */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-emerald-200">
                    <span className="flex items-center gap-1.5">🐦 Пение птиц в лесу</span>
                    <span className="font-mono text-[11px]">{birdsVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={birdsVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setBirdsVol(v);
                      ambientSound.setBirdsVolume(v / 100);
                    }}
                    className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 4. Zen Harps & Melodies */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-amber-300">
                    <span className="flex items-center gap-1.5">✨ Дзен-арфа & колокольчики 432 Гц</span>
                    <span className="font-mono text-[11px]">{melodyVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={melodyVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMelodyVol(v);
                      ambientSound.setMelodyVolume(v / 100);
                    }}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 5. Tibetan 432Hz */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-purple-200">
                    <span className="flex items-center gap-1.5"><Sparkles size={13} className="text-purple-400" /> Тибетские чаши 432 Гц</span>
                    <span className="font-mono text-[11px]">{tibetanVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tibetanVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setTibetanVol(v);
                      ambientSound.setTibetanVolume(v / 100);
                    }}
                    className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 6. Solfeggio 528Hz */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-rose-200">
                    <span className="flex items-center gap-1.5"><Heart size={13} className="text-rose-400" /> Сольфеджио Любви 528 Гц</span>
                    <span className="font-mono text-[11px]">{solfeggioVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={solfeggioVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSolfeggioVol(v);
                      ambientSound.setSolfeggioVolume(v / 100);
                    }}
                    className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 7. Theta Waves 6Hz */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-cyan-200">
                    <span className="flex items-center gap-1.5"><Moon size={13} className="text-cyan-400" /> Бинауральная Тета 6 Гц</span>
                    <span className="font-mono text-[11px]">{thetaVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={thetaVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setThetaVol(v);
                      ambientSound.setThetaVolume(v / 100);
                    }}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 8. Wind */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-emerald-200">
                    <span className="flex items-center gap-1.5"><Wind size={13} className="text-emerald-400" /> Ветер в соснах</span>
                    <span className="font-mono text-[11px]">{windVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={windVol}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setWindVol(v);
                      ambientSound.setWindVolume(v / 100);
                    }}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Master Volume */}
              <div className="pt-3 border-t border-white/10 space-y-1">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5"><Volume2 size={15} className="text-amber-400" /> Общий мастер звука</span>
                  <span className="font-mono">{masterVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVol}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setMasterVol(v);
                    ambientSound.setMasterVolume(v / 100);
                  }}
                  className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Timer controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-serif">
                <Clock size={14} className="text-amber-400" />
                <span>Автовыключение звука через:</span>
              </div>

              <div className="flex items-center gap-1.5">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setSoundscapeTimer(mins);
                      ambientSound.setTimer(mins);
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                      soundscapeTimer === mins
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mins} мин
                  </button>
                ))}
                {soundscapeTimer && (
                  <button
                    onClick={() => {
                      setSoundscapeTimer(null);
                      ambientSound.setTimer(null);
                    }}
                    className="px-2 py-1 text-slate-500 hover:text-red-400 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PRANAYAMA & SACRED BREATHING STUDIO TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'breathing' && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#0e1724] via-[#080d16] to-[#04060b] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  <Wind size={24} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Сакральная Пранаяма & Когерентность Сердца
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ритмическое дыхание гармонизирует вегетативную нервную систему за 3 минуты
                  </p>
                </div>
              </div>

              {/* Pattern Selector */}
              <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                {[
                  { id: 'box', label: '4-4-4-4 Квадрат', desc: 'Снятие стресса' },
                  { id: 'relax', label: '4-7-8 Релакс', desc: 'Глубокий сон' },
                  { id: 'coherent', label: '5-5 Когерентность', desc: 'Баланс сердца' },
                  { id: 'energize', label: '4-2-4-2 Прана', desc: 'Энергия дня' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setBreathingPattern(p.id as any);
                      setBreathPhase('inhale');
                      setBreathCount(4);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                      breathingPattern === p.id
                        ? 'bg-cyan-500 text-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Animated Breathing Sphere Visualizer */}
            <div className="py-12 flex flex-col items-center justify-center space-y-6">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                {/* Expanding / Pulsing Sphere based on phase */}
                <motion.div
                  animate={{
                    scale: breathPhase === 'inhale' ? 1.35 : breathPhase === 'hold1' ? 1.35 : breathPhase === 'exhale' ? 0.75 : 0.75,
                    opacity: isBreathingActive ? 0.85 : 0.3
                  }}
                  transition={{
                    duration: breathPhase === 'inhale' ? 4 : breathPhase === 'exhale' ? (breathingPattern === 'relax' ? 8 : 4) : 0.5,
                    ease: 'easeInOut'
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/30 via-emerald-500/20 to-purple-500/30 blur-2xl pointer-events-none"
                />

                {/* Inner Breathing Ring */}
                <motion.div
                  animate={{
                    scale: breathPhase === 'inhale' ? 1.25 : breathPhase === 'hold1' ? 1.25 : breathPhase === 'exhale' ? 0.8 : 0.8,
                    borderColor: breathPhase === 'inhale' ? '#06b6d4' : breathPhase === 'hold1' ? '#a855f7' : breathPhase === 'exhale' ? '#10b981' : '#f59e0b'
                  }}
                  transition={{
                    duration: breathPhase === 'inhale' ? 4 : breathPhase === 'exhale' ? (breathingPattern === 'relax' ? 8 : 4) : 0.5,
                    ease: 'easeInOut'
                  }}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xl shadow-2xl relative z-10"
                >
                  <span className="text-xs uppercase font-serif font-black tracking-widest text-slate-300 mb-1">
                    {breathPhase === 'inhale' ? 'Вдох' : breathPhase === 'hold1' ? 'Задержка' : breathPhase === 'exhale' ? 'Выдох' : 'Пауза'}
                  </span>

                  <span className="text-4xl sm:text-5xl font-mono font-black text-cyan-300">
                    {isBreathingActive ? breathCount : '—'}
                  </span>

                  <span className="text-[10px] font-mono text-slate-400 mt-2">
                    Циклов: {completedCycles}
                  </span>
                </motion.div>
              </div>

              {/* Start / Stop Button */}
              <button
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className={`px-8 py-3 rounded-2xl font-serif font-bold text-sm shadow-xl transition-all cursor-pointer flex items-center gap-2 ${
                  isBreathingActive
                    ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                    : 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:brightness-110'
                }`}
              >
                {isBreathingActive ? <Pause size={18} /> : <Play size={18} />}
                <span>{isBreathingActive ? 'Остановить дыхание' : 'Начать дыхательную практику'}</span>
              </button>
            </div>

            {/* Pattern Guidance Explanation Card */}
            <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="font-serif font-bold text-cyan-300 block">🟦 Квадрат Самавритти</span>
                <p className="text-[11px] text-slate-400">
                  Равные пропорции вдоха и задержек приводят полушария мозга в совершенное равновесие.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="font-serif font-bold text-purple-300 block">🌙 4-7-8 Доктора Вейла</span>
                <p className="text-[11px] text-slate-400">
                  Удлиненный выдох на 8 счетов активирует блуждающий нерв и быстро успокаивает пульс.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="font-serif font-bold text-emerald-300 block">💚 Когерентность 5-5</span>
                <p className="text-[11px] text-slate-400">
                  6 циклов в минуту синхронизируют ритм сердца и дыхания для эмоциональной стабильности.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationCenter;
