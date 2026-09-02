import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  MessageCircle, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Loader2, 
  Smartphone, 
  Mic, 
  RefreshCw, 
  ChevronRight, 
  Compass, 
  Heart, 
  Layers,
  Sun,
  Flame,
  Scroll,
  Calendar,
  Share2,
  FileDown
} from 'lucide-react';

import InputForm from './components/InputForm';
import MatrixVisual from './components/MatrixVisual';
import { DailyArcanaWidget } from './components/DailyArcanaWidget';
import { AppHeader } from './components/AppHeader';
import { AppCategoryRibbon } from './components/AppCategoryRibbon';
import { AndroidBottomBar } from './components/AndroidBottomBar';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { AuthModal } from './components/AuthModal';
import { MatrixOnboardingGuide } from './components/MatrixOnboardingGuide';
import { PushNotificationModal } from './components/PushNotificationModal';
import { AppSidebarNavigation, AppNavTabId } from './components/AppSidebarNavigation';
import { SecretAdminModal } from './components/SecretAdminModal';
import { UsageLimitModal } from './components/UsageLimitModal';
import { useAndroidInstall } from './hooks/useAndroidInstall';
import { checkAndTriggerScheduledNotifications } from './services/notificationService';
import { checkCanPerformAction, recordActionUsage, isUserAdmin } from './services/usageLimitService';

// Lazy load heavy section modules
const OrderSection = lazy(() => import('./components/OrderSection'));
const AnalysisResults = lazy(() => import('./components/AnalysisResults'));
const NumerologistChat = lazy(() => import('./components/NumerologistChat'));
const TarotSection = lazy(() => import('./components/TarotSection'));
const AstrologySection = lazy(() => import('./components/AstrologySection'));
const HorarySection = lazy(() => import('./components/HorarySection'));
const CompatibilitySection = lazy(() => import('./components/CompatibilitySection'));
const ProfileSection = lazy(() => import('./components/ProfileSection'));
const DailyForecastSection = lazy(() => import('./components/DailyForecastSection'));
const LunarCalendarSection = lazy(() => import('./components/LunarCalendarSection'));
const ElectiveDatesSection = lazy(() => import('./components/ElectiveDatesSection'));
const LithotherapySection = lazy(() => import('./components/LithotherapySection'));
const AncestralLineageSection = lazy(() => import('./components/AncestralLineageSection'));
const DreamOracleSection = lazy(() => import('./components/DreamOracleSection'));
const CitiesOfPowerSection = lazy(() => import('./components/CitiesOfPowerSection'));
const AmbientSoundTherapy = lazy(() => import('./components/AmbientSoundTherapy'));
const SacredWallpapersSection = lazy(() => import('./components/SacredWallpapersSection'));
const ChakrasSection = lazy(() => import('./components/ChakrasSection'));
const AkashicRecordsSection = lazy(() => import('./components/AkashicRecordsSection'));
const PowerCalendarSection = lazy(() => import('./components/PowerCalendarSection'));
const KarmaTapperSection = lazy(() => import('./components/KarmaTapperSection'));
const MeditationCenter = lazy(() => import('./components/MeditationCenter'));
const KeyToPsychologySection = lazy(() => import('./components/KeyToPsychologySection').then(m => ({ default: m.KeyToPsychologySection })));
const PsychologicalPortraitSection = lazy(() => import('./components/PsychologicalPortraitSection').then(m => ({ default: m.PsychologicalPortraitSection })));
const CachingSection = lazy(() => import('./components/CachingSection'));
const LifespanSection = lazy(() => import('./components/LifespanSection'));
const FaqSection = lazy(() => import('./components/FaqSection'));
const AdminPanelSection = lazy(() => import('./components/AdminPanelSection'));
const AffiliateMarketSection = lazy(() => import('./components/AffiliateMarketSection').then(m => ({ default: m.AffiliateMarketSection })));

import { YandexAdBanner } from './components/YandexAdBanner';

import { calculateMatrix } from './services/numerologyUtils';
import { getAstrologyData } from './services/astrologyUtils';
import { generateAnalysis, generateAstrologyAnalysis, generateMysticalBackground } from './services/geminiService';
import { UserInput, MatrixNumbers, AnalysisResult, AstrologyData, SavedCalculation, TarotReading, CompatibilityResult, HoraryResult } from './types';
import { useAuth } from './hooks/useAuth';
import { useFirestore } from './hooks/useFirestore';
import { AudioProvider } from './src/hooks/useGlobalAudio';

