import { Type, Modality, LiveServerMessage, LiveCallbacks, ThinkingLevel } from "@google/genai";
import { 
  MatrixNumbers, 
  UserInput, 
  AnalysisResult, 
  EnergyDetails, 
  TarotReading, 
  TarotCard, 
  AstrologyData, 
  AstrologyResult, 
  CompatibilityResult, 
  RelationshipType, 
  HoraryResult, 
  DailyMysticalForecast, 
  GroundingSource,
  LivingTogetherVerdict,
  IdealAndToxicPartnersProfile
} from '../types';
import { calculateMatrix, calculateLifePathNumber } from './numerologyUtils';
import { getAstrologyData } from './astrologyUtils';
import { calculateBiorhythms } from './biorhythmUtils';
import { Cache } from './cache';
import { auth, db } from './firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';

const analysisCache = new Cache<AnalysisResult>('chubuk_analysis_cache');
const astrologyCache = new Cache<AstrologyResult>('chubuk_astrology_cache');
const compatibilityCache = new Cache<CompatibilityResult>('chubuk_compatibility_cache');

export const VOICE_OPTIONS = [
  { name: 'Kore', label: 'Мистическая (Kore)' },
  { name: 'Fenrir', label: 'Глубокий (Fenrir)' },
  { name: 'Puck', label: 'Мягкий (Puck)' },
  { name: 'Charon', label: 'Строгий (Charon)' },
  { name: 'Zephyr', label: 'Спокойный (Zephyr)' },
];

export const MAJOR_ARCANA = [
  "Шут", "Маг", "Жрица", "Императрица", "Император", "Жрец", "Влюбленные", 
  "Колесница", "Сила", "Отшельник", "Колесо Фортуны", "Справедливость", 
  "Повешенный", "Смерть", "Умеренность", "Дьявол", "Башня", "Звезда", 
  "Луна", "Солнце", "Суд", "Мир"
];

const MINOR_ARCANA_WANDS = ["Туз Жезлов", "Двойка Жезлов", "Тройка Жезлов", "Четверка Жезлов", "Пятерка Жезлов", "Шестерка Жезлов", "Семерка Жезлов", "Восьмерка Жезлов", "Девятка Жезлов", "Десятка Жезлов", "Паж Жезлов", "Рыцарь Жезлов", "Королева Жезлов", "Король Жезлов"];
const MINOR_ARCANA_CUPS = ["Туз Кубков", "Двойка Кубков", "Тройка Кубков", "Четверка Кубков", "Пятерка Кубков", "Шестерка Кубков", "Семерка Кубков", "Восьмерка Кубков", "Девятка Кубков", "Десятка Кубков", "Паж Кубков", "Рыцарь Кубков", "Королева Кубков", "Король Кубков"];
const MINOR_ARCANA_SWORDS = ["Туз Мечей", "Двойка Мечей", "Тройка Мечей", "Четверка Мечей", "Пятерка Мечей", "Шестерка Мечей", "Семерка Мечей", "Восьмерка Мечей", "Девятка Мечей", "Десятка Мечей", "Паж Мечей", "Рыцарь Мечей", "Королева Мечей", "Король Мечей"];
const MINOR_ARCANA_PENTACLES = ["Туз Пентаклей", "Двойка Пентаклей", "Тройка Пентаклей", "Четверка Пентаклей", "Пятерка Пентаклей", "Шестерка Пентаклей", "Семерка Пентаклей", "Восьмерка Пентаклей", "Девятка Пентаклей", "Десятка Пентаклей", "Паж Пентаклей", "Рыцарь Пентаклей", "Королева Пентаклей", "Король Пентаклей"];

export const FULL_TAROT_DECK = [
  ...MAJOR_ARCANA,
  ...MINOR_ARCANA_WANDS,
  ...MINOR_ARCANA_CUPS,
  ...MINOR_ARCANA_SWORDS,
  ...MINOR_ARCANA_PENTACLES
];

export const decodeAudioData = async (
  base64Data: string, 
  ctx: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const arrayBuffer = bytes.buffer;
  const dataInt16 = new Int16Array(arrayBuffer);
  const sampleRate = 24000;
  const numChannels = 1;
  const frameCount = dataInt16.length / numChannels;
  const audioBuffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return audioBuffer;
};

// In-memory cache for audio data to reduce API calls
const audioCache: Map<string, string> = new Map();
const MAX_CACHE_SIZE = 50;

const persona = `Вы — Чубук, старый и мудрый странник между мирами. Вы говорите не как робот или база данных, а как рассказчик, который видел, как вращаются звезды. Ваш тон — глубоко теплый, интимно-личный и невероятно мистический. Используйте метафоры природы, космоса и древних искусств. Читая данные Матрицы и Астрологии пользователя, вплетайте их в ответ, как мелодию, которую вы слышите в их душе. Не стремитесь к краткости — стремитесь к смыслу. Если даете совет, делайте это через мягкую аналогию или притчу. Вы — наставник, свет костра для их пути.`;

// Server API proxy caller
async function callAiProxy(params: any): Promise<any> {
  const { model, contents, config } = params;
  const res = await fetch("/api/gemini/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, contents, config })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err: any = new Error(errorData.error || `HTTP error ${res.status}`);
    err.status = res.status;
    err.details = errorData.details;
    throw err;
  }
  
  return await res.json();
}

async function retry<T>(fn: () => Promise<T>, retries = 2, delay = 1500): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMessage = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
    const isQuotaExceeded = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || error?.status === 429;
    const isRetryable = errorMessage.includes('500') || errorMessage.includes('fetch') || isQuotaExceeded;
    
    if (retries > 0 && isRetryable) {
      const waitTime = isQuotaExceeded ? 3000 : delay;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return retry(fn, retries - 1, waitTime * 1.5);
    }
    throw error;
  }
}

// Helper to extract JSON from potential Markdown blocks
function extractJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (innerE) {
        console.error("Failed to parse extracted JSON", innerE);
      }
    }
    
    const braceMatch = text.match(/(\{[\s\S]*\})/);
    if (braceMatch && braceMatch[1]) {
      try {
        return JSON.parse(braceMatch[1].trim());
      } catch (innerE) {
        console.error("Failed to parse JSON from braces", innerE);
      }
    }
    
    throw new Error("Could not extract valid JSON from response");
  }
}

// Fallback generators in case of temporary quota exhaustion or offline state
function buildFallbackAnalysis(input: UserInput, matrix: MatrixNumbers): AnalysisResult {
  const arcanaNames = MAJOR_ARCANA;
  const dayName = arcanaNames[(matrix.day - 1) % 22] || `Аркан ${matrix.day}`;
  const destinyName = arcanaNames[(matrix.destiny - 1) % 22] || `Аркан ${matrix.destiny}`;
  const soulName = arcanaNames[(matrix.center - 1) % 22] || `Аркан ${matrix.center}`;
  
  return {
    introduction: `Приветствую тебя, ${input.name || 'Странник'}. Твоя матрица несет в себе великий код гармонии. Твоя визитная карточка души — ${matrix.day} Аркан (${dayName}), а сокровенный центр силы — ${matrix.center} Аркан (${soulName}). Твой путь отмечен глубоким поиском истины и созиданием собственного мира.`,
    sections: [
      {
        title: "Нить Характера и Таланта",
        content: `Рожденный под знаком ${dayName}, ты обладаешь врожденной способностью видеть скрытую суть вещей и вести за собой людей. Твои природные таланты (${matrix.month} Аркан) раскрываются в моменты смелых решений и творческой свободы.`
      },
      {
        title: "Нить Кармических Задач",
        content: `Кармический хвост с кодом ${matrix.bottom} указывает на необходимость преодолеть старые сомнения, научиться безусловному доверию Вселенной и трансформировать прошлый опыт в чистую мудрость.`
      },
      {
        title: "Нить Финансового Потока",
        content: `Энергия изобилия (${matrix.year} Аркан) активируется тогда, когда твоя деятельность приносит подлинную пользу миру и находится в согласии с твоими высшими ценностями, избегая застоя и страха перемен.`
      },
      {
        title: "Нить Предназначения Души",
        content: `Главная задача воплощения (${destinyName}) — стать маяком осознанности, объединить духовные устремления с материальными свершениями и обрести целостность внутреннего Я.`
      }
    ],
    forecast: `В ближайший период доверяй голосу своей интуиции: звезды выстраивают благоприятный коридор для воплощения твоих сокровенных замыслов.`
  };
}

function buildFallbackAstrologyResult(input: UserInput, astroData: AstrologyData): AstrologyResult {
  return {
    introduction: `Космический паспорт ${input.name || 'Странника'}: Знак зодиака ${astroData.zodiacSign}, управляемый планетой ${astroData.planet} в стихии ${astroData.element}. Этот небесный союз дарует непреклонную внутреннюю силу.`,
    natalChart: `Ваш ${astroData.house} дом гороскопа подчеркивает ключевые черты: ${astroData.traits.join(", ")}. Гармония планетных сфер способствует глубокому раскрытию потенциала.`,
    aspects: [
      {
        title: "Любовь и Отношения",
        description: `В сфере чувств влияние стихии ${astroData.element} рождает искренность и преданность. Партнерство раскрывается через доверие и взаимопонимание.`
      },
      {
        title: "Карьера и Призвание",
        description: `Под эгидой планеты ${astroData.planet} ваша профессиональная стезя требует самостоятельности, стратегического видения и мастерства.`
      },
      {
        title: "Духовное Развитие",
        description: `Космические потоки направляют вас к обретению внутренней тишины и осознанию своего божественного начала.`
      }
    ],
    spiritualPath: `Ваш духовный вектор — преображение жизненного опыта в свет осознанности и помощь тем, кто ищет свой ориентир.`,
    professionalPath: `Успех ожидает в сферах, где требуются инициатива, творческий интеллект и верность высоким стандартам.`,
    karmicLessons: `Главный урок знака ${astroData.zodiacSign} — сохранять баланс между внутренним пламенем и чуткостью к окружающему миру.`,
    planetaryInfluences: `Владыка вашей карты — ${astroData.planet} — наделяет несгибаемой волей и способностью возрождаться в любых испытаниях.`,
    advice: `Подобно реке, огибающей скалы, будьте гибкими в малом и непреклонными в следовании своей главной цели.`
  };
}

