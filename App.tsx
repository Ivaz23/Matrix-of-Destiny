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
import { useAndroidInstall } from './hooks/useAndroidInstall';
import { checkAndTriggerScheduledNotifications } from './services/notificationService';

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
const PsychologicalPortraitSection = lazy(() => import('./components/PsychologicalPortraitSection').then(m => ({ default: m.PsychologicalPortraitSection })));
const CachingSection = lazy(() => import('./components/CachingSection'));
const LifespanSection = lazy(() => import('./components/LifespanSection'));
const AdminPanelSection = lazy(() => import('./components/AdminPanelSection'));

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

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      navigator.serviceWorker?.removeEventListener('message', handleSwMessage);
      window.removeEventListener('chubuk_navigate_tab', handleCustomNavigate);
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

  if (!isAppReady || authLoading) {
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
      <div className="min-h-screen font-sans bg-[#03060c] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
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
            setActiveTab(tabId);
          }}
          onOpenSidebar={() => setIsMenuOpen(true)}
          onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
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
            setActiveTab(tabId);
          }}
          onTriggerHaptic={triggerHaptic}
        />

        {/* All 21 Sections Drawer Navigation */}
        <AppSidebarNavigation
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          activeTab={activeTab}
          onSelectTab={(tabId) => setActiveTab(tabId)}
          user={user}
          onSignIn={signIn}
          onSignOut={signOut}
          onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
        />

        {/* Main Application Screen Container */}
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-28 lg:pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full flex flex-col items-center"
            >
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <p className="text-amber-400/80 text-xs font-serif uppercase tracking-widest">
                    Синхронизация энергий...
                  </p>
                </div>
              }>
                {activeTab === 'matrix' ? (
                  <div className="w-full max-w-5xl flex flex-col items-center space-y-6">
                    {/* Active Profile Status Header Bar */}
                    {userInput && matrix ? (
                      <div className="w-full p-4 rounded-3xl bg-gradient-to-r from-[#0e1628] via-[#090e1c] to-[#0e1628] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-serif font-black text-xl flex items-center justify-center shrink-0">
                            {matrix.center}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif font-bold text-white text-base">{userInput.name}</h3>
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                                {userInput.birthDate}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              Центр: <strong className="text-amber-300">{matrix.center} Аркан</strong> • Предназначение: <strong className="text-amber-300">{matrix.destiny} Аркан</strong> • Небо/Земля: <strong className="text-amber-300">{matrix.sky}/{matrix.earth}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => {
                              triggerHaptic(10);
                              setIsOnboardingOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer"
                            title="Открыть обучение по значениям Матрицы"
                          >
                            <Compass size={13} />
                            <span>Гид</span>
                          </button>

                          <button
                            onClick={() => {
                              triggerHaptic(10);
                              setActiveTab('wallpapers');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 hover:bg-purple-900/50 text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Smartphone size={13} />
                            <span>Обои HD</span>
                          </button>

                          <button
                            onClick={() => {
                              triggerHaptic(10);
                              setActiveTab('daily');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-black text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sun size={13} />
                            <span>Прогноз</span>
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* Calculation & Matrix Visual Card Container */}
                    <div ref={calculatorRef} className="w-full grid md:grid-cols-2 gap-6 items-start">
                      <div className="w-full">
                        <InputForm onSubmit={handleCalculate} isLoading={loading} />
                      </div>
                      
                      <div className="w-full flex items-center justify-center min-h-[380px] p-4 rounded-3xl bg-[#070b16]/70 border border-white/5 shadow-inner">
                        {matrix ? (
                          <MatrixVisual 
                            matrix={matrix} 
                            userInput={userInput} 
                            onOpenGuide={() => setIsOnboardingOpen(true)}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-8 opacity-40 space-y-2">
                            <Sparkles size={36} className="text-amber-400 animate-pulse" />
                            <p className="font-serif text-sm text-slate-300">Введите дату рождения для построения 22 арканов матрицы</p>
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
                      <div ref={resultsRef} className="w-full space-y-6 animate-fade-in-up">
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
                ) : activeTab === 'lifespan' ? (
                  <div className="w-full max-w-5xl">
                    <LifespanSection 
                      userInput={userInput} 
                      matrix={matrix} 
                      onNavigateToMatrix={() => setActiveTab('matrix')}
                      onNavigateToTarot={() => setActiveTab('tarot')}
                    />
                  </div>
                ) : activeTab === 'psychology' ? (
                  <div className="w-full max-w-5xl">
                    <PsychologicalPortraitSection 
                      userInput={userInput} 
                      matrix={matrix} 
                      onNavigateToMatrix={() => setActiveTab('matrix')}
                    />
                  </div>
                ) : activeTab === 'caching' || (activeTab as string) === 'cooking' ? (
                  <div className="w-full max-w-5xl">
                    <CachingSection 
                      userInput={userInput} 
                      matrix={matrix} 
                      onNavigateToMatrix={() => setActiveTab('matrix')}
                      onNavigateToProfile={() => setActiveTab('profile')}
                    />
                  </div>
                ) : activeTab === 'meditation' ? (
                  <div className="w-full max-w-5xl">
                    <MeditationCenter 
                      userInput={userInput} 
                      matrix={matrix} 
                      onNavigateToMatrix={() => setActiveTab('matrix')}
                      onNavigateToChakras={() => setActiveTab('chakras')}
                    />
                  </div>
                ) : activeTab === 'daily' ? (
                  <div className="w-full max-w-5xl">
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
                  <div className="w-full max-w-5xl">
                    <KarmaTapperSection 
                      userInput={userInput} 
                      matrix={matrix} 
                      onNavigateToMatrix={() => setActiveTab('matrix')}
                      onNavigateToTarot={() => setActiveTab('tarot')}
                      onNavigateToSound={() => setActiveTab('daily')}
                    />
                  </div>
                ) : activeTab === 'wallpapers' ? (
                  <div className="w-full max-w-5xl">
                    <SacredWallpapersSection userInput={userInput} matrix={matrix} />
                  </div>
                ) : activeTab === 'chakras' ? (
                  <div className="w-full max-w-5xl">
                    <ChakrasSection userInput={userInput} matrix={matrix} />
                  </div>
                ) : activeTab === 'akashic' ? (
                  <div className="w-full max-w-5xl">
                    <AkashicRecordsSection userInput={userInput} matrix={matrix} />
                  </div>
                ) : activeTab === 'powercal' ? (
                  <div className="w-full max-w-5xl">
                    <PowerCalendarSection userInput={userInput} matrix={matrix} />
                  </div>
                ) : activeTab === 'lunar' ? (
                  <div className="w-full max-w-5xl">
                    <LunarCalendarSection />
                  </div>
                ) : activeTab === 'elective' ? (
                  <div className="w-full max-w-5xl">
                    <ElectiveDatesSection 
                      userInput={userInput} 
                      onOpenNotifications={() => setIsNotificationModalOpen(true)}
                    />
                  </div>
                ) : activeTab === 'ancestral' ? (
                  <div className="w-full max-w-5xl">
                    <AncestralLineageSection userInput={userInput} matrix={matrix} />
                  </div>
                ) : activeTab === 'litho' ? (
                  <div className="w-full max-w-5xl">
                    <LithotherapySection userInput={userInput} matrix={matrix} astrology={astrology} />
                  </div>
                ) : activeTab === 'dreams' ? (
                  <div className="w-full max-w-4xl">
                    <DreamOracleSection userInput={userInput} matrix={matrix} />
                  </div>
                ) : activeTab === 'cities' ? (
                  <div className="w-full max-w-4xl">
                    <CitiesOfPowerSection userInput={userInput} matrix={matrix} astrology={astrology} />
                  </div>
                ) : activeTab === 'astrology' ? (
                  <div className="w-full max-w-5xl">
                    <AstrologySection userInput={userInput} />
                  </div>
                ) : activeTab === 'compatibility' ? (
                  <div className="w-full max-w-5xl">
                    <CompatibilitySection user1={{ input: userInput, matrix, astrology }} onSave={(res) => saveReading({ compatibility: res })} />
                  </div>
                ) : activeTab === 'horary' ? (
                  <div className="w-full max-w-4xl">
                    <HorarySection userInput={userInput} onSave={(res) => saveReading({ horary: res })} />
                  </div>
                ) : activeTab === 'admin' ? (
                  <div className="w-full max-w-5xl">
                    <AdminPanelSection 
                      user={user} 
                      savedCalculations={savedCalculations}
                      onTriggerHaptic={triggerHaptic}
                    />
                  </div>
                ) : activeTab === 'profile' ? (
                  <div className="w-full max-w-5xl">
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
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-5xl">
                    <TarotSection userInput={userInput} matrix={matrix} onSave={(res) => saveReading({ tarot: res })} />
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
