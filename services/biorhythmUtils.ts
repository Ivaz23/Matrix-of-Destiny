import { BiorhythmReport, BiorhythmValue, BiorhythmDayPoint } from '../types';

/**
 * Calculates the exact number of days between birthDate (YYYY-MM-DD) and targetDate (YYYY-MM-DD)
 */
export function getDaysBetweenDates(birthDateStr: string, targetDateStr: string): number {
  if (!birthDateStr || !targetDateStr) return 0;
  
  const [bYear, bMonth, bDay] = birthDateStr.split('-').map(Number);
  const [tYear, tMonth, tDay] = targetDateStr.split('-').map(Number);

  const birthUtc = Date.UTC(bYear, bMonth - 1, bDay);
  const targetUtc = Date.UTC(tYear, tMonth - 1, tDay);

  const diffMs = targetUtc - birthUtc;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates single biorhythm value at day offset `t`
 */
function calculateCycleValue(days: number, period: number): number {
  const radians = (2 * Math.PI * days) / period;
  return Math.round(Math.sin(radians) * 100);
}

/**
 * Calculates cycle derivative to know if it's rising or falling
 */
function calculateCycleTrend(days: number, period: number): 'rising' | 'falling' {
  const radians = (2 * Math.PI * days) / period;
  return Math.cos(radians) >= 0 ? 'rising' : 'falling';
}

/**
 * Categorizes cycle phase
 */
function getCyclePhase(value: number, days: number, period: number): 'peak' | 'critical' | 'low' {
  // Critical day check: near zero crossing (|value| <= 15)
  if (Math.abs(value) <= 15) {
    return 'critical';
  }
  if (value > 15) {
    return 'peak';
  }
  return 'low';
}

/**
 * Formats a Date object to short Russian day string (e.g. "19 авг")
 */
function formatShortDate(d: Date): string {
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/**
 * Full Biorhythm calculation engine
 */
export function calculateBiorhythms(birthDateStr: string, targetDateStr: string): BiorhythmReport {
  const daysLived = getDaysBetweenDates(birthDateStr, targetDateStr);

  const physVal = calculateCycleValue(daysLived, 23);
  const emoVal = calculateCycleValue(daysLived, 28);
  const intVal = calculateCycleValue(daysLived, 33);
  const intuVal = calculateCycleValue(daysLived, 38);

  const physTrend = calculateCycleTrend(daysLived, 23);
  const emoTrend = calculateCycleTrend(daysLived, 28);
  const intTrend = calculateCycleTrend(daysLived, 33);
  const intuTrend = calculateCycleTrend(daysLived, 38);

  const physPhase = getCyclePhase(physVal, daysLived, 23);
  const emoPhase = getCyclePhase(emoVal, daysLived, 28);
  const intPhase = getCyclePhase(intVal, daysLived, 33);
  const intuPhase = getCyclePhase(intuVal, daysLived, 38);

  const physical: BiorhythmValue = {
    name: 'Физический',
    period: 23,
    value: physVal,
    percentage: Math.round((physVal + 100) / 2),
    phase: physPhase,
    trend: physTrend,
    color: '#ef4444', // Rose / Red
    description: physPhase === 'peak' 
      ? 'Пик выносливости, мышечного тонуса, регенерации и координации.' 
      : physPhase === 'critical'
      ? 'Критический день: смена фазы, внимание к суставам и избегание перегрузок.'
      : 'Фаза восстановления: замедленный метаболизм, телу нужен щадящий режим.',
    advice: physPhase === 'peak'
      ? 'Идеально для интенсивных тренировок, физического труда, дальних поездок и спортивных побед.'
      : physPhase === 'critical'
      ? 'Снизьте темп, аккуратнее за рулем и с тяжестями, откажитесь от рискованного экстрима.'
      : 'Пейте больше теплой воды, выспитесь, сделайте легкую растяжку или массаж.'
  };

  const emotional: BiorhythmValue = {
    name: 'Эмоциональный',
    period: 28,
    value: emoVal,
    percentage: Math.round((emoVal + 100) / 2),
    phase: emoPhase,
    trend: emoTrend,
    color: '#ec4899', // Pink / Rose
    description: emoPhase === 'peak'
      ? 'Эмоциональный подъем, харизма, легкость в общении, эмпатия и оптимизм.'
      : emoPhase === 'critical'
      ? 'Критический день: повышенная чувствительность, риск обид и импульсивных реакций.'
      : 'Эмоциональная разгрузка: потребность в уединении, спокойствии и душевной тишине.',
    advice: emoPhase === 'peak'
      ? 'Отличное время для свиданий, публичных выступлений, примирения и праздников.'
      : emoPhase === 'critical'
      ? 'Не принимайте решений на эмоциях, избегайте токсичных споров, дышите глубже.'
      : 'Проведите вечер за книгой или спокойной музыкой, не перегружайте себя драмой.'
  };

  const intellectual: BiorhythmValue = {
    name: 'Интеллектуальный',
    period: 33,
    value: intVal,
    percentage: Math.round((intVal + 100) / 2),
    phase: intPhase,
    trend: intTrend,
    color: '#3b82f6', // Blue / Cyan
    description: intPhase === 'peak'
      ? 'Ясность ума, быстрая память, аналитическое чутье и легкое усвоение информации.'
      : intPhase === 'critical'
      ? 'Критический день: рассеянность, риск упустить важные детали в договорах.'
      : 'Интеллектуальная пауза: лучше заниматься рутинными привычными задачами.',
    advice: intPhase === 'peak'
      ? 'Планируйте экзамены, сложные расчеты, подписание контрактов и стратегию.'
      : intPhase === 'critical'
      ? 'Перепроверяйте документы дважды, записывайте мысли в блокнот, не спешите.'
      : 'Сделайте упор на отработанную рутину, избегая тяжелых многочасовых мозговых штурмов.'
  };

  const intuitive: BiorhythmValue = {
    name: 'Интуитивный',
    period: 38,
    value: intuVal,
    percentage: Math.round((intuVal + 100) / 2),
    phase: intuPhase,
    trend: intuTrend,
    color: '#a855f7', // Purple / Violet
    description: intuPhase === 'peak'
      ? 'Тонкое восприятие знаков, пророческие сны, творческий прорыв и сильное шестое чувство.'
      : intuPhase === 'critical'
      ? 'Критический день: неразбериха между внутренним голосом и иллюзиями.'
      : 'Творческое затишье: накопление образов и созерцательное состояние.',
    advice: intuPhase === 'peak'
      ? 'Слушайте первое предчувствие, занимайтесь сакральными практиками и искусством.'
      : intuPhase === 'critical'
      ? 'Опирайтесь на факты и логику, не доверяйте слепо мимолетным подозрениям.'
      : 'Медитируйте, гуляйте на природе, наполняйте подсознание красивыми образами.'
  };

  const averageScore = Math.round((physVal + emoVal + intVal + intuVal) / 4);

  let overallState: 'optimal' | 'productive' | 'unstable_critical' | 'recharge' = 'productive';
  const criticalCount = [physPhase, emoPhase, intPhase, intuPhase].filter(p => p === 'critical').length;

  if (criticalCount >= 2) {
    overallState = 'unstable_critical';
  } else if (averageScore >= 40) {
    overallState = 'optimal';
  } else if (averageScore <= -30) {
    overallState = 'recharge';
  } else {
    overallState = 'productive';
  }

  // Generate 15-day timeline (-3 days to +11 days)
  const timeline: BiorhythmDayPoint[] = [];
  const [tYear, tMonth, tDay] = targetDateStr.split('-').map(Number);
  const targetDateObj = new Date(tYear, tMonth - 1, tDay);

  for (let offset = -3; offset <= 11; offset++) {
    const curDate = new Date(targetDateObj);
    curDate.setDate(targetDateObj.getDate() + offset);
    
    const curDateStr = `${curDate.getFullYear()}-${String(curDate.getMonth() + 1).padStart(2, '0')}-${String(curDate.getDate()).padStart(2, '0')}`;
    const curDays = daysLived + offset;

    const p = calculateCycleValue(curDays, 23);
    const e = calculateCycleValue(curDays, 28);
    const i = calculateCycleValue(curDays, 33);
    const in_ = calculateCycleValue(curDays, 38);
    const avg = Math.round((p + e + i + in_) / 4);

    timeline.push({
      date: curDateStr,
      dayLabel: formatShortDate(curDate),
      isTarget: offset === 0,
      physical: p,
      emotional: e,
      intellectual: i,
      intuitive: in_,
      average: avg
    });
  }

  let summaryText = '';
  if (overallState === 'optimal') {
    summaryText = `Биоритмический резонанс дня на высоте (+${averageScore}%). Все основные циклы находятся в фазе подъема, обеспечивая высокий запас сил, ясность ума и эмоциональную устойчивость.`;
  } else if (overallState === 'unstable_critical') {
    summaryText = `Внимание: день критических точек биоритмов (${criticalCount} цикла пересекают нулевую отметку). Возможны резкие перепады тонуса и концентрации, рекомендуется действовать без спешки.`;
  } else if (overallState === 'recharge') {
    summaryText = `Интегральный биоритм находится в фазе глубокой регенерации (${averageScore}%). Организм восстанавливает энергетические резервы. Благоприятен щадящий режим.`;
  } else {
    summaryText = `Сбалансированное распределение биоритмических сил (${averageScore >= 0 ? '+' : ''}${averageScore}%). Сильные стороны дня поддерживают текущие задачи.`;
  }

  return {
    daysLived,
    physical,
    emotional,
    intellectual,
    intuitive,
    averageScore,
    overallState,
    timeline,
    summaryText
  };
}
