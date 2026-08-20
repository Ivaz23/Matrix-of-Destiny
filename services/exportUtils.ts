import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { 
  SavedCalculation, 
  AnalysisResult, 
  AstrologyData, 
  AstrologyResult,
  MatrixNumbers, 
  UserInput, 
  DailyMysticalForecast,
  CompatibilityResult,
  TarotReading,
  HoraryResult,
  IdealAndToxicPartnersProfile,
  AncestralTreeAnalysis,
  LithotherapyProfile,
  LunarDayInfo,
  BestDatesQueryResult,
  CityPowerProfile,
  DreamAnalysisResult,
  AkashicKarmaProfile,
  ChakraPsychosomaticProfile,
  PowerCalendarDay
} from '../types';
import { getSpeech, generateFullAudioAnalysisText, generateDailyMysticalForecast } from './geminiService';
import { getAstrologyData } from './astrologyUtils';
import { calculateLifePathNumber, calculateMatrix } from './numerologyUtils';
import { calculateBiorhythms } from './biorhythmUtils';
import { calculateAncestralLineage } from './ancestralUtils';
import { calculateLithotherapyProfile } from './lithotherapyUtils';
import { calculateLunarData } from './lunarUtils';
import { findBestFavorableDates } from './electiveUtils';
import { calculateCityPowerProfile } from './cityPowerUtils';

export const downloadFullAudioAnalysis = async (
  type: 'individual' | 'compatibility',
  data: any,
  filename: string
) => {
  try {
    const fullText = await generateFullAudioAnalysisText(type, data);
    await downloadAudioForCalculation(fullText, filename);
  } catch (e) {
    console.error("Full audio download error:", e);
  }
};

const arcanaNames: { [key: number]: string } = {
  1: 'Маг', 2: 'Жрица', 3: 'Императрица', 4: 'Император', 5: 'Иерофант / Жрец',
  6: 'Влюбленные', 7: 'Колесница', 8: 'Справедливость', 9: 'Отшельник', 10: 'Колесо Фортуны',
  11: 'Сила', 12: 'Повешенный', 13: 'Трансформация / Смерть', 14: 'Умеренность',
  15: 'Дьявол / Искушение', 16: 'Башня', 17: 'Звезда', 18: 'Луна', 19: 'Солнце',
  20: 'Суд / Пробуждение', 21: 'Мир', 22: 'Высшая Свобода'
};