export const App: React.FC = () => {
  const { user, signIn, signOut, loading: authLoading } = useAuth();
  const { calculations: dbCalculations, saveCalculation, mergeLocalCalculations, deleteCalculation, loading: dbLoading } = useFirestore(user?.uid);
  const { isInstallable, isStandalone, isAndroid, triggerInstall, triggerHaptic } = useAndroidInstall();

  const [matrix, setMatrix] = useState<MatrixNumbers | null>(null);
  const [astrology, setAstrology] = useState<AstrologyData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AppNavTabId>('matrix');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isUsageLimitModalOpen, setIsUsageLimitModalOpen] = useState(false);
  const [usageLimitModalTab, setUsageLimitModalTab] = useState<'crypto' | 'wheel' | 'partner' | 'money' | 'promo' | 'crypto_pay'>('crypto');
  const [localCalculations, setLocalCalculations] = useState<SavedCalculation[]>([]);
  
  const savedCalculations = user ? dbCalculations : localCalculations;
  
  const calculatorRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Background Push Notification Scheduler & Deep-linking Listener
  useEffect(() => {
    // 1. Check immediately
    checkAndTriggerScheduledNotifications(userInput, matrix);

    // 2. Periodic checking every 60 seconds
    const interval = setInterval(() => {
      checkAndTriggerScheduledNotifications(userInput, matrix);
    }, 60000);

    // 3. Check on tab visibility restoration
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndTriggerScheduledNotifications(userInput, matrix);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // 4. Listen for navigation message from Service Worker (when user clicks on notification)
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE_TAB' && event.data.tab) {
        setActiveTab(event.data.tab as AppNavTabId);
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSwMessage);

    const handleCustomNavigate = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab as AppNavTabId);
      }
    };
    window.addEventListener('chubuk_navigate_tab', handleCustomNavigate);

    const handleOpenUsageModal = (e: any) => {
      if (e.detail?.tab) {
        setUsageLimitModalTab(e.detail.tab);
      }
      setIsUsageLimitModalOpen(true);
    };
    window.addEventListener('chubuk_open_usage_limit_modal', handleOpenUsageModal);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      navigator.serviceWorker?.removeEventListener('message', handleSwMessage);
      window.removeEventListener('chubuk_navigate_tab', handleCustomNavigate);
      window.removeEventListener('chubuk_open_usage_limit_modal', handleOpenUsageModal);
    };
  }, [userInput, matrix]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  useEffect(() => {
    try {
      // Check URL parameters for Android Shortcuts
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        const validTabs: AppNavTabId[] = [
          'matrix', 'meditation', 'tapper', 'wallpapers', 'chakras', 'akashic', 'powercal', 'daily',
          'lunar', 'elective', 'ancestral', 'litho', 'dreams', 'cities',
          'astrology', 'compatibility', 'tarot', 'horary', 'profile'
        ];
        if (validTabs.includes(tabParam as AppNavTabId)) {
          setActiveTab(tabParam as AppNavTabId);
        }
      }

      const savedInput = localStorage.getItem('chubuk_user_input');
      const savedMatrix = localStorage.getItem('chubuk_matrix_data');
      const savedHistory = localStorage.getItem('chubuk_history');
      
      if (savedInput && savedMatrix) {
        const input = JSON.parse(savedInput);
        setUserInput(input);
        setMatrix(JSON.parse(savedMatrix));
        setAstrology(getAstrologyData(input.birthDate));
      }

      if (savedHistory) {
        setLocalCalculations(JSON.parse(savedHistory));
      }
      
      setIsAppReady(true);
    } catch (e) { 
      console.error(e);
      setIsAppReady(true);
    }
  }, []);

  // Auto-sync local calculations to Firestore when signed in if enabled
  useEffect(() => {
    if (!user || !user.uid || localCalculations.length === 0) return;
    
    try {
      const autoSync = localStorage.getItem('chubuk_auto_sync_history');
      if (autoSync === null || autoSync === 'true') {
        const syncKey = `chubuk_synced_${user.uid}_${localCalculations.length}`;
        const hasSynced = sessionStorage.getItem(syncKey);
        if (!hasSynced) {
          sessionStorage.setItem(syncKey, 'true');
          mergeLocalCalculations(localCalculations).then((res) => {
            if (res.mergedCount > 0) {
              showToast(`Автоматически синхронизировано ${res.mergedCount} расчетов`);
            }
          }).catch((err) => {
            console.warn("Auto-sync background error:", err);
          });
        }
      }
    } catch (e) {}
  }, [user?.uid, localCalculations.length]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCalculate = async (input: UserInput) => {
    triggerHaptic(20);

    // Enforce daily usage limit for non-admin/VIP users
    const check = checkCanPerformAction(user);
    if (!check.allowed) {
      setIsUsageLimitModalOpen(true);
      return;
    }

    // Record action consumption
    recordActionUsage(user);

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setMatrix(null);
    setAstrology(null);
    setUserInput(input);
    try {
      const calculatedMatrix = calculateMatrix(input.birthDate);
      const calculatedAstro = getAstrologyData(input.birthDate);
      setMatrix(calculatedMatrix);
      setAstrology(calculatedAstro);
      
      localStorage.setItem('chubuk_user_input', JSON.stringify(input));
      localStorage.setItem('chubuk_matrix_data', JSON.stringify(calculatedMatrix));
      
      const [aiResult, astroResult] = await Promise.all([
        generateAnalysis(input, calculatedMatrix),
        generateAstrologyAnalysis(input, calculatedAstro)
      ]);
      
      setAnalysis(aiResult);
      
      // Save to history
      const newCalc: SavedCalculation = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        input,
        matrix: calculatedMatrix,
        astrology: calculatedAstro,
        analysis: aiResult,
        astrologyResult: astroResult
      };
      const updatedHistory = [newCalc, ...savedCalculations.slice(0, 19)];
      if (user) {
        await saveCalculation(newCalc);
      } else {
        setLocalCalculations(updatedHistory);
        localStorage.setItem('chubuk_history', JSON.stringify(updatedHistory));
      }

      showToast("Энергии и натальная карта рассчитаны");
      
      generateMysticalBackground(input.name).then(img => {
        if (img) setBgImage(img);
      });

      // Launch onboarding guide for new users on their first calculation
      try {
        const hasCompletedOnboarding = localStorage.getItem('chubuk_matrix_onboarding_done');
        if (!hasCompletedOnboarding) {
          setTimeout(() => {
            setIsOnboardingOpen(true);
          }, 800);
        }
      } catch (e) {
        // ignore
      }

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
    } catch (err) {
      setError("Энергии не ответили. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCalculation = (calc: SavedCalculation) => {
    triggerHaptic(12);
    setUserInput(calc.input);
    setMatrix(calc.matrix);
    setAstrology(calc.astrology);
    setAnalysis(null);
    setActiveTab('matrix');
    localStorage.setItem('chubuk_user_input', JSON.stringify(calc.input));
    localStorage.setItem('chubuk_matrix_data', JSON.stringify(calc.matrix));
    showToast(`Загружен профиль: ${calc.input.name}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCalculation = async (id: string) => {
    triggerHaptic(10);
    if (user) {
      await deleteCalculation(id);
    } else {
      const updatedHistory = localCalculations.filter(c => c.id !== id);
      setLocalCalculations(updatedHistory);
      localStorage.setItem('chubuk_history', JSON.stringify(updatedHistory));
    }
  };

  const saveReading = async (reading: { tarot?: TarotReading, compatibility?: CompatibilityResult, horary?: HoraryResult }) => {
    triggerHaptic(15);
    const newCalc: SavedCalculation = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      input: userInput || { name: 'Неизвестный', birthDate: '', gender: 'female' },
      matrix: matrix || { day: 0, month: 0, year: 0, bottom: 0, center: 0, sky: 0, earth: 0, destiny: 0 },
      astrology: astrology || { zodiacSign: '', element: '', planet: '', house: 0, traits: [] },
      tarotReading: reading.tarot,
      compatibilityResult: reading.compatibility,
      horaryResult: reading.horary
    };
    
    if (user) {
      await saveCalculation(newCalc);
    } else {
      const updatedHistory = [newCalc, ...localCalculations.slice(0, 19)];
      setLocalCalculations(updatedHistory);
      localStorage.setItem('chubuk_history', JSON.stringify(updatedHistory));
    }
    showToast("Ответ сохранен в историю профиля");
  };

  const handleClearProfile = () => {
    triggerHaptic(15);
    localStorage.removeItem('chubuk_user_input');
    localStorage.removeItem('chubuk_matrix_data');
    setUserInput(null);
    setMatrix(null);
    setAstrology(null);
    setAnalysis(null);
    showToast("Данные профиля очищены");
  };

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-[#050a14] flex flex-col items-center justify-center text-amber-500">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-20 h-20 mb-6"
        >
          <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl font-bold">C</div>
        </motion.div>
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-amber-400">
          Запуск приложения...
        </p>
      </div>
    );
  }

  return (
    <AudioProvider>
      <div className="min-h-screen w-full overflow-x-hidden font-sans bg-[#03060c] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
        {/* Toast Notification */}
        <div className={`fixed top-20 right-4 sm:right-6 z-[80] bg-emerald-950/95 text-emerald-100 px-4 py-2.5 rounded-2xl backdrop-blur-xl border border-emerald-500/40 shadow-2xl transition-all duration-300 flex items-center gap-2 text-xs font-medium ${toastMessage ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0 pointer-events-none'}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>

        {/* Ambient Cosmic Background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden no-print">
          {bgImage && (
            <div className="absolute inset-0 opacity-25 animate-fade-in" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          )}
          <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-amber-600/10 rounded-full blur-[100px]"></div>
        </div>

        {/* AI Voice & Numerologist Chat Integrations */}
        <Suspense fallback={null}>
          <NumerologistChat userInput={userInput} matrix={matrix} astrology={astrology} />
        </Suspense>

        {/* Native App Top Header */}
        <AppHeader
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            triggerHaptic(8);
            if (tabId === 'admin' && !isUserAdmin(user)) {
              setIsAdminAuthModalOpen(true);
              return;
            }
            setActiveTab(tabId);
          }}
          onOpenSidebar={() => setIsMenuOpen(true)}
          onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
          onOpenUsageLimitModal={() => setIsUsageLimitModalOpen(true)}
          user={user}
          onSignIn={() => setIsAuthModalOpen(true)}
          onSignOut={signOut}
          userInput={userInput}
          matrix={matrix}
          onTriggerHaptic={triggerHaptic}
        />

        {/* Horizontal App Screen Category Switcher Ribbon */}
        <AppCategoryRibbon
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            triggerHaptic(8);
            if (tabId === 'admin' && !isUserAdmin(user)) {
              setIsAdminAuthModalOpen(true);
              return;
            }
            setActiveTab(tabId);
          }}
          onTriggerHaptic={triggerHaptic}
        />

        {/* All 21 Sections Drawer Navigation */}
        <AppSidebarNavigation
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            if (tabId === 'admin' && !isUserAdmin(user)) {
              setIsAdminAuthModalOpen(true);
              return;
            }
            setActiveTab(tabId);
          }}
          user={user}
          onSignIn={signIn}
          onSignOut={signOut}
          onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
        />

        {/* Main Application Screen Container */}
        <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-2.5 sm:px-4 py-3 sm:py-5 pb-24 lg:pb-16">
          {/* Top Yandex Advertising / Sponsor Banner */}
          <YandexAdBanner 
            placement="header" 
            onOpenAdmin={() => {
              triggerHaptic(10);
              setActiveTab('admin');
            }} 
            onOpenPaywall={() => {
              triggerHaptic(10);
              setIsUsageLimitModalOpen(true);
            }} 
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full flex flex-col items-center"
            >
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-20 gap-2.5">
                  <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
                  <p className="text-amber-400/80 text-xs font-serif uppercase tracking-widest">
                    Синхронизация энергий...
                  </p>
                </div>
              }>
                {activeTab === 'matrix' ? (
                  <div className="w-full flex flex-col items-center space-y-4 sm:space-y-5">
                    {/* Active Profile Status Header Bar */}
                    {userInput && matrix ? (
                      <div className="w-full p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#0e1628]/90 via-[#090e1c]/90 to-[#0e1628]/90 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-md">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-serif font-black text-base sm:text-lg flex items-center justify-center shrink-0">
                            {matrix.center}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-serif font-bold text-white text-xs sm:text-sm truncate">{userInput.name}</h3>
                              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold shrink-0">
                                {userInput.birthDate}
                              </span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                              Центр: <strong className="text-amber-300">{matrix.center}</strong> • Предназначение: <strong className="text-amber-300">{matrix.destiny}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
                          <button
                            onClick={() => {
                              triggerHaptic(10);
                              setIsOnboardingOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-serif font-bold flex items-center gap-1 cursor-pointer"
                            title="Гид по Матрице"
                          >
                            <Compass size={12} />
                            <span>Гид</span>
                          </button>

                          <button
                            onClick={() => {
                              triggerHaptic(10);
                              setActiveTab('daily');
                            }}
                            className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-black text-xs font-serif font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Sun size={12} />
                            <span>Прогноз</span>
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* Calculation & Matrix Visual Card Container */}
                    <div ref={calculatorRef} className="w-full grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3 sm:gap-5 items-start">
                      <div className="w-full">
                        <InputForm onSubmit={handleCalculate} isLoading={loading} />
                      </div>
                      
                      <div className="w-full flex flex-col items-center justify-start p-2.5 sm:p-4 rounded-2xl bg-[#070b16]/70 border border-white/5 shadow-inner">
                        {matrix ? (
                          <MatrixVisual 
                            matrix={matrix} 
                            userInput={userInput} 
                            onOpenGuide={() => setIsOnboardingOpen(true)}
                            savedCalculations={savedCalculations}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-6 opacity-40 space-y-2 min-h-[220px]">
                            <Sparkles size={30} className="text-amber-400 animate-pulse" />
                            <p className="font-serif text-xs text-slate-300">Введите дату рождения для построения 22 арканов матрицы</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interactive Daily Arcana & Personal Resonance Widget */}
                    <div className="w-full">
                      <DailyArcanaWidget 
                        matrix={matrix} 
                        userInput={userInput} 
                        onOpenFullForecast={() => {
                          triggerHaptic(10);
                          setActiveTab('daily');
                        }}
                        onTriggerHaptic={triggerHaptic}
                      />
                    </div>

                    {/* Detailed Analysis Results & PDF Export */}
                    {analysis && (
                      <div ref={resultsRef} className="w-full space-y-4 animate-fade-in-up">
                        <AnalysisResults analysis={analysis} userInput={userInput} matrix={matrix} astrology={astrology} />
                        <OrderSection 
                          userInput={userInput} 
                          matrix={matrix} 
                          astrology={astrology} 
                          analysis={analysis} 
                          isVisible={true}
                          onSuccess={() => showToast("Сакральный PDF-отчет успешно сформирован")}
                        />
                      </div>
                    )}
                  </div>
                ) : activeTab === 'keyto' ? (
                  <div className="w-full">
                    <KeyToPsychologySection 
                      userInput={userInput} 
                      matrix={matrix} 
                      onNavigateToMatrix={() => setActiveTab('matrix')}
                    />
                  </div>
                ) : activeTab === 'lifespan' ? (
                  <div className="w-full">
                    <LifespanSection 
                      userInput={userInput} 
                      matrix={matrix} 
                      onNavigateToMatrix={() => setActiveTab('matrix')}
                      onNavigateToTarot={() => setActiveTab('tarot')}
                    />
                  </div>
                ) : activeTab === 'psychology' ? (
                  <div className="w-full">
                    <PsychologicalPortraitSection 
                      userInput={userInput} 
                      matrix={matrix} 
                      onNavigateToMatrix={() => setActiveTab('matrix')}
                    />
                  </div>
                ) : activeTab === 'caching' || (activeTab as string) === 'cooking' ? (
                  <div className="w-full">
                    <CachingSection 
                      userInput={userInput} 
                      matrix={matrix} 
                      onNavigateToMatrix={() => setActiveTab('matrix')}
                      onNavigateToProfile={() => setActiveTab('profile')}
                    />
                  </div>
                ) : activeTab === 'meditation' ? (
                  <div className="w-full">
                    <MeditationCenter 
                      userInput={userInput} 
                      matrix={matrix} 
                      onNavigateToMatrix={() => setActiveTab('matrix')}
                      onNavigateToChakras={() => setActiveTab('chakras')}
                    />
                  </div>
                ) : activeTab === 'daily' ? (
                  <div className="w-full">
                    <DailyForecastSection 
                      initialUserInput={userInput} 
                      onSaveBirthDate={(input) => {
                        setUserInput(input);
                        localStorage.setItem('chubuk_user_input', JSON.stringify(input));
                        try {
                          const calculatedMatrix = calculateMatrix(input.birthDate);
                          setMatrix(calculatedMatrix);
                          localStorage.setItem('chubuk_matrix_data', JSON.stringify(calculatedMatrix));
                          setAstrology(getAstrologyData(input.birthDate));
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      onOpenNotifications={() => setIsNotificationModalOpen(true)}
                    />
                  </div>
                ) : activeTab === 'tapper' ? (
                  <div className="w-full">
                    <KarmaTapperSection 
                      userInput={userInput} 
                      matrix={matrix} 
                      onNavigateToMatrix={() => setActiveTab('matrix')}
                      onNavigateToTarot={() => setActiveTab('tarot')}
                      onNavigateToSound={() => setActiveTab('daily')}
                      onOpenShopModal={(tab) => {
                        setUsageLimitModalTab(tab || 'crypto');
                        setIsUsageLimitModalOpen(true);
                      }}
                    />
                  </div>
                ) : activeTab === 'wallpapers' ? (
                  <div className="w-full">
                    <SacredWallpapersSection userInput={userInput} matrix={matrix} />
                  </div>
                ) : activeTab === 'chakras' ? (
                  <div className="w-full">
                    <ChakrasSection userInput={userInput} matrix={matrix} />
                  </div>
                ) : activeTab === 'akashic' ? (
                  <div className="w-full">
                    <AkashicRecordsSection userInput={userInput} matrix={matrix} />
                  </div>
                ) : activeTab === 'powercal' ? (
                  <div className="w-full">
                    <PowerCalendarSection userInput={userInput} matrix={matrix} />
                  </div>
                ) : activeTab === 'lunar' ? (
                  <div className="w-full">
                    <LunarCalendarSection />
                  </div>
                ) : activeTab === 'elective' ? (
                  <div className="w-full">
                    <ElectiveDatesSection 
                      userInput={userInput} 
                      onOpenNotifications={() => setIsNotificationModalOpen(true)}
                    />
                  </div>
                ) : activeTab === 'ancestral' ? (
                  <div className="w-full">
                    <AncestralLineageSection userInput={userInput} matrix={matrix} />
                  </div>
                ) : activeTab === 'litho' ? (
                  <div className="w-full">
                    <LithotherapySection userInput={userInput} matrix={matrix} astrology={astrology} />
                  </div>
                ) : activeTab === 'dreams' ? (
                  <div className="w-full">
                    <DreamOracleSection userInput={userInput} matrix={matrix} />
                  </div>
                ) : activeTab === 'cities' ? (
                  <div className="w-full">
                    <CitiesOfPowerSection userInput={userInput} matrix={matrix} astrology={astrology} />
                  </div>
                ) : activeTab === 'astrology' ? (
                  <div className="w-full">
                    <AstrologySection userInput={userInput} />
                  </div>
                ) : activeTab === 'compatibility' ? (
                  <div className="w-full">
                    <CompatibilitySection user1={{ input: userInput, matrix, astrology }} onSave={(res) => saveReading({ compatibility: res })} />
                  </div>
                ) : activeTab === 'horary' ? (
                  <div className="w-full">
                    <HorarySection 
                      userInput={userInput} 
                      onSave={(res) => saveReading({ horary: res })} 
                      onOpenUsageLimitModal={() => setIsUsageLimitModalOpen(true)}
                    />
                  </div>
                ) : activeTab === 'market' ? (
                  <div className="w-full">
                    <AffiliateMarketSection 
                      matrix={matrix || undefined} 
                      userInput={userInput || undefined} 
                      onTriggerHaptic={triggerHaptic}
                      onOpenOrderModal={() => setIsUsageLimitModalOpen(true)}
                    />
                  </div>
                ) : activeTab === 'faq' ? (
                  <div className="w-full">
                    <FaqSection 
                      userInput={userInput} 
                      matrix={matrix} 
                      onNavigateToChat={() => {
                        triggerHaptic(10);
                        setActiveTab('matrix');
                        setTimeout(() => {
                          const chatElem = document.getElementById('ai-numerologist-chat');
                          if (chatElem) {
                            chatElem.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 200);
                      }}
                      onTriggerHaptic={triggerHaptic}
                    />
                  </div>
                ) : activeTab === 'admin' ? (
                  <div className="w-full">
                    {isUserAdmin(user) ? (
                      <AdminPanelSection 
                        user={user} 
                        savedCalculations={savedCalculations}
                        onTriggerHaptic={triggerHaptic}
                      />
                    ) : (
                      <div className="p-6 text-center bg-black/60 rounded-2xl border border-amber-500/30 max-w-lg mx-auto space-y-3 my-8">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl">
                          🔒
                        </div>
                        <h3 className="font-serif font-bold text-lg text-white">Доступ ограничен</h3>
                        <p className="text-xs text-slate-300">
                          Панель создателя защищена мастер-паролем. Для входа введите секретный ключ.
                        </p>
                        <button
                          onClick={() => setIsAdminAuthModalOpen(true)}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-lg hover:brightness-110 cursor-pointer"
                        >
                          Ввести пароль администратора
                        </button>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'profile' ? (
                  <div className="w-full">
                    <ProfileSection 
                      userInput={userInput} 
                      savedCalculations={savedCalculations}
                      onSelectCalculation={handleSelectCalculation}
                      onDeleteCalculation={handleDeleteCalculation}
                      onClearProfile={handleClearProfile}
                      onHistoryMerged={(count) => {
                        showToast(`Синхронизировано ${count} расчетов с облаком`);
                      }}
                      onOpenNotifications={() => setIsNotificationModalOpen(true)}
                      onOpenUsageLimitModal={(tab) => {
                        if (tab) setUsageLimitModalTab(tab);
                        setIsUsageLimitModalOpen(true);
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full">
                    <TarotSection 
                      userInput={userInput} 
                      matrix={matrix} 
                      onSave={(res) => saveReading({ tarot: res })} 
                      onOpenUsageLimitModal={() => setIsUsageLimitModalOpen(true)}
                    />
                  </div>
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Ambient Sound Therapy Player Bar */}
        <Suspense fallback={null}>
          <AmbientSoundTherapy />
        </Suspense>

        {/* Android Native Bottom Navigation Bar */}
        <AndroidBottomBar
          activeTab={activeTab}
          onSelectTab={(tabId) => setActiveTab(tabId)}
          onOpenSidebar={() => setIsMenuOpen(true)}
          onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
          isStandalone={isStandalone}
          canInstall={isInstallable}
          onTriggerHaptic={triggerHaptic}
        />

        {/* Android App & PWA Install Modal */}
        <AndroidInstallModal
          isOpen={isAndroidModalOpen}
          onClose={() => setIsAndroidModalOpen(false)}
          canInstall={isInstallable}
          isStandalone={isStandalone}
          isAndroid={isAndroid}
          onTriggerInstall={triggerInstall}
          onTriggerHaptic={triggerHaptic}
        />

        {/* Push Notification & Daily Reminders Modal */}
        <PushNotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          userInput={userInput}
        />

        {/* User Authentication & Account Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* Secret Master Admin Password Modal */}
        <SecretAdminModal
          isOpen={isAdminAuthModalOpen}
          onClose={() => setIsAdminAuthModalOpen(false)}
          onSuccess={() => {
            setActiveTab('admin');
            showToast("Доступ Администратора Master разблокирован (Безлимит активен)");
          }}
        />

        {/* Daily Usage Limits & Monetization / Fortune Wheel Modal */}
        <UsageLimitModal
          isOpen={isUsageLimitModalOpen}
          onClose={() => setIsUsageLimitModalOpen(false)}
          onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
          initialTab={usageLimitModalTab}
          onTriggerHaptic={triggerHaptic}
          onSuccessVipUnlock={() => {
            showToast("👑 VIP статус активирован! Лимиты сняты.");
          }}
        />

        {/* Matrix of Destiny Onboarding Guide Coach Marks */}
        <MatrixOnboardingGuide
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          matrix={matrix}
          userInput={userInput}
        />
      </div>
    </AudioProvider>
  );
};

export default App;