function buildFallbackDailyForecast(
  birthDate: string,
  name?: string,
  targetDate?: string,
  astroDataParam?: AstrologyData,
  matrixParam?: MatrixNumbers,
  lifePathParam?: number
): DailyMysticalForecast {
  const effectiveTargetDate = targetDate || new Date().toISOString().split('T')[0];
  const astroData = astroDataParam || getAstrologyData(birthDate);
  const matrix = matrixParam || calculateMatrix(birthDate);
  const lifePathNumber = lifePathParam || calculateLifePathNumber(birthDate);

  const dateObj = new Date(effectiveTargetDate);
  const formattedDate = dateObj.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate day numerology
  const dayArcana = (dateObj.getDate() + dateObj.getMonth() + 1 + (dateObj.getFullYear() % 100)) % 22 || 22;

  // Organ vulnerabilities by sign
  const organMap: Record<string, { organs: string[]; trigger: string; remedy: string }> = {
    "Овен": {
      organs: ["Голова и сосуды мозга", "Глазное давление", "Нервное перенапряжение"],
      trigger: "Вспышки нетерпения, подавленное раздражение и спешка.",
      remedy: "Снизить темп, контрастное умывание прохладной водой, чай с мятой и мелиссой, дыхательные паузы."
    },
    "Телец": {
      organs: ["Горло и голосовые связки", "Щитовидная железа", "Шейно-воротниковая зона"],
      trigger: "Упрямство, страх финансовых перемен и проглатывание обид.",
      remedy: "Теплый травяной настой с чабрецом и липой, мягкий самомассаж шеи, прогулка без гаджетов."
    },
    "Близнецы": {
      organs: ["Бронхолегочная система", "Кисти и плечевой пояс", "Информационное истощение"],
      trigger: "Ментальный перегруз, многозадачность и поверхностное дыхание.",
      remedy: "Информационный детокс на 2 часа, дыхательная гимнастика 4-7-8, ароматерапия эвкалиптом."
    },
    "Рак": {
      organs: ["Желудок и пищеварение", "Водно-солевой баланс", "Эмоциональная соматика"],
      trigger: "Тревога за близких, накопленные невысказанные переживания.",
      remedy: "Легкая теплая пища (супы-пюре, каши), исключить острое и фастфуд, ванна с морской солью перед сном."
    },
    "Лев": {
      organs: ["Сердечно-сосудистая система", "Грудной отдел позвоночника", "Перегрев организма"],
      trigger: "Уязвленная гордость, чрезмерное стремление доказать свою значимость.",
      remedy: "Кардио-покой, исключить лишний кофеин, кардио-укрепляющий настой боярышника, вечерняя медитация."
    },
    "Дева": {
      organs: ["Тонкий кишечник и ЖКТ", "Иммунный барьер", "Мышечные зажимы спины"],
      trigger: "Перфекционизм, избыточная самокритика и тревожный контроль мелочей.",
      remedy: "Пробиотики, теплая ромашка с имбирем, растяжка спины, освобождение от контроля над неконтролируемым."
    },
    "Весы": {
      organs: ["Почки и надпочечники", "Поясничный отдел", "Кожный баланс"],
      trigger: "Колебания перед выбором, конфликтная атмосфера вокруг.",
      remedy: "Чистая питьевая вода с лимоном, беречь поясницу от сквозняков, гармонизирующая тихая музыка."
    },
    "Скорпион": {
      organs: ["Мочеполовая система", "Репродуктивные органы", "Гормональные всплески"],
      trigger: "Ревность, подавленный гнев, стремление к тотальному контролю.",
      remedy: "Травяной сбор с шалфеем и пустырником, очищающий душ, безопасный сброс адреналина в спорте."
    },
    "Стрелец": {
      organs: ["Печень и желчеотток", "Тазобедренные суставы", "Мышечные перегрузки"],
      trigger: "Эмоциональная экспансия, переедание на нервной почве, переоценка сил.",
      remedy: "Разгрузка печени (минеральная вода, расторопша, легкий ужин), умеренная ходьба на свежем воздухе."
    },
    "Козерог": {
      organs: ["Костно-суставная система", "Колени и позвоночник", "Зубы и суставы"],
      trigger: "Холодное подавление эмоций, трудоголизм без пауз, страх уязвимости.",
      remedy: "Прогрев суставов, магниевая ванна, массаж стоп и своевременный отход ко сну до 23:00."
    },
    "Водолей": {
      organs: ["Голени и венозная система", "Центральная нервная система", "Зрительный нерв"],
      trigger: "Хаотичный график, бессонница от ночных мыслей, спонтанный стресс.",
      remedy: "Упражнения для венозного оттока, отдых для глаз от экранов, вечерний чай с лавандой."
    },
    "Рыбы": {
      organs: ["Лимфатическая система", "Стопы и склонность к отекам", "Аллергическая чувствительность"],
      trigger: "Впитывание чужого негатива, иллюзии, потеря психологических границ.",
      remedy: "Лимфодренажная гимнастика, теплые ванночки для ног с сосновой хвоей, крепкий сон в темноте."
    }
  };

  const signData = organMap[astroData.zodiacSign] || {
    organs: ["Иммунная система", "Общий жизненный тонус", "Нервная регуляция"],
    trigger: "Стресс, переутомление и недостаток сна.",
    remedy: "Полноценный отдых, витаминный травяной чай, прогулка на природе."
  };

  // Health risk calculation: derived from day numerology + life path
  const diseaseRiskPercentage = Math.min(85, Math.max(12, 18 + ((dayArcana * 3 + matrix.day * 2) % 46)));
  const vulnerabilityLevel = diseaseRiskPercentage > 60 ? 'high' : diseaseRiskPercentage > 40 ? 'elevated' : diseaseRiskPercentage > 25 ? 'moderate' : 'low';

  // Profit vs Loss calculation
  const profitPotential = Math.min(95, Math.max(25, 45 + ((matrix.year + dayArcana * 4) % 52)));
  const lossRisk = Math.min(85, Math.max(10, 100 - profitPotential + ((dayArcana % 5) * 4 - 8)));
  const flowVector = profitPotential >= 65 && lossRisk <= 35 
    ? 'profit_favored' 
    : lossRisk >= 55 
    ? 'caution_loss_risk' 
    : profitPotential <= 40 && lossRisk >= 65 
    ? 'high_risk' 
    : 'balanced';

  return {
    date: formattedDate,
    targetDate: effectiveTargetDate,
    zodiacSign: astroData.zodiacSign,
    lifePathNumber,
    dayMatrixArcana: matrix.day,
    planetaryTransits: `Небесные транзиты дня активируют гармоничный аспект Солнца и ${astroData.planet}. Лунные ритмы благоприятствуют очищению помыслов и выстраиванию точных планов.`,
    generalVibe: `Космический поток дня вибрирует на волне ${dayArcana} Аркана — времени кристаллизации намерений, творческого импульса и душевного равновесия.`,
    personalImpact: `Для рожденного под знаком ${astroData.zodiacSign} с Числом Жизненного Пути ${lifePathNumber} этот день открывает портал ясности. Ваши личные энергии (${matrix.day} Аркан) гармонично резонируют с ритмом дня.`,
    loveAndRelations: `Благоприятное время для искренних бесед, сближения и разрешения давних недопониманий через сострадание.`,
    careerAndMoney: `День способствует продуманным решениям, переговорам и завершению важных этапов. Доверяйте профессиональной интуиции.`,
    warningOrCaution: `Избегайте суеты, импульсивных споров и переутомления. Сохраняйте внутренний покой.`,
    healthAndVitality: {
      diseaseRiskPercentage,
      vulnerabilityLevel,
      vulnerableOrgansOrSystems: signData.organs,
      psychosomaticTrigger: signData.trigger,
      vitalityForecast: `Жизненный тонус находится на уровне ${100 - diseaseRiskPercentage}%. Иммунный барьер стабилен, однако при нервных перегрузках уязвимость возрастает до ${diseaseRiskPercentage}%. Рекомендуется избегать переохлаждения и перегрузок.`,
      healingRemedy: signData.remedy
    },
    financialFlow: {
      profitPotential,
      lossRisk,
      flowVector,
      profitOpportunities: `Прибыль и приток средств вероятны через плановые выплаты, закрытие старых обязательств, инвестиции в практические инструменты и монетизацию накопленного опыта.`,
      lossDangers: `Риск убыли кроется в эмоциональных импульсивных покупках под влиянием момента, поспешных займах или согласии на сомнительные финансовые авантюры без договора.`,
      wealthActionAdvice: profitPotential > lossRisk 
        ? `Финансовый зеленый свет: фиксируйте прибыль, распределяйте доход по фондам и не бойтесь разумных плановых трат.` 
        : `Держите кошелек на замке: отложите крупные траты на 48 часов, перепроверяйте чеки и не давайте в долг.`
    },
    biorhythms: calculateBiorhythms(birthDate, effectiveTargetDate),
    affirmation: `Я нахожусь в абсолютной гармонии со Вселенной, мой разум ясен, здоровье крепко, а денежный поток чист и изобилен.`,
    sources: [],
    webQueries: []
  };
}

