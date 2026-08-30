/**
 * Chubuk Kombat - Сакральная Карма-Тапалка
 * Игровая логика, пассивный майнинг, карты прокачки, комбо дня и звуки
 */

export interface UpgradeCard {
  id: string;
  title: string;
  category: 'practices' | 'artifacts' | 'infrastructure' | 'special';
  description: string;
  baseCost: number;
  costMultiplier: number;
  baseProfitPerHour: number;
  profitMultiplier: number;
  icon: string;
  requiredLevel: number;
  unlockConditionText?: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: string;
  category: 'social' | 'activity' | 'daily';
  actionUrl?: string;
  targetCount?: number;
}

export interface RankLevel {
  level: number;
  title: string;
  arcanaType: string;
  requiredCoins: number;
  icon: string;
  cardImage: string;
  auraColor: string;
  badge: string;
  description: string;
}

export interface TapperGameState {
  coins: number;
  totalEarned: number;
  profitPerHour: number;
  energy: number;
  maxEnergy: number;
  tapPower: number;
  level: number;
  lastEarnTimestamp: number;
  cards: Record<string, number>; // cardId -> level
  completedQuests: string[];
  dailyCheckinStreak: number;
  lastCheckinDate: string; // YYYY-MM-DD
  dailyComboFound: string[];
  dailyComboClaimedDate: string;
  dailyCipherSolvedDate: string;
  fullEnergyBoostsLeft: number;
  turboBoostsLeft: number;
  lastBoostDate: string;
  walletAddress: string | null;
  tapStats: {
    totalTaps: number;
    todayTaps: number;
  };
  // Permanent Click & Energy Upgrades
  multitapLevel: number;
  energyLimitLevel: number;
  rechargeSpeedLevel: number;
  autoBotLevel: number;
}

export const RANKS: RankLevel[] = [
  { 
    level: 1, 
    title: 'Туз Пентаклей', 
    arcanaType: 'Младший Аркан • Стихия Земли',
    requiredCoins: 0, 
    icon: '🪙', 
    cardImage: '🃏',
    auraColor: 'from-amber-700/40 to-slate-900', 
    badge: 'Младший Аркан',
    description: 'Первородный импульс материализации, семя изобилия и начало пути к богатству.'
  },
  { 
    level: 2, 
    title: 'Рыцарь Жезлов', 
    arcanaType: 'Младший Аркан • Стихия Огня',
    requiredCoins: 5_000, 
    icon: '🔥', 
    cardImage: '🏇',
    auraColor: 'from-amber-600/40 to-slate-900', 
    badge: 'Младший Аркан',
    description: 'Огненная страсть, стремительный прорыв сквозь препятствия и набор скорости майнинга.'
  },
  { 
    level: 3, 
    title: 'Королева Кубков', 
    arcanaType: 'Младший Аркан • Стихия Воды',
    requiredCoins: 25_000, 
    icon: '🏆', 
    cardImage: '👑',
    auraColor: 'from-cyan-600/40 to-slate-900', 
    badge: 'Младший Аркан',
    description: 'Глубинная интуиция, эмоциональная гармония и раскрытие внутренних сакральных чувств.'
  },
  { 
    level: 4, 
    title: 'Король Мечей', 
    arcanaType: 'Младший Аркан • Стихия Воздуха',
    requiredCoins: 100_000, 
    icon: '⚔️', 
    cardImage: '🤴',
    auraColor: 'from-sky-500/40 to-slate-900', 
    badge: 'Младший Аркан',
    description: 'Абсолютная ясность разума, стратегический контроль судьбы и непоколебимая воля.'
  },
  { 
    level: 5, 
    title: 'Аркан 0: Шут (Дурак)', 
    arcanaType: 'Старший Аркан 0',
    requiredCoins: 500_000, 
    icon: '🎭', 
    cardImage: '🎒',
    auraColor: 'from-emerald-500/40 to-slate-900', 
    badge: 'Старший Аркан',
    description: 'Нулевая точка творения, чистое квантовое доверие Вселенной и шаг в неизведанное.'
  },
  { 
    level: 6, 
    title: 'Аркан I: Маг', 
    arcanaType: 'Старший Аркан 1',
    requiredCoins: 2_000_000, 
    icon: '🪄', 
    cardImage: '⚡',
    auraColor: 'from-indigo-500/40 to-slate-900', 
    badge: 'Старший Аркан',
    description: 'Связующий Небо и Землю. Сила мысли, управляющая 4 первоэлементами материи.'
  },
  { 
    level: 7, 
    title: 'Аркан IX: Отшельник (Старец)', 
    arcanaType: 'Старший Аркан 9',
    requiredCoins: 10_000_000, 
    icon: '🕯️', 
    cardImage: '🧙‍♂️',
    auraColor: 'from-purple-600/40 to-slate-900', 
    badge: 'Старший Аркан',
    description: 'Мудрость тысячелетий, свет фонаря истины в ночи и прямое ведение Старца Chubuk.'
  },
  { 
    level: 8, 
    title: 'Аркан X: Колесо Фортуны', 
    arcanaType: 'Старший Аркан 10',
    requiredCoins: 50_000_000, 
    icon: '🎡', 
    cardImage: '💫',
    auraColor: 'from-fuchsia-600/40 to-slate-900', 
    badge: 'Старший Аркан',
    description: 'Вращение космических циклов, бесконечный денежный поток и благословение небес.'
  },
  { 
    level: 9, 
    title: 'Аркан XIX: Солнце', 
    arcanaType: 'Старший Аркан 19',
    requiredCoins: 200_000_000, 
    icon: '☀️', 
    cardImage: '🌟',
    auraColor: 'from-amber-400/50 to-amber-900', 
    badge: 'Старший Аркан',
    description: 'Триумф процветания, абсолютный свет сознания, щедрость и величие души.'
  },
  { 
    level: 10, 
    title: 'Аркан XXI: Мир & Божественный Chubuk', 
    arcanaType: 'Старший Аркан 21 (Финал)',
    requiredCoins: 1_000_000_000, 
    icon: '🌌', 
    cardImage: '✨',
    auraColor: 'from-amber-300 to-yellow-600', 
    badge: 'Старший Аркан 21',
    description: 'Полное завершение цикла 22 арканов. Абсолютная космическая гармония и единство.'
  },
];

