/**
 * Usage Limit & Monetization Hub Service for Chubuk Matrix
 * 
 * Provides:
 * - 3 free daily attempts for regular users (Tarot, Horary, Deep Matrix calculations)
 * - Bonus / purchased attempts storage
 * - Crypto conversion: 10,000 $CHUBUK Karma coins = 3 attempts (+ packages)
 * - Fortune Wheel daily spins & rewards (+1..+5 attempts, coins, VIP)
 * - Partner tasks (Yandex, Telegram, etc.) with high rewards (+5 to +10 attempts)
 * - Ruble payment gateway packages (SBP, Cards, YooMoney)
 * - Master Admin PIN & VIP promo codes
 */

export const MAX_FREE_ATTEMPTS = 3;

// Crypto Exchange Rate: 10,000 $CHUBUK = 3 attempts
export const CRYPTO_RATE_COINS_FOR_3_ATTEMPTS = 10_000;

export interface CryptoPackage {
  id: string;
  coinsCost: number;
  attempts: number;
  bonusText?: string;
  isVip?: boolean;
  vipHours?: number;
  title: string;
}

export const CRYPTO_PACKAGES: CryptoPackage[] = [
  {
    id: 'crypto_basic_3',
    coinsCost: 10_000,
    attempts: 3,
    title: '3 попытки'
  },
  {
    id: 'crypto_pack_10',
    coinsCost: 30_000,
    attempts: 10,
    bonusText: '+1 бонус',
    title: '10 попыток'
  },
  {
    id: 'crypto_pack_30',
    coinsCost: 75_000,
    attempts: 30,
    bonusText: '+5 бонусов',
    title: '30 попыток'
  },
  {
    id: 'crypto_vip_24h',
    coinsCost: 150_000,
    attempts: 999,
    isVip: true,
    vipHours: 24,
    bonusText: 'Безлимит 24ч',
    title: '👑 VIP на 24 часа'
  },
  {
    id: 'crypto_vip_lifetime',
    coinsCost: 500_000,
    attempts: 9999,
    isVip: true,
    vipHours: 24 * 365 * 10,
    bonusText: 'Вечный VIP',
    title: '👑 Вечный Master Безлимит'
  }
];

export interface MoneyPackage {
  id: string;
  priceRub: number;
  attempts: number;
  title: string;
  description: string;
  badge?: string;
  isPopular?: boolean;
  bonusCoins?: number;
  isVip?: boolean;
  vipDays?: number;
}

export const MONEY_PACKAGES: MoneyPackage[] = [
  {
    id: 'rub_pack_3',
    priceRub: 99,
    attempts: 3,
    title: 'Искатель',
    description: '3 мгновенных расчета / расклада Таро'
  },
  {
    id: 'rub_pack_10',
    priceRub: 199,
    attempts: 10,
    title: 'Оракул',
    description: '10 попыток + 10,000 $CHUBUK монет',
    badge: 'ХИТ',
    isPopular: true,
    bonusCoins: 10_000
  },
  {
    id: 'rub_pack_35',
    priceRub: 390,
    attempts: 35,
    title: 'Магистр',
    description: '35 попыток + 50,000 $CHUBUK монет',
    badge: 'ВЫГОДНО',
    bonusCoins: 50_000
  },
  {
    id: 'rub_vip_month',
    priceRub: 590,
    attempts: 999,
    title: 'VIP Месяц',
    description: '30 дней полного безлимита на всё',
    badge: 'PRO',
    isVip: true,
    vipDays: 30,
    bonusCoins: 150_000
  },
  {
    id: 'rub_vip_lifetime',
    priceRub: 1290,
    attempts: 9999,
    title: 'Master Lifetime',
    description: 'Вечный безлимит + закрытые материалы и сакральные коды',
    badge: 'ПРЕМИУМ',
    isVip: true,
    vipDays: 3650,
    bonusCoins: 1_000_000
  }
];