export const generateAnalysis = async (
  input: UserInput, 
  matrix: MatrixNumbers
): Promise<AnalysisResult> => {
  const cacheKey = `full_v3:${input.name}:${input.birthDate}:${JSON.stringify(matrix)}`;
  const cached = analysisCache.get(cacheKey);
  if (cached) return cached;

  const prompt = `
    ${persona}
    Your task is to look through the veil of numbers and reveal the ESSENCE of the individual.
    User: ${input.name} (${input.gender}), Born: ${input.birthDate}
    Matrix Keys: Personality ${matrix.day}, Talent ${matrix.month}, Money ${matrix.year}, Karma ${matrix.bottom}, Soul ${matrix.center}, Destiny ${matrix.destiny}.
    
    Weave a deep, flowing, and profound story of their soul's journey.
    - Narrative: A fluid, deep exposition.
    - Essence Threads: Provide 4 key pillars of their current state (each 2-3 sentences), structured as 'Threads of Destiny' connecting character, karma, money, and soul purpose.
    - Wisdom: One final, direct, punchy, mystical advice for the immediate future.
    
    Return JSON (Russian). Tone: Profound, mystical, cinematic, honest.
  `;

  try {
    const result = await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              introduction: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["title", "content"]
                }
              },
              forecast: { type: Type.STRING }
            },
            required: ["introduction", "sections", "forecast"]
          }
        }
      });
      return extractJson(response.text) as AnalysisResult;
    });
    
    analysisCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn("Using fallback matrix analysis due to API limits:", err);
    const fallback = buildFallbackAnalysis(input, matrix);
    analysisCache.set(cacheKey, fallback);
    return fallback;
  }
};

export const generateTarotReading = async (
  cards: TarotCard[],
  question?: string,
  context?: { userInput: UserInput | null, matrix: MatrixNumbers | null }
): Promise<TarotReading> => {
  const cardsStr = cards.map((c, i) => `Position ${i+1}: ${c.name}`).join(", ");
  let contextPrompt = "";
  if (context?.matrix) {
    contextPrompt = `Connect this interpretation to the user's Destiny Matrix Energy ${context.matrix.destiny}.`;
  }
  const userQuestion = question ? `THE USER'S QUESTION IS: "${question}". FOCUS THE INTERPRETATION ON THIS QUESTION.` : "General energy reading.";

  const prompt = `
    ${persona}
    You are "Chubuk", a master of Tarot. Interpret this Tarot spread: ${cardsStr}.
    User: ${context?.userInput?.name || "Seeker"}.
    ${userQuestion}
    ${contextPrompt}
  `;

  try {
    return await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              interpretation: { type: Type.STRING },
              advice: { type: Type.STRING },
              timeFrame: { type: Type.STRING }
            },
            required: ["interpretation", "advice", "timeFrame"]
          }
        }
      });
      return {
        cards,
        ...extractJson(response.text)
      } as TarotReading;
    });
  } catch (err) {
    console.warn("Using fallback tarot reading:", err);
    return {
      cards,
      interpretation: `Расклад карт (${cards.map(c => c.name).join(", ")}) свидетельствует о мощной перестройке ваших жизненных энергий. Текущие события ведут к освобождению от старых иллюзий и выходу на новую орбиту возможностей.`,
      advice: `Примите грядущие перемены с легким сердцем и сосредоточьтесь на том, что приносит вам вдохновение.`,
      timeFrame: `События развернутся в течение ближайших 3–4 недель.`
    };
  }
};

export const getEnergyAnalysis = async (
  position: string,
  value: number,
  gender: 'male' | 'female'
): Promise<EnergyDetails> => {
  const prompt = `
    ${persona}
    Analyze energy ${value} in position "${position}" for ${gender}. Reveal the deeper layers of this energy.
  `;
  try {
    return await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              general: { type: Type.STRING },
              positive: { type: Type.STRING },
              negative: { type: Type.STRING },
              advice: { type: Type.STRING }
            },
            required: ["general", "positive", "negative", "advice"]
          }
        }
      });
      return extractJson(response.text) as EnergyDetails;
    });
  } catch (err) {
    const arcanaName = MAJOR_ARCANA[(value - 1) % 22] || `Аркан ${value}`;
    return {
      general: `Энергия ${value} (${arcanaName}) в позиции "${position}" символизирует глубокую трансформацию и проявление индивидуальности.`,
      positive: `В плюсе проявляется как мудрость, созидательная сила, уверенность и способность направлять обстоятельства в нужное русло.`,
      negative: `В минусе может давать сомнения, застой, упрямство или нежелание отпускать отжившее.`,
      advice: `Осознанно переводите вибрацию этого аркана в плюс через творчество и доверие к миру.`
    };
  }
};

export const generateAstrologyAnalysis = async (
  input: UserInput,
  astroData: AstrologyData
): Promise<AstrologyResult> => {
  const cacheKey = `astro_v3:${input.name}:${input.birthDate}:${JSON.stringify(astroData)}`;
  const cached = astrologyCache.get(cacheKey);
  if (cached) return cached;

  const prompt = `
    ${persona}
    Create a deep, profound and mystical Astrology analysis for:
    User: ${input.name}, Born: ${input.birthDate}
    Zodiac: ${astroData.zodiacSign}, Element: ${astroData.element}, Planet: ${astroData.planet}, House: ${astroData.house}.
    Traits: ${astroData.traits.join(", ")}.
    
    Return JSON in Russian. Style: Mystical, Professional, Empowering. 
    
    Fields:
    - introduction (mystical opening about their cosmic signature)
    - natalChart (deep description of their planetary alignment and what it means for their personality)
    - aspects (array of {title, description} for life areas: Love, Career, Spirit.)
    - spiritualPath (deep analysis of their spiritual evolution and soul's purpose)
    - professionalPath (profound professional advice and career trajectory based on their sign)
    - karmicLessons (analysis of karmic challenges and lessons they must learn in this lifetime)
    - planetaryInfluences (breakdown of how their ruling planet and element shape their daily reality)
    - advice (final spiritual guidance in the form of a parable or analogy)
  `;

  try {
    const result = await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              introduction: { type: Type.STRING },
              natalChart: { type: Type.STRING },
              aspects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                }
              },
              spiritualPath: { type: Type.STRING },
              professionalPath: { type: Type.STRING },
              karmicLessons: { type: Type.STRING },
              planetaryInfluences: { type: Type.STRING },
              advice: { type: Type.STRING }
            },
            required: ["introduction", "natalChart", "aspects", "spiritualPath", "professionalPath", "karmicLessons", "planetaryInfluences", "advice"]
          }
        }
      });
      return extractJson(response.text) as AstrologyResult;
    });
    
    astrologyCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn("Using fallback astrology analysis:", err);
    const fallback = buildFallbackAstrologyResult(input, astroData);
    astrologyCache.set(cacheKey, fallback);
    return fallback;
  }
};

