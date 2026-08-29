/**
 * Referral & Top-up History Service
 * 
 * Provides:
 * - Top-up & transaction log persistence (purchases, wheel rewards, partner rewards, crypto swaps)
 * - Referral system: generates personal ref code / link, tracks invited friends,
 *   rewards both inviter and referee with +5 attempts.
 */

import { addBonusAttempts } from './usageLimitService';

export interface TopupTransaction {
  id: string;
  type: 'purchase_rub' | 'crypto_swap' | 'wheel_reward' | 'partner_task' | 'referral_bonus' | 'crypto_deposit';
  title: string;
  amountAttempts: number;
  amountCoins?: number;
  priceFormatted?: string;
  timestamp: number;
  status: 'completed' | 'pending';
  details?: string;
}

export interface InvitedFriend {
  id: string;
  name: string;
  date: string;
  bonusAwarded: number;
  status: 'active' | 'registered';
}

export interface ReferralStats {
  referralCode: string;
  totalInvited: number;
  totalAttemptsEarned: number;
  invitedList: InvitedFriend[];
}

const TOPUP_HISTORY_KEY = 'chubuk_topup_transactions_history_v1';
const REFERRAL_CODE_KEY = 'chubuk_user_referral_code_v1';
const REFERRAL_STATS_KEY = 'chubuk_user_referral_stats_v1';
const REFERRED_BY_KEY = 'chubuk_referred_by_applied_v1';

/**
 * Get or create unique referral code for user
 */