export interface PartnerTask {
  id: string;
  title: string;
  category: 'yandex' | 'social' | 'partner';
  brand: string;
  rewardAttempts: number;
  rewardCoins: number;
  description: string;
  icon: string;
  actionUrl: string;
  badge?: string;
  estimatedTime: string;
}

export const PARTNER_TASKS: PartnerTask[] = [
  {
    id: 'yandex_market_visit',
    title: 'Яндекс Маркет: Просмотр сакральных товаров',
    category: 'yandex',
    brand: 'Яндекс Маркет',
    rewardAttempts: 7,
    rewardCoins: 15_000,
    description: 'Перейдите на Яндекс Маркет и просмотрите рекомендации благовоний и минералов',
    icon: '🛍️',
    actionUrl: 'https://market.yandex.ru/',
    badge: 'Яндекс • +7 Попыток',
    estimatedTime: '30 сек'
  },
  {
    id: 'yandex_music_podcast',
    title: 'Яндекс Музыка: Мантры и Медитации 432Hz',
    category: 'yandex',
    brand: 'Яндекс Музыка',
    rewardAttempts: 6,
    rewardCoins: 10_000,
    description: 'Откройте саундтрек квантовых частот на Яндекс Музыке',
    icon: '🎵',
    actionUrl: 'https://music.yandex.ru/',
    badge: 'Яндекс • +6 Попыток',
    estimatedTime: '20 сек'
  },
  {
    id: 'yandex_search_widget',
    title: 'Яндекс Поиск: Гороскоп и астрологический прогноз',
    category: 'yandex',
    brand: 'Яндекс',
    rewardAttempts: 5,
    rewardCoins: 10_000,
    description: 'Ищите астрологические тренды дня в поиске Яндекса',
    icon: '🔍',
    actionUrl: 'https://ya.ru/',
    badge: 'Яндекс • +5 Попыток',
    estimatedTime: '15 сек'
  },
  {
    id: 'partner_rutube_chubuk',
    title: 'Rutube: Просмотр сакрального видеоурока',
    category: 'partner',
    brand: 'Rutube',
    rewardAttempts: 10,
    rewardCoins: 25_000,
    description: 'Посмотрите 1-минутное обучающее видео по матрице судьбы на Rutube',
    icon: '📺',
    actionUrl: 'https://rutube.ru/',
    badge: 'Супер Награда • +10 Попыток',
    estimatedTime: '1 мин'
  },
  {
    id: 'social_tg_subscribe',
    title: 'Telegram: Подписка на закрытый канал Старца',
    category: 'social',
    brand: 'Telegram',
    rewardAttempts: 8,
    rewardCoins: 30_000,
    description: 'Подпишитесь на официальный канал с ежедневными арканами и прогнозами',
    icon: '✈️',
    actionUrl: 'https://t.me/',
    badge: 'Telegram • +8 Попыток',
    estimatedTime: '15 сек'
  },
  {
    id: 'pwa_home_screen',
    title: 'Добавление на Главный Экран / Android PWA',
    category: 'partner',
    brand: 'Chubuk App',
    rewardAttempts: 10,
    rewardCoins: 50_000,
    description: 'Установите приложение на экран смартфона для мгновенного доступа без браузера',
    icon: '📱',
    actionUrl: '#install',
    badge: 'Хит • +10 Попыток',
    estimatedTime: '10 сек'
  }
];

export interface FortuneWheelSector {
  id: string;
  label: string;
  type: 'attempts' | 'coins' | 'vip';
  amount: number;
  color: string;
  textColor: string;
  description: string;
  icon: string;
  probabilityWeight: number;
}