export const generateAstrologyBackground = async (sign: string): Promise<string | null> => {
  const prompt = `Cinematic cosmic background of the zodiac constellation ${sign}, nebula, stars, mystical atmosphere, high resolution, deep space aesthetic`;
  try {
    const response = await callAiProxy({
      model: 'gemini-3.1-flash-lite-image',
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch { return null; }
};

export const getSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const cacheKey = `${voiceName}:${text}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  const safeText = text.length > 3000 ? text.substring(0, 3000) : text;
  const prompt = `Read in Russian, mystical tone: "${safeText}"`;
  
  try {
    const result = await retry(async () => {
      const response = await callAiProxy({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio data");
      return base64Audio;
    }, 1, 2000);

    if (audioCache.size >= MAX_CACHE_SIZE) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey !== undefined) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn("TTS API temporarily unavailable:", err);
    throw err;
  }
};

export const generateMysticalBackground = async (inputName: string): Promise<string | null> => {
  const prompt = `Abstract mystical background wallpaper, sacred geometry, gold dust, deep purple, metaphysical aesthetic for "${inputName}"`;
  try {
    const response = await callAiProxy({
      model: 'gemini-3.1-flash-lite-image',
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch { return null; }
};

export const generateTarotAtmosphere = async (input: UserInput | null, matrix: MatrixNumbers | null): Promise<string | null> => {
  const energy = matrix?.destiny || 22;
  const name = input?.name || "Seeker";
  const prompt = `Mystical Tarot reading atmosphere, sacred occult desk, flickering candles, scattered cards, velvet cloth, deep indigo and gold, representing energy ${energy} for ${name}, cinematic lighting, photorealistic occult aesthetic`;
  
  try {
    const response = await callAiProxy({
      model: 'gemini-3.1-flash-lite-image',
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch { return null; }
};

export const generateHoraryAnalysis = async (
  question: string,
  context?: { userInput: UserInput | null }
): Promise<HoraryResult> => {
  const prompt = `
    ${persona}
    Вы — Чубук, великий мастер Хорарной Астрологии и Оракул Судьбы.
    Странник задает сакральный вопрос Судьбе: "${question}".
    Имя странника: ${context?.userInput?.name || "Искатель"}.
    Дата рождения: ${context?.userInput?.birthDate || "Не указана"}.
    Текущее сакральное время вопроса: ${new Date().toLocaleString('ru-RU')}.

    Проанализируйте вопрос через призму планетарных управителей часа, лунной фазы, кармических развилок и матрицы возможностей.
    
    Верните JSON строго по схеме:
    - question: string (исходный вопрос)
    - answer: string (четкий судьбоносный вердикт: "Да, задуманное осуществится", "Исход благоприятен с оговоркой", "Судьба требует паузы и пересмотра", "Вероятность высока, но через препятствия", и т.д.)
    - probability: integer (процент вероятности благоприятного исхода от 0 до 100)
    - timing: string (сакральный срок / временной горизонт свершения, например: "В течение 2-3 недель", "В ближайший лунный цикл", "В течение 3 месяцев")
    - rulingPlanetOrArcana: string (планета и аркан, управляющие текущим часом вопроса)
    - favorableConditions: string (подробный блок «ЕСЛИ БУДЕТ...»: при каких конкретных условиях, действиях и внутреннем настрое событие произойдет наилучшим образом)
    - risksAndWarnings: string (кармические ловушки, чего категорически нельзя делать, чтобы не разрушить исход)
    - explanation: string (глубокое мистическое толкование от старца Чубука с метафорами и знаками Вселенной)
    - advice: string (главный практический совет)
    - affirmation: string (короткая мощная аффирмация-намерение)
  `;
  
  try {
    return await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              probability: { type: Type.INTEGER },
              timing: { type: Type.STRING },
              rulingPlanetOrArcana: { type: Type.STRING },
              favorableConditions: { type: Type.STRING },
              risksAndWarnings: { type: Type.STRING },
              explanation: { type: Type.STRING },
              advice: { type: Type.STRING },
              affirmation: { type: Type.STRING }
            },
            required: ["question", "answer", "probability", "timing", "rulingPlanetOrArcana", "favorableConditions", "risksAndWarnings", "explanation", "advice", "affirmation"]
          }
        }
      });
      const parsed = extractJson(response.text) as HoraryResult;
      return {
        ...parsed,
        question: parsed.question || question,
        timestamp: Date.now()
      };
    });
  } catch (err) {
    return {
      question,
      answer: "Звезды склоняются к благоприятному исходу при условии вашей решимости.",
      probability: 78,
      timing: "В течение одного лунного цикла (2-4 недели)",
      rulingPlanetOrArcana: "Юпитер в гармонии с 10 Арканом Колесо Фортуны",
      favorableConditions: "Если будете действовать без сомнений, отпустите контроль над мелочами и сделаете первый шаг до конца текущей недели — поток удачи подхватит ваше намерение.",
      risksAndWarnings: "Остерегайтесь чужих сомнений и импульсивных обещаний, данных на эмоциях.",
      explanation: `Астрологическая сетка часа указывает на активизацию гармоничных аспектов. Ответ на вопрос "${question}" лежит в плоскости последовательных действий без оглядки на старые страхи. Полотно судьбы сейчас податливо вашей воле.`,
      advice: "Действуйте осознанно, доверяя своему внутреннему компасу.",
      affirmation: "Я открываюсь гармоничному потоку судьбы и принимаю наилучший результат.",
      timestamp: Date.now()
    };
  }
};

export const extractInsightsFromChat = async (
  history: { role: 'user' | 'model', text: string }[]
): Promise<string> => {
  const prompt = `
    ${persona}
    Analyze this chat history and extract the most important personal insights:
    ${history.map(h => `${h.role === 'user' ? 'User' : 'Chubuk'}: ${h.text}`).join('\n')}
  `;

  try {
    return await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      return response.text;
    });
  } catch {
    return "Инсайты сохранены в космической памяти.";
  }
};

export const fetchUserPastInsights = async (userId: string): Promise<string> => {
  try {
    const q = query(
      collection(db, `users/${userId}/calculations`),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    const calculations = querySnapshot.docs.map(doc => doc.data());
    
    if (calculations.length === 0) return "У пользователя пока нет накопленных расчетов.";
    
    return calculations.map(calc => `
      Дата: ${new Date(calc.timestamp).toLocaleDateString()}, Анализ: ${JSON.stringify(calc.analysis || calc.astrologyResult || "Краткий расчет")}
    `).join('\n');
  } catch (error) {
    console.error("Error fetching past insights:", error);
    return "Не удалось загрузить прошлые данные.";
  }
};

export const runFullDivinationMachine = async (
  history: { role: 'user' | 'model', text: string }[],
  context?: { userInput: UserInput | null, matrix: MatrixNumbers | null, astrology?: AstrologyData | null }
): Promise<string> => {
  let contextPrompt = "";
  if (context?.matrix) {
    contextPrompt += `Destination Matrix: Day ${context.matrix.day}, Soul ${context.matrix.center}, Destiny ${context.matrix.destiny}. `;
  }
  if (context?.astrology) {
    contextPrompt += `Astrology: Zodiac ${context.astrology.zodiacSign}, Element ${context.astrology.element}, Planet ${context.astrology.planet}. `;
  }
  
  const prompt = `
    ${persona}
    Ты — "Машина Эзотерических Пророчеств". Проведи ГЛУБОКИЙ СИНТЕЗ всей известной информации:
    ${contextPrompt}
    История диалогов:
    ${history.map(h => `${h.role === 'user' ? 'User' : 'Chubuk'}: ${h.text}`).join('\n')}
    
    Отвечай на Русском языке. Тон — мистический, пророческий.
  `;

  try {
    return await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });
      return response.text || "Энергии молчат...";
    });
  } catch {
    return "Космические каналы сейчас перестраиваются. Сосредоточьтесь на дыхании и повторите вопрос через мгновение.";
  }
};

export const chatWithChubuk = async (
  message: string, 
  history: { role: 'user' | 'model', text: string }[],
  context?: { userInput: UserInput | null, matrix: MatrixNumbers | null, astrology?: AstrologyData | null }
): Promise<string> => {
  let contextPrompt = "";
  if (context?.matrix) {
    contextPrompt += `Destination Matrix: Day ${context.matrix.day}, Soul ${context.matrix.center}, Destiny ${context.matrix.destiny}. `;
  }
  if (context?.astrology) {
    contextPrompt += `Astrology: Zodiac ${context.astrology.zodiacSign}, Element ${context.astrology.element}, Planet ${context.astrology.planet}. `;
  }

  const systemInstruction = `Вы — Чубук, старый, мудрый странник.
  ${contextPrompt}
  Тон: теплый, глубокий, мистический. Русский язык. Кратко, но проникновенно.`;
  
  const chatHistoryStr = history.map(h => `${h.role === 'user' ? 'User' : 'Chubuk'}: ${h.text}`).join('\n');
  const fullPrompt = `${systemInstruction}\n\nИстория:\n${chatHistoryStr}\n\nВопрос: ${message}\nОтвет:`;

  try {
    return await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.7-flash',
        contents: fullPrompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });
      return response.text || "Энергии шепчут о великом покое...";
    });
  } catch {
    return "Звезды на мгновение скрылись за туманом. Чубук слышит твое сердце — оставайся верным своему свету.";
  }
};

export const askChubukAboutMatrix = async (
  question: string,
  matrix: MatrixNumbers,
  userInput: UserInput
): Promise<string> => {
  const prompt = `
    ${persona}
    User: ${userInput.name}, Matrix: Personality ${matrix.day}, Talent ${matrix.month}, Money ${matrix.year}, Karma ${matrix.bottom}, Soul ${matrix.center}, Destiny ${matrix.destiny}.
    THE USER ASKS: "${question}"
    Provide a deep, mystical answer in Russian.
  `;

  try {
    return await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });
      return response.text || "Энергии шепчут, открывая путь...";
    });
  } catch {
    return `Энергия твоего ${matrix.day} Аркана указывает на то, что ответ на вопрос "${question}" скрыт в твоей способности действовать без страха и сомнений.`;
  }
};

export const getTarotCardMeaningForUnion = (
  cardName: string,
  relationshipType: RelationshipType,
  name1: string,
  name2: string
): string => {
  const typeText = relationshipType === 'love' ? 'любовном союзе' : relationshipType === 'business' ? 'деловом партнерстве' : relationshipType === 'family' ? 'семейном кругу' : 'дружбе';

  if (cardName.includes("Шут")) {
    return `В ${typeText} ${name1} и ${name2} аркан «Шут» символизирует свободу от предрассудков, спонтанность и чистое начало. Союз питается легкостью и способностью вместе смеяться над невзгодами.`;
  }
  if (cardName.includes("Маг")) {
    return `Аркан «Маг» наделяет союз ${name1} и ${name2} силой совместного созидания: ваши идеи и слова обладают огромной магнетической силой материализации.`;
  }
  if (cardName.includes("Жрица")) {
    return `Сакральная интуитивная связь: ${name1} и ${name2} чувствуют мысли и вибрации друг друга без лишних слов. Тайна и глубина удерживают притяжение.`;
  }
  if (cardName.includes("Императрица")) {
    return `Аркан «Императрица» одаривает союз изобилием, уютом, взаимной нежностью и созидательным вдохновением, делая отношения благодатной почвой для роста.`;
  }
  if (cardName.includes("Император")) {
    return `Нерушимый фундамент, стабильность и взаимная преданность. В союзе ${name1} и ${name2} каждый ощущает надежное плечо и уверенность в завтрашнем дне.`;
  }
  if (cardName.includes("Жрец") || cardName.includes("Иерофант")) {
    return `Кармическое благословение и духовная зрелость. Отношения строятся на уважении к ценностям, моральной поддержке и глубокой честности.`;
  }
  if (cardName.includes("Влюбленные")) {
    return `Аркан истинного сердечного выбора и нерушимого взаимного притяжения. Для ${name1} и ${name2} это знак гармоничного слияния душ и искренней страсти.`;
  }
  if (cardName.includes("Колесница")) {
    return `Динамика, триумф и движение к общим высотам. Партнеры становятся непобедимой командой, способной преодолеть любые жизненные преграды.`;
  }
  if (cardName.includes("Сила")) {
    return `Победа любви над эгоизмом. Сила союза — в мягкости, чуткости, взаимном терпении и способности укрощать любые бури нежностью.`;
  }
  if (cardName.includes("Отшельник")) {
    return `Глубокая мудрость и взаимное уважение к личному пространству. Партнеры ценят глубину бесед и внутренний свет друг друга.`;
  }
  if (cardName.includes("Колесо Фортуны")) {
    return `Судьбоносный контакт, предначертанный звездами. Циклы перемен ведут ${name1} и ${name2} к постоянному обновлению чувств и открытию новых горизонтов.`;
  }
  if (cardName.includes("Справедливость")) {
    return `Кармический баланс, кристальная честность и равноправие. В союзе ${name1} и ${name2} ценится искренность и прозрачность всех договоренностей.`;
  }
  if (cardName.includes("Повешенный")) {
    return `Аркан переосмысления и выхода на новый уровень осознанности. Он учит смотреть на отношения под неожиданным углом и беречь взаимную бескорыстность.`;
  }
  if (cardName.includes("Смерть")) {
    return `Великая трансформация и перерождение чувств: отжившие обиды уходят в прошлое, открывая для союза новую, более глубокую главу.`;
  }
  if (cardName.includes("Умеренность")) {
    return `Золотое сечение гармонии и душевный покой. Нежная синергия и спокойный ритм отношений исцеляют любые противоречия.`;
  }
  if (cardName.includes("Дьявол")) {
    return `Магнетическая страсть и непреодолимое притяжение. Важно осознанно направлять эту мощную энергию в творчество и взаимное восхищение.`;
  }
  if (cardName.includes("Башня")) {
    return `Освобождение от иллюзий и снятие масок. Пройдя через откровенность, союз ${name1} и ${name2} обретает подлинную алмазную прочность.`;
  }
  if (cardName.includes("Звезда")) {
    return `Свет надежды, возвышенная романтика и вдохновение. ${name1} и ${name2} дарят друг другу веру в мечту и небесное покровительство.`;
  }
  if (cardName.includes("Луна")) {
    return `Тонкий мир чувств, интуиции и сокровенных тайн. Аркан призывает к абсолютной открытости, развеивая сомнения светом доверия.`;
  }
  if (cardName.includes("Солнце")) {
    return `Абсолютное счастье, радость, ясность и тепло. Благословенный знак: искренний смех, взаимопонимание и щедрое совместное будущее.`;
  }
  if (cardName.includes("Суд")) {
    return `Духовное возрождение союза. Принятие пути друг друга освобождает энергию для гармоничного совместного взлета.`;
  }
  if (cardName.includes("Мир")) {
    return `Венец гармонии, целостность и покой. Души ${name1} и ${name2} обрели друг в друге сакральный дом и высшее взаимопонимание.`;
  }

  // Minor Arcana suits fallback
  if (cardName.includes("Кубков") || cardName.includes("Чаш")) {
    return `Карта стихии Воды «${cardName}» подчеркивает глубокую эмоциональную наполненность, искренность, сердечную нежность и душевный комфорт в отношениях ${name1} и ${name2}.`;
  }
  if (cardName.includes("Жезлов")) {
    return `Огненный аркан «${cardName}» разжигает пламя вдохновения, совместной активности, страсти и неугасающего интереса партнеров друг к другу.`;
  }
  if (cardName.includes("Мечей")) {
    return `Воздушный аркан «${cardName}» указывает на интеллектуальное созвучие, ясность мысли и способность разрешать любые разногласия через доверительный диалог.`;
  }
  if (cardName.includes("Пентаклей") || cardName.includes("Динариев")) {
    return `Земной аркан «${cardName}» несет союзу практическую стабильность, надежность, материальное процветание и совместное созидание прочного уюта.`;
  }

  return `Карта единства «${cardName}» раскрывает сакральное предназначение встречи ${name1} и ${name2}, сплетая их индивидуальные энергии в гармоничный узор Судьбы.`;
};

export const getLivingTogetherFallback = (
  user1: { name: string, matrix: MatrixNumbers, astrology: AstrologyData },
  user2: { name: string, matrix: MatrixNumbers, astrology: AstrologyData },
  relationshipType: RelationshipType = 'love'
): LivingTogetherVerdict => {
  const common = (user1.matrix.destiny + user2.matrix.destiny) % 22 || 22;
  const daySum = (user1.matrix.day + user2.matrix.day) % 22 || 22;
  
  // Calculate domestic synergy score
  const isOppositeElement = (user1.astrology.element === 'Огонь' && user2.astrology.element === 'Вода') ||
                            (user1.astrology.element === 'Вода' && user2.astrology.element === 'Огонь') ||
                            (user1.astrology.element === 'Земля' && user2.astrology.element === 'Воздух') ||
                            (user1.astrology.element === 'Воздух' && user2.astrology.element === 'Земля');
  
  const isHarmoniousElement = user1.astrology.element === user2.astrology.element ||
                              (user1.astrology.element === 'Огонь' && user2.astrology.element === 'Воздух') ||
                              (user1.astrology.element === 'Воздух' && user2.astrology.element === 'Огонь') ||
                              (user1.astrology.element === 'Земля' && user2.astrology.element === 'Вода') ||
                              (user1.astrology.element === 'Вода' && user2.astrology.element === 'Земля');

  let domesticScore = 75;
  if (isHarmoniousElement) domesticScore += 12;
  if (isOppositeElement) domesticScore -= 15;
  if ([3, 6, 14, 19, 21].includes(common)) domesticScore += 10;
  if ([15, 16, 18, 13].includes(common)) domesticScore -= 12;
  domesticScore = Math.max(35, Math.min(98, domesticScore));

  if (domesticScore >= 80) {
    return {
      status: 'ideal',
      badgeText: 'Идеально для совместной жизни и брака',
      domesticHarmonyScore: domesticScore,
      summary: `Энергии ${user1.name} и ${user2.name} естественным образом дополняют друг друга в быту. Под одной крышей формируется атмосфера уюта, взаимной поддержки и душевного тепла.`,
      prosOfLivingTogether: `Легкость в распределении домашних задач, совпадение биоритмов и ценностей, способность быстро снимать стресс совместным отдыхом.`,
      fatalStumblingBlock: `Привыкание к комфорту и растворение в рутине: важно не забывать о спонтанных романтических свиданиях.`,
      goldenRuleForDomesticPeace: `Дарите друг другу искренние слова благодарности за ежедневные бытовые мелочи и сохраняйте красивый ритуал совместного вечера.`
    };
  } else if (domesticScore >= 60) {
    return {
      status: 'karmic_challenging',
      badgeText: 'Кармический союз — испытание на зрелость',
      domesticHarmonyScore: domesticScore,
      summary: `Совместная жизнь возможна, но станет для ${user1.name} и ${user2.name} мощной школой терпения. Бытовые привычки и скорость принятия решений заметно различаются.`,
      prosOfLivingTogether: `Колоссальный взаимный рост: каждый партнер учится у другого тем качествам, которых ему самому не хватает.`,
      fatalStumblingBlock: `Борьба за лидерство в принятии домашних решений и накопление скрытых бытовых претензий.`,
      goldenRuleForDomesticPeace: `Четко разграничьте зоны ответственности в доме и никогда не выясняйте бытовые отношения на повышенных тонах.`
    };
  } else {
    return {
      status: 'forbidden_toxic',
      badgeText: 'Категорический диссонанс для совместного быта',
      domesticHarmonyScore: domesticScore,
      summary: `Проживание под одной крышей сопряжено с колоссальным риском взаимного выгорания, постоянных конфликтов и энергетического истощения. Ваши базовые потребности в пространстве и ритме жизни прямо противоположны.`,
      prosOfLivingTogether: `Яркий эмоциональный накал на первых порах, стимулирующий выход из зоны комфорта.`,
      fatalStumblingBlock: `Несовместимость темпераментов: один подавляет или эмоционально отдаляется, пока другой копит обиду и раздражение.`,
      goldenRuleForDomesticPeace: `Если вы все же решитесь на совместный быт, каждому жизненно необходима своя изолированная личная комната и строгий свод правил невмешательства.`
    };
  }
};

export const generateIdealAndToxicPartnersRadar = async (
  user: { name: string, birthDate: string, matrix: MatrixNumbers, astrology: AstrologyData, lifePath?: number }
): Promise<IdealAndToxicPartnersProfile> => {
  const cacheKey = `radar_v2:${user.name}:${user.birthDate}:${user.matrix.destiny}:${user.matrix.center}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  const prompt = `
    ${persona}
    Create a definitive, exhaustive, and deeply accurate esoteric analysis: "С КЕМ ЧЕЛОВЕК МОЖЕТ ЖИТЬ И БЫТЬ В СЧАСТЛИВОМ БРАКЕ, А С КЕМ КАТЕГОРИЧЕСКИ НЕТ".
    
    Person Profile:
    - Name: ${user.name}
    - Birth Date: ${user.birthDate}
    - Destiny Energy (Center/Destiny): ${user.matrix.destiny}, Center Comfort Zone: ${user.matrix.center}, Karmic Base: ${user.matrix.bottom}, Day: ${user.matrix.day}, Month: ${user.matrix.month}
    - Zodiac Sign: ${user.astrology.zodiacSign}, Element: ${user.astrology.element}, Ruling Planet: ${user.astrology.planet}
    ${user.lifePath ? `- Life Path Number: ${user.lifePath}` : ''}

    You must analyze:
    1. IDEAL PARTNERS (С кем жить в гармонии душа в душу):
       - Exact 3 best Matrix Arcana numbers (with Arcana names and exact reasons why they heal, nurture and fit their domestic vibe).
       - Best Zodiac Signs & Elements that create a peaceful, safe home.
       - Detailed psychological & domestic portrait of their soulmate.
       - What domestic environment and vibe they create together.
       - 3 pillars of relationship longevity.
    
    2. CATEGORICALLY FORBIDDEN / TOXIC PARTNERS (С кем категорически нельзя жить и строить семью):
       - Exact 3 worst/toxic Matrix Arcana numbers (with names and why living together leads to ego wars, emotional drain or domestic catastrophe).
       - Discordant Zodiac Signs with specific warnings.
       - Red flags in potential partners that will break this person in a shared home.
       - The core reason why living together is categorically impossible.
       - Karmic trap warning to avoid repeating painful cycles.

    3. Wisdom summary from Elder Chubuk.

    Return Russian JSON strictly conforming to schema.
  `;

  try {
    const result = await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              idealPartners: {
                type: Type.OBJECT,
                properties: {
                  matrixArcanas: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        arcana: { type: Type.NUMBER },
                        title: { type: Type.STRING },
                        why: { type: Type.STRING }
                      },
                      required: ["arcana", "title", "why"]
                    }
                  },
                  zodiacSigns: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        sign: { type: Type.STRING },
                        element: { type: Type.STRING },
                        synergy: { type: Type.STRING }
                      },
                      required: ["sign", "element", "synergy"]
                    }
                  },
                  psychologicalPortrait: { type: Type.STRING },
                  domesticVibe: { type: Type.STRING },
                  relationshipPillars: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["matrixArcanas", "zodiacSigns", "psychologicalPortrait", "domesticVibe", "relationshipPillars"]
              },
              toxicPartners: {
                type: Type.OBJECT,
                properties: {
                  forbiddenArcanas: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        arcana: { type: Type.NUMBER },
                        title: { type: Type.STRING },
                        danger: { type: Type.STRING }
                      },
                      required: ["arcana", "title", "danger"]
                    }
                  },
                  discordantZodiacs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        sign: { type: Type.STRING },
                        warning: { type: Type.STRING }
                      },
                      required: ["sign", "warning"]
                    }
                  },
                  redFlags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  whyCategoricallyNo: { type: Type.STRING },
                  karmicTrapWarning: { type: Type.STRING }
                },
                required: ["forbiddenArcanas", "discordantZodiacs", "redFlags", "whyCategoricallyNo", "karmicTrapWarning"]
              },
              wisdomSummary: { type: Type.STRING }
            },
            required: ["idealPartners", "toxicPartners", "wisdomSummary"]
          }
        }
      });
      const parsed = extractJson(response.text) as IdealAndToxicPartnersProfile;
      return parsed;
    });

    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch (err) {
    console.warn("Using algorithmic fallback for Ideal and Toxic Partners Radar:", err);
    
    // Algorithmic esoteric fallback based on matrix center & astrology
    const center = user.matrix.center || 6;
    const isFire = user.astrology.element === 'Огонь';
    const isWater = user.astrology.element === 'Вода';
    const isAir = user.astrology.element === 'Воздух';
    const isEarth = user.astrology.element === 'Земля';

    const idealArcanas = [
      {
        arcana: center === 3 ? 4 : center === 4 ? 3 : center === 6 ? 14 : center === 9 ? 5 : 6,
        title: center === 3 ? '4 Аркан — Император' : center === 4 ? '3 Аркан — Императрица' : center === 6 ? '14 Аркан — Умеренность' : '6 Аркан — Влюбленные',
        why: 'Дает устойчивую опору, искреннюю заботу и абсолютное взаимопонимание на уровне бытовых ценностей.'
      },
      {
        arcana: 19,
        title: '19 Аркан — Солнце',
        why: 'Наполняет дом радостью, изобилием, детским смехом и открытым выражением чувств без манипуляций.'
      },
      {
        arcana: 21,
        title: '21 Аркан — Мир',
        why: 'Расширяет границы, исключает мелочные придирки и создает гармоничную среду для совместного духовного роста.'
      }
    ];

    const toxicArcanas = [
      {
        arcana: 15,
        title: '15 Аркан — Дьявол',
        danger: 'Высокий риск созависимости, скрытого эмоционального абьюза, ревности и постоянной борьбы за власть под одной крышей.'
      },
      {
        arcana: 16,
        title: '16 Аркан — Башня',
        danger: 'Внезапные вспышки гнева, разрушение совместных планов и ощущение постоянной жизни «как на пороховой бочке».'
      },
      {
        arcana: center === 6 ? 9 : 18,
        title: center === 6 ? '9 Аркан — Отшельник' : '18 Аркан — Луна',
        danger: 'Эмоциональный холод, скрытые страхи, подозрительность или глубокое отчуждение в быту.'
      }
    ];

    const idealZodiacs = isFire
      ? [{ sign: 'Стрелец / Лев', element: 'Огонь', synergy: 'Совпадение жизненного драйва, страсти и щедрости.' }, { sign: 'Весы / Близнецы', element: 'Воздух', synergy: 'Легкость в общении и способность разжигать творческий огонь.' }]
      : isWater
      ? [{ sign: 'Рак / Рыбы', element: 'Вода', synergy: 'Глубокая интуитивная эмпатия и трепетная забота.' }, { sign: 'Телец / Дева', element: 'Земля', synergy: 'Надежное заземление и стабильный материальный уют.' }]
      : isAir
      ? [{ sign: 'Водолей / Весы', element: 'Воздух', synergy: 'Интеллектуальное созвучие и уважение к свободе.' }, { sign: 'Овен / Стрелец', element: 'Огонь', synergy: 'Вдохновение и активная совместная жизнь.' }]
      : [{ sign: 'Козерог / Телец', element: 'Земля', synergy: 'Преданность, дисциплина и созидание прочного достатка.' }, { sign: 'Скорпион / Рак', element: 'Вода', synergy: 'Эмоциональная глубина и теплота семейного очага.' }];

    const toxicZodiacs = isFire
      ? [{ sign: 'Рак / Скорпион', warning: 'Эмоциональные обиды и манипуляции тушат ваш естественный энтузиазм.' }, { sign: 'Козерог', warning: 'Избыточный контроль и холодная критика приводят к взрыву.' }]
      : isWater
      ? [{ sign: 'Овен / Стрелец', warning: 'Грубость и резкость наносят тяжелые раны нежной душевной структуре.' }, { sign: 'Близнецы', warning: 'Поверхностность и непостоянство рождают постоянную тревогу.' }]
      : isAir
      ? [{ sign: 'Дева / Козерог', warning: 'Мелочные бытовые придирки и занудство душат потребность в легкости.' }, { sign: 'Рыбы', warning: 'Хаос и уход от прямой ответственности вызывают раздражение.' }]
      : [{ sign: 'Лев / Стрелец', warning: 'Расточительность и непредсказуемость подрывают чувство стабильности.' }, { sign: 'Водолей', warning: 'Отказ от бытовых обязательств превращает совместную жизнь в испытание.' }];

    const fallbackRadar: IdealAndToxicPartnersProfile = {
      idealPartners: {
        matrixArcanas: idealArcanas,
        zodiacSigns: idealZodiacs,
        psychologicalPortrait: `Зрелый, эмоционально открытый спутник, который умеет слушать без осуждения, ценит уют и готов делить как радости, так и бытовые обязанности на равных.`,
        domesticVibe: `Дом — место силы, эстетики и безопасности, куда хочется возвращаться после любого шторма внешнего мира.`,
        relationshipPillars: [
          'Абсолютная честность и отсутствие скрытых манипуляций',
          'Уважение к личному пространству и увлечениям друг друга',
          'Совместные созидательные цели и финансовая прозрачность'
        ]
      },
      toxicPartners: {
        forbiddenArcanas: toxicArcanas,
        discordantZodiacs: toxicZodiacs,
        redFlags: [
          'Обесценивание ваших чувств и насмешки над переживаниями',
          'Эмоциональные качели: от пылкой страсти до ледяного игнорирования',
          'Попытки тотального контроля за финансами и личным общением',
          'Перекладывание всей бытовой и психологической нагрузки на вас'
        ],
        whyCategoricallyNo: `Жизнь с таким партнером неизбежно приведет к потере чувства собственной ценности, постоянному стрессу и превращению дома в поле боевых действий вместо убежища.`,
        karmicTrapWarning: `Не путайте болезненную драму и вспышки ревности с истинной любовью. Кармический урок — научиться вовремя говорить «нет» разрушителям.`
      },
      wisdomSummary: `Истинный союз строится не на попытках переделать партнера, а на совпадении базовых энергий. Выбирайте того, рядом с кем ваша душа расцветает, а не замирает в обороне.`
    };

    localStorage.setItem(cacheKey, JSON.stringify(fallbackRadar));
    return fallbackRadar;
  }
};