export const UPGRADE_CARDS: UpgradeCard[] = [
  // Категория: Сакральные Практики
  {
    id: 'meditation_dawn',
    title: 'Медитация на рассвете',
    category: 'practices',
    description: 'Гармонизирует эфирное поле и привлекает утренний приток праны.',
    baseCost: 250,
    costMultiplier: 1.18,
    baseProfitPerHour: 40,
    profitMultiplier: 1.15,
    icon: '🌅',
    requiredLevel: 1
  },
  {
    id: 'pranayama_breath',
    title: 'Дыхание Пранаямы',
    category: 'practices',
    description: 'Увеличивает объем пранической энергии тела на 120 единиц.',
    baseCost: 800,
    costMultiplier: 1.2,
    baseProfitPerHour: 130,
    profitMultiplier: 1.16,
    icon: '💨',
    requiredLevel: 1
  },
  {
    id: 'third_eye_activation',
    title: 'Активация Третьего Глаза',
    category: 'practices',
    description: 'Открывает канал интуитивного ясновидения и поток монет кармы.',
    baseCost: 3_200,
    costMultiplier: 1.22,
    baseProfitPerHour: 550,
    profitMultiplier: 1.18,
    icon: '👁️',
    requiredLevel: 2
  },
  {
    id: 'ancestral_cleansing',
    title: 'Чистка Родовых Каналов',
    category: 'practices',
    description: 'Снимает блоки по 4 линиям предков, умножая пассивную прибыль.',
    baseCost: 12_000,
    costMultiplier: 1.25,
    baseProfitPerHour: 2_100,
    profitMultiplier: 1.2,
    icon: '🌿',
    requiredLevel: 3
  },
  {
    id: 'samadhi_state',
    title: 'Погружение в Самадхи',
    category: 'practices',
    description: 'Высшее растворение в космосе. Непрерывный мощный майнинг кармы.',
    baseCost: 85_000,
    costMultiplier: 1.3,
    baseProfitPerHour: 14_500,
    profitMultiplier: 1.22,
    icon: '🌌',
    requiredLevel: 5
  },

  // Категория: Артефакты и Талисманы
  {
    id: 'pyrite_crystal',
    title: 'Кристалл Пирита & Золота',
    category: 'artifacts',
    description: 'Денежный камень, притягивающий материальные блага и арканы.',
    baseCost: 500,
    costMultiplier: 1.19,
    baseProfitPerHour: 85,
    profitMultiplier: 1.15,
    icon: '💎',
    requiredLevel: 1
  },
  {
    id: 'elder_prayer_beads',
    title: 'Золотые Чётки Старца',
    category: 'artifacts',
    description: 'Заряжены 108 мантрами Chubuk для постоянного потока монет.',
    baseCost: 2_400,
    costMultiplier: 1.21,
    baseProfitPerHour: 420,
    profitMultiplier: 1.17,
    icon: '📿',
    requiredLevel: 2
  },
  {
    id: 'arcana_amulet_22',
    title: 'Амулет 22 Арканов',
    category: 'artifacts',
    description: 'Священный пентакль, объединяющий все энергии Матрицы Судьбы.',
    baseCost: 9_500,
    costMultiplier: 1.24,
    baseProfitPerHour: 1_700,
    profitMultiplier: 1.19,
    icon: '🛡️',
    requiredLevel: 3
  },
  {
    id: 'akashic_parchment',
    title: 'Пергамент Хроник Акаши',
    category: 'artifacts',
    description: 'Древний свиток с сакральными кодами судьбы и процветания.',
    baseCost: 45_000,
    costMultiplier: 1.28,
    baseProfitPerHour: 7_800,
    profitMultiplier: 1.21,
    icon: '📜',
    requiredLevel: 4
  },
  {
    id: 'grail_of_chubuk',
    title: 'Грааль Старца Chubuk',
    category: 'artifacts',
    description: 'Легендарная чаша изобилия, умножающая прибыль каждого тапа.',
    baseCost: 250_000,
    costMultiplier: 1.32,
    baseProfitPerHour: 42_000,
    profitMultiplier: 1.24,
    icon: '🏆',
    requiredLevel: 6
  },

  // Категория: Магическая Инфраструктура
  {
    id: 'mountain_ashram',
    title: 'Ашрам в Горах Силы',
    category: 'infrastructure',
    description: 'Обитель для послушников, медитирующих во благо вашего баланса.',
    baseCost: 5_000,
    costMultiplier: 1.22,
    baseProfitPerHour: 880,
    profitMultiplier: 1.18,
    icon: '🏛️',
    requiredLevel: 2
  },
  {
    id: 'ether_thought_farm',
    title: 'Эфирная Ферма Мыслей',
    category: 'infrastructure',
    description: 'Квантовый сервер позитивных намерений и аффирмаций.',
    baseCost: 28_000,
    costMultiplier: 1.26,
    baseProfitPerHour: 4_900,
    profitMultiplier: 1.2,
    icon: '⚡',
    requiredLevel: 3
  },
  {
    id: 'telegram_oracle_bot',
    title: 'Телеграм-Оракул Chubuk',
    category: 'infrastructure',
    description: 'Автоматическая рассылка сакральных прогнозов 100 000 искателям.',
    baseCost: 110_000,
    costMultiplier: 1.3,
    baseProfitPerHour: 19_200,
    profitMultiplier: 1.22,
    icon: '🤖',
    requiredLevel: 5
  },
  {
    id: 'schumann_resonance_station',
    title: 'Станция Резонанса Шумана',
    category: 'infrastructure',
    description: 'Генератор частоты 7.83 Гц для мгновенного майнинга праны.',
    baseCost: 480_000,
    costMultiplier: 1.33,
    baseProfitPerHour: 84_000,
    profitMultiplier: 1.25,
    icon: '📡',
    requiredLevel: 6
  },
  {
    id: 'quantum_destiny_portal',
    title: 'Квантовый Портал Судьбы',
    category: 'infrastructure',
    description: 'Гиперпространственный шлюз прямо в центр галактических энергий.',
    baseCost: 2_500_000,
    costMultiplier: 1.35,
    baseProfitPerHour: 450_000,
    profitMultiplier: 1.28,
    icon: '🌀',
    requiredLevel: 7
  },

  // Категория: Особые / Спецкарты
  {
    id: 'chubuk_blessing',
    title: 'Благословение Старца',
    category: 'special',
    description: 'Персональное благословение создателя портала на квантовый скачок.',
    baseCost: 15_000,
    costMultiplier: 1.25,
    baseProfitPerHour: 3_000,
    profitMultiplier: 1.2,
    icon: '✨',
    requiredLevel: 2
  },
  {
    id: 'golden_ratio_key',
    title: 'Ключ Золотого Сечения',
    category: 'special',
    description: 'Гармония Фибоначчи во всех финансовых транзакциях души.',
    baseCost: 65_000,
    costMultiplier: 1.28,
    baseProfitPerHour: 11_500,
    profitMultiplier: 1.22,
    icon: '🔑',
    requiredLevel: 4
  },
  {
    id: 'ton_blockchain_bridge',
    title: 'Мост в Экосистему TON',
    category: 'special',
    description: 'Готовит ваш аккаунт к будущему дропу $CHUBUK в Telegram & Web3.',
    baseCost: 350_000,
    costMultiplier: 1.32,
    baseProfitPerHour: 62_000,
    profitMultiplier: 1.25,
    icon: '💎',
    requiredLevel: 5
  },
  {
    id: 'cosmic_avalanche',
    title: 'Космическая Лавина Кармы',
    category: 'special',
    description: 'Супер-карта! Непрекращающийся поток космического изобилия.',
    baseCost: 1_800_000,
    costMultiplier: 1.36,
    baseProfitPerHour: 320_000,
    profitMultiplier: 1.3,
    icon: '🌠',
    requiredLevel: 7
  }
];

