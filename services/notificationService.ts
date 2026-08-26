import { UserInput, MatrixNumbers, BestDatesQueryResult } from '../types';
import { calculateMatrixArcana, calculateLifePathNumber } from './numerologyUtils';
import { calculateLunarData } from './lunarUtils';
import { findBestFavorableDates } from './electiveUtils';
import { generateMonthPowerCalendar } from './powerCalendarUtils';

export interface CustomReminder {
  id: string;
  title: string;
  description?: string;
  category: 'daily' | 'wealth' | 'love' | 'business' | 'wedding' | 'property' | 'travel' | 'health' | 'lunar' | 'biorhythm' | 'custom';
  targetDate: string; // YYYY-MM-DD
  targetTime: string; // HH:MM e.g. "09:00"
  createdAt: number;
  isSent: boolean;
  repeatWeekly?: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  dailyForecastEnabled: boolean;
  dailyForecastTime: string; // e.g. "08:30"
  favorableDatesEnabled: boolean;
  favorableDatesAdvanceDays: number; // 0 = on day, 1 = day before
  lunarEventsEnabled: boolean;
  biorhythmCriticalEnabled: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  lastDailySentDate?: string;
  lastFavorableSentDate?: string;
  customReminders: CustomReminder[];
}

const STORAGE_KEY = 'chubuk_push_notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  dailyForecastEnabled: true,
  dailyForecastTime: '08:30',
  favorableDatesEnabled: true,
  favorableDatesAdvanceDays: 1,
  lunarEventsEnabled: true,
  biorhythmCriticalEnabled: true,
  soundEnabled: true,
  vibrateEnabled: true,
  customReminders: []
};

// 1. Permission status check
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// 2. Request Permission
export async function requestNotificationPermission(): Promise<{
  granted: boolean;
  permission: NotificationPermission | 'unsupported';
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { granted: false, permission: 'unsupported' };
  }

  try {
    const perm = await Notification.requestPermission();
    const granted = perm === 'granted';
    
    // Auto-update settings enabled flag if granted
    if (granted) {
      const current = getNotificationSettings();
      saveNotificationSettings({ ...current, enabled: true });
    }

    return { granted, permission: perm };
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return { granted: false, permission: Notification.permission };
  }
}

// 3. Settings persistence
export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      customReminders: Array.isArray(parsed.customReminders) ? parsed.customReminders : []
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Trigger custom window event for instant UI reactive sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chubuk_notifications_updated', { detail: settings }));
    }
  } catch (err) {
    console.error('Failed to save notification settings:', err);
  }
}

// 4. Custom Reminders Scheduler Helpers
export function addCustomReminder(reminder: Omit<CustomReminder, 'id' | 'createdAt' | 'isSent'>): CustomReminder {
  const settings = getNotificationSettings();
  const newReminder: CustomReminder = {
    ...reminder,
    id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: Date.now(),
    isSent: false
  };

  const updatedReminders = [newReminder, ...settings.customReminders];
  saveNotificationSettings({
    ...settings,
    customReminders: updatedReminders
  });

  return newReminder;
}

export function removeCustomReminder(id: string): void {
  const settings = getNotificationSettings();
  const updatedReminders = settings.customReminders.filter(r => r.id !== id);
  saveNotificationSettings({
    ...settings,
    customReminders: updatedReminders
  });
}

// 5. Send Notification (via ServiceWorker registration or Notification API fallback)
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  tab?: string;
  vibrate?: number[];
  actions?: { action: string; title: string }[];
}

