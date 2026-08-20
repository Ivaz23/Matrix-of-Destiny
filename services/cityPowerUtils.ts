import { CityPowerProfile, MatrixNumbers, AstrologyData } from '../types';

export function calculateCityPowerProfile(
  cityName: string,
  matrix?: MatrixNumbers | null,
  astrology?: AstrologyData | null
): CityPowerProfile {
  const cleanCity = cityName.trim() || 'Париж';
  const charSum = cleanCity.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const destiny = matrix?.destiny || 19;
  const center = matrix?.center || 10;
  
  const seed = (charSum * 13 + destiny * 7 + center * 3) % 100;
  const score = 60 + (seed % 39); // 60-98%

  const vibes: CityPowerProfile['vibeType'][] = [
    'wealth_accelerator',
    'love_magnet',
    'spiritual_sanctuary',
    'high_intensity',
    'calm_rest'
  ];
  const vibeType = vibes[seed % vibes.length];

  const cityDatabase: Record<string, { country: string; defaultVibe: CityPowerProfile['vibeType'] }> = {
    'москва': { country: 'Россия', defaultVibe: 'wealth_accelerator' },
    'санкт-петербург': { country: 'Россия', defaultVibe: 'spiritual_sanctuary' },
    'дубай': { country: 'ОАЭ', defaultVibe: 'wealth_accelerator' },
    'бали': { country: 'Индонезия', defaultVibe: 'spiritual_sanctuary' },
    'париж': { country: 'Франция', defaultVibe: 'love_magnet' },
    'рим': { country: 'Италия', defaultVibe: 'spiritual_sanctuary' },
    'нью-йорк': { country: 'США', defaultVibe: 'wealth_accelerator' },
    'токио': { country: 'Япония', defaultVibe: 'high_intensity' },
    'стамбул': { country: 'Турция', defaultVibe: 'wealth_accelerator' },
    'лондон': { country: 'Великобритания', defaultVibe: 'high_intensity' }
  };

  const lookup = cityDatabase[cleanCity.toLowerCase()];
  const country = lookup?.country || 'Мир';
  const finalVibe = lookup?.defaultVibe || vibeType;

  const vibeDescriptions: Record<CityPowerProfile['vibeType'], {
    wealth: string;
    love: string;
    career: string;
    warning: string;
    purpose: string;
  }> = {
    wealth_accelerator: {
      wealth: "Мощная активация денежного канала, легкий выход на крупные контракты и состоятельных клиентов.",
      love: "Отношения строятся на партнерстве, взаимном уважении и поддержке амбиций.",
      career: "Стремительный карьерный рост, публичность и расширение сферы влияния.",
      warning: "Остерегайтесь эмоционального выгорания и трудоголизма.",
      purpose: "Запуск бизнеса, инвестиции, масштабирование проектов и карьерный рывок."
    },
    love_magnet: {
      wealth: "Деньги приходят через творчество, красоту, подарки и гармоничные партнерства.",
      love: "Исключительно благоприятное поле для судьбоносных романтических встреч и укрепления брака.",
      career: "Успех в индустрии красоты, искусства, дизайна, медиа и дипломатии.",
      warning: "Не растворяйтесь в партнере без остатка, берегите личные границы.",
      purpose: "Свадебное путешествие, романтический отпуск, поиск второй половинки и вдохновения."
    },
    spiritual_sanctuary: {
      wealth: "Достаточный уровень комфорта, акцент смещается с гонки за деньгами на качество жизни.",
      love: "Глубокая душевная связь, исцеление старых травм и телепатия с близкими.",
      career: "Трансформация призвания, авторские книги, научные труды и целительство.",
      warning: "Склонность к лени и нежеланию возвращаться в рабочий ритм мегаполисов.",
      purpose: "Ретриты, медитация, исцеление нервной системы, духовная перезагрузка."
    },
    high_intensity: {
      wealth: "Высокие ставки: возможность сорвать крупный куш при высоком уровне стресса.",
      love: "Бурные страсти, драматические сюжеты и проверка чувств на прочность.",
      career: "Жесткая конкуренция, которая закаляет волю и выводит в топ мастеров своего дела.",
      warning: "Обязательно высыпайтесь и защищайтесь от агрессивного инфополя.",
      purpose: "Кризис-менеджмент, преодоление страхов, завоевание новых рынков."
    },
    calm_rest: {
      wealth: "Стабильный размеренный доход без резких колебаний и рисков.",
      love: "Теплый семейный уют, спокойствие, взаимовыручка и доверие.",
      career: "Спокойная планомерная работа без авралов и дедлайнов.",
      warning: "Возможен застой при слишком долгом пребывании без новых целей.",
      purpose: "Восстановление сил, семейный отдых, оздоровление и воспитание детей."
    }
  };

  const info = vibeDescriptions[finalVibe];

  return {
    cityName: cleanCity.charAt(0).toUpperCase() + cleanCity.slice(1),
    country,
    compatibilityScore: score,
    vibeType: finalVibe,
    wealthImpact: info.wealth,
    loveImpact: info.love,
    careerImpact: info.career,
    energyWarning: info.warning,
    bestPurposeForVisit: info.purpose
  };
}