export const DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'quest_checkin',
    title: 'Ежедневное Посещение Алтаря',
    description: 'Заходите каждый день и увеличивайте стрик наград',
    reward: 5_000,
    icon: '📅',
    category: 'daily'
  },
  {
    id: 'quest_matrix_calc',
    title: 'Рассчитать Матрицу Судьбы',
    description: 'Постройте расчет 22 арканов для себя или близкого человека',
    reward: 15_000,
    icon: '🌟',
    category: 'activity'
  },
  {
    id: 'quest_tarot_reading',
    title: 'Вытянуть 3 Карты Таро',
    description: 'Обратитесь к сакральному оракулу за советом момента',
    reward: 10_000,
    icon: '🃏',
    category: 'activity'
  },
  {
    id: 'quest_sound_therapy',
    title: 'Сеанс Звукотерапии',
    description: 'Включите космические частоты Шумана и чаш в плеере',
    reward: 12_000,
    icon: '🎵',
    category: 'activity'
  },
  {
    id: 'quest_save_pdf',
    title: 'Скачать Сакральный Отчет PDF',
    description: 'Сформируйте PDF-манускрипт судьбы высокого разрешения',
    reward: 20_000,
    icon: '📑',
    category: 'activity'
  },
  {
    id: 'quest_share_app',
    title: 'Поделиться порталом с другом',
    description: 'Отправьте ссылку на расчет матрицы другу или в соцсети',
    reward: 50_000,
    icon: '🔗',
    category: 'social'
  },
  {
    id: 'quest_telegram_chubuk',
    title: 'Подписка на Канал Старца',
    description: 'Сакральные инсайты, анонсы дропа токена и утренние коды',
    reward: 100_000,
    icon: '✈️',
    category: 'social',
    actionUrl: 'https://t.me/'
  },
  {
    id: 'quest_100_taps',
    title: 'Активация 100 прикосновений',
    description: 'Совершите 100 тапов по артефакту за сегодня',
    reward: 25_000,
    icon: '⚡',
    category: 'activity',
    targetCount: 100
  }
];