export const WHEEL_SECTORS: FortuneWheelSector[] = [
  { id: 'sec_att_1', label: '+1 Попытка', type: 'attempts', amount: 1, color: '#1e293b', textColor: '#fbbf24', description: '1 бонусный расчет', icon: '✨', probabilityWeight: 25 },
  { id: 'sec_coins_5k', label: '5,000 $CHUBUK', type: 'coins', amount: 5000, color: '#312e81', textColor: '#e0e7ff', description: '5,000 карма-монет', icon: '🪙', probabilityWeight: 20 },
  { id: 'sec_att_2', label: '+2 Попытки', type: 'attempts', amount: 2, color: '#064e3b', textColor: '#6ee7b7', description: '2 расклада Таро / оракула', icon: '🔮', probabilityWeight: 18 },
  { id: 'sec_coins_15k', label: '15,000 $CHUBUK', type: 'coins', amount: 15000, color: '#4c1d95', textColor: '#f3e8ff', description: '15,000 карма-монет', icon: '💰', probabilityWeight: 15 },
  { id: 'sec_att_3', label: '+3 Попытки', type: 'attempts', amount: 3, color: '#831843', textColor: '#fbcfe8', description: '3 глубоких расчета', icon: '⚡', probabilityWeight: 10 },
  { id: 'sec_coins_50k', label: '50,000 $CHUBUK', type: 'coins', amount: 50000, color: '#78350f', textColor: '#fde68a', description: 'Большой денежный куш', icon: '💎', probabilityWeight: 6 },
  { id: 'sec_att_5', label: '+5 ДЖЕКПОТ', type: 'attempts', amount: 5, color: '#b45309', textColor: '#fffbeb', description: '5 бесплатных попыток', icon: '🌟', probabilityWeight: 4 },
  { id: 'sec_vip_pass', label: '👑 VIP 24 ЧАСА', type: 'vip', amount: 24, color: '#e11d48', textColor: '#ffffff', description: 'Полный суточный безлимит!', icon: '👑', probabilityWeight: 2 }
];

const ADMIN_PINS = ['7777', 'chubuk2026', 'CHUK-MASTER-2026', 'admin', 'matrix777', 'chubuk777'];

const VIP_PROMO_CODES: Record<string, string> = {
  'CHUBUK-VIP': 'VIP Безлимитный доступ ко всем разделам',
  'VIP': 'Безлимитный доступ Master',
  'INFINITY': 'Вечный безлимит оракула',
  'MATRIX-UNLIMITED': 'Полный безлимит на расчеты и Таро',
  'KARMA-MAX': 'VIP Статус + 10,000 $CHUBUK',
  'CHRONOS-2026': 'PRO Доступ к Хроносу и всем раскладам'
};

const getTodayKey = () => {
  const dateStr = new Date().toISOString().split('T')[0];
  return `chubuk_usage_attempts_${dateStr}`;
};

const BONUS_ATTEMPTS_KEY = 'chubuk_bonus_attempts_v1';
const COMPLETED_PARTNERS_KEY = 'chubuk_completed_partner_tasks_v1';
const LAST_WHEEL_SPIN_KEY = 'chubuk_last_wheel_spin_date_v1';
const TAPPER_STORAGE_KEY = 'chubuk_tapper_game_state_v1';

export const isUserAdmin = (user?: any): boolean => {
  if (typeof window === 'undefined') return false;
  if (user?.email === 'zeros20001@gmail.com') return true;
  
  try {
    const sessionAuth = sessionStorage.getItem('chubuk_admin_unlocked');
    const localAdminMode = localStorage.getItem('chubuk_is_admin_mode');
    return sessionAuth === 'true' || localAdminMode === 'true';
  } catch {
    return false;
  }
};

export const isVipUnlocked = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    // Check permanent VIP
    if (localStorage.getItem('chubuk_vip_unlocked') === 'true') {
      return true;
    }
    // Check temporary timed VIP
    const vipExpires = localStorage.getItem('chubuk_vip_expires_at');
    if (vipExpires) {
      const expTime = parseInt(vipExpires, 10);
      if (Date.now() < expTime) {
        return true;
      } else {
        localStorage.removeItem('chubuk_vip_expires_at');
      }
    }
    return false;
  } catch {
    return false;
  }
};