export const exportStylizedMatrixPdf = async ({
  userInput,
  matrix,
  astrology,
  analysis,
  dailyForecast,
  chatHistory,
  horaryResult,
  filename = 'chubuk_sacred_manuscript'
}: {
  userInput: UserInput;
  matrix: MatrixNumbers;
  astrology?: AstrologyData | null;
  analysis: AnalysisResult;
  dailyForecast?: DailyMysticalForecast | null;
  chatHistory?: { role: 'user' | 'model'; text: string }[] | null;
  horaryResult?: HoraryResult | null;
  filename?: string;
}) => {
  // If dailyForecast is not provided, try to fetch from localStorage or generate
  let effectiveForecast = dailyForecast;
  if (!effectiveForecast && userInput?.birthDate) {
    const todayStr = new Date().toISOString().split('T')[0];
    const cached = localStorage.getItem(`daily_forecast_v3:${userInput.birthDate}:${todayStr}`) ||
                   localStorage.getItem(`daily_forecast:${userInput.birthDate}:${todayStr}`);
    if (cached) {
      try {
        effectiveForecast = JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    if (!effectiveForecast) {
      try {
        effectiveForecast = await generateDailyMysticalForecast(userInput.birthDate, userInput.name, todayStr);
      } catch (err) {
        console.warn("Could not generate inline forecast for PDF:", err);
      }
    }
  }

  // If horaryResult is not provided, try to fetch participant-specific or latest horary
  let effectiveHorary = horaryResult;
  if (!effectiveHorary && userInput?.name && userInput?.birthDate) {
    try {
      const pKey = `chubuk_horary_${encodeURIComponent(userInput.name)}_${userInput.birthDate}`;
      const savedHorary = localStorage.getItem(pKey);
      if (savedHorary) {
        effectiveHorary = JSON.parse(savedHorary);
      }
    } catch {
      // ignore
    }
  }

  // If chatHistory is not provided, try to fetch participant-specific chat
  let effectiveChat = chatHistory;
  if ((!effectiveChat || effectiveChat.length === 0) && userInput?.name && userInput?.birthDate) {
    try {
      const pKey = `chubuk_chat_${encodeURIComponent(userInput.name)}_${userInput.birthDate}`;
      const savedChat = localStorage.getItem(pKey);
      if (savedChat) {
        effectiveChat = JSON.parse(savedChat);
      }
    } catch {
      // ignore
    }
  }

  const effectiveAstrology = astrology || (userInput?.birthDate ? getAstrologyData(userInput.birthDate) : null);
  const lifePath = userInput?.birthDate ? calculateLifePathNumber(userInput.birthDate) : null;
  const effectiveAncestral = calculateAncestralLineage(userInput?.birthDate || '', matrix);
  const effectiveLithotherapy = calculateLithotherapyProfile(matrix, effectiveAstrology);
  const effectiveLunar = calculateLunarData(new Date());
  const effectiveElective = findBestFavorableDates('business', userInput, 30);
  const cityDubai = calculateCityPowerProfile('Дубай', matrix, effectiveAstrology);
  const cityBali = calculateCityPowerProfile('Бали', matrix, effectiveAstrology);
  const effectiveBiorhythms = userInput?.birthDate ? calculateBiorhythms(userInput.birthDate, new Date().toISOString().split('T')[0]) : null;

  const container = document.createElement('div');
  container.id = 'pdf-stylized-render-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '820px';
  container.style.backgroundColor = '#050710';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #b48811; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #0e1224 0%, #05070e 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
      
      <!-- Gold Corner Ornaments -->
      <div style="position: absolute; top: 14px; left: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; top: 14px; right: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; bottom: 14px; left: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; bottom: 14px; right: 16px; color: #ffd700; font-size: 18px;">✦</div>

      <!-- Header -->
      <div style="text-align: center; border-bottom: 1px solid rgba(255, 215, 0, 0.25); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #ffd700, #b48811); color: #000; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(255,215,0,0.45);">C</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 30px; color: #ffd700; letter-spacing: 4px; margin: 0; text-transform: uppercase;">CHUBUK MATRIX SYSTEM</h1>
        <p style="font-size: 13px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">Сакральный PDF Манускрипт • Матрица Судьбы и Ежедневный Прогноз</p>
      </div>

      <!-- User Profile Box -->
      <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 16px; padding: 20px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1.5px; display: block; font-weight: bold;">Имя странника</span>
          <span style="font-size: 20px; color: #ffffff; font-weight: 700;">${userInput.name || 'Странник'}</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1.5px; display: block; font-weight: bold;">Дата рождения</span>
          <span style="font-size: 20px; color: #ffffff; font-weight: 700;">${userInput.birthDate || 'Не указана'}</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1.5px; display: block; font-weight: bold;">Зодиак и ЧЖП</span>
          <span style="font-size: 14px; color: #e2e8f0; font-weight: 600;">
            ${effectiveAstrology ? `${effectiveAstrology.zodiacSign} (${effectiveAstrology.element})` : '—'} • ЧЖП ${lifePath || '—'}
          </span>
        </div>
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1.5px; display: block; font-weight: bold;">Дата составления Манускрипта</span>
          <span style="font-size: 14px; color: #e2e8f0;">${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <!-- Matrix Grid Key Values -->
      <div style="margin-bottom: 26px;">
        <h3 style="font-family: 'Cinzel', serif; font-size: 16px; color: #ffd700; margin-bottom: 14px; letter-spacing: 1.5px; display: flex; align-items: center; gap: 8px;">
          <span>◈</span> САКРАЛЬНЫЕ КЛЮЧИ ЭНЕРГИЙ МАТРИЦЫ
        </h3>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
          <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 12px; padding: 12px 8px; text-align: center;">
            <div style="font-size: 9px; color: #ffd700; text-transform: uppercase; font-weight: bold;">Личность (День)</div>
            <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 4px 0;">${matrix.day}</div>
            <div style="font-size: 10px; color: #cbd5e1;">${arcanaNames[matrix.day] || 'Аркан'}</div>
          </div>
          <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 12px; padding: 12px 8px; text-align: center;">
            <div style="font-size: 9px; color: #ffd700; text-transform: uppercase; font-weight: bold;">Таланты (Месяц)</div>
            <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 4px 0;">${matrix.month}</div>
            <div style="font-size: 10px; color: #cbd5e1;">${arcanaNames[matrix.month] || 'Аркан'}</div>
          </div>
          <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 12px; padding: 12px 8px; text-align: center;">
            <div style="font-size: 9px; color: #ffd700; text-transform: uppercase; font-weight: bold;">Материя (Год)</div>
            <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 4px 0;">${matrix.year}</div>
            <div style="font-size: 10px; color: #cbd5e1;">${arcanaNames[matrix.year] || 'Аркан'}</div>
          </div>
          <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 12px; padding: 12px 8px; text-align: center;">
            <div style="font-size: 9px; color: #ffd700; text-transform: uppercase; font-weight: bold;">Карма (Низ)</div>
            <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 4px 0;">${matrix.bottom}</div>
            <div style="font-size: 10px; color: #cbd5e1;">${arcanaNames[matrix.bottom] || 'Аркан'}</div>
          </div>
          <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 12px; padding: 12px 8px; text-align: center;">
            <div style="font-size: 9px; color: #ffd700; text-transform: uppercase; font-weight: bold;">Душа (Центр)</div>
            <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 4px 0;">${matrix.center}</div>
            <div style="font-size: 10px; color: #cbd5e1;">${arcanaNames[matrix.center] || 'Аркан'}</div>
          </div>
          <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 12px; padding: 12px 8px; text-align: center;">
            <div style="font-size: 9px; color: #ffd700; text-transform: uppercase; font-weight: bold;">Небо (Дух)</div>
            <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 4px 0;">${matrix.sky}</div>
            <div style="font-size: 10px; color: #cbd5e1;">${arcanaNames[matrix.sky] || 'Аркан'}</div>
          </div>
          <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 12px; padding: 12px 8px; text-align: center;">
            <div style="font-size: 9px; color: #ffd700; text-transform: uppercase; font-weight: bold;">Земля (Тело)</div>
            <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 4px 0;">${matrix.earth}</div>
            <div style="font-size: 10px; color: #cbd5e1;">${arcanaNames[matrix.earth] || 'Аркан'}</div>
          </div>
          <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 12px; padding: 12px 8px; text-align: center;">
            <div style="font-size: 9px; color: #ffd700; text-transform: uppercase; font-weight: bold;">Предназначение</div>
            <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 4px 0;">${matrix.destiny}</div>
            <div style="font-size: 10px; color: #cbd5e1;">${arcanaNames[matrix.destiny] || 'Аркан'}</div>
          </div>
        </div>
      </div>

      <!-- Introduction -->
      <div style="margin-bottom: 24px; background: rgba(0, 0, 0, 0.5); border-left: 4px solid #ffd700; padding: 18px; border-radius: 0 14px 14px 0;">
        <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: #ffd700; margin-bottom: 10px; letter-spacing: 1px;">◈ ВВЕДЕНИЕ В ЭНЕРГЕТИЧЕСКИЙ ПОРТРЕТ</h3>
        <p style="font-size: 13px; line-height: 1.75; color: #e2e8f0; font-style: italic; margin: 0;">${analysis.introduction}</p>
      </div>

      <!-- Analysis Sections -->
      <div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 24px;">
        ${analysis.sections.map((sec) => `
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.15); border-radius: 14px; padding: 18px;">
            <div style="font-family: 'Cinzel', serif; font-size: 15px; font-weight: 700; color: #ffd700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; background: #ffd700; border-radius: 50%;"></span>
              ${sec.title}
            </div>
            <p style="font-size: 13px; line-height: 1.75; color: #cbd5e1; margin: 0; white-space: pre-wrap;">${sec.content}</p>
          </div>
        `).join('')}
      </div>

      <!-- Forecast / Final Wisdom -->
      ${analysis.forecast ? `
        <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(0, 0, 0, 0.6) 100%); border: 1px solid rgba(255, 215, 0, 0.35); border-radius: 14px; padding: 18px; margin-bottom: 28px;">
          <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: #ffd700; margin-bottom: 10px; letter-spacing: 1px;">◈ НАПУТСТВИЕ И СУДЬБОНОСНЫЙ ПРОГНОЗ</h3>
          <p style="font-size: 13px; line-height: 1.75; color: #ffffff; margin: 0;">${analysis.forecast}</p>
        </div>
      ` : ''}

      <!-- ASTROLOGICAL ANALYSIS & NATAL COSMOGRAM SECTION -->
      ${effectiveAstrology ? `
        <div style="margin-top: 32px; border-top: 2px dashed rgba(255, 215, 0, 0.35); padding-top: 28px; margin-bottom: 24px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; padding: 4px 14px; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 20px; font-size: 11px; color: #c084fc; text-transform: uppercase; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px;">
              НЕБЕСНАЯ КОСМОГРАММА И ПЛАНЕТЫ
            </span>
            <h2 style="font-family: 'Cinzel', serif; font-size: 22px; color: #ffd700; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
              Астрологический Анализ и Натальная Карта
            </h2>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
              Знак Зодиака: ${effectiveAstrology.zodiacSign} • Стихия: ${effectiveAstrology.element} • Планета-покровитель: ${effectiveAstrology.planet} • ${effectiveAstrology.house}-й Астрологический Дом
            </p>
          </div>

          <!-- 3-Column Astrology Highlights Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 14px; text-align: center;">
              <span style="font-size: 10px; color: #c084fc; text-transform: uppercase; font-weight: bold; display: block;">🪐 Правящая Планета</span>
              <strong style="font-size: 16px; color: #ffffff; display: block; margin: 4px 0;">${effectiveAstrology.planet}</strong>
              <span style="font-size: 11px; color: #94a3b8;">Энергия ${effectiveAstrology.element === 'Огонь' ? 'активности и лидерства' : effectiveAstrology.element === 'Земля' ? 'материализации и опоры' : effectiveAstrology.element === 'Воздух' ? 'интеллекта и идей' : 'чувств и интуиции'}</span>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 12px; padding: 14px; text-align: center;">
              <span style="font-size: 10px; color: #ffd700; text-transform: uppercase; font-weight: bold; display: block;">🔥 Стихия Души</span>
              <strong style="font-size: 16px; color: #ffffff; display: block; margin: 4px 0;">${effectiveAstrology.element}</strong>
              <span style="font-size: 11px; color: #94a3b8;">Основной вектор проявления в мире</span>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 14px; text-align: center;">
              <span style="font-size: 10px; color: #60a5fa; text-transform: uppercase; font-weight: bold; display: block;">🏛 Натал и Дом</span>
              <strong style="font-size: 16px; color: #ffffff; display: block; margin: 4px 0;">Дом ${effectiveAstrology.house}</strong>
              <span style="font-size: 11px; color: #94a3b8;">Зона максимального развития души</span>
            </div>
          </div>

          <!-- Core Character & Cosmic Traits -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 14px; padding: 16px; margin-bottom: 16px;">
            <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #ffd700; margin-bottom: 8px;">
              ⭐ КЛЮЧЕВЫЕ ЧЕРТЫ И КОСМИЧЕСКИЕ ДАРЫ ЗНАКА (${effectiveAstrology.zodiacSign})
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
              ${(effectiveAstrology.traits || []).map((t: string) => `
                <span style="display: inline-block; background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 8px; padding: 4px 10px; font-size: 11px; color: #fde047; font-weight: 600;">
                  ✦ ${t}
                </span>
              `).join('')}
            </div>
            <p style="font-size: 12px; line-height: 1.65; color: #cbd5e1; margin: 0;">
              Взаимодействие энергий ${effectiveAstrology.zodiacSign} с арканом рождения (${matrix.day}) формирует уникальный вибрационный код, объединяющий волю планет с сакральной геометрией матрицы.
            </p>
          </div>
        </div>
      ` : ''}

      <!-- ANCESTRAL LINEAGE SECTION (РОДОВЫЕ ПРОГРАММЫ) -->
      ${effectiveAncestral ? `
        <div style="margin-top: 32px; border-top: 2px dashed rgba(255, 215, 0, 0.35); padding-top: 28px; margin-bottom: 24px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; padding: 4px 14px; background: rgba(147, 51, 234, 0.15); border: 1px solid rgba(147, 51, 234, 0.4); border-radius: 20px; font-size: 11px; color: #c084fc; text-transform: uppercase; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px;">
              СИЛА 7 ПОКОЛЕНИЙ И КАРМА ПРЕДКОВ
            </span>
            <h2 style="font-family: 'Cinzel', serif; font-size: 22px; color: #ffd700; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
              Родовые Программы и 4 Линии Рода
            </h2>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
              Доминирующий архетип: ${effectiveAncestral.dominantAncestralArchetype} • Родовая карма: ${effectiveAncestral.overallKarmaScore}%
            </p>
          </div>

          <!-- 4 Lines Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            ${effectiveAncestral.lines.map(l => `
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(147, 51, 234, 0.3); border-radius: 12px; padding: 14px;">
                <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #c084fc; margin-bottom: 4px;">
                  👑 ${l.title} (#${l.keyArcana})
                </div>
                <p style="font-size: 11px; color: #e2e8f0; margin: 0 0 6px 0;"><strong>Дар:</strong> ${l.generationalGift}</p>
                <p style="font-size: 11px; color: #fca5a5; margin: 0;"><strong>Узел:</strong> ${l.karmicLesson}</p>
              </div>
            `).join('')}
          </div>

          <!-- Ancestral Healing Prayer / Affirmation -->
          <div style="background: linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(16, 20, 38, 0.9) 100%); border: 2px solid rgba(147, 51, 234, 0.45); border-radius: 16px; padding: 16px; text-align: center;">
            <span style="font-size: 10px; color: #c084fc; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 6px;">
              ✦ ИСЦЕЛЯЮЩИЙ КЛЮЧ РОДА ✦
            </span>
            <p style="font-family: 'Cinzel', serif; font-size: 13.5px; font-style: italic; color: #ffffff; margin: 0; line-height: 1.6;">
              "${effectiveAncestral.lineageBlessing}"
            </p>
          </div>
        </div>
      ` : ''}

      <!-- LITHOTHERAPY & TALISMANS SECTION (САКРАЛЬНЫЕ КАМНИ) -->
      ${effectiveLithotherapy ? `
        <div style="margin-top: 32px; border-top: 2px dashed rgba(255, 215, 0, 0.35); padding-top: 28px; margin-bottom: 24px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; padding: 4px 14px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 20px; font-size: 11px; color: #60a5fa; text-transform: uppercase; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px;">
              ЭНЕРГИЯ КРИСТАЛЛОВ И ЗЕМЛИ
            </span>
            <h2 style="font-family: 'Cinzel', serif; font-size: 22px; color: #ffd700; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
              Литотерапия и Сакральные Талисманы
            </h2>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
              Индивидуальный подбор минералов по Матрице и Знаку Зодиака
            </p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.25); border-radius: 12px; padding: 14px;">
              <span style="font-size: 10px; color: #ffd700; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: block;">💎 Главный Камень Души:</span>
              <strong style="font-size: 14px; color: #ffffff; display: block; margin: 3px 0;">${effectiveLithotherapy.primaryStones[0]?.name || 'Аметист'}</strong>
              <p style="font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.5;">${effectiveLithotherapy.primaryStones[0]?.properties || ''}</p>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(34, 197, 94, 0.25); border-radius: 12px; padding: 14px;">
              <span style="font-size: 10px; color: #4ade80; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: block;">💰 Денежный Магнит:</span>
              <strong style="font-size: 14px; color: #ffffff; display: block; margin: 3px 0;">${effectiveLithotherapy.wealthStones[0]?.name || 'Пирит'}</strong>
              <p style="font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.5;">${effectiveLithotherapy.wealthStones[0]?.properties || ''}</p>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 12px; padding: 14px;">
              <span style="font-size: 10px; color: #fb7185; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: block;">💖 Кристалл Любви:</span>
              <strong style="font-size: 14px; color: #ffffff; display: block; margin: 3px 0;">${effectiveLithotherapy.loveStones[0]?.name || 'Розовый кварц'}</strong>
              <p style="font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.5;">${effectiveLithotherapy.loveStones[0]?.properties || ''}</p>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(147, 51, 234, 0.25); border-radius: 12px; padding: 14px;">
              <span style="font-size: 10px; color: #c084fc; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: block;">🛡 Защитный Оберег:</span>
              <strong style="font-size: 14px; color: #ffffff; display: block; margin: 3px 0;">${effectiveLithotherapy.protectionStones[0]?.name || 'Шерл'}</strong>
              <p style="font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.5;">${effectiveLithotherapy.protectionStones[0]?.properties || ''}</p>
            </div>
          </div>

          <!-- Activation & Aromatherapy -->
          <div style="background: rgba(255, 215, 0, 0.05); border: 1px solid rgba(255, 215, 0, 0.25); border-radius: 14px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #ffd700; font-size: 12px; display: block;">✨ Активация камней:</strong>
              <span style="font-size: 11.5px; color: #e2e8f0;">${effectiveLithotherapy.primaryStones[0]?.activationMethod || 'Медитация'}</span>
            </div>
            <div style="text-align: right;">
              <strong style="color: #ffd700; font-size: 12px; display: block;">🌿 Эфирные масла:</strong>
              <span style="font-size: 11.5px; color: #e2e8f0;">${effectiveLithotherapy.essentialOils.map(o => o.name).join(', ')}</span>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- LUNAR & ELECTIVE TIMING SECTION (ЛУННЫЕ РИТМЫ И ЗОЛОТЫЕ ДАТЫ) -->
      ${effectiveLunar ? `
        <div style="margin-top: 32px; border-top: 2px dashed rgba(255, 215, 0, 0.35); padding-top: 28px; margin-bottom: 24px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; padding: 4px 14px; background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.4); border-radius: 20px; font-size: 11px; color: #fde047; text-transform: uppercase; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px;">
              ХОД СВЕТИЛ И БЛАГОПРИЯТНЫЕ ЧАСЫ
            </span>
            <h2 style="font-family: 'Cinzel', serif; font-size: 22px; color: #ffd700; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
              Лунный Цикл и Золотые Даты
            </h2>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
              ${effectiveLunar.lunarDay}-й Лунный День (${effectiveLunar.symbol}) • ${effectiveLunar.phaseName} • Знак: ${effectiveLunar.zodiacSign} (${effectiveLunar.illuminationPercentage}% освещенности)
            </p>
          </div>

          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.25); border-radius: 14px; padding: 16px; margin-bottom: 16px;">
            <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #ffd700; margin-bottom: 6px;">
              🌙 САКРАЛЬНЫЙ СОВЕТ ЛУНЫ НА ДЕНЬ СОСТАВЛЕНИЯ
            </div>
            <p style="font-size: 12.5px; line-height: 1.65; color: #e2e8f0; margin: 0 0 10px 0;">${effectiveLunar.generalVibe}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
              <div style="color: #4ade80;"><strong>✅ Благоприятно:</strong> ${effectiveLunar.favorableActivities.join(', ')}</div>
              <div style="color: #f87171;"><strong>⛔ Нежелательно:</strong> ${effectiveLunar.unfavorableActivities.join(', ')}</div>
            </div>
          </div>

          <!-- Golden Dates Recommendation -->
          ${effectiveElective && effectiveElective.topDates && effectiveElective.topDates.length > 0 ? `
            <div style="background: rgba(234, 179, 8, 0.06); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 14px; padding: 16px;">
              <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #fde047; margin-bottom: 8px;">
                ⭐ БЛИЖАЙШИЕ ЗОЛОТЫЕ ДАТЫ ДЛЯ НАЧИНАНИЙ
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                ${effectiveElective.topDates.slice(0, 2).map(d => `
                  <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 10px; border: 1px solid rgba(234,179,8,0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                      <strong style="color: #ffd700; font-size: 12px;">${d.formattedDate}</strong>
                      <span style="font-size: 10px; color: #4ade80; font-weight: bold;">Гармония: ${d.score}%</span>
                    </div>
                    <p style="font-size: 10.5px; color: #cbd5e1; margin: 0; line-height: 1.4;">${d.summary}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- CITIES OF POWER & ASTROCARTOGRAPHY SECTION -->
      ${cityDubai && cityBali ? `
        <div style="margin-top: 32px; border-top: 2px dashed rgba(255, 215, 0, 0.35); padding-top: 28px; margin-bottom: 24px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; padding: 4px 14px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 20px; font-size: 11px; color: #34d399; text-transform: uppercase; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px;">
              АСТРОКАРТОГРАФИЯ И ГЕО-ЭНЕРГЕТИКА
            </span>
            <h2 style="font-family: 'Cinzel', serif; font-size: 22px; color: #ffd700; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
              Города Силы и Энергетический Резонанс
            </h2>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
              Географические зоны максимального финансового и духовного раскрытия
            </p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.25); border-radius: 12px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #ffd700; font-size: 14px;">🏛 ${cityDubai.cityName}, ${cityDubai.country}</strong>
                <span style="background: rgba(34,197,94,0.2); color: #4ade80; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 10px;">${cityDubai.compatibilityScore}% Синергия</span>
              </div>
              <p style="font-size: 11px; color: #e2e8f0; margin: 0 0 6px 0;"><strong>Энергетический фокус:</strong> ${cityDubai.bestPurposeForVisit}</p>
              <div style="font-size: 10.5px; color: #94a3b8;"><strong>Векторы:</strong> ${cityDubai.wealthImpact} • ${cityDubai.careerImpact}</div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.25); border-radius: 12px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #ffd700; font-size: 14px;">🌴 ${cityBali.cityName}, ${cityBali.country}</strong>
                <span style="background: rgba(34,197,94,0.2); color: #4ade80; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 10px;">${cityBali.compatibilityScore}% Синергия</span>
              </div>
              <p style="font-size: 11px; color: #e2e8f0; margin: 0 0 6px 0;"><strong>Энергетический фокус:</strong> ${cityBali.bestPurposeForVisit}</p>
              <div style="font-size: 10.5px; color: #94a3b8;"><strong>Векторы:</strong> ${cityBali.loveImpact} • ${cityBali.energyWarning}</div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- BIORHYTHMS STATUS SECTION -->
      ${effectiveBiorhythms ? `
        <div style="margin-top: 32px; border-top: 2px dashed rgba(255, 215, 0, 0.35); padding-top: 24px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,215,0,0.2); border-radius: 12px; padding: 12px 18px;">
            <span style="font-family: 'Cinzel', serif; font-size: 12px; color: #ffd700; font-weight: bold;">⚡ БИОРИТМЫ НА ДАТУ РАСЧЕТА:</span>
            <div style="display: flex; gap: 16px; font-size: 11px;">
              <span style="color: #60a5fa;">Физический: <strong>${Math.round(effectiveBiorhythms.physical.value)}%</strong></span>
              <span style="color: #f472b6;">Эмоциональный: <strong>${Math.round(effectiveBiorhythms.emotional.value)}%</strong></span>
              <span style="color: #34d399;">Интеллектуальный: <strong>${Math.round(effectiveBiorhythms.intellectual.value)}%</strong></span>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- FULL INTEGRATED DAILY MYSTICAL FORECAST BLOCK -->
      ${effectiveForecast ? `
        <div style="margin-top: 32px; border-top: 2px dashed rgba(255, 215, 0, 0.35); padding-top: 28px; margin-bottom: 24px;">
          
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; padding: 4px 14px; background: rgba(255, 215, 0, 0.15); border: 1px solid rgba(255, 215, 0, 0.4); border-radius: 20px; font-size: 11px; color: #ffd700; text-transform: uppercase; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px;">
              АСТРО-НУМЕРОЛОГИЧЕСКИЙ РАСЧЕТ
            </span>
            <h2 style="font-family: 'Cinzel', serif; font-size: 22px; color: #ffd700; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
              Ежедневный Мистический Прогноз на ${effectiveForecast.date}
            </h2>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
              Знак Зодиака: ${effectiveForecast.zodiacSign} • Число Жизненного Пути: ${effectiveForecast.lifePathNumber || lifePath || '—'} • Личный Аркан Дня: ${matrix.day} (${arcanaNames[matrix.day] || ''})
            </p>
          </div>

          <!-- Planetary Transits -->
          <div style="background: rgba(255, 215, 0, 0.05); border: 1px solid rgba(255, 215, 0, 0.25); border-radius: 14px; padding: 18px; margin-bottom: 16px;">
            <div style="font-family: 'Cinzel', serif; font-size: 14px; font-weight: bold; color: #ffd700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span>🪐</span> ПЛАНЕТАРНЫЕ ТРАНЗИТЫ И ФАЗА ЛУНЫ
            </div>
            <p style="font-size: 13px; line-height: 1.7; color: #e2e8f0; margin: 0;">
              ${effectiveForecast.planetaryTransits}
            </p>
          </div>

          <!-- 2-Col Grid: General Vibe & Personal Impact -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.15); border-radius: 14px; padding: 16px;">
              <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #ffd700; margin-bottom: 8px;">
                🔮 КОСМИЧЕСКАЯ АТМОСФЕРА
              </div>
              <p style="font-size: 12px; line-height: 1.65; color: #cbd5e1; margin: 0;">
                ${effectiveForecast.generalVibe}
              </p>
            </div>
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.15); border-radius: 14px; padding: 16px;">
              <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #ffd700; margin-bottom: 8px;">
                ⚡ ПЕРСОНАЛЬНОЕ ВЛИЯНИЕ
              </div>
              <p style="font-size: 12px; line-height: 1.65; color: #cbd5e1; margin: 0;">
                ${effectiveForecast.personalImpact}
              </p>
            </div>
          </div>

          <!-- 2-Col Grid: Love & Relations + Career & Money -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
            <div style="background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 14px; padding: 16px;">
              <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #fb7185; margin-bottom: 8px;">
                💖 ЛЮБОВЬ И ОТНОШЕНИЯ
              </div>
              <p style="font-size: 12px; line-height: 1.65; color: #cbd5e1; margin: 0;">
                ${effectiveForecast.loveAndRelations}
              </p>
            </div>
            <div style="background: rgba(255, 215, 0, 0.05); border: 1px solid rgba(255, 215, 0, 0.25); border-radius: 14px; padding: 16px;">
              <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #fde047; margin-bottom: 8px;">
                💼 ДЕЛА, ДЕНЬГИ И РЕШЕНИЯ
              </div>
              <p style="font-size: 12px; line-height: 1.65; color: #cbd5e1; margin: 0;">
                ${effectiveForecast.careerAndMoney}
              </p>
            </div>
          </div>

          <!-- Warning -->
          <div style="background: rgba(180, 83, 9, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 14px; padding: 16px; margin-bottom: 16px;">
            <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #fbbf24; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <span>⚠️</span> ПРЕДОСТЕРЕЖЕНИЕ И КАРМИЧЕСКИЕ ЛОВУШКИ
            </div>
            <p style="font-size: 12px; line-height: 1.65; color: #e2e8f0; margin: 0;">
              ${effectiveForecast.warningOrCaution}
            </p>
          </div>

          <!-- Sacred Affirmation -->
          <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(16, 20, 38, 0.9) 100%); border: 2px solid rgba(255, 215, 0, 0.45); border-radius: 16px; padding: 20px; text-align: center;">
            <span style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 8px;">
              ✦ САКРАЛЬНАЯ АФФИРМАЦИЯ ДНЯ ✦
            </span>
            <p style="font-family: 'Cinzel', serif; font-size: 15px; font-style: italic; color: #ffffff; margin: 0; line-height: 1.6;">
              "${effectiveForecast.affirmation}"
            </p>
          </div>

        </div>
      ` : ''}

      <!-- SACRED HORARY / QUESTION TO FATE SECTION IN THE MANUSCRIPT -->
      ${effectiveHorary ? `
        <div style="margin-top: 32px; border-top: 2px dashed rgba(255, 215, 0, 0.35); padding-top: 28px; margin-bottom: 24px;">
          
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; padding: 4px 14px; background: rgba(255, 215, 0, 0.15); border: 1px solid rgba(255, 215, 0, 0.4); border-radius: 20px; font-size: 11px; color: #ffd700; text-transform: uppercase; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px;">
              ОРАКУЛ ВРЕМЕНИ И РАЗВИЛОК
            </span>
            <h2 style="font-family: 'Cinzel', serif; font-size: 22px; color: #ffd700; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
              Задать Вопрос Судьбе • Сакральный Вердикт
            </h2>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
              Вопрошающий: ${userInput.name || 'Странник'} • Час озарения: ${new Date(effectiveHorary.timestamp || Date.now()).toLocaleDateString('ru-RU')}
            </p>
          </div>

          <!-- Question Box -->
          <div style="background: rgba(255, 215, 0, 0.08); border: 1px solid rgba(255, 215, 0, 0.35); border-radius: 14px; padding: 18px; margin-bottom: 16px;">
            <div style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; margin-bottom: 6px;">Вопрос странника к Судьбе</div>
            <div style="font-family: 'Cinzel', serif; font-size: 16px; color: #ffffff; font-weight: 700; line-height: 1.5;">
              «${effectiveHorary.question}»
            </div>
          </div>

          <!-- Verdict Banner with Probability -->
          <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(20, 24, 48, 0.95) 100%); border: 2px solid rgba(255, 215, 0, 0.45); border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 16px;">
            <div style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin-bottom: 6px;">
              ВЕРДИКТ И ИСХОД СУДЬБЫ
            </div>
            <div style="font-family: 'Cinzel', serif; font-size: 20px; color: #ffd700; font-weight: 800; margin-bottom: 10px;">
              ${effectiveHorary.answer}
            </div>
            ${effectiveHorary.probability !== undefined ? `
              <div style="display: inline-block; padding: 5px 16px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,215,0,0.35); border-radius: 20px; font-size: 12px; color: #ffffff; font-weight: bold;">
                ⚡ Вероятность свершения: <span style="color: #ffd700; font-size: 14px;">${effectiveHorary.probability}%</span>
              </div>
            ` : ''}
          </div>

          <!-- Timing & Ruling Energy Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
            <div style="background: rgba(147, 51, 234, 0.08); border: 1px solid rgba(147, 51, 234, 0.3); border-radius: 14px; padding: 16px;">
              <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #c084fc; margin-bottom: 6px; font-weight: bold;">⏳ СРОКИ И ВРЕМЕННОЙ ГОРИЗОНТ</div>
              <p style="font-size: 12px; color: #e2e8f0; margin: 0; line-height: 1.6;">${effectiveHorary.timing || 'В ближайший период лунного цикла'}</p>
            </div>
            <div style="background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 14px; padding: 16px;">
              <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #fde047; margin-bottom: 6px; font-weight: bold;">🪐 ПРАВЯЩАЯ ЭНЕРГИЯ ЧАСА</div>
              <p style="font-size: 12px; color: #e2e8f0; margin: 0; line-height: 1.6;">${effectiveHorary.rulingPlanetOrArcana || 'Аспекты гармонии планет и арканов'}</p>
            </div>
          </div>

          <!-- Favorable Conditions: ЕСЛИ БУДЕТ... -->
          ${effectiveHorary.favorableConditions ? `
            <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 14px; padding: 16px; margin-bottom: 16px;">
              <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #4ade80; margin-bottom: 6px; font-weight: bold;">
                🌱 «ЕСЛИ БУДЕТ...» — САКРАЛЬНЫЕ УСЛОВИЯ УСПЕХА
              </div>
              <p style="font-size: 12px; line-height: 1.65; color: #f0fdf4; margin: 0;">${effectiveHorary.favorableConditions}</p>
            </div>
          ` : ''}

          <!-- Risks and Warnings -->
          ${effectiveHorary.risksAndWarnings ? `
            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 14px; padding: 16px; margin-bottom: 16px;">
              <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #f87171; margin-bottom: 6px; font-weight: bold;">
                ⚠️ КАРМИЧЕСКИЕ ЛОВУШКИ И ЧЕГО ИЗБЕГАТЬ
              </div>
              <p style="font-size: 12px; line-height: 1.65; color: #fef2f2; margin: 0;">${effectiveHorary.risksAndWarnings}</p>
            </div>
          ` : ''}

          <!-- Deep Explanation -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 14px; padding: 18px; margin-bottom: 16px;">
            <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #ffd700; margin-bottom: 8px; font-weight: bold;">◈ ТОЛКОВАНИЕ ОРАКУЛА</div>
            <p style="font-size: 12.5px; line-height: 1.7; color: #f1f5f9; margin: 0;">${effectiveHorary.explanation}</p>
          </div>

          <!-- Advice & Affirmation -->
          <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(16, 20, 38, 0.9) 100%); border: 2px solid rgba(255, 215, 0, 0.45); border-radius: 16px; padding: 18px; text-align: center;">
            <span style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 6px;">
              ✦ СОВЕТ И НАМЕРЕНИЕ ДЛЯ ВОПРОШАЮЩЕГО ✦
            </span>
            <p style="font-size: 13px; color: #ffffff; margin: 0 0 8px 0; line-height: 1.6;">${effectiveHorary.advice}</p>
            ${effectiveHorary.affirmation ? `
              <div style="font-family: 'Cinzel', serif; font-size: 13px; font-style: italic; color: #ffd700; border-top: 1px solid rgba(255,215,0,0.2); padding-top: 8px; margin-top: 8px;">
                «${effectiveHorary.affirmation}»
              </div>
            ` : ''}
          </div>

        </div>
      ` : ''}

      <!-- CHAT HISTORY WITH CHUBUK (QUESTIONS TO FATE ABOUT MATRIX) -->
      ${effectiveChat && effectiveChat.length > 0 ? `
        <div style="margin-top: 32px; border-top: 2px dashed rgba(255, 215, 0, 0.35); padding-top: 28px; margin-bottom: 24px;">
          <div style="text-align: center; margin-bottom: 18px;">
            <span style="display: inline-block; padding: 4px 14px; background: rgba(255, 215, 0, 0.15); border: 1px solid rgba(255, 215, 0, 0.4); border-radius: 20px; font-size: 11px; color: #ffd700; text-transform: uppercase; font-weight: 700; letter-spacing: 2px; margin-bottom: 6px;">
              ОТВЕТЫ СТАРЦА НА ВОПРОСЫ
            </span>
            <h3 style="font-family: 'Cinzel', serif; font-size: 18px; color: #ffd700; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
              Диалог со Старцем • Задать Вопрос Судьбе
            </h3>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${effectiveChat.map(msg => `
              <div style="background: ${msg.role === 'user' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 215, 0, 0.06)'}; border: 1px solid ${msg.role === 'user' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 215, 0, 0.25)'}; border-radius: 12px; padding: 14px;">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; color: ${msg.role === 'user' ? '#94a3b8' : '#ffd700'}; margin-bottom: 4px;">
                  ${msg.role === 'user' ? 'Вопрос Странника' : 'Ответ Старца Chubuk'}
                </div>
                <div style="font-size: 12.5px; line-height: 1.65; color: ${msg.role === 'user' ? '#e2e8f0' : '#fef08a'}; font-style: ${msg.role === 'user' ? 'normal' : 'italic'};">
                  ${msg.text}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(255, 215, 0, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Создано в Chubuk Matrix System • Сакральная Эзотерика и Астро-Нумерология</p>
      </div>

    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050710',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    
    let heightLeft = totalPdfHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;
    
    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportDailyForecastPdf = async ({
  userInput,
  forecast,
  astrology,
  matrix,
  filename
}: {
  userInput?: UserInput | null;
  forecast: DailyMysticalForecast;
  astrology?: AstrologyData | null;
  matrix?: MatrixNumbers | null;
  filename?: string;
}) => {
  const birthDate = userInput?.birthDate;
  const effectiveAstrology = astrology || (birthDate ? getAstrologyData(birthDate) : null);
  const effectiveMatrix = matrix || (birthDate ? calculateMatrix(birthDate) : null);
  const lifePath = birthDate ? calculateLifePathNumber(birthDate) : (forecast.lifePathNumber || null);
  const effectiveBiorhythms = forecast.biorhythms || (birthDate ? calculateBiorhythms(birthDate, forecast.date) : null);
  const userName = userInput?.name || 'Странник';

  const container = document.createElement('div');
  container.id = 'pdf-daily-forecast-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '820px';
  container.style.backgroundColor = '#050710';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #b48811; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #0e1224 0%, #05070e 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
      
      <!-- Gold Corner Ornaments -->
      <div style="position: absolute; top: 14px; left: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; top: 14px; right: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; bottom: 14px; left: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; bottom: 14px; right: 16px; color: #ffd700; font-size: 18px;">✦</div>

      <!-- Header -->
      <div style="text-align: center; border-bottom: 1px solid rgba(255, 215, 0, 0.25); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #ffd700, #b48811); color: #000; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(255,215,0,0.45);">C</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 28px; color: #ffd700; letter-spacing: 4px; margin: 0; text-transform: uppercase;">САКРАЛЬНЫЙ МАНУСКРИПТ ДНЯ</h1>
        <p style="font-size: 12px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">Ежедневный Астро-Нумерологический Прогноз • Chubuk Matrix</p>
      </div>

      <!-- User Profile Box -->
      <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 16px; padding: 20px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1.5px; display: block; font-weight: bold;">Имя странника</span>
          <span style="font-size: 20px; color: #ffffff; font-weight: 700;">${userName}</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1.5px; display: block; font-weight: bold;">Дата прогноза</span>
          <span style="font-size: 20px; color: #ffd700; font-weight: 700;">${forecast.date}</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1.5px; display: block; font-weight: bold;">Знак Зодиака</span>
          <span style="font-size: 14px; color: #e2e8f0; font-weight: 600;">
            ${forecast.zodiacSign} ${effectiveAstrology ? `(${effectiveAstrology.element}, Планета: ${effectiveAstrology.planet})` : ''}
          </span>
        </div>
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1.5px; display: block; font-weight: bold;">Число Жизненного Пути</span>
          <span style="font-size: 14px; color: #e2e8f0; font-weight: 600;">ЧЖП ${lifePath || forecast.lifePathNumber || '—'}</span>
        </div>
      </div>

      <!-- Matrix Core Keys if available -->
      ${effectiveMatrix ? `
        <div style="margin-bottom: 24px;">
          <h3 style="font-family: 'Cinzel', serif; font-size: 14px; color: #ffd700; margin-bottom: 10px; letter-spacing: 1.5px; display: flex; align-items: center; gap: 8px;">
            <span>◈</span> ЛИЧНЫЕ КЛЮЧИ ЭНЕРГИЙ
          </h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
            <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 10px; padding: 10px; text-align: center;">
              <div style="font-size: 9px; color: #ffd700; text-transform: uppercase;">Личность</div>
              <div style="font-size: 18px; font-weight: bold; color: #fff;">${effectiveMatrix.day}</div>
              <div style="font-size: 9px; color: #94a3b8;">${arcanaNames[effectiveMatrix.day] || ''}</div>
            </div>
            <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 10px; padding: 10px; text-align: center;">
              <div style="font-size: 9px; color: #ffd700; text-transform: uppercase;">Таланты</div>
              <div style="font-size: 18px; font-weight: bold; color: #fff;">${effectiveMatrix.month}</div>
              <div style="font-size: 9px; color: #94a3b8;">${arcanaNames[effectiveMatrix.month] || ''}</div>
            </div>
            <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 10px; padding: 10px; text-align: center;">
              <div style="font-size: 9px; color: #ffd700; text-transform: uppercase;">Душа</div>
              <div style="font-size: 18px; font-weight: bold; color: #fff;">${effectiveMatrix.center}</div>
              <div style="font-size: 9px; color: #94a3b8;">${arcanaNames[effectiveMatrix.center] || ''}</div>
            </div>
            <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 10px; padding: 10px; text-align: center;">
              <div style="font-size: 9px; color: #ffd700; text-transform: uppercase;">Судьба</div>
              <div style="font-size: 18px; font-weight: bold; color: #fff;">${effectiveMatrix.destiny}</div>
              <div style="font-size: 9px; color: #94a3b8;">${arcanaNames[effectiveMatrix.destiny] || ''}</div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Planetary Transits -->
      <div style="background: rgba(255, 215, 0, 0.05); border: 1px solid rgba(255, 215, 0, 0.25); border-radius: 14px; padding: 18px; margin-bottom: 18px;">
        <div style="font-family: 'Cinzel', serif; font-size: 14px; font-weight: bold; color: #ffd700; margin-bottom: 8px;">
          🪐 ПЛАНЕТАРНЫЕ ТРАНЗИТЫ И ФАЗА ЛУНЫ
        </div>
        <p style="font-size: 13px; line-height: 1.7; color: #e2e8f0; margin: 0;">
          ${forecast.planetaryTransits}
        </p>
      </div>

      <!-- 2-Col Grid: General Vibe & Personal Impact -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.15); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #ffd700; margin-bottom: 8px;">
            🔮 КОСМИЧЕСКАЯ АТМОСФЕРА
          </div>
          <p style="font-size: 12px; line-height: 1.65; color: #cbd5e1; margin: 0;">
            ${forecast.generalVibe}
          </p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.15); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #ffd700; margin-bottom: 8px;">
            ⚡ ПЕРСОНАЛЬНОЕ ВЛИЯНИЕ
          </div>
          <p style="font-size: 12px; line-height: 1.65; color: #cbd5e1; margin: 0;">
            ${forecast.personalImpact}
          </p>
        </div>
      </div>

      <!-- 2-Col Grid: Love & Relations + Career & Money -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
        <div style="background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #fb7185; margin-bottom: 8px;">
            💖 ЛЮБОВЬ И ОТНОШЕНИЯ
          </div>
          <p style="font-size: 12px; line-height: 1.65; color: #cbd5e1; margin: 0;">
            ${forecast.loveAndRelations}
          </p>
        </div>
        <div style="background: rgba(255, 215, 0, 0.05); border: 1px solid rgba(255, 215, 0, 0.25); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #fde047; margin-bottom: 8px;">
            💼 ДЕЛА, ПРОЕКТЫ И РЕШЕНИЯ
          </div>
          <p style="font-size: 12px; line-height: 1.65; color: #cbd5e1; margin: 0;">
            ${forecast.careerAndMoney}
          </p>
        </div>
      </div>

      <!-- Biorhythms Section (if available) -->
      ${effectiveBiorhythms ? `
        <div style="background: rgba(6, 182, 212, 0.06); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 14px; padding: 18px; margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #22d3ee; text-transform: uppercase;">
              ⚡ ПЕРСОНАЛЬНЫЕ БИОРИТМЫ ДНЯ
            </div>
            <div style="font-size: 11px; font-weight: bold; color: #38bdf8; background: rgba(0,0,0,0.4); padding: 3px 10px; border-radius: 8px; border: 1px solid rgba(6,182,212,0.2);">
              Интеграл: ${effectiveBiorhythms.averageScore >= 0 ? '+' : ''}${effectiveBiorhythms.averageScore}% • Прожито: ${effectiveBiorhythms.daysLived.toLocaleString('ru-RU')} дн.
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; font-size: 11px;">
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2); text-align: center;">
              <span style="color: #f87171; font-weight: bold; display: block; font-size: 10px;">🔴 ФИЗИЧЕСКИЙ (23d)</span>
              <span style="font-size: 15px; font-weight: bold; color: #fff; display: block; margin: 2px 0;">${effectiveBiorhythms.physical.value >= 0 ? '+' : ''}${effectiveBiorhythms.physical.value}%</span>
              <span style="font-size: 9.5px; color: #94a3b8;">${effectiveBiorhythms.physical.phase === 'peak' ? 'Подъем' : effectiveBiorhythms.physical.phase === 'critical' ? 'Критический' : 'Спад'}</span>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; border: 1px solid rgba(236, 72, 153, 0.2); text-align: center;">
              <span style="color: #f472b6; font-weight: bold; display: block; font-size: 10px;">💗 ЭМОЦИОНАЛЬНЫЙ (28d)</span>
              <span style="font-size: 15px; font-weight: bold; color: #fff; display: block; margin: 2px 0;">${effectiveBiorhythms.emotional.value >= 0 ? '+' : ''}${effectiveBiorhythms.emotional.value}%</span>
              <span style="font-size: 9.5px; color: #94a3b8;">${effectiveBiorhythms.emotional.phase === 'peak' ? 'Подъем' : effectiveBiorhythms.emotional.phase === 'critical' ? 'Критический' : 'Спад'}</span>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2); text-align: center;">
              <span style="color: #60a5fa; font-weight: bold; display: block; font-size: 10px;">🔵 ИНТЕЛЛЕКТ (33d)</span>
              <span style="font-size: 15px; font-weight: bold; color: #fff; display: block; margin: 2px 0;">${effectiveBiorhythms.intellectual.value >= 0 ? '+' : ''}${effectiveBiorhythms.intellectual.value}%</span>
              <span style="font-size: 9.5px; color: #94a3b8;">${effectiveBiorhythms.intellectual.phase === 'peak' ? 'Подъем' : effectiveBiorhythms.intellectual.phase === 'critical' ? 'Критический' : 'Спад'}</span>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; border: 1px solid rgba(168, 85, 247, 0.2); text-align: center;">
              <span style="color: #c084fc; font-weight: bold; display: block; font-size: 10px;">🟣 ИНТУИЦИЯ (38d)</span>
              <span style="font-size: 15px; font-weight: bold; color: #fff; display: block; margin: 2px 0;">${effectiveBiorhythms.intuitive.value >= 0 ? '+' : ''}${effectiveBiorhythms.intuitive.value}%</span>
              <span style="font-size: 9.5px; color: #94a3b8;">${effectiveBiorhythms.intuitive.phase === 'peak' ? 'Подъем' : effectiveBiorhythms.intuitive.phase === 'critical' ? 'Критический' : 'Спад'}</span>
            </div>
          </div>

          <div style="background: rgba(6, 182, 212, 0.1); border-radius: 8px; padding: 10px; font-size: 11.5px; color: #a5f3fc; border-left: 3px solid #06b6d4;">
            <strong>Динамика дня:</strong> ${effectiveBiorhythms.summaryText}
          </div>
        </div>
      ` : ''}

      <!-- Health & Disease Risk Section (if available) -->
      ${forecast.healthAndVitality ? `
        <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 18px; margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #34d399; text-transform: uppercase;">
              🌿 ЗДОРОВЬЕ И ВЕРОЯТНОСТЬ НЕДОМОГАНИЙ
            </div>
            <div style="font-size: 11px; font-weight: bold; color: ${forecast.healthAndVitality.diseaseRiskPercentage > 50 ? '#fb7185' : '#34d399'}; background: rgba(0,0,0,0.4); padding: 3px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
              Риск болезни: ${forecast.healthAndVitality.diseaseRiskPercentage}% • Тонус: ${100 - forecast.healthAndVitality.diseaseRiskPercentage}%
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; font-size: 11.5px;">
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.15);">
              <span style="color: #6ee7b7; font-weight: bold; display: block; margin-bottom: 3px;">◈ Уязвимые зоны тела:</span>
              <span style="color: #e2e8f0;">${forecast.healthAndVitality.vulnerableOrgansOrSystems.join(', ')}</span>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.15);">
              <span style="color: #fde047; font-weight: bold; display: block; margin-bottom: 3px;">⚡ Психосоматический триггер:</span>
              <span style="color: #e2e8f0;">${forecast.healthAndVitality.psychosomaticTrigger}</span>
            </div>
          </div>

          <p style="font-size: 12px; line-height: 1.65; color: #e2e8f0; margin: 0 0 10px 0;">
            ${forecast.healthAndVitality.vitalityForecast}
          </p>

          <div style="background: rgba(16, 185, 129, 0.1); border-radius: 8px; padding: 10px; font-size: 11.5px; color: #a7f3d0; border-left: 3px solid #10b981;">
            <strong>Целебный совет и рецепт:</strong> ${forecast.healthAndVitality.healingRemedy}
          </div>
        </div>
      ` : ''}

      <!-- Financial Flow: Profit vs Loss Section (if available) -->
      ${forecast.financialFlow ? `
        <div style="background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 14px; padding: 18px; margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #fbbf24; text-transform: uppercase;">
              💰 ФИНАНСОВЫЙ ПОТОК: ПРИБЫЛЬ vs УБЫЛЬ
            </div>
            <div style="font-size: 11px; font-weight: bold; color: #ffd700; background: rgba(0,0,0,0.4); padding: 3px 10px; border-radius: 8px; border: 1px solid rgba(255,215,0,0.2);">
              Потенциал прибыли: ${forecast.financialFlow.profitPotential}% • Риск убыли: ${forecast.financialFlow.lossRisk}%
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; font-size: 11.5px;">
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.15);">
              <span style="color: #4ade80; font-weight: bold; display: block; margin-bottom: 3px;">📈 Точки роста и прибыли:</span>
              <span style="color: #cbd5e1;">${forecast.financialFlow.profitOpportunities}</span>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; border: 1px solid rgba(248, 113, 113, 0.15);">
              <span style="color: #f87171; font-weight: bold; display: block; margin-bottom: 3px;">📉 Опасности убыли и ловушки:</span>
              <span style="color: #cbd5e1;">${forecast.financialFlow.lossDangers}</span>
            </div>
          </div>

          <div style="background: rgba(255, 215, 0, 0.1); border-radius: 8px; padding: 10px; font-size: 11.5px; color: #fef08a; border-left: 3px solid #fbbf24;">
            <strong>Золотое правило кошелька на день:</strong> ${forecast.financialFlow.wealthActionAdvice}
          </div>
        </div>
      ` : ''}

      <!-- Warning -->
      <div style="background: rgba(180, 83, 9, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 14px; padding: 16px; margin-bottom: 18px;">
        <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #fbbf24; margin-bottom: 6px;">
          ⚠️ ПРЕДОСТЕРЕЖЕНИЕ ДНЯ
        </div>
        <p style="font-size: 12px; line-height: 1.65; color: #e2e8f0; margin: 0;">
          ${forecast.warningOrCaution}
        </p>
      </div>

      <!-- Sacred Affirmation -->
      <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(16, 20, 38, 0.9) 100%); border: 2px solid rgba(255, 215, 0, 0.45); border-radius: 16px; padding: 22px; text-align: center; margin-bottom: 20px;">
        <span style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 8px;">
          ✦ САКРАЛЬНАЯ АФФИРМАЦИЯ ДНЯ ✦
        </span>
        <p style="font-family: 'Cinzel', serif; font-size: 16px; font-style: italic; color: #ffffff; margin: 0; line-height: 1.6;">
          "${forecast.affirmation}"
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(255, 215, 0, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Сакральный Ежедневный Манускрипт</p>
      </div>

    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050710',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    
    let heightLeft = totalPdfHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;
    
    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Сакральный_Прогноз_${userName}_${forecast.targetDate || 'сегодня'}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Daily Forecast PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportAstrologyPdf = async ({
  userInput,
  astroData,
  analysis,
  filename
}: {
  userInput?: UserInput | null;
  astroData: AstrologyData;
  analysis: AstrologyResult;
  filename?: string;
}) => {
  const userName = userInput?.name || 'Странник';
  const birthDate = userInput?.birthDate || '';

  const container = document.createElement('div');
  container.id = 'pdf-astrology-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '820px';
  container.style.backgroundColor = '#050710';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #b48811; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #0e1224 0%, #05070e 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
      <div style="position: absolute; top: 14px; left: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; top: 14px; right: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; bottom: 14px; left: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; bottom: 14px; right: 16px; color: #ffd700; font-size: 18px;">✦</div>

      <!-- Header -->
      <div style="text-align: center; border-bottom: 1px solid rgba(255, 215, 0, 0.25); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #ffd700, #b48811); color: #000; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(255,215,0,0.45);">C</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 28px; color: #ffd700; letter-spacing: 4px; margin: 0; text-transform: uppercase;">САКРАЛЬНЫЙ АСТРОЛОГИЧЕСКИЙ МАНУСКРИПТ</h1>
        <p style="font-size: 12px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">Натальная Карта и Звездный Путь • Chubuk Matrix</p>
      </div>

      <!-- Profile Grid -->
      <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 16px; padding: 20px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1.5px; display: block; font-weight: bold;">Имя</span>
          <span style="font-size: 18px; color: #ffffff; font-weight: 700;">${userName}</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1.5px; display: block; font-weight: bold;">Дата рождения</span>
          <span style="font-size: 18px; color: #ffd700; font-weight: 700;">${birthDate || '—'}</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1.5px; display: block; font-weight: bold;">Знак Зодиака</span>
          <span style="font-size: 16px; color: #ffffff; font-weight: 700;">${astroData.zodiacSign}</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1.5px; display: block; font-weight: bold;">Стихия и Планета</span>
          <span style="font-size: 14px; color: #e2e8f0;">${astroData.element} • ${astroData.planet}</span>
        </div>
      </div>

      <!-- Intro -->
      <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.25); border-radius: 14px; padding: 18px; margin-bottom: 20px;">
        <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: #ffd700; margin: 0 0 8px 0; letter-spacing: 1px;">◈ ВВЕДЕНИЕ В НЕБЕСНУЮ СФЕРУ</h3>
        <p style="font-size: 13px; line-height: 1.7; color: #f1f5f9; margin: 0;">${analysis.introduction}</p>
      </div>

      <!-- Natal Chart -->
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 14px; padding: 18px; margin-bottom: 20px;">
        <h3 style="font-family: 'Cinzel', serif; font-size: 14px; color: #ffd700; margin: 0 0 8px 0;">🪐 НАТАЛЬНАЯ КОНФИГУРАЦИЯ И АСПЕКТЫ</h3>
        <p style="font-size: 13px; line-height: 1.7; color: #e2e8f0; margin: 0 0 14px 0;">${analysis.natalChart}</p>
        
        ${analysis.aspects && analysis.aspects.length > 0 ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            ${analysis.aspects.map(asp => `
              <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,215,0,0.15); border-radius: 10px; padding: 12px;">
                <div style="font-weight: 700; color: #ffd700; font-size: 12px; margin-bottom: 4px;">${asp.title}</div>
                <div style="font-size: 11.5px; color: #cbd5e1; line-height: 1.6;">${asp.description}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Spiritual and Professional Paths -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: rgba(147, 51, 234, 0.08); border: 1px solid rgba(147, 51, 234, 0.3); border-radius: 14px; padding: 16px;">
          <h4 style="font-family: 'Cinzel', serif; font-size: 13px; color: #c084fc; margin: 0 0 8px 0;">🔮 ДУХОВНЫЙ ПУТЬ</h4>
          <p style="font-size: 12px; line-height: 1.65; color: #e2e8f0; margin: 0;">${analysis.spiritualPath}</p>
        </div>
        <div style="background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 14px; padding: 16px;">
          <h4 style="font-family: 'Cinzel', serif; font-size: 13px; color: #fde047; margin: 0 0 8px 0;">💼 ПРОФЕССИОНАЛЬНОЕ ПРИЗВАНИЕ</h4>
          <p style="font-size: 12px; line-height: 1.65; color: #e2e8f0; margin: 0;">${analysis.professionalPath}</p>
        </div>
      </div>

      <!-- Karmic Lessons & Planetary Influences if available -->
      ${analysis.karmicLessons ? `
        <div style="background: rgba(244, 63, 94, 0.06); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 14px; padding: 16px; margin-bottom: 20px;">
          <h4 style="font-family: 'Cinzel', serif; font-size: 13px; color: #fb7185; margin: 0 0 6px 0;">⚖️ КАРМИЧЕСКИЕ УРОКИ</h4>
          <p style="font-size: 12px; line-height: 1.65; color: #e2e8f0; margin: 0;">${analysis.karmicLessons}</p>
        </div>
      ` : ''}

      <!-- Advice -->
      <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(16, 20, 38, 0.9) 100%); border: 2px solid rgba(255, 215, 0, 0.45); border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 20px;">
        <span style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 8px;">
          ✦ НАПУТСТВИЕ ЗВЕЗД ✦
        </span>
        <p style="font-family: 'Cinzel', serif; font-size: 14px; font-style: italic; color: #ffffff; margin: 0; line-height: 1.6;">
          "${analysis.advice}"
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(255, 215, 0, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Сакральная Астрология</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050710',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Астрологический_Манускрипт_${userName}_${astroData.zodiacSign}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Astrology PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportCompatibilityPdf = async ({
  user1,
  partner,
  result,
  filename
}: {
  user1: { name: string; birthDate: string; zodiac?: string; lifePath?: number | null };
  partner: { name: string; birthDate: string; zodiac?: string; lifePath?: number | null; relationshipType: string };
  result: CompatibilityResult;
  filename?: string;
}) => {
  const container = document.createElement('div');
  container.id = 'pdf-compat-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '820px';
  container.style.backgroundColor = '#050710';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  const typeLabels: Record<string, string> = {
    love: 'Любовь и Брак',
    business: 'Бизнес и Партнерство',
    friendship: 'Дружба и Единомыслие',
    family: 'Семья и Род'
  };

  container.innerHTML = `
    <div style="border: 2px solid #b48811; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #0e1224 0%, #05070e 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
      <div style="position: absolute; top: 14px; left: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; top: 14px; right: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; bottom: 14px; left: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; bottom: 14px; right: 16px; color: #ffd700; font-size: 18px;">✦</div>

      <!-- Header -->
      <div style="text-align: center; border-bottom: 1px solid rgba(255, 215, 0, 0.25); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #ffd700, #b48811); color: #000; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(255,215,0,0.45);">C</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 28px; color: #ffd700; letter-spacing: 4px; margin: 0; text-transform: uppercase;">САКРАЛЬНЫЙ МАНУСКРИПТ СОВМЕСТИМОСТИ</h1>
        <p style="font-size: 12px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">
          Синергия Душ: ${user1.name} & ${partner.name} • ${typeLabels[result.relationshipType] || 'Союз'}
        </p>
      </div>

      <!-- Partners Box -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 14px; padding: 16px;">
          <div style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">Первый партнер</div>
          <div style="font-size: 18px; color: #ffffff; font-weight: 700; margin: 4px 0;">${user1.name}</div>
          <div style="font-size: 12px; color: #cbd5e1;">${user1.birthDate} ${user1.zodiac ? `• ${user1.zodiac}` : ''} ${user1.lifePath ? `• ЧЖП ${user1.lifePath}` : ''}</div>
        </div>
        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 14px; padding: 16px;">
          <div style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">Второй партнер</div>
          <div style="font-size: 18px; color: #ffffff; font-weight: 700; margin: 4px 0;">${partner.name}</div>
          <div style="font-size: 12px; color: #cbd5e1;">${partner.birthDate} ${partner.zodiac ? `• ${partner.zodiac}` : ''} ${partner.lifePath ? `• ЧЖП ${partner.lifePath}` : ''}</div>
        </div>
      </div>

      <!-- Core Metrics: Energy & Synergy Score -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: rgba(255, 215, 0, 0.08); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 14px; padding: 18px; text-align: center;">
          <div style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 1px;">Главная Энергия Союза</div>
          <div style="font-size: 32px; font-weight: 800; color: #ffffff; margin: 4px 0;">${result.matrixCompatibility.commonEnergy}</div>
          <div style="font-size: 11px; color: #e2e8f0; line-height: 1.5;">${result.matrixCompatibility.description}</div>
        </div>
        <div style="background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 14px; padding: 18px; text-align: center;">
          <div style="font-size: 10px; color: #fb7185; text-transform: uppercase; letter-spacing: 1px;">Астрологическая Синергия</div>
          <div style="font-size: 32px; font-weight: 800; color: #ffffff; margin: 4px 0;">${result.astrologySynergy.score}%</div>
          <div style="font-size: 11px; color: #e2e8f0; line-height: 1.5;">${result.astrologySynergy.description}</div>
        </div>
      </div>

      <!-- Living Together Verdict if present -->
      ${result.livingTogetherVerdict ? `
        <div style="background: ${result.livingTogetherVerdict.status === 'ideal' ? 'rgba(34, 197, 94, 0.08)' : result.livingTogetherVerdict.status === 'karmic_challenging' ? 'rgba(234, 179, 8, 0.08)' : 'rgba(239, 68, 68, 0.08)'}; border: 1px solid ${result.livingTogetherVerdict.status === 'ideal' ? 'rgba(34, 197, 94, 0.4)' : result.livingTogetherVerdict.status === 'karmic_challenging' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(239, 68, 68, 0.4)'}; border-radius: 16px; padding: 18px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: ${result.livingTogetherVerdict.status === 'ideal' ? '#4ade80' : result.livingTogetherVerdict.status === 'karmic_challenging' ? '#facc15' : '#f87171'}; text-transform: uppercase;">
              ◈ ВЕРДИКТ ДЛЯ СОВМЕСТНОГО БЫТА И БРАКА: ${result.livingTogetherVerdict.badgeText}
            </div>
            <div style="font-size: 12px; font-weight: bold; color: #ffffff; background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 8px;">
              Бытовая гармония: ${result.livingTogetherVerdict.domesticHarmonyScore}%
            </div>
          </div>
          <p style="font-size: 12px; color: #f1f5f9; line-height: 1.6; margin: 0 0 10px 0;">${result.livingTogetherVerdict.summary}</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; font-size: 11px;">
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
              <span style="color: #4ade80; font-weight: bold; display: block; margin-bottom: 4px;">✓ Плюсы совместного проживания:</span>
              <span style="color: #cbd5e1;">${result.livingTogetherVerdict.prosOfLivingTogether}</span>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
              <span style="color: #f87171; font-weight: bold; display: block; margin-bottom: 4px;">⚠ Главная бытовая мина:</span>
              <span style="color: #cbd5e1;">${result.livingTogetherVerdict.fatalStumblingBlock}</span>
            </div>
          </div>
          <div style="margin-top: 10px; padding: 8px; background: rgba(255,215,0,0.06); border-radius: 8px; font-size: 11px; color: #ffd700;">
            <strong>Золотое правило дома:</strong> ${result.livingTogetherVerdict.goldenRuleForDomesticPeace}
          </div>
        </div>
      ` : ''}

      <!-- Intro -->
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 14px; padding: 18px; margin-bottom: 20px;">
        <h3 style="font-family: 'Cinzel', serif; font-size: 14px; color: #ffd700; margin: 0 0 8px 0;">◈ ВВЕДЕНИЕ В СОЮЗ</h3>
        <p style="font-size: 13px; line-height: 1.7; color: #f1f5f9; margin: 0;">${result.introduction}</p>
      </div>

      <!-- Tarot Union Card if present -->
      ${result.tarotAspect ? `
        <div style="background: rgba(147, 51, 234, 0.08); border: 1px solid rgba(147, 51, 234, 0.3); border-radius: 14px; padding: 16px; margin-bottom: 20px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #c084fc; margin-bottom: 6px;">
            🃏 КАРТА ЕДИНСТВА ТАРО: ${result.tarotAspect.card.name}
          </div>
          <p style="font-size: 12px; line-height: 1.65; color: #cbd5e1; margin: 0;">${result.tarotAspect.interpretation}</p>
        </div>
      ` : ''}

      <!-- Detailed Sections -->
      ${result.sections && result.sections.length > 0 ? `
        <div style="margin-bottom: 20px;">
          ${result.sections.map(sec => `
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 215, 0, 0.15); border-radius: 12px; padding: 14px; margin-bottom: 10px;">
              <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #ffd700; margin-bottom: 6px;">◈ ${sec.title}</div>
              <p style="font-size: 12px; line-height: 1.65; color: #e2e8f0; margin: 0;">${sec.content}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Advice -->
      <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(16, 20, 38, 0.9) 100%); border: 2px solid rgba(255, 215, 0, 0.45); border-radius: 16px; padding: 20px; text-align: center;">
        <span style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 8px;">
          ✦ НАПУТСТВИЕ ДЛЯ СОЮЗА ✦
        </span>
        <p style="font-family: 'Cinzel', serif; font-size: 14px; font-style: italic; color: #ffffff; margin: 0; line-height: 1.6;">
          "${result.advice}"
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(255, 215, 0, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Сакральная Совместимость</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050710',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Манускрипт_Совместимости_${user1.name}_и_${partner.name}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Compatibility PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportTarotPdf = async ({
  userInput,
  reading,
  question,
  filename
}: {
  userInput?: UserInput | null;
  reading: TarotReading;
  question?: string;
  filename?: string;
}) => {
  const userName = userInput?.name || 'Странник';

  const container = document.createElement('div');
  container.id = 'pdf-tarot-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '820px';
  container.style.backgroundColor = '#050710';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #b48811; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #0e1224 0%, #05070e 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
      <div style="position: absolute; top: 14px; left: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; top: 14px; right: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; bottom: 14px; left: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; bottom: 14px; right: 16px; color: #ffd700; font-size: 18px;">✦</div>

      <!-- Header -->
      <div style="text-align: center; border-bottom: 1px solid rgba(255, 215, 0, 0.25); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #ffd700, #b48811); color: #000; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(255,215,0,0.45);">C</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 28px; color: #ffd700; letter-spacing: 4px; margin: 0; text-transform: uppercase;">САКРАЛЬНЫЙ РАСКЛАД ТАРО</h1>
        <p style="font-size: 12px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">Откровение Арканов • Chubuk Matrix System</p>
      </div>

      <!-- Seeker Profile -->
      <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 14px; padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block;">Вопрошающий</span>
          <span style="font-size: 18px; color: #ffffff; font-weight: bold;">${userName}</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block;">Дата Расклада</span>
          <span style="font-size: 14px; color: #ffd700;">${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      ${question ? `
        <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 14px; padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 4px;">Вопрос к Таро</div>
          <div style="font-size: 14px; color: #ffffff; font-style: italic;">"${question}"</div>
        </div>
      ` : ''}

      <!-- Cards Grid -->
      <div style="margin-bottom: 24px;">
        <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #ffd700; margin-bottom: 12px; letter-spacing: 1.5px;">◈ ВЫПАВШИЕ АРКАНЫ</div>
        <div style="display: grid; grid-template-columns: repeat(${reading.cards.length}, 1fr); gap: 14px;">
          ${reading.cards.map((c, i) => `
            <div style="background: linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(0,0,0,0.6) 100%); border: 2px solid rgba(255,215,0,0.35); border-radius: 16px; padding: 18px 12px; text-align: center;">
              <div style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Позиция ${i + 1}</div>
              <div style="font-size: 28px; margin-bottom: 8px;">🎴</div>
              <div style="font-family: 'Cinzel', serif; font-size: 14px; font-weight: bold; color: #ffffff;">${c.name}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Interpretation -->
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 14px; padding: 20px; margin-bottom: 20px;">
        <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: #ffd700; margin: 0 0 10px 0;">◈ ТОЛКОВАНИЕ РАСКЛАДА</h3>
        <p style="font-size: 13px; line-height: 1.75; color: #f1f5f9; margin: 0;">${reading.interpretation}</p>
      </div>

      <!-- TimeFrame if available -->
      ${reading.timeFrame ? `
        <div style="background: rgba(147, 51, 234, 0.08); border: 1px solid rgba(147, 51, 234, 0.3); border-radius: 14px; padding: 16px; margin-bottom: 20px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #c084fc; margin-bottom: 4px;">⏳ СРОКИ И ВРЕМЕННОЙ ГОРИЗОНТ</div>
          <p style="font-size: 12px; color: #e2e8f0; margin: 0;">${reading.timeFrame}</p>
        </div>
      ` : ''}

      <!-- Advice -->
      <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(16, 20, 38, 0.9) 100%); border: 2px solid rgba(255, 215, 0, 0.45); border-radius: 16px; padding: 20px; text-align: center;">
        <span style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 8px;">
          ✦ СОВЕТ ВЫСШИХ АРКАНОВ ✦
        </span>
        <p style="font-family: 'Cinzel', serif; font-size: 14px; font-style: italic; color: #ffffff; margin: 0; line-height: 1.6;">
          "${reading.advice}"
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(255, 215, 0, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Сакральное Таро</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050710',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Расклад_Таро_${userName}_${new Date().toISOString().split('T')[0]}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Tarot PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportHoraryPdf = async ({
  userInput,
  result,
  filename
}: {
  userInput?: UserInput | null;
  result: HoraryResult;
  filename?: string;
}) => {
  const userName = userInput?.name || 'Странник';

  const container = document.createElement('div');
  container.id = 'pdf-horary-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '820px';
  container.style.backgroundColor = '#050710';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #b48811; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #0e1224 0%, #05070e 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
      <div style="position: absolute; top: 14px; left: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; top: 14px; right: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; bottom: 14px; left: 16px; color: #ffd700; font-size: 18px;">✦</div>
      <div style="position: absolute; bottom: 14px; right: 16px; color: #ffd700; font-size: 18px;">✦</div>

      <!-- Header -->
      <div style="text-align: center; border-bottom: 1px solid rgba(255, 215, 0, 0.25); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #ffd700, #b48811); color: #000; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(255,215,0,0.45);">C</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 28px; color: #ffd700; letter-spacing: 4px; margin: 0; text-transform: uppercase;">САКРАЛЬНЫЙ ОТВЕТ СУДЬБЫ</h1>
        <p style="font-size: 12px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">Хорарный Оракул и Развилки Будущего • Chubuk Matrix</p>
      </div>

      <!-- Question & Meta Box -->
      <div style="background: rgba(255, 215, 0, 0.08); border: 1px solid rgba(255, 215, 0, 0.35); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 11px; color: #ffd700; text-transform: uppercase; letter-spacing: 1px;">
          <span>Странник: ${userName}</span>
          <span>Час вопроса: ${new Date(result.timestamp || Date.now()).toLocaleString('ru-RU')}</span>
        </div>
        <div style="font-family: 'Cinzel', serif; font-size: 18px; color: #ffffff; font-weight: bold; line-height: 1.5;">
          "${result.question}"
        </div>
      </div>

      <!-- Verdict Banner with Probability -->
      <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(20, 24, 48, 0.95) 100%); border: 2px solid rgba(255, 215, 0, 0.45); border-radius: 18px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 11px; color: #ffd700; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin-bottom: 8px;">
          ВЕРДИКТ ОРАКУЛА СУДЬБЫ
        </div>
        <div style="font-family: 'Cinzel', serif; font-size: 24px; color: #ffd700; font-weight: 800; margin-bottom: 12px;">
          ${result.answer}
        </div>
        ${result.probability !== undefined ? `
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,215,0,0.3); border-radius: 20px; font-size: 13px; color: #ffffff; font-weight: bold;">
            <span>⚡ Вероятность свершения:</span>
            <span style="color: #ffd700; font-size: 16px;">${result.probability}%</span>
          </div>
        ` : ''}
      </div>

      <!-- Timing & Ruling Energy Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: rgba(147, 51, 234, 0.08); border: 1px solid rgba(147, 51, 234, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #c084fc; margin-bottom: 6px;">⏳ ВРЕМЕННОЙ ГОРИЗОНТ</div>
          <p style="font-size: 12px; color: #e2e8f0; margin: 0; line-height: 1.6;">${result.timing || 'В ближайший лунный цикл'}</p>
        </div>
        <div style="background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #fde047; margin-bottom: 6px;">🪐 ПРАВЯЩАЯ ЭНЕРГИЯ ЧАСА</div>
          <p style="font-size: 12px; color: #e2e8f0; margin: 0; line-height: 1.6;">${result.rulingPlanetOrArcana || 'Аспекты гармонии'}</p>
        </div>
      </div>

      <!-- Favorable Conditions: ЕСЛИ БУДЕТ... -->
      ${result.favorableConditions ? `
        <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 14px; padding: 18px; margin-bottom: 20px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #4ade80; margin-bottom: 6px; font-weight: bold; display: flex; align-items: center; gap: 6px;">
            <span>🌱</span> «ЕСЛИ БУДЕТ...» — САХРАЛЬНЫЕ УСЛОВИЯ УСПЕХА
          </div>
          <p style="font-size: 12.5px; line-height: 1.7; color: #f0fdf4; margin: 0;">${result.favorableConditions}</p>
        </div>
      ` : ''}

      <!-- Risks & Warnings -->
      ${result.risksAndWarnings ? `
        <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 14px; padding: 18px; margin-bottom: 20px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #f87171; margin-bottom: 6px; font-weight: bold; display: flex; align-items: center; gap: 6px;">
            <span>⚠️</span> КАРМИЧЕСКИЕ ЛОВУШКИ И ЧЕГО ИЗБЕГАТЬ
          </div>
          <p style="font-size: 12.5px; line-height: 1.7; color: #fef2f2; margin: 0;">${result.risksAndWarnings}</p>
        </div>
      ` : ''}

      <!-- Deep Interpretation -->
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 14px; padding: 20px; margin-bottom: 20px;">
        <h3 style="font-family: 'Cinzel', serif; font-size: 14px; color: #ffd700; margin: 0 0 8px 0;">◈ ГЛУБОКОЕ ТОЛКОВАНИЕ СУДЬБЫ</h3>
        <p style="font-size: 13px; line-height: 1.75; color: #f1f5f9; margin: 0;">${result.explanation}</p>
      </div>

      <!-- Advice & Affirmation -->
      <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(16, 20, 38, 0.9) 100%); border: 2px solid rgba(255, 215, 0, 0.45); border-radius: 16px; padding: 20px; text-align: center;">
        <span style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 6px;">
          ✦ ПРАКТИЧЕСКИЙ СОВЕТ СУДЬБЫ ✦
        </span>
        <p style="font-size: 13.5px; color: #ffffff; margin: 0 0 10px 0; line-height: 1.6;">${result.advice}</p>
        ${result.affirmation ? `
          <div style="font-family: 'Cinzel', serif; font-size: 13px; font-style: italic; color: #ffd700; border-top: 1px solid rgba(255,215,0,0.2); padding-top: 10px; margin-top: 10px;">
            "${result.affirmation}"
          </div>
        ` : ''}
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(255, 215, 0, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Вопрос Судьбе и Хорар</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050710',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Ответ_Судьбы_${userName}_${new Date().toISOString().split('T')[0]}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Horary PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportCalculationsToPdf = (calculations: SavedCalculation[]) => {
  const doc = new jsPDF();
  let y = 10;

  calculations.forEach((calc, index) => {
    if (index > 0) {
      doc.addPage();
      y = 10;
    }
    
    doc.setFontSize(18);
    doc.setTextColor(180, 130, 0);
    doc.text(`Матрица Судьбы: ${calc.input.name}`, 10, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Дата расчета: ${new Date(calc.timestamp).toLocaleString('ru-RU')}`, 10, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Дата рождения: ${calc.input.birthDate}`, 10, y);
    y += 10;
    
    if (calc.analysis) {
      doc.setFontSize(14);
      doc.text("Введение:", 10, y);
      y += 7;
      doc.setFontSize(10);
      const introLines = doc.splitTextToSize(calc.analysis.introduction, 180);
      doc.text(introLines, 10, y);
      y += introLines.length * 5 + 5;

      calc.analysis.sections.forEach(section => {
        if (y > 260) {
          doc.addPage();
          y = 10;
        }
        doc.setFontSize(12);
        doc.text(section.title, 10, y);
        y += 7;
        doc.setFontSize(10);
        const contentLines = doc.splitTextToSize(section.content, 180);
        doc.text(contentLines, 10, y);
        y += contentLines.length * 5 + 7;
      });
    }

    if (calc.astrologyResult) {
      if (y > 250) {
        doc.addPage();
        y = 10;
      }
      doc.setFontSize(14);
      doc.text("Астрологический прогноз:", 10, y);
      y += 10;
      doc.setFontSize(10);
      const astroLines = doc.splitTextToSize(calc.astrologyResult.introduction, 180);
      doc.text(astroLines, 10, y);
      y += astroLines.length * 5 + 5;
    }

    if (calc.horaryResult) {
      if (y > 240) {
        doc.addPage();
        y = 10;
      }
      doc.setFontSize(14);
      doc.setTextColor(180, 130, 0);
      doc.text("Вопрос Судьбе (Хорар):", 10, y);
      y += 7;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Вопрос: «${calc.horaryResult.question}»`, 10, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(`Вердикт: ${calc.horaryResult.answer} ${calc.horaryResult.probability ? `(${calc.horaryResult.probability}%)` : ''}`, 10, y);
      y += 6;
      if (calc.horaryResult.timing) {
        doc.text(`Сроки: ${calc.horaryResult.timing}`, 10, y);
        y += 6;
      }
      const horaryExp = doc.splitTextToSize(calc.horaryResult.explanation, 180);
      doc.text(horaryExp, 10, y);
      y += horaryExp.length * 5 + 5;
    }

    if (calc.tarotReading) {
      if (y > 240) {
        doc.addPage();
        y = 10;
      }
      doc.setFontSize(14);
      doc.setTextColor(180, 130, 0);
      doc.text("Расклад Таро:", 10, y);
      y += 7;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const tarotLines = doc.splitTextToSize(calc.tarotReading.interpretation, 180);
      doc.text(tarotLines, 10, y);
      y += tarotLines.length * 5 + 5;
    }

    if (calc.compatibilityResult) {
      if (y > 240) {
        doc.addPage();
        y = 10;
      }
      doc.setFontSize(14);
      doc.setTextColor(180, 130, 0);
      doc.text("Совместимость союза:", 10, y);
      y += 7;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const compIntro = calc.compatibilityResult.introduction || calc.compatibilityResult.advice;
      const compLines = doc.splitTextToSize(compIntro, 180);
      doc.text(compLines, 10, y);
      y += compLines.length * 5 + 5;
    }
  });

  doc.save(`chubuk_history_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportIdealToxicRadarPdf = async ({
  userInput,
  radar,
  filename
}: {
  userInput?: UserInput | null;
  radar: IdealAndToxicPartnersProfile;
  filename?: string;
}) => {
  const userName = userInput?.name || 'Странник';

  const container = document.createElement('div');
  container.id = 'pdf-radar-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '840px';
  container.style.backgroundColor = '#050710';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #b48811; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #0e1224 0%, #05070e 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 1px solid rgba(255, 215, 0, 0.25); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #ffd700, #b48811); color: #000; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(255,215,0,0.45);">C</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 26px; color: #ffd700; letter-spacing: 3px; margin: 0; text-transform: uppercase;">КАРМИЧЕСКИЙ РАДАР ПАРТНЕРОВ</h1>
        <p style="font-size: 12px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">
          С кем жить в гармонии • С кем категорически нельзя • Для: ${userName}
        </p>
      </div>

      <!-- User Box -->
      <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 14px; padding: 14px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block;">Искатель</span>
          <span style="font-size: 17px; color: #ffffff; font-weight: bold;">${userName} (${userInput?.birthDate || ''})</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #b48811; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block;">Дата Расчета</span>
          <span style="font-size: 13px; color: #ffd700;">${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <!-- Two Main Zones Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <!-- IDEAL ZONE -->
        <div style="background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.35); border-radius: 16px; padding: 18px;">
          <div style="font-family: 'Cinzel', serif; font-size: 14px; font-weight: bold; color: #4ade80; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid rgba(34,197,94,0.2); padding-bottom: 6px;">
            💚 С КЕМ ЖИТЬ В ГАРМОНИИ
          </div>
          
          <div style="margin-bottom: 12px;">
            <span style="font-size: 10px; color: #86efac; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block; margin-bottom: 6px;">Идеальные Арканы Матрицы:</span>
            ${radar.idealPartners.matrixArcanas.map(a => `
              <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px; margin-bottom: 6px; border: 1px solid rgba(34,197,94,0.15);">
                <span style="font-weight: bold; color: #ffffff; font-size: 11px;">#${a.arcana} ${a.title}</span>
                <p style="font-size: 10px; color: #cbd5e1; margin: 3px 0 0 0; line-height: 1.4;">${a.why}</p>
              </div>
            `).join('')}
          </div>

          <div style="margin-bottom: 12px;">
            <span style="font-size: 10px; color: #86efac; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block; margin-bottom: 4px;">Гармоничные Знаки:</span>
            <div style="font-size: 11px; color: #e2e8f0;">
              ${radar.idealPartners.zodiacSigns.map(z => `• <strong>${z.sign}</strong> (${z.element}): ${z.synergy}`).join('<br>')}
            </div>
          </div>

          <div style="margin-bottom: 10px; font-size: 11px; color: #e2e8f0; line-height: 1.5; background: rgba(0,0,0,0.25); padding: 10px; border-radius: 8px;">
            <strong style="color: #4ade80; display: block; margin-bottom: 3px;">Портрет идеального спутника:</strong>
            ${radar.idealPartners.psychologicalPortrait}
          </div>
        </div>

        <!-- TOXIC ZONE -->
        <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 16px; padding: 18px;">
          <div style="font-family: 'Cinzel', serif; font-size: 14px; font-weight: bold; color: #f87171; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid rgba(239,68,68,0.2); padding-bottom: 6px;">
            ⛔ С КЕМ КАТЕГОРИЧЕСКИ НЕЛЬЗЯ
          </div>

          <div style="margin-bottom: 12px;">
            <span style="font-size: 10px; color: #fca5a5; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block; margin-bottom: 6px;">Опасные Арканы (Диссонанс):</span>
            ${radar.toxicPartners.forbiddenArcanas.map(a => `
              <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px; margin-bottom: 6px; border: 1px solid rgba(239,68,68,0.15);">
                <span style="font-weight: bold; color: #ffffff; font-size: 11px;">#${a.arcana} ${a.title}</span>
                <p style="font-size: 10px; color: #fca5a5; margin: 3px 0 0 0; line-height: 1.4;">${a.danger}</p>
              </div>
            `).join('')}
          </div>

          <div style="margin-bottom: 12px;">
            <span style="font-size: 10px; color: #fca5a5; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block; margin-bottom: 4px;">Конфликтные Знаки:</span>
            <div style="font-size: 11px; color: #e2e8f0;">
              ${radar.toxicPartners.discordantZodiacs.map(z => `• <strong>${z.sign}</strong>: ${z.warning}`).join('<br>')}
            </div>
          </div>

          <div style="margin-bottom: 10px; font-size: 11px; color: #fca5a5; line-height: 1.5; background: rgba(0,0,0,0.25); padding: 10px; border-radius: 8px;">
            <strong style="color: #f87171; display: block; margin-bottom: 3px;">Почему совместная жизнь невозможна:</strong>
            ${radar.toxicPartners.whyCategoricallyNo}
          </div>
        </div>
      </div>

      <!-- Red Flags & Pillars Summary -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; font-size: 11px;">
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(34,197,94,0.2); border-radius: 12px; padding: 12px;">
          <strong style="color: #4ade80; display: block; margin-bottom: 6px;">🗝 3 Опоры крепкого союза:</strong>
          ${radar.idealPartners.relationshipPillars.map(p => `• ${p}`).join('<br>')}
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 12px;">
          <strong style="color: #f87171; display: block; margin-bottom: 6px;">🚩 Красные флаги для совместного быта:</strong>
          ${radar.toxicPartners.redFlags.map(rf => `• ${rf}`).join('<br>')}
        </div>
      </div>

      <!-- Wisdom Summary -->
      <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(16, 20, 38, 0.9) 100%); border: 2px solid rgba(255, 215, 0, 0.45); border-radius: 16px; padding: 20px; text-align: center;">
        <span style="font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 8px;">
          ✦ НАПУТСТВИЕ СТАРЦА О ВЫБОРЕ СПУТНИКА ✦
        </span>
        <p style="font-family: 'Cinzel', serif; font-size: 14px; font-style: italic; color: #ffffff; margin: 0; line-height: 1.6;">
          "${radar.wisdomSummary}"
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(255, 215, 0, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Кармический Радар Совместимости</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050710',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Кармический_Радар_Партнеров_${userName}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Radar PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportCurrentAnalysisToPdf = async (
  elementIdOrInput: any,
  matrixOrFilename?: any,
  astrology?: any,
  analysis?: any,
  filename?: string,
  dailyForecast?: DailyMysticalForecast | null
) => {
  if (typeof elementIdOrInput === 'string' && (!analysis || typeof matrixOrFilename === 'string')) {
    const elementId = elementIdOrInput;
    const file = typeof matrixOrFilename === 'string' ? matrixOrFilename : 'matrix_analysis';
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const canvas = await html2canvas(element, { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: '#000000',
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${file}.pdf`);
  } else {
    const userInput = elementIdOrInput;
    const matrix = matrixOrFilename;
    await exportStylizedMatrixPdf({
      userInput,
      matrix,
      astrology,
      analysis,
      dailyForecast,
      filename: filename || `Сакральный_Манускрипт_${userInput?.name?.replace(/\s+/g, '_') || 'матрица'}`
    });
  }
};

export const exportAncestralLineagePdf = async ({
  userInput,
  matrix,
  lineage,
  filename
}: {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
  lineage: AncestralTreeAnalysis;
  filename?: string;
}) => {
  const userName = userInput?.name || 'Странник';
  const fatherMale = lineage.lines.find(l => l.side === 'father_male') || lineage.lines[0];
  const fatherFemale = lineage.lines.find(l => l.side === 'father_female') || lineage.lines[1];
  const motherMale = lineage.lines.find(l => l.side === 'mother_male') || lineage.lines[2];
  const motherFemale = lineage.lines.find(l => l.side === 'mother_female') || lineage.lines[3];

  const container = document.createElement('div');
  container.id = 'pdf-ancestral-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '840px';
  container.style.backgroundColor = '#050710';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #9333ea; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #130e24 0%, #05070e 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
      <div style="text-align: center; border-bottom: 1px solid rgba(168, 85, 247, 0.3); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #a855f7, #6b21a8); color: #fff; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(168,85,247,0.45);">👑</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 26px; color: #e9d5ff; letter-spacing: 3px; margin: 0; text-transform: uppercase;">САКРАЛЬНОЕ ДРЕВО И РОДОВЫЕ ПРОГРАММЫ</h1>
        <p style="font-size: 12px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">
          Сила 7 Поколений • 4 Линии Рода • Для: ${userName}
        </p>
      </div>

      <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 14px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 10px; color: #c084fc; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block;">Искатель</span>
          <span style="font-size: 17px; color: #ffffff; font-weight: bold;">${userName} (${userInput?.birthDate || ''})</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #c084fc; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block;">Резонанс Рода</span>
          <span style="font-size: 14px; color: #ffd700; font-weight: bold;">${lineage.overallKarmaScore}% • ${lineage.dominantAncestralArchetype}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: rgba(147, 51, 234, 0.08); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #c084fc; font-weight: bold; margin-bottom: 6px;">👑 ${fatherMale.title} (#${fatherMale.keyArcana})</div>
          <p style="font-size: 11.5px; color: #e2e8f0; margin: 0 0 6px 0;"><strong>Дар предков:</strong> ${fatherMale.generationalGift}</p>
          <p style="font-size: 11.5px; color: #fca5a5; margin: 0 0 6px 0;"><strong>Родовой узел:</strong> ${fatherMale.karmicLesson}</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;"><strong>Ключевое действие:</strong> ${fatherMale.actionStep}</p>
        </div>

        <div style="background: rgba(147, 51, 234, 0.08); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #c084fc; font-weight: bold; margin-bottom: 6px;">🌸 ${fatherFemale.title} (#${fatherFemale.keyArcana})</div>
          <p style="font-size: 11.5px; color: #e2e8f0; margin: 0 0 6px 0;"><strong>Дар предков:</strong> ${fatherFemale.generationalGift}</p>
          <p style="font-size: 11.5px; color: #fca5a5; margin: 0 0 6px 0;"><strong>Родовой узел:</strong> ${fatherFemale.karmicLesson}</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;"><strong>Ключевое действие:</strong> ${fatherFemale.actionStep}</p>
        </div>

        <div style="background: rgba(147, 51, 234, 0.08); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #c084fc; font-weight: bold; margin-bottom: 6px;">⚡ ${motherMale.title} (#${motherMale.keyArcana})</div>
          <p style="font-size: 11.5px; color: #e2e8f0; margin: 0 0 6px 0;"><strong>Дар предков:</strong> ${motherMale.generationalGift}</p>
          <p style="font-size: 11.5px; color: #fca5a5; margin: 0 0 6px 0;"><strong>Родовой узел:</strong> ${motherMale.karmicLesson}</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;"><strong>Ключевое действие:</strong> ${motherMale.actionStep}</p>
        </div>

        <div style="background: rgba(147, 51, 234, 0.08); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #c084fc; font-weight: bold; margin-bottom: 6px;">🕊 ${motherFemale.title} (#${motherFemale.keyArcana})</div>
          <p style="font-size: 11.5px; color: #e2e8f0; margin: 0 0 6px 0;"><strong>Дар предков:</strong> ${motherFemale.generationalGift}</p>
          <p style="font-size: 11.5px; color: #fca5a5; margin: 0 0 6px 0;"><strong>Родовой узел:</strong> ${motherFemale.karmicLesson}</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;"><strong>Ключевое действие:</strong> ${motherFemale.actionStep}</p>
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(168,85,247,0.25); border-radius: 14px; padding: 16px; margin-bottom: 20px;">
        <strong style="color: #ffd700; font-size: 13px; display: block; margin-bottom: 6px;">🌟 Благословение и Сила Рода:</strong>
        <p style="font-size: 11.5px; color: #cbd5e1; line-height: 1.6; margin: 0 0 8px 0;">${lineage.lineageBlessing}</p>
        <p style="font-size: 11px; color: #fca5a5; margin: 0;"><strong>Родовая проработка:</strong> ${lineage.unresolvedGenerationalLoop}</p>
      </div>

      <div style="background: linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(16, 20, 38, 0.9) 100%); border: 2px solid rgba(168, 85, 247, 0.5); border-radius: 16px; padding: 20px; text-align: center;">
        <span style="font-size: 10px; color: #c084fc; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 8px;">
          ✦ САКРАЛЬНЫЙ РИТУАЛ ИСЦЕЛЕНИЯ РОДА ✦
        </span>
        <p style="font-family: 'Cinzel', serif; font-size: 14px; font-style: italic; color: #ffffff; margin: 0; line-height: 1.6;">
          "${lineage.ancestralHealingRitual}"
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid rgba(168, 85, 247, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Родовые Программы и Сила Рода</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050710',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Родовые_Программы_${userName}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Ancestral PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportLithotherapyPdf = async ({
  userInput,
  profile,
  filename
}: {
  userInput?: UserInput | null;
  profile: LithotherapyProfile;
  filename?: string;
}) => {
  const userName = userInput?.name || 'Странник';

  const container = document.createElement('div');
  container.id = 'pdf-litho-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '840px';
  container.style.backgroundColor = '#050710';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  const primaryStone = profile.primaryStones[0] || { name: 'Аметист', arcanaConnection: 10, properties: 'Гармония разума и духа', whoShouldWear: 'Для баланса', activationMethod: 'Лунный свет', cleansingMethod: 'Проточная вода' };
  const wealthStone = profile.wealthStones[0] || { name: 'Пирит', properties: 'Привлечение богатства и изобилия', whoShouldWear: 'Для бизнеса и сделок' };
  const loveStone = profile.loveStones[0] || { name: 'Розовый кварц', properties: 'Открытие анахаты и сердечное тепло', whoShouldWear: 'Для гармонии в любви' };
  const protectionStone = profile.protectionStones[0] || { name: 'Черный турмалин (Шерл)', properties: 'Мощный щит от зависти и сглаза', whoShouldWear: 'Для защиты биополя' };

  container.innerHTML = `
    <div style="border: 2px solid #3b82f6; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #0d172e 0%, #05070e 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
      <div style="text-align: center; border-bottom: 1px solid rgba(59, 130, 246, 0.3); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #60a5fa, #1d4ed8); color: #fff; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(59,130,246,0.45);">💎</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 26px; color: #bfdbfe; letter-spacing: 3px; margin: 0; text-transform: uppercase;">САКРАЛЬНЫЕ КАМНИ И ЛИТОТЕРАПИЯ</h1>
        <p style="font-size: 12px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">
          Энергия Минералов • Кристаллы-Талисманы • Для: ${userName}
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #60a5fa; font-weight: bold; margin-bottom: 6px;">💎 ${primaryStone.name}</div>
          <span style="font-size: 10px; color: #ffd700; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">Главный Камень Души (Аркан #${primaryStone.arcanaConnection})</span>
          <p style="font-size: 11.5px; color: #e2e8f0; margin: 0 0 6px 0;">${primaryStone.properties}</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;"><strong>Кому носить:</strong> ${primaryStone.whoShouldWear}</p>
        </div>

        <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #4ade80; font-weight: bold; margin-bottom: 6px;">💰 ${wealthStone.name}</div>
          <span style="font-size: 10px; color: #86efac; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">Денежный Магнит и Канал Изобилия</span>
          <p style="font-size: 11.5px; color: #e2e8f0; margin: 0 0 6px 0;">${wealthStone.properties}</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;"><strong>Кому носить:</strong> ${wealthStone.whoShouldWear}</p>
        </div>

        <div style="background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #fb7185; font-weight: bold; margin-bottom: 6px;">💖 ${loveStone.name}</div>
          <span style="font-size: 10px; color: #fda4af; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">Любовный Талисман и Сердечная Чакра</span>
          <p style="font-size: 11.5px; color: #e2e8f0; margin: 0 0 6px 0;">${loveStone.properties}</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;"><strong>Кому носить:</strong> ${loveStone.whoShouldWear}</p>
        </div>

        <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 14px; color: #c084fc; font-weight: bold; margin-bottom: 6px;">🛡️ ${protectionStone.name}</div>
          <span style="font-size: 10px; color: #d8b4fe; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">Оберег и Защита Биополя</span>
          <p style="font-size: 11.5px; color: #e2e8f0; margin: 0 0 6px 0;">${protectionStone.properties}</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;"><strong>Кому носить:</strong> ${protectionStone.whoShouldWear}</p>
        </div>
      </div>

      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 14px; padding: 16px; margin-bottom: 20px;">
        <div style="font-size: 12px; color: #cbd5e1; line-height: 1.6;">
          <strong style="color: #93c5fd;">◈ Активация:</strong> ${primaryStone.activationMethod} &nbsp;|&nbsp; 
          <strong style="color: #93c5fd;">◈ Очищение:</strong> ${primaryStone.cleansingMethod}
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid rgba(59, 130, 246, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Сакральная Литотерапия</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050710',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Литотерапия_Талисманы_${userName}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Lithotherapy PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportLunarCalendarPdf = async ({
  lunarInfo,
  targetDate,
  filename
}: {
  lunarInfo: LunarDayInfo;
  targetDate?: string;
  filename?: string;
}) => {
  const container = document.createElement('div');
  container.id = 'pdf-lunar-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '840px';
  container.style.backgroundColor = '#050710';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #eab308; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #1a1708 0%, #05070e 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
      <div style="text-align: center; border-bottom: 1px solid rgba(234, 179, 8, 0.3); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #fde047, #ca8a04); color: #000; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(234,179,8,0.45);">🌙</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 26px; color: #fef08a; letter-spacing: 3px; margin: 0; text-transform: uppercase;">САКРАЛЬНЫЙ ЛУННЫЙ КАЛЕНДАРЬ</h1>
        <p style="font-size: 12px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">
          ${lunarInfo.lunarDay}-й Лунный День (${lunarInfo.symbol}) • ${targetDate || new Date().toLocaleDateString('ru-RU')}
        </p>
      </div>

      <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 14px; padding: 16px 20px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center;">
        <div>
          <span style="font-size: 10px; color: #fde047; text-transform: uppercase; font-weight: bold; display: block;">Фаза Луны</span>
          <span style="font-size: 15px; color: #ffffff; font-weight: bold;">${lunarInfo.phaseName}</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #fde047; text-transform: uppercase; font-weight: bold; display: block;">Знак Зодиака</span>
          <span style="font-size: 15px; color: #ffffff; font-weight: bold;">${lunarInfo.zodiacSign}</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #fde047; text-transform: uppercase; font-weight: bold; display: block;">Освещенность</span>
          <span style="font-size: 15px; color: #ffd700; font-weight: bold;">${lunarInfo.illuminationPercentage}%</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #fde047; text-transform: uppercase; font-weight: bold; display: block;">Символ Дня</span>
          <span style="font-size: 15px; color: #ffffff; font-weight: bold;">${lunarInfo.sacredSymbol}</span>
        </div>
      </div>

      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(234, 179, 8, 0.25); border-radius: 14px; padding: 18px; margin-bottom: 20px;">
        <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: #ffd700; margin: 0 0 8px 0;">◈ МИСТИЧЕСКОЕ ОПИСАНИЕ СУТОК</h3>
        <p style="font-size: 12.5px; line-height: 1.7; color: #f1f5f9; margin: 0;">${lunarInfo.generalVibe}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #4ade80; font-weight: bold; margin-bottom: 8px;">✅ БЛАГОПРИЯТНЫЕ СФЕРЫ</div>
          <div style="font-size: 11.5px; color: #e2e8f0; line-height: 1.6;">
            ${lunarInfo.favorableActivities.map(f => `• ${f}`).join('<br>')}
          </div>
        </div>

        <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #f87171; font-weight: bold; margin-bottom: 8px;">⛔ НЕЖЕЛАТЕЛЬНО И ОПАСНО</div>
          <div style="font-size: 11.5px; color: #e2e8f0; line-height: 1.6;">
            ${lunarInfo.unfavorableActivities.map(u => `• ${u}`).join('<br>')}
          </div>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(16, 20, 38, 0.9) 100%); border: 2px solid rgba(234, 179, 8, 0.45); border-radius: 16px; padding: 20px; text-align: center;">
        <span style="font-size: 10px; color: #fde047; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 8px;">
          ✦ ПРАКТИКА И СОВЕТ ЛУННЫХ СУТОК ✦
        </span>
        <p style="font-family: 'Cinzel', serif; font-size: 13.5px; font-style: italic; color: #ffffff; margin: 0 0 6px 0; line-height: 1.6;">
          "${lunarInfo.affirmation}"
        </p>
        <p style="font-size: 11px; color: #cbd5e1; margin: 0;">
          <strong>Здоровье и детокс:</strong> ${lunarInfo.healthAndDetoxAdvice}
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid rgba(234, 179, 8, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Лунные Ритмы и Астрология</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050710',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Лунный_Календарь_${lunarInfo.lunarDay}_день`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Lunar PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportElectiveDatesPdf = async ({
  userInput,
  category,
  queryResult,
  filename
}: {
  userInput?: UserInput | null;
  category: string;
  queryResult: BestDatesQueryResult;
  filename?: string;
}) => {
  const userName = userInput?.name || 'Странник';

  const container = document.createElement('div');
  container.id = 'pdf-elective-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '840px';
  container.style.backgroundColor = '#050710';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #ffd700; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #151206 0%, #05070e 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
      <div style="text-align: center; border-bottom: 1px solid rgba(255, 215, 0, 0.3); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #ffd700, #b48811); color: #000; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(255,215,0,0.45);">⭐</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 26px; color: #ffd700; letter-spacing: 3px; margin: 0; text-transform: uppercase;">ЭЛЕКТИВНЫЙ ПОДБОР ЗОЛОТЫХ ДАТ</h1>
        <p style="font-size: 12px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">
          ${queryResult.goalTitle} • Для: ${userName}
        </p>
      </div>

      <div style="background: rgba(255, 215, 0, 0.05); border: 1px solid rgba(255, 215, 0, 0.25); border-radius: 14px; padding: 16px; margin-bottom: 20px;">
        <strong style="color: #ffd700; font-size: 13px; display: block; margin-bottom: 4px;">◈ Сакральная Стратегия Выбора:</strong>
        <p style="font-size: 12px; line-height: 1.65; color: #e2e8f0; margin: 0;">${queryResult.generalStrategy}</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
        ${queryResult.topDates.map(d => `
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 14px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                <strong style="font-family: 'Cinzel', serif; font-size: 15px; color: #ffd700;">${d.formattedDate}</strong>
                <span style="font-size: 11px; color: #c084fc;">(Аркан #${d.dayArcana}, Луна в знаке ${d.moonSign})</span>
              </div>
              <p style="font-size: 11.5px; color: #cbd5e1; margin: 0;">${d.summary}</p>
              <div style="font-size: 10.5px; color: #94a3b8; margin-top: 3px;"><strong>Золотые часы:</strong> ${d.goldenHourTip}</div>
            </div>
            <div style="text-align: right; margin-left: 16px;">
              <span style="display: inline-block; background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.4); font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px;">
                ${d.score}% Гармонии
              </span>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="text-align: center; border-top: 1px solid rgba(255, 215, 0, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Элективная Астрология и Выбор Времени</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050710',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Благоприятные_Даты_${userName}_${category}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Elective PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportCitiesOfPowerPdf = async ({
  userInput,
  profile,
  filename
}: {
  userInput?: UserInput | null;
  profile: CityPowerProfile;
  filename?: string;
}) => {
  const userName = userInput?.name || 'Странник';

  const container = document.createElement('div');
  container.id = 'pdf-city-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '840px';
  container.style.backgroundColor = '#050710';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #10b981; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #091f18 0%, #05070e 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
      <div style="text-align: center; border-bottom: 1px solid rgba(16, 185, 129, 0.3); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #34d399, #059669); color: #000; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(16,185,129,0.45);">🌍</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 26px; color: #a7f3d0; letter-spacing: 3px; margin: 0; text-transform: uppercase;">ГОРОДА СИЛЫ И АСТРОКАРТОГРАФИЯ</h1>
        <p style="font-size: 12px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">
          Энергетический Резонанс • ${profile.cityName}, ${profile.country} • Для: ${userName}
        </p>
      </div>

      <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 18px 24px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 10px; color: #34d399; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block;">Город Резонанса</span>
          <span style="font-size: 20px; color: #ffffff; font-weight: bold;">${profile.cityName} (${profile.country})</span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 10px; color: #34d399; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block;">Уровень Синергии</span>
          <span style="font-size: 22px; color: #ffd700; font-weight: 800;">${profile.compatibilityScore}%</span>
        </div>
      </div>

      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 14px; padding: 18px; margin-bottom: 20px;">
        <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: #34d399; margin: 0 0 8px 0;">◈ ЭНЕРГЕТИЧЕСКИЙ ПРОФИЛЬ ЛОКАЦИИ</h3>
        <p style="font-size: 13px; line-height: 1.7; color: #f1f5f9; margin: 0;">${profile.bestPurposeForVisit}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #34d399; font-weight: bold; margin-bottom: 8px;">✨ ВЕКТОРЫ ПРОЦВЕТАНИЯ</div>
          <div style="font-size: 11.5px; color: #e2e8f0; line-height: 1.6;">
            <strong>Финансы:</strong> ${profile.wealthImpact}<br><br>
            <strong>Карьера:</strong> ${profile.careerImpact}
          </div>
        </div>

        <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #f87171; font-weight: bold; margin-bottom: 8px;">⚠️ ПОДВОДНЫЕ КАМНИ И ПРЕДОСТЕРЕЖЕНИЯ</div>
          <div style="font-size: 11.5px; color: #e2e8f0; line-height: 1.6;">
            <strong>Любовь и эмоции:</strong> ${profile.loveImpact}<br><br>
            <strong>Предостережение:</strong> ${profile.energyWarning}
          </div>
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid rgba(16, 185, 129, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Астрокартография и Города Силы</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050710',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Город_Силы_${profile.cityName}_${userName}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating City PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export interface DreamInterpretationPdfData {
  interpretation: string;
  keySymbols: string[];
  warning: string;
  actionableAdvice: string;
  arcanaConnection: number;
  archetype: string;
  isProphetic: boolean;
}

export const exportDreamOraclePdf = async ({
  userInput,
  dreamText,
  result,
  filename
}: {
  userInput?: UserInput | null;
  dreamText: string;
  result: DreamInterpretationPdfData | any;
  filename?: string;
}) => {
  const userName = userInput?.name || 'Странник';

  const container = document.createElement('div');
  container.id = 'pdf-dream-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '840px';
  container.style.backgroundColor = '#050710';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #6366f1; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #11142e 0%, #05070e 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
      <div style="text-align: center; border-bottom: 1px solid rgba(99, 102, 241, 0.3); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #818cf8, #4338ca); color: #fff; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(99,102,241,0.45);">🌌</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 26px; color: #c7d2fe; letter-spacing: 3px; margin: 0; text-transform: uppercase;">ОРАКУЛ СНОВИДЕНИЙ И ПОДСОЗНАНИЯ</h1>
        <p style="font-size: 12px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">
          Архетипическая Расшифровка • Для: ${userName}
        </p>
      </div>

      <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 14px; padding: 16px 20px; margin-bottom: 20px;">
        <span style="font-size: 10px; color: #818cf8; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block; margin-bottom: 4px;">Сюжет Сновидения:</span>
        <p style="font-size: 13px; color: #e2e8f0; font-style: italic; margin: 0; line-height: 1.6;">«${dreamText}»</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; text-align: center;">
        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 12px;">
          <span style="font-size: 10px; color: #818cf8; text-transform: uppercase; font-weight: bold; display: block;">Связанный Аркан</span>
          <span style="font-size: 16px; color: #ffd700; font-weight: bold;">#${result.arcanaConnection} ${arcanaNames[result.arcanaConnection] || ''}</span>
        </div>
        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 12px;">
          <span style="font-size: 10px; color: #818cf8; text-transform: uppercase; font-weight: bold; display: block;">Внутренний Архетип</span>
          <span style="font-size: 15px; color: #ffffff; font-weight: bold;">${result.archetype}</span>
        </div>
        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 12px;">
          <span style="font-size: 10px; color: #818cf8; text-transform: uppercase; font-weight: bold; display: block;">Тип Сна</span>
          <span style="font-size: 15px; color: #ffd700; font-weight: bold;">${result.isProphetic ? 'Вещий Сон 🔮' : 'Психологический 🧠'}</span>
        </div>
      </div>

      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 14px; padding: 18px; margin-bottom: 20px;">
        <h3 style="font-family: 'Cinzel', serif; font-size: 15px; color: #818cf8; margin: 0 0 8px 0;">◈ ТОЛКОВАНИЕ И ЗНАКИ ПОДСОЗНАНИЯ</h3>
        <p style="font-size: 13px; line-height: 1.7; color: #f1f5f9; margin: 0;">${result.interpretation}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #818cf8; font-weight: bold; margin-bottom: 8px;">🗝 КЛЮЧЕВЫЕ СИМВОЛЫ</div>
          <div style="font-size: 11.5px; color: #e2e8f0; line-height: 1.6;">
            ${result.keySymbols.map(s => `• ${s}`).join('<br>')}
          </div>
        </div>

        <div style="background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #fb7185; font-weight: bold; margin-bottom: 8px;">⚠️ ПРЕДОСТЕРЕЖЕНИЕ СНА</div>
          <p style="font-size: 11.5px; color: #fef2f2; margin: 0; line-height: 1.6;">${result.warning}</p>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 20, 38, 0.9) 100%); border: 2px solid rgba(99, 102, 241, 0.45); border-radius: 16px; padding: 20px; text-align: center;">
        <span style="font-size: 10px; color: #818cf8; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 8px;">
          ✦ ПРАКТИЧЕСКОЕ ДЕЙСТВИЕ НАЯВУ ✦
        </span>
        <p style="font-family: 'Cinzel', serif; font-size: 13.5px; font-style: italic; color: #ffffff; margin: 0; line-height: 1.6;">
          "${result.actionableAdvice}"
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid rgba(99, 102, 241, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Оракул Сновидений</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050710',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Толкование_Сна_${userName}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Dream PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportAkashicKarmaPdf = async ({
  userInput,
  karma,
  matrix,
  filename
}: {
  userInput?: UserInput | null;
  karma: AkashicKarmaProfile;
  matrix?: MatrixNumbers | null;
  filename?: string;
}) => {
  const userName = userInput?.name || 'Странник';
  const birthDate = userInput?.birthDate || 'Не указана';

  const container = document.createElement('div');
  container.id = 'pdf-akashic-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '840px';
  container.style.backgroundColor = '#080503';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #f59e0b; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #180e06 0%, #080503 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.9);">
      
      <!-- Header -->
      <div style="text-align: center; border-bottom: 1px solid rgba(245, 158, 11, 0.3); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 16px; background: linear-gradient(135deg, #fbbf24, #d97706); color: #000; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);">📜</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 25px; color: #fef3c7; letter-spacing: 3px; margin: 0; text-transform: uppercase;">ХРОНИКИ АКАШИ • КНИГА ПРОШЛЫХ ВОПЛОЩЕНИЙ</h1>
        <p style="font-size: 12px; color: #fbbf24; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">
          Кармический Хвост • Расторжение Клятв и Договоров Души
        </p>
      </div>

      <!-- User & Master Tail Banner -->
      <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 18px 24px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 10px; color: #f59e0b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; display: block; margin-bottom: 3px;">Духовный Искатель</span>
          <span style="font-size: 19px; color: #ffffff; font-weight: bold;">${userName} (${birthDate})</span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 10px; color: #f59e0b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; display: block; margin-bottom: 4px;">Арканы Кармического Хвоста</span>
          <div style="display: flex; gap: 6px; justify-content: flex-end;">
            ${karma.karmicTailArcanas.map(arc => `
              <span style="display: inline-block; width: 32px; height: 32px; line-height: 32px; text-align: center; border-radius: 8px; background: rgba(245,158,11,0.2); border: 1px solid rgba(245,158,11,0.5); color: #ffd700; font-weight: bold; font-size: 14px;">${arc}</span>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Karmic Tail Name Highlight -->
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 14px; padding: 16px 20px; margin-bottom: 20px;">
        <span style="font-size: 10.5px; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block; margin-bottom: 4px;">Название Кармического Узла:</span>
        <h3 style="font-family: 'Cinzel', serif; font-size: 17px; color: #ffffff; margin: 0; font-weight: 700;">${karma.karmicTailName}</h3>
      </div>

      <!-- 2-Column Past Life Breakdown -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13.5px; color: #fbbf24; font-weight: bold; margin-bottom: 8px;">🏛 РОЛЬ ДУШИ В ПРОШЛОМ</div>
          <p style="font-size: 11.5px; color: #e2e8f0; line-height: 1.6; margin: 0 0 6px 0;">${karma.pastLifeRole}</p>
          <p style="font-size: 11px; color: #fca5a5; margin: 0; border-top: 1px dashed rgba(245,158,11,0.2); padding-top: 6px;">
            <strong>Грех / узел прошлого:</strong> ${karma.pastLifeSinOrVow}
          </p>
        </div>

        <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13.5px; color: #f87171; font-weight: bold; margin-bottom: 8px;">⚠️ КАРМИЧЕСКАЯ ЛОВУШКА В НАСТОЯЩЕМ</div>
          <p style="font-size: 11.5px; color: #e2e8f0; line-height: 1.6; margin: 0;">${karma.currentLifeTrap}</p>
        </div>
      </div>

      <!-- Unfulfilled Oath & Task -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: rgba(220, 38, 38, 0.08); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #fca5a5; font-weight: bold; margin-bottom: 6px;">🔥 НЕВЫПОЛНЕННЫЙ ОБЕТ / КЛЯТВА</div>
          <p style="font-size: 12px; color: #ffffff; font-style: italic; margin: 0; line-height: 1.6;">«${karma.unfulfilledOath}»</p>
        </div>

        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 14px; padding: 16px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; color: #6ee7b7; font-weight: bold; margin-bottom: 6px;">🏆 ГЛАВНАЯ ЗАДАЧА ДУХОВНОГО РОСТА</div>
          <p style="font-size: 11.5px; color: #ffffff; margin: 0; line-height: 1.6;">${karma.soulGrowthTask}</p>
        </div>
      </div>

      <!-- Sacred Release Formula -->
      <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(147, 51, 234, 0.18) 50%, rgba(8, 5, 3, 0.95) 100%); border: 2px solid rgba(245, 158, 11, 0.5); border-radius: 18px; padding: 22px; text-align: center; margin-bottom: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
        <span style="font-size: 10.5px; color: #fbbf24; text-transform: uppercase; letter-spacing: 2.5px; font-weight: bold; display: block; margin-bottom: 10px;">
          ✦ САКРАЛЬНАЯ ФОРМУЛА РАСТОРЖЕНИЯ ПРОШЛЫХ КЛЯТВ ✦
        </span>
        <p style="font-family: 'Cinzel', serif; font-size: 14.5px; font-style: italic; color: #ffffff; margin: 0 0 10px 0; line-height: 1.7;">
          «${karma.releaseRitualAffirmation}»
        </p>
        <p style="font-size: 11px; color: #cbd5e1; margin: 0; letter-spacing: 0.5px;">
          🕯 <strong>Практика освобождения:</strong> Произнесите вслух 3 раза при зажженной свече для аннулирования старых договоров души.
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(245, 158, 11, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Хроники Акаши & Освобождение Кармы</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#080503',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Хроники_Акаши_Расторжение_Клятв_${userName}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Akashic Karma PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportChakrasPdf = async ({
  userInput,
  profile,
  matrix,
  filename
}: {
  userInput?: UserInput | null;
  profile: ChakraPsychosomaticProfile;
  matrix?: MatrixNumbers | null;
  filename?: string;
}) => {
  const userName = userInput?.name || 'Странник';
  const birthDate = userInput?.birthDate || 'Не указана';

  const container = document.createElement('div');
  container.id = 'pdf-chakras-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '840px';
  container.style.backgroundColor = '#08040d';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #a855f7; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #140b22 0%, #08040d 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.9);">
      
      <!-- Header -->
      <div style="text-align: center; border-bottom: 1px solid rgba(168, 85, 247, 0.3); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 16px; background: linear-gradient(135deg, #c084fc, #7e22ce); color: #fff; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);">🧘</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 25px; color: #f3e8ff; letter-spacing: 3px; margin: 0; text-transform: uppercase;">САКРАЛЬНАЯ ПСИХОСОМАТИКА И КАРТА 7 ЧАКР</h1>
        <p style="font-size: 12px; color: #d8b4fe; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">
          Диагностика Энергетических Центров • Баланс Биополя • Для: ${userName}
        </p>
      </div>

      <!-- Vitality & Dominance Stats -->
      <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 16px; padding: 18px 24px; margin-bottom: 22px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; text-align: center;">
        <div>
          <span style="font-size: 10px; color: #c084fc; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; display: block; margin-bottom: 4px;">Общий Индекс Витальности</span>
          <span style="font-size: 22px; color: #ffd700; font-weight: 800;">${profile.generalVitalityScore}%</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #c084fc; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; display: block; margin-bottom: 4px;">Доминирующий Центр</span>
          <span style="font-size: 15px; color: #4ade80; font-weight: bold;">${profile.dominantEnergyChakra}</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #c084fc; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; display: block; margin-bottom: 4px;">Уязвимая Зона (Внимание)</span>
          <span style="font-size: 15px; color: #f87171; font-weight: bold;">${profile.mostVulnerableChakra}</span>
        </div>
      </div>

      <!-- 7 Chakras Detailed Breakdown -->
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 22px;">
        ${profile.chakras.map((chakra, idx) => `
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid ${chakra.color}40; border-radius: 14px; padding: 14px 18px; display: flex; gap: 16px; align-items: center;">
            <div style="width: 44px; height: 44px; min-width: 44px; border-radius: 12px; background: ${chakra.bgGlow}; border: 2px solid ${chakra.color}; color: ${chakra.color}; font-size: 17px; font-weight: bold; display: flex; align-items: center; justify-content: center;">
              ${7 - idx}
            </div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <div>
                  <strong style="font-family: 'Cinzel', serif; font-size: 14.5px; color: #ffffff;">${chakra.name}</strong>
                  <span style="font-size: 11px; color: #a855f7; margin-left: 8px;">(${chakra.sanskritName})</span>
                </div>
                <span style="font-size: 11px; font-weight: bold; color: ${chakra.color}; background: ${chakra.color}15; border: 1px solid ${chakra.color}40; padding: 2px 8px; border-radius: 6px;">
                  Аркан #${chakra.arcana}
                </span>
              </div>
              <div style="font-size: 11.5px; color: #cbd5e1; line-height: 1.5;">
                <strong>Органы:</strong> ${chakra.physicalOrgans} &nbsp;|&nbsp; 
                <strong style="color: #fca5a5;">Блок:</strong> ${chakra.psychosomaticBlock}
              </div>
              <div style="font-size: 11px; color: #93c5fd; margin-top: 3px;">
                <strong>Практика исцеления:</strong> ${chakra.healingExercise}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Affirmation & Harmonization -->
      <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(59, 130, 246, 0.15) 100%); border: 2px solid rgba(168, 85, 247, 0.45); border-radius: 16px; padding: 20px; text-align: center;">
        <span style="font-size: 10px; color: #c084fc; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 8px;">
          ✦ АФФИРМАЦИЯ ДЛЯ ГАРМОНИЗАЦИИ ВСЕХ 7 ЧАКР ✦
        </span>
        <p style="font-family: 'Cinzel', serif; font-size: 14px; font-style: italic; color: #ffffff; margin: 0; line-height: 1.6;">
          «${profile.dailyChakraAffirmation}»
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(168, 85, 247, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Сакральная Чакрология & Психосоматика</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#08040d',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Карта_Чакр_Психосоматика_${userName}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Chakras PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const exportPowerCalendarPdf = async ({
  userInput,
  days,
  year,
  monthName,
  matrix,
  filename
}: {
  userInput?: UserInput | null;
  days: PowerCalendarDay[];
  year: number;
  monthName: string;
  matrix?: MatrixNumbers | null;
  filename?: string;
}) => {
  const userName = userInput?.name || 'Странник';

  const wealthDaysCount = days.filter(d => d.energyType === 'wealth').length;
  const loveDaysCount = days.filter(d => d.energyType === 'love').length;
  const spiritDaysCount = days.filter(d => d.energyType === 'spirit').length;
  const cautionDaysCount = days.filter(d => d.energyType === 'caution').length;

  const container = document.createElement('div');
  container.id = 'pdf-powercal-container';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '840px';
  container.style.backgroundColor = '#050e0a';
  container.style.color = '#e2e8f0';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border: 2px solid #10b981; padding: 32px; border-radius: 24px; background: linear-gradient(180deg, #0d2218 0%, #050e0a 100%); position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.9);">
      
      <!-- Header -->
      <div style="text-align: center; border-bottom: 1px solid rgba(16, 185, 129, 0.3); padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 16px; background: linear-gradient(135deg, #34d399, #059669); color: #000; font-weight: 800; font-size: 28px; font-family: 'Cinzel', serif; margin-bottom: 12px; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);">⚡</div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 25px; color: #a7f3d0; letter-spacing: 3px; margin: 0; text-transform: uppercase;">ПЕРСОНАЛЬНЫЙ КАЛЕНДАРЬ СИЛЫ 365</h1>
        <p style="font-size: 12px; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; font-weight: 600;">
          Энергетический Тайминг • ${monthName} ${year} • Для: ${userName}
        </p>
      </div>

      <!-- Monthly Energy Stats -->
      <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 16px 20px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center;">
        <div>
          <span style="font-size: 10px; color: #4ade80; text-transform: uppercase; font-weight: bold; display: block;">Денежные Дни</span>
          <span style="font-size: 18px; color: #ffffff; font-weight: bold;">💰 ${wealthDaysCount} дней</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #f472b6; text-transform: uppercase; font-weight: bold; display: block;">Дни Любви</span>
          <span style="font-size: 18px; color: #ffffff; font-weight: bold;">💖 ${loveDaysCount} дней</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #c084fc; text-transform: uppercase; font-weight: bold; display: block;">Сила Духа</span>
          <span style="font-size: 18px; color: #ffffff; font-weight: bold;">✨ ${spiritDaysCount} дней</span>
        </div>
        <div>
          <span style="font-size: 10px; color: #f87171; text-transform: uppercase; font-weight: bold; display: block;">Осторожность</span>
          <span style="font-size: 18px; color: #ffffff; font-weight: bold;">⚠️ ${cautionDaysCount} дней</span>
        </div>
      </div>

      <!-- Days Grid Summary -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
        ${days.map(d => {
          let badgeBg = 'rgba(255,255,255,0.05)';
          let badgeColor = '#94a3b8';
          if (d.energyType === 'wealth') { badgeBg = 'rgba(34,197,94,0.15)'; badgeColor = '#4ade80'; }
          if (d.energyType === 'love') { badgeBg = 'rgba(244,63,94,0.15)'; badgeColor = '#fb7185'; }
          if (d.energyType === 'spirit') { badgeBg = 'rgba(168,85,247,0.15)'; badgeColor = '#c084fc'; }
          if (d.energyType === 'caution') { badgeBg = 'rgba(239,68,68,0.15)'; badgeColor = '#f87171'; }

          return `
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-family: 'Cinzel', serif; font-size: 13px; color: #ffffff;">${d.dayNumber} ${monthName.slice(0, 3)} (${d.weekday})</strong>
                <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">${d.shortAdvice}</div>
              </div>
              <span style="font-size: 10.5px; font-weight: bold; color: ${badgeColor}; background: ${badgeBg}; border: 1px solid ${badgeColor}40; padding: 3px 8px; border-radius: 6px; white-space: nowrap; margin-left: 8px;">
                ${d.badge} (Аркан #${d.dayArcana})
              </span>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(16, 185, 129, 0.2); padding-top: 18px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">Chubuk Matrix System • Календарь Силы 365</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050e0a',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const totalPdfHeight = (imgHeight * pdfWidth) / imgWidth;
    let heightLeft = totalPdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(totalPdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;
    }

    const safeFileName = filename || `Календарь_Силы_${monthName}_${year}_${userName}`;
    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    console.error('Error generating Power Calendar PDF:', error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

const pcmToWav = (pcmData: Uint8Array, sampleRate: number = 24000): Blob => {
  const buffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(36, 'data');
  view.setUint32(40, pcmData.length, true);

  const wavData = new Uint8Array(buffer);
  wavData.set(pcmData, 44);

  return new Blob([wavData], { type: 'audio/wav' });
};

export const downloadAudioForCalculation = async (text: string, filename: string) => {
  try {
    const base64Audio = await getSpeech(text);
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = pcmToWav(bytes, 24000);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Download error:", e);
  }
};