export const DAILY_CHECKIN_REWARDS = [
  500,       // День 1
  1_500,     // День 2
  5_000,     // День 3
  15_000,    // День 4
  50_000,    // День 5
  100_000,   // День 6
  250_000,   // День 7
  500_000,   // День 8
  1_000_000, // День 9
  5_000_000  // День 10
];

// Helper to get Today's Date String (YYYY-MM-DD)
export const getTodayDateString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Deterministic Daily Combo Generator based on Date
export const getDailyComboCards = (dateStr: string = getTodayDateString()): {
  cardIds: string[];
  reward: number;
} => {
  // simple deterministic hash from date
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  
  const allCards = UPGRADE_CARDS.map(c => c.id);
  const card1 = allCards[absHash % allCards.length];
  const card2 = allCards[(absHash * 3 + 7) % allCards.length];
  const card3 = allCards[(absHash * 7 + 13) % allCards.length];

  const unique = Array.from(new Set([card1, card2, card3]));
  while (unique.length < 3) {
    const fallback = allCards[(unique.length * 5) % allCards.length];
    if (!unique.includes(fallback)) unique.push(fallback);
  }

  return {
    cardIds: unique,
    reward: 5_000_000
  };
};

// Deterministic Daily Cipher (Morse code / Sacred word of the day)
export const getDailyCipher = (dateStr: string = getTodayDateString()): {
  word: string;
  morse: string;
  hint: string;
  reward: number;
} => {
  const CIPHERS = [
    { word: 'CHUBUK', morse: '-.-. / .... / ..- / -... / ..- / -.-', hint: 'Имя Великого Старца и проводника матрицы' },
    { word: 'ARKAN', morse: '.- / .-. / -.- / .- / -.', hint: '22 сакральные энергии вселенского кода' },
    { word: 'KARMA', morse: '-.- / .- / .-. / -- / .-', hint: 'Закон причины и следствия души' },
    { word: 'CHAKRA', morse: '-.-. / .... / .- / -.- / .-. / .-', hint: '7 энергетических центров человека' },
    { word: 'AKASHA', morse: '.- / -.- / .- / ... / .... / .-', hint: 'Вселенская библиотека памяти душ' },
    { word: 'PRANA', morse: '.--. / .-. / .- / -. / .-', hint: 'Жизненное дыхание и первородная сила' },
    { word: 'SUN', morse: '... / ..- / -.', hint: 'Центральная звезда и энергия проявления' },
  ];

  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CIPHERS.length;
  return {
    ...CIPHERS[index],
    reward: 1_000_000
  };
};

