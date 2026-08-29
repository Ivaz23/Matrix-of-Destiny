import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Flame, 
  Coins, 
  TrendingUp, 
  Clock, 
  Shield, 
  Award, 
  Gift, 
  CheckCircle2, 
  ChevronRight, 
  Radio, 
  Wallet, 
  Share2, 
  Smartphone, 
  Layers, 
  Lock, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Info,
  Key,
  ExternalLink,
  ChevronDown,
  HelpCircle,
  Trophy
} from 'lucide-react';
import { 
  TapperGameState, 
  loadGameState, 
  saveGameState, 
  UPGRADE_CARDS, 
  DAILY_QUESTS, 
  DAILY_CHECKIN_REWARDS, 
  RANKS, 
  getRankLevel, 
  getCardCost, 
  getCardProfitIncrease, 
  getDailyComboCards, 
  getDailyCipher, 
  getTodayDateString, 
  formatNumberAbbreviated, 
  soundFx, 
  UpgradeCard,
  ENERGY_REGEN_PER_SECOND,
  ENERGY_REGEN_INTERVAL_MINUTES,
  ENERGY_REGEN_AMOUNT_PER_INTERVAL
} from '../services/tapperGameUtils';
import { UserInput, MatrixNumbers } from '../types';
import { KarmicLeaderboard } from './KarmicLeaderboard';

interface KarmaTapperSectionProps {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
  onNavigateToMatrix?: () => void;
  onNavigateToTarot?: () => void;
  onNavigateToSound?: () => void;
  onOpenShopModal?: (tab?: 'crypto' | 'wheel' | 'partner' | 'money' | 'promo') => void;
}

type SubTabId = 'tapper' | 'mine' | 'combo' | 'quests' | 'leaders' | 'airdrop';

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  text: string;
}