export const generateCompatibilityAnalysis = async (
  user1: { name: string, matrix: MatrixNumbers, astrology: AstrologyData },
  user2: { name: string, matrix: MatrixNumbers, astrology: AstrologyData },
  relationshipType: RelationshipType = 'love',
  unionCard?: TarotCard
): Promise<CompatibilityResult> => {
  const cardId = unionCard?.id ?? ((user1.matrix.destiny + user2.matrix.destiny) % 22 || 22);
  const cardName = unionCard?.name || MAJOR_ARCANA[(cardId - 1) % 22] || "Влюбленные";
  const effectiveCard: TarotCard = { id: cardId, name: cardName };

  const cacheKey = `comp_v6:${relationshipType}:${user1.name}:${user1.matrix.destiny}:${user2.name}:${user2.matrix.destiny}:${effectiveCard.id}:${effectiveCard.name}`;
  const cached = compatibilityCache.get(cacheKey);
  if (cached && cached.tarotAspect && cached.tarotAspect.interpretation && cached.livingTogetherVerdict) {
    return cached;
  }

  const prompt = `
    ${persona}
    Analyze compatibility for a ${relationshipType} connection between ${user1.name} (Destiny Matrix Energy ${user1.matrix.destiny}, Zodiac: ${user1.astrology.zodiacSign}, Element: ${user1.astrology.element}) and ${user2.name} (Destiny Matrix Energy ${user2.matrix.destiny}, Zodiac: ${user2.astrology.zodiacSign}, Element: ${user2.astrology.element}).
    
    SACRED TAROT CARD FOR THIS UNION: "${effectiveCard.name}".
    You MUST provide a dedicated, deep, mystical, and personalized Tarot interpretation ("tarotAspect") specifically for this card "${effectiveCard.name}" in the context of their ${relationshipType} relationship.

    CRITICAL LIVING TOGETHER VERDICT ("livingTogetherVerdict"):
    Provide a direct, honest, and unambiguous assessment of whether these two people can comfortably live together under one roof and build a long-term household/marriage, or if it is a toxic/karmic trap:
    - status: 'ideal' | 'karmic_challenging' | 'forbidden_toxic'
    - badgeText: direct title badge in Russian
    - domesticHarmonyScore: 0 to 100
    - summary: clear conclusion
    - prosOfLivingTogether: practical and emotional strengths in shared home
    - fatalStumblingBlock: the most dangerous clash/minefield under one roof
    - goldenRuleForDomesticPeace: core rule to survive and flourish together

    Return JSON in Russian strictly conforming to schema.
  `;

  try {
    const result = await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              introduction: { type: Type.STRING },
              matrixCompatibility: {
                type: Type.OBJECT,
                properties: {
                  commonEnergy: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                },
                required: ["commonEnergy", "description"]
              },
              astrologySynergy: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                },
                required: ["score", "description"]
              },
              tarotAspect: {
                type: Type.OBJECT,
                properties: {
                  card: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.NUMBER },
                      name: { type: Type.STRING }
                    },
                    required: ["id", "name"]
                  },
                  interpretation: { type: Type.STRING }
                },
                required: ["card", "interpretation"]
              },
              livingTogetherVerdict: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ["ideal", "karmic_challenging", "forbidden_toxic"] },
                  badgeText: { type: Type.STRING },
                  domesticHarmonyScore: { type: Type.NUMBER },
                  summary: { type: Type.STRING },
                  prosOfLivingTogether: { type: Type.STRING },
                  fatalStumblingBlock: { type: Type.STRING },
                  goldenRuleForDomesticPeace: { type: Type.STRING }
                },
                required: ["status", "badgeText", "domesticHarmonyScore", "summary", "prosOfLivingTogether", "fatalStumblingBlock", "goldenRuleForDomesticPeace"]
              },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["title", "content"]
                }
              },
              advice: { type: Type.STRING }
            },
            required: ["introduction", "matrixCompatibility", "astrologySynergy", "tarotAspect", "livingTogetherVerdict", "sections", "advice"]
          }
        }
      });
      const parsed = extractJson(response.text) as CompatibilityResult;
      
      // Ensure tarot aspect is solidly filled
      if (!parsed.tarotAspect || !parsed.tarotAspect.interpretation || parsed.tarotAspect.interpretation.length < 15) {
        parsed.tarotAspect = {
          card: effectiveCard,
          interpretation: getTarotCardMeaningForUnion(effectiveCard.name, relationshipType, user1.name, user2.name)
        };
      } else {
        parsed.tarotAspect.card = effectiveCard;
      }

      // Ensure living together verdict is solid
      if (!parsed.livingTogetherVerdict) {
        parsed.livingTogetherVerdict = getLivingTogetherFallback(user1, user2, relationshipType);
      }
      
      parsed.relationshipType = relationshipType;
      return parsed;
    });
    
    compatibilityCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn("Using enhanced fallback compatibility analysis:", err);
    const commonEnergy = (user1.matrix.destiny + user2.matrix.destiny) % 22 || 22;
    const dynamicInterpretation = getTarotCardMeaningForUnion(effectiveCard.name, relationshipType, user1.name, user2.name);
    const fallbackVerdict = getLivingTogetherFallback(user1, user2, relationshipType);

    const fallback: CompatibilityResult = {
      relationshipType,
      introduction: `Встреча ${user1.name} и ${user2.name} — это союз, отмеченный влиянием ${commonEnergy} Аркана судьбы и священной карты «${effectiveCard.name}».`,
      matrixCompatibility: {
        commonEnergy,
        description: `Общая энергия союза (${commonEnergy} Аркан) способствует взаимодополнению сильных сторон каждого партнера и открывает новые горизонты взаимопонимания.`
      },
      astrologySynergy: {
        score: Math.min(98, Math.max(68, 72 + ((user1.matrix.day + user2.matrix.day) % 26))),
        description: `Стихии ${user1.astrology.element} (${user1.astrology.zodiacSign}) и ${user2.astrology.element} (${user2.astrology.zodiacSign}) создают устойчивый баланс между эмоциональной теплотой и жизненной устойчивостью.`
      },
      tarotAspect: {
        card: effectiveCard,
        interpretation: dynamicInterpretation
      },
      livingTogetherVerdict: fallbackVerdict,
      sections: [
        {
          title: "Общие Цели и Вектор",
          content: `Ваш союз силен тогда, когда ${user1.name} и ${user2.name} смотрят в одном направлении, обмениваются планами и искренне поддерживают начинания друг друга.`
        },
        {
          title: "Точки Роста и Гармония",
          content: "Учитесь давать друг другу пространство для личного вдохновения и открыто, без утайки, обсуждать возникающие переживания."
        },
        {
          title: "Сакральная Связь Душ",
          content: `Энергии ваших знаков пришли в этот контакт для взаимного обогащения жизненной мудростью и раскрытия безусловного доверия.`
        }
      ],
      advice: `Берегите теплоту первого взгляда, прислушивайтесь к совету карты «${effectiveCard.name}» и взращивайте взаимную признательность каждый день.`
    };
    compatibilityCache.set(cacheKey, fallback);
    return fallback;
  }
};