// Initial default state
// Energy regeneration configuration: 100 energy per 10 minutes (600 seconds = 1 energy every 6 seconds)
export const ENERGY_REGEN_PER_SECOND = 100 / 600; // ~0.16667 energy per sec
export const ENERGY_REGEN_INTERVAL_MINUTES = 10;
export const ENERGY_REGEN_AMOUNT_PER_INTERVAL = 100;

export const DEFAULT_GAME_STATE: TapperGameState = {
  coins: 100,
  totalEarned: 100,
  profitPerHour: 0,
  energy: 1000,
  maxEnergy: 1000,
  tapPower: 1,
  level: 1,
  lastEarnTimestamp: Date.now(),
  cards: {},
  completedQuests: [],
  dailyCheckinStreak: 0,
  lastCheckinDate: '',
  dailyComboFound: [],
  dailyComboClaimedDate: '',
  dailyCipherSolvedDate: '',
  fullEnergyBoostsLeft: 6,
  turboBoostsLeft: 3,
  lastBoostDate: getTodayDateString(),
  walletAddress: null,
  tapStats: {
    totalTaps: 0,
    todayTaps: 0
  },
  multitapLevel: 1,
  energyLimitLevel: 1,
  rechargeSpeedLevel: 1,
  autoBotLevel: 0
};

const STORAGE_KEY = 'chubuk_tapper_game_state_v1';

// Upgrade Cost and Effect Helpers
export const getMultitapCost = (level: number): number => {
  return Math.floor(250 * Math.pow(2, level - 1));
};

export const getEnergyLimitCost = (level: number): number => {
  return Math.floor(500 * Math.pow(2.2, level - 1));
};

export const getRechargeSpeedCost = (level: number): number => {
  return Math.floor(1000 * Math.pow(2.5, level - 1));
};

export const getAutoBotCost = (level: number): number => {
  return level === 0 ? 25000 : Math.floor(50000 * Math.pow(2, level));
};

export const calculateTapPower = (multitapLevel: number): number => {
  return Math.max(1, multitapLevel);
};

export const calculateMaxEnergy = (energyLimitLevel: number): number => {
  return 1000 + Math.max(0, energyLimitLevel - 1) * 500;
};

export const calculateEnergyRegenPerSecond = (rechargeSpeedLevel: number): number => {
  // Base is ~0.1667 energy/sec (+100 per 10 min), each level increases regen speed by +30%
  const multiplier = 1 + Math.max(0, rechargeSpeedLevel - 1) * 0.3;
  return ENERGY_REGEN_PER_SECOND * multiplier;
};

