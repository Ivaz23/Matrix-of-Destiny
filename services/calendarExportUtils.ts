import { FavorableDateRecommendation, BestDatesQueryResult } from '../types';

/**
 * Generates a direct Google Calendar Web Intent URL for a favorable date event.
 */
export function generateGoogleCalendarUrl(
  item: FavorableDateRecommendation,
  categoryTitle: string,
  userName?: string
): string {
  // Format date: YYYY-MM-DD
  const [year, month, day] = item.date.split('-');
  const dateFormatted = `${year}${month}${day}`;
  
  // Next day for all-day event
  const nextDateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10) + 1);
  const nextY = nextDateObj.getFullYear();
  const nextM = String(nextDateObj.getMonth() + 1).padStart(2, '0');
  const nextD = String(nextDateObj.getDate()).padStart(2, '0');
  const nextDateFormatted = `${nextY}${nextM}${nextD}`;

  const title = `💎 Благоприятный день: ${categoryTitle} (${item.score}%)`;
  
  const description = [
    `Сакральный элективный расчет Матрицы Судьбы${userName ? ` для ${userName}` : ''}.`,
    ``,
    `✨ Энергия дня: ${item.dayArcana} Аркан`,
    `🌙 Лунные сутки: ${item.lunarDay}-й день (${item.moonSign})`,
    `⭐ Рейтинг успешности: ${item.score}% (${item.rating === 'exceptional' ? 'Исключительно' : 'Благоприятно'})`,
    ``,
    `📌 Резюме: ${item.summary}`,
    `⏳ ${item.goldenHourTip}`,
    ``,
    `✅ Сильные стороны:`,
    ...item.pros.map(p => `  • ${p}`),
    item.cautions.length > 0 ? `⚠️ Предостережения:` : '',
    ...item.cautions.map(c => `  • ${c}`),
    ``,
    `Рассчитано в Chubuk — Матрица Судьбы и Астронумерология.`
  ].filter(Boolean).join('\n');

  const location = `Благоприятное астрологическое окно (${item.goldenHourTip})`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${dateFormatted}/${nextDateFormatted}`,
    details: description,
    location: location
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates an iCalendar (.ics) string for a single date recommendation.
 */
export function generateSingleIcsContent(
  item: FavorableDateRecommendation,
  categoryTitle: string,
  userName?: string
): string {
  const [year, month, day] = item.date.split('-');
  const dateFormatted = `${year}${month}${day}`;
  
  const nextDateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10) + 1);
  const nextY = nextDateObj.getFullYear();
  const nextM = String(nextDateObj.getMonth() + 1).padStart(2, '0');
  const nextD = String(nextDateObj.getDate()).padStart(2, '0');
  const nextDateFormatted = `${nextY}${nextM}${nextD}`;

  const uid = `chubuk-elective-${item.date}-${item.dayArcana}-${Date.now()}@chubuk.app`;
  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const summary = `💎 Благоприятный день: ${categoryTitle} [${item.score}%]`;
  const description = [
    `Элективный расчет Матрицы Судьбы${userName ? ` для ${userName}` : ''}`,
    `Энергия: ${item.dayArcana} Аркан | Луна: ${item.lunarDay} л.д. (${item.moonSign}) | Рейтинг: ${item.score}%`,
    `${item.summary}`,
    `${item.goldenHourTip}`,
    `Плюсы: ${item.pros.join(', ')}`,
    item.cautions.length > 0 ? `Внимание: ${item.cautions.join(', ')}` : ''
  ].filter(Boolean).join('\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chubuk Destiny Matrix//Sacred Elective Dates//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART;VALUE=DATE:${dateFormatted}`,
    `DTEND;VALUE=DATE:${nextDateFormatted}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${item.goldenHourTip}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Generates an iCalendar (.ics) string containing all top favorable dates.
 */
export function generateBulkIcsContent(
  result: BestDatesQueryResult,
  userName?: string
): string {
  const uidPrefix = `chubuk-elective-bulk-${Date.now()}`;
  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const events = result.topDates.map((item, idx) => {
    const [year, month, day] = item.date.split('-');
    const dateFormatted = `${year}${month}${day}`;
    
    const nextDateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10) + 1);
    const nextY = nextDateObj.getFullYear();
    const nextM = String(nextDateObj.getMonth() + 1).padStart(2, '0');
    const nextD = String(nextDateObj.getDate()).padStart(2, '0');
    const nextDateFormatted = `${nextY}${nextM}${nextD}`;

    const summary = `💎 ТОП-Дата: ${result.goalTitle} (#${idx + 1}, ${item.score}%)`;
    const description = [
      `Сакральный элективный расчет: ${result.goalTitle}${userName ? ` (${userName})` : ''}`,
      `Энергия дня: ${item.dayArcana} Аркан | Лунные сутки: ${item.lunarDay} (${item.moonSign})`,
      `Рейтинг: ${item.score}% | ${item.goldenHourTip}`,
      `${item.summary}`,
      `Плюсы: ${item.pros.join(', ')}`,
      item.cautions.length > 0 ? `Совет: ${item.cautions.join(', ')}` : ''
    ].filter(Boolean).join('\\n');

    return [
      'BEGIN:VEVENT',
      `UID:${uidPrefix}-${idx}-${item.date}@chubuk.app`,
      `DTSTAMP:${nowUtc}`,
      `DTSTART;VALUE=DATE:${dateFormatted}`,
      `DTEND;VALUE=DATE:${nextDateFormatted}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${item.goldenHourTip}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chubuk Destiny Matrix//Sacred Elective Dates//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Благоприятные Даты — ${result.goalTitle}`,
    `X-WR-CALDESC:Лучшие даты для ${result.goalTitle} по расчетам Матрицы Судьбы`,
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Triggers download of an .ics file in the browser.
 */
export function downloadIcsFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
