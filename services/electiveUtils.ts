import { FavorableDateRecommendation, BestDatesQueryResult, UserInput } from '../types';
import { calculateMatrixArcana, calculateLifePathNumber } from './numerologyUtils';
import { calculateLunarData } from './lunarUtils';

export function findBestFavorableDates(
  category: BestDatesQueryResult['goalCategory'],
  userInput?: UserInput | null,
  daysRange: number = 45
): BestDatesQueryResult {
  const titles: Record<BestDatesQueryResult['goalCategory'], string> = {
    wedding: "Свадьба, помолвка и создание союза",
    business: "Открытие бизнеса, крупные контракты и инвестиции",
    property: "Покупка недвижимости, авто и ценных активов",
    travel: "Дальние путешествия, переезд и командировки",
    health_beauty: "Оздоровительные процедуры, операции и детокс",
    spiritual: "Духовные практики, инициации и запуск медитаций"
  };

  const strategies: Record<BestDatesQueryResult['goalCategory'], string> = {
    wedding: "Идеально подходят дни под эгидой 3 (Императрица), 6 (Влюбленные), 10 (Колесо Фортуны), 19 (Солнце) и 21 (Мир) арканов на растущей Луне или в знаках Тельца, Рака и Весов.",
    business: "Максимальный успех приносят 1 (Маг), 4 (Император), 7 (Колесница), 8 (Справедливость) и 10 (Колесо Фортуны) арканы во 2-й четверти Луны в земных и огненных знаках.",
    property: "Выбирайте стабильные дни 4 (Император), 14 (Умеренность) и 8 (Справедливость) арканов, избегая периодов 'Луны без курса' и 9, 15, 29 лунных суток.",
    travel: "Самые благоприятные даты — под влиянием 7 (Колесница), 17 (Звезда) и 21 (Мир) арканов в воздушных и огненных знаках Луны.",
    health_beauty: "Для очищения и операций благоприятна убывающая Луна (кроме критических лунных дней); для укрепления и омоложения — 2–11 лунные сутки.",
    spiritual: "Периоды 2 (Жрица), 5 (Иерофант), 9 (Отшельник) и 20 (Страшный Суд) арканов в дни Полнолуния и Новолуния для глубинных инсайтов."
  };

  const userLifePath = userInput?.birthDate ? calculateLifePathNumber(userInput.birthDate) : 7;
  const today = new Date();
  const candidates: FavorableDateRecommendation[] = [];

  for (let i = 1; i <= daysRange; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const formattedDate = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' });

    // Calculate Day Matrix Arcana (1-22)
    const dayArcana = calculateMatrixArcana(day + month + year);
    const lunar = calculateLunarData(d);

    // Scoring algorithm based on Goal + Day Arcana + Lunar Phase + User Life Path
    let score = 50; // base score

    // Arcana matching
    if (category === 'wedding') {
      if ([3, 6, 10, 19, 21].includes(dayArcana)) score += 28;
      if ([1, 14, 17].includes(dayArcana)) score += 15;
      if ([13, 15, 16].includes(dayArcana)) score -= 35;
      if (['waxing_crescent', 'first_quarter', 'waxing_gibbous'].includes(lunar.moonPhase)) score += 15;
      if ([9, 15, 23, 29].includes(lunar.lunarDay)) score -= 25;
    } else if (category === 'business') {
      if ([1, 4, 7, 8, 10, 19].includes(dayArcana)) score += 28;
      if ([3, 5, 21].includes(dayArcana)) score += 15;
      if ([12, 16, 18].includes(dayArcana)) score -= 30;
      if (['first_quarter', 'waxing_gibbous', 'full_moon'].includes(lunar.moonPhase)) score += 15;
      if (lunar.isVoidOfCourse) score -= 30;
    } else if (category === 'property') {
      if ([4, 8, 10, 14, 21].includes(dayArcana)) score += 28;
      if ([1, 3, 5].includes(dayArcana)) score += 14;
      if ([15, 16, 18].includes(dayArcana)) score -= 30;
      if (!lunar.isVoidOfCourse) score += 10;
    } else if (category === 'travel') {
      if ([7, 10, 17, 21, 22].includes(dayArcana)) score += 30;
      if ([1, 6, 19].includes(dayArcana)) score += 15;
      if ([12, 16].includes(dayArcana)) score -= 30;
    } else if (category === 'health_beauty') {
      if ([14, 17, 19, 21].includes(dayArcana)) score += 25;
      if ([3, 6].includes(dayArcana)) score += 15;
      if ([13, 15, 16].includes(dayArcana)) score -= 25;
      if (['waning_gibbous', 'last_quarter'].includes(lunar.moonPhase)) score += 15; // good for detox
    } else {
      if ([2, 5, 9, 20, 21].includes(dayArcana)) score += 30;
      if ([11, 17, 19].includes(dayArcana)) score += 15;
    }

    // User Life Path resonance bonus
    if (dayArcana === userLifePath || (dayArcana + userLifePath) % 22 === 0) {
      score += 10;
    }

    // Cap score 10..100
    score = Math.min(100, Math.max(10, score));

    let rating: FavorableDateRecommendation['rating'] = 'neutral';
    if (score >= 82) rating = 'exceptional';
    else if (score >= 68) rating = 'favorable';
    else if (score >= 45) rating = 'neutral';
    else rating = 'unfavorable';

    let summary = `День под покровительством ${dayArcana}-го Аркана в ${lunar.lunarDay}-е лунные сутки (${lunar.zodiacSign}).`;
    let pros: string[] = [];
    let cautions: string[] = [];

    if (rating === 'exceptional') {
      pros.push(`Сильный резонанс с энергией ${dayArcana} аркана.`);
      pros.push(`Благоприятная лунная стоянка в знаке ${lunar.zodiacSign}.`);
      cautions.push("Фиксируйте договоренности письменно.");
    } else if (rating === 'favorable') {
      pros.push("Позитивный общий фон для поступательного движения.");
      cautions.push("Избегайте излишней спешки в утренние часы.");
    } else {
      cautions.push("Возможны скрытые препятствия или эмоциональные задержки.");
    }

    candidates.push({
      date: dateStr,
      formattedDate,
      score,
      rating,
      dayArcana,
      lunarDay: lunar.lunarDay,
      moonSign: lunar.zodiacSign,
      summary,
      pros,
      cautions,
      goldenHourTip: `Благоприятные часы активности: 10:00 - 13:30 и 16:00 - 19:00.`
    });
  }

  // Sort candidate dates by score descending and take top 7
  const topDates = candidates.sort((a, b) => b.score - a.score).slice(0, 8);

  return {
    goalCategory: category,
    goalTitle: titles[category],
    timeframe: `Ближайшие ${daysRange} дней`,
    topDates,
    generalStrategy: strategies[category]
  };
}