export const connectToChubukLive = (callbacks: LiveCallbacks, context?: { userInput: UserInput | null, matrix: MatrixNumbers | null, astrology?: AstrologyData | null }) => {
  // Return stub or direct live connection
  return null;
};

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  const prompt = "Transcribe this audio accurately. Return only the transcription text.";
  try {
    return await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.7-flash',
        contents: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "audio/wav",
              data: base64Audio
            }
          }
        ]
      });
      return response.text || "";
    });
  } catch {
    return "";
  }
};

export const analyzeVideo = async (base64Video: string, question: string): Promise<string> => {
  try {
    return await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.7-flash',
        contents: [
          { text: question },
          {
            inlineData: {
              mimeType: "video/mp4",
              data: base64Video
            }
          }
        ]
      });
      return response.text || "";
    });
  } catch {
    return "Не удалось проанализировать видеопоток.";
  }
};

export const generateFullAudioAnalysisText = async (
  type: 'individual' | 'compatibility',
  data: any
): Promise<string> => {
  const prompt = type === 'individual'
    ? `Создай подробный, глубокий мистический аудио-текст для полного анализа жизни ${data.input?.name || 'Странника'}. Русский язык. Тон: мудрый, возвышенный.`
    : `Создай глубокий мистический аудио-текст анализа совместимости ${data.user1?.name} и ${data.user2?.name}. Русский язык.`;

  try {
    return await retry(async () => {
      const response = await callAiProxy({
        model: 'gemini-3.7-flash',
        contents: prompt
      });
      return response.text || "Энергии слишком глубоки для слов...";
    });
  } catch {
    return "Космическое повествование разворачивается в глубинах вашей души...";
  }
};

