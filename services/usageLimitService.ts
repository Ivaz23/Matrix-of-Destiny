/**
 * Usage Limit & Secret Admin Security Service for Chubuk Matrix
 * 
 * Provides:
 * - 3 free daily attempts for regular users (Tarot, Horary, Deep Matrix calculations)
 * - Infinite/unlimited attempts for Authenticated Admins and VIP Promo code holders
 * - Master Admin PIN authentication and secret access management
 */

export const MAX_FREE_ATTEMPTS = 3;

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
    return localStorage.getItem('chubuk_vip_unlocked') === 'true';
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

export const getRemainingAttempts = (user?: any): number => {
  if (isUserAdmin(user) || isVipUnlocked()) {
    return Infinity;
  }
  const used = getUsageCount();
  return Math.max(0, MAX_FREE_ATTEMPTS - used);
};

export const checkCanPerformAction = (user?: any): {
  allowed: boolean;
  remaining: number;
  max: number;
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
      isAdmin: admin,
      isVip: vip
    };
  }

  const used = getUsageCount();
  const remaining = Math.max(0, MAX_FREE_ATTEMPTS - used);

  return {
    allowed: remaining > 0,
    remaining,
    max: MAX_FREE_ATTEMPTS,
    isAdmin: false,
    isVip: false
  };
};

export const recordActionUsage = (user?: any): {
  allowed: boolean;
  remaining: number;
  used: number;
  isAdmin: boolean;
} => {
  const admin = isUserAdmin(user);
  const vip = isVipUnlocked();

  if (admin || vip) {
    return {
      allowed: true,
      remaining: Infinity,
      used: 0,
      isAdmin: true
    };
  }

  const currentUsed = getUsageCount();
  if (currentUsed >= MAX_FREE_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      used: currentUsed,
      isAdmin: false
    };
  }

  const nextUsed = currentUsed + 1;
  try {
    localStorage.setItem(getTodayKey(), nextUsed.toString());
    window.dispatchEvent(new CustomEvent('chubuk_usage_updated', {
      detail: { used: nextUsed, remaining: Math.max(0, MAX_FREE_ATTEMPTS - nextUsed) }
    }));
  } catch (e) {
    console.warn('Failed to record usage attempt', e);
  }

  return {
    allowed: true,
    remaining: Math.max(0, MAX_FREE_ATTEMPTS - nextUsed),
    used: nextUsed,
    isAdmin: false
  };
};

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