export const getUsageCount = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(getTodayKey());
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
};

export const getBonusAttempts = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(BONUS_ATTEMPTS_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
};

export const addBonusAttempts = (count: number, reason: string = 'Бонус'): number => {
  if (typeof window === 'undefined' || count <= 0) return getBonusAttempts();
  try {
    const current = getBonusAttempts();
    const updated = current + count;
    localStorage.setItem(BONUS_ATTEMPTS_KEY, updated.toString());
    window.dispatchEvent(new CustomEvent('chubuk_usage_updated', {
      detail: { bonusAdded: count, totalBonus: updated, reason }
    }));
    return updated;
  } catch {
    return getBonusAttempts();
  }
};

export const getRemainingAttempts = (user?: any): number => {
  if (isUserAdmin(user) || isVipUnlocked()) {
    return Infinity;
  }
  const dailyUsed = getUsageCount();
  const dailyFreeRemaining = Math.max(0, MAX_FREE_ATTEMPTS - dailyUsed);
  const bonus = getBonusAttempts();
  return dailyFreeRemaining + bonus;
};

export const checkCanPerformAction = (user?: any): {
  allowed: boolean;
  remaining: number;
  max: number;
  dailyFreeRemaining: number;
  bonusRemaining: number;
  isAdmin: boolean;
  isVip: boolean;
} => {
  const admin = isUserAdmin(user);
  const vip = isVipUnlocked();
  
  if (admin || vip) {
    return {
      allowed: true,
      remaining: Infinity,
      max: MAX_FREE_ATTEMPTS,
      dailyFreeRemaining: Infinity,
      bonusRemaining: Infinity,
      isAdmin: admin,
      isVip: vip
    };
  }

  const dailyUsed = getUsageCount();
  const dailyFreeRemaining = Math.max(0, MAX_FREE_ATTEMPTS - dailyUsed);
  const bonusRemaining = getBonusAttempts();
  const totalRemaining = dailyFreeRemaining + bonusRemaining;

  return {
    allowed: totalRemaining > 0,
    remaining: totalRemaining,
    max: MAX_FREE_ATTEMPTS,
    dailyFreeRemaining,
    bonusRemaining,
    isAdmin: false,
    isVip: false
  };
};

export const recordActionUsage = (user?: any): {
  allowed: boolean;
  remaining: number;
  usedDaily: number;
  usedBonus: boolean;
  isAdmin: boolean;
} => {
  const admin = isUserAdmin(user);
  const vip = isVipUnlocked();

  if (admin || vip) {
    return {
      allowed: true,
      remaining: Infinity,
      usedDaily: 0,
      usedBonus: false,
      isAdmin: true
    };
  }

  const currentDailyUsed = getUsageCount();
  
  // 1. Consume from 3 daily free attempts first
  if (currentDailyUsed < MAX_FREE_ATTEMPTS) {
    const nextDailyUsed = currentDailyUsed + 1;
    try {
      localStorage.setItem(getTodayKey(), nextDailyUsed.toString());
      const remaining = Math.max(0, MAX_FREE_ATTEMPTS - nextDailyUsed) + getBonusAttempts();
      window.dispatchEvent(new CustomEvent('chubuk_usage_updated', {
        detail: { used: nextDailyUsed, remaining }
      }));
      return {
        allowed: true,
        remaining,
        usedDaily: nextDailyUsed,
        usedBonus: false,
        isAdmin: false
      };
    } catch (e) {
      console.warn('Failed to save daily usage', e);
    }
  }

  // 2. Consume from purchased/earned bonus attempts
  const bonus = getBonusAttempts();
  if (bonus > 0) {
    const nextBonus = bonus - 1;
    try {
      localStorage.setItem(BONUS_ATTEMPTS_KEY, nextBonus.toString());
      window.dispatchEvent(new CustomEvent('chubuk_usage_updated', {
        detail: { bonusRemaining: nextBonus, remaining: nextBonus }
      }));
      return {
        allowed: true,
        remaining: nextBonus,
        usedDaily: currentDailyUsed,
        usedBonus: true,
        isAdmin: false
      };
    } catch (e) {
      console.warn('Failed to decrement bonus attempts', e);
    }
  }

  // No attempts left
  return {
    allowed: false,
    remaining: 0,
    usedDaily: currentDailyUsed,
    usedBonus: false,
    isAdmin: false
  };
};

