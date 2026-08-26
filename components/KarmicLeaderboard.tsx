import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  Shield, 
  Award, 
  Heart, 
  Star, 
  Users, 
  ChevronRight, 
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { formatNumberAbbreviated, RANKS } from '../services/tapperGameUtils';

export interface LeaderPlayer {
  id: string;
  rankPosition: number;
  nickname: string;
  avatar: string;
  title: string;
  arcanaRank: string;
  arcanaLevel: number;
  totalKarma: number;
  profitPerHour: number;
  matrixCode: string;
  respectsCount: number;
  badgeColor: string;
  isOnline: boolean;
  specialAura: string;
}

const STATIC_LEADERS: LeaderPlayer[] = [
  {
    id: 'leader_1',
    rankPosition: 1,
    nickname: '🌟 Верховный Маг Чубук',
    avatar: '🧙‍♂️',
    title: 'Хранитель 22 Арканов',
    arcanaRank: 'XXI. Мир (The World)',
    arcanaLevel: 10,
    totalKarma: 1584200000,
    profitPerHour: 24500000,
    matrixCode: '10-21-3',
    respectsCount: 14205,
    badgeColor: 'from-amber-400 via-amber-300 to-yellow-500',
    isOnline: true,
    specialAura: 'Золотая Аура Вознесения'
  },
  {
    id: 'leader_2',
    rankPosition: 2,
    nickname: '🔮 Жрица Астрала',
    avatar: '🧝‍♀️',
    title: 'Владычица Лунных Врат',
    arcanaRank: 'XIX. Солнце (The Sun)',
    arcanaLevel: 9,
    totalKarma: 920400000,
    profitPerHour: 18200000,
    matrixCode: '2-18-9',
    respectsCount: 9840,
    badgeColor: 'from-purple-400 via-pink-400 to-indigo-500',
    isOnline: true,
    specialAura: 'Фиолетовый Вихрь Интуиции'
  },
  {
    id: 'leader_3',
    rankPosition: 3,
    nickname: '⚡ Алхимик 528 Гц',
    avatar: '👨‍🔬',
    title: 'Трансмутатор Энергии',
    arcanaRank: 'XVII. Звезда (The Star)',
    arcanaLevel: 8,
    totalKarma: 645100000,
    profitPerHour: 12900000,
    matrixCode: '17-7-14',
    respectsCount: 7120,
    badgeColor: 'from-cyan-400 via-blue-400 to-teal-500',
    isOnline: false,
    specialAura: 'Бирюзовый Поток Частот'
  },
  {
    id: 'leader_4',
    rankPosition: 4,
    nickname: '🦁 Император Силы',
    avatar: '👑',
    title: 'Мастер Материализации',
    arcanaRank: 'XIV. Умеренность',
    arcanaLevel: 7,
    totalKarma: 380200000,
    profitPerHour: 8400000,
    matrixCode: '4-11-8',
    respectsCount: 5490,
    badgeColor: 'from-rose-400 to-red-500',
    isOnline: true,
    specialAura: 'Огненный Рубиновый Щит'
  },
  {
    id: 'leader_5',
    rankPosition: 5,
    nickname: '🧘‍♂️ Шаман Тибета',
    avatar: '🕉️',
    title: 'Проводник 432 Гц',
    arcanaRank: 'XI. Справедливость',
    arcanaLevel: 6,
    totalKarma: 215800000,
    profitPerHour: 5100000,
    matrixCode: '9-20-11',
    respectsCount: 4210,
    badgeColor: 'from-emerald-400 to-green-600',
    isOnline: true,
    specialAura: 'Изумрудное Древо Жизни'
  },
  {
    id: 'leader_6',
    rankPosition: 6,
    nickname: '🗝️ Хранитель Матрицы',
    avatar: '🗝️',
    title: 'Декодер Судьбы',
    arcanaRank: 'X. Колесо Фортуны',
    arcanaLevel: 5,
    totalKarma: 112400000,
    profitPerHour: 3400000,
    matrixCode: '10-10-20',
    respectsCount: 3180,
    badgeColor: 'from-amber-500 to-orange-600',
    isOnline: false,
    specialAura: 'Колесо Вечной Удачи'
  },
  {
    id: 'leader_7',
    rankPosition: 7,
    nickname: '🌙 Оракул Ночного Огня',
    avatar: '🦉',
    title: 'Чтец Хроник Акаши',
    arcanaRank: 'VI. Влюбленные',
    arcanaLevel: 4,
    totalKarma: 58900000,
    profitPerHour: 1950000,
    matrixCode: '6-12-18',
    respectsCount: 2450,
    badgeColor: 'from-indigo-400 to-purple-600',
    isOnline: true,
    specialAura: 'Лунное Сияние Познания'
  },
  {
    id: 'leader_8',
    rankPosition: 8,
    nickname: '⚔️ Рыцарь Жезлов',
    avatar: '🛡️',
    title: 'Апостол Воли',
    arcanaRank: 'IV. Император',
    arcanaLevel: 3,
    totalKarma: 24700000,
    profitPerHour: 880000,
    matrixCode: '4-7-1',
    respectsCount: 1890,
    badgeColor: 'from-blue-400 to-indigo-600',
    isOnline: true,
    specialAura: 'Сапфировый Кристалл'
  },
  {
    id: 'leader_9',
    rankPosition: 9,
    nickname: '🕊️ Пилигрим Дзена',
    avatar: '🌿',
    title: 'Искатель Баланса',
    arcanaRank: 'II. Верховная Жрица',
    arcanaLevel: 2,
    totalKarma: 8400000,
    profitPerHour: 340000,
    matrixCode: '2-5-7',
    respectsCount: 1320,
    badgeColor: 'from-teal-400 to-emerald-500',
    isOnline: false,
    specialAura: 'Мятный Ветерок Покоя'
  },
  {
    id: 'leader_10',
    rankPosition: 10,
    nickname: '🌱 Пробужденный Неофит',
    avatar: '✨',
    title: 'Первые Шаги Таро',
    arcanaRank: 'I. Туз Пентаклей',
    arcanaLevel: 1,
    totalKarma: 1200000,
    profitPerHour: 95000,
    matrixCode: '1-3-4',
    respectsCount: 940,
    badgeColor: 'from-yellow-400 to-amber-600',
    isOnline: true,
    specialAura: 'Золотое Зерно Потенциала'
  }
];