export const KarmaTapperSection: React.FC<KarmaTapperSectionProps> = ({
  userInput,
  matrix,
  onNavigateToMatrix,
  onNavigateToTarot,
  onNavigateToSound,
  onOpenShopModal
}) => {
  const [gameState, setGameState] = useState<TapperGameState>(() => loadGameState().state);
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('tapper');
  const [selectedCardCategory, setSelectedCardCategory] = useState<'practices' | 'artifacts' | 'infrastructure' | 'special'>('practices');
  
  // Floating numbers on tap
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  
  // Offline welcome dialog
  const [offlineData, setOfflineData] = useState<{ amount: number; seconds: number } | null>(null);
  
  // Turbo boost state (active for 20s)
  const [turboActiveUntil, setTurboActiveUntil] = useState<number | null>(null);
  const [turboSecondsLeft, setTurboSecondsLeft] = useState<number>(0);
  
  // Sound enabled
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Modals
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [rewardToast, setRewardToast] = useState<{ title: string; amount: number } | null>(null);

  // Morse Cipher input state
  const [morseInput, setMorseInput] = useState<string>('');
  const [morseDecodedText, setMorseDecodedText] = useState<string>('');
  const morseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const morsePressStartRef = useRef<number>(0);

  const tapperRef = useRef<HTMLDivElement>(null);
  const today = getTodayDateString();
  const dailyCombo = getDailyComboCards(today);
  const dailyCipher = getDailyCipher(today);

  // Initial load check for offline earnings
  useEffect(() => {
    const { state, offlineEarnings, offlineSeconds } = loadGameState();
    setGameState(state);
    if (offlineEarnings > 0) {
      setOfflineData({ amount: offlineEarnings, seconds: offlineSeconds });
    }
  }, []);

  // Passive income ticker & Energy regeneration loop (runs every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState((prev) => {
        const now = Date.now();
        const profitPerSec = prev.profitPerHour / 3600;
        const newCoins = prev.coins + profitPerSec;
        const newTotalEarned = prev.totalEarned + profitPerSec;

        // Regenerate energy at calibrated rate: exactly 100 energy per 10 minutes (1 energy per 6s)
        const newEnergy = Math.min(prev.maxEnergy, prev.energy + ENERGY_REGEN_PER_SECOND);
        const currentRank = getRankLevel(newTotalEarned);

        const updated: TapperGameState = {
          ...prev,
          coins: newCoins,
          totalEarned: newTotalEarned,
          energy: newEnergy,
          level: currentRank.level,
          lastEarnTimestamp: now
        };

        saveGameState(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Turbo boost countdown timer
  useEffect(() => {
    if (!turboActiveUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((turboActiveUntil - Date.now()) / 1000));
      setTurboSecondsLeft(remaining);
      if (remaining <= 0) {
        setTurboActiveUntil(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [turboActiveUntil]);

  const currentRank = getRankLevel(gameState.totalEarned);
  const nextRank = RANKS[Math.min(RANKS.length - 1, currentRank.level)];
  const progressToNext = currentRank.level >= 10 
    ? 100 
    : Math.min(100, Math.max(0, Math.floor(((gameState.totalEarned - currentRank.requiredCoins) / (nextRank.requiredCoins - currentRank.requiredCoins)) * 100)));

  // Haptic feedback trigger
  const triggerHaptic = (ms: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch (e) {}
    }
  };

  const showReward = (title: string, amount: number) => {
    if (soundEnabled) soundFx.playLevelUp();
    setRewardToast({ title, amount });
    setTimeout(() => setRewardToast(null), 3500);
  };

  // Main artifact tap handler
  const handleTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const isTurbo = turboActiveUntil !== null && turboActiveUntil > Date.now();
    const effectiveTapPower = gameState.tapPower * (isTurbo ? 5 : 1);
    const energyCost = isTurbo ? 1 : 1;

    if (gameState.energy < energyCost) {
      triggerHaptic(40);
      return;
    }

    if (soundEnabled) soundFx.playTap();
    triggerHaptic(isTurbo ? 18 : 8);

    // Get touch coordinates for floating number
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (tapperRef.current && clientX !== 0) {
      const rect = tapperRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const newFloating: FloatingNumber = {
        id: Date.now() + Math.random(),
        x,
        y,
        text: `+${effectiveTapPower}`
      };
      setFloatingNumbers((prev) => [...prev.slice(-15), newFloating]);
      setTimeout(() => {
        setFloatingNumbers((prev) => prev.filter((f) => f.id !== newFloating.id));
      }, 800);
    }

    setGameState((prev) => {
      const updatedCoins = prev.coins + effectiveTapPower;
      const updatedTotal = prev.totalEarned + effectiveTapPower;
      const updatedEnergy = Math.max(0, prev.energy - energyCost);
      const newLevel = getRankLevel(updatedTotal).level;

      const newTaps = (prev.tapStats?.totalTaps || 0) + 1;
      const todayTaps = (prev.tapStats?.todayTaps || 0) + 1;

      const nextState: TapperGameState = {
        ...prev,
        coins: updatedCoins,
        totalEarned: updatedTotal,
        energy: updatedEnergy,
        level: newLevel,
        tapStats: {
          totalTaps: newTaps,
          todayTaps
        }
      };

      saveGameState(nextState);
      return nextState;
    });
  };

  // Card Upgrade Purchase Handler
  const handleBuyCard = (card: UpgradeCard) => {
    const currentCardLevel = gameState.cards[card.id] || 0;
    const cost = getCardCost(card, currentCardLevel);

    if (gameState.coins < cost) {
      triggerHaptic([20, 50, 20]);
      return;
    }

    if (gameState.level < card.requiredLevel) {
      triggerHaptic([30, 30]);
      return;
    }

    if (soundEnabled) soundFx.playCoin();
    triggerHaptic(15);

    const profitIncrease = getCardProfitIncrease(card, currentCardLevel);
    const newCardLevel = currentCardLevel + 1;

    setGameState((prev) => {
      const newCards = { ...prev.cards, [card.id]: newCardLevel };
      const newCoins = prev.coins - cost;
      const newProfit = prev.profitPerHour + profitIncrease;

      // Check daily combo
      let newComboFound = [...(prev.dailyComboFound || [])];
      if (dailyCombo.cardIds.includes(card.id) && !newComboFound.includes(card.id)) {
        newComboFound.push(card.id);
      }

      const nextState: TapperGameState = {
        ...prev,
        coins: newCoins,
        profitPerHour: newProfit,
        cards: newCards,
        dailyComboFound: newComboFound
      };

      // If all 3 combo cards found today and not yet claimed
      if (
        newComboFound.length === 3 &&
        prev.dailyComboClaimedDate !== today &&
        dailyCombo.cardIds.every((id) => newComboFound.includes(id))
      ) {
        nextState.coins += dailyCombo.reward;
        nextState.totalEarned += dailyCombo.reward;
        nextState.dailyComboClaimedDate = today;
        showReward('Сакральное Комбо Дня собрано!', dailyCombo.reward);
      }

      saveGameState(nextState);
      return nextState;
    });
  };

  // Daily Check-in Streak Handler
  const handleDailyCheckin = () => {
    if (gameState.lastCheckinDate === today) return;

    const streak = gameState.lastCheckinDate 
      ? (new Date(today).getTime() - new Date(gameState.lastCheckinDate).getTime() <= 86400000 * 2 ? gameState.dailyCheckinStreak + 1 : 1)
      : 1;

    const rewardIndex = Math.min(DAILY_CHECKIN_REWARDS.length - 1, streak - 1);
    const reward = DAILY_CHECKIN_REWARDS[rewardIndex];

    setGameState((prev) => {
      const nextState: TapperGameState = {
        ...prev,
        coins: prev.coins + reward,
        totalEarned: prev.totalEarned + reward,
        dailyCheckinStreak: streak,
        lastCheckinDate: today,
        completedQuests: Array.from(new Set([...prev.completedQuests, 'quest_checkin']))
      };
      saveGameState(nextState);
      return nextState;
    });

    showReward(`Стрик ${streak} дней! Ежедневная награда алтаря`, reward);
  };

  // Complete Quest Handler
  const handleCompleteQuest = (quest: any) => {
    if (gameState.completedQuests.includes(quest.id)) return;

    if (quest.actionUrl) {
      window.open(quest.actionUrl, '_blank');
    }

    setGameState((prev) => {
      const nextState: TapperGameState = {
        ...prev,
        coins: prev.coins + quest.reward,
        totalEarned: prev.totalEarned + quest.reward,
        completedQuests: [...prev.completedQuests, quest.id]
      };
      saveGameState(nextState);
      return nextState;
    });

    showReward(`Задание выполнено: ${quest.title}`, quest.reward);
  };

  // Activate Full Energy Boost
  const handleUseFullEnergyBoost = () => {
    if (gameState.fullEnergyBoostsLeft <= 0) return;
    if (soundEnabled) soundFx.playLevelUp();
    triggerHaptic(25);

    setGameState((prev) => {
      const nextState: TapperGameState = {
        ...prev,
        energy: prev.maxEnergy,
        fullEnergyBoostsLeft: prev.fullEnergyBoostsLeft - 1
      };
      saveGameState(nextState);
      return nextState;
    });
    setIsBoostModalOpen(false);
  };

  // Activate Turbo Multi-tap Boost (5x for 20 seconds)
  const handleUseTurboBoost = () => {
    if (gameState.turboBoostsLeft <= 0) return;
    if (soundEnabled) soundFx.playLevelUp();
    triggerHaptic(30);

    const until = Date.now() + 20000;
    setTurboActiveUntil(until);
    setTurboSecondsLeft(20);

    setGameState((prev) => {
      const nextState: TapperGameState = {
        ...prev,
        turboBoostsLeft: prev.turboBoostsLeft - 1
      };
      saveGameState(nextState);
      return nextState;
    });
    setIsBoostModalOpen(false);
  };

  // Morse Code Tap Handler
  const handleMorseTouchStart = () => {
    morsePressStartRef.current = Date.now();
    if (soundEnabled) soundFx.playTap();
  };

  const handleMorseTouchEnd = () => {
    const duration = Date.now() - morsePressStartRef.current;
    const isDash = duration > 240;
    const symbol = isDash ? '-' : '.';
    const nextMorse = morseInput + symbol;
    setMorseInput(nextMorse);

    if (morseTimerRef.current) clearTimeout(morseTimerRef.current);
    morseTimerRef.current = setTimeout(() => {
      // Decode letters
      const MORSE_MAP: Record<string, string> = {
        '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
        '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
        '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
        '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
        '-.--': 'Y', '--..': 'Z'
      };
      const decodedChar = MORSE_MAP[nextMorse] || '?';
      const updatedDecoded = morseDecodedText + decodedChar;
      setMorseDecodedText(updatedDecoded);
      setMorseInput('');

      // Check if cipher solved
      if (updatedDecoded === dailyCipher.word && gameState.dailyCipherSolvedDate !== today) {
        setGameState((prev) => {
          const nextState: TapperGameState = {
            ...prev,
            coins: prev.coins + dailyCipher.reward,
            totalEarned: prev.totalEarned + dailyCipher.reward,
            dailyCipherSolvedDate: today
          };
          saveGameState(nextState);
          return nextState;
        });
        showReward('Сакральный Шифр Разгадан!', dailyCipher.reward);
      }
    }, 600);
  };

  const handleClearMorse = () => {
    setMorseInput('');
    setMorseDecodedText('');
  };

  // Connect Simulated TON Wallet
  const handleConnectWallet = () => {
    if (gameState.walletAddress) {
      setGameState((prev) => {
        const nextState = { ...prev, walletAddress: null };
        saveGameState(nextState);
        return nextState;
      });
      return;
    }
    const sampleAddress = 'EQB' + Math.random().toString(36).substring(2, 8).toUpperCase() + '...' + Math.random().toString(36).substring(2, 6).toUpperCase();
    setGameState((prev) => {
      const nextState = { ...prev, walletAddress: sampleAddress };
      saveGameState(nextState);
      return nextState;
    });
    showReward('Кошелек TON успешно подключен!', 10_000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-20 no-select">
      
      {/* Top Game Header & Stats Bar */}
      <div className="bg-[#0b1222]/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Level & Audio & Boost Bar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          {/* Level Badge (Clickable for info) */}
          <button
            onClick={() => setIsLevelModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/40 border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg shadow-inner">
              {currentRank.icon}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-serif font-bold text-amber-200 group-hover:text-amber-100">
                  {currentRank.title}
                </span>
                <ChevronRight size={12} className="text-slate-500 group-hover:text-amber-300 transition-colors" />
              </div>
              <p className="text-[10px] text-amber-400/80 font-mono">{currentRank.badge} • Ур. {currentRank.level}/10</p>
            </div>
          </button>

          {/* Sound & Boost Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-black/40 border border-white/10 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              title={soundEnabled ? "Звуки включены" : "Звуки выключены"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              type="button"
              onClick={() => setIsBoostModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Zap size={14} className="fill-black" />
              <span>Бусты</span>
            </button>
          </div>
        </div>

        {/* Big Balance & Profit Indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center sm:text-left">
          {/* Current Coins Balance */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-black/60 to-black/30 border border-amber-500/25 flex items-center justify-center sm:justify-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-serif font-black text-2xl shadow-lg shadow-amber-500/30">
              🪙
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Баланс $CHUBUK</p>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                {Math.floor(gameState.coins).toLocaleString('ru-RU')}
              </h2>
            </div>
          </div>

          {/* Profit per hour */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-black/60 to-black/30 border border-emerald-500/25 flex items-center justify-center sm:justify-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black text-xl shadow-lg shadow-emerald-500/30">
              📈
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-emerald-400 font-medium">Прибыль в час</p>
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <span className="text-xl sm:text-2xl font-serif font-bold text-emerald-300">
                  +{formatNumberAbbreviated(gameState.profitPerHour)}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  пассивно
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Прогресс до «{nextRank.title}»</span>
            <span className="font-semibold text-amber-300">{progressToNext}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>

        {/* Monetization & Conversion Quick Bar */}
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-emerald-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0">
              🪙
            </div>
            <div>
              <div className="text-xs font-serif font-bold text-amber-200">
                Курс обмена: 10,000 $CHUBUK = 3 попытки
              </div>
              <div className="text-[11px] text-slate-300">
                Конвертируйте натапанное в расклады Таро, Хорар или крутите Колесо Фортуны!
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                if (onOpenShopModal) {
                  onOpenShopModal('crypto');
                } else {
                  window.dispatchEvent(new CustomEvent('chubuk_open_usage_limit_modal', { detail: { tab: 'crypto' } }));
                }
              }}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Coins size={13} />
              <span>Обменять</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                if (onOpenShopModal) {
                  onOpenShopModal('wheel');
                } else {
                  window.dispatchEvent(new CustomEvent('chubuk_open_usage_limit_modal', { detail: { tab: 'wheel' } }));
                }
              }}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 font-serif font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🎡</span>
              <span>Колесо</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Ribbon (6 Game Modes) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1.5 rounded-2xl bg-[#080d1a] border border-white/10 text-xs">
        <button
          onClick={() => {
            triggerHaptic(8);
            setActiveSubTab('tapper');
          }}
          className={`py-2 px-1 rounded-xl font-serif font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeSubTab === 'tapper' 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-base">⚡</span>
          <span className="text-[10px] sm:text-xs">Тапалка</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(8);
            setActiveSubTab('mine');
          }}
          className={`py-2 px-1 rounded-xl font-serif font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeSubTab === 'mine' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-base">⛏️</span>
          <span className="text-[10px] sm:text-xs">Прокачка</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(8);
            setActiveSubTab('combo');
          }}
          className={`py-2 px-1 rounded-xl font-serif font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeSubTab === 'combo' 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-base">✨</span>
          <span className="text-[10px] sm:text-xs">Комбо</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(8);
            setActiveSubTab('quests');
          }}
          className={`py-2 px-1 rounded-xl font-serif font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeSubTab === 'quests' 
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-base">📋</span>
          <span className="text-[10px] sm:text-xs">Задания</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(8);
            setActiveSubTab('leaders');
          }}
          className={`py-2 px-1 rounded-xl font-serif font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeSubTab === 'leaders' 
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-base">🏆</span>
          <span className="text-[10px] sm:text-xs">Лидеры</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(8);
            setActiveSubTab('airdrop');
          }}
          className={`py-2 px-1 rounded-xl font-serif font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeSubTab === 'airdrop' 
              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-base">🚀</span>
          <span className="text-[10px] sm:text-xs">Дроп</span>
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="relative">

        {/* 1. TAPPER TAB */}
        {activeSubTab === 'tapper' && (
          <div className="space-y-4">
            
            {/* Turbo Active Banner */}
            {turboActiveUntil && turboSecondsLeft > 0 && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-600/30 via-red-600/30 to-amber-600/30 border border-amber-500/50 text-center animate-pulse">
                <div className="flex items-center justify-center gap-2 text-amber-200 text-xs font-bold font-serif">
                  <Flame size={18} className="text-amber-400" />
                  <span>ТУРБО-АУРА АКТИВНА: 5X ДОХОД ОТ ТАПА ({turboSecondsLeft}с)</span>
                </div>
              </div>
            )}

            {/* Central Mystical Coin / Artifact Tapper */}
            <div className="bg-[#0b1224]/90 border border-amber-500/30 rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden min-h-[380px] shadow-2xl">
              
              {/* Sacred rotating energy ring */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-80 h-80 rounded-full border border-dashed border-amber-400 animate-spin" style={{ animationDuration: '60s' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                <div className="w-96 h-96 rounded-full border border-amber-400 animate-spin" style={{ animationDuration: '90s', animationDirection: 'reverse' }} />
              </div>

              {/* Central Clickable Seal */}
              <div
                ref={tapperRef}
                onMouseDown={handleTap}
                onTouchStart={handleTap}
                className="relative z-10 w-60 h-60 sm:w-72 sm:h-72 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 p-2.5 shadow-[0_0_80px_rgba(251,191,36,0.45)] cursor-pointer select-none active:scale-95 transition-transform duration-100 flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full bg-[#0d1428] border-4 border-amber-400/80 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden group">
                  {/* Glowing background */}
                  <div className="absolute inset-0 bg-radial from-amber-500/25 to-transparent pointer-events-none group-hover:opacity-100 transition-opacity" />
                  
                  {/* Arcana Type pill */}
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest font-mono mb-1">
                    {currentRank.badge}
                  </span>

                  {/* Big Sacred Avatar Icon */}
                  <span className="text-5xl sm:text-6xl drop-shadow-[0_0_20px_rgba(251,191,36,0.7)] transform group-hover:scale-110 transition-transform">
                    {currentRank.icon}
                  </span>

                  <span className="text-xs sm:text-sm font-serif font-black tracking-wide text-amber-200 mt-1 max-w-[180px] line-clamp-1">
                    {currentRank.title}
                  </span>
                  <span className="text-[10px] text-amber-400/90 font-mono tracking-wider">
                    АРКАН УР. {currentRank.level}
                  </span>
                </div>

                {/* Floating numbers on tap */}
                {floatingNumbers.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 1, y: item.y - 40, x: item.x - 20, scale: 1 }}
                    animate={{ opacity: 0, y: item.y - 120, scale: 1.4 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="absolute pointer-events-none text-2xl font-serif font-black text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] z-30"
                  >
                    {item.text}
                  </motion.div>
                ))}
              </div>

              {/* Energy Gauge */}
              <div className="w-full max-w-sm mt-8 space-y-2 relative z-10">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-amber-300 font-serif font-bold">
                    <Zap size={14} className="fill-amber-400 text-amber-400" />
                    <span>Энергия Праны</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300/90 border border-amber-500/20 font-mono">
                      +100 за 10 мин
                    </span>
                    <span className="font-mono text-slate-200 font-bold">
                      {Math.floor(gameState.energy)} / {gameState.maxEnergy}
                    </span>
                  </div>
                </div>

                <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5 relative">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                    style={{ width: `${(gameState.energy / gameState.maxEnergy) * 100}%` }}
                  />
                </div>

                {/* Energy Status / Full time countdown & Quick Boost Trigger */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  {gameState.energy < gameState.maxEnergy ? (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock size={11} className="text-amber-400/80" />
                      <span>
                        До полного заряда: ~
                        {Math.ceil((gameState.maxEnergy - gameState.energy) / ENERGY_REGEN_PER_SECOND / 60) >= 60
                          ? `${Math.floor(Math.ceil((gameState.maxEnergy - gameState.energy) / ENERGY_REGEN_PER_SECOND / 60) / 60)} ч ${Math.ceil((gameState.maxEnergy - gameState.energy) / ENERGY_REGEN_PER_SECOND / 60) % 60} мин`
                          : `${Math.ceil((gameState.maxEnergy - gameState.energy) / ENERGY_REGEN_PER_SECOND / 60)} мин`}
                      </span>
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      <span>Максимальный заряд готов</span>
                    </span>
                  )}

                  {gameState.fullEnergyBoostsLeft > 0 && gameState.energy < gameState.maxEnergy * 0.7 && (
                    <button
                      type="button"
                      onClick={() => setIsBoostModalOpen(true)}
                      className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                    >
                      Буст ({gameState.fullEnergyBoostsLeft})
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Quick Actions Bar: Leaders & Relax Ambient Sounds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Leaderboard Preview Card */}
              <div 
                onClick={() => {
                  triggerHaptic(8);
                  setActiveSubTab('leaders');
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-[#141d33] to-[#0a1020] border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer flex items-center justify-between group shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg shadow-inner">
                    🏆
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-serif font-bold text-amber-200">Топ Кармических Лидеров</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">LIVE</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Смотреть рейтинг и выразить респект</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Ambient Sound Therapy shortcut */}
              {onNavigateToSound && (
                <div 
                  onClick={() => {
                    triggerHaptic(8);
                    onNavigateToSound();
                  }}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-[#171b12] to-[#0d150b] border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer flex items-center justify-between group shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg shadow-inner">
                      🌿
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-serif font-bold text-emerald-200">Звуковая Терапия & Релакс</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">432Hz</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Костер с дождем, птицы и мелодии</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </div>

            {/* Quick Tips & Mini Daily Banner */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <span className="text-xl">🧙‍♂️</span>
                <p>
                  Старец копит до <strong className="text-amber-300">3 часов</strong> пассивного дохода офлайн. Качайте карты во вкладке «Прокачка»!
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('mine')}
                className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all font-serif font-bold text-xs whitespace-nowrap cursor-pointer"
              >
                К картам майнинга →
              </button>
            </div>

          </div>
        )}

        {/* 2. MINE / UPGRADE CARDS TAB */}
        {activeSubTab === 'mine' && (
          <div className="space-y-4">
            
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'practices', label: '🧘 Практики', desc: 'Медитации & Чакры' },
                { id: 'artifacts', label: '💎 Талисманы', desc: 'Камни & Чётки' },
                { id: 'infrastructure', label: '🏛️ Алтари', desc: 'Ашрамы & Фермы' },
                { id: 'special', label: '✨ Спецкарты', desc: 'Эксклюзивы TON' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    triggerHaptic(8);
                    setSelectedCardCategory(cat.id as any);
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-serif font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCardCategory === cat.id
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-black/40 text-slate-300 border border-white/10 hover:border-emerald-500/30'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {UPGRADE_CARDS.filter((c) => c.category === selectedCardCategory).map((card) => {
                const currentLevel = gameState.cards[card.id] || 0;
                const cost = getCardCost(card, currentLevel);
                const profitIncrease = getCardProfitIncrease(card, currentLevel);
                const canAfford = gameState.coins >= cost;
                const isLocked = gameState.level < card.requiredLevel;

                return (
                  <div
                    key={card.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isLocked 
                        ? 'bg-black/30 border-white/5 opacity-60' 
                        : 'bg-[#0d1527] border-amber-500/20 hover:border-amber-500/40 shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                        {card.icon}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-serif font-bold text-white truncate">{card.title}</h4>
                          {currentLevel > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold">
                              ур. {currentLevel}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* Stats & Upgrade Button */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] text-slate-400">Прибыль в час</p>
                        <p className="text-xs font-serif font-bold text-emerald-400">
                          +{formatNumberAbbreviated(profitIncrease)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleBuyCard(card)}
                        disabled={!canAfford || isLocked}
                        className={`py-2 px-3.5 rounded-xl font-serif font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          isLocked
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-500/20'
                            : 'bg-black/50 border border-amber-500/30 text-amber-200/50 cursor-not-allowed'
                        }`}
                      >
                        {isLocked ? (
                          <>
                            <Lock size={12} />
                            <span>Ранг {card.requiredLevel}</span>
                          </>
                        ) : (
                          <>
                            <Coins size={13} />
                            <span>{formatNumberAbbreviated(cost)}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* 3. COMBO & CIPHER TAB */}
        {activeSubTab === 'combo' && (
          <div className="space-y-6">
            
            {/* Daily Combo (3 Cards) */}
            <div className="bg-[#0c1429] border border-purple-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-white">Сакральное Комбо Дня</h3>
                    <p className="text-xs text-slate-400">Улучшите 3 тайные карты сегодня и заберите награду</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-serif font-bold text-amber-400">+5,000,000</span>
                  <p className="text-[10px] text-slate-500">монет $CHUBUK</p>
                </div>
              </div>

              {/* 3 Card Slots */}
              <div className="grid grid-cols-3 gap-2.5">
                {[0, 1, 2].map((idx) => {
                  const targetCardId = dailyCombo.cardIds[idx];
                  const targetCard = UPGRADE_CARDS.find((c) => c.id === targetCardId);
                  const isFound = (gameState.dailyComboFound || []).includes(targetCardId);

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 min-h-[100px] transition-all ${
                        isFound
                          ? 'bg-purple-950/60 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                          : 'bg-black/40 border-white/10'
                      }`}
                    >
                      {isFound && targetCard ? (
                        <>
                          <span className="text-3xl">{targetCard.icon}</span>
                          <p className="text-[11px] font-serif font-bold text-purple-200 truncate w-full">
                            {targetCard.title}
                          </p>
                          <span className="text-[9px] text-emerald-400 font-bold">ОТКРЫТО</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl text-slate-600">❓</span>
                          <p className="text-[10px] text-slate-400 font-serif">Карта #{idx + 1}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {gameState.dailyComboClaimedDate === today ? (
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2 font-serif font-bold">
                  <CheckCircle2 size={16} />
                  <span>Комбо на сегодня успешно собрано! Ждите завтрашнего обновления</span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 text-center">
                  Подсказка: прокачивайте различные карты из категорий «Практики», «Талисманы» и «Алтари».
                </p>
              )}
            </div>

            {/* Daily Morse Cipher */}
            <div className="bg-[#0c1429] border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                    <Key size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-white">Сакральный Шифр Морзе</h3>
                    <p className="text-xs text-slate-400">Наберите тайное слово дня и получите 1 000 000 монет</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-serif font-bold text-amber-400">+1,000,000</span>
                  <p className="text-[10px] text-slate-500">монет $CHUBUK</p>
                </div>
              </div>

              {/* Decoded letters display */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-center space-y-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                  Подсказка оракула: «{dailyCipher.hint}»
                </p>
                <div className="flex items-center justify-center gap-2 min-h-[36px]">
                  {dailyCipher.word.split('').map((char, i) => {
                    const decodedChar = morseDecodedText[i];
                    const isCorrect = decodedChar === char;
                    return (
                      <span
                        key={i}
                        className={`w-9 h-11 rounded-xl border flex items-center justify-center text-lg font-mono font-bold ${
                          isCorrect
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                            : 'bg-black/60 border-white/10 text-slate-600'
                        }`}
                      >
                        {decodedChar || '_'}
                      </span>
                    );
                  })}
                </div>

                {morseInput && (
                  <p className="text-xs font-mono text-amber-400">Ввод: {morseInput}</p>
                )}
              </div>

              {/* Interactive Morse Tap Button */}
              {gameState.dailyCipherSolvedDate !== today ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onMouseDown={handleMorseTouchStart}
                    onMouseUp={handleMorseTouchEnd}
                    onTouchStart={handleMorseTouchStart}
                    onTouchEnd={handleMorseTouchEnd}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-98 transition-transform cursor-pointer select-none"
                  >
                    Клик = Точка ( • )  /  Зажатие = Тире ( — )
                  </button>

                  <button
                    type="button"
                    onClick={handleClearMorse}
                    className="px-4 py-4 rounded-2xl bg-black/40 border border-white/10 text-slate-400 hover:text-white transition-colors text-xs font-serif whitespace-nowrap cursor-pointer"
                  >
                    Сбросить
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2 font-serif font-bold">
                  <CheckCircle2 size={16} />
                  <span>Шифр дня «{dailyCipher.word}» успешно разгадан!</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 4. QUESTS & EARN TAB */}
        {activeSubTab === 'quests' && (
          <div className="space-y-6">
            
            {/* Daily Check-in Streak Section */}
            <div className="bg-[#0c1429] border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-serif font-bold text-white">Ежедневный Стрик Алтаря</h3>
                  <p className="text-xs text-slate-400">Заходите каждый день — награда растет вплоть до 5M монет</p>
                </div>
                <div className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
                  {gameState.dailyCheckinStreak} / 10 ДНЕЙ
                </div>
              </div>

              {/* 10 Days Grid */}
              <div className="grid grid-cols-5 gap-2">
                {DAILY_CHECKIN_REWARDS.map((rew, index) => {
                  const dayNum = index + 1;
                  const isCurrent = gameState.dailyCheckinStreak === dayNum - 1 && gameState.lastCheckinDate !== today;
                  const isClaimed = gameState.dailyCheckinStreak >= dayNum && (dayNum < gameState.dailyCheckinStreak || gameState.lastCheckinDate === today);

                  return (
                    <div
                      key={dayNum}
                      className={`p-2 rounded-xl border text-center flex flex-col items-center justify-between min-h-[72px] text-[10px] ${
                        isClaimed
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : isCurrent
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse'
                          : 'bg-black/30 border-white/5 text-slate-500'
                      }`}
                    >
                      <span className="font-bold">День {dayNum}</span>
                      <span className="font-serif font-bold text-white">+{formatNumberAbbreviated(rew)}</span>
                      <span>{isClaimed ? '✓' : isCurrent ? 'Сегодня' : '🔒'}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleDailyCheckin}
                disabled={gameState.lastCheckinDate === today}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {gameState.lastCheckinDate === today ? 'Награда за сегодня уже получена' : 'Забрать ежедневную награду'}
              </button>
            </div>

            {/* Quests List */}
            <div className="space-y-3">
              <h3 className="text-sm font-serif font-bold text-slate-300">Сакральные Задания Экосистемы</h3>

              <div className="space-y-2.5">
                {DAILY_QUESTS.map((quest) => {
                  const isCompleted = gameState.completedQuests.includes(quest.id);

                  return (
                    <div
                      key={quest.id}
                      className="p-4 rounded-2xl bg-[#0b1222] border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-xl shrink-0">
                          {quest.icon}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-serif font-bold text-white">{quest.title}</h4>
                          <p className="text-[11px] text-slate-400">{quest.description}</p>
                          <span className="text-xs font-serif font-bold text-amber-400">
                            +{formatNumberAbbreviated(quest.reward)} монет
                          </span>
                        </div>
                      </div>

                      {isCompleted ? (
                        <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                          <CheckCircle2 size={18} />
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (quest.id === 'quest_matrix_calc' && onNavigateToMatrix) {
                              onNavigateToMatrix();
                            } else if (quest.id === 'quest_tarot_reading' && onNavigateToTarot) {
                              onNavigateToTarot();
                            } else if (quest.id === 'quest_sound_therapy' && onNavigateToSound) {
                              onNavigateToSound();
                            } else {
                              handleCompleteQuest(quest);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-serif font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-md shadow-amber-500/20"
                        >
                          Выполнить
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* 5. KARMIC LEADERS TAB */}
        {activeSubTab === 'leaders' && (
          <div className="space-y-4">
            <KarmicLeaderboard
              userKarma={gameState.totalEarned}
              userProfitPerHour={gameState.profitPerHour}
              userLevel={gameState.level}
              userName={userInput?.name || 'Вы (Искатель Истины)'}
              onNavigateToMatrix={onNavigateToMatrix}
            />
          </div>
        )}

        {/* 6. AIRDROP & WEB3 TAB */}
        {activeSubTab === 'airdrop' && (
          <div className="space-y-6">
            
            {/* Airdrop Banner */}
            <div className="bg-gradient-to-br from-[#101b38] via-[#0d162d] to-[#120f26] border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-serif font-bold uppercase tracking-wider">
                  <Award size={14} />
                  <span>Roadmap: Листинг и Дроп $CHUBUK</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif text-white">
                  Ваша активность в игре будет вознаграждена
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Мы конвертируем накопленный «Пассивный доход в час», ранг просветления, стрик посещений и расчеты Матрицы Судьбы в реальные привилегии, VIP-доступ и будущий airdrop токена $CHUBUK.
                </p>
              </div>

              {/* Wallet Connection Card */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-sky-500/30">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-white">Кошелек TON / Web3</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {gameState.walletAddress ? `Подключен: ${gameState.walletAddress}` : 'Не подключен'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConnectWallet}
                  className={`px-5 py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    gameState.walletAddress
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                      : 'bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-black shadow-lg shadow-sky-500/20'
                  }`}
                >
                  {gameState.walletAddress ? 'Отключить' : 'Подключить TON Кошелек'}
                </button>
              </div>

              {/* Criteria Checklist */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-serif font-bold text-slate-300 uppercase tracking-wider">
                  Критерии распределения дропа:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2 text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Пассивный доход в час (главный фактор)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2 text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Ранг просветления (1 — 10 уровни)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2 text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Стрик посещений и выполненные задания</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2 text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Расчеты в Матрице Судьбы и Таро</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Offline Earnings Welcome Modal */}
      <AnimatePresence>
        {offlineData && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0d1428] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-3xl animate-bounce">
                🪙
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-serif text-white">Старец сохранил энергию!</h3>
                <p className="text-xs text-slate-300">
                  Пока вы были офлайн ({Math.floor(offlineData.seconds / 60)} мин), ваши алтари продолжали майнить монеты кармы.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/30">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Накоплено</p>
                <p className="text-3xl font-serif font-black text-amber-300">
                  +{offlineData.amount.toLocaleString('ru-RU')}
                </p>
                <p className="text-[10px] text-slate-400">монет $CHUBUK</p>
              </div>

              <button
                onClick={() => {
                  if (soundEnabled) soundFx.playCoin();
                  setOfflineData(null);
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 cursor-pointer"
              >
                Собрать в кошелек
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Boosters Modal */}
      <AnimatePresence>
        {isBoostModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0d1428] border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <Zap size={18} className="text-amber-400 fill-amber-400" />
                  <span>Сакральные Бустеры</span>
                </h3>
                <button
                  onClick={() => setIsBoostModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {/* 1. Full Energy Boost */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-serif font-bold text-white">Полная Энергия</h4>
                    <p className="text-xs text-slate-400">Мгновенно восстанавливает 100% праны (базово: +100 за 10 мин)</p>
                    <span className="text-[10px] text-amber-400 font-bold">
                      Осталось: {gameState.fullEnergyBoostsLeft} из 6 сегодня
                    </span>
                  </div>

                  <button
                    onClick={handleUseFullEnergyBoost}
                    disabled={gameState.fullEnergyBoostsLeft <= 0 || gameState.energy >= gameState.maxEnergy}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-serif font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Активировать
                  </button>
                </div>

                {/* 2. Turbo Multitap Boost */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-serif font-bold text-white">Турбо-Аура (5X на 20 сек)</h4>
                    <p className="text-xs text-slate-400">Умножает силу каждого тапа в 5 раз</p>
                    <span className="text-[10px] text-amber-400 font-bold">
                      Осталось: {gameState.turboBoostsLeft} из 3 сегодня
                    </span>
                  </div>

                  <button
                    onClick={handleUseTurboBoost}
                    disabled={gameState.turboBoostsLeft <= 0 || turboActiveUntil !== null}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:brightness-110 text-white font-serif font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Запустить
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Levels Info Modal */}
      <AnimatePresence>
        {isLevelModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0d1428] border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Арканы Таро: Путь Восхождения</h3>
                  <p className="text-xs text-slate-400">От Младших Арканов к Высшим Старшим Арканам</p>
                </div>
                <button
                  onClick={() => setIsLevelModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5">
                {RANKS.map((r) => {
                  const isCurrent = r.level === currentRank.level;
                  const isUnlocked = gameState.totalEarned >= r.requiredCoins;

                  return (
                    <div
                      key={r.level}
                      className={`p-3.5 rounded-2xl border flex flex-col gap-2 text-xs transition-all ${
                        isCurrent
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10'
                          : isUnlocked
                          ? 'bg-black/40 border-emerald-500/30 text-slate-300'
                          : 'bg-black/20 border-white/5 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl border ${
                            isCurrent ? 'bg-amber-400/20 border-amber-400' : isUnlocked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/40 border-white/5'
                          }`}>
                            {r.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-serif font-bold text-white text-sm">{r.title}</p>
                            </div>
                            <p className="text-[10px] text-amber-400/80 font-mono">
                              {r.arcanaType}
                            </p>
                          </div>
                        </div>

                        {isCurrent ? (
                          <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-[10px] shadow-sm">
                            ТЕКУЩИЙ АРКАН
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                            <span>✓</span> ОТКРЫТ
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px] flex items-center gap-1 font-mono">
                            <span>🔒</span> {formatNumberAbbreviated(r.requiredCoins)} $CHUBUK
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 italic pl-1 border-l-2 border-amber-500/30">
                        {r.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reward Toast Banner */}
      <AnimatePresence>
        {rewardToast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black shadow-2xl flex items-center gap-3 font-serif font-bold text-xs sm:text-sm border border-white/40"
          >
            <Sparkles size={18} className="animate-spin" />
            <div>
              <p className="font-black">{rewardToast.title}</p>
              <p className="text-[11px] font-mono">+{rewardToast.amount.toLocaleString('ru-RU')} $CHUBUK</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default KarmaTapperSection;