// --- $CHUBUK KARMA COINS CONVERSION ---

export const getTapperCoinsBalance = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(TAPPER_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return typeof parsed.coins === 'number' ? parsed.coins : 0;
  } catch {
    return 0;
  }
};

export const addTapperCoins = (amount: number): number => {
  if (typeof window === 'undefined' || amount <= 0) return getTapperCoinsBalance();
  try {
    const raw = localStorage.getItem(TAPPER_STORAGE_KEY);
    const state = raw ? JSON.parse(raw) : { coins: 100, totalEarned: 100 };
    state.coins = (state.coins || 0) + amount;
    state.totalEarned = (state.totalEarned || 0) + amount;
    localStorage.setItem(TAPPER_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('chubuk_coins_updated', { detail: { coins: state.coins } }));
    return state.coins;
  } catch {
    return getTapperCoinsBalance();
  }
};

export const convertChubukCoinsToAttempts = (pkg: CryptoPackage): {
  success: boolean;
  message: string;
  newBalance?: number;
  newAttempts?: number;
} => {
  const currentCoins = getTapperCoinsBalance();
  if (currentCoins < pkg.coinsCost) {
    return {
      success: false,
      message: `Недостаточно $CHUBUK. Нужно: ${pkg.coinsCost.toLocaleString('ru-RU')}, у вас: ${Math.floor(currentCoins).toLocaleString('ru-RU')}. Тапайте в разделе «Тапалка» для майнинга!`
    };
  }

  try {
    // Deduct coins from tapper state
    const raw = localStorage.getItem(TAPPER_STORAGE_KEY);
    const state = raw ? JSON.parse(raw) : { coins: currentCoins };
    state.coins = Math.max(0, state.coins - pkg.coinsCost);
    localStorage.setItem(TAPPER_STORAGE_KEY, JSON.stringify(state));

    if (pkg.isVip) {
      if (pkg.vipHours && pkg.vipHours < 24 * 365) {
        const exp = Date.now() + pkg.vipHours * 3600 * 1000;
        localStorage.setItem('chubuk_vip_expires_at', exp.toString());
      } else {
        localStorage.setItem('chubuk_vip_unlocked', 'true');
      }
      window.dispatchEvent(new CustomEvent('chubuk_admin_state_changed', { detail: { isVip: true } }));
    } else {
      addBonusAttempts(pkg.attempts, `Конвертация ${pkg.coinsCost} $CHUBUK`);
    }

    // Record in transaction history
    try {
      const historyRaw = localStorage.getItem('chubuk_topup_transactions_history_v1');
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift({
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'crypto_swap',
        title: `Обмен токенов $CHUBUK: ${pkg.title}`,
        amountAttempts: pkg.isVip ? 999 : pkg.attempts,
        amountCoins: -pkg.coinsCost,
        priceFormatted: `${pkg.coinsCost.toLocaleString('ru-RU')} $CHUBUK`,
        timestamp: Date.now(),
        status: 'completed',
        details: pkg.bonusText || 'Успешная конвертация карма-токенов'
      });
      localStorage.setItem('chubuk_topup_transactions_history_v1', JSON.stringify(history.slice(0, 50)));
      window.dispatchEvent(new CustomEvent('chubuk_topup_history_updated'));
    } catch {}

    window.dispatchEvent(new CustomEvent('chubuk_coins_updated', { detail: { coins: state.coins } }));
    window.dispatchEvent(new CustomEvent('chubuk_usage_updated'));

    return {
      success: true,
      message: `Успешно! Списано ${pkg.coinsCost.toLocaleString('ru-RU')} $CHUBUK. Начислено: ${pkg.title}`,
      newBalance: state.coins,
      newAttempts: getRemainingAttempts()
    };
  } catch (e) {
    return { success: false, message: 'Ошибка при конвертации токенов' };
  }
};