interface KarmicLeaderboardProps {
  userKarma: number;
  userProfitPerHour: number;
  userLevel: number;
  userName?: string;
  onNavigateToMatrix?: () => void;
}

export const KarmicLeaderboard: React.FC<KarmicLeaderboardProps> = ({
  userKarma,
  userProfitPerHour,
  userLevel,
  userName = 'Вы (Искатель Истины)',
  onNavigateToMatrix
}) => {
  const [filterType, setFilterType] = useState<'total' | 'profit' | 'respects'>('total');
  const [respectedIds, setRespectedIds] = useState<Record<string, boolean>>({});
  const [respectBonusCounts, setRespectBonusCounts] = useState<Record<string, number>>({});
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderPlayer | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate dynamic user position
  const currentRankInfo = RANKS[Math.min(RANKS.length - 1, userLevel - 1)] || RANKS[0];

  const sortedLeaders = [...STATIC_LEADERS].sort((a, b) => {
    if (filterType === 'profit') {
      return b.profitPerHour - a.profitPerHour;
    }
    if (filterType === 'respects') {
      const respA = a.respectsCount + (respectBonusCounts[a.id] || 0);
      const respB = b.respectsCount + (respectBonusCounts[b.id] || 0);
      return respB - respA;
    }
    return b.totalKarma - a.totalKarma;
  });

  const filteredLeaders = sortedLeaders.filter(l => 
    l.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.arcanaRank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine user simulated place in leaderboard
  let userSimulatedRank = 11;
  for (let i = 0; i < sortedLeaders.length; i++) {
    const val = filterType === 'profit' ? sortedLeaders[i].profitPerHour : sortedLeaders[i].totalKarma;
    const userVal = filterType === 'profit' ? userProfitPerHour : userKarma;
    if (userVal >= val) {
      userSimulatedRank = i + 1;
      break;
    }
  }

  const handleGiveRespect = (playerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (respectedIds[playerId]) return;
    setRespectedIds(prev => ({ ...prev, [playerId]: true }));
    setRespectBonusCounts(prev => ({ ...prev, [playerId]: (prev[playerId] || 0) + 1 }));
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Airdrop Countdown */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0c1427] via-[#101b33] to-[#090e1c] border border-amber-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-amber-500/30">
              <Trophy size={24} className="text-black" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-serif font-black text-amber-200">Топ Кармических Лидеров</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                  Сезон 1
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Рейтинг искателей по накопленной карме и мощности Арканов Таро
              </p>
            </div>
          </div>

          {/* Season Prize Pool */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/50 border border-amber-500/30 text-xs">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Пул кармического Дропа:</span>
              <span className="font-serif font-bold text-amber-300">10 000 000 $CHUBUK</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setFilterType('total')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filterType === 'total'
                  ? 'bg-amber-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🪙 По Карме
            </button>
            <button
              onClick={() => setFilterType('profit')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filterType === 'profit'
                  ? 'bg-emerald-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📈 По Доходу/ч
            </button>
            <button
              onClick={() => setFilterType('respects')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filterType === 'respects'
                  ? 'bg-rose-500 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ❤️ По Респектам
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по никнейму или Аркану..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-black/40 rounded-xl border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      {!searchQuery && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-2 pb-2">
          {/* Rank 2 (Silver) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setSelectedPlayer(sortedLeaders[1])}
            className="p-3 rounded-2xl bg-gradient-to-b from-[#131b2e] to-[#0a0f1d] border border-slate-400/30 text-center cursor-pointer hover:border-slate-300 transition-all flex flex-col items-center justify-between min-h-[160px] relative shadow-lg"
          >
            <div className="absolute -top-3 w-6 h-6 rounded-full bg-slate-300 text-black font-bold text-xs flex items-center justify-center shadow-md">
              2
            </div>
            <div className="text-2xl mt-2">{sortedLeaders[1].avatar}</div>
            <div>
              <p className="text-xs font-serif font-bold text-slate-200 truncate w-full max-w-[90px] sm:max-w-[120px]">
                {sortedLeaders[1].nickname}
              </p>
              <span className="text-[10px] text-purple-300 font-mono block">
                {sortedLeaders[1].arcanaRank.split(' ')[0]}
              </span>
            </div>
            <div className="mt-1 pt-1 border-t border-white/5 w-full">
              <span className="text-xs font-serif font-black text-amber-300">
                {formatNumberAbbreviated(sortedLeaders[1].totalKarma)}
              </span>
            </div>
          </motion.div>

          {/* Rank 1 (Gold / Champion) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedPlayer(sortedLeaders[0])}
            className="p-3.5 rounded-3xl bg-gradient-to-b from-[#211808] via-[#1a1408] to-[#0c0d14] border-2 border-amber-400/80 text-center cursor-pointer hover:border-amber-300 transition-all flex flex-col items-center justify-between min-h-[190px] relative shadow-2xl shadow-amber-500/20"
          >
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-black font-black text-sm flex items-center justify-center shadow-lg ring-4 ring-[#080d1a]">
              👑 1
            </div>
            <div className="text-3xl mt-2">{sortedLeaders[0].avatar}</div>
            <div>
              <p className="text-xs sm:text-sm font-serif font-black text-amber-200 truncate w-full max-w-[100px] sm:max-w-[140px]">
                {sortedLeaders[0].nickname}
              </p>
              <span className="text-[10px] text-amber-400 font-bold block">
                {sortedLeaders[0].title}
              </span>
            </div>
            <div className="mt-1 pt-1.5 border-t border-amber-500/20 w-full">
              <span className="text-sm font-serif font-black text-amber-300">
                {formatNumberAbbreviated(sortedLeaders[0].totalKarma)} 🪙
              </span>
            </div>
          </motion.div>

          {/* Rank 3 (Bronze) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setSelectedPlayer(sortedLeaders[2])}
            className="p-3 rounded-2xl bg-gradient-to-b from-[#1b1510] to-[#0a0f1d] border border-amber-700/40 text-center cursor-pointer hover:border-amber-600 transition-all flex flex-col items-center justify-between min-h-[150px] relative shadow-lg"
          >
            <div className="absolute -top-3 w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-bold text-xs flex items-center justify-center shadow-md">
              3
            </div>
            <div className="text-2xl mt-2">{sortedLeaders[2].avatar}</div>
            <div>
              <p className="text-xs font-serif font-bold text-amber-100 truncate w-full max-w-[90px] sm:max-w-[120px]">
                {sortedLeaders[2].nickname}
              </p>
              <span className="text-[10px] text-cyan-300 font-mono block">
                {sortedLeaders[2].arcanaRank.split(' ')[0]}
              </span>
            </div>
            <div className="mt-1 pt-1 border-t border-white/5 w-full">
              <span className="text-xs font-serif font-black text-amber-300">
                {formatNumberAbbreviated(sortedLeaders[2].totalKarma)}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="bg-[#080d1a]/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-3 bg-black/40 border-b border-white/10 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-3">
            <span className="w-6 text-center">#</span>
            <span>Игрок / Аркан</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Прибыль/ч</span>
            <span>Карма</span>
            <span className="w-8 text-center">Лайк</span>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredLeaders.map((player) => {
            const hasRespected = respectedIds[player.id];
            const currentRespects = player.respectsCount + (respectBonusCounts[player.id] || 0);

            return (
              <motion.div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                className="p-3 flex items-center justify-between gap-2 transition-all cursor-pointer group"
              >
                {/* Left rank & player info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 text-center font-mono font-bold text-xs">
                    {player.rankPosition === 1 ? (
                      <span className="text-amber-400 font-black">🥇</span>
                    ) : player.rankPosition === 2 ? (
                      <span className="text-slate-300 font-black">🥈</span>
                    ) : player.rankPosition === 3 ? (
                      <span className="text-amber-600 font-black">🥉</span>
                    ) : (
                      <span className="text-slate-400">#{player.rankPosition}</span>
                    )}
                  </div>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-xl shadow-inner">
                      {player.avatar}
                    </div>
                    {player.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#080d1a]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif font-bold text-xs sm:text-sm text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                        {player.nickname}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="text-purple-300 font-medium truncate">{player.arcanaRank}</span>
                      <span className="hidden sm:inline text-slate-600">•</span>
                      <span className="hidden sm:inline text-amber-400/80 font-mono">Код {player.matrixCode}</span>
                    </div>
                  </div>
                </div>

                {/* Right stats */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-emerald-400/80 font-mono block">
                      +{formatNumberAbbreviated(player.profitPerHour)}/ч
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-serif font-bold text-amber-300 block">
                      {formatNumberAbbreviated(player.totalKarma)} 🪙
                    </span>
                  </div>

                  {/* Respect Button */}
                  <button
                    onClick={(e) => handleGiveRespect(player.id, e)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      hasRespected 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                        : 'bg-black/40 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30'
                    }`}
                    title="Выразить кармический респект"
                  >
                    <Heart size={14} className={hasRespected ? 'fill-rose-400 text-rose-400' : ''} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Current User Floating Sticky Rank Bar */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#181102] to-amber-950/80 border-2 border-amber-500/50 flex items-center justify-between gap-3 shadow-2xl sticky bottom-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-black font-black text-xs flex items-center justify-center font-mono shadow-md shrink-0">
            #{userSimulatedRank}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-serif font-bold text-amber-200 truncate">
                {userName}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Вы
              </span>
            </div>
            <p className="text-[10px] text-slate-300 truncate">
              {currentRankInfo.title} • {formatNumberAbbreviated(userProfitPerHour)}/ч
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs sm:text-sm font-serif font-black text-amber-300 block">
            {formatNumberAbbreviated(userKarma)} 🪙
          </span>
          <span className="text-[10px] text-emerald-400">
            Активный участник
          </span>
        </div>
      </div>

      {/* Player Detail Card Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-[#0d1424] border border-amber-500/40 rounded-3xl p-6 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center space-y-3 relative z-10">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-black/80 to-amber-950/50 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20">
                  {selectedPlayer.avatar}
                </div>

                <div>
                  <h3 className="text-lg font-serif font-black text-amber-200">
                    {selectedPlayer.nickname}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium">
                    {selectedPlayer.title}
                  </p>
                </div>

                {/* Aura Badge */}
                <div className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 font-serif">
                  ✨ {selectedPlayer.specialAura}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 text-left pt-2">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Текущий Аркан:</span>
                    <span className="text-xs font-serif font-bold text-amber-300">
                      {selectedPlayer.arcanaRank}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Кармический Код:</span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {selectedPlayer.matrixCode}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Всего Кармы:</span>
                    <span className="text-xs font-serif font-black text-amber-400">
                      {selectedPlayer.totalKarma.toLocaleString('ru-RU')}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Прибыль в час:</span>
                    <span className="text-xs font-serif font-bold text-emerald-400">
                      +{formatNumberAbbreviated(selectedPlayer.profitPerHour)}
                    </span>
                  </div>
                </div>

                {/* Respect button in modal */}
                <button
                  onClick={(e) => handleGiveRespect(selectedPlayer.id, e)}
                  className={`w-full py-2.5 rounded-xl font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    respectedIds[selectedPlayer.id]
                      ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50'
                      : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-lg shadow-rose-500/30'
                  }`}
                >
                  <Heart size={16} className={respectedIds[selectedPlayer.id] ? 'fill-rose-400' : ''} />
                  <span>
                    {respectedIds[selectedPlayer.id] 
                      ? 'Кармический респект выражен!' 
                      : `Выразить респект (${selectedPlayer.respectsCount + (respectBonusCounts[selectedPlayer.id] || 0)})`}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="w-full py-2 rounded-xl bg-black/40 text-slate-400 hover:text-white border border-white/10 text-xs font-medium cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