// Load Game State with Offline Mining Calculation
export const loadGameState = (): { state: TapperGameState; offlineEarnings: number; offlineSeconds: number } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let state: TapperGameState = raw ? { ...DEFAULT_GAME_STATE, ...JSON.parse(raw) } : { ...DEFAULT_GAME_STATE };

    // Ensure upgrade fields exist for existing state
    if (state.multitapLevel === undefined) state.multitapLevel = 1;
    if (state.energyLimitLevel === undefined) state.energyLimitLevel = 1;
    if (state.rechargeSpeedLevel === undefined) state.rechargeSpeedLevel = 1;
    if (state.autoBotLevel === undefined) state.autoBotLevel = 0;

    // Recalculate derived attributes
    state.tapPower = calculateTapPower(state.multitapLevel);
    state.maxEnergy = calculateMaxEnergy(state.energyLimitLevel);

    const now = Date.now();
    const today = getTodayDateString();

    // Reset daily boosts if new day
    if (state.lastBoostDate !== today) {
      state.fullEnergyBoostsLeft = 6;
      state.turboBoostsLeft = 3;
      state.lastBoostDate = today;
      state.tapStats.todayTaps = 0;
    }

    // Calculate Offline Passive Mining (Max 3 hours = 10800s like standard games)
    let offlineEarnings = 0;
    let offlineSeconds = 0;

    // Auto-bot also contributes to offline or passive bonus
    const autoBotBonusPerHour = state.autoBotLevel > 0 ? state.autoBotLevel * 1200 : 0;
    const totalProfitPerHour = state.profitPerHour + autoBotBonusPerHour;

    if (state.lastEarnTimestamp && totalProfitPerHour > 0) {
      const elapsedSeconds = Math.max(0, Math.floor((now - state.lastEarnTimestamp) / 1000));
      const cappedSeconds = Math.min(elapsedSeconds, 3 * 3600); // 3h max offline profit
      offlineSeconds = cappedSeconds;

      if (cappedSeconds > 5) {
        offlineEarnings = Math.floor((totalProfitPerHour / 3600) * cappedSeconds);
        state.coins += offlineEarnings;
        state.totalEarned += offlineEarnings;
      }
    }

    // Energy regeneration with speed bonus
    const regenRate = calculateEnergyRegenPerSecond(state.rechargeSpeedLevel);
    const elapsedSinceLast = Math.max(0, Math.floor((now - (state.lastEarnTimestamp || now)) / 1000));
    const regeneratedEnergy = elapsedSinceLast * regenRate;
    state.energy = Math.min(state.maxEnergy, state.energy + regeneratedEnergy);

    // Recalculate level
    state.level = getRankLevel(state.totalEarned).level;
    state.lastEarnTimestamp = now;

    saveGameState(state);

    return { state, offlineEarnings, offlineSeconds };
  } catch (e) {
    console.error('Error loading tapper game state:', e);
    return { state: { ...DEFAULT_GAME_STATE }, offlineEarnings: 0, offlineSeconds: 0 };
  }
};

export const saveGameState = (state: TapperGameState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving tapper game state:', e);
  }
};

// Calculate cost of card at current level
export const getCardCost = (card: UpgradeCard, currentLevel: number): number => {
  return Math.floor(card.baseCost * Math.pow(card.costMultiplier, currentLevel));
};

// Calculate added profit per hour from leveling up this card
export const getCardProfitIncrease = (card: UpgradeCard, currentLevel: number): number => {
  return Math.floor(card.baseProfitPerHour * Math.pow(card.profitMultiplier, currentLevel));
};

// Get current player rank object
export const getRankLevel = (coins: number): RankLevel => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (coins >= RANKS[i].requiredCoins) {
      return RANKS[i];
    }
  }
  return RANKS[0];
};

// Format numbers (e.g., 1.25M, 450K, 1.8B)
export const formatNumberAbbreviated = (num: number): string => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString('ru-RU');
};

// Web Audio API Synthesized Magical Sounds (No external sound files required)
class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTap() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft mystical crystal pitch
      const freqs = [528, 587.33, 659.25, 783.99, 880];
      const freq = freqs[Math.floor(Math.random() * freqs.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playCoin() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playLevelUp() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - C
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch (e) {}
  }
}

export const soundFx = new SoundSynthesizer();