// --- FORTUNE WHEEL MECHANICS ---

export const getCanSpinWheelFree = (): { canSpin: boolean; nextSpinTime?: string } => {
  if (typeof window === 'undefined') return { canSpin: true };
  try {
    const today = new Date().toISOString().split('T')[0];
    const lastSpin = localStorage.getItem(LAST_WHEEL_SPIN_KEY);
    if (lastSpin === today) {
      return { canSpin: false, nextSpinTime: 'в 00:00 (или за 2,000 $CHUBUK)' };
    }
    return { canSpin: true };
  } catch {
    return { canSpin: true };
  }
};

export const spinWheelAndClaimReward = (costType: 'free' | 'coins'): {
  success: boolean;
  sector?: FortuneWheelSector;
  sectorIndex?: number;
  message: string;
} => {
  if (costType === 'coins') {
    const cost = 2_000;
    const balance = getTapperCoinsBalance();
    if (balance < cost) {
      return {
        success: false,
        message: `Недостаточно $CHUBUK для вращения. Нужно: ${cost} $CHUBUK (у вас: ${balance}).`
      };
    }
    // Deduct spin fee
    const raw = localStorage.getItem(TAPPER_STORAGE_KEY);
    const state = raw ? JSON.parse(raw) : { coins: balance };
    state.coins = Math.max(0, state.coins - cost);
    localStorage.setItem(TAPPER_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('chubuk_coins_updated', { detail: { coins: state.coins } }));
  } else {
    // Record free daily spin
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(LAST_WHEEL_SPIN_KEY, today);
  }

  // Weighted random pick
  const totalWeight = WHEEL_SECTORS.reduce((acc, s) => acc + s.probabilityWeight, 0);
  let randomVal = Math.random() * totalWeight;
  let selectedIndex = 0;

  for (let i = 0; i < WHEEL_SECTORS.length; i++) {
    if (randomVal < WHEEL_SECTORS[i].probabilityWeight) {
      selectedIndex = i;
      break;
    }
    randomVal -= WHEEL_SECTORS[i].probabilityWeight;
  }

  const wonSector = WHEEL_SECTORS[selectedIndex];

  // Apply Reward
  if (wonSector.type === 'attempts') {
    addBonusAttempts(wonSector.amount, `Колесо Фортуны: +${wonSector.amount} попыток`);
  } else if (wonSector.type === 'coins') {
    addTapperCoins(wonSector.amount);
  } else if (wonSector.type === 'vip') {
    const exp = Date.now() + wonSector.amount * 3600 * 1000;
    localStorage.setItem('chubuk_vip_expires_at', exp.toString());
    window.dispatchEvent(new CustomEvent('chubuk_admin_state_changed', { detail: { isVip: true } }));
  }

  // Record transaction in history
  try {
    const historyRaw = localStorage.getItem('chubuk_topup_transactions_history_v1');
    const history = historyRaw ? JSON.parse(historyRaw) : [];
    history.unshift({
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'wheel_reward',
      title: `Колесо Фортуны: ${wonSector.label}`,
      amountAttempts: wonSector.type === 'attempts' ? wonSector.amount : (wonSector.type === 'vip' ? 999 : 0),
      amountCoins: wonSector.type === 'coins' ? wonSector.amount : 0,
      priceFormatted: costType === 'free' ? 'Бесплатный спин' : '2,000 $CHUBUK',
      timestamp: Date.now(),
      status: 'completed',
      details: wonSector.description
    });
    localStorage.setItem('chubuk_topup_transactions_history_v1', JSON.stringify(history.slice(0, 50)));
    window.dispatchEvent(new CustomEvent('chubuk_topup_history_updated'));
  } catch {}

  window.dispatchEvent(new CustomEvent('chubuk_usage_updated'));

  return {
    success: true,
    sector: wonSector,
    sectorIndex: selectedIndex,
    message: `Поздравляем! Вы выиграли: ${wonSector.label} (${wonSector.description})`
  };
};

