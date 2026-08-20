import React, { useState } from 'react';
import { BiorhythmReport, BiorhythmDayPoint } from '../types';
import { 
  Activity, 
  Heart, 
  Brain, 
  Sparkles, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Calendar, 
  Zap, 
  ChevronRight, 
  Gauge, 
  Flame,
  MoonStar,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BiorhythmVisualProps {
  biorhythms: BiorhythmReport;
  targetDateStr: string;
}

export const BiorhythmVisual: React.FC<BiorhythmVisualProps> = ({ 
  biorhythms, 
  targetDateStr 
}) => {
  const [selectedDayPoint, setSelectedDayPoint] = useState<BiorhythmDayPoint | null>(
    biorhythms.timeline.find(d => d.isTarget) || biorhythms.timeline[3] || null
  );
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeCycleFilter, setActiveCycleFilter] = useState<'all' | 'physical' | 'emotional' | 'intellectual' | 'intuitive'>('all');

  const { physical, emotional, intellectual, intuitive, averageScore, overallState, daysLived, timeline } = biorhythms;

  // Chart SVG Coordinates Math
  // Timeline length = usually 15 points (0 to 14)
  const chartWidth = 700;
  const chartHeight = 240;
  const paddingX = 40;
  const paddingY = 25;
  const graphW = chartWidth - paddingX * 2;
  const graphH = chartHeight - paddingY * 2;
  const zeroY = paddingY + graphH / 2;

  const getX = (index: number) => paddingX + (index / (timeline.length - 1)) * graphW;
  const getY = (val: number) => zeroY - (val / 100) * (graphH / 2);

  // Generate SVG path strings
  const generatePath = (key: 'physical' | 'emotional' | 'intellectual' | 'intuitive' | 'average') => {
    return timeline.reduce((acc, point, idx) => {
      const x = getX(idx);
      const y = getY(point[key]);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  const cycles = [
    {
      key: 'physical' as const,
      data: physical,
      icon: Flame,
      colorClass: 'rose',
      strokeColor: '#ef4444',
      bgGlow: 'from-rose-500/20 to-red-950/40',
      badgeBorder: 'border-rose-500/40',
      textAccent: 'text-rose-400',
      periodTitle: '23 дня (Физический)'
    },
    {
      key: 'emotional' as const,
      data: emotional,
      icon: Heart,
      colorClass: 'pink',
      strokeColor: '#ec4899',
      bgGlow: 'from-pink-500/20 to-rose-950/40',
      badgeBorder: 'border-pink-500/40',
      textAccent: 'text-pink-400',
      periodTitle: '28 дней (Эмоциональный)'
    },
    {
      key: 'intellectual' as const,
      data: intellectual,
      icon: Brain,
      colorClass: 'blue',
      strokeColor: '#3b82f6',
      bgGlow: 'from-blue-500/20 to-cyan-950/40',
      badgeBorder: 'border-blue-500/40',
      textAccent: 'text-blue-400',
      periodTitle: '33 дня (Интеллектуальный)'
    },
    {
      key: 'intuitive' as const,
      data: intuitive,
      icon: Sparkles,
      colorClass: 'purple',
      strokeColor: '#a855f7',
      bgGlow: 'from-purple-500/20 to-indigo-950/40',
      badgeBorder: 'border-purple-500/40',
      textAccent: 'text-purple-400',
      periodTitle: '38 дней (Интуитивный)'
    }
  ];

  return (
    <div className="card-3d rounded-3xl p-7 border border-cyan-500/30 bg-gradient-to-br from-[#0a1520] via-[#091118] to-[#04080c] space-y-6 shadow-2xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Activity size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 block">
                Биоритмология и Природные Циклы
              </span>
              <button 
                onClick={() => setShowInfoModal(!showInfoModal)}
                className="text-slate-400 hover:text-cyan-300 transition-colors"
                title="Как работают биоритмы?"
              >
                <Info size={14} />
              </button>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-cyan-100 font-bold">
              Персональные Биоритмы Дня
            </h3>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-slate-300">
            ⏳ Прожито: <strong className="text-cyan-300">{daysLived.toLocaleString('ru-RU')}</strong> дн.
          </div>

          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${
            overallState === 'optimal'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : overallState === 'unstable_critical'
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              : overallState === 'recharge'
              ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
              : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
          }`}>
            <Gauge size={14} />
            <span>
              {overallState === 'optimal'
                ? `Пик Гармонии (+${averageScore}%)`
                : overallState === 'unstable_critical'
                ? `Критический день (${averageScore >= 0 ? '+' : ''}${averageScore}%)`
                : overallState === 'recharge'
                ? `Фаза Регенерации (${averageScore}%)`
                : `Продуктивный баланс (${averageScore >= 0 ? '+' : ''}${averageScore}%)`}
            </span>
          </div>
        </div>
      </div>

      {/* Info Modal / Explanation drawer if toggled */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 space-y-2 leading-relaxed"
          >
            <div className="flex items-center justify-between text-cyan-300 font-bold">
              <span>✦ Законы биоритмов человека</span>
              <button onClick={() => setShowInfoModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p>
              Биоритмы — это математические синусоидальные циклы, берущие отсчет в момент вашего рождения.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-black/40 border border-rose-500/20 text-rose-300">
                🔴 <strong>Физический (23d):</strong> Сила, иммунитет, реакция.
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-pink-500/20 text-pink-300">
                💗 <strong>Эмоциональный (28d):</strong> Чувства, харизма, нервы.
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-blue-500/20 text-blue-300">
                🔵 <strong>Интеллектуальный (33d):</strong> Память, логика, учеба.
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-purple-500/20 text-purple-300">
                🟣 <strong>Интуитивный (38d):</strong> Чутье, инсайты, сны.
              </div>
            </div>
            <div className="text-[11px] text-amber-300/90 pt-1">
              ⚠️ <strong>Критические дни (0%):</strong> момент пересечения линии нуля. В эти дни система переключается с разрядки на зарядку — внимание, осторожность и концентрация особенно важны.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Banner */}
      <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/20 text-slate-200 text-sm leading-relaxed flex items-start gap-3">
        <Zap className="text-cyan-400 shrink-0 mt-0.5" size={18} />
        <div>
          <strong className="text-cyan-300 font-semibold block mb-0.5">
            Общая динамика дня:
          </strong>
          <p className="text-slate-300 text-xs sm:text-sm font-light">
            {biorhythms.summaryText}
          </p>
        </div>
      </div>

      {/* Interactive Wave Chart Header / Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Calendar size={14} className="text-cyan-400" />
            <span>График биоритмов на 15 дней (Таймлайн)</span>
          </div>

          {/* Cycle Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveCycleFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeCycleFilter === 'all'
                  ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200 font-bold'
                  : 'bg-black/40 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Все циклы
            </button>
            <button
              onClick={() => setActiveCycleFilter('physical')}
              className={`px-2 py-1 rounded-lg transition-all ${
                activeCycleFilter === 'physical'
                  ? 'bg-rose-500/30 border border-rose-400 text-rose-200 font-bold'
                  : 'bg-black/40 text-slate-400 hover:text-rose-300 border border-white/5'
              }`}
            >
              🔴 Физ (23d)
            </button>
            <button
              onClick={() => setActiveCycleFilter('emotional')}
              className={`px-2 py-1 rounded-lg transition-all ${
                activeCycleFilter === 'emotional'
                  ? 'bg-pink-500/30 border border-pink-400 text-pink-200 font-bold'
                  : 'bg-black/40 text-slate-400 hover:text-pink-300 border border-white/5'
              }`}
            >
              💗 Эмо (28d)
            </button>
            <button
              onClick={() => setActiveCycleFilter('intellectual')}
              className={`px-2 py-1 rounded-lg transition-all ${
                activeCycleFilter === 'intellectual'
                  ? 'bg-blue-500/30 border border-blue-400 text-blue-200 font-bold'
                  : 'bg-black/40 text-slate-400 hover:text-blue-300 border border-white/5'
              }`}
            >
              🔵 Инт (33d)
            </button>
            <button
              onClick={() => setActiveCycleFilter('intuitive')}
              className={`px-2 py-1 rounded-lg transition-all ${
                activeCycleFilter === 'intuitive'
                  ? 'bg-purple-500/30 border border-purple-400 text-purple-200 font-bold'
                  : 'bg-black/40 text-slate-400 hover:text-purple-300 border border-white/5'
              }`}
            >
              🟣 Интуит (38d)
            </button>
          </div>
        </div>

        {/* SVG Interactive Canvas */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
          <div className="min-w-[620px] bg-[#060c13] rounded-2xl p-4 border border-cyan-500/20 relative shadow-inner">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                {/* Horizontal Zero-Line Gradient */}
                <linearGradient id="zeroLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                </linearGradient>

                {/* Positive area background fill */}
                <linearGradient id="posAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>

                {/* Negative area background fill */}
                <linearGradient id="negAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.08" />
                </linearGradient>
              </defs>

              {/* Top & Bottom shaded zones */}
              <rect x={paddingX} y={paddingY} width={graphW} height={graphH / 2} fill="url(#posAreaGrad)" />
              <rect x={paddingX} y={zeroY} width={graphW} height={graphH / 2} fill="url(#negAreaGrad)" />

              {/* Grid Lines */}
              {/* +100% line */}
              <line 
                x1={paddingX} y1={paddingY} 
                x2={chartWidth - paddingX} y2={paddingY} 
                stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="3 3" 
              />
              <text x={paddingX - 6} y={paddingY + 3} fill="#64748b" fontSize="9" textAnchor="end">+100%</text>

              {/* +50% line */}
              <line 
                x1={paddingX} y1={paddingY + graphH / 4} 
                x2={chartWidth - paddingX} y2={paddingY + graphH / 4} 
                stroke="#ffffff" strokeOpacity="0.04" strokeDasharray="2 2" 
              />

              {/* Zero baseline (Critical axis) */}
              <line 
                x1={paddingX} y1={zeroY} 
                x2={chartWidth - paddingX} y2={zeroY} 
                stroke="url(#zeroLineGrad)" strokeWidth="1.5" 
              />
              <text x={paddingX - 6} y={zeroY + 3} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="end">0%</text>

              {/* -50% line */}
              <line 
                x1={paddingX} y1={zeroY + graphH / 4} 
                x2={chartWidth - paddingX} y2={zeroY + graphH / 4} 
                stroke="#ffffff" strokeOpacity="0.04" strokeDasharray="2 2" 
              />

              {/* -100% line */}
              <line 
                x1={paddingX} y1={chartHeight - paddingY} 
                x2={chartWidth - paddingX} y2={chartHeight - paddingY} 
                stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="3 3" 
              />
              <text x={paddingX - 6} y={chartHeight - paddingY + 3} fill="#64748b" fontSize="9" textAnchor="end">-100%</text>

              {/* Vertical Date Grid & Labels */}
              {timeline.map((point, idx) => {
                const x = getX(idx);
                const isSelected = selectedDayPoint?.date === point.date;

                return (
                  <g key={point.date} className="cursor-pointer" onClick={() => setSelectedDayPoint(point)}>
                    {/* Vertical line */}
                    <line 
                      x1={x} y1={paddingY} 
                      x2={x} y2={chartHeight - paddingY} 
                      stroke={point.isTarget ? '#38bdf8' : isSelected ? '#fbbf24' : '#ffffff'} 
                      strokeOpacity={point.isTarget ? 0.35 : isSelected ? 0.4 : 0.05} 
                      strokeWidth={point.isTarget || isSelected ? 1.5 : 1}
                      strokeDasharray={point.isTarget ? 'none' : '2 2'}
                    />

                    {/* Target Day Indicator Background Pillar */}
                    {point.isTarget && (
                      <rect 
                        x={x - 14} 
                        y={paddingY} 
                        width={28} 
                        height={graphH} 
                        fill="#0284c7" 
                        fillOpacity="0.08" 
                        rx="4"
                      />
                    )}

                    {/* Date label at bottom */}
                    <text 
                      x={x} 
                      y={chartHeight - paddingY + 16} 
                      fill={point.isTarget ? '#38bdf8' : isSelected ? '#fbbf24' : '#94a3b8'} 
                      fontSize={point.isTarget || isSelected ? '10' : '9'} 
                      fontWeight={point.isTarget || isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {point.dayLabel}
                    </text>

                    {point.isTarget && (
                      <text 
                        x={x} 
                        y={paddingY - 8} 
                        fill="#38bdf8" 
                        fontSize="9" 
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        СЕГОДНЯ
                      </text>
                    )}
                  </g>
                );
              })}

              {/* SINE WAVE PATHS */}
              {/* Physical (Red) */}
              {(activeCycleFilter === 'all' || activeCycleFilter === 'physical') && (
                <path 
                  d={generatePath('physical')} 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                />
              )}

              {/* Emotional (Pink) */}
              {(activeCycleFilter === 'all' || activeCycleFilter === 'emotional') && (
                <path 
                  d={generatePath('emotional')} 
                  fill="none" 
                  stroke="#ec4899" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_6px_rgba(236,72,153,0.6)]"
                />
              )}

              {/* Intellectual (Blue) */}
              {(activeCycleFilter === 'all' || activeCycleFilter === 'intellectual') && (
                <path 
                  d={generatePath('intellectual')} 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]"
                />
              )}

              {/* Intuitive (Purple) */}
              {(activeCycleFilter === 'all' || activeCycleFilter === 'intuitive') && (
                <path 
                  d={generatePath('intuitive')} 
                  fill="none" 
                  stroke="#a855f7" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]"
                />
              )}

              {/* Integral Average (Gold dashed) */}
              {activeCycleFilter === 'all' && (
                <path 
                  d={generatePath('average')} 
                  fill="none" 
                  stroke="#fbbf24" 
                  strokeWidth="1.75" 
                  strokeDasharray="4 3"
                  className="filter drop-shadow-[0_0_4px_rgba(251,191,36,0.5)] opacity-80"
                />
              )}

              {/* Selected Day Interactive Nodes */}
              {selectedDayPoint && (
                <g>
                  {(() => {
                    const idx = timeline.findIndex(d => d.date === selectedDayPoint.date);
                    if (idx === -1) return null;
                    const x = getX(idx);

                    return (
                      <>
                        {/* Vertical Active Line */}
                        <line 
                          x1={x} y1={paddingY} 
                          x2={x} y2={chartHeight - paddingY} 
                          stroke="#fbbf24" 
                          strokeWidth="2" 
                          strokeDasharray="3 3"
                        />

                        {/* Physical Node */}
                        <circle 
                          cx={x} cy={getY(selectedDayPoint.physical)} 
                          r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" 
                        />

                        {/* Emotional Node */}
                        <circle 
                          cx={x} cy={getY(selectedDayPoint.emotional)} 
                          r="5" fill="#ec4899" stroke="#ffffff" strokeWidth="2" 
                        />

                        {/* Intellectual Node */}
                        <circle 
                          cx={x} cy={getY(selectedDayPoint.intellectual)} 
                          r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" 
                        />

                        {/* Intuitive Node */}
                        <circle 
                          cx={x} cy={getY(selectedDayPoint.intuitive)} 
                          r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="2" 
                        />
                      </>
                    );
                  })()}
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Selected Day Interactive Inspector Bar */}
        {selectedDayPoint && (
          <div className="p-3.5 rounded-2xl bg-black/60 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="font-bold text-amber-200">
                {selectedDayPoint.isTarget ? 'Текущий день:' : 'Выбранная дата:'} {selectedDayPoint.dayLabel} ({selectedDayPoint.date})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 font-mono font-bold">
              <span className="text-rose-400">
                🔴 Физ: {selectedDayPoint.physical > 0 ? `+${selectedDayPoint.physical}` : selectedDayPoint.physical}%
              </span>
              <span className="text-pink-400">
                💗 Эмо: {selectedDayPoint.emotional > 0 ? `+${selectedDayPoint.emotional}` : selectedDayPoint.emotional}%
              </span>
              <span className="text-blue-400">
                🔵 Инт: {selectedDayPoint.intellectual > 0 ? `+${selectedDayPoint.intellectual}` : selectedDayPoint.intellectual}%
              </span>
              <span className="text-purple-400">
                🟣 Интуит: {selectedDayPoint.intuitive > 0 ? `+${selectedDayPoint.intuitive}` : selectedDayPoint.intuitive}%
              </span>
              <span className="text-amber-300 border-l border-white/10 pl-2">
                ⭐ Интеграл: {selectedDayPoint.average > 0 ? `+${selectedDayPoint.average}` : selectedDayPoint.average}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4 INDIVIDUAL BIORHYTHM CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cycles.map(({ key, data, icon: Icon, colorClass, strokeColor, bgGlow, badgeBorder, textAccent, periodTitle }) => {
          return (
            <div 
              key={key} 
              className={`rounded-2xl p-5 border ${badgeBorder} bg-gradient-to-br ${bgGlow} space-y-3.5 shadow-lg relative overflow-hidden`}
            >
              {/* Top Row: Icon, Title, Phase Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl bg-black/40 border ${badgeBorder} ${textAccent}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 font-serif">
                      {data.name} биоритм
                    </h4>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Период: {periodTitle}
                    </span>
                  </div>
                </div>

                {/* Phase Tag */}
                <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 ${
                  data.phase === 'peak'
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                    : data.phase === 'critical'
                    ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                    : 'bg-indigo-950/70 border-indigo-500/50 text-indigo-300'
                }`}>
                  {data.trend === 'rising' ? (
                    <TrendingUp size={12} className="text-emerald-400" />
                  ) : (
                    <TrendingDown size={12} className="text-rose-400" />
                  )}
                  <span>
                    {data.phase === 'peak' 
                      ? 'Фаза Подъема' 
                      : data.phase === 'critical' 
                      ? 'Критический день (0%)' 
                      : 'Фаза Спада / Отдыха'}
                  </span>
                </div>
              </div>

              {/* Gauge Meter Bar */}
              <div className="space-y-1.5 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">Значение:</span>
                  <div className="flex items-center gap-1.5 font-bold font-mono">
                    <span className={data.value >= 0 ? textAccent : 'text-slate-400'}>
                      {data.value >= 0 ? `+${data.value}` : data.value}%
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({data.trend === 'rising' ? '▲ нарастает' : '▼ спадает'})
                    </span>
                  </div>
                </div>

                {/* Progress Bar with Zero-mark */}
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden relative border border-white/10">
                  {/* Center zero divider */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white/30 z-10"></div>
                  
                  {/* Filled bar based on percentage (0..100) */}
                  <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ 
                      width: `${data.percentage}%`,
                      backgroundColor: strokeColor 
                    }}
                  ></div>
                </div>
              </div>

              {/* Description & Advice */}
              <div className="space-y-2 text-xs">
                <p className="text-slate-300 font-light leading-relaxed">
                  {data.description}
                </p>

                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-slate-200">
                  <strong className={textAccent}>💡 Рекомендация: </strong>
                  <span className="font-light">{data.advice}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BiorhythmVisual;