export async function sendLocalNotification(payload: NotificationPayload): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (Notification.permission !== 'granted') {
    console.warn('Notifications permission is not granted');
    return false;
  }

  const defaultIcon = '/icon-192.png';
  const defaultBadge = '/favicon-32x32.png';
  const vibratePattern = payload.vibrate || [150, 75, 150];

  // Try Service Worker registration first (works in background & mobile PWA)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await (reg.showNotification as any)(payload.title, {
          body: payload.body,
          icon: payload.icon || defaultIcon,
          badge: payload.badge || defaultBadge,
          tag: payload.tag || `chubuk-${Date.now()}`,
          renotify: true,
          vibrate: vibratePattern,
          data: {
            url: payload.url || `/?tab=${payload.tab || 'daily'}`,
            tab: payload.tab || 'daily',
            timestamp: Date.now()
          },
          actions: payload.actions || [
            { action: 'open_tab', title: '✨ Открыть' }
          ]
        });
        return true;
      }
    } catch (swErr) {
      console.warn('SW showNotification failed, falling back to Notification constructor:', swErr);
    }
  }

  // Fallback to direct Notification instance
  try {
    const notif = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || defaultIcon,
      badge: payload.badge || defaultBadge,
      tag: payload.tag || `chubuk-${Date.now()}`,
      data: {
        url: payload.url || `/?tab=${payload.tab || 'daily'}`,
        tab: payload.tab || 'daily',
        timestamp: Date.now()
      }
    } as any);

    notif.onclick = function () {
      window.focus();
      if (payload.tab) {
        window.dispatchEvent(new CustomEvent('chubuk_navigate_tab', { detail: { tab: payload.tab } }));
      }
      this.close();
    };

    return true;
  } catch (err) {
    console.error('Error creating Notification:', err);
    return false;
  }
}

// 6. Test Push Notification
export async function sendTestPushNotification(userName?: string): Promise<boolean> {
  const nameGreeting = userName ? `, ${userName}` : '';
  return await sendLocalNotification({
    title: '✨ Старец Чубук — Тест Уведомлений',
    body: `Приветствую${nameGreeting}! Система push-уведомлений активна. Вы будете получать утренние прогнозы и сигналы о лучших датах.`,
    tab: 'daily',
    url: '/?tab=daily',
    tag: 'chubuk-test-notification',
    vibrate: [200, 100, 200, 100, 300],
    actions: [
      { action: 'open_forecast', title: '🔮 Открыть Прогноз' },
      { action: 'open_calendar', title: '📅 Даты Силы' }
    ]
  });
}