// --- PARTNER REWARD TASKS ---

export const getCompletedPartnerTasks = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COMPLETED_PARTNERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const completePartnerTask = (taskId: string): {
  success: boolean;
  rewardAttempts: number;
  rewardCoins: number;
  message: string;
} => {
  const task = PARTNER_TASKS.find(t => t.id === taskId);
  if (!task) {
    return { success: false, rewardAttempts: 0, rewardCoins: 0, message: 'Задание не найдено' };
  }

  const completed = getCompletedPartnerTasks();
  if (completed.includes(taskId)) {
    return { 
      success: false, 
      rewardAttempts: 0, 
      rewardCoins: 0, 
      message: 'Вы уже получили награду за это задание ранее!' 
    };
  }

  try {
    completed.push(taskId);
    localStorage.setItem(COMPLETED_PARTNERS_KEY, JSON.stringify(completed));

    // Award attempts & coins
    addBonusAttempts(task.rewardAttempts, `Партнерка: ${task.title}`);
    addTapperCoins(task.rewardCoins);

    // Record in transaction history
    try {
      const historyRaw = localStorage.getItem('chubuk_topup_transactions_history_v1');
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift({
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'partner_task',
        title: `Партнерское задание: ${task.title}`,
        amountAttempts: task.rewardAttempts,
        amountCoins: task.rewardCoins,
        priceFormatted: 'Партнерский оффер',
        timestamp: Date.now(),
        status: 'completed',
        details: task.description
      });
      localStorage.setItem('chubuk_topup_transactions_history_v1', JSON.stringify(history.slice(0, 50)));
      window.dispatchEvent(new CustomEvent('chubuk_topup_history_updated'));
    } catch {}

    return {
      success: true,
      rewardAttempts: task.rewardAttempts,
      rewardCoins: task.rewardCoins,
      message: `Награда зачислена! +${task.rewardAttempts} попыток и +${task.rewardCoins.toLocaleString('ru-RU')} $CHUBUK!`
    };
  } catch {
    return { success: false, rewardAttempts: 0, rewardCoins: 0, message: 'Ошибка при сохранении награды' };
  }
};

// --- RUBLE / SBP / CARD PAYMENT SIMULATION & PROCESSING ---

export interface PaymentReceipt {
  orderId: string;
  pkgTitle: string;
  priceRub: number;
  attemptsAdded: number;
  bonusCoins: number;
  isVip: boolean;
  timestamp: number;
  paymentMethod: 'sbp' | 'card' | 'yoomoney' | 'stars';
}