export const getUserReferralCode = (userId?: string): string => {
  if (typeof window === 'undefined') return 'CHUBUK-777';
  try {
    let saved = localStorage.getItem(REFERRAL_CODE_KEY);
    if (!saved) {
      if (userId && userId.length >= 5) {
        saved = `CHK-${userId.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      } else {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        saved = `CHK-${rand}-${Math.floor(100 + Math.random() * 900)}`;
      }
      localStorage.setItem(REFERRAL_CODE_KEY, saved);
    }
    return saved;
  } catch {
    return 'CHK-ORACLE-777';
  }
};

/**
 * Get referral statistics & invited friends
 */
export const getReferralStats = (userId?: string): ReferralStats => {
  const code = getUserReferralCode(userId);
  if (typeof window === 'undefined') {
    return {
      referralCode: code,
      totalInvited: 0,
      totalAttemptsEarned: 0,
      invitedList: []
    };
  }

  try {
    const raw = localStorage.getItem(REFERRAL_STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        referralCode: code,
        totalInvited: parsed.totalInvited || (parsed.invitedList ? parsed.invitedList.length : 0),
        totalAttemptsEarned: parsed.totalAttemptsEarned || 0,
        invitedList: parsed.invitedList || []
      };
    }

    // Default starting seeded demo friends if empty for rich UI representation
    const defaultStats: ReferralStats = {
      referralCode: code,
      totalInvited: 2,
      totalAttemptsEarned: 10,
      invitedList: [
        {
          id: 'ref-1',
          name: 'Мария К. (Таро & Матрица)',
          date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
          bonusAwarded: 5,
          status: 'active'
        },
        {
          id: 'ref-2',
          name: 'Алексей Д. (Астрология)',
          date: new Date(Date.now() - 86400000 * 4).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
          bonusAwarded: 5,
          status: 'active'
        }
      ]
    };
    localStorage.setItem(REFERRAL_STATS_KEY, JSON.stringify(defaultStats));
    return defaultStats;
  } catch {
    return {
      referralCode: code,
      totalInvited: 0,
      totalAttemptsEarned: 0,
      invitedList: []
    };
  }
};

/**
 * Apply a friend's referral code when arriving via referral link
 * Rewards both with +5 attempts
 */
export const applyReferralCode = (inputCode: string): { success: boolean; message: string; attemptsBonus?: number } => {
  const clean = inputCode.trim().toUpperCase();
  if (!clean) return { success: false, message: 'Введите код приглашения' };

  const ownCode = getUserReferralCode();
  if (clean === ownCode) {
    return { success: false, message: 'Вы не можете активировать собственный реферальный код!' };
  }

  try {
    const alreadyReferred = localStorage.getItem(REFERRED_BY_KEY);
    if (alreadyReferred) {
      return { success: false, message: `Вы уже активировали реферальный бонус ранее (код: ${alreadyReferred})` };
    }

    // Award +5 attempts to current user
    addBonusAttempts(5, `Реферальный бонус от друга (${clean})`);
    localStorage.setItem(REFERRED_BY_KEY, clean);

    // Record in transaction history
    recordTopupTransaction({
      type: 'referral_bonus',
      title: 'Бонус за приглашение от друга',
      amountAttempts: 5,
      details: `Активация кода: ${clean}`,
      status: 'completed'
    });

    window.dispatchEvent(new CustomEvent('chubuk_referral_updated'));
    window.dispatchEvent(new CustomEvent('chubuk_usage_updated'));

    return {
      success: true,
      message: '🎉 Реферальный код успешно применен! Вам начислено +5 попыток!',
      attemptsBonus: 5
    };
  } catch {
    return { success: false, message: 'Ошибка при активации реферального кода' };
  }
};

/**
 * Simulate a new friend joining via user's link
 */
export const simulateFriendJoined = (friendName?: string): { success: boolean; message: string; bonus: number } => {
  try {
    const stats = getReferralStats();
    const name = friendName || `Искатель #${Math.floor(1000 + Math.random() * 9000)}`;
    const newFriend: InvitedFriend = {
      id: `inv-${Date.now()}`,
      name,
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      bonusAwarded: 5,
      status: 'active'
    };

    stats.invitedList.unshift(newFriend);
    stats.totalInvited += 1;
    stats.totalAttemptsEarned += 5;
    localStorage.setItem(REFERRAL_STATS_KEY, JSON.stringify(stats));

    addBonusAttempts(5, `Друг ${name} присоединился по вашей ссылке`);

    recordTopupTransaction({
      type: 'referral_bonus',
      title: `Друг перешел по вашей ссылке: ${name}`,
      amountAttempts: 5,
      details: `Реферальная награда за приглашение`,
      status: 'completed'
    });

    window.dispatchEvent(new CustomEvent('chubuk_referral_updated'));
    window.dispatchEvent(new CustomEvent('chubuk_usage_updated'));

    return {
      success: true,
      message: `🎉 По вашей ссылке зарегистрировался ${name}! Вам начислено +5 попыток!`,
      bonus: 5
    };
  } catch {
    return { success: false, message: 'Ошибка начисления реферального бонуса', bonus: 0 };
  }
};

/**
 * Top-up / Transactions History Management
 */
export const getTopupHistory = (): TopupTransaction[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TOPUP_HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }

    // Default seeded initial transactions so history is immediately illustrative and pleasant
    const defaultHistory: TopupTransaction[] = [
      {
        id: `tx-init-1`,
        type: 'partner_task',
        title: 'Яндекс Маркет: Просмотр сакральных товаров',
        amountAttempts: 7,
        amountCoins: 15000,
        timestamp: Date.now() - 3600000 * 2,
        status: 'completed',
        details: 'Успешная верификация задания'
      },
      {
        id: `tx-init-2`,
        type: 'wheel_reward',
        title: 'Колесо Фортуны: Сакральный спин',
        amountAttempts: 3,
        amountCoins: 0,
        timestamp: Date.now() - 86400000,
        status: 'completed',
        details: 'Сектор +3 глубоких расчета'
      },
      {
        id: `tx-init-3`,
        type: 'crypto_swap',
        title: 'Обмен $CHUBUK монет на попытки',
        amountAttempts: 10,
        amountCoins: -30000,
        priceFormatted: '30,000 $CHUBUK',
        timestamp: Date.now() - 86400000 * 3,
        status: 'completed',
        details: 'Пакет «Оракул» (10 попыток)'
      }
    ];

    localStorage.setItem(TOPUP_HISTORY_KEY, JSON.stringify(defaultHistory));
    return defaultHistory;
  } catch {
    return [];
  }
};

/**
 * Record a new topup/reward transaction
 */
export const recordTopupTransaction = (tx: Omit<TopupTransaction, 'id' | 'timestamp'>): TopupTransaction => {
  const fullTx: TopupTransaction = {
    ...tx,
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now()
  };

  try {
    const history = getTopupHistory();
    history.unshift(fullTx);
    localStorage.setItem(TOPUP_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    window.dispatchEvent(new CustomEvent('chubuk_topup_history_updated', { detail: fullTx }));
  } catch (e) {
    console.warn('Failed to record transaction', e);
  }

  return fullTx;
};
