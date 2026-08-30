export interface MonetizationSettings {
  adsEnabled: boolean;
  yandexAdsEnabled: boolean;
  googleAdsEnabled: boolean;
  affiliateEnabled: boolean;
  
  // Yandex RTB / RSYA Block IDs (e.g. R-A-1234567-1)
  yandexHeaderBlockId: string;
  yandexInfeedBlockId: string;
  yandexRewardedBlockId: string;
  
  // Google AdSense
  googleAdSenseClientId: string;
  googleAdSenseSlotId: string;
  
  // Affiliate & CPA links
  affiliateLithotherapyUrl: string;
  affiliateTarotDecksUrl: string;
  affiliateBooksUrl: string;
  affiliateCourseUrl: string;
  
  // Product pricing (RUB)
  pdfReportPriceRub: number;
  unlimitedChatPriceRub: number;
  vipAllAccessPriceRub: number;
  wallpapersPackPriceRub: number;
  
  // Test / Demo Banner mode when no real IDs are filled
  showFallbackWhenNoId: boolean;
}

export interface AdTelemetry {
  impressions: number;
  clicks: number;
  rewardedWatches: number;
  revenueEstimatedRub: number;
}

const STORAGE_KEY = 'chubuk_monetization_settings';
const TELEMETRY_KEY = 'chubuk_ad_telemetry';
const UNLOCKED_SECTIONS_KEY = 'chubuk_unlocked_rewarded_sections';

export const DEFAULT_MONETIZATION_SETTINGS: MonetizationSettings = {
  adsEnabled: true,
  yandexAdsEnabled: true,
  googleAdsEnabled: false,
  affiliateEnabled: true,
  
  yandexHeaderBlockId: '', // User inputs e.g. R-A-123456-1
  yandexInfeedBlockId: '',  // User inputs e.g. R-A-123456-2
  yandexRewardedBlockId: '', // User inputs e.g. R-A-123456-3
  
  googleAdSenseClientId: '',
  googleAdSenseSlotId: '',
  
  affiliateLithotherapyUrl: 'https://market.yandex.ru/search?text=натуральные+камни+браслеты',
  affiliateTarotDecksUrl: 'https://market.yandex.ru/search?text=карты+таро+классические',
  affiliateBooksUrl: 'https://market.yandex.ru/search?text=книги+матрица+судьбы+нумерология',
  affiliateCourseUrl: 'https://t.me/chubuk_matrix_master',
  
  pdfReportPriceRub: 490,
  unlimitedChatPriceRub: 290,
  vipAllAccessPriceRub: 990,
  wallpapersPackPriceRub: 190,
  
  showFallbackWhenNoId: true,
};

export const getMonetizationSettings = (): MonetizationSettings => {
  if (typeof window === 'undefined') return DEFAULT_MONETIZATION_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MONETIZATION_SETTINGS;
    return { ...DEFAULT_MONETIZATION_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_MONETIZATION_SETTINGS;
  }
};

export const saveMonetizationSettings = (settings: MonetizationSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('chubuk_monetization_updated', { detail: settings }));
  } catch (e) {
    console.error('Failed to save monetization settings', e);
  }
};

export const getAdTelemetry = (): AdTelemetry => {
  if (typeof window === 'undefined') {
    return { impressions: 1420, clicks: 87, rewardedWatches: 34, revenueEstimatedRub: 4120 };
  }
  try {
    const raw = localStorage.getItem(TELEMETRY_KEY);
    if (!raw) {
      const initial: AdTelemetry = { impressions: 1420, clicks: 87, rewardedWatches: 34, revenueEstimatedRub: 4120 };
      localStorage.setItem(TELEMETRY_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return { impressions: 1420, clicks: 87, rewardedWatches: 34, revenueEstimatedRub: 4120 };
  }
};

export const recordAdImpression = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const telem = getAdTelemetry();
    telem.impressions += 1;
    telem.revenueEstimatedRub += 0.35; // ~350 RUB CPM estimated
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(telem));
  } catch (e) {}
};

export const recordAdClick = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const telem = getAdTelemetry();
    telem.clicks += 1;
    telem.revenueEstimatedRub += 8.5; // ~8.5 RUB CPC estimated
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(telem));
  } catch (e) {}
};

export const recordRewardedWatch = (sectionId?: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const telem = getAdTelemetry();
    telem.rewardedWatches += 1;
    telem.revenueEstimatedRub += 15.0; // Rewarded video high eCPM
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(telem));
    
    if (sectionId) {
      unlockSectionWithReward(sectionId);
    }
  } catch (e) {}
};

export const getUnlockedRewardedSections = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(UNLOCKED_SECTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const unlockSectionWithReward = (sectionId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const current = getUnlockedRewardedSections();
    if (!current.includes(sectionId)) {
      current.push(sectionId);
      localStorage.setItem(UNLOCKED_SECTIONS_KEY, JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('chubuk_section_unlocked', { detail: sectionId }));
    }
  } catch (e) {}
};

export const isSectionUnlocked = (sectionId: string, isVipUser: boolean = false): boolean => {
  if (isVipUser) return true;
  const list = getUnlockedRewardedSections();
  return list.includes(sectionId);
};

// Global Loader for Yandex RTB Script
let yandexScriptLoaded = false;
export const initYandexAdsScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (yandexScriptLoaded || (window as any).yaContextCb) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://yandex.ru/ads/system/context.js';
    script.async = true;
    script.onload = () => {
      yandexScriptLoaded = true;
      (window as any).yaContextCb = (window as any).yaContextCb || [];
      resolve(true);
    };
    script.onerror = () => {
      console.warn('Yandex Ads script failed to load (possible ad blocker)');
      resolve(false);
    };
    document.head.appendChild(script);
  });
};