export const processMoneyPayment = (
  pkg: MoneyPackage,
  method: 'sbp' | 'card' | 'yoomoney' | 'stars' = 'sbp'
): PaymentReceipt => {
  const orderId = `CHK-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

  if (pkg.isVip) {
    if (pkg.vipDays && pkg.vipDays >= 365) {
      localStorage.setItem('chubuk_vip_unlocked', 'true');
    } else {
      const exp = Date.now() + (pkg.vipDays || 30) * 24 * 3600 * 1000;
      localStorage.setItem('chubuk_vip_expires_at', exp.toString());
    }
    window.dispatchEvent(new CustomEvent('chubuk_admin_state_changed', { detail: { isVip: true } }));
  } else {
    addBonusAttempts(pkg.attempts, `Покупка пакета "${pkg.title}" (${pkg.priceRub} ₽)`);
  }

  if (pkg.bonusCoins) {
    addTapperCoins(pkg.bonusCoins);
  }

  window.dispatchEvent(new CustomEvent('chubuk_usage_updated'));

  const receipt: PaymentReceipt = {
    orderId,
    pkgTitle: pkg.title,
    priceRub: pkg.priceRub,
    attemptsAdded: pkg.attempts,
    bonusCoins: pkg.bonusCoins || 0,
    isVip: !!pkg.isVip,
    timestamp: Date.now(),
    paymentMethod: method
  };

  try {
    const receiptsRaw = localStorage.getItem('chubuk_payment_receipts_v1');
    const receipts = receiptsRaw ? JSON.parse(receiptsRaw) : [];
    receipts.unshift(receipt);
    localStorage.setItem('chubuk_payment_receipts_v1', JSON.stringify(receipts.slice(0, 20)));

    // Also record in topup transaction log
    const historyRaw = localStorage.getItem('chubuk_topup_transactions_history_v1');
    const history = historyRaw ? JSON.parse(historyRaw) : [];
    history.unshift({
      id: receipt.orderId,
      type: 'purchase_rub',
      title: `Покупка: ${pkg.title}`,
      amountAttempts: pkg.isVip ? 999 : pkg.attempts,
      amountCoins: pkg.bonusCoins || 0,
      priceFormatted: `${pkg.priceRub} ₽ (${method.toUpperCase()})`,
      timestamp: receipt.timestamp,
      status: 'completed',
      details: pkg.description
    });
    localStorage.setItem('chubuk_topup_transactions_history_v1', JSON.stringify(history.slice(0, 50)));
    window.dispatchEvent(new CustomEvent('chubuk_topup_history_updated'));
  } catch {}

  return receipt;
};

// --- PIN & PROMO CODE HELPERS ---

export const unlockAdminWithPin = (pin: string, user?: any): boolean => {
  const cleanPin = pin.trim().toLowerCase();
  const isOwner = user?.email === 'zeros20001@gmail.com';
  
  if (isOwner || ADMIN_PINS.includes(cleanPin)) {
    try {
      sessionStorage.setItem('chubuk_admin_unlocked', 'true');
      localStorage.setItem('chubuk_is_admin_mode', 'true');
      window.dispatchEvent(new CustomEvent('chubuk_admin_state_changed', { detail: { isAdmin: true } }));
      window.dispatchEvent(new CustomEvent('chubuk_usage_updated'));
    } catch {}
    return true;
  }
  return false;
};

export const lockAdmin = (): void => {
  try {
    sessionStorage.removeItem('chubuk_admin_unlocked');
    localStorage.removeItem('chubuk_is_admin_mode');
    window.dispatchEvent(new CustomEvent('chubuk_admin_state_changed', { detail: { isAdmin: false } }));
    window.dispatchEvent(new CustomEvent('chubuk_usage_updated'));
  } catch {}
};

export const redeemPromoCode = (inputCode: string): { success: boolean; message: string; type?: string } => {
  const code = inputCode.trim().toUpperCase();
  if (!code) {
    return { success: false, message: 'Введите промокод' };
  }

  if (VIP_PROMO_CODES[code]) {
    const desc = VIP_PROMO_CODES[code];
    try {
      localStorage.setItem('chubuk_vip_unlocked', 'true');
      localStorage.setItem('chubuk_active_promo', code);
      window.dispatchEvent(new CustomEvent('chubuk_admin_state_changed', { detail: { isVip: true } }));
      window.dispatchEvent(new CustomEvent('chubuk_usage_updated'));
    } catch {}
    return {
      success: true,
      message: `Промокод активирован! ${desc}`,
      type: desc
    };
  }

  return {
    success: false,
    message: 'Неверный или устаревший промокод. Проверьте правильность ввода.'
  };
};

export const resetDailyAttempts = (): void => {
  try {
    localStorage.removeItem(getTodayKey());
    window.dispatchEvent(new CustomEvent('chubuk_usage_updated'));
  } catch {}
};