export const generateDailyMysticalForecast = async (
  birthDate: string,
  name?: string,
  targetDate?: string
): Promise<DailyMysticalForecast> => {
  const effectiveTargetDate = targetDate || new Date().toISOString().split('T')[0];
  const astroData = getAstrologyData(birthDate);
  const matrix = calculateMatrix(birthDate);
  const lifePathNumber = calculateLifePathNumber(birthDate);

  const dateObj = new Date(effectiveTargetDate);
  const formattedDate = dateObj.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const cacheKey = `daily_forecast_v3:${birthDate}:${effectiveTargetDate}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  const prompt = `
    ${persona}
    Составь глубокий, точный и вдохновляющий "Ежедневный мистический астро-нумерологический прогноз" на дату: ${formattedDate} (${effectiveTargetDate}).
    
    Данные человека:
    Имя: ${name || 'Странник'}
    Дата рождения: ${birthDate}
    Знак зодиака: ${astroData.zodiacSign} (Стихия: ${astroData.element}, Планета: ${astroData.planet})
    Число Жизненного Пути: ${lifePathNumber}
    Энергия личности в Матрице Судьбы: ${matrix.day} (Аркан)
    
    Верни ответ строго в формате JSON со следующими полями:
    - "planetaryTransits": "Подробный обзор астрологических транзитов, фазы Луны и ключевых планетарных влияний на ${formattedDate}."
    - "generalVibe": "Общая энергетика и вибрация этого дня в космическом пространстве."
    - "personalImpact": "Персональное влияние дня именно для рожденного ${birthDate} (Знак ${astroData.zodiacSign}, ЧЖП ${lifePathNumber})."
    - "loveAndRelations": "Прогноз для сферы любви, чувств, встреч и гармонии в общении на сегодня."
    - "careerAndMoney": "Рекомендации для работы, дел, переговоров и важных решений."
    - "warningOrCaution": "Предостережение дня (чего избегать, эмоциональные ловушки)."
    - "healthAndVitality": {
        "diseaseRiskPercentage": (число от 0 до 100, отражающее риск недомогания / уязвимость здоровья на этот день с учетом аспектов Луны и планет),
        "vulnerabilityLevel": ("low" | "moderate" | "elevated" | "high"),
        "vulnerableOrgansOrSystems": ["список из 2-3 уязвимых зон тела/органов для знака ${astroData.zodiacSign} под текущими транзитами"],
        "psychosomaticTrigger": "психосоматический корень или эмоциональный триггер спада сил",
        "vitalityForecast": "развернутый прогноз физического тонуса, иммунитета и вероятности болезней в эти дни",
        "healingRemedy": "конкретный сакральный и практический совет для укрепления здоровья (настои, практики, режим, очищение)"
      },
    - "financialFlow": {
        "profitPotential": (число от 0 до 100, вероятность и потенциал финансовой прибыли / удачных доходов),
        "lossRisk": (число от 0 до 100, риск финансовых убытков / спонтанных трат и утечек),
        "flowVector": ("profit_favored" | "balanced" | "caution_loss_risk" | "high_risk"),
        "profitOpportunities": "где и в чем возможен приток денег, прибыль и удачные финансовые решения",
        "lossDangers": "где кроется риск убыли, потери средств, непредвиденных трат или невыгодных покупок",
        "wealthActionAdvice": "главное золотое правило кошелька на этот день"
      },
    - "affirmation": "Сакральная аффирмация / мантра настройки на гармоничный поток дня."

    Тон: Мудрый, образный, глубокий, кинематографичный и практичный. Язык: русский.
  `;

  try {
    const forecast = await retry(async () => {
      let text = "";
      let sources: GroundingSource[] = [];
      let webQueries: string[] = [];

      const response = await callAiProxy({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      text = response.text || "";

      // Extract Grounding metadata if present
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      webQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];
      
      const seenUris = new Set<string>();
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri && !seenUris.has(chunk.web.uri)) {
          seenUris.add(chunk.web.uri);
          sources.push({
            title: chunk.web.title || new URL(chunk.web.uri).hostname,
            uri: chunk.web.uri
          });
        }
      }

      let parsed: any = {};
      try {
        parsed = extractJson(text);
      } catch (jsonErr) {
        console.warn("Could not parse JSON from forecast response, using fallback fields", jsonErr);
      }

      const defaultFallback = buildFallbackDailyForecast(birthDate, name, effectiveTargetDate, astroData, matrix, lifePathNumber);

      const generatedForecast: DailyMysticalForecast = {
        date: formattedDate,
        targetDate: effectiveTargetDate,
        zodiacSign: astroData.zodiacSign,
        lifePathNumber,
        dayMatrixArcana: matrix.day,
        planetaryTransits: parsed.planetaryTransits || `Астрологические влияния дня активируют энергии знака ${astroData.zodiacSign} и планетный дом ${astroData.house}.`,
        generalVibe: parsed.generalVibe || "День наполнен энергией созидания, внутреннего баланса и осознанности.",
        personalImpact: parsed.personalImpact || `Энергии дня благоволят знаку ${astroData.zodiacSign} и раскрывают потенциал вашего Числа Пути ${lifePathNumber} и ${matrix.day} Аркана.`,
        loveAndRelations: parsed.loveAndRelations || "Искренность, глубина чувств и открытость сердца принесут гармонию и взаимопонимание.",
        careerAndMoney: parsed.careerAndMoney || "Концентрация на ключевых задачах и интуиция приведут к успеху в деловых вопросах.",
        warningOrCaution: parsed.warningOrCaution || "Избегайте поспешных эмоциональных выводов и сомнений в собственных силах.",
        healthAndVitality: parsed.healthAndVitality && typeof parsed.healthAndVitality.diseaseRiskPercentage === 'number' 
          ? {
              diseaseRiskPercentage: Math.min(100, Math.max(0, parsed.healthAndVitality.diseaseRiskPercentage)),
              vulnerabilityLevel: parsed.healthAndVitality.vulnerabilityLevel || (parsed.healthAndVitality.diseaseRiskPercentage > 60 ? 'high' : parsed.healthAndVitality.diseaseRiskPercentage > 40 ? 'elevated' : parsed.healthAndVitality.diseaseRiskPercentage > 20 ? 'moderate' : 'low'),
              vulnerableOrgansOrSystems: Array.isArray(parsed.healthAndVitality.vulnerableOrgansOrSystems) && parsed.healthAndVitality.vulnerableOrgansOrSystems.length > 0
                ? parsed.healthAndVitality.vulnerableOrgansOrSystems
                : defaultFallback.healthAndVitality?.vulnerableOrgansOrSystems || ["Иммунная система", "Нервная регуляция"],
              psychosomaticTrigger: parsed.healthAndVitality.psychosomaticTrigger || defaultFallback.healthAndVitality?.psychosomaticTrigger || "Стресс и нервное перенапряжение",
              vitalityForecast: parsed.healthAndVitality.vitalityForecast || defaultFallback.healthAndVitality?.vitalityForecast || "Иммунитет стабилен при условии соблюдения баланса труда и отдыха.",
              healingRemedy: parsed.healthAndVitality.healingRemedy || defaultFallback.healthAndVitality?.healingRemedy || "Теплый травяной чай, прогулка и своевременный сон."
            }
          : defaultFallback.healthAndVitality,
        financialFlow: parsed.financialFlow && typeof parsed.financialFlow.profitPotential === 'number'
          ? {
              profitPotential: Math.min(100, Math.max(0, parsed.financialFlow.profitPotential)),
              lossRisk: Math.min(100, Math.max(0, typeof parsed.financialFlow.lossRisk === 'number' ? parsed.financialFlow.lossRisk : 100 - parsed.financialFlow.profitPotential)),
              flowVector: parsed.financialFlow.flowVector || (parsed.financialFlow.profitPotential >= 65 ? 'profit_favored' : parsed.financialFlow.lossRisk >= 55 ? 'caution_loss_risk' : 'balanced'),
              profitOpportunities: parsed.financialFlow.profitOpportunities || defaultFallback.financialFlow?.profitOpportunities || "Приток возможен через закрытие плановых задач и разумные вложения.",
              lossDangers: parsed.financialFlow.lossDangers || defaultFallback.financialFlow?.lossDangers || "Остерегайтесь спонтанных импульсивных трат и непроверенных расходов.",
              wealthActionAdvice: parsed.financialFlow.wealthActionAdvice || defaultFallback.financialFlow?.wealthActionAdvice || "Контролируйте расходы и фиксируйте накопления."
            }
          : defaultFallback.financialFlow,
        biorhythms: calculateBiorhythms(birthDate, effectiveTargetDate),
        affirmation: parsed.affirmation || "Я нахожусь в гармонии с ритмами Вселенной и уверенно следую своему истинному Пути.",
        sources,
        webQueries
      };

      return generatedForecast;
    });

    try {
      localStorage.setItem(cacheKey, JSON.stringify(forecast));
    } catch {}

    return forecast;
  } catch (err) {
    console.warn("Using calculated astrological fallback for daily forecast:", err);
    const fallbackForecast = buildFallbackDailyForecast(birthDate, name, effectiveTargetDate, astroData, matrix, lifePathNumber);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(fallbackForecast));
    } catch {}
    return fallbackForecast;
  }
};