// 7. Check & Trigger Scheduled Notifications
export async function checkAndTriggerScheduledNotifications(
  userInput?: UserInput | null,
  matrix?: MatrixNumbers | null
): Promise<{ triggeredCount: number }> {
  if (typeof window === 'undefined') return { triggeredCount: 0 };
  if (Notification.permission !== 'granted') return { triggeredCount: 0 };

  const settings = getNotificationSettings();
  if (!settings.enabled) return { triggeredCount: 0 };

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  let triggeredCount = 0;
  let updatedSettings = { ...settings };

  // --- Channel A: Daily Morning Forecast ---
  if (settings.dailyForecastEnabled) {
    const isPastScheduledTime = currentTimeStr >= settings.dailyForecastTime;
    const notSentToday = settings.lastDailySentDate !== todayStr;

    if (isPastScheduledTime && notSentToday) {
      // Calculate today's Arcana
      const dayArcana = calculateMatrixArcana(now.getDate() + (now.getMonth() + 1) + now.getFullYear());
      const lunar = calculateLunarData(now);
      const name = userInput?.name ? `${userInput.name}, ` : '';

      const titles: Record<number, string> = {
        1: 'Маг (Воля и Инициатива)',
        2: 'Жрица (Интуиция и Тайна)',
        3: 'Императрица (Плодородие и Любовь)',
        4: 'Император (Порядок и Бизнес)',
        5: 'Иерофант (Мудрость и Обучение)',
        6: 'Влюбленные (Сердечный Выбор)',
        7: 'Колесница (Победа и Прорыв)',
        8: 'Справедливость (Баланс и Карма)',
        9: 'Отшельник (Глубокое Познание)',
        10: 'Колесо Фортуны (Поток Удачи)',
        11: 'Сила (Энергия и Преодоление)',
        12: 'Повешенный (Новый Взгляд)',
        13: 'Трансформация (Перерождение)',
        14: 'Умеренность (Гармония и Баланс)',
        15: 'Дьявол (Искушения и Харизма)',
        16: 'Башня (Очищение от Старого)',
        17: 'Звезда (Вдохновение и Надежда)',
        18: 'Луна (Сновидения и Тайны)',
        19: 'Солнце (Радость и Триумф)',
        20: 'Страшный Суд (Родовое Пробуждение)',
        21: 'Мир (Космическое Расширение)',
        22: 'Шут (Свобода и Новые Начала)'
      };

      const arcanaName = titles[dayArcana] || `${dayArcana} Аркан`;

      await sendLocalNotification({
        title: `🌅 Прогноз Дня: ${arcanaName}`,
        body: `${name}Сегодня ${lunar.lunarDay} лунный день в ${lunar.zodiacSign}. Откройте персональный расклад и советы биоритмов на сегодня.`,
        tab: 'daily',
        url: '/?tab=daily',
        tag: `chubuk-daily-${todayStr}`,
        actions: [
          { action: 'open_forecast', title: '🔮 Читать Прогноз' }
        ]
      });

      updatedSettings.lastDailySentDate = todayStr;
      triggeredCount++;
    }
  }

  // --- Channel B: Favorable Planning Dates (Advance Alerts) ---
  if (settings.favorableDatesEnabled && settings.lastFavorableSentDate !== todayStr) {
    // Check if tomorrow or today is a top favorable date for business, wedding, or property
    const bestBusiness = findBestFavorableDates('business', userInput, 3);
    const bestWedding = findBestFavorableDates('wedding', userInput, 3);
    const bestProperty = findBestFavorableDates('property', userInput, 3);

    const checkDateTarget = settings.favorableDatesAdvanceDays === 1 
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000) 
      : now;

    const targetY = checkDateTarget.getFullYear();
    const targetM = String(checkDateTarget.getMonth() + 1).padStart(2, '0');
    const targetD = String(checkDateTarget.getDate()).padStart(2, '0');
    const targetDateStr = `${targetY}-${targetM}-${targetD}`;

    const matchingFavorable = [
      ...bestBusiness.topDates.map(r => ({ ...r, cat: 'Бизнес и Сделки', tab: 'elective' })),
      ...bestWedding.topDates.map(r => ({ ...r, cat: 'Любовь и Свадьба', tab: 'elective' })),
      ...bestProperty.topDates.map(r => ({ ...r, cat: 'Крупные Покупки', tab: 'elective' }))
    ].find(r => r.date === targetDateStr && r.score >= 82);

    if (matchingFavorable && currentTimeStr >= '10:00') {
      const whenLabel = settings.favorableDatesAdvanceDays === 1 ? 'Завтра' : 'Сегодня';
      await sendLocalNotification({
        title: `💎 Благоприятная Дата: ${matchingFavorable.cat}`,
        body: `${whenLabel} (${matchingFavorable.formattedDate}) — идеальный день с рейтингом ${matchingFavorable.score}%. Энергия: ${matchingFavorable.dayArcana} Аркан (${matchingFavorable.summary}).`,
        tab: 'elective',
        url: '/?tab=elective',
        tag: `chubuk-favorable-${targetDateStr}`,
        actions: [
          { action: 'open_calendar', title: '📅 Смотреть Дату' }
        ]
      });

      updatedSettings.lastFavorableSentDate = todayStr;
      triggeredCount++;
    }
  }

  // --- Channel C: Custom User Reminders on Specific Dates ---
  if (settings.customReminders.length > 0) {
    const updatedCustomReminders = await Promise.all(
      settings.customReminders.map(async (reminder) => {
        if (reminder.isSent) return reminder;

        // Check date match
        if (reminder.targetDate === todayStr && currentTimeStr >= reminder.targetTime) {
          await sendLocalNotification({
            title: `🔔 Напоминание: ${reminder.title}`,
            body: reminder.description || 'Наступило запланированное вами сакральное событие. Благоприятный момент для действия!',
            tab: reminder.category === 'daily' ? 'daily' : reminder.category === 'wealth' ? 'powercal' : 'elective',
            url: `/?tab=${reminder.category === 'daily' ? 'daily' : 'elective'}`,
            tag: `chubuk-custom-${reminder.id}`
          });
          triggeredCount++;
          return { ...reminder, isSent: true };
        }
        return reminder;
      })
    );

    updatedSettings.customReminders = updatedCustomReminders;
  }

  // Save state changes if any
  if (triggeredCount > 0) {
    saveNotificationSettings(updatedSettings);
  }

  return { triggeredCount };
}
