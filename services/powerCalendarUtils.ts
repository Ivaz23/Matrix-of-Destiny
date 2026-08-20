import { PowerCalendarDay, UserInput, MatrixNumbers } from '../types';

const reduceTo22 = (n: number): number => {
  let val = Math.abs(n);
  while (val > 22) {
    const digits = val.toString().split('').map(Number);
    val = digits.reduce((a, b) => a + b, 0);
  }
  return val === 0 ? 22 : val;
};

const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export const generateMonthPowerCalendar = (
  year: number = new Date().getFullYear(),
  monthIndex: number = new Date().getMonth(), // 0-11
  userInput?: UserInput | null,
  matrix?: MatrixNumbers | null
): PowerCalendarDay[] => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  
  let birthSum = 10;
  if (userInput?.birthDate) {
    const parts = userInput.birthDate.split('-').map(Number);
    if (parts.length === 3) {
      birthSum = parts[0] + parts[1] + parts[2];
    }
  }

  const userDestiny = matrix?.destiny || reduceTo22(birthSum);
  const userCenter = matrix?.center || 10;

  const result: PowerCalendarDay[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const dayOfWeek = WEEKDAYS[dateObj.getDay()];
    const isoDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Calculate personal day energy arcana
    const dateSum = reduceTo22(d + (monthIndex + 1) + year);
    const personalDayArcana = reduceTo22(dateSum + userDestiny);

    let energyType: 'wealth' | 'love' | 'spirit' | 'caution' | 'neutral' = 'neutral';
    let badge = '◈ Баланс';
    let energyTitle = 'Гармоничный поток';
    let shortAdvice = 'Подходит для планомерных текущих дел и сохранения ресурса.';
    let isFavorable = true;

    // Classification based on personal day arcana
    if ([3, 4, 10, 15, 19, 21].includes(personalDayArcana)) {
      energyType = 'wealth';
      badge = '💰 Прорыв';
      energyTitle = 'День Финансового Изобилия';
      shortAdvice = 'Идеальное время для запуска продаж, инвестиций, крупных покупок и переговоров.';
    } else if ([6, 12, 14, 17, 20].includes(personalDayArcana)) {
      energyType = 'love';
      badge = '💖 Любовь';
      energyTitle = 'День Сердечного Магнетизма';
      shortAdvice = 'Благоприятно для свиданий, примирения, глубоких разговоров и подарков.';
    } else if ([1, 2, 5, 7, 9].includes(personalDayArcana)) {
      energyType = 'spirit';
      badge = '🟣 Инсайт';
      energyTitle = 'День Мудрости и Открытий';
      shortAdvice = 'Отличное время для обучения, медитаций, чтения сакральных книг и планирования.';
    } else if ([13, 16, 18].includes(personalDayArcana)) {
      energyType = 'caution';
      badge = '⚠️ Трансформация';
      energyTitle = 'День Кармической Проверки';
      shortAdvice = 'Избегайте споров, соблюдайте спокойствие за рулем и держите эмоции под контролем.';
      isFavorable = false;
    }

    result.push({
      date: isoDate,
      dayNumber: d,
      weekday: dayOfWeek,
      energyType,
      dayArcana: personalDayArcana,
      badge,
      energyTitle,
      shortAdvice,
      isFavorable
    });
  }

  return result;
};
